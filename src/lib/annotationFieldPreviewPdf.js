import { jsPDF } from 'jspdf'
import { FIELD_POSITIONS, PDF_LAYOUT } from './colbCertificateLayout'

/**
 * Legal-size PDF with annotation text in `FIELD_POSITIONS.ausf_annotation_field`.
 * @param {string} plainText
 * @returns {string} base64 (no data: prefix)
 */
export function buildAnnotationFieldPreviewPdfBase64(plainText) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'legal' })
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)

  const { width: docW, height: docH, pageWidthInches, pageHeightInches } = PDF_LAYOUT.document
  const box = FIELD_POSITIONS.ausf_annotation_field
  const padX = 0.06
  const boxLeftIn = (box.x / docW) * pageWidthInches
  const boxTopIn = (box.y / docH) * pageHeightInches
  const boxWIn = (box.width / docW) * pageWidthInches
  const boxHIn = (box.height / docH) * pageHeightInches
  const innerW = Math.max(0.3, boxWIn - padX * 2)
  const textLeftIn = boxLeftIn + padX

  const str = String(plainText ?? '').trim() || '—'
  let fontPt = PDF_LAYOUT.pdfDefaultFontSize
  const minPt = PDF_LAYOUT.pdfMinShrinkSize
  let lines
  for (;;) {
    doc.setFontSize(fontPt)
    lines = doc.splitTextToSize(str, innerW)
    const lh = (fontPt * PDF_LAYOUT.lineHeightRatio) / 72
    if (lines.length * lh <= boxHIn - 0.08 || fontPt <= minPt) break
    fontPt -= PDF_LAYOUT.pdfShrinkStep
  }

  const lineHeightIn = (fontPt * PDF_LAYOUT.lineHeightRatio) / 72
  const blockH = lines.length * lineHeightIn
  let y = boxTopIn + Math.max(lineHeightIn * 0.35, (boxHIn - blockH) / 2 + lineHeightIn * 0.8)

  doc.text(lines, textLeftIn, y, { align: 'justify', maxWidth: innerW })

  const dataUri = doc.output('datauristring')
  return dataUri.includes(',') ? dataUri.split(',')[1] : ''
}

/**
 * Legal-size PDF for Annotation Ack Field:
 * vertical text in the right-side remarks strip.
 * @param {string} plainText
 * @returns {string} base64 (no data: prefix)
 */
export function buildAnnotationAckFieldPreviewPdfBase64(plainText) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'legal' })
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(255, 255, 255)

  const { width: docW, height: docH, pageWidthInches, pageHeightInches } = PDF_LAYOUT.document

  // Keep coordinates aligned with the dedicated Annotation Ack Field behavior.
  const ackField = { x: 2244, y: 200, width: 204, height: 2940 }
  const boxWIn = (ackField.width / docW) * pageWidthInches
  const boxHIn = (ackField.height / docH) * pageHeightInches
  const boxLeftIn = (ackField.x / docW) * pageWidthInches
  const boxTopIn = (ackField.y / docH) * pageHeightInches

  const centerX = boxLeftIn + boxWIn / 2 - 0.1
  const centerY = boxTopIn + boxHIn / 2 - 5.4

  const str = String(plainText ?? '').trim() || '—'
  let fontPt = PDF_LAYOUT.pdfDefaultFontSize
  const minPt = PDF_LAYOUT.pdfMinShrinkSize
  const innerW = Math.max(0.3, boxHIn - 0.4)
  let lines
  let lineHeightIn

  for (;;) {
    doc.setFontSize(fontPt)
    lines = doc.splitTextToSize(str, innerW)
    lineHeightIn = (fontPt * PDF_LAYOUT.lineHeightRatio) / 72
    if (lines.length * lineHeightIn <= boxWIn - 0.1 || fontPt <= minPt) break
    fontPt -= PDF_LAYOUT.pdfShrinkStep
  }

  const totalBlockWidth = lines.length * lineHeightIn
  const startX = centerX - totalBlockWidth / 2 + lineHeightIn / 2

  const fieldInset = 0.02
  const bgX = boxLeftIn + fieldInset
  const bgY = 2.9 + fieldInset
  const bgW = Math.max(0.1, boxWIn - fieldInset * 2)
  const bgH = Math.max(0.1, 8.8 - fieldInset * 2)
  doc.setFillColor(0, 0, 0)
  doc.rect(bgX, bgY, bgW, bgH, 'F')

  lines.forEach((line, i) => {
    const textW = doc.getTextWidth(line)
    const x = startX + i * lineHeightIn
    doc.text(line, x, centerY + textW / 2, { angle: 270 })
  })

  const dataUri = doc.output('datauristring')
  return dataUri.includes(',') ? dataUri.split(',')[1] : ''
}
