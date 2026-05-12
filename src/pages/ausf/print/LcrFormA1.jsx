import React from 'react'
import {
  formatDateCert,
  formatDateLong,
  fullName,
  joinCommaParts
} from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'

/** LCR Form No. 1A (Birth-Available) for AUSF module (A1 version).
 *  Updated signatory block to match the specific layout requested from the image.
 */
export default function LcrFormA1({ data }) {
  const childFull = fullName(data.childFirst, data.childMiddle, data.fatherLast) || fullName(data.childFirst, data.childMiddle, data.childLast)
  const motherFull = fullName(data.motherFirst, data.motherMiddle, data.motherLast)
  const fatherFull = fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const placeOfBirth = joinCommaParts(data.placeOfBirthAddress, data.placeOfBirthCity, data.placeOfBirthProvince) || '—'
  const formDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const regOfficerName = (data.certificateSignatoryName || 'LORELIE L. CANTO').toUpperCase()
  const ccrName = (data.cityCivilRegistrarName || 'YUSSIF DON JUSTIN F. MARTIL').toUpperCase()
  const registryNo = data.colbRegistryNo || '—'
  const verifiedByLabel = 'Verified by:'

  const ackDate = formatDateLong(data.colbDateOfRegistration)?.toUpperCase() || '—'

  const tableData = [
    { label: 'LCR Registry Number', val: registryNo },
    { label: 'Date of Registration', val: formatDateLong(data.colbDateOfRegistration) || '—' },
    { label: 'Name of Child', val: childFull || '—' },
    { label: 'Sex', val: data.sex || '—' },
    { label: 'Date of Birth', val: formatDateLong(data.dateOfBirth) || '—' },
    { label: 'Place of Birth', val: placeOfBirth },
    { label: 'Name of Mother', val: motherFull || '—' },
    { label: 'Citizenship of Mother', val: data.motherCitizenship || '—' },
    { label: 'Name of Father', val: fatherFull || '—' },
    { label: 'Citizenship of Father', val: data.fatherCitizenship || '—' },
    { label: 'Date of Marriage of Parents', val: '' },
    { label: 'Place of Marriage of Parents', val: '' },
  ]

  const colbPage = data.colbPageNumber || '—'
  const colbBook = data.colbBookNumber || '—'

  return (
    <div className="ausf-module-lcr-form ausf-doc print-doc print-doc-lcr-1a court-decree-lcr-form bg-white text-black text-sm max-w-[210mm] mx-auto px-6 pt-2 pb-0 flex flex-col min-h-0 h-full">
      <div className="court-decree-lcr-header shrink-0">
        <header className="print-doc-header">
          <PrintHeaderRow />
          <hr className="border-black my-3" />
        </header>
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="font-bold text-base">LCR Form No. 1A</p>
            <p className="text-sm">(Birth-Available)</p>
          </div>
          <p className="text-sm font-medium">{formDate}</p>
        </div>
      </div>

      <div className="court-decree-lcr-body-wrap flex-1 min-h-0 flex flex-col">
        <div className="court-decree-lcr-body-scaled flex flex-1 min-h-0 flex-col">
          <div className="flex-1 min-h-0 flex flex-col">
            <p className="font-bold mb-1 pl-8">TO WHOM IT MAY CONCERN:</p>
            <p className="mb-2 text-left court-decree-lcr-body">
              <span className="font-bold">WE CERTIFY</span> that, among others, the following facts of birth appear in our Register of Births on Page{' '}
              <span className="inline-block border-b border-black px-1 min-w-[2rem] text-center font-bold">{colbPage}</span>
              {' '}of Book number{' '}
              <span className="inline-block border-b border-black px-1 min-w-[3rem] text-center font-bold">{colbBook}</span>
              .
            </p>

            <table className="w-full border-collapse text-sm mt-2 mb-0 border border-black court-decree-lcr-table">
              <tbody>
                {tableData.map((row) => (
                  <tr key={row.label}>
                    <td className="py-1 px-2 border border-black font-medium align-top w-48">{row.label}</td>
                    <td className="py-1 px-2 border border-black font-bold text-center">{row.val}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="lcr-form-bottom-content flex flex-col shrink-0">
              <p className="mt-4 mb-2 text-[11.7pt] court-decree-lcr-body ausf-lcr-cert-line">
                This certification is issued upon the request of <span className="font-bold">OCRG/OWNER/PARENTS/GUARDIAN</span> for any legal purposes.
              </p>

              <div className="mt-6 mb-2 court-decree-lcr-body ausf-lcr-remarks-block">
                <p className="font-bold text-sm mb-0.5 uppercase">REMARKS:</p>
                <p className="leading-[1.35] text-justify break-words [overflow-wrap:anywhere] text-sm">
                  Acknowledged by <span className="font-bold underline">{fatherFull || '—'}</span> on <span className="font-bold underline">{ackDate}</span> under Registry Number <span className="font-bold underline">{registryNo}</span>. The child shall be known as <span className="font-bold underline">{childFull?.toUpperCase() || '—'}</span>
                </p>
              </div>
            </div>

            <div className="ausf-lcr-verified-slot shrink-0 w-full">
              <div className="pt-6 mb-4 lcr-form-bottom-content court-decree-lcr-body ausf-lcr-verified-block max-w-[55%] self-start">
                <div className="ausf-lcr-verified-ro-stack text-center flex flex-col items-center print:text-left print:items-start">
                  <p className="text-sm mb-1">{verifiedByLabel}</p>
                  <div className="font-bold uppercase text-sm leading-snug m-0 p-0">{regOfficerName}</div>
                  <div className="text-sm leading-snug m-0 p-0">Registration Officer IV</div>
                </div>
              </div>
            </div>
            <div className="ausf-lcr-ccr-slot flex-1 min-h-0 relative w-full">
              <div className="ausf-lcr-ccr-bottom absolute bottom-0 right-0 text-center flex flex-col items-center max-w-[48%]">
                <div className="ausf-lcr-ccr-name font-bold uppercase text-sm leading-snug m-0 p-0">{ccrName}</div>
                <div className="italic text-xs leading-snug m-0 p-0">City Civil Registrar</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="print-doc-footer mt-auto shrink-0">
        <p className="lcr1a-note-line font-bold text-sm mb-0 text-center px-2">
          Note: This certification is not valid if it has mark, erasure or alteration of any entry.
        </p>
        <DocumentFooter
          contactPhone={data.contactPhone || '228-1311'}
          contactEmail={data.contactEmail || 'civilregistrar.iligan@gmail.com'}
          sloganBlue
        />
      </footer>
    </div>
  )
}
