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
  const ackName = data.applicantName || fatherFull || '—'
  const regOfficerName = data.certificateSignatoryName || 'LORELIE L. CANTO'
  const ccrName = data.cityCivilRegistrarName || ''

  return (
    <div className="lcr-a1-print-root">
      <div className="ausf-doc print-doc print-doc-lcr-a1 bg-white text-black max-w-[210mm] mx-auto flex flex-col">
        <header className="lcr-a1-header shrink-0 lcr-a1-header-tight">
          <PrintHeaderRow
            rightContent={
              <div className="flex flex-col items-end shrink-0">
                <img src={LOGO_RIGHT_SRC} alt="Office of the City Civil Registrar" className="lcr-a1-logo w-14 h-14 object-contain shrink-0" />
                <p className="text-[11px] font-medium mt-0">{formDate}</p>
              </div>
            }
          />
          <div className="flex items-baseline gap-1 mt-0">
            <p className="font-bold text-xs">LCR Form No. 1A</p>
            <p className="text-[10px]">(Birth-Available)</p>
          </div>
        </header>

        <div className="lcr-a1-body flex flex-col flex-1 min-h-0 text-[12px] gap-0 leading-tight">
          <p className="font-bold mb-0 mt-0">TO WHOM IT MAY CONCERN:</p>
          <p className="mb-0 mt-0 leading-tight">
            WE CERTIFY that, among others, the following facts of birth appear in our Register of Births on Page <span className="fill-blank inline-block px-0.5 min-w-[1.5rem] text-center font-bold">{data.colbPageNumber || '—'}</span> of Book number <span className="fill-blank inline-block px-0.5 min-w-[2rem] text-center font-bold">{data.colbBookNumber || '—'}</span>
          </p>

          <table className="lcr-a1-table w-full border-collapse my-0 border border-black table-fixed">
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

          <p className="text-center my-0 leading-tight">This certification is issued upon the request of OCRG/OWNER/PARENTS/GUARDIAN for any legal purposes.</p>

          <div className="lcr-a1-remarks my-0">
            <p className="font-bold mb-0 mt-0">REMARKS:</p>
            <p className="leading-tight mt-0 mb-0">
              Acknoweledged by <span className="fill-blank inline-block px-0.5 min-w-[8rem] align-bottom font-bold">{ackName}</span>
              {' '}on <span className="fill-blank inline-block px-0.5 min-w-[5rem] align-bottom font-bold">{formatDateLong(data.ackDateOfRegistration) || '—'}</span>
              {' '}under Registry Number <span className="fill-blank inline-block px-0.5 min-w-[4rem] align-bottom font-bold">{data.ackRegistryNo || '—'}</span>. The child
              {' '}shall be known as <span className="fill-blank inline-block px-0.5 min-w-[8rem] align-bottom font-bold">{childFull || '—'}</span>
            </p>
          </div>

          <div className="lcr-a1-signature my-0">
            <p className="font-medium mb-0 mt-0">Verified by:</p>
            <div className="flex justify-between items-start gap-3 mt-0">
              <div className="text-left">
                <p className="font-bold">{regOfficerName}</p>
                <p>Registration Officer IV</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{ccrName}</p>
                <p className="italic">City Civil Registrar</p>
              </div>
            </div>
          </div>

          <p className="lcr-a1-note font-bold my-0 leading-tight">Note: This certification is not valid if it has mark, erasure or alteration of any entry.</p>

          <div className="lcr-a1-footer shrink-0 mt-auto lcr-a1-footer-no-hr lcr-a1-footer-tight">
            <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
          </div>
        </div>
      </div>
    </div>
  )
}
