import { fullName, formatLcrFormShortDate, formatLcrRegistrationWordMonth, tryIsoFromDmyStrings } from '../../../lib/printUtils'
import {
  LCR_REGISTRATION_DAY_UI,
  LCR_REGISTRATION_MONTH_UI,
  LCR_REGISTRATION_YEAR_UI,
  LCR_1A_DOB_DAY_UI,
  LCR_1A_DOB_MONTH_UI,
  LCR_1A_DOB_YEAR_UI,
  LCR_1A_DOM_DAY_UI,
  LCR_1A_DOM_MONTH_UI,
  LCR_1A_DOM_YEAR_UI,
} from '../../../lib/lcrRegistrationUiKeys'

function tripletWordOrPartial(data, dayKey, monthKey, yearKey, storedFallback) {
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
      String(source).trim() ||
      '—'
    )
  }
  if (du || mu || yu) return [du || '—', mu || '—', yu || '—'].join(' / ')
  return '—'
}

/** Build display row values for LCR Form 1A table-only (court decree). */
export function buildLcr1aTableDisplay(data) {
  if (!data || typeof data !== 'object') data = {}
  const registry = String(data.lcr1aRegistryNumber ?? data.colbRegistryNo ?? data.registryNumber ?? '').trim()
  const dateReg = tripletWordOrPartial(
    data,
    LCR_REGISTRATION_DAY_UI,
    LCR_REGISTRATION_MONTH_UI,
    LCR_REGISTRATION_YEAR_UI,
    data.lcr1aDateRegistration || data.colbRegDate || ''
  )
  const nameChild = String(
    data.lcr1aNameOfChild || fullName(data.childFirst, data.childMiddle, data.childLast) || ''
  ).trim()
  const sex = String(data.lcr1aSex || data.sex || '').trim()
  const dob = tripletWordOrPartial(
    data,
    LCR_1A_DOB_DAY_UI,
    LCR_1A_DOB_MONTH_UI,
    LCR_1A_DOB_YEAR_UI,
    data.lcr1aDateOfBirth || data.dateOfBirth || ''
  )
  const pob = String(
    data.lcr1aPlaceOfBirth
      || [data.placeOfBirthStreet, data.placeOfBirthCity, data.placeOfBirthProvince].filter(Boolean).join(' ').trim()
      || ''
  ).trim()
  const mother = String(
    data.lcr1aNameOfMother || fullName(data.motherFirst, data.motherMiddle, data.motherLast) || ''
  ).trim()
  const motherCit = String(data.lcr1aMotherCitizenship ?? data.motherCitizenship ?? '').trim()
  const father = String(
    data.lcr1aNameOfFather || fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast) || ''
  ).trim()
  const fatherCit = String(data.lcr1aFatherCitizenship ?? data.fatherCitizenship ?? '').trim()
  const dom = tripletWordOrPartial(
    data,
    LCR_1A_DOM_DAY_UI,
    LCR_1A_DOM_MONTH_UI,
    LCR_1A_DOM_YEAR_UI,
    data.lcr1aDateMarriageParents || data.dateOfMarriage || ''
  )
  const pom = String(data.lcr1aPlaceMarriageParents || data.placeOfMarriageOfParents || '').trim()

  return {
    registry,
    dateReg,
    nameChild: nameChild || '—',
    sex: sex || '—',
    dob,
    pob: pob || '—',
    mother: mother || '—',
    motherCit: motherCit || '—',
    father: father || '—',
    fatherCit: fatherCit || '—',
    dom,
    pom: pom || '—',
  }
}
