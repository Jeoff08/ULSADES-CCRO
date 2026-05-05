/** Jurat affidavit print types (mutually exclusive by business rules). */
export const AUSF_JURAT_PRINT_TYPES = new Set(['ausf-only', 'ausf-0-6', 'ausf-07-17'])

export function computeAgeFromIsoDate(isoDate) {
  if (!isoDate || typeof isoDate !== 'string') return ''
  const birth = new Date(isoDate)
  if (Number.isNaN(birth.getTime())) return ''
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1
  return String(Math.max(0, age))
}

function numericAgeFromData(data) {
  if (!data || typeof data !== 'object') return NaN
  const raw = String(data.age ?? '').trim()
  let a = parseInt(raw, 10)
  if (Number.isFinite(a) && raw !== '') return a
  const fromDob = computeAgeFromIsoDate(data.dateOfBirth)
  a = parseInt(fromDob, 10)
  return Number.isFinite(a) ? a : NaN
}

/**
 * Which single jurat-style AUSF print applies:
 * - Acknowledged by father → AUSF only
 * - Age 0–6 → AUSF 0-6
 * - Age 7+ (including adults) → AUSF 07-17
 * If age cannot be determined and child is not acknowledged, default to 07-17.
 */
export function deriveAusfJuratAffidavitFormType(data) {
  if (!data || typeof data !== 'object') return 'ausf-0-6'
  if (data.childAlreadyAcknowledged === 'YES') return 'ausf-only'
  const a = numericAgeFromData(data)
  if (!Number.isFinite(a) || a < 0) return 'ausf-07-17'
  if (a <= 6) return 'ausf-0-6'
  return 'ausf-07-17'
}

/** When the record is already a jurat AUSF type, align formType with ack + age (e.g. after loading a saved file for edit). */
export function applyDerivedJuratFormTypeIfApplicable(data) {
  if (!data || typeof data !== 'object') return data
  if (!AUSF_JURAT_PRINT_TYPES.has(data.formType)) return data
  const want = deriveAusfJuratAffidavitFormType(data)
  if (data.formType === want) return data
  return { ...data, formType: want }
}
