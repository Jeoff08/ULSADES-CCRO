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
