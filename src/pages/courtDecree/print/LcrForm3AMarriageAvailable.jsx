import React from 'react'
import { formatDateCert, parseDdMmYyyyToDate } from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'
import { buildLcr3aTableDisplay } from '../lib/lcr3aTable'

/** LCR Form No. 3A (Marriage-Available). Full print; table via buildLcr3aTableDisplay. */
export default function LcrForm3AMarriageAvailable({ data }) {
  const t = buildLcr3aTableDisplay(data)
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
  const cell = 'py-1 px-2 border border-black text-center font-bold text-sm align-top'

  return (
    <div className="ausf-doc print-doc print-doc-lcr-3a court-decree-lcr-form bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-2 flex flex-col">
      <div className="court-decree-lcr-header shrink-0">
        <PrintHeaderRow />
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="font-bold text-base">LCR Form No. 3A</p>
            <p className="text-sm">(Marriage-Available)</p>
          </div>
          <p className="text-sm font-bold min-w-[8rem] text-right">{formDate}</p>
        </div>
      </div>
      <div className="court-decree-lcr-body-wrap flex-1 min-h-0 flex flex-col">
        <div className="court-decree-lcr-body-scaled">
          <p className="font-bold mb-1">TO WHOM IT MAY CONCERN:</p>
          <p className="mb-2 text-left court-decree-lcr-body">
            <span className="font-bold">WE CERTIFY</span> that, among others, the following facts of marriage appear in our Register of Marriages on Page{' '}
            <span className="inline-block border-b border-black px-1 min-w-[2rem] text-center font-bold">{colbPage ?? ''}</span> of Book number{' '}
            <span className="inline-block border-b border-black px-1 min-w-[3rem] text-center font-bold">{colbBook ?? ''}</span>.
          </p>
          <table className="w-full border-collapse text-sm mb-2 border border-black table-fixed court-decree-lcr-table">
            <colgroup>
              <col style={{ width: '28%' }} />
              <col style={{ width: '36%' }} />
              <col style={{ width: '36%' }} />
            </colgroup>
            <thead>
              <tr>
                <td className="py-1 px-2 border border-black font-bold align-top" />
                <td className="py-1 px-2 border border-black font-bold text-center bg-gray-800 text-white">HUSBAND</td>
                <td className="py-1 px-2 border border-black font-bold text-center bg-gray-800 text-white">WIFE</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1 px-2 border border-black font-medium align-top">Name:</td>
                <td className={`${cell} uppercase`}>{t.husbandName}</td>
                <td className={`${cell} uppercase`}>{t.wifeName}</td>
              </tr>
              <tr>
                <td className="py-1 px-2 border border-black font-medium align-top">Date of Birth/Age:</td>
                <td className={cell}>{t.husbandDobAge}</td>
                <td className={cell}>{t.wifeDobAge}</td>
              </tr>
              <tr>
                <td className="py-1 px-2 border border-black font-medium align-top">Citizenship:</td>
                <td className={`${cell} uppercase`}>{t.husbandCitizenship}</td>
                <td className={`${cell} uppercase`}>{t.wifeCitizenship}</td>
              </tr>
              <tr>
                <td className="py-1 px-2 border border-black font-medium align-top">Civil Status:</td>
                <td className={`${cell} uppercase`}>{t.husbandCivilStatus}</td>
                <td className={`${cell} uppercase`}>{t.wifeCivilStatus}</td>
              </tr>
              <tr>
                <td className="py-1 px-2 border border-black font-medium align-top">Mother:</td>
                <td className={`${cell} uppercase`}>{t.husbandMother}</td>
                <td className={`${cell} uppercase`}>{t.wifeMother}</td>
              </tr>
              <tr>
                <td className="py-1 px-2 border border-black font-medium align-top">Father:</td>
                <td className={`${cell} uppercase`}>{t.husbandFather}</td>
                <td className={`${cell} uppercase`}>{t.wifeFather}</td>
              </tr>
              <tr>
                <td className="py-1 px-2 border border-black font-medium align-top">Registry Number</td>
                <td className={`${cell} uppercase`} colSpan={2}>
                  {t.registry}
                </td>
              </tr>
              <tr>
                <td className="py-1 px-2 border border-black font-medium align-top leading-tight">
                  Date of
                  <br />
                  Registration
                </td>
                <td className={cell} colSpan={2}>
                  {t.dateRegistration}
                </td>
              </tr>
              <tr>
                <td className="py-1 px-2 border border-black font-medium align-top">Date of Marriage</td>
                <td className={cell} colSpan={2}>
                  {t.dateMarriage}
                </td>
              </tr>
              <tr>
                <td className="py-1 px-2 border border-black font-medium align-top leading-tight">
                  Place of
                  <br />
                  Marriage
                </td>
                <td className={`${cell} uppercase text-left sm:text-center align-top min-h-[2.5rem] whitespace-pre-wrap`} colSpan={2}>
                  {t.placeMarriage}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mb-2 text-sm italic court-decree-lcr-body">
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
        <DocumentFooter contactPhone={data?.contactPhone} contactEmail={data?.contactEmail} sloganBlue />
      </div>
    </div>
  )
}
