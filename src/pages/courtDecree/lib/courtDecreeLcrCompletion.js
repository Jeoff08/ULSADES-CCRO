import { parseBirthToDate } from '../../../lib/printUtils'

function empty(v) {
  return v == null || String(v).trim() === ''
}

const KEYS_1A = [
  'lcr1aRegistryNumber',
  'lcr1aDateRegistration',
  'lcr1aNameOfChild',
  'lcr1aSex',
  'lcr1aDateOfBirth',
  'lcr1aPlaceOfBirth',
  'lcr1aNameOfMother',
  'lcr1aMotherCitizenship',
  'lcr1aNameOfFather',
  'lcr1aFatherCitizenship',
  'lcr1aDateMarriageParents',
  'lcr1aPlaceMarriageParents',
]

const KEYS_2A = [
  'lcr2aRegistryNumber',
  'lcr2aDateRegistration',
  'lcr2aNameDeceased',
  'lcr2aSex',
  'lcr2aCivilStatus',
  'lcr2aCitizenship',
  'lcr2aDateDeath',
  'lcr2aCitizenshipFather',
  'lcr2aPlaceDeath',
  'lcr2aCauseDeath',
]

const KEYS_3A = [
  'lcr3aHusbandName',
  'lcr3aHusbandCitizenship',
  'lcr3aHusbandCivilStatus',
  'lcr3aHusbandMother',
  'lcr3aHusbandFather',
  'lcr3aWifeName',
  'lcr3aWifeCitizenship',
  'lcr3aWifeCivilStatus',
  'lcr3aWifeMother',
  'lcr3aWifeFather',
  'lcr3aRegistryNumber',
  'lcr3aDateRegistration',
  'lcr3aDateMarriage',
  'lcr3aPlaceMarriage',
]

export function isLcr1aTableComplete(form) {
  if (!form || typeof form !== 'object') return false
  return KEYS_1A.every((k) => !empty(form[k]))
}

export function isLcr2aTableComplete(form) {
  if (!form || typeof form !== 'object') return false
  return KEYS_2A.every((k) => !empty(form[k]))
}

function hasDobAge(form, who) {
  if (who === 'husband') {
    if (!empty(form.lcr3aHusbandDobAge)) return true
    return parseBirthToDate(form.husbandDateOfBirth) != null
  }
  if (!empty(form.lcr3aWifeDobAge)) return true
  return parseBirthToDate(form.wifeDateOfBirth) != null
}

export function isLcr3aTableComplete(form) {
  if (!form || typeof form !== 'object') return false
  if (!KEYS_3A.every((k) => !empty(form[k]))) return false
  return hasDobAge(form, 'husband') && hasDobAge(form, 'wife')
}
