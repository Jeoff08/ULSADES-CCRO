/**
 * COLB REMARKS detection – re-exports AUSF implementation for backward compatibility.
 * For AUSF: use this file or import from './ausfColbRemarksDetection'.
 * For Court Decree: import from './courtDecreeColbRemarksDetection' and use useCourtDecreeColbRemarksDetection.
 */

import { createWorker } from 'tesseract.js'

const REMARKS_KEYWORDS = ['REMARKS', 'ANNOTATIONS', 'LCRO', 'OCRG']
const KEYWORDS_REGEX = new RegExp(REMARKS_KEYWORDS.join('|'), 'i')

function toX0Y0X1Y1(bbox) {
  if (!bbox) return null
  if (typeof bbox.x0 === 'number' && typeof bbox.x1 === 'number') return bbox
  if (typeof bbox.left === 'number' && typeof bbox.width === 'number') {
    return { x0: bbox.left, y0: bbox.top, x1: bbox.left + bbox.width, y1: (bbox.top || 0) + (bbox.height || 0) }
  }
  return null
}

/**
 * Recursively search for words/blocks containing REMARKS/ANNOTATIONS keywords.
 * Tesseract blocks structure: blocks[].paragraphs[].lines[].words[]
 * Each item may have: text, bbox: { x0, y0, x1, y1 } or { left, top, width, height }
 */
function findRemarksLabelInStructure(node, imgWidth, imgHeight, results = []) {
  if (!node) return results
  const text = (node.text || '').trim()
  if (text && KEYWORDS_REGEX.test(text)) {
    const rawBbox = node.bbox || node.bbox0
    const bbox = toX0Y0X1Y1(rawBbox)
    if (bbox) {
      results.push({ text, ...bbox })
    }
  }
  const children = node.blocks || node.paragraphs || node.lines || node.words
  if (Array.isArray(children)) {
    for (const child of children) {
      findRemarksLabelInStructure(child, imgWidth, imgHeight, results)
    }
  }
  return results
}

/** Form 102: keep overlay above the bottom green border (normalized). Overlay top + height must not exceed this. */
export const FORM_102_OVERLAY_MAX_BOTTOM = 0.96

/**
 * Infer the blank REMARKS/ANNOTATIONS box from the label's bbox.
 * The box is typically below the label, spanning most of the form width.
 * For Form 102, the overlay is clamped so it does not extend past the bottom green line.
 * @param {Object} labelBbox - { x0, y0, x1, y1 } in image pixels
 * @param {number} imgWidth - image width in pixels
 * @param {number} imgHeight - image height in pixels
 * @returns {{ left: number, top: number, width: number, height: number }} - normalized 0-1
 */
function inferRemarksBox(labelBbox, imgWidth, imgHeight) {
  // Label is usually near bottom-right; box is directly below
  const gapPx = Math.max(2, imgHeight * 0.01)
  const topPx = labelBbox.y1 + gapPx
  // Stop above bottom green line: do not use full image height (reserve ~4% for the line)
  const maxBottomPx = imgHeight * FORM_102_OVERLAY_MAX_BOTTOM
  const bottomPx = Math.min(imgHeight - Math.max(imgHeight * 0.02, 5), maxBottomPx)
  const leftPx = Math.max(imgWidth * 0.09, labelBbox.x0 - imgWidth * 0.02)
  const rightPx = imgWidth - Math.max(imgWidth * 0.09, 5)
  let heightPx = Math.max(bottomPx - topPx, imgHeight * 0.08)
  // Clamp so overlay top + height does not exceed max bottom (green line stays visible)
  const maxHeightPx = maxBottomPx - topPx
  if (maxHeightPx > 0) heightPx = Math.min(heightPx, maxHeightPx)
  const widthPx = rightPx - leftPx

  return {
    left: leftPx / imgWidth,
    top: topPx / imgHeight,
    width: widthPx / imgWidth,
    height: heightPx / imgHeight,
  }
}

/**
 * Extract bbox from Tesseract output. Structure varies: blocks or direct bbox.
 */
function extractBboxFromBlocks(data, imgWidth, imgHeight) {
  const blocks = data?.blocks
  if (!Array.isArray(blocks)) return null
  const results = findRemarksLabelInStructure({ blocks }, imgWidth, imgHeight, [])
  if (results.length === 0) return null
  // Use the result with lowest y1 (closest to bottom = likely the main REMARKS label)
  const best = results.reduce((a, b) => (a.y1 > b.y1 ? a : b))
  return inferRemarksBox(best, imgWidth, imgHeight)
}

/**
 * Fallback: parse TSV or text + words to find REMARKS. Tesseract can return words array.
 */
function extractFromWords(data, imgWidth, imgHeight) {
  const words = data?.words
  if (!Array.isArray(words)) return null
  for (const w of words) {
    const text = (w.text || '').trim()
    if (text && KEYWORDS_REGEX.test(text)) {
      const bbox = w.bbox
      if (bbox) {
        return inferRemarksBox(bbox, imgWidth, imgHeight)
      }
    }
  }
  return null
}

function getImageDimensions(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}

/**
 * Run OCR on the certificate image and detect the REMARKS/ANNOTATIONS box.
 * @param {string} imageDataUrl - data URL of the certificate image (PNG/JPG)
 * @returns {Promise<{ left: number, top: number, width: number, height: number } | null>}
 *   Normalized coordinates (0-1) or null if detection fails.
 */
export async function detectRemarksBox(imageDataUrl) {
  if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) return null

  const dimensions = await getImageDimensions(imageDataUrl)
  if (!dimensions?.width || !dimensions?.height) return null

  let worker
  try {
    worker = await createWorker('eng')
    const { data } = await worker.recognize(imageDataUrl, {}, {
      text: true,
      blocks: true,
    })

    const imgWidth = data?.imageWidth ?? dimensions.width
    const imgHeight = data?.imageHeight ?? dimensions.height

    let box = extractBboxFromBlocks(data, imgWidth, imgHeight)
    if (!box) box = extractFromWords(data, imgWidth, imgHeight)

    return box
  } catch (err) {
    console.warn('COLB remarks detection failed:', err)
    return null
  } finally {
    if (worker) await worker.terminate()
  }
}

/** Fallback overlay position (matches current fixed layout: bottom 1%, left 12%, width 88%, height 14%) */
export const FALLBACK_OVERLAY = {
  left: 0.12,
  top: 0.85,
  width: 0.88,
  height: 0.14,
}

/** Form 102 (Certificate of Live Birth) REMARKS/ANNOTATIONS area – blank below label, above bottom green line (OCR fallback); narrower width for remarks text */
export const FORM_102_REMARKS_OVERLAY = {
  left: 0.09,
  top: 0.85,
  width: 0.82,
  height: 0.11, /* top 85% + height 11% = 96%, leaving bottom 4% for green border */
}
