/** Fixed “To” addressee on local transmittal (not out-of-town). */
export const LOCAL_TRANSMITTAL_TO_PSA_LINES = [
  'MINERVA ELOISA P. ESQUIVAS',
  'Assistant Secretary',
  'Deputy National Statistician',
  'Civil Registration and Central Support Office',
  'CRS Building, Philippines Statistics Authority Complex East Avenue Diliman',
  'Quezon City, 1101',
]

/** Print/PDF: line 0 ALL CAPS; lines 1+ keep entered casing (defaults are title case). */
/** Split “SUBJECT: …” for hanging layout (bold label + body lines aligned under text after label). */
export function splitTransmittalSubjectLine(subjectText) {
  const s = String(subjectText ?? '')
  const m = s.match(/^\s*(SUBJECT\s*:\s*)([\s\S]*)$/i)
  if (m) return { label: 'SUBJECT:', body: (m[2] ?? '').trim() }
  return { label: 'SUBJECT:', body: s.replace(/^\s*SUBJECT\s*:\s*/i, '').trim() }
}

export function formatTransmittalPsaLineForPrint(text, lineIndex) {
  const t = String(text ?? '').trim()
  if (!t) return ''
  if (lineIndex === 0) return t.toUpperCase()
  return t
}

export const LOCAL_TRANSMITTAL_ATTN_PREFIX = 'ATTN:'

export const LOCAL_TRANSMITTAL_ATTN_LINES = [
  'Marizza B. Grande - done',
  'Assistant National Statistician',
  'Civil Registration Service',
]

/** Out-of-town print/PDF: user draft when filled, otherwise local default per line. */
export function resolveOotPsaPrintLine(draftLines, index) {
  const draft = String(draftLines?.[index] ?? '').trim()
  const fallback = LOCAL_TRANSMITTAL_TO_PSA_LINES[index] ?? ''
  return formatTransmittalPsaLineForPrint(draft || fallback, index)
}

export function resolveOotPsaPrintLines(draftLines) {
  return LOCAL_TRANSMITTAL_TO_PSA_LINES.map((_, i) => ({
    i,
    text: resolveOotPsaPrintLine(draftLines, i),
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
