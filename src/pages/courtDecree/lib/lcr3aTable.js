import {
  fullName,
  formatLcrFormShortDate,
  formatDateLong,
  parseDdMmYyyyToDate,
  formatLcrRegistrationWordMonth,
  tryIsoFromDmyStrings,
  computeAgeFullYears,
} from '../../../lib/printUtils'
import {
  LCR_REGISTRATION_DAY_UI,
  LCR_REGISTRATION_MONTH_UI,
  LCR_REGISTRATION_YEAR_UI,
  LCR_3A_HUSBAND_DOB_DAY_UI,
  LCR_3A_HUSBAND_DOB_MONTH_UI,
  LCR_3A_HUSBAND_DOB_YEAR_UI,
  LCR_3A_WIFE_DOB_DAY_UI,
  LCR_3A_WIFE_DOB_MONTH_UI,
  LCR_3A_WIFE_DOB_YEAR_UI,
  LCR_3A_MARRIAGE_DAY_UI,
  LCR_3A_MARRIAGE_MONTH_UI,
  LCR_3A_MARRIAGE_YEAR_UI,
} from '../../../lib/lcrRegistrationUiKeys'

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

function tripletWordOrPartial3a(data, dayKey, monthKey, yearKey, storedFallback) {
  const isoUi = tryIsoFromDmyStrings(data[dayKey], data[monthKey], data[yearKey])
  const stored = String(storedFallback ?? '').trim()
  const source = isoUi || stored
  const du = String(data[dayKey] ?? '').trim()
  const mu = String(data[monthKey] ?? '').trim()
  const yu = String(data[yearKey] ?? '').trim()
  if (source) {
    return (
      formatLcrRegistrationWordMonth(String(source)) ||
      formatLcrFormShortDate(String(source)) ||
      (source ? formatDateLong(source) : '') ||
      '—'
    )
  }
  if (du || mu || yu) return [du || '—', mu || '—', yu || '—'].join(' / ')
  return '—'
}

/** Husband/wife “Date of Birth / Age” line with auto age from full date when age blank. */
function dobAgeReadable(data, who) {
  const isH = who === 'husband'
  const dk = isH ? LCR_3A_HUSBAND_DOB_DAY_UI : LCR_3A_WIFE_DOB_DAY_UI
  const mk = isH ? LCR_3A_HUSBAND_DOB_MONTH_UI : LCR_3A_WIFE_DOB_MONTH_UI
  const yk = isH ? LCR_3A_HUSBAND_DOB_YEAR_UI : LCR_3A_WIFE_DOB_YEAR_UI
  const du = String(data[dk] ?? '').trim()
  const mu = String(data[mk] ?? '').trim()
  const yu = String(data[yk] ?? '').trim()
  const isoUi = tryIsoFromDmyStrings(data[dk], data[mk], data[yk])
  if ((du || mu || yu) && !isoUi) {
    return [du || '—', mu || '—', yu || '—'].join(' / ')
  }
  const dateStr = String(isoUi || (isH ? data.husbandDateOfBirth : data.wifeDateOfBirth) || '').trim()
  const ageStored = String((isH ? data.husbandAge : data.wifeAge) || '').trim()
  const autoAge = dateStr ? computeAgeFullYears(dateStr) : null
  const ageEff = ageStored || (autoAge != null ? String(autoAge) : '')
  const long = dateStr ? formatBirthLong(dateStr) : ''
  if (long && ageEff) return `${long} (Age: ${ageEff})`
  if (long) return long
  if (ageEff) return `(Age: ${ageEff})`
  return ''
}

/** Build row values for LCR Form 3A marriage table (court decree). */
export function buildLcr3aTableDisplay(data) {
  if (!data || typeof data !== 'object') data = {}
  const or = (a, b) => (String(a || '').trim() || String(b || '').trim() || '—').trim() || '—'
  const up = (s) => (s === '—' ? '—' : String(s).toUpperCase())

  const husbandName = or(data.lcr3aHusbandName, fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast))
  const wifeName = or(data.lcr3aWifeName, fullName(data.motherFirst, data.motherMiddle, data.motherLast))
  const hRead = dobAgeReadable(data, 'husband')
  const wRead = dobAgeReadable(data, 'wife')
  const hDob = hRead || String(data.lcr3aHusbandDobAge || '').trim() || fallbackDobAge(data, 'husband') || '—'
  const wDob = wRead || String(data.lcr3aWifeDobAge || '').trim() || fallbackDobAge(data, 'wife') || '—'
  const hCit = or(data.lcr3aHusbandCitizenship, data.fatherCitizenship)
  const wCit = or(data.lcr3aWifeCitizenship, data.motherCitizenship)
  const hCv = or(data.lcr3aHusbandCivilStatus, data.husbandCivilStatus)
  const wCv = or(data.lcr3aWifeCivilStatus, data.wifeCivilStatus)
  const hMo = or(data.lcr3aHusbandMother, data.husbandMotherName)
  const wMo = or(data.lcr3aWifeMother, data.wifeMotherName)
  const hFa = or(data.lcr3aHusbandFather, data.husbandFatherName)
  const wFa = or(data.lcr3aWifeFather, data.wifeFatherName)
  const reg = or(data.lcr3aRegistryNumber, data.marriageRegistryNo)
  const isoUi = tryIsoFromDmyStrings(
    data.lcrRegistrationDayUi,
    data.lcrRegistrationMonthUi,
    data.lcrRegistrationYearUi
  )
  const regStored = data.lcr3aDateRegistration || data.marriageDateOfRegistration || data.colbRegDate
  const regRaw = isoUi || regStored
  const du = String(data.lcrRegistrationDayUi ?? '').trim()
  const mu = String(data.lcrRegistrationMonthUi ?? '').trim()
  const yu = String(data.lcrRegistrationYearUi ?? '').trim()
  let regDate
  if (regRaw) {
    const regWord = formatLcrRegistrationWordMonth(regRaw)
    regDate = regWord || formatLcrFormShortDate(regRaw) || (regRaw ? formatDateLong(regRaw) : '') || '—'
  } else if (du || mu || yu) {
    regDate = [du || '—', mu || '—', yu || '—'].join(' / ')
  } else {
    regDate = '—'
  }
  const dom = tripletWordOrPartial3a(
    data,
    LCR_3A_MARRIAGE_DAY_UI,
    LCR_3A_MARRIAGE_MONTH_UI,
    LCR_3A_MARRIAGE_YEAR_UI,
    data.lcr3aDateMarriage || data.dateOfMarriage || ''
  )
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
