/** Shared logic: which civil document(s) apply from LCR table field presence (matches form → print flow). */

function hasValue(v) {
  return v != null && String(v).trim() !== ''
}

/**
 * Same rules as `deriveAffectedDocumentsForPrint` in CourtDecreeForm:
 * infer birth/death/marriage from any filled row in each LCR table.
 */
export function deriveAffectedDocumentsForPrint(form) {
  if (!form || typeof form !== 'object') return []
  const selected = []
  // Omit mother/father citizenship: defaults are often 'FILIPINO' and falsely imply Form 1A is "filled".
  const hasBirth = [
    'lcr1aRegistryNumber',
    'lcr1aDateRegistration',
    'lcr1aNameOfChild',
    'lcr1aSex',
    'lcr1aDateOfBirth',
    'lcr1aPlaceOfBirth',
    'lcr1aNameOfMother',
    'lcr1aNameOfFather',
    'lcr1aDateMarriageParents',
    'lcr1aPlaceMarriageParents',
  ].some((k) => hasValue(form[k]))
  // Omit deceased citizenship fields: same false-positive issue as Form 1A defaults.
  const hasDeath = [
    'lcr2aRegistryNumber',
    'lcr2aDateRegistration',
    'lcr2aNameDeceased',
    'lcr2aSex',
    'lcr2aCivilStatus',
    'lcr2aDateDeath',
    'lcr2aPlaceDeath',
    'lcr2aCauseDeath',
  ].some((k) => hasValue(form[k]))
  const hasMarriage = [
    'lcr3aHusbandName',
    'lcr3aWifeName',
    'lcr3aRegistryNumber',
    'lcr3aDateRegistration',
    'lcr3aDateMarriage',
    'lcr3aPlaceMarriage',
  ].some((k) => hasValue(form[k]))

  if (hasBirth) selected.push('BIRTH_CERTIFICATE')
  if (hasDeath) selected.push('DEATH_CERTIFICATE')
  if (hasMarriage) selected.push('MARRIAGE_CERTIFICATE')

  if (selected.length > 0) return selected
  if (hasValue(form.affectedDocument)) return [String(form.affectedDocument).trim()]
  return []
}

const DOC_ORDER = ['BIRTH_CERTIFICATE', 'DEATH_CERTIFICATE', 'MARRIAGE_CERTIFICATE']

export function isKnownAffectedCode(code) {
  return DOC_ORDER.includes(String(code || '').trim())
}

export function normalizeAffectedDocumentsFromData(data) {
  const legacy = String(data?.affectedDocument || '').trim()
  const arr = Array.isArray(data?.affectedDocuments) ? data.affectedDocuments : []
  const out = arr.filter(Boolean).map((s) => String(s).trim()).filter(Boolean)
  if (isKnownAffectedCode(legacy)) {
    const rest = out.filter((x) => x !== legacy)
    if (rest.length || legacy) return [legacy, ...rest]
  }
  if (out.length) return out
  return legacy ? [legacy] : []
}

/** When LCR inference returns multiple docs, keep the user's explicit tab choice if it is still valid. */
export function primaryAffectedDocumentForSave(form, derivedList) {
  const list = Array.isArray(derivedList)
    ? derivedList.filter(Boolean).map((x) => String(x).trim()).filter(Boolean)
    : []
  if (list.length === 0) {
    const leg = String(form?.affectedDocument || '').trim()
    return isKnownAffectedCode(leg) ? leg : 'MARRIAGE_CERTIFICATE'
  }
  const explicit = String(form?.affectedDocument || '').trim()
  const set = new Set(list)
  if (isKnownAffectedCode(explicit) && set.has(explicit)) return explicit
  return list[0]
}

/** FORM 1A / annotation 1A → birth; 2A → death; 3A → marriage (standard LCR mapping). */
export function formTypeToAffectedCode(formType) {
  const t = String(formType || '').trim()
  if (t === 'lcr-form-1a') return 'BIRTH_CERTIFICATE'
  if (t === 'lcr-form-2a') return 'DEATH_CERTIFICATE'
  if (t === 'lcr-form-3a') return 'MARRIAGE_CERTIFICATE'
  return null
}

/**
 * One civil document for Certificate of Authenticity — matches the user's choice:
 * 1) `affectedDocument` (set when they open FORM 1A / 2A / 3A or when saving to print),
 * 2) current `formType` if it is an LCR/annotation screen,
 * 3) first known entry in `affectedDocuments`,
 * 4) infer from filled LCR fields; if several match, same priority as save (explicit `affectedDocument` wins when possible).
 */
export function resolveSingleAffectedDocumentForCertificate(data) {
  const leg = String(data?.affectedDocument || '').trim()
  // Stale BIRTH: prefer marriage if Form 3A has data; else death if Form 2A decedent only (do not send marriage → death).
  if (leg === 'BIRTH_CERTIFICATE') {
    const child = String(data?.lcr1aNameOfChild || '').trim()
    const dec = String(data?.lcr2aNameDeceased || '').trim()
    const h = String(data?.lcr3aHusbandName || '').trim()
    const w = String(data?.lcr3aWifeName || '').trim()
    const hasMarriageTable =
      !!(h || w || String(data?.lcr3aRegistryNumber || '').trim() || String(data?.lcr3aDateMarriage || '').trim() || String(data?.lcr3aPlaceMarriage || '').trim())
    if (!child && hasMarriageTable) return 'MARRIAGE_CERTIFICATE'
    if (!child && dec && !hasMarriageTable) return 'DEATH_CERTIFICATE'
  }
  if (isKnownAffectedCode(leg)) return leg

  const fromFormType = formTypeToAffectedCode(data?.formType)
  if (fromFormType) return fromFormType

  const storedList = normalizeAffectedDocumentsFromData(data)
  const firstKnown = storedList.find((s) => isKnownAffectedCode(s))
  if (firstKnown) return firstKnown

  const derived = deriveAffectedDocumentsForPrint(data)
  if (derived.length > 0) {
    return primaryAffectedDocumentForSave(data, derived)
  }

  return 'MARRIAGE_CERTIFICATE'
}

export function formatAffectedDocumentLabel(code) {
  const c = String(code || '').trim()
  if (c === 'BIRTH_CERTIFICATE') return 'BIRTH CERTIFICATE'
  if (c === 'DEATH_CERTIFICATE') return 'DEATH CERTIFICATE'
  if (c === 'MARRIAGE_CERTIFICATE') return 'MARRIAGE CERTIFICATE'
  if (!c) return '—'
  return c.replace(/_/g, ' ')
}
