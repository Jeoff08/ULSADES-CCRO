/**
 * Build automatic REMARKS text for LCR Forms 1A, 2A, 3A in the format:
 * "Pursuant to the decision of the Court dated [date] rendered by [judge] of the [court], under [case], [Certificate] is hereby corrected and changed the following entries: [entries]."
 */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** Parse dd/mm/yyyy or ISO date and return "July 15, 2024" style. */
function formatCourtDate(str) {
  if (!str || typeof str !== 'string') return ''
  const trimmed = str.trim()
  const parts = trimmed.split('/')
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts.map((p) => parseInt(p, 10))
    if (dd >= 1 && dd <= 31 && mm >= 1 && mm <= 12 && yyyy > 0) {
      return `${MONTHS[mm - 1]} ${String(dd).padStart(2, '0')}, ${yyyy}`
    }
  }
  const d = new Date(trimmed)
  if (!isNaN(d.getTime())) {
    return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`
  }
  return trimmed
}

function q(s) {
  return s ? `"${s}"` : ''
}

/**
 * @param {Object} court - Court decree data: dateIssued, issuedByName, courtThatIssued, typeOfCase, caseNo
 * @param {Object} leg - Legitimation (or document owner) data
 * @param {'BIRTH'|'DEATH'|'MARRIAGE'} formType
 * @returns {string}
 */
export function buildLcrRemarks(court, leg, formType) {
  const dateStr = formatCourtDate(court?.dateIssued || '')
  const judge = (court?.issuedByName || '').trim()
  const courtName = (court?.courtThatIssued || '').trim()
  const typeOfCase = (court?.typeOfCase || 'S.P. Case No.').trim()
  const caseNo = (court?.caseNo || '').trim()
  const caseRef = [typeOfCase, caseNo].filter(Boolean).join(' ').trim() || 'Case No.'

  const certNames = {
    BIRTH: 'Certificate of Live Birth',
    DEATH: 'Certificate of Death',
    MARRIAGE: 'Certificate of Marriage',
  }
  const certName = certNames[formType] || 'Certificate'

  const preamble = `Pursuant to the decision of the Court dated ${dateStr} rendered by ${judge} of the ${courtName}, under ${caseRef}, ${certName} is hereby corrected and changed the following entries:`
  const entries = []

  if (formType === 'BIRTH' && leg) {
    const c1 = (leg.childFirst || '').trim()
    const c2 = (leg.childMiddle || '').trim()
    const c3 = (leg.childLast || '').trim()
    if (c1) entries.push(`in Item No. 1 as to the first name as ${q(c1)}`)
    if (c2) entries.push(`in Item No. 1 as to the middle name as ${q(c2)}`)
    if (c3) entries.push(`in Item No. 1 as to the last name as ${q(c3)}`)
    const m1 = (leg.motherFirst || '').trim()
    const m2 = (leg.motherMiddle || '').trim()
    const m3 = (leg.motherLast || '').trim()
    if (m1) entries.push(`in Item No. 11 as to the first name of the mother as ${q(m1)}`)
    if (m2) entries.push(`in Item No. 11 as to the middle name of the mother as ${q(m2)}`)
    if (m3) entries.push(`in Item No. 11 as to the last name of the mother as ${q(m3)}`)
    const f1 = (leg.fatherFirst || '').trim()
    const f2 = (leg.fatherMiddle || '').trim()
    const f3 = (leg.fatherLast || '').trim()
    if (f1) entries.push(`in Item No. 12 as to the first name of the father as ${q(f1)}`)
    if (f2) entries.push(`in Item No. 12 as to the middle name of the father as ${q(f2)}`)
    if (f3) entries.push(`in Item No. 12 as to the last name of the father as ${q(f3)}`)
  }

  if (formType === 'DEATH' && leg) {
    const name = [leg.deceasedParentFirst, leg.deceasedParentMiddle, leg.deceasedParentLast].filter(Boolean).join(' ').trim()
    if (name) entries.push(`in Item No. 1 as to the name of the deceased as ${q(name)}`)
    if (leg.dateOfDeath) entries.push(`in Item No. 2 as to the date of death as ${q(formatCourtDate(leg.dateOfDeath))}`)
  }

  if (formType === 'MARRIAGE' && leg) {
    const husband = [leg.fatherFirst, leg.fatherMiddle, leg.fatherLast].filter(Boolean).join(' ').trim()
    const wife = [leg.motherFirst, leg.motherMiddle, leg.motherLast].filter(Boolean).join(' ').trim()
    if (husband) entries.push(`in Item No. 1 as to the name of the husband as ${q(husband)}`)
    if (wife) entries.push(`in Item No. 1 as to the name of the wife as ${q(wife)}`)
    if (leg.dateOfMarriage) entries.push(`in Item No. 2 as to the date of marriage as ${q(formatCourtDate(leg.dateOfMarriage))}`)
    const place = [leg.placeOfMarriageCity, leg.placeOfMarriageProvince, leg.placeOfMarriageCountry].filter(Boolean).join(', ').trim()
    if (place) entries.push(`in Item No. 3 as to the place of marriage as ${q(place)}`)
  }

  const entriesStr = entries.length ? entries.join(', ') + '.' : ''
  const out = [preamble, entriesStr].filter(Boolean).join(' ')
  return out.trim()
}
