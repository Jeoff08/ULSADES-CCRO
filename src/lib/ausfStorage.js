const KEY = 'ulsades_ausf_draft'
const KEY_SAVED = 'ulsades_ausf_saved'

export function saveAUSFDraft(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

export function getAUSFDraft() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearAUSFDraft() {
  try {
    localStorage.removeItem(KEY)
  } catch {}
}

export function getSavedAUSFList() {
  try {
    const raw = localStorage.getItem(KEY_SAVED)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function addSavedAUSF(data) {
  try {
    const list = getSavedAUSFList()
    const id = `ausf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const label = data.applicantName || data.childFirst || data.formType || 'AUSF'
    const formTypeLabel = {
      'ausf-only': 'AUSF only',
      'ausf-0-6': 'AUSF 0-6',
      'ausf-07-17': 'AUSF 07-17',
      'reg-ausf': 'Registration of AUSF',
      'reg-ack': 'Registration of Acknowledgement',
      'child-ack': 'Child Acknowledge',
      'child-ack-lcr': 'LCR Form 1A (Birth-Available)',
      'child-ack-annotation': 'Annotation',
      'child-not-ack': 'Child Not Acknowledged',
      'child-not-ack-lcr': 'LCR Form A1 (Child Not Acknowledged)',
      'child-not-ack-annotation': 'Annotation (Child Not Acknowledged)',
      'child-not-ack-transmittal': 'Transmittal (Child Not Acknowledged)',
      'out-of-town': 'Out-of-Town Transmittal',
    }[data.formType] || data.formType
    list.unshift({
      id,
      savedAt: new Date().toISOString(),
      label: String(label).trim() || formTypeLabel,
      formType: data.formType,
      data: { ...data },
    })
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
    return id
  } catch {
    return null
  }
}

export function deleteSavedAUSF(id) {
  try {
    const list = getSavedAUSFList().filter((item) => item.id !== id)
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
  } catch {}
}

export function restoreSavedAUSF(item) {
  if (!item || !item.id || !item.data) return false
  try {
    const list = getSavedAUSFList()
    list.unshift({
      id: item.id,
      savedAt: item.savedAt || new Date().toISOString(),
      label: item.label || 'AUSF',
      formType: item.formType,
      data: { ...item.data },
    })
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
    return true
  } catch {
    return false
  }
}

export function loadSavedAUSFToDraft(id) {
  const list = getSavedAUSFList()
  const item = list.find((x) => x.id === id)
  if (!item || !item.data) return false
  saveAUSFDraft(item.data)
  return true
}

export function updateSavedAUSF(id, data) {
  try {
    const list = getSavedAUSFList()
    const idx = list.findIndex((x) => x.id === id)
    if (idx === -1) return false
    const label = data.applicantName || data.childFirst || data.formType || 'AUSF'
    const formTypeLabel = {
      'ausf-only': 'AUSF only',
      'ausf-0-6': 'AUSF 0-6',
      'ausf-07-17': 'AUSF 07-17',
      'reg-ausf': 'Registration of AUSF',
      'reg-ack': 'Registration of Acknowledgement',
      'child-ack': 'Child Acknowledge',
      'child-ack-lcr': 'LCR Form 1A (Birth-Available)',
      'child-ack-annotation': 'Annotation',
      'child-not-ack': 'Child Not Acknowledged',
      'child-not-ack-lcr': 'LCR Form A1 (Child Not Acknowledged)',
      'child-not-ack-annotation': 'Annotation (Child Not Acknowledged)',
      'child-not-ack-transmittal': 'Transmittal (Child Not Acknowledged)',
      'out-of-town': 'Out-of-Town Transmittal',
    }[data.formType] || data.formType
    list[idx] = {
      id,
      savedAt: new Date().toISOString(),
      label: String(label).trim() || formTypeLabel,
      formType: data.formType,
      data: { ...data },
    }
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
    return true
  } catch {
    return false
  }
}
