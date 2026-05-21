import { parseLcrPrintTypeId } from '../../../lib/lcrCertificationRequest'
import { COURT_DECREE_TYPES } from '../constants'
import { isLcr1aTableComplete, isLcr2aTableComplete, isLcr3aTableComplete } from './courtDecreeLcrCompletion'

/** LCR print types tied to one civil document (same as CourtDecreePrint). */
const LCR_TYPES_BY_AFFECTED = {
  BIRTH_CERTIFICATE: new Set(['lcr-form-1a']),
  DEATH_CERTIFICATE: new Set(['lcr-form-2a']),
  MARRIAGE_CERTIFICATE: new Set(['lcr-form-3a']),
}

const TRANSMITTAL_PRINT_IDS = new Set(['transmittal', 'out-of-town-transmittal'])

/** Out-of-town transmittal: no LCR in print output. */
const COURT_DECREE_OOT_EXCLUDED_PRINT_IDS = new Set(['lcr-form-1a', 'lcr-form-2a', 'lcr-form-3a'])

export const COURT_DECREE_LCR_PRINT_IDS = ['lcr-form-1a', 'lcr-form-2a', 'lcr-form-3a']

export function normalizeCourtDecreeAffectedList(data) {
  const arr = Array.isArray(data?.affectedDocuments) ? data.affectedDocuments : []
  const legacy = String(data?.affectedDocument || '').trim()
  const out = arr.filter(Boolean).map((s) => String(s).trim()).filter(Boolean)
  if (out.length) return out
  return legacy ? [legacy] : []
}

export function deriveFilledAffectedDocuments(form) {
  const out = []
  if (isLcr1aTableComplete(form)) out.push('BIRTH_CERTIFICATE')
  if (isLcr2aTableComplete(form)) out.push('DEATH_CERTIFICATE')
  if (isLcr3aTableComplete(form)) out.push('MARRIAGE_CERTIFICATE')
  return out
}

/** Same rules as Court Decree Print sidebar (`effectiveAffectedDocs`). */
export function effectiveAffectedDocumentsForCourtDecree(data) {
  if (!data || typeof data !== 'object') return []
  if (data.courtDecreeTransmittalIsOutOfTown === true) return []
  const filledAffectedDocs = deriveFilledAffectedDocuments(data)
  const affectedDocs = normalizeCourtDecreeAffectedList(data)
  if (filledAffectedDocs.length === 1) return filledAffectedDocs
  return affectedDocs
}

export function isCourtDecreeLcrPrintTypeAllowed(printTypeId, effectiveAffectedDocs) {
  const { baseType } = parseLcrPrintTypeId(printTypeId)
  const list = Array.isArray(effectiveAffectedDocs) ? effectiveAffectedDocs : []
  if (!COURT_DECREE_LCR_PRINT_IDS.includes(baseType)) return true
  if (list.length === 0) return true
  return list.some((doc) => {
    const aff = String(doc || '').trim()
    if (!aff || !LCR_TYPES_BY_AFFECTED[aff]) return false
    return LCR_TYPES_BY_AFFECTED[aff].has(baseType)
  })
}

/** Print type ids shown in View & Print for this saved record (matches CourtDecreePrint). */
export function courtDecreeFilteredPrintTypeIds(data) {
  const d = data && typeof data === 'object' ? data : {}
  const oot = d.courtDecreeTransmittalIsOutOfTown === true
  const effectiveDocs = effectiveAffectedDocumentsForCourtDecree(d)
  const baseIds = COURT_DECREE_TYPES.filter((t) => {
    if (oot && COURT_DECREE_OOT_EXCLUDED_PRINT_IDS.has(t.id)) return false
    if (!TRANSMITTAL_PRINT_IDS.has(t.id)) return true
    if (oot) return t.id === 'out-of-town-transmittal'
    return t.id === 'transmittal'
  })
    .filter((t) => isCourtDecreeLcrPrintTypeAllowed(t.id, effectiveDocs))
    .map((t) => t.id)
  return baseIds
}

export function courtDecreeSavedItemHasLcrInPrintMenu(item) {
  const data = item?.data && typeof item.data === 'object' ? item.data : {}
  const printTypes = courtDecreeFilteredPrintTypeIds(data)
  return COURT_DECREE_LCR_PRINT_IDS.some((baseId) =>
    printTypes.some((id) => parseLcrPrintTypeId(id).baseType === baseId),
  )
}
