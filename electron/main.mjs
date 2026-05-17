import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, join } from 'path'
import { mkdirSync, existsSync } from 'fs'
import { spawn } from 'child_process'
import { readFile, writeFile } from 'fs/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

const isDev = !app.isPackaged
const VITE_DEV_URL = 'http://localhost:5173'
const API_PORT = Number(process.env.PORT) || 3001

if (process.platform === 'win32') {
  app.setAppUserModelId('com.iligan.ulsades')
}

/** @type {import('http').Server | null} */
let httpServer = null
let openPdfBrowserPreference = null
let openPdfBrowserPreferenceLoaded = false

function sanitizeFileName(name) {
  return String(name || 'document')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
    .trim() || 'document'
}

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
    icon: join(rootDir, 'public', 'ulsades-icon.ico'),
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

function getPdfOpenPreferencePath() {
  return join(app.getPath('userData'), 'pdf-open-browser-preference.json')
}

async function loadPdfOpenPreference() {
  if (openPdfBrowserPreferenceLoaded) return openPdfBrowserPreference
  openPdfBrowserPreferenceLoaded = true
  try {
    const text = await readFile(getPdfOpenPreferencePath(), 'utf-8')
    const parsed = JSON.parse(text)
    if (parsed?.browser === 'chrome' || parsed?.browser === 'edge') {
      openPdfBrowserPreference = parsed.browser
    }
  } catch {
    openPdfBrowserPreference = null
  }
  return openPdfBrowserPreference
}

async function savePdfOpenPreference(browser) {
  openPdfBrowserPreference = browser
  try {
    await writeFile(
      getPdfOpenPreferencePath(),
      JSON.stringify({ browser }, null, 2),
      'utf-8'
    )
  } catch {
    /* best effort */
  }
}

function launchBrowserForPdf(browser, target, targetUrl) {
  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      const candidates = browser === 'edge'
        ? [
            process.env.EDGE_PATH,
            process.env['PROGRAMFILES'] ? join(process.env['PROGRAMFILES'], 'Microsoft', 'Edge', 'Application', 'msedge.exe') : '',
            process.env['PROGRAMFILES(X86)'] ? join(process.env['PROGRAMFILES(X86)'], 'Microsoft', 'Edge', 'Application', 'msedge.exe') : '',
            process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Microsoft', 'Edge', 'Application', 'msedge.exe') : '',
          ]
        : [
            process.env.CHROME_PATH,
            process.env['PROGRAMFILES'] ? join(process.env['PROGRAMFILES'], 'Google', 'Chrome', 'Application', 'chrome.exe') : '',
            process.env['PROGRAMFILES(X86)'] ? join(process.env['PROGRAMFILES(X86)'], 'Google', 'Chrome', 'Application', 'chrome.exe') : '',
            process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe') : '',
          ]
      const browserCmd = browser === 'edge' ? 'msedge' : 'chrome'
      const browserLabel = browser === 'edge' ? 'Microsoft Edge' : 'Google Chrome'
      const browserEnvPath = browser === 'edge' ? process.env.EDGE_PATH : process.env.CHROME_PATH
      const withEnv = [browserEnvPath, ...candidates].filter(Boolean)
      const browserExe = withEnv.find((p) => existsSync(p))
      if (browserExe) {
        const child = spawn(browserExe, [targetUrl], {
          detached: true,
          stdio: 'ignore',
        })
        child.on('error', async () => {
          const openErr = await shell.openPath(target)
          resolve(openErr ? { ok: false, reason: openErr } : { ok: true, filePath: target, fallback: true })
        })
        child.unref()
        resolve({ ok: true, filePath: target, openedWith: browserExe })
        return
      }

      const child = spawn('cmd', ['/c', 'start', '', browserCmd, targetUrl], {
        detached: true,
        stdio: 'ignore',
      })
      child.on('error', async () => {
        const openErr = await shell.openPath(target)
        resolve(openErr ? { ok: false, reason: openErr } : { ok: true, filePath: target, fallback: true })
      })
      child.unref()
      resolve({ ok: true, filePath: target, openedWith: browserLabel })
      return
    }

    if (process.platform === 'darwin') {
      const appName = browser === 'edge' ? 'Microsoft Edge' : 'Google Chrome'
      const child = spawn('open', ['-a', appName, target], {
        detached: true,
        stdio: 'ignore',
      })
      child.on('error', async () => {
        const openErr = await shell.openPath(target)
        resolve(openErr ? { ok: false, reason: openErr } : { ok: true, filePath: target, fallback: true })
      })
      child.unref()
      resolve({ ok: true, filePath: target, openedWith: appName })
      return
    }

    const cmd = browser === 'edge' ? 'microsoft-edge' : 'google-chrome'
    const child = spawn(cmd, [target], {
      detached: true,
      stdio: 'ignore',
    })
    child.on('error', async () => {
      const openErr = await shell.openPath(target)
      resolve(openErr ? { ok: false, reason: openErr } : { ok: true, filePath: target, fallback: true })
    })
    child.unref()
    resolve({ ok: true, filePath: target })
  })
}

async function openInBrowserChooser(win, filePath) {
  const target = String(filePath || '').trim()
  if (!target) return { ok: false, reason: 'Missing file path' }
  const targetUrl = pathToFileURL(target).href

  const saved = await loadPdfOpenPreference()
  if (saved === 'chrome' || saved === 'edge') {
    return launchBrowserForPdf(saved, target, targetUrl)
  }

  const response = await dialog.showMessageBox(win, {
    type: 'question',
    title: 'Open PDF',
    message: 'Where do you want to open this PDF?',
    detail: target,
    buttons: ['Google Chrome', 'Microsoft Edge', 'Cancel'],
    defaultId: 0,
    cancelId: 2,
    noLink: true,
    checkboxLabel: 'Always use this browser',
    checkboxChecked: false,
  })

  if (response.response === 2) return { ok: false, cancelled: true }
  const browser = response.response === 1 ? 'edge' : 'chrome'
  if (response.checkboxChecked) {
    await savePdfOpenPreference(browser)
  }
  return launchBrowserForPdf(browser, target, targetUrl)
}

function openInChrome(filePath) {
  // Backward-compatible alias: routes through browser chooser.
  const win = BrowserWindow.getFocusedWindow()
  return openInBrowserChooser(win, filePath)
}

function openInBrowser(filePath, event) {
  const win = BrowserWindow.fromWebContents(event.sender)
  return openInBrowserChooser(win, filePath)
}

function _legacyOpenInChrome(filePath) {
  return new Promise((resolve) => {
    const target = String(filePath || '').trim()
    const targetUrl = pathToFileURL(target).href
    if (!target) {
      resolve({ ok: false, reason: 'Missing file path' })
      return
    }

    if (process.platform === 'win32') {
      const candidates = [
        process.env.CHROME_PATH,
        process.env['PROGRAMFILES'] ? join(process.env['PROGRAMFILES'], 'Google', 'Chrome', 'Application', 'chrome.exe') : '',
        process.env['PROGRAMFILES(X86)'] ? join(process.env['PROGRAMFILES(X86)'], 'Google', 'Chrome', 'Application', 'chrome.exe') : '',
        process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe') : '',
      ].filter(Boolean)

      const chromeExe = candidates.find((p) => existsSync(p))
      if (chromeExe) {
        const child = spawn(chromeExe, [targetUrl], {
          detached: true,
          stdio: 'ignore',
        })
        child.on('error', async () => {
          const openErr = await shell.openPath(target)
          resolve(openErr ? { ok: false, reason: openErr } : { ok: true, filePath: target, fallback: true })
        })
        child.unref()
        resolve({ ok: true, filePath: target, openedWith: chromeExe })
        return
      }

      const child = spawn('cmd', ['/c', 'start', '', 'chrome', targetUrl], {
        detached: true,
        stdio: 'ignore',
      })
      child.on('error', async () => {
        const openErr = await shell.openPath(target)
        resolve(openErr ? { ok: false, reason: openErr } : { ok: true, filePath: target, fallback: true })
      })
      child.unref()
      resolve({ ok: true, filePath: target })
      return
    }

    if (process.platform === 'darwin') {
      const child = spawn('open', ['-a', 'Google Chrome', target], {
        detached: true,
        stdio: 'ignore',
      })
      child.on('error', async () => {
        const openErr = await shell.openPath(target)
        resolve(openErr ? { ok: false, reason: openErr } : { ok: true, filePath: target, fallback: true })
      })
      child.unref()
      resolve({ ok: true, filePath: target })
      return
    }

    const child = spawn('google-chrome', [target], {
      detached: true,
      stdio: 'ignore',
    })
    child.on('error', async () => {
      const openErr = await shell.openPath(target)
      resolve(openErr ? { ok: false, reason: openErr } : { ok: true, filePath: target, fallback: true })
    })
    child.unref()
    resolve({ ok: true, filePath: target })
  })
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

/** Save PDF bytes from renderer (e.g. jsPDF output) — same document as in-app preview, not printToPDF. */
ipcMain.handle('pdf:save-from-base64', async (event, payload) => {
  const base64 = typeof payload === 'string' ? payload : payload?.base64
  const suggestedFileName =
    typeof payload === 'object' && payload?.suggestedFileName != null
      ? String(payload.suggestedFileName)
      : 'document.pdf'

  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win || win.isDestroyed()) {
    return { ok: false, cancelled: true, reason: 'Window unavailable' }
  }

  if (!base64 || typeof base64 !== 'string') {
    return { ok: false, reason: 'Missing PDF data' }
  }

  const safeName = sanitizeFileName(suggestedFileName)
  const defaultPath = safeName.toLowerCase().endsWith('.pdf') ? safeName : `${safeName}.pdf`

  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Save as PDF',
    defaultPath,
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  })

  if (canceled || !filePath) return { ok: false, cancelled: true }

  let buffer
  try {
    buffer = Buffer.from(base64, 'base64')
  } catch {
    return { ok: false, reason: 'Invalid PDF data' }
  }

  const { writeFile } = await import('fs/promises')
  await writeFile(filePath, buffer)
  return { ok: true, filePath }
})

ipcMain.handle('pdf:preview-current-window', async (event, suggestedFileName = 'document-preview.pdf') => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win || win.isDestroyed()) {
    return { ok: false, reason: 'Window unavailable' }
  }

  const safeFileName = sanitizeFileName(suggestedFileName).toLowerCase().endsWith('.pdf')
    ? sanitizeFileName(suggestedFileName)
    : `${sanitizeFileName(suggestedFileName)}.pdf`
  const tempPath = join(app.getPath('temp'), `ulsades-preview-${Date.now()}-${safeFileName}`)

  const pdfData = await win.webContents.printToPDF({
    printBackground: true,
    preferCSSPageSize: true,
  })

  const { writeFile } = await import('fs/promises')
  await writeFile(tempPath, pdfData)
  const openErr = await shell.openPath(tempPath)
  if (openErr) {
    return { ok: false, reason: openErr, filePath: tempPath }
  }
  return { ok: true, filePath: tempPath }
})

ipcMain.handle('pdf:get-current-window-base64', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win || win.isDestroyed()) {
    return { ok: false, reason: 'Window unavailable' }
  }

  const pdfData = await win.webContents.printToPDF({
    printBackground: true,
    preferCSSPageSize: true,
  })

  return { ok: true, base64: pdfData.toString('base64') }
})

ipcMain.handle('pdf:open-in-chrome', async (event, filePath) => {
  return openInBrowser(filePath, event)
})

ipcMain.handle('pdf:open-in-browser', async (event, filePath) => {
  return openInBrowser(filePath, event)
})

ipcMain.handle('backup:save-json', async (event, payload) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win || win.isDestroyed()) {
    return { ok: false, cancelled: true, reason: 'Window unavailable' }
  }

  const backupText = typeof payload?.backupText === 'string' ? payload.backupText : ''
  const suggestedFileName = typeof payload?.suggestedFileName === 'string'
    ? payload.suggestedFileName
    : `ulsades-backup-${new Date().toISOString().slice(0, 10)}.json`

  if (!backupText.trim()) {
    return { ok: false, reason: 'Missing backup data' }
  }

  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Export ULSADES backup',
    defaultPath: sanitizeFileName(suggestedFileName),
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
  })

  if (canceled || !filePath) return { ok: false, cancelled: true }

  await writeFile(filePath, backupText, 'utf-8')
  return { ok: true, filePath }
})

ipcMain.handle('backup:open-json', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win || win.isDestroyed()) {
    return { ok: false, cancelled: true, reason: 'Window unavailable' }
  }

  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: 'Import ULSADES backup',
    properties: ['openFile'],
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
  })

  if (canceled || !filePaths?.[0]) return { ok: false, cancelled: true }

  try {
    const text = await readFile(filePaths[0], 'utf-8')
    return { ok: true, text, filePath: filePaths[0] }
  } catch (err) {
    return { ok: false, reason: err?.message || 'Failed to read backup file' }
  }
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

  Menu.setApplicationMenu(null)
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
