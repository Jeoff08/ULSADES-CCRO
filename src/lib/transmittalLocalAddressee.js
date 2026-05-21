/** Fixed “To” addressee on local transmittal (not out-of-town). */
export const LOCAL_TRANSMITTAL_TO_PSA_LINES = [
  'Minerva Eloisa P. Esquivas',
  'Assistant Secretary',
  'Deputy National Statistician',
  'Civil Registration and Central Support Office',
  'CRS Building, Philippines Statistics Authority Complex East Avenue Diliman',
  'Quezon City, 1101',
]

export const LOCAL_TRANSMITTAL_ATTN_PREFIX = 'ATTN:'

export const LOCAL_TRANSMITTAL_ATTN_LINES = [
  'Marizza B. Grande - done',
  'Assistant National Statistician',
  'Civil Registration Service',
]

/** Out-of-town print/PDF: user draft when filled, otherwise local default per line. */
export function resolveOotPsaPrintLine(draftLines, index, { uppercase = false } = {}) {
  const draft = String(draftLines?.[index] ?? '').trim()
  const fallback = LOCAL_TRANSMITTAL_TO_PSA_LINES[index] ?? ''
  const text = draft || fallback
  return uppercase ? text.toUpperCase() : text
}

export function resolveOotPsaPrintLines(draftLines, { uppercase = false } = {}) {
  return LOCAL_TRANSMITTAL_TO_PSA_LINES.map((_, i) => ({
    i,
    text: resolveOotPsaPrintLine(draftLines, i, { uppercase }),
  }))
}

export function resolveOotAttnForPrint(prefixDraft, detailDraft, { uppercasePrefix = false } = {}) {
  const detailLines = [0, 1, 2].map((i) => {
    const draft = String(detailDraft?.[i] ?? '').trim()
    return draft || LOCAL_TRANSMITTAL_ATTN_LINES[i] || ''
  })
  let prefix = String(prefixDraft ?? '').trim() || LOCAL_TRANSMITTAL_ATTN_PREFIX
  if (uppercasePrefix) prefix = prefix.toUpperCase()
  return { prefix, detailLines }
}
