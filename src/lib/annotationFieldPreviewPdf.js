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
  const centerX = boxLeftIn + boxWIn / 2

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

  lines.forEach((line) => {
    doc.text(line, centerX, y, { align: 'center' })
    y += lineHeightIn
  })

  const dataUri = doc.output('datauristring')
  return dataUri.includes(',') ? dataUri.split(',')[1] : ''
}
