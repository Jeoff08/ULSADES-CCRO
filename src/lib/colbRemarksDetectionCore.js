/**
 * Shared COLB REMARKS/ANNOTATIONS OCR detection (Tesseract.js).
 * Used by AUSF and Court Decree modules; form-specific options passed by callers.
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

/**
 * Infer the blank REMARKS/ANNOTATIONS box from the label's bbox.
 * @param {Object} labelBbox - { x0, y0, x1, y1 } in image pixels
 * @param {number} imgWidth - image width in pixels
 * @param {number} imgHeight - image height in pixels
 * @param {number} overlayMaxBottom - max normalized bottom (0-1), e.g. 0.96 to stay above green line
 */
export function inferRemarksBox(labelBbox, imgWidth, imgHeight, overlayMaxBottom = 0.96) {
  const gapPx = Math.max(2, imgHeight * 0.01)
  const topPx = labelBbox.y1 + gapPx
  const maxBottomPx = imgHeight * overlayMaxBottom
  const bottomPx = Math.min(imgHeight - Math.max(imgHeight * 0.02, 5), maxBottomPx)
  const leftPx = Math.max(imgWidth * 0.09, labelBbox.x0 - imgWidth * 0.02)
  const rightPx = imgWidth - Math.max(imgWidth * 0.09, 5)
  let heightPx = Math.max(bottomPx - topPx, imgHeight * 0.08)
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

function extractBboxFromBlocks(data, imgWidth, imgHeight, overlayMaxBottom) {
  const blocks = data?.blocks
  if (!Array.isArray(blocks)) return null
  const results = findRemarksLabelInStructure({ blocks }, imgWidth, imgHeight, [])
  if (results.length === 0) return null
  const best = results.reduce((a, b) => (a.y1 > b.y1 ? a : b))
  return inferRemarksBox(best, imgWidth, imgHeight, overlayMaxBottom)
}

function extractFromWords(data, imgWidth, imgHeight, overlayMaxBottom) {
  const words = data?.words
  if (!Array.isArray(words)) return null
  for (const w of words) {
    const text = (w.text || '').trim()
    if (text && KEYWORDS_REGEX.test(text)) {
      const bbox = w.bbox
      if (bbox) {
        return inferRemarksBox(bbox, imgWidth, imgHeight, overlayMaxBottom)
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
 * Run OCR and detect REMARKS/ANNOTATIONS box.
 * @param {string} imageDataUrl - data URL of the certificate image
 * @param {{ overlayMaxBottom?: number }} options - overlayMaxBottom in 0-1 (default 0.96)
 * @returns {Promise<{ left, top, width, height } | null>} normalized coords or null
 */
export async function detectRemarksBoxCore(imageDataUrl, options = {}) {
  if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) return null

  const dimensions = await getImageDimensions(imageDataUrl)
  if (!dimensions?.width || !dimensions?.height) return null

  const overlayMaxBottom = options.overlayMaxBottom ?? 0.96

  let worker
  try {
    worker = await createWorker('eng')
    const { data } = await worker.recognize(imageDataUrl, {}, {
      text: true,
      blocks: true,
    })

    const imgWidth = data?.imageWidth ?? dimensions.width
    const imgHeight = data?.imageHeight ?? dimensions.height

    let box = extractBboxFromBlocks(data, imgWidth, imgHeight, overlayMaxBottom)
    if (!box) box = extractFromWords(data, imgWidth, imgHeight, overlayMaxBottom)

    return box
  } catch (err) {
    console.warn('COLB remarks detection failed:', err)
    return null
  } finally {
    if (worker) await worker.terminate()
  }
}
