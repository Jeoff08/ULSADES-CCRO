/**
 * Export COLB certificate + annotation overlay as a single PDF
 * Uses html2canvas to capture the composite, then jspdf to create the PDF.
 * @param {HTMLElement} containerEl - The colb-print-area container (certificate + overlay)
 * @param {string} [filename] - Output filename (default: COLB-annotation-{timestamp}.pdf)
 */
export async function exportColbAsPdf(containerEl, filename) {
  if (!containerEl) return
  const html2canvas = (await import('html2canvas')).default
  const { jsPDF } = await import('jspdf')

  const canvas = await html2canvas(containerEl, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
  })

  const imgData = canvas.toDataURL('image/png')
  const imgW = canvas.width
  const imgH = canvas.height
  const pxToMm = 0.264583
  const pdf = new jsPDF({
    orientation: imgW > imgH ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [imgW * pxToMm, imgH * pxToMm],
  })

  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH)

  const name = filename || `COLB-annotation-${Date.now()}.pdf`
  pdf.save(name)
}
