const KEY_DRAFT = 'courtDecreeDraft'
const KEY_SAVED = 'ulsades_court_decree_saved'

const FORM_TYPE_LABELS = {
  'cert-authenticity': 'Certificate of authenticity',
  'cert-registration': 'Certificate of registration',
  'transmittal': 'Transmittal',
  'out-of-town-transmittal': 'Out of town transmittal',
  'lcr-form-1a': 'LCR FORM 1A',
  'lcr-form-2a': 'LCR FORM 2A',
  'lcr-form-3a': 'LCR FORM 3A',
  'standard-annotation': 'Standard annotation with instructions (x)',
  'annotation-form-1a': 'ANNOTATION FOR FORM 1A',
  'annotation-form-2a': 'ANNOTATION FOR FORM 2A',
  'annotation-form-3a': 'ANNOTATION FOR FORM 3A',
}

function getLabel(data) {
  const name = (data.documentOwnerName || '').trim()
  const title = (data.caseTitle || '').trim()
  if (name) return name
  if (title) return title.length > 60 ? title.slice(0, 57) + '...' : title
  return FORM_TYPE_LABELS[data.formType] || 'Court Decree'
}

export function saveCourtDecreeDraft(data) {
  try {
    localStorage.setItem(KEY_DRAFT, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

export function getCourtDecreeDraft() {
  try {
    const raw = localStorage.getItem(KEY_DRAFT)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearCourtDecreeDraft() {
  try {
    localStorage.removeItem(KEY_DRAFT)
  } catch {}
}

export function getSavedCourtDecreeList() {
  try {
    const raw = localStorage.getItem(KEY_SAVED)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function addSavedCourtDecree(data) {
  try {
    const list = getSavedCourtDecreeList()
    const id = `court_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const payload = { ...data, certificateIssuanceDate: data.certificateIssuanceDate || new Date().toISOString() }
    list.unshift({
      id,
      savedAt: new Date().toISOString(),
      label: getLabel(data),
      formType: data.formType || 'cert-authenticity',
      data: payload,
    })
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
    saveCourtDecreeDraft(payload)
    return id
  } catch {
    return null
  }
}

export function deleteSavedCourtDecree(id) {
  try {
    const list = getSavedCourtDecreeList().filter((item) => item.id !== id)
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
  } catch {}
}

export function restoreSavedCourtDecree(item) {
  if (!item || !item.id || !item.data) return false
  try {
    const list = getSavedCourtDecreeList()
    list.unshift({
      id: item.id,
      savedAt: item.savedAt || new Date().toISOString(),
      label: item.label || 'Court Decree',
      formType: item.formType || 'cert-authenticity',
      data: { ...item.data },
    })
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
    return true
  } catch {
    return false
  }
}

export function loadSavedCourtDecreeToDraft(id) {
  const list = getSavedCourtDecreeList()
  const item = list.find((x) => x.id === id)
  if (!item || !item.data) return false
  saveCourtDecreeDraft(item.data)
  return true
}

export function updateSavedCourtDecree(id, data) {
  try {
    const list = getSavedCourtDecreeList()
    const idx = list.findIndex((x) => x.id === id)
    if (idx === -1) return false
    const payload = { ...data, certificateIssuanceDate: data.certificateIssuanceDate || new Date().toISOString() }
    list[idx] = {
      id,
      savedAt: new Date().toISOString(),
      label: getLabel(data),
      formType: data.formType || 'cert-authenticity',
      data: payload,
    }
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
    saveCourtDecreeDraft(payload)
    return true
  } catch {
    return false
  }
}
