import { fullName } from '../../../lib/printUtils'
import { defaultLegitimation } from '../../legitimation/lib/legitimationDefaults'
import { getLegitimationDraft, getSavedLegitimationList } from '../../legitimation/lib/legitimationStorage'
import { getCourtDecreeDraft, getSavedCourtDecreeList } from '../../courtDecree/lib/courtDecreeStorage'

function normalizeName(s) {
  return String(s || '').trim().toUpperCase().replace(/\s+/g, ' ')
}

export function childFullFromLegitimation(d) {
  if (!d || typeof d !== 'object') return ''
  return (fullName(d.childFirst, d.childMiddle, d.childLast) || '').trim()
}

function namesMatch(a, b) {
  const na = normalizeName(a)
  const nb = normalizeName(b)
  return Boolean(na && nb && na === nb)
}

function childFullFromCourtDecree(d) {
  if (!d || typeof d !== 'object') return ''
  return String(d.lcr1aNameOfChild || d.documentOwnerName || d.caseTitle || '').trim()
}

/** All text we search when filtering by typed name (child, parents, labels, registry nos.). */
function haystackForForm1aRow(row) {
  const d = row?.data && typeof row.data === 'object' ? row.data : {}
  const chunks = [
    row.sourceType,
    row.childName,
    row.label,
    fullName(d.childFirst, d.childMiddle, d.childLast),
    d.childFirst,
    d.childMiddle,
    d.childLast,
    fullName(d.motherFirst, d.motherMiddle, d.motherLast),
    fullName(d.fatherFirst, d.fatherMiddle, d.fatherLast),
    d.colbRegistryNo,
    d.lcr1aRegistryNumber,
    d.lcr1aDateRegistration,
    d.lcr1aNameOfChild,
    d.lcr1aNameOfMother,
    d.lcr1aNameOfFather,
    d.documentOwnerName,
    d.caseTitle,
    d.marriageRegistryNo,
    d.affidavitLegitRegistryNo,
    d.affidavitAckRegistryNo,
  ]
  return normalizeName(chunks.filter(Boolean).join(' '))
}

/**
 * Empty query → show every registered row.
 * Typed query → show every row where each word appears somewhere in the haystack (child, parents, label, registry, etc.).
 */
export function legitimationRowMatchesSearch(row, query) {
  const raw = String(query || '').trim()
  if (!raw) return true
  const h = haystackForForm1aRow(row)
  const tokens = raw.split(/\s+/).map((t) => normalizeName(t)).filter(Boolean)
  if (tokens.length === 0) return true
  return tokens.every((t) => h.includes(t))
}

/** Draft + saved rows from Legitimation and Court Decree (Form 1A data sources). */
export function listLegitimationSourcesForForm1a() {
  const out = []

  const draft = getLegitimationDraft()
  if (draft && typeof draft === 'object') {
    const child = childFullFromLegitimation(draft)
    out.push({
      sourceId: '__draft__',
      sourceType: 'Legitimation',
      label: child || 'Current Legitimation draft',
      childName: child,
      data: draft,
    })
  }
  for (const item of getSavedLegitimationList()) {
    if (!item?.data) continue
    const child = childFullFromLegitimation(item.data)
    out.push({
      sourceId: item.id,
      sourceType: 'Legitimation',
      label: item.label || child || 'Legitimation',
      childName: child,
      data: item.data,
    })
  }

  const courtDraft = getCourtDecreeDraft()
  if (courtDraft && typeof courtDraft === 'object') {
    const child = childFullFromCourtDecree(courtDraft)
    out.push({
      sourceId: '__court_draft__',
      sourceType: 'Court Decree',
      label: child || 'Current Court Decree draft',
      childName: child,
      data: courtDraft,
    })
  }
  for (const item of getSavedCourtDecreeList()) {
    if (!item?.data) continue
    const child = childFullFromCourtDecree(item.data)
    out.push({
      sourceId: `court_${item.id}`,
      sourceType: 'Court Decree',
      label: item.label || child || 'Court Decree',
      childName: child,
      data: item.data,
    })
  }

  return out
}

/** All registered sources (Legitimation + Court Decree). Empty query returns every row; otherwise filters by name-related fields. */
export function searchLegitimationForForm1a(query) {
  const rows = listLegitimationSourcesForForm1a()
  return rows.filter((r) => legitimationRowMatchesSearch(r, query))
}

/** Merge a source record into defaults for LCR 1A display. */
export function form1aDataFromLegitimationRecord(legData) {
  if (!legData || typeof legData !== 'object') return { ...defaultLegitimation }
  return { ...defaultLegitimation, ...legData }
}

export function resolveForm1aTargetName(sup) {
  const type = String(sup.supplementType || 'geographical').toLowerCase()
  const isSex = type === 'sex'
  const colbOther = isSex && String(sup.colbSubject || 'self').toLowerCase() === 'other'
  if (colbOther) return String(sup.subjectColbName || '').trim()
  if (isSex) return String(sup.affiantName || '').trim()
  const custom = String(sup.form1aMatchName || '').trim()
  if (custom) return custom
  return String(sup.affiantName || '').trim()
}

/**
 * Legitimation/Court Decree draft + saved. Returns merged Form 1A data when a single
 * related record is identified; otherwise null (manual entry on print).
 *
 * 1) Exact match on child full name or saved label.
 * 2) Else: same token filter as search — if exactly one row matches the target
 *    string, use that row (ambiguous or zero matches → null).
 */
export function buildForm1aDataForSupplemental(supplementalData) {
  const sup = supplementalData && typeof supplementalData === 'object' ? supplementalData : {}
  const targetName = resolveForm1aTargetName(sup)
  if (!targetName) return null

  const rows = listLegitimationSourcesForForm1a()
  for (const row of rows) {
    if (namesMatch(targetName, row.childName) || namesMatch(targetName, row.label)) {
      return form1aDataFromLegitimationRecord(row.data)
    }
  }
  const candidates = rows.filter((r) => legitimationRowMatchesSearch(r, targetName))
  if (candidates.length === 1) {
    return form1aDataFromLegitimationRecord(candidates[0].data)
  }
  return null
}

export function buildForm1aDataForSupplementalSex(supplementalData) {
  return buildForm1aDataForSupplemental(supplementalData)
}
