import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

const isDev = !app.isPackaged
const VITE_DEV_URL = 'http://localhost:5173'
const API_PORT = Number(process.env.PORT) || 3001

/** @type {import('http').Server | null} */
let httpServer = null

async function startBackend() {
  const { startServer } = await import('../server/http-server.js')
  const staticDir = isDev ? null : join(rootDir, 'dist')
  httpServer = await startServer(API_PORT, { staticDir })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.cjs'),
    },
  })

  if (isDev) {
    win.loadURL(VITE_DEV_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadURL(`http://127.0.0.1:${API_PORT}/`)
  }

  return win
}

ipcMain.handle('pdf:save-current-window', async (event, suggestedFileName = 'document.pdf') => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win || win.isDestroyed()) {
    return { ok: false, cancelled: true, reason: 'Window unavailable' }
  }

  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Save as PDF',
    defaultPath: suggestedFileName,
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  })

  if (canceled || !filePath) return { ok: false, cancelled: true }

  const pdfData = await win.webContents.printToPDF({
    printBackground: true,
    preferCSSPageSize: true,
  })

  const { writeFile } = await import('fs/promises')
  await writeFile(filePath, pdfData)
  return { ok: true, filePath }
})

app.whenReady().then(async () => {
  const userData = app.getPath('userData')
  const devDbPath = join(rootDir, 'server', 'db', 'ulsades.db')
  const runtimeDbPath = isDev ? devDbPath : join(userData, 'ulsades.db')
  process.env.ULSADES_DB_PATH = runtimeDbPath
  process.env.ULSADES_USER_DATA = userData
  try {
    mkdirSync(dirname(runtimeDbPath), { recursive: true })
    mkdirSync(userData, { recursive: true })
  } catch {
    /* exists */
  }

  try {
    await startBackend()
  } catch (err) {
    console.error('Failed to start backend:', err)
    app.quit()
    return
  }

  createWindow()
})

app.on('window-all-closed', () => {
  if (httpServer) {
    httpServer.close()
    httpServer = null
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  if (httpServer) {
    httpServer.close()
    httpServer = null
  }
})
