const KEY_DRAFT = 'legitimationDraft'
const KEY_SAVED = 'ulsades_legitimation_saved'

const FORM_TYPE_LABELS = {
  'sole-affidavit': 'Sole Affidavit Legitimation',
  'joint-affidavit': 'Joint Affidavit Legitimation',
  'registration-legitimation': 'Registration of Legitimation',
  'registration-acknowledgement': 'Registration of Acknowledgement',
  'lcr-form-1a': 'LCR Form 1A',
  'transmittal': 'Transmittal',
  'out-of-town-transmittal': 'Out of Town Transmittal',
  'annotation': 'Annotation',
}

function getLabel(data) {
  const child = [data.childFirst, data.childMiddle, data.childLast].filter(Boolean).join(' ')
  if (child) return child
  return FORM_TYPE_LABELS[data.formType] || 'Legitimation'
}

/** Document owner label for Court Decree dropdown: marriage = "SPS. Father AND Mother", death = deceased parent full name. */
export function getDocumentOwnerLabelFromLegitimationData(data, type) {
  if (!data) return ''
  if (type === 'MARRIAGE_CERTIFICATE' || type === 'marriage') {
    const f = [data.fatherFirst, data.fatherMiddle, data.fatherLast].filter(Boolean).join(' ').trim()
    const m = [data.motherFirst, data.motherMiddle, data.motherLast].filter(Boolean).join(' ').trim()
    if (f && m) return `SPS. ${f} AND ${m}`
    if (f || m) return f || m
    const child = [data.childFirst, data.childMiddle, data.childLast].filter(Boolean).join(' ').trim()
    return child || ''
  }
  if (type === 'DEATH_CERTIFICATE' || type === 'death') {
    return [data.deceasedParentFirst, data.deceasedParentMiddle, data.deceasedParentLast].filter(Boolean).join(' ').trim() || ''
  }
  const f = [data.fatherFirst, data.fatherMiddle, data.fatherLast].filter(Boolean).join(' ').trim()
  const m = [data.motherFirst, data.motherMiddle, data.motherLast].filter(Boolean).join(' ').trim()
  if (f && m) return `SPS. ${f} AND ${m}`
  return [data.deceasedParentFirst, data.deceasedParentMiddle, data.deceasedParentLast].filter(Boolean).join(' ').trim() || ''
}

export function saveLegitimationDraft(data) {
  try {
    localStorage.setItem(KEY_DRAFT, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

export function getLegitimationDraft() {
  try {
    const raw = localStorage.getItem(KEY_DRAFT)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearLegitimationDraft() {
  try {
    localStorage.removeItem(KEY_DRAFT)
  } catch {}
}

export function getSavedLegitimationList() {
  try {
    const raw = localStorage.getItem(KEY_SAVED)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function addSavedLegitimation(data) {
  try {
    const list = getSavedLegitimationList()
    const id = `leg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const payload = { ...data, certificateIssuanceDate: data.certificateIssuanceDate || new Date().toISOString() }
    list.unshift({
      id,
      savedAt: new Date().toISOString(),
      label: getLabel(data),
      formType: data.formType || 'joint-affidavit',
      data: payload,
    })
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
    saveLegitimationDraft(payload)
    return id
  } catch {
    return null
  }
}

export function deleteSavedLegitimation(id) {
  try {
    const list = getSavedLegitimationList().filter((item) => item.id !== id)
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
  } catch {}
}

export function restoreSavedLegitimation(item) {
  if (!item || !item.id || !item.data) return false
  try {
    const list = getSavedLegitimationList()
    list.unshift({
      id: item.id,
      savedAt: item.savedAt || new Date().toISOString(),
      label: item.label || getLabel(item.data),
      formType: item.formType || 'joint-affidavit',
      data: { ...item.data },
    })
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
    return true
  } catch {
    return false
  }
}

export function loadSavedLegitimationToDraft(id) {
  const list = getSavedLegitimationList()
  const item = list.find((x) => x.id === id)
  if (!item || !item.data) return false
  saveLegitimationDraft(item.data)
  return true
}

export function updateSavedLegitimation(id, data) {
  try {
    const list = getSavedLegitimationList()
    const idx = list.findIndex((x) => x.id === id)
    if (idx === -1) return false
    const payload = { ...data, certificateIssuanceDate: data.certificateIssuanceDate || new Date().toISOString() }
    list[idx] = {
      id,
      savedAt: new Date().toISOString(),
      label: getLabel(data),
      formType: data.formType || 'joint-affidavit',
      data: payload,
    }
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
    saveLegitimationDraft(payload)
    return true
  } catch {
    return false
  }
}
