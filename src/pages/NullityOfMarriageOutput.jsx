import React from 'react'
import { PrintHeaderRow } from '../components/print'

/**
 * Printable marriage certificate output: Annulment / Declaration of Nullity.
 * Used by the Court Decree marriage annotation flow (workflow + print).
 */
export default function NullityOfMarriageOutput({
  registry,
  husband,
  wife,
  marriageDate,
  place,
  hasScan,
  displayImageUrl,
  caseTitle,
}) {
  return (
    <>
      <div className="print-doc-header mb-4">
        <PrintHeaderRow />
        <hr className="border-black border-t my-2" />
        <p className="text-center font-bold text-lg uppercase tracking-wide">Office of the City Civil Registrar</p>
        <h2 className="text-center font-bold text-[26px] uppercase mt-4 mb-2 tracking-tight">Certificate of Marriage</h2>
        <p className="text-center font-bold text-[18px] uppercase mb-1">Annulment / Declaration of Nullity</p>
        <p className="text-center text-[15px] mb-4">
          Marriage void from the beginning <span className="font-semibold">(Art. 35, 36, 37, 38 &amp; 53, Family Code)</span>
        </p>
        <div className="flex justify-end items-baseline gap-2 text-[19px] mb-2">
          <span>Registry No.</span>
          <span className="font-bold underline min-w-[6rem] text-center">{registry}</span>
        </div>
      </div>

      <div className="print-doc-body flex flex-col flex-1 min-h-0">
        <p className="text-sm text-gray-600 print:text-black mb-2 print:hidden">
          Fill husband, wife, and marriage details on the court decree form (LCR 3A section). Attach a scan of the certificate or court decree below.
        </p>
        {hasScan && displayImageUrl ? (
          <div className="mb-4 border border-black rounded overflow-hidden bg-gray-50">
            <p className="text-xs font-medium text-gray-600 p-2 print:hidden">Attached scan</p>
            <img src={displayImageUrl} alt="Marriage certificate or decree" className="w-full max-h-[520px] object-contain object-top print:max-h-none" />
          </div>
        ) : hasScan && !displayImageUrl ? (
          <p className="text-sm text-gray-500 py-8 text-center">Converting PDF…</p>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg min-h-[200px] flex items-center justify-center text-gray-500 text-sm print:hidden">
            No file attached — use Upload to add certificate or decree image/PDF
          </div>
        )}

        <div className="mt-4 text-justify text-[16px] leading-relaxed print:block">
          <p className="mb-2">
            <span className="font-bold">Parties:</span> {husband} and {wife}
          </p>
          <p className="mb-2">
            <span className="font-bold">Marriage:</span> {marriageDate} at {place}
          </p>
          {caseTitle ? (
            <p className="mb-2">
              <span className="font-bold">Case / reference:</span> {caseTitle}
            </p>
          ) : null}
        </div>
      </div>
    </>
  )
}
