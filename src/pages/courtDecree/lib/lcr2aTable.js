import { fullName, formatLcrFormShortDate, formatDateLong } from '../../../lib/printUtils'

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
  const regRaw = data.lcr2aDateRegistration || data.colbRegDate || data.colbDateOfRegistration
  const deathRaw = data.lcr2aDateDeath || data.dateOfDeath
  const regDate = formatLcrFormShortDate(regRaw) || (regRaw ? formatDateLong(regRaw) : '') || '—'
  const deathDate = formatLcrFormShortDate(deathRaw) || (deathRaw ? formatDateLong(deathRaw) : '') || '—'
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
