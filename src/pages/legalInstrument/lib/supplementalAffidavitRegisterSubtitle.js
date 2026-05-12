/**
 * Line under "AFFIDAVIT FOR SUPPLEMENTAL REPORT" from LCR form type on the Supplemental record.
 * @param {string} [lcrTypeRaw] '1A' | '2A' | '3A' (default birth / COLB)
 */
export function supplementalAffidavitRegisterSubtitle(lcrTypeRaw) {
  const t = String(lcrTypeRaw ?? '1A').trim().toUpperCase()
  if (t === '3A') return '(for Marriage)'
  if (t === '2A') return '(for Death)'
  return '(for COLB)'
}
