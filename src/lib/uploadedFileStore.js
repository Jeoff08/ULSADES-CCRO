const STORAGE_PREFIX = 'ulsades:uploaded:'
const TRASH_PREFIX = 'ulsades:uploaded-trash:'
const REMOVAL_LOG_KEY = 'ulsades:removal-log'

export function getUploadedFile(scope) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${scope}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (!parsed.dataUrl || !parsed.mimeType) return null
    return parsed
  } catch {
    return null
  }
}

export function setUploadedFile(scope, payload) {
  const safe = {
    scope,
    title: payload?.title || '',
    name: payload?.name || 'uploaded-file',
    mimeType: payload?.mimeType || 'application/octet-stream',
    dataUrl: payload?.dataUrl || '',
    uploadedAt: payload?.uploadedAt || new Date().toISOString(),
  }
  localStorage.setItem(`${STORAGE_PREFIX}${scope}`, JSON.stringify(safe))
  return safe
}

export function clearUploadedFile(scope) {
  localStorage.removeItem(`${STORAGE_PREFIX}${scope}`)
}

export function moveUploadedFileToTrash(scope, meta) {
  const existing = getUploadedFile(scope)
  if (!existing) return null
  const entry = {
    ...existing,
    removedAt: new Date().toISOString(),
    removedBy: meta?.name || '',
    removeReason: meta?.reason || '',
  }
  localStorage.setItem(`${TRASH_PREFIX}${scope}`, JSON.stringify(entry))
  clearUploadedFile(scope)
  appendRemovalLog({
    scope,
    title: existing.title || '',
    fileName: existing.name || '',
    removedAt: entry.removedAt,
    name: entry.removedBy,
    reason: entry.removeReason,
  })
  return entry
}

export function restoreUploadedFileFromTrash(scope) {
  try {
    const raw = localStorage.getItem(`${TRASH_PREFIX}${scope}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.dataUrl || !parsed?.mimeType) return null
    const restored = {
      scope,
      title: parsed.title || '',
      name: parsed.name || 'uploaded-file',
      mimeType: parsed.mimeType || 'application/octet-stream',
      dataUrl: parsed.dataUrl || '',
      uploadedAt: parsed.uploadedAt || new Date().toISOString(),
    }
    setUploadedFile(scope, restored)
    localStorage.removeItem(`${TRASH_PREFIX}${scope}`)
    return restored
  } catch {
    return null
  }
}

export function getRemovalLogs() {
  try {
    const raw = localStorage.getItem(REMOVAL_LOG_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function appendRemovalLog(entry) {
  try {
    const prev = getRemovalLogs()
    const next = [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        ...entry,
      },
      ...prev,
    ].slice(0, 250)
    localStorage.setItem(REMOVAL_LOG_KEY, JSON.stringify(next))
  } catch (_) {}
}

export function hasAnyUploadsForRecord(moduleKey, recordId) {
  try {
    const prefix = `${STORAGE_PREFIX}${moduleKey}:${recordId}:`
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i)
      if (k && k.startsWith(prefix)) return true
    }
    return false
  } catch {
    return false
  }
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.onload = () => resolve(String(reader.result || ''))
    reader.readAsDataURL(file)
  })
}

