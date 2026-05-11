function asTrimmedStr(v) {
  if (v == null) return ''
  const s = String(v).trim()
  return s
}

const PAGE_KEYS = [
  'lcrPage',
  'colbPageNumber',
  'colbPageNo',
  'registerBirthPage',
  'birthRegisterPage',
  'registerOfBirthPage',
  'colb_page_number',
  'colb_page_no',
]

const BOOK_KEYS = [
  'lcrBook',
  'colbBookNumber',
  'colbBookNo',
  'registerBirthBook',
  'birthRegisterBook',
  'registerOfBirthBook',
  'colb_book_number',
  'colb_book_no',
]

/** Register of Births page / book from saved AUSF / Court Decree / Legitimation (field names vary). */
export function pickBirthRegisterPageBook(source) {
  const d = source && typeof source === 'object' ? source : {}
  let page = ''
  for (const k of PAGE_KEYS) {
    page = asTrimmedStr(d[k])
    if (page) break
  }
  let book = ''
  for (const k of BOOK_KEYS) {
    book = asTrimmedStr(d[k])
    if (book) break
  }
  const nested = d.colbBirthRegister || d.birthRegister || d.registerOfBirth
  if (nested && typeof nested === 'object' && (!page || !book)) {
    if (!page) {
      for (const k of PAGE_KEYS) {
        page = asTrimmedStr(nested[k])
        if (page) break
      }
    }
    if (!book) {
      for (const k of BOOK_KEYS) {
        book = asTrimmedStr(nested[k])
        if (book) break
      }
    }
  }
  return { page, book }
}

/**
 * Prefer typed `lcrPage`/`lcrBook`; otherwise copy from aliases so print views always resolve.
 */
export function mergeBirthRegisterPageBookFields(draft) {
  const src = draft && typeof draft === 'object' ? draft : {}
  const pb = pickBirthRegisterPageBook(src)
  const lcrPage = asTrimmedStr(src.lcrPage) || pb.page
  const lcrBook = asTrimmedStr(src.lcrBook) || pb.book
  return {
    ...src,
    lcrPage,
    lcrBook,
    colbPageNumber: asTrimmedStr(src.colbPageNumber) || lcrPage,
    colbBookNumber: asTrimmedStr(src.colbBookNumber) || lcrBook,
    colbPageNo: asTrimmedStr(src.colbPageNo) || lcrPage,
    colbBookNo: asTrimmedStr(src.colbBookNo) || lcrBook,
  }
}
