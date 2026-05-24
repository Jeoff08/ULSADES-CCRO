const GREGORIAN_MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** Month token (Jan, May, september, etc.) → 0–11, or null */
function monthTokenToIndex0(token) {
  const raw = String(token || '').trim().toLowerCase().replace(/\./g, '')
  if (!raw) return null
  const abbr3 = raw.slice(0, 3)
  const byAbbr = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  }
  if (byAbbr[abbr3] !== undefined) return byAbbr[abbr3]
  const full = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  }
  if (full[raw] !== undefined) return full[raw]
  return null
}

function toValidDateOrNull(input) {
  if (input instanceof Date && !isNaN(input.getTime())) return input
  const parsed = parseBirthToDate(String(input ?? '').trim())
  if (parsed && !isNaN(parsed.getTime())) return parsed
  const fb = new Date(input)
  return isNaN(fb.getTime()) ? null : fb
}

function formatGregorianDayMonthYear(str, { commaAfterYear = false } = {}) {
  if (!str) return ''
  const raw = String(str).trim()
  const d = toValidDateOrNull(raw)
  if (!d) {
    if (/\/(undefined|null)\b/i.test(raw)) return '—'
    return String(str)
  }
  const core = `${d.getDate()} ${GREGORIAN_MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`
  return commaAfterYear ? `${core},` : core
}

/** Month-day-year order: "May 16 2026" or with trailing comma before the next word. */
function formatGregorianMonthDayYear(str, { commaAfterYear = false } = {}) {
  if (!str) return ''
  const raw = String(str).trim()
  const d = toValidDateOrNull(raw)
  if (!d) {
    if (/\/(undefined|null)\b/i.test(raw)) return commaAfterYear ? '—,' : '—'
    return String(str).trim()
  }
  const core = `${GREGORIAN_MONTHS_LONG[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`
  return commaAfterYear ? `${core},` : core
}

/**
 * Court decree certificates / prose: "May 16 2026," immediately before the next word (e.g. "… at Iligan").
 */
export function formatDateMonthDayYearComma(str) {
  return formatGregorianMonthDayYear(str, { commaAfterYear: true })
}

/**
 * Prose / flow text before another word: "15 May 2026," (comma after year).
 */
export function formatDateLong(str) {
  return formatGregorianDayMonthYear(str, { commaAfterYear: true })
}

/**
 * Header corner, table-only values, or end of clause before "." — "15 May 2026" (no comma).
 */
export function formatDateCert(str) {
  return formatGregorianDayMonthYear(str, { commaAfterYear: false })
}

/** Transmittal letter date line by itself (no trailing comma). */
export function formatTransmittalDateLong(str) {
  return formatGregorianDayMonthYear(str, { commaAfterYear: false })
}

/** Parse dd/mm/yyyy or dd/Mmm/yyyy (e.g. from legitimation form output) to Date (local), or null */
export function parseDdMmYyyyToDate(str) {
  if (!str || typeof str !== 'string') return null
  const p = str.trim().split('/')
  if (p.length !== 3) return null
  const dd = parseInt(p[0], 10)
  const yyyy = parseInt(p[2], 10)
  if (!Number.isFinite(dd) || !Number.isFinite(yyyy) || dd < 1 || dd > 31 || yyyy < 1000) return null

  const mid = String(p[1]).trim()
  const mmNum = parseInt(mid, 10)
  let month0 = null
  if (!Number.isNaN(mmNum) && mmNum >= 1 && mmNum <= 12) {
    month0 = mmNum - 1
  } else {
    const fromName = monthTokenToIndex0(mid)
    if (fromName === null) return null
    month0 = fromName
  }
  const d = new Date(yyyy, month0, dd)
  if (isNaN(d.getTime())) return null
  if (d.getFullYear() !== yyyy || d.getMonth() !== month0 || d.getDate() !== dd) return null
  return d
}

/** Full dd/mm/yyyy, mm/yyyy (1st of month), or ISO yyyy-mm-dd */
export function parseBirthToDate(str) {
  let t = String(str || '').trim()
  if (!t) return null
  /** Legacy bad saves: "14/undefined/2025" (string from `… + undefined + …`) or "14//2025". Recover as day/month 01/year for display. */
  const corrupt =
    t.match(/^(\d{1,2})\/(?:undefined|null)\/(\d{4})$/i) || t.match(/^(\d{1,2})\/\s*\/(\d{4})$/)
  if (corrupt) {
    const dd = corrupt[1].padStart(2, '0')
    const yyyy = corrupt[2]
    t = `${dd}/01/${yyyy}`
  }
  const full = parseDdMmYyyyToDate(t)
  if (full) return full
  const mmY = t.match(/^(\d{1,2})\/(\d{4})$/)
  if (mmY) {
    const mo = parseInt(mmY[1], 10)
    const y = parseInt(mmY[2], 10)
    if (mo >= 1 && mo <= 12 && y >= 1000 && y <= 9999) return new Date(y, mo - 1, 1)
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) {
    const d = new Date(t.slice(0, 10) + 'T12:00:00')
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

/** dd/mm/yyyy from a valid Date (local calendar). */
export function formatDateToDdMmYyyy(d) {
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) return ''
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

/** yyyy-mm-dd slice → dd/mm/yyyy */
export function isoYyyyMmDdToDdMmYyyy(iso) {
  if (!iso || typeof iso !== 'string') return ''
  const t = iso.trim().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return ''
  const [y, m, d] = t.split('-')
  return `${d}/${m}/${y}`
}

/**
 * Display string for a full-date form field: normalize ISO or dd/mm/yyyy to dd/mm/yyyy; otherwise return raw.
 */
export function formStoredFullDateToDdMmDisplay(str) {
  const t = String(str ?? '').trim()
  if (!t) return ''
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) {
    const d = new Date(t.slice(0, 10) + 'T12:00:00')
    if (!isNaN(d.getTime())) return formatDateToDdMmYyyy(d)
  }
  const d = parseBirthToDate(t)
  if (d && !isNaN(d.getTime())) return formatDateToDdMmYyyy(d)
  return t
}

/**
 * Parse flexible full calendar date to dd/mm/yyyy. Does not accept mm/yyyy-only.
 * Returns '' for empty, null if non-empty and unparsable, else dd/mm/yyyy.
 */
export function parseFlexibleFullDateToDdMmYyyy(str) {
  const t = String(str ?? '').trim()
  if (!t) return ''
  const ddm = parseDdMmYyyyToDate(t)
  if (ddm) return formatDateToDdMmYyyy(ddm)
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) {
    const d = new Date(t.slice(0, 10) + 'T12:00:00')
    if (!isNaN(d.getTime())) return formatDateToDdMmYyyy(d)
  }
  const monthFirst = t.match(/^([A-Za-zÀ-ÿ]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/i)
  if (monthFirst) {
    const m0 = monthTokenToIndex0(monthFirst[1])
    const day = parseInt(monthFirst[2], 10)
    const y = parseInt(monthFirst[3], 10)
    if (m0 != null && day >= 1 && day <= 31 && y >= 1000 && y <= 9999) {
      const d = new Date(y, m0, day)
      if (
        !isNaN(d.getTime()) &&
        d.getFullYear() === y &&
        d.getMonth() === m0 &&
        d.getDate() === day
      ) {
        return formatDateToDdMmYyyy(d)
      }
    }
  }
  const dayFirst = t.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})$/i)
  if (dayFirst) {
    const day = parseInt(dayFirst[1], 10)
    const m0 = monthTokenToIndex0(dayFirst[2])
    const y = parseInt(dayFirst[3], 10)
    if (m0 != null && day >= 1 && day <= 31 && y >= 1000 && y <= 9999) {
      const d = new Date(y, m0, day)
      if (
        !isNaN(d.getTime()) &&
        d.getFullYear() === y &&
        d.getMonth() === m0 &&
        d.getDate() === day
      ) {
        return formatDateToDdMmYyyy(d)
      }
    }
  }
  const dayFirstSep = t.match(/^(\d{1,2})(?:st|nd|rd|th)?\s*[-/.]\s*([A-Za-zÀ-ÿ]+)\s*[-/.]\s*(\d{4})$/i)
  if (dayFirstSep) {
    const day = parseInt(dayFirstSep[1], 10)
    const m0 = monthTokenToIndex0(dayFirstSep[2])
    const y = parseInt(dayFirstSep[3], 10)
    if (m0 != null && day >= 1 && day <= 31 && y >= 1000 && y <= 9999) {
      const d = new Date(y, m0, day)
      if (
        !isNaN(d.getTime()) &&
        d.getFullYear() === y &&
        d.getMonth() === m0 &&
        d.getDate() === day
      ) {
        return formatDateToDdMmYyyy(d)
      }
    }
  }
  return null
}

/**
 * Display string for birth-style stored value (dd/mm/yyyy, mm/yyyy, or ISO).
 */
export function storedBirthToDisplay(str) {
  const t = String(str ?? '').trim()
  if (!t) return ''
  const mmY = t.match(/^(\d{1,2})\/(\d{4})$/)
  if (mmY) {
    const mo = parseInt(mmY[1], 10)
    const y = parseInt(mmY[2], 10)
    if (mo >= 1 && mo <= 12 && y >= 1000 && y <= 9999) {
      return `${String(mo).padStart(2, '0')}/${y}`
    }
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) {
    const ddmm = isoYyyyMmDdToDdMmYyyy(t.slice(0, 10))
    if (ddmm) return ddmm
  }
  const full = parseDdMmYyyyToDate(t)
  if (full) return formatDateToDdMmYyyy(full)
  return t
}

/**
 * Birth-style field: full date → dd/mm/yyyy; month name or numeric + year → mm/yyyy; '' empty; null invalid.
 */
export function parseFlexibleBirthDateToStored(str) {
  const t = String(str ?? '').trim()
  if (!t) return ''
  const full = parseFlexibleFullDateToDdMmYyyy(t)
  if (full) return full
  const mmY = t.match(/^(\d{1,2})\/(\d{4})$/)
  if (mmY) {
    const mo = parseInt(mmY[1], 10)
    const y = parseInt(mmY[2], 10)
    if (mo >= 1 && mo <= 12 && y >= 1000 && y <= 9999) return `${String(mo).padStart(2, '0')}/${y}`
  }
  const my = t.match(/^([A-Za-zÀ-ÿ]+)\s+(\d{4})$/i)
  if (my) {
    const m0 = monthTokenToIndex0(my[1])
    const y = parseInt(my[2], 10)
    if (m0 != null && y >= 1000 && y <= 9999) return `${String(m0 + 1).padStart(2, '0')}/${y}`
  }
  return null
}

/**
 * Month field (1–12 or English / abbreviated month name) → '1'…'12'; '' if empty; null if invalid.
 */
export function parseFormMonthInputToNumber1to12(input) {
  const t = String(input ?? '').trim()
  if (!t) return ''
  const n = parseInt(t, 10)
  if (!Number.isNaN(n) && n >= 1 && n <= 12) return String(n)
  const ix = monthTokenToIndex0(t)
  if (ix != null) return String(ix + 1)
  return null
}

const LCR_REGISTRATION_MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** Days in month (1–12); invalid year/month fall back to 31 for max-day clamp while typing. */
export function daysInCalendarMonth(year, month1to12) {
  const y = Number(year)
  const m = Number(month1to12)
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) return 31
  return new Date(y, m, 0).getDate()
}

/** Parse stored registration date (ISO, dd/mm/yyyy, etc.) to { d, m, y } strings for numeric inputs. */
export function getRegistrationDmYFromRaw(str) {
  const d = parseBirthToDate(String(str || '').trim())
  if (!d || isNaN(d.getTime())) return { d: '', m: '', y: '' }
  return {
    d: String(d.getDate()),
    m: String(d.getMonth() + 1),
    y: String(d.getFullYear()),
  }
}

/** LCR “Date of registration” table line: "5 January 2004" (day number, full month word, year). */
export function formatLcrRegistrationWordMonth(str) {
  const d = parseBirthToDate(String(str || '').trim())
  if (!d || isNaN(d.getTime())) return ''
  return `${d.getDate()} ${LCR_REGISTRATION_MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * Build ISO yyyy-mm-dd from numeric day/month/year strings, or null if incomplete / invalid calendar date.
 */
export function tryIsoFromDmyStrings(dayStr, monthStr, yearStr) {
  const d = parseInt(String(dayStr || '').replace(/\D/g, ''), 10)
  const mRaw = String(monthStr || '').trim()
  let m = parseInt(mRaw.replace(/\D/g, ''), 10)
  if (!Number.isFinite(m) || m < 1 || m > 12) {
    const fromName = parseFormMonthInputToNumber1to12(mRaw)
    if (fromName === null || fromName === '') m = NaN
    else m = parseInt(fromName, 10)
  }
  const y = parseInt(String(yearStr || '').replace(/\D/g, ''), 10)
  if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(y)) return null
  if (m < 1 || m > 12 || y < 1000 || y > 9999 || d < 1) return null
  const maxD = daysInCalendarMonth(y, m)
  if (d > maxD) return null
  const test = new Date(y, m - 1, d)
  if (test.getFullYear() !== y || test.getMonth() !== m - 1 || test.getDate() !== d) return null
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** Full years between a birth date (ISO, dd/mm/yyyy, etc.) and a reference date (default: today). */
export function computeAgeFullYears(isoOrAnyDateStr, asOf = new Date()) {
  const d = parseBirthToDate(String(isoOrAnyDateStr || '').trim())
  if (!d || isNaN(d.getTime())) return null
  const ref = asOf instanceof Date && !isNaN(asOf.getTime()) ? asOf : new Date()
  let age = ref.getFullYear() - d.getFullYear()
  const refMd = ref.getMonth() * 100 + ref.getDate()
  const birthMd = d.getMonth() * 100 + d.getDate()
  if (refMd < birthMd) age -= 1
  return Math.max(0, age)
}

/** COLB-style DOB line for transmittal body: "16 MAY 1971". */
export function formatDobDayMonthYearUpper(str) {
  if (!str) return ''
  const d = parseBirthToDate(str)
  if (!d || isNaN(d.getTime())) return String(str).trim().toUpperCase()
  const months = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
  ]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export function fullName(first, middle, last) {
  return [first, middle, last].filter(Boolean).join(' ').trim() || ''
}

/** Trim each value, drop empties, join with ", " (e.g. AUSF place of birth on PDF). */
export function joinCommaParts(...parts) {
  return parts
    .map((p) => (p == null ? '' : String(p).trim()))
    .filter(Boolean)
    .join(', ')
}

/** Format for LCR Date of Registration: "APR 03 2023" */
export function formatDateReg(str) {
  if (!str) return ''
  const d = toValidDateOrNull(str)
  if (!d) return String(str)
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const day = String(d.getDate()).padStart(2, '0')
  const year = d.getFullYear()
  return `${months[d.getMonth()]} ${day} ${year}`
}

/** Format for LCR Date of Birth (short): "09-Mar-23" */
export function formatDateDobShort(str) {
  if (!str) return ''
  const d = toValidDateOrNull(str)
  if (!d) return String(str)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = String(d.getDate()).padStart(2, '0')
  const year = String(d.getFullYear()).slice(-2)
  return `${day}-${months[d.getMonth()]}-${year}`
}

/** LCR Form 1A table style: "18-Mar-02" from dd/mm/yyyy, dd/Mmm/yyyy, ISO, or Date */
export function formatLcrFormShortDate(str) {
  if (!str) return ''
  if (typeof str !== 'string') {
    const d = toValidDateOrNull(str)
    if (!d) return ''
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const day = String(d.getDate()).padStart(2, '0')
    return `${day}-${months[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`
  }
  const t = str.trim()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const parts = t.split('/')
  if (parts.length === 3) {
    const dd = parts[0].padStart(2, '0')
    const mid = String(parts[1]).trim()
    const mmNum = parseInt(mid, 10)
    const yyyy = String(parts[2]).trim()
    let mi1to12 = null
    if (!Number.isNaN(mmNum) && mmNum >= 1 && mmNum <= 12) {
      mi1to12 = mmNum
    } else {
      const idx0 = monthTokenToIndex0(mid)
      if (idx0 !== null) mi1to12 = idx0 + 1
    }
    if (mi1to12 != null) {
      const y = yyyy.length >= 4 ? yyyy.slice(-2) : yyyy.padStart(2, '0')
      return `${dd}-${months[mi1to12 - 1]}-${y}`
    }
  }
  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    const [, y, m, day] = iso
    const mi = parseInt(m, 10)
    if (mi >= 1 && mi <= 12) {
      return `${day}-${months[mi - 1]}-${y.slice(-2)}`
    }
  }
  const d = toValidDateOrNull(t)
  if (d) {
    const day = String(d.getDate()).padStart(2, '0')
    return `${day}-${months[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`
  }
  return t
}

/** Format for annotation acknowledgment: "MAY 7, 2025" */
export function formatDateAnnotation(str) {
  if (!str) return ''
  const d = toValidDateOrNull(str)
  if (!d) return String(str)
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
  const day = d.getDate()
  const year = d.getFullYear()
  return `${months[d.getMonth()]} ${day}, ${year}`
}

/**
 * Build default acknowledgment text: "Acknowledged by [Name] on [DATE] under Registry Number [No]. The child shall be known as [CHILD NAME] pursuant to R.A. 9255"
 */
export function buildDefaultAnnotationText(data) {
  if (!data) return ''
  const acknowledger = fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const ackDate = formatDateAnnotation(data.ackDateOfRegistration)
  const regNo = (data.ackRegistryNo || '').trim()
  const childAsKnown = fullName(data.childFirst, data.childMiddle, data.fatherLast) || fullName(data.childFirst, data.childMiddle, data.childLast)
  const childPart = childAsKnown ? `The child shall be known as ${childAsKnown.toUpperCase()} pursuant to R.A. 9255` : ''
  if (!acknowledger && !ackDate && !regNo && !childPart) return ''
  const parts = []
  if (acknowledger) parts.push(`Acknowledged by ${acknowledger}`)
  if (ackDate) parts.push(`on ${ackDate}`)
  if (regNo) parts.push(`under Registry Number ${regNo}`)
  const first = parts.length ? `${parts.join(' ')}. ` : ''
  return first + (childPart ? `"${childPart}"` : '')
}

/** Format for COLB: "29", "APRIL", "2017" or full "29 APRIL 2017" */
export function formatDateCOLB(str) {
  if (!str) return { day: '', month: '', year: '', full: '' }
  const d = toValidDateOrNull(str)
  if (!d) return { day: '', month: '', year: '', full: '' }
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
  const day = String(d.getDate()).padStart(2, '0')
  const month = months[d.getMonth()]
  const year = String(d.getFullYear())
  return { day, month, year, full: `${day} ${month} ${year}` }
}

/** Non-empty lines from a textarea (To/Thru titles, office block). */
export function splitFieldLines(value) {
  return String(value || '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Default LCR “Verified by” title on printed LCR forms. */
export const DEFAULT_LCRO_STAFF_TITLE = 'LCRO Staff'

const KNOWN_SIGNATORY_TITLES = {
  'city civil registrar': 'City Civil Registrar',
  'registration officer i': 'Registration Officer I',
  'registration officer ii': 'Registration Officer II',
  'registration officer iii': 'Registration Officer III',
  'registration officer iv': 'Registration Officer IV',
  'lcro staff': 'LCRO Staff',
}

/** Job titles in print/output: title case (not ALL CAPS). Names are unchanged. */
export function formatSignatoryTitleForDisplay(title) {
  const s = normalizeLcroStaffTitle(title)
  if (!s) return s
  const known = KNOWN_SIGNATORY_TITLES[s.toLowerCase()]
  if (known) return known
  const letters = s.replace(/[^A-Za-z]/g, '')
  if (letters && s === s.toUpperCase()) {
    return s
      .split(/\s+/)
      .map((word) => {
        const core = word.replace(/[,.'"]/g, '')
        if (/^(I{1,3}|IV|VI{0,3}|IX|X{0,3}|XI{0,3})$/i.test(core)) return word.toUpperCase()
        if (word.toUpperCase() === 'LCRO') return 'LCRO'
        if (word.toUpperCase() === 'REB') return word
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      })
      .join(' ')
  }
  return s
}

/** Strip hyphen from legacy “LCRO - Staff” titles (print + forms). */
export function normalizeLcroStaffTitle(title) {
  const s = String(title ?? '').trim()
  if (!s) return s
  return s.replace(/\bLCRO\s*-\s*Staff\b/gi, 'LCRO Staff')
}

export function lcroStaffTitleForPrint(title) {
  return formatSignatoryTitleForDisplay(normalizeLcroStaffTitle(title)) || DEFAULT_LCRO_STAFF_TITLE
}

/** Split remark text into segments for bold+underline rendering of known values. */
export function splitTextForBoldUnderline(text, boldParts = []) {
  const t = String(text ?? '')
  if (!t) return [{ bold: false, text: '—' }]
  const parts = [...new Set(boldParts.map((s) => String(s ?? '').trim()).filter(Boolean))]
    .sort((a, b) => b.length - a.length)
  if (parts.length === 0) return [{ bold: false, text: t }]
  const escaped = parts.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const re = new RegExp(`(${escaped.join('|')})`, 'g')
  return t.split(re).filter((seg) => seg.length > 0).map((seg) => ({
    bold: parts.includes(seg),
    text: seg,
  }))
}
