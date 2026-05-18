/** Lets savePdf.js await the React PDF open chooser modal. */
let chooserHandler = null

export function setPdfOpenChooserHandler(handler) {
  chooserHandler = typeof handler === 'function' ? handler : null
}

export function runPdfOpenChooser(filePath) {
  if (!chooserHandler) {
    return Promise.resolve({ cancelled: true, reason: 'Chooser UI not mounted' })
  }
  return chooserHandler(filePath)
}

export function displayPdfFileName(filePath) {
  const normalized = String(filePath || '').replace(/\\/g, '/')
  const name = normalized.split('/').pop()
  return name || 'document.pdf'
}
