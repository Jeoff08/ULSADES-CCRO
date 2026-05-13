import React from 'react'
import { wronglyRegisterLcrSheetInlineStyle } from './lib/wronglyRegisterPrintSheetStyle'

/**
 * Wraps LCR print output so it reads as a separate sheet: screen “page” + print page break before the court LCR layout.
 * Inner components keep the standard LCR layout unchanged.
 */
export default function LegalInstrumentLcrOutputPage({
  instrument,
  lcrType,
  children,
  /** Match Wrongly Register print: white sheet shell + padding (children sit inside the sheet). */
  wronglyRegisterCompatibleLcrSheet = false,
  paperSpec,
  paperSizeId,
}) {
  const label = instrument ? `${instrument} — ` : ''
  const sheetStyle =
    wronglyRegisterCompatibleLcrSheet && paperSpec && paperSizeId
      ? wronglyRegisterLcrSheetInlineStyle(paperSpec, paperSizeId)
      : null
  const bodyShell = wronglyRegisterCompatibleLcrSheet && sheetStyle ? (
    <div
      className="wrongly-register-print-sheet wrongly-wr-lcr-sheet bg-white shadow-2xl mx-auto print:shadow-none print:p-0 ring-1 ring-gray-200 print:ring-0 px-4 py-3 print:px-8 flex flex-col"
      style={sheetStyle}
    >
      {children}
    </div>
  ) : (
    children
  )

  return (
    <section
      className="legal-instrument-lcr-output-page mx-auto w-full max-w-[210mm] break-before-page print:break-before-page"
      aria-label={`${label}LCR Form ${lcrType || ''}`}
    >
      {!wronglyRegisterCompatibleLcrSheet ? (
        <div className="no-print mb-4 rounded-xl border-2 border-emerald-400/70 bg-gradient-to-r from-emerald-50 to-white px-4 py-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-900">Separate LCR page</p>
          <p className="text-sm font-bold text-emerald-950 mt-0.5">
            {instrument ? `${instrument} · ` : ''}Form {lcrType || '1A'}
          </p>
          <p className="text-xs text-emerald-900/90 mt-1 leading-relaxed">
            On screen this block is its own page-style area. When printing or saving PDF, this section starts on a new page after the transmittal or affidavit.
          </p>
        </div>
      ) : null}
      <div
        className={
          wronglyRegisterCompatibleLcrSheet
            ? 'legal-instrument-lcr-output-page__body min-h-0 p-0 border-0 shadow-none bg-transparent print:p-0'
            : 'legal-instrument-lcr-output-page__body rounded-xl border border-slate-200/80 bg-white shadow-sm print:shadow-none print:border-0 print:rounded-none min-h-[70vh] print:min-h-0 p-2 sm:p-3 print:p-0'
        }
      >
        {bodyShell}
      </div>
    </section>
  )
}
