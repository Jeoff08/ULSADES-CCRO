import React from 'react'
import { formatDateLong, formatDateCert, fullName } from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter, LOGO_RIGHT_SRC } from '../../../components/print'

export default function LcrFormA1({ data }) {
  const childFull = fullName(data.childFirst, data.childMiddle, data.fatherLast) || fullName(data.childFirst, data.childMiddle, data.childLast)
  const motherFull = fullName(data.motherFirst, data.motherMiddle, data.motherLast)
  const fatherFull = fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const placeOfBirthLine1 = [data.placeOfBirthAddress, data.placeOfBirthCity].filter(Boolean).join(' ') || '—'
  const placeOfBirthLine2 = data.placeOfBirthProvince || ''
  const formDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const regOfficerName = data.certificateSignatoryName || 'LORELIE L. CANTO'
  const ccrName = data.cityCivilRegistrarName || ''
  const registryNo = data.colbRegistryNo || '—'

  return (
    <div className="lcr-a1-print-root">
      <div className="ausf-doc print-doc print-doc-lcr-a1 bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-2 leading-snug flex flex-col min-h-0">
        <header className="lcr-a1-header shrink-0 mb-2 text-[15px]">
          <PrintHeaderRow
            rightContent={
              <div className="flex flex-col items-end shrink-0">
                <img src={LOGO_RIGHT_SRC} alt="Office of the City Civil Registrar" className="w-20 h-20 object-contain shrink-0" />
                <p className="text-[11px] font-medium mt-0">{formDate}</p>
              </div>
            }
          />
          <hr className="border-black border-t my-2" />
          <div className="flex justify-between items-baseline gap-4 leading-tight">
            <div>
              <p>Republic of the Philippines)</p>
              <p>City of Iligan)S.S</p>
            </div>
            <div className="flex items-baseline gap-1 shrink-0">
              <span>Registry Number:</span>
              <span className="fill-blank inline-block text-center min-w-[3rem] font-bold underline">{registryNo}</span>
            </div>
          </div>
        </header>

        <div className="lcr-a1-content-wrap flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="lcr-a1-scaled flex flex-col min-h-0 w-full origin-top-left gap-3">
            <div className="flex justify-between items-baseline shrink-0">
              <div>
                <p className="lcr-a1-title font-bold text-[15px] mb-0">LCR Form No. 1A</p>
                <p className="text-[15px] mb-0">(Birth-Available)</p>
              </div>
              <p className="text-[15px] font-medium shrink-0">{formDate}</p>
            </div>

            <div className="lcr-a1-body flex flex-col flex-1 min-h-0 leading-snug text-[17px] gap-3">
          <p className="font-bold text-center mb-0">TO WHOM IT MAY CONCERN:</p>
          <p className="leading-snug text-justify mb-0">
            WE CERTIFY that, among others, the following facts of birth appear in our Register of Births on Page <span className="fill-blank inline-block px-0.5 min-w-[1.5rem] text-center font-bold underline">{data.colbPageNumber || '—'}</span> of Book number <span className="fill-blank inline-block px-0.5 min-w-[2rem] text-center font-bold underline">{data.colbBookNumber || '—'}</span>
          </p>

          <table className="lcr-a1-table w-full border-collapse border border-black table-fixed text-[18px]">
            <tbody>
              <tr><td className="py-0.25 px-1 border border-black font-medium align-top w-28">LCR Registry Number</td><td className="py-0.25 px-1 border border-black font-bold text-center">{data.colbRegistryNo || '—'}</td></tr>
              <tr><td className="py-0.25 px-1 border border-black font-medium align-top">Date of Registration</td><td className="py-0.25 px-1 border border-black font-bold text-center">{formatDateLong(data.colbDateOfRegistration) || '—'}</td></tr>
              <tr><td className="py-0.25 px-1 border border-black font-medium align-top">Name of Child</td><td className="py-0.25 px-1 border border-black font-bold text-center">{childFull || '—'}</td></tr>
              <tr><td className="py-0.25 px-1 border border-black font-medium align-top">Sex</td><td className="py-0.25 px-1 border border-black font-bold text-center">{data.sex || '—'}</td></tr>
              <tr><td className="py-0.25 px-1 border border-black font-medium align-top">Date of Birth</td><td className="py-0.25 px-1 border border-black font-bold text-center">{formatDateLong(data.dateOfBirth) || '—'}</td></tr>
              <tr><td className="py-0.25 px-1 border border-black font-medium align-top">Place of Birth</td><td className="py-0.25 px-1 border border-black font-bold text-center leading-tight"><span>{placeOfBirthLine1}</span>{placeOfBirthLine2 && <><br /><span>{placeOfBirthLine2}</span></>}</td></tr>
              <tr><td className="py-0.25 px-1 border border-black font-medium align-top">Name of Mother</td><td className="py-0.25 px-1 border border-black font-bold text-center">{motherFull || '—'}</td></tr>
              <tr><td className="py-0.25 px-1 border border-black font-medium align-top">Citizenship of Mother</td><td className="py-0.25 px-1 border border-black font-bold text-center">{data.motherCitizenship || '—'}</td></tr>
              <tr><td className="py-0.25 px-1 border border-black font-medium align-top">Name of Father</td><td className="py-0.25 px-1 border border-black font-bold text-center">{fatherFull || '—'}</td></tr>
              <tr><td className="py-0.25 px-1 border border-black font-medium align-top">Citizenship of Father</td><td className="py-0.25 px-1 border border-black font-bold text-center">{data.fatherCitizenship || '—'}</td></tr>
              <tr><td className="py-0.25 px-1 border border-black font-medium align-top">Date of Marriage of Parents</td><td className="py-0.25 px-1 border border-black font-bold text-center">NOT APPLICABLE</td></tr>
              <tr><td className="py-0.25 px-1 border border-black font-medium align-top">Place of Marriage of Parents</td><td className="py-0.25 px-1 border border-black font-bold text-center">NOT APPLICABLE</td></tr>
            </tbody>
          </table>

          <p className="text-center leading-snug mb-0">This certification is issued upon the request of OCRG/OWNER/PARENTS/GUARDIAN for any legal purposes.</p>

          <div className="lcr-a1-remarks">
            <p className="font-bold mb-0.5">REMARKS:</p>
            <p className="leading-snug mb-0">
              &quot;The child shall be known as pursuant to RA 9255.&quot; <span className="font-bold underline">{childFull || '—'}</span>
            </p>
          </div>

          <div className="lcr-a1-signature">
            <p className="font-medium mb-0.5">Verified by:</p>
            <div className="border-b border-black w-full my-1 min-h-[1.25em]" aria-hidden="true" />
            <div className="flex justify-between items-start gap-3 mt-1">
              <div className="text-left">
                <p className="font-bold">{regOfficerName}</p>
                <p className="text-sm mt-0">Registration Officer IV</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{ccrName}</p>
                <p className="text-sm mt-0">City Civil Registrar</p>
              </div>
            </div>
          </div>

          <p className="lcr-a1-note italic leading-snug mb-0">Note: This certification is not valid if it has mark, erasure or alteration of any entry.</p>

            </div>
          </div>
        </div>

        <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} contentClassName="text-[14px]" />
      </div>
    </div>
  )
}
