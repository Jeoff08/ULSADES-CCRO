const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  savePdf: async (suggestedFileName) => ipcRenderer.invoke('pdf:save-current-window', suggestedFileName),
  savePdfFromBase64: async (base64, suggestedFileName) =>
    ipcRenderer.invoke('pdf:save-from-base64', { base64, suggestedFileName }),
  previewPdf: async (suggestedFileName) => ipcRenderer.invoke('pdf:preview-current-window', suggestedFileName),
  previewPdfData: async () => ipcRenderer.invoke('pdf:get-current-window-base64'),
  openPdfInBrowser: async (filePath) => ipcRenderer.invoke('pdf:open-in-browser', filePath),
  openPdfInChrome: async (filePath) => ipcRenderer.invoke('pdf:open-in-chrome', filePath),
  saveBackupJson: async (backupText, suggestedFileName) =>
    ipcRenderer.invoke('backup:save-json', { backupText, suggestedFileName }),
  openBackupJson: async () => ipcRenderer.invoke('backup:open-json'),
})
