import { migrateRecordUploads } from '../../../lib/uploadedFileStore'

const KEY_DRAFT = 'legalInstrumentWronglyRegisterDraft'
const KEY_SAVED = 'legalInstrumentWronglyRegisterSaved'
const KEY_ACTIVE = 'legalInstrumentWronglyRegisterActiveId'

export function getWronglyRegisterDraft(defaultValue) {
  try {
    const raw = localStorage.getItem(KEY_DRAFT)
    if (!raw) return defaultValue
    return { ...defaultValue, ...JSON.parse(raw) }
  } catch {
    return defaultValue
  }
}

export function saveWronglyRegisterDraft(data) {
  try {
    localStorage.setItem(KEY_DRAFT, JSON.stringify(data))
  } catch {}
}

export function clearWronglyRegisterDraft() {
  try {
    localStorage.removeItem(KEY_DRAFT)
  } catch {}
}

export function getSavedWronglyRegisterList() {
  try {
    const raw = localStorage.getItem(KEY_SAVED)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function getActiveWronglyRegisterId() {
  try {
    return localStorage.getItem(KEY_ACTIVE) || null
  } catch {
    return null
  }
}

export function clearWronglyRegisterActive() {
  try {
    localStorage.removeItem(KEY_ACTIVE)
  } catch {}
}

function buildLabel(data) {
  const name = String(data?.transmittalColbName || '').trim()
  const reg = String(data?.transmittalRegistryNo || '').trim()
  if (name && reg) return `${name} (${reg})`
  return name || reg || 'Wrongly Register'
}

export function addSavedWronglyRegister(data) {
  try {
    const list = getSavedWronglyRegisterList()
    const id = `wrong_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    list.unshift({
      id,
      savedAt: new Date().toISOString(),
      label: buildLabel(data),
      data: { ...data },
    })
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
    localStorage.setItem(KEY_ACTIVE, id)
    migrateRecordUploads('wrongly-register', 'draft', id)
    return id
  } catch {
    return null
  }
}

/** If an entry is active (loaded for edit/print), update it; otherwise append a new saved row. */
export function saveOrUpdateWronglyRegister(data) {
  try {
    const activeId = localStorage.getItem(KEY_ACTIVE)
    const list = getSavedWronglyRegisterList()
    const idx = activeId ? list.findIndex((x) => x.id === activeId) : -1
    if (idx >= 0) {
      const next = [...list]
      next[idx] = {
        ...list[idx],
        savedAt: new Date().toISOString(),
        label: buildLabel(data),
        data: { ...data },
      }
      localStorage.setItem(KEY_SAVED, JSON.stringify(next))
      return activeId
    }
    return addSavedWronglyRegister(data)
  } catch {
    return null
  }
}

export function loadSavedWronglyRegisterToDraft(id) {
  const item = getSavedWronglyRegisterList().find((x) => x.id === id)
  if (!item?.data) return false
  saveWronglyRegisterDraft(item.data)
  try {
    localStorage.setItem(KEY_ACTIVE, id)
  } catch {}
  return true
}

export function deleteSavedWronglyRegister(id) {
  try {
    const list = getSavedWronglyRegisterList().filter((x) => x.id !== id)
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
    const active = localStorage.getItem(KEY_ACTIVE)
    if (active === id) localStorage.removeItem(KEY_ACTIVE)
  } catch {}
}

