/** Editable COLB page/book input: line width tracks digit count (print/PDF). */
export function courtDecreeColbInputStyle(value) {
  const len = Math.max(1, String(value ?? '').trim().length)
  return {
    width: `${len}ch`,
    display: 'inline-block',
    textAlign: 'center',
    verticalAlign: 'baseline',
  }
}

function firstNonEmpty(data, keys) {
  if (!data || typeof data !== 'object') return ''
  for (const k of keys) {
    const v = data[k]
    if (v != null && String(v).trim() !== '') return String(v).trim()
  }
  return ''
}

/** Per-LCR COLB page for print (court decree fields override shared colbPageNo). */
export function courtDecreeColbPage(data, lcrKind) {
  if (lcrKind === '1a') {
    return firstNonEmpty(data, ['lcr1aColbPageNo', 'colbPageNumber', 'colbPageNo'])
  }
  if (lcrKind === '2a') {
    return firstNonEmpty(data, ['lcr2aColbPageNo', 'colbPageNumber', 'colbPageNo'])
  }
  if (lcrKind === '3a') {
    return firstNonEmpty(data, ['lcr3aColbPageNo', 'colbPageNumber', 'colbPageNo'])
  }
  return firstNonEmpty(data, ['colbPageNumber', 'colbPageNo'])
}

/** Per-LCR COLB book for print (court decree fields override shared colbBookNo). */
export function courtDecreeColbBook(data, lcrKind) {
  if (lcrKind === '1a') {
    return firstNonEmpty(data, ['lcr1aColbBookNo', 'colbBookNumber', 'colbBookNo'])
  }
  if (lcrKind === '2a') {
    return firstNonEmpty(data, ['lcr2aColbBookNo', 'colbBookNumber', 'colbBookNo'])
  }
  if (lcrKind === '3a') {
    return firstNonEmpty(data, ['lcr3aColbBookNo', 'colbBookNumber', 'colbBookNo'])
  }
  return firstNonEmpty(data, ['colbBookNumber', 'colbBookNo'])
}

export const COURT_DECREE_LCR_COLB_FORM_GROUPS = [
  {
    lcrKind: '1a',
    title: 'LCR Form 1A (Birth-Available)',
    pageKey: 'lcr1aColbPageNo',
    bookKey: 'lcr1aColbBookNo',
    pagePlaceholder: 'e.g. 458',
    bookPlaceholder: 'e.g. 545',
  },
  {
    lcrKind: '2a',
    title: 'LCR Form 2A (Death-Available)',
    pageKey: 'lcr2aColbPageNo',
    bookKey: 'lcr2aColbBookNo',
    pagePlaceholder: 'e.g. 120',
    bookPlaceholder: 'e.g. 30',
  },
  {
    lcrKind: '3a',
    title: 'LCR Form 3A (Marriage-Available)',
    pageKey: 'lcr3aColbPageNo',
    bookKey: 'lcr3aColbBookNo',
    pagePlaceholder: 'e.g. 146',
    bookPlaceholder: 'e.g. 2',
  },
]
