import {
  RECEIVED_BY_OPTIONS,
  DEFAULT_TRANSMITTAL_SIGNATORY,
  normReceivedByNameForMatch,
} from '../../legalInstrument/lib/supplementalTransmittalDefaults'

export { RECEIVED_BY_OPTIONS }

/** Print types that support the sidebar “Prepared / signed by” control. */
export const AUSF_PREPARED_BY_PRINT_TYPES = new Set([
  'reg-ausf',
  'reg-ack',
  'child-not-ack-transmittal',
  'out-of-town',
  'child-ack-lcr',
  'child-not-ack-lcr',
])

function normName(s) {
  return String(s || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')
}

function normTitle(s) {
  return String(s || '').trim()
}

/**
 * Effective name/title for the active print type (scoped overrides, then legacy shared fields).
 */
export function getResolvedPreparedByForPrintType(data, printType) {
  const d = data && typeof data === 'object' ? data : {}
  switch (printType) {
    case 'reg-ausf': {
      const name = String(d.regAusfSignatoryName || d.certificateSignatoryName || 'LORELIE L. CANTO').trim()
      const title = String(
        d.regAusfSignatoryTitle || d.certificateSignatoryTitle || 'Registration Officer IV',
      ).trim()
      return { name, title }
    }
    case 'reg-ack': {
      const name = String(d.regAckSignatoryName || d.certificateSignatoryName || 'LORELIE L. CANTO').trim()
      const title = String(
        d.regAckSignatoryTitle || d.certificateSignatoryTitle || 'Registration Officer IV',
      ).trim()
      return { name, title }
    }
    case 'child-not-ack-transmittal': {
      const rawName = String(d.transmittalLocalSignatoryName || d.transmittalSignatoryName || '').trim()
      const rawTitle = String(d.transmittalLocalSignatoryTitle || d.transmittalSignatoryTitle || '').trim()
      // Align with TransmittalDoc defaults so the roster index matches what prints when fields are blank.
      const name = rawName || DEFAULT_TRANSMITTAL_SIGNATORY.name
      const title = rawTitle || DEFAULT_TRANSMITTAL_SIGNATORY.title
      return { name, title }
    }
    case 'out-of-town': {
      const rawName = String(d.transmittalOotSignatoryName || d.transmittalSignatoryName || '').trim()
      const rawTitle = String(d.transmittalOotSignatoryTitle || d.transmittalSignatoryTitle || '').trim()
      const name = rawName || DEFAULT_TRANSMITTAL_SIGNATORY.name
      const title = rawTitle || DEFAULT_TRANSMITTAL_SIGNATORY.title
      return { name, title }
    }
    case 'child-ack-lcr': {
      const name = String(d.lcrAckSignatoryName || d.certificateSignatoryName || 'LORELIE L. CANTO').trim()
      const title = String(d.lcrAckSignatoryTitle || 'Registration Officer IV').trim()
      return { name, title }
    }
    case 'child-not-ack-lcr': {
      const name = String(d.lcrNotAckSignatoryName || d.certificateSignatoryName || 'LORELIE L. CANTO').trim()
      const title = String(d.lcrNotAckSignatoryTitle || 'Registration Officer IV').trim()
      return { name, title }
    }
    default:
      return { name: '', title: '' }
  }
}

/** Index into RECEIVED_BY_OPTIONS, or null if no row matches (custom text). */
export function preparedByOptionIndexForPrintType(data, printType) {
  const { name, title } = getResolvedPreparedByForPrintType(data, printType)
  const ni = normName(name)
  const ti = normTitle(title)
  if (!ni && !ti) return null
  const idx = RECEIVED_BY_OPTIONS.findIndex(
    (o) => normReceivedByNameForMatch(o.name) === normReceivedByNameForMatch(name) && normTitle(o.title) === ti,
  )
  return idx >= 0 ? idx : null
}

/** Apply a roster row to draft fields for this print type only. */
export function patchPreparedByForPrintType(printType, optionIndex) {
  const row = RECEIVED_BY_OPTIONS[optionIndex]
  if (!row) return {}
  switch (printType) {
    case 'reg-ausf':
      return { regAusfSignatoryName: row.name, regAusfSignatoryTitle: row.title }
    case 'reg-ack':
      return { regAckSignatoryName: row.name, regAckSignatoryTitle: row.title }
    case 'child-not-ack-transmittal':
      return {
        transmittalLocalSignatoryName: row.name,
        transmittalLocalSignatoryTitle: row.title,
      }
    case 'out-of-town':
      return {
        transmittalOotSignatoryName: row.name,
        transmittalOotSignatoryTitle: row.title,
      }
    case 'child-ack-lcr':
      return { lcrAckSignatoryName: row.name, lcrAckSignatoryTitle: row.title }
    case 'child-not-ack-lcr':
      return { lcrNotAckSignatoryName: row.name, lcrNotAckSignatoryTitle: row.title }
    default:
      return {}
  }
}

/** Clear scoped overrides for this print type (fall back to legacy / defaults). */
export function clearPreparedByOverrideForPrintType(printType) {
  switch (printType) {
    case 'reg-ausf':
      return { regAusfSignatoryName: '', regAusfSignatoryTitle: '' }
    case 'reg-ack':
      return { regAckSignatoryName: '', regAckSignatoryTitle: '' }
    case 'child-not-ack-transmittal':
      return { transmittalLocalSignatoryName: '', transmittalLocalSignatoryTitle: '' }
    case 'out-of-town':
      return { transmittalOotSignatoryName: '', transmittalOotSignatoryTitle: '' }
    case 'child-ack-lcr':
      return { lcrAckSignatoryName: '', lcrAckSignatoryTitle: '' }
    case 'child-not-ack-lcr':
      return { lcrNotAckSignatoryName: '', lcrNotAckSignatoryTitle: '' }
    default:
      return {}
  }
}

/**
 * Merge transmittal letter signatory from local vs out-of-town scoped fields into the keys TransmittalDoc reads.
 */
export function mergeAusfTransmittalSignatoryIntoData(data, transmittalVariant) {
  const d = data && typeof data === 'object' ? data : {}
  if (transmittalVariant === 'out-of-town') {
    return {
      ...d,
      transmittalSignatoryName: d.transmittalOotSignatoryName || d.transmittalSignatoryName,
      transmittalSignatoryTitle: d.transmittalOotSignatoryTitle || d.transmittalSignatoryTitle,
    }
  }
  if (transmittalVariant === 'child-not-ack-transmittal') {
    return {
      ...d,
      transmittalSignatoryName: d.transmittalLocalSignatoryName || d.transmittalSignatoryName,
      transmittalSignatoryTitle: d.transmittalLocalSignatoryTitle || d.transmittalSignatoryTitle,
    }
  }
  return d
}
