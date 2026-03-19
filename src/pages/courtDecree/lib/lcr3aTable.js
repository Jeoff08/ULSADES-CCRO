import { fullName, formatLcrFormShortDate, formatDateLong, parseDdMmYyyyToDate } from '../../../lib/printUtils'

const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** Birth display: full date, ISO, or mm/yyyy only */
function formatBirthLong(dStr) {
  const t = String(dStr || '').trim()
  if (!t) return ''
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) return formatDateLong(t.slice(0, 10))
  const parsed = parseDdMmYyyyToDate(t)
  if (parsed && !isNaN(parsed.getTime())) {
    const iso = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
    return formatDateLong(iso)
  }
  const mmY = t.match(/^(\d{1,2})\/(\d{4})$/)
  if (mmY) {
    const mo = parseInt(mmY[1], 10)
    const y = parseInt(mmY[2], 10)
    if (mo >= 1 && mo <= 12 && y >= 1000 && y <= 9999) return `${MONTHS_LONG[mo - 1]} ${y}`
  }
  return ''
}

/** ISO, dd/mm/yyyy, mm/yyyy + optional age → printed line */
function formatDobAgeLine(dateVal, ageVal) {
  const long = formatBirthLong(dateVal)
  if (!long) return ''
  const a = String(ageVal || '').trim()
  if (a) return `${long} (Age: ${a})`
  return long
}

function fallbackDobAge(data, who) {
  if (who === 'husband') {
    const d = data.husbandDateOfBirth
    const a = data.husbandAge
    const long = formatBirthLong(d)
    if (long && a) return `${long} (Age: ${a})`
    if (long) return long
    if (a) return `(Age: ${a})`
    return ''
  }
  const d = data.wifeDateOfBirth
  const a = data.wifeAge
  const long = formatBirthLong(d)
  if (long && a) return `${long} (Age: ${a})`
  if (long) return long
  if (a) return `(Age: ${a})`
  return ''
}

/** Build row values for LCR Form 3A marriage table (court decree). */
export function buildLcr3aTableDisplay(data) {
  if (!data || typeof data !== 'object') data = {}
  const or = (a, b) => (String(a || '').trim() || String(b || '').trim() || '—').trim() || '—'
  const up = (s) => (s === '—' ? '—' : String(s).toUpperCase())

  const husbandName = or(data.lcr3aHusbandName, fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast))
  const wifeName = or(data.lcr3aWifeName, fullName(data.motherFirst, data.motherMiddle, data.motherLast))
  const hStructured = formatDobAgeLine(data.husbandDateOfBirth, data.husbandAge)
  const wStructured = formatDobAgeLine(data.wifeDateOfBirth, data.wifeAge)
  const hDob =
    hStructured || String(data.lcr3aHusbandDobAge || '').trim() || fallbackDobAge(data, 'husband') || '—'
  const wDob =
    wStructured || String(data.lcr3aWifeDobAge || '').trim() || fallbackDobAge(data, 'wife') || '—'
  const hCit = or(data.lcr3aHusbandCitizenship, data.fatherCitizenship)
  const wCit = or(data.lcr3aWifeCitizenship, data.motherCitizenship)
  const hCv = or(data.lcr3aHusbandCivilStatus, data.husbandCivilStatus)
  const wCv = or(data.lcr3aWifeCivilStatus, data.wifeCivilStatus)
  const hMo = or(data.lcr3aHusbandMother, data.husbandMotherName)
  const wMo = or(data.lcr3aWifeMother, data.wifeMotherName)
  const hFa = or(data.lcr3aHusbandFather, data.husbandFatherName)
  const wFa = or(data.lcr3aWifeFather, data.wifeFatherName)
  const reg = or(data.lcr3aRegistryNumber, data.marriageRegistryNo)
  const regRaw = data.lcr3aDateRegistration || data.marriageDateOfRegistration || data.colbRegDate
  const domRaw = data.lcr3aDateMarriage || data.dateOfMarriage
  const regDate = formatLcrFormShortDate(regRaw) || (regRaw ? formatDateLong(regRaw) : '') || '—'
  const dom = formatLcrFormShortDate(domRaw) || (domRaw ? formatDateLong(domRaw) : '') || '—'
  const pom = String(
    data.lcr3aPlaceMarriage
      || [data.placeOfMarriageCity, data.placeOfMarriageProvince, data.placeOfMarriageCountry].filter(Boolean).join(', ')
      || ''
  ).trim() || '—'

  return {
    husbandName: up(husbandName),
    wifeName: up(wifeName),
    husbandDobAge: hDob === '—' ? '—' : String(hDob).toUpperCase(),
    wifeDobAge: wDob === '—' ? '—' : String(wDob).toUpperCase(),
    husbandCitizenship: up(hCit),
    wifeCitizenship: up(wCit),
    husbandCivilStatus: up(hCv),
    wifeCivilStatus: up(wCv),
    husbandMother: up(hMo),
    wifeMother: up(wMo),
    husbandFather: up(hFa),
    wifeFather: up(wFa),
    registry: reg === '—' ? '—' : String(reg).toUpperCase(),
    dateRegistration: regDate,
    dateMarriage: dom,
    placeMarriage: pom === '—' ? '—' : pom.toUpperCase(),
  }
}
