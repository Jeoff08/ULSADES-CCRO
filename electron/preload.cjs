const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  savePdf: async (suggestedFileName) => ipcRenderer.invoke('pdf:save-current-window', suggestedFileName),
})
