import {
  RECEIVED_BY_OPTIONS,
  matchReceivedByPresetIndex,
} from '../../legalInstrument/lib/supplementalTransmittalDefaults'

const LCR_CCR_SCOPE_KEYS = {
  'lcr-form-1a': { nameKey: 'ccrScopeLcr1aName', titleKey: 'ccrScopeLcr1aTitle' },
  'lcr-form-2a': { nameKey: 'ccrScopeLcr2aName', titleKey: 'ccrScopeLcr2aTitle' },
  'lcr-form-3a': { nameKey: 'ccrScopeLcr3aName', titleKey: 'ccrScopeLcr3aTitle' },
}

export function getLcrCcrScopeKeys(printTypeId) {
  return LCR_CCR_SCOPE_KEYS[printTypeId] || null
}

function resolveFromNameTitle(nameRaw, titleRaw) {
  const n = String(nameRaw ?? '').trim()
  const t = String(titleRaw ?? '').trim()
  if (!n && !t) return null
  const presetIdx = matchReceivedByPresetIndex(n, t)
  if (presetIdx >= 0) return { row: RECEIVED_BY_OPTIONS[presetIdx], selectValue: String(presetIdx) }
  if (n) return { row: { name: n, title: t || 'City Civil Registrar' }, selectValue: 'custom' }
  return null
}

/** Certificate / registration footer CCR from global `cityCivilRegistrar*`. */
export function resolveCourtDecreePrintCcr(data) {
  const d = data && typeof data === 'object' ? data : {}
  const r = resolveFromNameTitle(d.cityCivilRegistrarName, d.cityCivilRegistrarTitle)
  return r || { row: RECEIVED_BY_OPTIONS[0], selectValue: '0' }
}

/**
 * LCR 1A/2A/3A right-column CCR: per-form scoped keys first, then global `cityCivilRegistrar*`, then first roster row.
 * Left column (Verified by / LCRO) uses `certificateSignatory*` only — unchanged here.
 */
export function resolveCourtDecreeLcrPrintCcr(data, printTypeId) {
  const keys = getLcrCcrScopeKeys(printTypeId)
  const fallback = RECEIVED_BY_OPTIONS[0]
  const d = data && typeof data === 'object' ? data : {}
  if (!keys) {
    const r = resolveFromNameTitle(d.cityCivilRegistrarName, d.cityCivilRegistrarTitle)
    return r || { row: fallback, selectValue: '0' }
  }
  const sn = String(d[keys.nameKey] || '').trim()
  const st = String(d[keys.titleKey] || '').trim()
  const scoped = resolveFromNameTitle(sn, st)
  if (sn || st) {
    if (scoped) return scoped
    if (sn) return { row: { name: sn, title: st || 'City Civil Registrar' }, selectValue: 'custom' }
  }
  const global = resolveFromNameTitle(d.cityCivilRegistrarName, d.cityCivilRegistrarTitle)
  return global || { row: fallback, selectValue: '0' }
}

/** Sidebar select value: roster match on CCR fields, else transmittal signatory, else custom / default. */
export function courtDecreeSidebarCcrSelectValue(data) {
  const n1 = String(data?.cityCivilRegistrarName || '').trim()
  const t1 = String(data?.cityCivilRegistrarTitle || '').trim()
  const i1 = matchReceivedByPresetIndex(n1, t1)
  if (i1 >= 0) return String(i1)
  const n2 = String(data?.transmittalSignatoryName || '').trim()
  const t2 = String(data?.transmittalSignatoryTitle || '').trim()
  const i2 = matchReceivedByPresetIndex(n2, t2)
  if (i2 >= 0) return String(i2)
  if (n1 || n2) return 'custom'
  return '0'
}

export function courtDecreeSidebarCcrCustomLabel(data) {
  return String(data?.cityCivilRegistrarName || data?.transmittalSignatoryName || '').trim()
}

export function courtDecreeSidebarCcrSelectValueForValidType(data, validType) {
  if (getLcrCcrScopeKeys(validType)) {
    return resolveCourtDecreeLcrPrintCcr(data, validType).selectValue
  }
  return courtDecreeSidebarCcrSelectValue(data)
}

export function courtDecreeSidebarCcrCustomLabelForValidType(data, validType) {
  if (getLcrCcrScopeKeys(validType)) {
    return resolveCourtDecreeLcrPrintCcr(data, validType).row.name
  }
  return courtDecreeSidebarCcrCustomLabel(data)
}

export { RECEIVED_BY_OPTIONS, matchReceivedByPresetIndex }
