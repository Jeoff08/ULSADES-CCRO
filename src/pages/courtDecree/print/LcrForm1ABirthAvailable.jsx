import React from 'react'
import { formatDateLong, formatDateCert, formatLcrFormShortDate, fullName, parseDdMmYyyyToDate } from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'

/** LCR Form No. 1A (Birth-Available). Data from Legitimation (child, parents, COLB, place/date of birth, marriage of parents). */
export default function LcrForm1ABirthAvailable({ data }) {
  const childFull = fullName(data.childFirst, data.childMiddle, data.fatherLast) || fullName(data.childFirst, data.childMiddle, data.childLast)
  const motherFull = fullName(data.motherFirst, data.motherMiddle, data.motherLast)
  const fatherFull = fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const placeOfBirthAddr = data.placeOfBirthAddress ?? data.placeOfBirthStreet
  const placeOfBirthLine1 = [placeOfBirthAddr, data.placeOfBirthCity].filter(Boolean).join(' ') || '—'
  const placeOfBirthLine2 = data.placeOfBirthProvince || ''
  const colbPage = data.colbPageNumber ?? data.colbPageNo
  const colbBook = data.colbBookNumber ?? data.colbBookNo
  const colbRegDate = data.colbDateOfRegistration ?? data.colbRegDate
  const dateOfMarriageParents = data.dateOfMarriageOfParents ?? data.dateOfMarriage
  const placeOfMarriageParents = data.placeOfMarriageOfParents ?? [data.placeOfMarriageCity, data.placeOfMarriageProvince, data.placeOfMarriageCountry].filter(Boolean).join(', ')
  const formDate = (() => {
    const raw = data.certificateIssuanceDate
    const p = parseDdMmYyyyToDate(raw)
    if (p) return formatDateCert(p.toISOString().slice(0, 10))
    return formatDateCert(raw) || formatDateCert(new Date())
  })()
  const regOfficerName = data.certificateSignatoryName || 'SHIRLY L. DEMECILLO'
  const ccrName = data.cityCivilRegistrarName || 'YUSSIF DON JUSTIN F. MARTIL'

  return (
    <div className="ausf-doc print-doc print-doc-lcr-1a court-decree-lcr-form bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-2 flex flex-col">
      <div className="court-decree-lcr-header shrink-0">
        <PrintHeaderRow />
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="font-bold text-base">LCR Form No. 1A</p>
            <p className="text-sm">(Birth-Available)</p>
          </div>
          <p className="text-sm font-medium">{formDate}</p>
        </div>
      </div>
      <div className="court-decree-lcr-body-wrap flex-1 min-h-0 flex flex-col">
        <div className="court-decree-lcr-body-scaled">
          <p className="font-bold mb-1">TO WHOM IT MAY CONCERN:</p>
          <p className="mb-2 text-left court-decree-lcr-body">
            <span className="font-bold">WE CERTIFY</span> that, among others, the following facts of birth appear in our Register of Births on Page <span className="inline-block border-b border-black px-1 min-w-[2rem] text-center font-bold">{colbPage || ''}</span> of Book number <span className="inline-block border-b border-black px-1 min-w-[3rem] text-center font-bold">{colbBook || ''}</span>.
          </p>
          <table className="w-full border-collapse text-sm mb-2 border border-black court-decree-lcr-table">
            <tbody>
              <tr><td className="py-1 px-2 border border-black font-medium align-top w-48">LCR Registry Number</td><td className="py-1 px-2 border border-black font-bold text-center">{data.colbRegistryNo || '—'}</td></tr>
              <tr><td className="py-1 px-2 border border-black font-medium align-top">Date of Registration</td><td className="py-1 px-2 border border-black font-bold text-center">{formatLcrFormShortDate(colbRegDate) || formatDateLong(colbRegDate) || '—'}</td></tr>
              <tr><td className="py-1 px-2 border border-black font-medium align-top">Name of Child</td><td className="py-1 px-2 border border-black font-bold text-center">{childFull || '—'}</td></tr>
              <tr><td className="py-1 px-2 border border-black font-medium align-top">Sex</td><td className="py-1 px-2 border border-black font-bold text-center">{data.sex || '—'}</td></tr>
              <tr><td className="py-1 px-2 border border-black font-medium align-top">Date of Birth</td><td className="py-1 px-2 border border-black font-bold text-center">{formatLcrFormShortDate(data.dateOfBirth) || formatDateLong(data.dateOfBirth) || '—'}</td></tr>
              <tr><td className="py-1 px-2 border border-black font-medium align-top">Place of Birth</td><td className="py-1 px-2 border border-black font-bold text-center"><span>{placeOfBirthLine1}</span>{placeOfBirthLine2 && <><br /><span>{placeOfBirthLine2}</span></>}</td></tr>
              <tr><td className="py-1 px-2 border border-black font-medium align-top">Name of Mother</td><td className="py-1 px-2 border border-black font-bold text-center">{motherFull || '—'}</td></tr>
              <tr><td className="py-1 px-2 border border-black font-medium align-top">Citizenship of Mother</td><td className="py-1 px-2 border border-black font-bold text-center">{data.motherCitizenship || '—'}</td></tr>
              <tr><td className="py-1 px-2 border border-black font-medium align-top">Name of Father</td><td className="py-1 px-2 border border-black font-bold text-center">{fatherFull || '—'}</td></tr>
              <tr><td className="py-1 px-2 border border-black font-medium align-top">Citizenship of Father</td><td className="py-1 px-2 border border-black font-bold text-center">{data.fatherCitizenship || '—'}</td></tr>
              <tr><td className="py-1 px-2 border border-black font-medium align-top">Date of Marriage of Parents</td><td className="py-1 px-2 border border-black font-bold text-center">{dateOfMarriageParents ? (formatLcrFormShortDate(dateOfMarriageParents) || formatDateLong(dateOfMarriageParents)) : '—'}</td></tr>
              <tr><td className="py-1 px-2 border border-black font-medium align-top">Place of Marriage of Parents</td><td className="py-1 px-2 border border-black font-bold text-center">{placeOfMarriageParents || '—'}</td></tr>
            </tbody>
          </table>
          <p className="mb-2 text-sm italic court-decree-lcr-body">This certification is issued upon the request of OCRG/OWNER/PARENTS/GUARDIAN for any legal purposes.</p>
          <div className="mb-2 court-decree-lcr-body">
            <p className="font-bold text-sm mb-0.5">REMARKS:</p>
            <p className="text-sm text-justify">{data.remarks || ''}</p>
          </div>
          <div className="mb-2 flex justify-between items-end gap-8 court-decree-lcr-body">
            <div className="text-left">
              <p className="font-bold text-sm mb-0.5">Verified by:</p>
              <p className="font-bold text-sm border-b border-black inline-block">{regOfficerName}</p>
              <p className="text-xs mt-0.5">LCR - Staff</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm border-b border-black inline-block">{ccrName}</p>
              <p className="text-xs mt-0.5">City Civil Registrar</p>
            </div>
          </div>
          <p className="font-bold text-sm mb-2 court-decree-lcr-body">Note: This certification is not valid if it has mark, erasure or alteration of any entry.</p>
        </div>
      </div>
      <div className="court-decree-lcr-footer mt-auto shrink-0">
        <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} sloganBlue />
      </div>
    </div>
  )
}
