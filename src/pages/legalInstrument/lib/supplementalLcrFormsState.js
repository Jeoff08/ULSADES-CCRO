import { defaultLegitimation } from '../../legitimation/lib/legitimationDefaults'
import { defaultCourtDecree } from '../../courtDecree/lib/courtDecreeDefaults'

export const SUPPLEMENTAL_LCR_FORM_TYPES = ['1A', '2A', '3A']

function hasTrimmedValue(v) {
  return String(v ?? '').trim().length > 0
}

/** Keys outside lcr1a/2a/3a prefixes that still mean the user edited an LCR table. */
const SUPPLEMENTAL_LCR_SHARED_VALUE_KEYS = new Set([
  'colbRegistryNo',
  'colbRegDate',
  'colbDateOfRegistration',
  'marriageRegistryNo',
  'childFirst',
  'childLast',
  'sex',
  'dateOfBirth',
  'dateOfDeath',
  'dateOfMarriage',
  'certificateSignatoryName',
  'certificateSignatoryTitle',
  'cityCivilRegistrarName',
  'cityCivilRegistrarTitle',
  'lcrRemarks',
  'lcrRemarksText',
])

/** True when an LCR slice has at least one meaningful field for its form type (not just defaults). */
export function supplementalLcrSliceHasFilledFields(slice, type) {
  if (!slice || typeof slice !== 'object') return false

  const empty = emptyLcrDataForType(type)
  for (const key of Object.keys(slice)) {
    if (!hasTrimmedValue(slice[key])) continue
    const val = String(slice[key]).trim()
    const emptyVal = empty[key]
    if (hasTrimmedValue(emptyVal) && val === String(emptyVal).trim()) continue
    if (/^lcr[123]a/i.test(key)) return true
    if (SUPPLEMENTAL_LCR_SHARED_VALUE_KEYS.has(key)) return true
  }
  return false
}

/** Any included LCR form in `formsData` has user-entered content. */
export function supplementalLcrBundleHasFilledData(included, formsData) {
  const list = Array.isArray(included) ? included : []
  const fd = formsData && typeof formsData === 'object' ? formsData : {}
  return list.some((t) => supplementalLcrSliceHasFilledFields(fd[t], t))
}

/** Read draft / saved supplemental and test whether LCR fields were filled in. */
export function supplementalLcrBundleHasFilledDataFromDraft(raw) {
  const { included, formsData } = getSupplementalLcrBundleFromDraft(raw)
  return supplementalLcrBundleHasFilledData(included, formsData)
}

export function emptyLcrDataForType(type) {
  return type === '1A' ? { ...defaultLegitimation } : { ...defaultCourtDecree }
}

/**
 * Read supplemental LCR state from draft (supports legacy single `lcrType` + `lcrData`).
 * @returns {{ included: ('1A'|'2A'|'3A')[], formsData: Record<string, object> }}
 */
export function getSupplementalLcrBundleFromDraft(raw) {
  const d = raw && typeof raw === 'object' ? raw : {}
  if (Array.isArray(d.lcrFormsIncluded) && d.lcrFormsIncluded.length > 0) {
    const included = SUPPLEMENTAL_LCR_FORM_TYPES.filter((t) => d.lcrFormsIncluded.includes(t))
    const fd = d.lcrFormsData && typeof d.lcrFormsData === 'object' ? d.lcrFormsData : {}
    const formsData = {}
    included.forEach((t) => {
      const slice = fd[t] && typeof fd[t] === 'object' ? fd[t] : {}
      formsData[t] = { ...emptyLcrDataForType(t), ...slice }
    })
    return { included, formsData }
  }
  if (d.includeForm1a && SUPPLEMENTAL_LCR_FORM_TYPES.includes(d.lcrType)) {
    const t = d.lcrType
    const slice = d.lcrData && typeof d.lcrData === 'object' ? d.lcrData : {}
    return {
      included: [t],
      formsData: { [t]: { ...emptyLcrDataForType(t), ...slice } },
    }
  }
  return { included: [], formsData: {} }
}

/**
 * Fields to persist on the supplemental draft (keeps legacy `includeForm1a` / `lcrType` / `lcrData` in sync).
 */
export function persistLcrBundleToDraftShape(included, formsData) {
  const first = included[0] || '1A'
  const fd = {}
  included.forEach((t) => {
    fd[t] = { ...(formsData[t] || emptyLcrDataForType(t)) }
  })
  return {
    lcrFormsIncluded: [...included],
    lcrFormsData: fd,
    includeForm1a: included.length > 0,
    lcrType: included.length > 0 ? first : '1A',
    lcrData: included.length > 0 ? { ...fd[first] } : { ...defaultLegitimation },
  }
}
