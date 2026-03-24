import React from 'react'
import { formatDateCert, parseDdMmYyyyToDate } from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'
import { buildLcr2aTableDisplay } from '../lib/lcr2aTable'

/** LCR Form No. 2A (Death-Available). Full print layout; table from buildLcr2aTableDisplay (court + legitimation). */
export default function LcrForm2ADeathAvailable({ data }) {
  const t = buildLcr2aTableDisplay(data)
  const colbPage = data.colbPageNumber ?? data.colbPageNo
  const colbBook = data.colbBookNumber ?? data.colbBookNo
  const formDate = (() => {
    const raw = data.certificateIssuanceDate
    const p = parseDdMmYyyyToDate(raw)
    if (p) return formatDateCert(p.toISOString().slice(0, 10))
    return formatDateCert(raw) || formatDateCert(new Date())
  })()
  const regOfficer = data.certificateSignatoryName || 'LORELIE L. CANTO'
  const ccrName = data.cityCivilRegistrarName || 'YUSSIF DON JUSTIN F. MARTIL'
  const blankIfDash = (v) => (String(v || '').trim() === '—' ? '' : v)
  const causeText = blankIfDash(t.causeOfDeath)
  const causeLines = 9
  const labelCell = 'py-0.5 px-2 border border-black align-top leading-tight'
  const valueCell = 'py-0.5 px-2 border border-black text-left leading-tight'

  return (
    <div className="ausf-doc print-doc print-doc-lcr-2a court-decree-lcr-form bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-2 flex flex-col">
      <div className="court-decree-lcr-header shrink-0">
        <PrintHeaderRow />
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="font-bold text-base">LCR Form No. 2A</p>
            <p className="text-sm">(Death-Available)</p>
          </div>
          <p className="text-sm font-bold">{formDate}</p>
        </div>
      </div>
      <div className="court-decree-lcr-body-wrap flex-1 min-h-0 flex flex-col">
        <div className="court-decree-lcr-body-scaled">
          <p className="font-bold mb-1">TO WHOM IT MAY CONCERN:</p>
          <p className="mb-2 text-left court-decree-lcr-body">
            <span className="font-bold">WE CERTIFY</span> that, among others, the following facts of death appear in our Register of Deaths on Page{' '}
            <span className="inline-block border-b border-black px-1 min-w-[2rem] text-center font-bold">{colbPage ?? ''}</span> of Book number{' '}
            <span className="inline-block border-b border-black px-1 min-w-[3rem] text-center font-bold">{colbBook ?? ''}</span>.
          </p>
          <table className="w-full border-collapse text-sm mb-2 border border-black table-fixed court-decree-lcr-table">
            <colgroup>
              <col style={{ width: '38%' }} />
              <col style={{ width: '62%' }} />
            </colgroup>
            <tbody>
              <tr>
                <td className={`${labelCell} w-48`}>LCR Registry Number</td>
                <td className={`${valueCell} uppercase`}>{blankIfDash(t.registry)}</td>
              </tr>
              <tr>
                <td className={labelCell}>Date of Registration</td>
                <td className={valueCell}>{blankIfDash(t.dateRegistration)}</td>
              </tr>
              <tr>
                <td className={labelCell}>Name of Deceased</td>
                <td className={`${valueCell} uppercase`}>{blankIfDash(t.nameDeceased)}</td>
              </tr>
              <tr>
                <td className={labelCell}>Sex</td>
                <td className={`${valueCell} uppercase`}>{blankIfDash(t.sex)}</td>
              </tr>
              <tr>
                <td className={labelCell}>Civil Status</td>
                <td className={`${valueCell} uppercase`}>{blankIfDash(t.civilStatus)}</td>
              </tr>
              <tr>
                <td className={labelCell}>Citizenship</td>
                <td className={`${valueCell} uppercase`}>{blankIfDash(t.citizenship)}</td>
              </tr>
              <tr>
                <td className={labelCell}>Date of Death</td>
                <td className={valueCell}>{blankIfDash(t.dateDeath)}</td>
              </tr>
              <tr>
                <td className={labelCell}>Citizenship of Father</td>
                <td className={`${valueCell} uppercase`}>{blankIfDash(t.citizenshipFather)}</td>
              </tr>
              <tr>
                <td className={labelCell}>Place of Death</td>
                <td className={`${valueCell} uppercase whitespace-pre-wrap min-h-[2.2rem]`}>{blankIfDash(t.placeDeath)}</td>
              </tr>
              <tr>
                <td className="py-0.5 px-2 border border-black align-top text-center leading-tight" rowSpan={causeLines}>
                  Cause of Death
                </td>
                <td className="py-0.5 px-2 border border-black text-left align-top whitespace-pre-wrap leading-tight">
                  {causeText}
                </td>
              </tr>
              {Array.from({ length: causeLines - 1 }).map((_, idx) => (
                <tr key={`cause-line-${idx}`}>
                  <td className="py-0.5 px-2 border border-black">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mb-2 text-sm court-decree-lcr-body">
            This certification is issued upon the request of OCRG/OWNER/PARENTS/GUARDIAN for any legal purposes.
          </p>
          <div className="mb-2 court-decree-lcr-body">
            <p className="font-bold text-sm mb-0.5">REMARKS:</p>
            <p className="text-sm text-justify min-h-[1.5rem]">{data.remarks || ''}</p>
          </div>
          <div className="mb-2 flex justify-between items-end gap-8 court-decree-lcr-body">
            <div className="text-left">
              <p className="text-sm mb-0.5">Verified by:</p>
              <p className="font-bold text-sm border-b border-black inline-block uppercase">{regOfficer}</p>
              <p className="text-xs mt-0.5">LCRO - Staff</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm border-b border-black inline-block uppercase">{ccrName}</p>
              <p className="text-xs mt-0.5 italic">City Civil Registrar</p>
            </div>
          </div>
          <p className="font-bold text-sm mb-2 court-decree-lcr-body">
            Note: This certification is not valid if it has mark, erasure or alteration of any entry.
          </p>
        </div>
      </div>
      <div className="court-decree-lcr-footer mt-auto shrink-0">
        <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} sloganBlue />
      </div>
    </div>
  )
}
