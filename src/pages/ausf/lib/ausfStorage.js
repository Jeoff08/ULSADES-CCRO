import { savedFilesListLabel } from '../../../lib/savedFileDisplayLabel'
import { mergeAUSFDraftData } from './ausfDefaults'
import { applyDerivedJuratFormTypeIfApplicable } from './ausfJuratRouting'

const AUSF_FORM_TYPE_LABELS = {
  'ausf-only': 'AUSF only',
  'ausf-0-6': 'AUSF 0-6',
  'ausf-07-17': 'AUSF 07-17',
  'reg-ausf': 'Registration of AUSF',
  'reg-ack': 'Registration of Acknowledgement',
  'child-ack': 'Child Acknowledge',
  'child-ack-lcr': 'LCR Form 1A (Birth-Available)',
  'child-not-ack': 'Child Not Acknowledged',
  'child-not-ack-lcr': 'LCR Form A1 (Child Not Acknowledged)',
  'child-not-ack-transmittal': 'Transmittal (Child Not Acknowledged)',
  'out-of-town': 'Out-of-Town Transmittal',
}

function ausfSavedListLabel(data) {
  const formTypeLabel = AUSF_FORM_TYPE_LABELS[data?.formType] || data?.formType || 'AUSF'
  return savedFilesListLabel(data, data?.applicantName, formTypeLabel)
}

const KEY = 'ulsades_ausf_draft'
const KEY_SAVED = 'ulsades_ausf_saved'
const BASE = import.meta.env.VITE_API_URL || ''
const AUSF_FORM_TYPES = new Set([
  'ausf-only',
  'ausf-0-6',
  'ausf-07-17',
  'reg-ausf',
  'reg-ack',
  'child-ack',
  'child-ack-lcr',
  'child-not-ack',
  'child-not-ack-lcr',
  'child-not-ack-transmittal',
  'out-of-town',
])

function isAUSFRecord(item) {
  return AUSF_FORM_TYPES.has(item?.formType)
}

async function apiGet(path) {
  const res = await fetch(`${BASE}${path}`)
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || res.statusText)
  return json
}

async function apiPost(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || res.statusText)
  return json
}

async function apiDelete(path) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || res.statusText)
  return json
}

/** Build document owner label from AUSF data (for birth: SPS. Father AND Mother, or child/applicant name). */
export function getDocumentOwnerLabelFromAUSFData(data) {
  if (!data) return ''
  const f = [data.fatherFirst, data.fatherMiddle, data.fatherLast].filter(Boolean).join(' ').trim()
  const m = [data.motherFirst, data.motherMiddle, data.motherLast].filter(Boolean).join(' ').trim()
  if (f && m) return `SPS. ${f} AND ${m}`
  if (f || m) return f || m
  const child = [data.childFirst, data.childMiddle, data.childLast].filter(Boolean).join(' ').trim()
  return child || (data.applicantName || '').trim() || ''
}

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

export async function loadAUSFDraftFromApi() {
  const { data } = await apiGet('/api/draft')
  if (!data || !isAUSFRecord(data)) return null
  localStorage.setItem(KEY, JSON.stringify(data))
  return data
}

export async function saveAUSFDraftToApi(data) {
  await apiPost('/api/draft', data)
  saveAUSFDraft(data)
  return true
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

export async function loadSavedAUSFListFromApi() {
  const { list } = await apiGet('/api/saved')
  const ausfList = (Array.isArray(list) ? list : []).filter(isAUSFRecord)
  localStorage.setItem(KEY_SAVED, JSON.stringify(ausfList))
  return ausfList
}

export function addSavedAUSF(data) {
  try {
    const list = getSavedAUSFList()
    const payload = { ...data }
    delete payload._savedAUSFId
    const id = `ausf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const label = ausfSavedListLabel(payload)
    list.unshift({
      id,
      savedAt: new Date().toISOString(),
      label,
      formType: payload.formType,
      data: payload,
    })
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
    return id
  } catch {
    return null
  }
}

export async function addSavedAUSFToApi(data) {
  const payload = { ...data, formType: data.formType || 'ausf-0-6' }
  const { id } = await apiPost('/api/saved', payload)
  await loadSavedAUSFListFromApi()
  return id
}

export function deleteSavedAUSF(id) {
  try {
    const list = getSavedAUSFList().filter((item) => item.id !== id)
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
  } catch {}
}

export async function deleteSavedAUSFToApi(id) {
  await apiDelete(`/api/saved/${id}`)
  await loadSavedAUSFListFromApi()
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
  const merged = mergeAUSFDraftData({
    ...item.data,
    formType: item.data.formType || item.formType,
    _savedAUSFId: id,
  })
  saveAUSFDraft(applyDerivedJuratFormTypeIfApplicable(merged))
  return true
}

export async function loadSavedAUSFToDraftApi(id) {
  const { loaded } = await apiPost(`/api/saved/${id}/load`, {})
  if (!loaded) return false
  const d = await loadAUSFDraftFromApi()
  if (!d) return false
  const merged = mergeAUSFDraftData({ ...d, _savedAUSFId: id })
  saveAUSFDraft(applyDerivedJuratFormTypeIfApplicable(merged))
  return true
}

export function updateSavedAUSF(id, data) {
  try {
    const list = getSavedAUSFList()
    const idx = list.findIndex((x) => x.id === id)
    if (idx === -1) return false
    const payload = { ...data }
    delete payload._savedAUSFId
    const label = ausfSavedListLabel(payload)
    list[idx] = {
      id,
      savedAt: new Date().toISOString(),
      label,
      formType: payload.formType,
      data: payload,
    }
    localStorage.setItem(KEY_SAVED, JSON.stringify(list))
    return true
  } catch {
    return false
  }
}

export async function updateSavedAUSFToApi(id, data) {
  await apiDelete(`/api/saved/${id}`)
  const payload = { ...data, formType: data.formType || 'ausf-0-6' }
  const { id: newId } = await apiPost('/api/saved', payload)
  await loadSavedAUSFListFromApi()
  return newId
}
