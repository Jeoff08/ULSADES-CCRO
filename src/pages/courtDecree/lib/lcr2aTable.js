import { fullName, formatLcrFormShortDate, formatDateLong, formatLcrRegistrationWordMonth, tryIsoFromDmyStrings } from '../../../lib/printUtils'
import {
  LCR_REGISTRATION_DAY_UI,
  LCR_REGISTRATION_MONTH_UI,
  LCR_REGISTRATION_YEAR_UI,
  LCR_2A_DEATH_DAY_UI,
  LCR_2A_DEATH_MONTH_UI,
  LCR_2A_DEATH_YEAR_UI,
} from '../../../lib/lcrRegistrationUiKeys'

function orDash(a, b) {
  const x = String(a || '').trim()
  if (x) return x
  const y = String(b || '').trim()
  return y || '—'
}

/** Build row values for LCR Form 2A death table (court decree). */
export function buildLcr2aTableDisplay(data) {
  if (!data || typeof data !== 'object') data = {}
  const deceased = fullName(data.deceasedParentFirst, data.deceasedParentMiddle, data.deceasedParentLast).trim()
  const name = orDash(data.lcr2aNameDeceased, orDash(data.documentOwnerName, deceased))
  const isoUi = tryIsoFromDmyStrings(
    data.lcrRegistrationDayUi,
    data.lcrRegistrationMonthUi,
    data.lcrRegistrationYearUi
  )
  const regStored = data.lcr2aDateRegistration || data.colbRegDate || data.colbDateOfRegistration
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
  const deathIsoUi = tryIsoFromDmyStrings(
    data[LCR_2A_DEATH_DAY_UI],
    data[LCR_2A_DEATH_MONTH_UI],
    data[LCR_2A_DEATH_YEAR_UI]
  )
  const deathStored = data.lcr2aDateDeath || data.dateOfDeath || ''
  const deathRaw = deathIsoUi || deathStored
  const ddu = String(data[LCR_2A_DEATH_DAY_UI] ?? '').trim()
  const dmu = String(data[LCR_2A_DEATH_MONTH_UI] ?? '').trim()
  const dyu = String(data[LCR_2A_DEATH_YEAR_UI] ?? '').trim()
  let deathDate
  if (deathRaw) {
    deathDate =
      formatLcrRegistrationWordMonth(String(deathRaw)) ||
      formatLcrFormShortDate(deathRaw) ||
      (deathRaw ? formatDateLong(deathRaw) : '') ||
      '—'
  } else if (ddu || dmu || dyu) {
    deathDate = [ddu || '—', dmu || '—', dyu || '—'].join(' / ')
  } else {
    deathDate = '—'
  }
  const up = (s) => (s === '—' ? '—' : String(s).toUpperCase())

  return {
    registry: up(orDash(data.lcr2aRegistryNumber, data.colbRegistryNo)),
    dateRegistration: regDate,
    nameDeceased: up(name),
    sex: up(orDash(data.lcr2aSex, data.sex)),
    civilStatus: up(orDash(data.lcr2aCivilStatus, data.civilStatus, data.husbandCivilStatus)),
    citizenship: up(orDash(data.lcr2aCitizenship, data.citizenship, data.motherCitizenship)),
    dateDeath: deathDate,
    citizenshipFather: up(orDash(data.lcr2aCitizenshipFather, data.citizenshipOfFather, data.fatherCitizenship)),
    placeDeath: up(orDash(data.lcr2aPlaceDeath, data.placeOfDeath, data.courtThatIssued)),
    causeOfDeath: String(data.lcr2aCauseDeath || data.causeOfDeath || '').trim() || '—',
  }
}
