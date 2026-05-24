/** Save/preview: three LCR copies in one PDF, each on its own long bond page — without changing on-screen layout. */

export const LCR_TRIPLE_PDF_PAGE_CLASS = 'lcr-triple-pdf-page'
export const LCR_TRIPLE_PDF_BODY_CLASS = 'lcr-triple-pdf-export'
export const SUPPLEMENTAL_LCR_ONLY_EXPORT_CLASS = 'supplemental-pdf-export--lcr-only'

const LCR_TRIPLE_PDF_STYLE_ID = 'lcr-triple-pdf-export-print-style'

const COURT_DECREE_LCR_BASE_TYPES = new Set(['lcr-form-1a', 'lcr-form-2a', 'lcr-form-3a'])

export function lcrTriplePdfPageClassName(copyIndex, total = 3) {
  const isLast = copyIndex >= total - 1
  return [
    LCR_TRIPLE_PDF_PAGE_CLASS,
    !isLast ? 'lcr-triple-pdf-page--break-after' : '',
    copyIndex > 0 ? 'mt-8 print:mt-0 print:[page-break-before:always]' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

export function isCourtDecreeLcrTriplePdfView(lcrBaseType) {
  return COURT_DECREE_LCR_BASE_TYPES.has(lcrBaseType)
}

export function isLegitimationLcrTriplePdfView(lcrBaseType) {
  return lcrBaseType === 'lcr-form-1a'
}

function waitFrames(n = 3) {
  return new Promise((resolve) => {
    let left = n
    const tick = () => {
      left -= 1
      if (left <= 0) resolve()
      else requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

function injectLcrTriplePdfPrintStyles() {
  let el = document.getElementById(LCR_TRIPLE_PDF_STYLE_ID)
  if (!el) {
    el = document.createElement('style')
    el.id = LCR_TRIPLE_PDF_STYLE_ID
    document.head.appendChild(el)
  }
  el.textContent = `
@media print {
  @page { size: 8.5in 13in; margin: 0; }
  body.${LCR_TRIPLE_PDF_BODY_CLASS},
  html:has(body.${LCR_TRIPLE_PDF_BODY_CLASS}) {
    overflow: visible !important;
    height: auto !important;
    min-height: 0 !important;
  }
  body.${LCR_TRIPLE_PDF_BODY_CLASS} .layout-root,
  body.${LCR_TRIPLE_PDF_BODY_CLASS} .layout-main,
  body.${LCR_TRIPLE_PDF_BODY_CLASS} main,
  body.${LCR_TRIPLE_PDF_BODY_CLASS} main .flex-1.min-w-0 {
    overflow: visible !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
  }
  body.${LCR_TRIPLE_PDF_BODY_CLASS} .${LCR_TRIPLE_PDF_PAGE_CLASS} {
    display: block !important;
    page-break-inside: avoid !important;
    break-inside: avoid-page !important;
  }
  body.${LCR_TRIPLE_PDF_BODY_CLASS} .${LCR_TRIPLE_PDF_PAGE_CLASS}--break-after,
  html.${SUPPLEMENTAL_LCR_ONLY_EXPORT_CLASS} .${LCR_TRIPLE_PDF_PAGE_CLASS}--break-after {
    page-break-after: always !important;
    break-after: page !important;
  }
  body.${LCR_TRIPLE_PDF_BODY_CLASS} .${LCR_TRIPLE_PDF_PAGE_CLASS} + .${LCR_TRIPLE_PDF_PAGE_CLASS},
  html.${SUPPLEMENTAL_LCR_ONLY_EXPORT_CLASS} .${LCR_TRIPLE_PDF_PAGE_CLASS} + .${LCR_TRIPLE_PDF_PAGE_CLASS} {
    page-break-before: always !important;
    break-before: page !important;
    margin-top: 0 !important;
  }
  body.${LCR_TRIPLE_PDF_BODY_CLASS} .${LCR_TRIPLE_PDF_PAGE_CLASS} .court-decree-lcr-form,
  html.${SUPPLEMENTAL_LCR_ONLY_EXPORT_CLASS} .${LCR_TRIPLE_PDF_PAGE_CLASS} .court-decree-lcr-form,
  body.${LCR_TRIPLE_PDF_BODY_CLASS} .${LCR_TRIPLE_PDF_PAGE_CLASS} .ausf-lcr-1a-birth-available,
  body.${LCR_TRIPLE_PDF_BODY_CLASS} .${LCR_TRIPLE_PDF_PAGE_CLASS} .ausf-lcr-a1-form,
  body.${LCR_TRIPLE_PDF_BODY_CLASS} .${LCR_TRIPLE_PDF_PAGE_CLASS} .legitimation-lcr1a-doc {
    width: 215.9mm !important;
    max-width: 215.9mm !important;
    min-height: 330.2mm !important;
    height: 330.2mm !important;
  }
  html.${SUPPLEMENTAL_LCR_ONLY_EXPORT_CLASS} #supplemental-print-page:not(.mc2010-print-root) .${LCR_TRIPLE_PDF_PAGE_CLASS} .court-decree-lcr-form {
    padding-left: 0.4in !important;
    padding-right: 0.4in !important;
    box-sizing: border-box !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  html.${SUPPLEMENTAL_LCR_ONLY_EXPORT_CLASS} #supplemental-print-page.mc2010-print-root .${LCR_TRIPLE_PDF_PAGE_CLASS} .court-decree-lcr-form {
    padding-left: 0.4in !important;
    padding-right: 0.4in !important;
    box-sizing: border-box !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}
body.lcr-triple-pdf-export.pdf-capture #supplemental-print-page:not(.mc2010-print-root) #supplemental-print-lcr .court-decree-lcr-form,
html.${SUPPLEMENTAL_LCR_ONLY_EXPORT_CLASS} #supplemental-print-page:not(.mc2010-print-root) .court-decree-lcr-form {
  padding-left: 0.4in !important;
  padding-right: 0.4in !important;
  box-sizing: border-box !important;
  max-width: none !important;
  width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}
body.lcr-triple-pdf-export.pdf-capture #supplemental-print-page.mc2010-print-root #supplemental-print-lcr .court-decree-lcr-form,
html.${SUPPLEMENTAL_LCR_ONLY_EXPORT_CLASS} #supplemental-print-page.mc2010-print-root .court-decree-lcr-form {
  padding-left: 0.4in !important;
  padding-right: 0.4in !important;
  box-sizing: border-box !important;
  max-width: none !important;
  width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}
`
}

function removeLcrTriplePdfPrintStyles() {
  document.getElementById(LCR_TRIPLE_PDF_STYLE_ID)?.remove()
}

/**
 * @param {{ lcrOnlyExport?: boolean }} options
 * @param {() => Promise<unknown>} fn
 */
export async function withLcrTriplePdfCapture({ lcrOnlyExport = false } = {}, fn) {
  const root = document.documentElement
  const body = document.body
  body.classList.add(LCR_TRIPLE_PDF_BODY_CLASS, 'pdf-capture')
  if (lcrOnlyExport) root.classList.add(SUPPLEMENTAL_LCR_ONLY_EXPORT_CLASS)
  injectLcrTriplePdfPrintStyles()
  await waitFrames(3)
  try {
    return await fn()
  } finally {
    body.classList.remove(LCR_TRIPLE_PDF_BODY_CLASS, 'pdf-capture')
    if (lcrOnlyExport) root.classList.remove(SUPPLEMENTAL_LCR_ONLY_EXPORT_CLASS)
    removeLcrTriplePdfPrintStyles()
  }
}
