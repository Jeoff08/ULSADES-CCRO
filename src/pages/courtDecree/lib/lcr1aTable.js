import { fullName, formatLcrFormShortDate } from '../../../lib/printUtils'

/** Build display row values for LCR Form 1A table-only (court decree). */
export function buildLcr1aTableDisplay(data) {
  if (!data || typeof data !== 'object') data = {}
  const registry = String(data.lcr1aRegistryNumber ?? data.colbRegistryNo ?? data.registryNumber ?? '').trim()
  const dateReg = data.lcr1aDateRegistration || data.colbRegDate || ''
  const nameChild = String(
    data.lcr1aNameOfChild || fullName(data.childFirst, data.childMiddle, data.childLast) || ''
  ).trim()
  const sex = String(data.lcr1aSex || data.sex || '').trim()
  const dob = data.lcr1aDateOfBirth || data.dateOfBirth || ''
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
  const dom = data.lcr1aDateMarriageParents || data.dateOfMarriage || ''
  const pom = String(data.lcr1aPlaceMarriageParents || data.placeOfMarriageOfParents || '').trim()

  return {
    registry,
    dateReg: formatLcrFormShortDate(dateReg) || dateReg || '—',
    nameChild: nameChild || '—',
    sex: sex || '—',
    dob: formatLcrFormShortDate(dob) || dob || '—',
    pob: pob || '—',
    mother: mother || '—',
    motherCit: motherCit || '—',
    father: father || '—',
    fatherCit: fatherCit || '—',
    dom: formatLcrFormShortDate(dom) || dom || '—',
    pom: pom || '—',
  }
}
