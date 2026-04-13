function sanitizeFileName(name) {
  return String(name || 'document')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
    .trim() || 'document'
}

export async function saveCurrentViewAsPdf(suggestedBaseName = 'document') {
  const fileName = `${sanitizeFileName(suggestedBaseName)}.pdf`
  const bridge = window?.electronAPI
  if (!bridge || typeof bridge.savePdf !== 'function') {
    throw new Error('PDF save bridge is unavailable. Run the app in Electron.')
  }
  const result = await bridge.savePdf(fileName)
  if (!result) return { ok: false, cancelled: true, reason: 'Unknown response from main process' }
  return result
}

export async function previewCurrentViewAsPdf(suggestedBaseName = 'document-preview') {
  const fileName = `${sanitizeFileName(suggestedBaseName)}.pdf`
  const bridge = window?.electronAPI
  if (!bridge || typeof bridge.previewPdf !== 'function') {
    throw new Error('PDF preview bridge is unavailable. Run the app in Electron.')
  }
  const result = await bridge.previewPdf(fileName)
  if (!result) return { ok: false, reason: 'Unknown response from main process' }
  return result
}

/**
 * Save a PDF already built in the renderer (e.g. jsPDF output as base64).
 * Uses the same bytes as an in-app blob preview; not window printToPDF.
 */
export async function saveGeneratedPdfBase64(base64, suggestedBaseName = 'document') {
  const fileName = `${sanitizeFileName(suggestedBaseName)}.pdf`
  const bridge = window?.electronAPI

  if (bridge?.savePdfFromBase64 && typeof bridge.savePdfFromBase64 === 'function') {
    const result = await bridge.savePdfFromBase64(base64, fileName)
    if (!result) return { ok: false, reason: 'Unknown response from main process' }
    return result
  }

  try {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
    return { ok: true, filePath: fileName }
  } catch {
    throw new Error('PDF save is unavailable. Run the app in Electron or use a modern browser.')
  }
}
