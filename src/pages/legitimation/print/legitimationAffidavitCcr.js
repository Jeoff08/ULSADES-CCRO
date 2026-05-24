import { formatSignatoryTitleForDisplay } from '../../../lib/printUtils'
import {
  RECEIVED_BY_OPTIONS,
  matchReceivedByPresetIndex,
} from '../../legalInstrument/lib/supplementalTransmittalDefaults'

export { RECEIVED_BY_OPTIONS }

const JOINT_NAME = 'legitimationJointAffidavitReceivedByName'
const JOINT_TITLE = 'legitimationJointAffidavitReceivedByTitle'
const SOLE_NAME = 'legitimationSoleAffidavitReceivedByName'
const SOLE_TITLE = 'legitimationSoleAffidavitReceivedByTitle'

function resolveRowFromStoredNameTitle(name, title) {
  const n0 = String(name ?? '').trim()
  const t0 = String(title ?? '').trim()
  if (!n0 && !t0) return null
  const idx = matchReceivedByPresetIndex(name, title)
  if (idx >= 0) {
    const row = RECEIVED_BY_OPTIONS[idx]
    return { ...row, title: formatSignatoryTitleForDisplay(row.title) }
  }
  return {
    name: n0 || RECEIVED_BY_OPTIONS[0].name,
    title: formatSignatoryTitleForDisplay(t0 || 'City Civil Registrar'),
  }
}

function selectValueFromStoredNameTitle(name, title) {
  const idx = matchReceivedByPresetIndex(name, title)
  if (idx >= 0) return String(idx)
  const n = String(name || '').trim()
  const t = String(title || '').trim()
  if (n || t) return 'custom'
  return null
}

/** @param {'joint' | 'sole'} variant */
function nameTitleKeysForVariant(variant) {
  return variant === 'sole'
    ? { nameKey: SOLE_NAME, titleKey: SOLE_TITLE }
    : { nameKey: JOINT_NAME, titleKey: JOINT_TITLE }
}

/**
 * Name + title on Joint or Sole affidavit CCR block only.
 * Does not use cityCivilRegistrar* once this variant’s affidavit fields are set.
 * @param {'joint' | 'sole'} variant
 */
export function legitimationAffidavitCcrDisplayRow(data, variant) {
  const d = data && typeof data === 'object' ? data : {}
  const { nameKey, titleKey } = nameTitleKeysForVariant(variant)
  const scoped = resolveRowFromStoredNameTitle(d[nameKey], d[titleKey])
  if (scoped) return scoped
  const legacy = resolveRowFromStoredNameTitle(
    d.legitimationAffidavitReceivedByName,
    d.legitimationAffidavitReceivedByTitle
  )
  if (legacy) return legacy
  const fromShared = resolveRowFromStoredNameTitle(d.cityCivilRegistrarName, d.cityCivilRegistrarTitle)
  if (fromShared) return fromShared
  return RECEIVED_BY_OPTIONS[0]
}

/**
 * @param {'joint' | 'sole'} variant — which affidavit line the sidebar is editing
 */
export function legitimationAffidavitCcrSelectValue(data, variant) {
  const d = data && typeof data === 'object' ? data : {}
  const { nameKey, titleKey } = nameTitleKeysForVariant(variant)
  return (
    selectValueFromStoredNameTitle(d[nameKey], d[titleKey])
    ?? selectValueFromStoredNameTitle(d.legitimationAffidavitReceivedByName, d.legitimationAffidavitReceivedByTitle)
    ?? selectValueFromStoredNameTitle(d.cityCivilRegistrarName, d.cityCivilRegistrarTitle)
    ?? '0'
  )
}

/**
 * Patch object for persist callback when choosing a preset row.
 * @param {'joint' | 'sole'} variant
 */
export function legitimationAffidavitCcrPersistPatch(variant, opt) {
  const { nameKey, titleKey } = nameTitleKeysForVariant(variant)
  return {
    [nameKey]: opt.name,
    [titleKey]: opt.title,
  }
}
