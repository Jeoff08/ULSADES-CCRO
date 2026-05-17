/** Built-in supplement types (exact keys after normalize). */
export const BUILTIN_SUPPLEMENT_TYPE_KEYS = new Set(['geographical', 'sex', 'middlename'])

/**
 * @param {string} [raw]
 * @returns {'geographical' | 'sex' | 'middleName' | 'custom'}
 */
export function resolveSupplementalAffidavitKind(raw) {
  const norm = String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
  if (norm === 'sex') return 'sex'
  if (norm === 'middlename' || norm === 'middle_name') return 'middleName'
  if (norm === 'geographical') return 'geographical'
  return 'custom'
}

/**
 * @param {string} [raw]
 * @returns {{ kind: 'geographical' | 'sex' | 'middleName' | 'custom', displayLabel: string, normalizedKey: string }}
 */
export function resolveSupplementalAffidavitType(raw) {
  const displayLabel = String(raw ?? '').trim()
  const normalizedKey = displayLabel.toLowerCase().replace(/\s+/g, '')
  const kind = resolveSupplementalAffidavitKind(raw)
  return { kind, displayLabel, normalizedKey }
}

/** @param {string} [raw] */
export function isBuiltinSupplementAffidavitType(raw) {
  return resolveSupplementalAffidavitKind(raw) !== 'custom'
}

/**
 * Default affidavit item 3 / 5 text before print overrides (`item3Custom` / `item5Custom`).
 * @param {'geographical' | 'sex' | 'middleName' | 'custom'} kind
 * @param {'missing' | 'corrected'} which
 * @param {{ missingGeo?: string, correctedGeo?: string, displayLabel?: string }} fields
 */
export function buildSupplementalAffidavitItemDefault(kind, which, fields = {}) {
  const missingGeo = String(fields.missingGeo ?? '').trim()
  const correctedGeo = String(fields.correctedGeo ?? '').trim()
  const displayLabel = String(fields.displayLabel ?? '').trim()

  if (kind === 'geographical') {
    return which === 'missing' ? missingGeo : correctedGeo
  }
  if (kind === 'sex') {
    const v = which === 'missing' ? missingGeo || 'NOT STATED' : correctedGeo
    return v
  }
  if (kind === 'middleName') {
    return which === 'missing' ? missingGeo : correctedGeo
  }
  const value = which === 'missing' ? missingGeo : correctedGeo
  if (!displayLabel) return value
  if (!value) return `${displayLabel.toUpperCase()}:`
  return value
}

/**
 * Value shown in the underline field for custom types (strips a leading "LABEL:" from saved custom text).
 * @param {string} text
 * @param {{ kind: string, displayLabel?: string }} typeInfo
 */
export function supplementalCustomItemValue(text, typeInfo) {
  const raw = String(text ?? '').trim()
  if (typeInfo.kind !== 'custom' || !raw) return raw
  const label = String(typeInfo.displayLabel ?? '').trim()
  if (!label) return raw
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return raw.replace(new RegExp(`^${escaped}\\s*:?\\s*`, 'i'), '').trim() || raw
}
