import { migrateRecordUploads } from '../../../lib/uploadedFileStore'

const KEY_DRAFT = 'legalInstrumentMc2010Draft'
const KEY_SAVED = 'legalInstrumentMc2010Saved'
const KEY_ACTIVE = 'legalInstrumentMc2010ActiveId'

export function getMc2010Draft(defaultValue) {
  try {
    const raw = localStorage.getItem(KEY_DRAFT)
    if (!raw) return defaultValue
    return { ...defaultValue, ...JSON.parse(raw) }
  } catch {
    return defaultValue
  }
}

export function saveMc2010Draft(data) {
  try {
    localStorage.setItem(KEY_DRAFT, JSON.stringify(data))
  } catch {}
}

export function clearMc2010Draft() {
  try {
    localStorage.removeItem(KEY_DRAFT)
  } catch {}
}

export function getSavedMc2010List() {
  try {
    const raw = localStorage.getItem(KEY_SAVED)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function addSavedMc2010(data) {
  try {
    const list = getSavedMc2010List()
    const id = `mc2010_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    list.unshift({
      id,
      savedAt: new Date().toISOString(),
      label: data.transmittalColbName || data.transmittalRegistryNo || 'MC2010-04',
      data: { ...data },
    })
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
    localStorage.setItem(KEY_ACTIVE, id)
    migrateRecordUploads('mc2010', 'draft', id)
    return id
  } catch {
    return null
  }
}

export function getActiveMc2010Id() {
  try {
    return localStorage.getItem(KEY_ACTIVE) || null
  } catch {
    return null
  }
}

export function clearMc2010Active() {
  try {
    localStorage.removeItem(KEY_ACTIVE)
  } catch {}
}

export function deleteSavedMc2010(id) {
  try {
    const list = getSavedMc2010List().filter((x) => x.id !== id)
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
    const active = localStorage.getItem(KEY_ACTIVE)
    if (active === id) localStorage.removeItem(KEY_ACTIVE)
  } catch {}
}

export function saveOrUpdateMc2010(data) {
  try {
    const activeId = localStorage.getItem(KEY_ACTIVE)
    const list = getSavedMc2010List()
    const idx = activeId ? list.findIndex((x) => x.id === activeId) : -1
    if (idx >= 0) {
      const next = [...list]
      next[idx] = {
        ...list[idx],
        savedAt: new Date().toISOString(),
        label: data.transmittalColbName || data.transmittalRegistryNo || 'MC2010-04',
        data: { ...data },
      }
      localStorage.setItem(KEY_SAVED, JSON.stringify(next))
      return activeId
    }
    return addSavedMc2010(data)
  } catch {
    return null
  }
}

export function loadSavedMc2010ToDraft(id) {
  const item = getSavedMc2010List().find((x) => x.id === id)
  if (!item?.data) return false
  saveMc2010Draft(item.data)
  try {
    localStorage.setItem(KEY_ACTIVE, id)
  } catch {}
  return true
}

export function getActiveSavedMc2010() {
  try {
    const id = localStorage.getItem(KEY_ACTIVE)
    if (!id) return null
    return getSavedMc2010List().find((x) => x.id === id) || null
  } catch {
    return null
  }
}
