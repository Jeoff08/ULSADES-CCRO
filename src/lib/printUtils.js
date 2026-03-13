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

/** Format for certificate: "04 March, 2026" */
export function formatDateCert(str) {
  if (!str) return ''
  const d = new Date(str)
  if (isNaN(d.getTime())) return str
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const day = String(d.getDate()).padStart(2, '0')
  const year = d.getFullYear()
  return `${day} ${months[d.getMonth()]}, ${year}`
}

export function fullName(first, middle, last) {
  return [first, middle, last].filter(Boolean).join(' ').trim() || ''
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
