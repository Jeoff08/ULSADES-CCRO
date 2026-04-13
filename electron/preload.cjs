const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  savePdf: async (suggestedFileName) => ipcRenderer.invoke('pdf:save-current-window', suggestedFileName),
  savePdfFromBase64: async (base64, suggestedFileName) =>
    ipcRenderer.invoke('pdf:save-from-base64', { base64, suggestedFileName }),
  previewPdf: async (suggestedFileName) => ipcRenderer.invoke('pdf:preview-current-window', suggestedFileName),
})
