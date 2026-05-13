/** Standard CCR / LCR “Received by” / registration officer lines (Iligan CRC). */
export const RECEIVED_BY_OPTIONS = [
  { name: 'LORELIE L. CANTO', title: 'REGISTRATION OFFICER IV' },
  { name: 'PHOEBE L. BENIGA', title: 'REGISTRATION OFFICER II' },
  { name: 'JAN FLAURENCE A. OBLENDA', title: 'REGISTRATION OFFICER II' },
]

export const DEFAULT_RECEIVED_BY = RECEIVED_BY_OPTIONS[0]

/** Index in {@link RECEIVED_BY_OPTIONS}, or -1 if no exact match (custom). */
export function matchReceivedByIndex(name, title) {
  const n = String(name ?? '').trim()
  const t = String(title ?? '').trim().toUpperCase()
  return RECEIVED_BY_OPTIONS.findIndex(
    (o) => o.name === n && String(o.title ?? '').trim().toUpperCase() === t
  )
}
