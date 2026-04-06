const KEY_DRAFT = 'legalInstrumentSupplementalDraft'
const KEY_SAVED = 'legalInstrumentSupplementalSaved'
const KEY_ACTIVE = 'legalInstrumentSupplementalActiveId'

export function getSupplementalDraft(defaultValue) {
  try {
    const raw = localStorage.getItem(KEY_DRAFT)
    if (!raw) return defaultValue
    return { ...defaultValue, ...JSON.parse(raw) }
  } catch {
    return defaultValue
  }
}

export function saveSupplementalDraft(data) {
  try {
    localStorage.setItem(KEY_DRAFT, JSON.stringify(data))
  } catch {}
}

export function clearSupplementalDraft() {
  try {
    localStorage.removeItem(KEY_DRAFT)
  } catch {}
}

export function getSavedSupplementalList() {
  try {
    const raw = localStorage.getItem(KEY_SAVED)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function addSavedSupplemental(data) {
  try {
    const list = getSavedSupplementalList()
    const id = `supp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    list.unshift({
      id,
      savedAt: new Date().toISOString(),
      label: data.affiantName || data.regNo || 'Supplemental Report',
      data: { ...data },
    })
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
    localStorage.setItem(KEY_ACTIVE, id)
    return id
  } catch {
    return null
  }
}

export function deleteSavedSupplemental(id) {
  try {
    const list = getSavedSupplementalList().filter((x) => x.id !== id)
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
  } catch {}
}

export function loadSavedSupplementalToDraft(id) {
  const item = getSavedSupplementalList().find((x) => x.id === id)
  if (!item?.data) return false
  saveSupplementalDraft(item.data)
  try {
    localStorage.setItem(KEY_ACTIVE, id)
  } catch {}
  return true
}

export function getActiveSavedSupplemental() {
  try {
    const id = localStorage.getItem(KEY_ACTIVE)
    if (!id) return null
    return getSavedSupplementalList().find((x) => x.id === id) || null
  } catch {
    return null
  }
}

