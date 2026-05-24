import {
  LOCAL_TRANSMITTAL_ATTN_LINES,
  LOCAL_TRANSMITTAL_ATTN_PREFIX,
  LOCAL_TRANSMITTAL_TO_PSA_LINES,
} from './transmittalLocalAddressee'

const PROFILES_STORAGE_KEY = 'ulsades-transmittal-profiles-v1'
const SELECTED_KEY_PREFIX = 'ulsades-transmittal-profile-selected-'

export const TRANSMITTAL_PROFILE_VARIANT = {
  STANDARD: 'standard',
  CCR: 'ccr',
}

export const PSA_DEFAULT_TRANSMITTAL_PROFILE_LABEL = 'PSA — National Statistician (default)'

function newId() {
  return `tp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createEmptyStandardProfile(name = '') {
  return {
    id: newId(),
    name,
    variant: TRANSMITTAL_PROFILE_VARIANT.STANDARD,
    transmittalToPsaLine1: '',
    transmittalToPsaLine2: '',
    transmittalToPsaLine3: '',
    transmittalToPsaLine4: '',
    transmittalToPsaLine5: '',
    transmittalToPsaLine6: '',
    transmittalAttnPrefix: LOCAL_TRANSMITTAL_ATTN_PREFIX,
    transmittalAttnLine1: '',
    transmittalAttnLine2: '',
    transmittalAttnLine3: '',
  }
}

export function createEmptyCcrProfile(name = '') {
  return {
    id: newId(),
    name,
    variant: TRANSMITTAL_PROFILE_VARIANT.CCR,
    transmittalRecipient: '',
    transmittalToPosition1: '',
    transmittalToPosition2: '',
    transmittalToOffice1: '',
    transmittalToOffice2: '',
    transmittalThru: '',
    transmittalThruPosition1: '',
    transmittalThruPosition2: '',
    transmittalThruPosition3: '',
    transmittalThruPosition4: '',
  }
}

function profileHasPsaNationalStatisticianTo(profile) {
  const keyLine = String(LOCAL_TRANSMITTAL_TO_PSA_LINES[0] ?? '').trim()
  if (!keyLine) return false
  if (profile?.variant === TRANSMITTAL_PROFILE_VARIANT.STANDARD) {
    return String(profile.transmittalToPsaLine1 ?? '').trim() === keyLine
  }
  if (profile?.variant === TRANSMITTAL_PROFILE_VARIANT.CCR) {
    return String(profile.transmittalRecipient ?? '').trim() === keyLine
  }
  return false
}

/** Standard saved addressee with Minerva / Marizza lines from local transmittal constants. */
export function createDefaultStandardTransmittalProfile() {
  const p = createEmptyStandardProfile(PSA_DEFAULT_TRANSMITTAL_PROFILE_LABEL)
  LOCAL_TRANSMITTAL_TO_PSA_LINES.forEach((line, i) => {
    p[`transmittalToPsaLine${i + 1}`] = line
  })
  LOCAL_TRANSMITTAL_ATTN_LINES.forEach((line, i) => {
    p[`transmittalAttnLine${i + 1}`] = line
  })
  p.transmittalAttnPrefix = LOCAL_TRANSMITTAL_ATTN_PREFIX
  return syncStandardProfilePsaToRecipient(p)
}

/** CCR-style saved addressee with the same PSA national statistician block. */
export function createDefaultCcrTransmittalProfile() {
  const p = createEmptyCcrProfile(PSA_DEFAULT_TRANSMITTAL_PROFILE_LABEL)
  p.transmittalRecipient = LOCAL_TRANSMITTAL_TO_PSA_LINES[0] || ''
  p.transmittalToPosition1 = LOCAL_TRANSMITTAL_TO_PSA_LINES[1] || ''
  p.transmittalToPosition2 = LOCAL_TRANSMITTAL_TO_PSA_LINES[2] || ''
  p.transmittalToOffice1 = LOCAL_TRANSMITTAL_TO_PSA_LINES[3] || ''
  p.transmittalToOffice2 = [LOCAL_TRANSMITTAL_TO_PSA_LINES[4], LOCAL_TRANSMITTAL_TO_PSA_LINES[5]]
    .filter(Boolean)
    .join(', ')
  p.transmittalThru = LOCAL_TRANSMITTAL_ATTN_LINES[0] || ''
  p.transmittalThruPosition1 = LOCAL_TRANSMITTAL_ATTN_LINES[1] || ''
  p.transmittalThruPosition2 = LOCAL_TRANSMITTAL_ATTN_LINES[2] || ''
  return p
}

/** Re-add PSA default addressees if they were deleted from the saved list. */
export function restoreMissingPsaDefaultTransmittalProfiles(profiles) {
  const list = Array.isArray(profiles) ? [...profiles] : []
  const hasStandard = list.some(
    (p) => p?.variant === TRANSMITTAL_PROFILE_VARIANT.STANDARD && profileHasPsaNationalStatisticianTo(p),
  )
  const hasCcr = list.some(
    (p) => p?.variant === TRANSMITTAL_PROFILE_VARIANT.CCR && profileHasPsaNationalStatisticianTo(p),
  )
  let restored = false
  if (!hasStandard) {
    list.push(createDefaultStandardTransmittalProfile())
    restored = true
  }
  if (!hasCcr) {
    list.push(createDefaultCcrTransmittalProfile())
    restored = true
  }
  if (restored) saveTransmittalProfiles(list)
  return { profiles: list, restored }
}

const LEGACY_ATTN_LINE1 = 'Marizza B. Grande'
const CURRENT_ATTN_LINE1 = LOCAL_TRANSMITTAL_ATTN_LINES[0]

function migrateLegacyAttnOnProfiles(profiles) {
  let changed = false
  const next = (profiles || []).map((p) => {
    if (!p || typeof p !== 'object') return p
    const out = { ...p }
    if (String(out.transmittalAttnLine1 ?? '').trim() === LEGACY_ATTN_LINE1) {
      out.transmittalAttnLine1 = CURRENT_ATTN_LINE1
      changed = true
    }
    if (String(out.transmittalThru ?? '').trim() === LEGACY_ATTN_LINE1) {
      out.transmittalThru = CURRENT_ATTN_LINE1
      changed = true
    }
    return out
  })
  if (changed) saveTransmittalProfiles(next)
  return next
}

export function loadTransmittalProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY)
    if (!raw) return ensureDefaultTransmittalProfiles()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return ensureDefaultTransmittalProfiles()
    if (parsed.length === 0) return []
    return migrateLegacyAttnOnProfiles(parsed)
  } catch {
    return ensureDefaultTransmittalProfiles()
  }
}

export function saveTransmittalProfiles(profiles) {
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles))
    return true
  } catch {
    return false
  }
}

export function ensureDefaultTransmittalProfiles() {
  const defaults = [createDefaultStandardTransmittalProfile(), createDefaultCcrTransmittalProfile()]
  saveTransmittalProfiles(defaults)
  return defaults
}

export function getSelectedTransmittalProfileId(moduleKey) {
  try {
    return String(localStorage.getItem(`${SELECTED_KEY_PREFIX}${moduleKey}`) || '').trim()
  } catch {
    return ''
  }
}

export function setSelectedTransmittalProfileId(moduleKey, profileId) {
  try {
    if (!profileId) {
      localStorage.removeItem(`${SELECTED_KEY_PREFIX}${moduleKey}`)
    } else {
      localStorage.setItem(`${SELECTED_KEY_PREFIX}${moduleKey}`, String(profileId))
    }
    return true
  } catch {
    return false
  }
}

export function listProfilesForVariant(profiles, variant) {
  return (profiles || []).filter((p) => p && p.variant === variant)
}

export function findTransmittalProfile(profiles, id) {
  return (profiles || []).find((p) => p && p.id === id) || null
}

/** Keep six-line PSA block and legacy recipient* fields in sync for print. */
export function syncStandardProfilePsaToRecipient(profile) {
  const p = { ...profile }
  const lines = [1, 2, 3, 4, 5, 6].map((n) => String(p[`transmittalToPsaLine${n}`] ?? '').trim())
  p.recipientName = lines[0] || ''
  p.recipientTitle = lines[1] || ''
  p.recipientOffice = lines[2] || ''
  p.transmittalOotLine4 = lines[3] || ''
  p.transmittalOotLine5 = lines[4] || ''
  p.transmittalOotLine6 = lines[5] || ''
  return p
}

export function standardProfileToFormPatch(profile) {
  const p = syncStandardProfilePsaToRecipient(profile)
  return {
    transmittalProfileId: p.id,
    transmittalToPsaLine1: p.transmittalToPsaLine1 ?? '',
    transmittalToPsaLine2: p.transmittalToPsaLine2 ?? '',
    transmittalToPsaLine3: p.transmittalToPsaLine3 ?? '',
    transmittalToPsaLine4: p.transmittalToPsaLine4 ?? '',
    transmittalToPsaLine5: p.transmittalToPsaLine5 ?? '',
    transmittalToPsaLine6: p.transmittalToPsaLine6 ?? '',
    transmittalAttnPrefix: p.transmittalAttnPrefix ?? '',
    transmittalAttnLine1: p.transmittalAttnLine1 ?? '',
    transmittalAttnLine2: p.transmittalAttnLine2 ?? '',
    transmittalAttnLine3: p.transmittalAttnLine3 ?? '',
    recipientName: p.recipientName ?? '',
    recipientTitle: p.recipientTitle ?? '',
    recipientOffice: p.recipientOffice ?? '',
    transmittalOotLine4: p.transmittalOotLine4 ?? '',
    transmittalOotLine5: p.transmittalOotLine5 ?? '',
    transmittalOotLine6: p.transmittalOotLine6 ?? '',
  }
}

export function ccrProfileToFormPatch(profile) {
  return {
    transmittalProfileId: profile.id,
    transmittalRecipient: profile.transmittalRecipient ?? '',
    transmittalToPosition1: profile.transmittalToPosition1 ?? '',
    transmittalToPosition2: profile.transmittalToPosition2 ?? '',
    transmittalToOffice1: profile.transmittalToOffice1 ?? '',
    transmittalToOffice2: profile.transmittalToOffice2 ?? '',
    transmittalThru: profile.transmittalThru ?? '',
    transmittalThruPosition1: profile.transmittalThruPosition1 ?? '',
    transmittalThruPosition2: profile.transmittalThruPosition2 ?? '',
    transmittalThruPosition3: profile.transmittalThruPosition3 ?? '',
    transmittalThruPosition4: profile.transmittalThruPosition4 ?? '',
  }
}

export function profileToFormPatch(profile) {
  if (!profile) return {}
  if (profile.variant === TRANSMITTAL_PROFILE_VARIANT.CCR) return ccrProfileToFormPatch(profile)
  return standardProfileToFormPatch(profile)
}

function str(v) {
  return String(v ?? '').trim()
}

/** True when the saved preset has at least one To / ATTN line filled. */
export function transmittalProfileHasAddresseeContent(profile) {
  if (!profile) return false
  if (profile.variant === TRANSMITTAL_PROFILE_VARIANT.CCR) {
    return [
      profile.transmittalRecipient,
      profile.transmittalToPosition1,
      profile.transmittalToPosition2,
      profile.transmittalToOffice1,
      profile.transmittalToOffice2,
      profile.transmittalThru,
      profile.transmittalThruPosition1,
      profile.transmittalThruPosition2,
    ].some((v) => str(v))
  }
  return [1, 2, 3, 4, 5, 6].some((n) => str(profile[`transmittalToPsaLine${n}`])) ||
    [1, 2, 3].some((n) => str(profile[`transmittalAttnLine${n}`]))
}

/** True when form state already has transmittal addressee text. */
export function formHasTransmittalAddresseeContent(form, variant) {
  if (!form || typeof form !== 'object') return false
  if (variant === TRANSMITTAL_PROFILE_VARIANT.CCR) {
    return [
      form.transmittalRecipient,
      form.transmittalToPosition1,
      form.transmittalToPosition2,
      form.transmittalToOffice1,
      form.transmittalToOffice2,
      form.transmittalThru,
    ].some((v) => str(v))
  }
  return (
    [form.recipientName, form.recipientTitle, form.recipientOffice, form.transmittalOotLine4].some((v) =>
      str(v),
    ) || [1, 2, 3, 4, 5, 6].some((n) => str(form[`transmittalToPsaLine${n}`]))
  )
}

export function profileToFormPatchFromProfile(profile) {
  if (!profile || !transmittalProfileHasAddresseeContent(profile)) return null
  const synced =
    profile.variant === TRANSMITTAL_PROFILE_VARIANT.STANDARD
      ? syncStandardProfilePsaToRecipient(profile)
      : profile
  return profileToFormPatch(synced)
}

/** Patch for the addressee currently selected for this module (standard vs CCR). */
export function getSelectedTransmittalProfileFormPatch(moduleKey, variant) {
  const id = getSelectedTransmittalProfileId(moduleKey)
  if (!id) return null
  const profile = findTransmittalProfile(loadTransmittalProfiles(), id)
  if (!profile || profile.variant !== variant) return null
  return profileToFormPatchFromProfile(profile)
}

/**
 * Apply selected preset to form when selection changed or transmittal block is still empty.
 * Returns merged form, or the same reference if no change.
 */
export function mergeSelectedTransmittalProfileIntoForm(form, moduleKey, variant) {
  const patch = getSelectedTransmittalProfileFormPatch(moduleKey, variant)
  if (!patch) return form
  const selectedId = getSelectedTransmittalProfileId(moduleKey)
  const sameProfile = str(form?.transmittalProfileId) === selectedId
  if (sameProfile && formHasTransmittalAddresseeContent(form, variant)) return form
  return { ...form, ...patch }
}
