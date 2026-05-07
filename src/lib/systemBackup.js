const BACKUP_VERSION = 1
const UPLOAD_KEY_PREFIX = 'ulsades:uploaded:'
const UPLOAD_TRASH_KEY_PREFIX = 'ulsades:uploaded-trash:'

function isPlainObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function safeJsonParse(value) {
  if (typeof value !== 'string') return { ok: false, value: null }
  try {
    return { ok: true, value: JSON.parse(value) }
  } catch {
    return { ok: false, value: null }
  }
}

function isMissing(value) {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (isPlainObject(value)) return Object.keys(value).length === 0
  return false
}

function mergeMissingOnly(target, source) {
  if (Array.isArray(target) && Array.isArray(source)) {
    const targetAllObjects = target.every((item) => isPlainObject(item))
    const sourceAllObjects = source.every((item) => isPlainObject(item))
    if (targetAllObjects && sourceAllObjects) {
      const targetHasIds = target.every((item) => !isMissing(item.id))
      const sourceHasIds = source.every((item) => !isMissing(item.id))
      if (targetHasIds && sourceHasIds) {
        const byId = new Map(target.map((item) => [String(item.id), { ...item }]))
        source.forEach((incomingItem) => {
          const id = String(incomingItem.id)
          if (!byId.has(id)) {
            byId.set(id, { ...incomingItem })
            return
          }
          const existingItem = byId.get(id)
          byId.set(id, mergeMissingOnly(existingItem, incomingItem))
        })
        return Array.from(byId.values())
      }
    }

    const signatures = new Set(target.map((item) => JSON.stringify(item)))
    const merged = [...target]
    source.forEach((item) => {
      const signature = JSON.stringify(item)
      if (!signatures.has(signature)) {
        signatures.add(signature)
        merged.push(item)
      }
    })
    return merged
  }

  if (isPlainObject(target) && isPlainObject(source)) {
    const out = { ...target }
    Object.keys(source).forEach((key) => {
      if (!(key in out) || isMissing(out[key])) {
        out[key] = source[key]
        return
      }
      out[key] = mergeMissingOnly(out[key], source[key])
    })
    return out
  }

  if (isMissing(target) && !isMissing(source)) return source
  return target
}

function serializeLocalStorage() {
  const records = {}
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    if (!key) continue
    const value = localStorage.getItem(key)
    if (value == null) continue
    records[key] = value
  }
  return records
}

export function buildSystemBackupPayload() {
  return {
    app: 'ULSADES',
    backupVersion: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    localStorage: serializeLocalStorage(),
  }
}

function parseIsoTime(value) {
  const time = Date.parse(String(value || ''))
  return Number.isFinite(time) ? time : 0
}

function mergeUploadedFileRecord(existingRaw, incomingRaw) {
  const existingParsed = safeJsonParse(existingRaw)
  const incomingParsed = safeJsonParse(incomingRaw)
  if (!existingParsed.ok || !incomingParsed.ok) return existingRaw

  const existing = existingParsed.value
  const incoming = incomingParsed.value
  if (!isPlainObject(existing) || !isPlainObject(incoming)) return existingRaw

  const existingHasFile = typeof existing.dataUrl === 'string' && existing.dataUrl.length > 0
  const incomingHasFile = typeof incoming.dataUrl === 'string' && incoming.dataUrl.length > 0
  if (!existingHasFile && incomingHasFile) return incomingRaw
  if (!incomingHasFile) return existingRaw

  // Keep latest file revision by upload/removed timestamp.
  const existingTime = Math.max(parseIsoTime(existing.uploadedAt), parseIsoTime(existing.removedAt))
  const incomingTime = Math.max(parseIsoTime(incoming.uploadedAt), parseIsoTime(incoming.removedAt))
  if (incomingTime > existingTime) return incomingRaw

  // If timestamps are missing but payload differs, retain existing for safety.
  return existingRaw
}

function mergeLocalStorageRecord(key, existingRaw, incomingRaw) {
  if (existingRaw == null || existingRaw === '') return incomingRaw

  if (
    String(key || '').startsWith(UPLOAD_KEY_PREFIX) ||
    String(key || '').startsWith(UPLOAD_TRASH_KEY_PREFIX)
  ) {
    return mergeUploadedFileRecord(existingRaw, incomingRaw)
  }

  const existingParsed = safeJsonParse(existingRaw)
  const incomingParsed = safeJsonParse(incomingRaw)
  if (!existingParsed.ok || !incomingParsed.ok) {
    return existingRaw
  }

  const merged = mergeMissingOnly(existingParsed.value, incomingParsed.value)
  try {
    return JSON.stringify(merged)
  } catch {
    return existingRaw
  }
}

export function importSystemBackupPayload(payload) {
  if (!payload || !isPlainObject(payload)) {
    throw new Error('Invalid backup file format.')
  }

  // Accept canonical export shape, plus tolerant fallbacks for compatibility.
  const backupRecords = (() => {
    if (isPlainObject(payload.localStorage)) return payload.localStorage
    if (isPlainObject(payload.records)) return payload.records
    // Fallback: treat top-level object as a key/value storage dump if values are strings.
    const allStringValues = Object.values(payload).every((v) => typeof v === 'string')
    if (allStringValues) return payload
    return null
  })()
  if (!isPlainObject(backupRecords)) {
    throw new Error('Backup file has no importable localStorage data.')
  }

  let insertedKeys = 0
  let updatedKeys = 0
  let skippedKeys = 0

  Object.entries(backupRecords).forEach(([key, incomingRaw]) => {
    if (typeof incomingRaw !== 'string') {
      skippedKeys += 1
      return
    }
    const existingRaw = localStorage.getItem(key)
    if (existingRaw == null) {
      localStorage.setItem(key, incomingRaw)
      insertedKeys += 1
      return
    }

    const mergedRaw = mergeLocalStorageRecord(key, existingRaw, incomingRaw)
    if (mergedRaw !== existingRaw) {
      localStorage.setItem(key, mergedRaw)
      updatedKeys += 1
      return
    }
    skippedKeys += 1
  })

  return { insertedKeys, updatedKeys, skippedKeys, totalKeys: Object.keys(backupRecords).length }
}

