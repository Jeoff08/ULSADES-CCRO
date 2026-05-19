import { normalizeLcroStaffTitle } from './printUtils'

/** Court Decree — existing keys (unchanged for backward compatibility). */
export const LCRO_STAFF_LIST_KEY = 'ulsades_lcro_staff_list'
export const PREFERRED_LCRO_STAFF_KEY = 'ulsades_preferred_lcr_staff'

/** Legitimation — separate suggestion lists. */
export const LEGITIMATION_LCRO_STAFF_LIST_KEY = 'ulsades_legitimation_lcro_staff_list'
export const LEGITIMATION_PREFERRED_LCRO_STAFF_KEY = 'ulsades_legitimation_preferred_lcro_staff'

export const LCRO_STAFF_SCOPES = {
  courtDecree: {
    listKey: LCRO_STAFF_LIST_KEY,
    preferredKey: PREFERRED_LCRO_STAFF_KEY,
    titlesKey: 'ulsades_lcro_staff_titles_by_name',
  },
  legitimation: {
    listKey: LEGITIMATION_LCRO_STAFF_LIST_KEY,
    preferredKey: LEGITIMATION_PREFERRED_LCRO_STAFF_KEY,
    titlesKey: 'ulsades_legitimation_lcro_staff_titles_by_name',
  },
}

const PRESET_PROFILES = [
  { name: 'SHIRLY L. DEMECILLO', title: 'Registration Officer II' },
  { name: 'FELIX O. PEPITO', title: 'LCRO Staff' },
  { name: 'LORELIE L. CANTO', title: 'Registration Officer IV' },
]

export function isLikelyFullStaffName(value) {
  const name = String(value || '').trim()
  if (name.length < 5) return false
  return name.split(/\s+/).filter(Boolean).length >= 2
}

function resolveScope(scope) {
  return LCRO_STAFF_SCOPES[scope] || LCRO_STAFF_SCOPES.courtDecree
}

function nameKey(name) {
  return String(name || '').trim().toUpperCase()
}

function readTitleMap(scope) {
  const { titlesKey } = resolveScope(scope)
  try {
    const raw = localStorage.getItem(titlesKey)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeTitleMap(scope, map) {
  const { titlesKey } = resolveScope(scope)
  try {
    localStorage.setItem(titlesKey, JSON.stringify(map))
    return true
  } catch {
    return false
  }
}

/** Known title for a saved or preset staff name (per module scope). */
export function getLcroStaffTitleForName(name, scope = 'courtDecree') {
  const key = nameKey(name)
  if (!key) return ''
  const fromMap = readTitleMap(scope)[key]
  if (fromMap) return normalizeLcroStaffTitle(fromMap)
  const preset = PRESET_PROFILES.find((p) => nameKey(p.name) === key)
  return preset ? normalizeLcroStaffTitle(preset.title) : ''
}

/** All saved staff names for the given scope (newest first). */
export function loadLcroStaffNames(scope = 'courtDecree') {
  const { listKey } = resolveScope(scope)
  try {
    const rawList = localStorage.getItem(listKey)
    const parsed = rawList ? JSON.parse(rawList) : []
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((v) => String(v || '').trim())
      .filter((v) => isLikelyFullStaffName(v))
      .filter((v, i, arr) => arr.findIndex((x) => nameKey(x) === nameKey(v)) === i)
  } catch {
    return []
  }
}

export function rememberLcroStaffName(rawName, scope = 'courtDecree') {
  const { listKey, preferredKey } = resolveScope(scope)
  const currentName = String(rawName || '').trim()
  if (!isLikelyFullStaffName(currentName)) return loadLcroStaffNames(scope)
  try {
    localStorage.setItem(preferredKey, currentName)
    const prev = loadLcroStaffNames(scope)
    if (prev.some((n) => nameKey(n) === nameKey(currentName))) return prev
    const next = [currentName, ...prev]
    localStorage.setItem(listKey, JSON.stringify(next))
    return next
  } catch {
    return loadLcroStaffNames(scope)
  }
}

/** Save name + title to suggestions for the given scope only. */
export function saveLcroStaffProfile(rawName, rawTitle, scope = 'courtDecree') {
  const name = String(rawName || '').trim()
  const title = normalizeLcroStaffTitle(rawTitle)
  rememberLcroStaffName(name, scope)
  if (!name || !title) return
  const map = readTitleMap(scope)
  map[nameKey(name)] = title
  writeTitleMap(scope, map)
}

export function filterLcroStaffNames(names, query, limit = 8) {
  const q = String(query || '').trim().toUpperCase()
  const base = Array.isArray(names) ? names : []
  if (!q) return base.slice(0, limit)
  return base.filter((n) => n.toUpperCase().includes(q)).slice(0, limit)
}
