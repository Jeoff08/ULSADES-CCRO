/** Format for affidavit body: "January 05, 2022" */
export function formatDateLong(str) {
  if (!str) return ''
  const d = new Date(str)
  if (isNaN(d.getTime())) return str
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const day = d.getDate()
  const year = d.getFullYear()
  return `${months[d.getMonth()]} ${String(day).padStart(2, '0')}, ${year}`
}

/** Parse dd/mm/yyyy to Date (local), or null */
export function parseDdMmYyyyToDate(str) {
  if (!str || typeof str !== 'string') return null
  const p = str.trim().split('/')
  if (p.length !== 3) return null
  const dd = parseInt(p[0], 10)
  const mm = parseInt(p[1], 10)
  const yyyy = parseInt(p[2], 10)
  if (dd < 1 || dd > 31 || mm < 1 || mm > 12 || yyyy < 1000) return null
  const d = new Date(yyyy, mm - 1, dd)
  return isNaN(d.getTime()) ? null : d
}

/** Full dd/mm/yyyy, mm/yyyy (1st of month), or ISO yyyy-mm-dd */
export function parseBirthToDate(str) {
  const t = String(str || '').trim()
  if (!t) return null
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
  const m = parseInt(String(monthStr || '').replace(/\D/g, ''), 10)
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

/** Format for certificate: "04 March, 2026" */
export function formatDateCert(str) {
  if (!str) return ''
  const parsed = parseDdMmYyyyToDate(str)
  const d = parsed || new Date(str)
  if (isNaN(d.getTime())) return str
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const day = String(d.getDate()).padStart(2, '0')
  const year = d.getFullYear()
  return `${day} ${months[d.getMonth()]}, ${year}`
}

/** Transmittal letter date line: "13 April 2026" (no leading zero on day, no comma). */
export function formatTransmittalDateLong(str) {
  if (!str) return ''
  const d = parseBirthToDate(str)
  if (!d || isNaN(d.getTime())) return String(str)
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
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
  const d = new Date(str)
  if (isNaN(d.getTime())) return str
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const day = String(d.getDate()).padStart(2, '0')
  const year = d.getFullYear()
  return `${months[d.getMonth()]} ${day} ${year}`
}

/** Format for LCR Date of Birth (short): "09-Mar-23" */
export function formatDateDobShort(str) {
  if (!str) return ''
  const d = new Date(str)
  if (isNaN(d.getTime())) return str
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = String(d.getDate()).padStart(2, '0')
  const year = String(d.getFullYear()).slice(-2)
  return `${day}-${months[d.getMonth()]}-${year}`
}

/** LCR Form 1A table style: "18-Mar-02" from dd/mm/yyyy, ISO, or Date */
export function formatLcrFormShortDate(str) {
  if (!str || typeof str !== 'string') return ''
  const t = str.trim()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const parts = t.split('/')
  if (parts.length === 3) {
    const dd = parts[0].padStart(2, '0')
    const mm = parseInt(parts[1], 10)
    const yyyy = String(parts[2]).trim()
    if (mm >= 1 && mm <= 12) {
      const y = yyyy.length >= 4 ? yyyy.slice(-2) : yyyy.padStart(2, '0')
      return `${dd}-${months[mm - 1]}-${y}`
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
  const d = new Date(t)
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0')
    return `${day}-${months[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`
  }
  return t
}

/** Format for annotation acknowledgment: "MAY 7, 2025" */
export function formatDateAnnotation(str) {
  if (!str) return ''
  const d = new Date(str)
  if (isNaN(d.getTime())) return str
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
  const d = new Date(str)
  if (isNaN(d.getTime())) return { day: '', month: '', year: '', full: '' }
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
