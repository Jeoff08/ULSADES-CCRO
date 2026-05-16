/** Default bold phrase in LCR “issued upon the request of …” line (Form 1A / birth-style). */
export const LCR_CERT_REQUEST_PARTY_1A_DEFAULT = 'OCRG/OWNER/PARENTS/GUARDIAN'

/** Default for LCR Forms 2A / 3A (death / marriage). */
export const LCR_CERT_REQUEST_PARTY_2A_3A_DEFAULT = 'OCRG/DOCUMENT OWNER'

/**
 * @param {Record<string, unknown>} data
 * @param {'1a' | '2a3a'} variant
 * @returns {string}
 */
export function lcrCertificationRequestParty(data, variant) {
  const v = String(data?.lcrCertificationRequestParty ?? '').trim()
  if (v) return v
  return variant === '2a3a' ? LCR_CERT_REQUEST_PARTY_2A_3A_DEFAULT : LCR_CERT_REQUEST_PARTY_1A_DEFAULT
}
