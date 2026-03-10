import React from 'react'
import { formatDateLong, formatDateCert, fullName } from '../../../lib/printUtils'
import { DocumentFooter } from '../../../components/print'

export default function LcrForm1ABirthAvailable({ data }) {
  const childFull = fullName(data.childFirst, data.childMiddle, data.fatherLast) || fullName(data.childFirst, data.childMiddle, data.childLast)
  const motherFull = fullName(data.motherFirst, data.motherMiddle, data.motherLast)
  const fatherFull = fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const placeOfBirthLine1 = [data.placeOfBirthAddress, data.placeOfBirthCity].filter(Boolean).join(' ') || '—'
  const placeOfBirthLine2 = data.placeOfBirthProvince || ''
  const formDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const regOfficerName = data.certificateSignatoryName || 'LORELIE L. CANTO'
  const ccrName = data.cityCivilRegistrarName || ''

  return (
    <div className="ausf-doc print-doc print-doc-lcr-1a bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-4 flex flex-col">
      <div className="flex justify-between items-start mb-4 shrink-0">
        <div>
          <p className="font-bold text-base">LCR Form No. 1A</p>
          <p className="text-sm">(Birth-Available)</p>
        </div>
        <p className="text-sm font-medium">{formDate}</p>
      </div>
      <p className="font-bold mb-2">TO WHOM IT MAY CONCERN:</p>
      <p className="mb-4">
        WE CERTIFY that, among others, the following facts of birth appear in our Register of Births on Page <span className="fill-blank inline-block px-1 min-w-[2rem] text-center font-bold">{data.colbPageNumber || '—'}</span> of Book number <span className="fill-blank inline-block px-1 min-w-[3rem] text-center font-bold">{data.colbBookNumber || '—'}</span>
      </p>
      <table className="w-full border-collapse text-sm mb-4 border border-black">
        <tbody>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top w-48">LCR Registry Number</td><td className="py-1.5 px-2 border border-black font-bold text-center">{data.colbRegistryNo || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Date of Registration</td><td className="py-1.5 px-2 border border-black font-bold text-center">{formatDateLong(data.colbDateOfRegistration) || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Name of Child</td><td className="py-1.5 px-2 border border-black font-bold text-center">{childFull || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Sex</td><td className="py-1.5 px-2 border border-black font-bold text-center">{data.sex || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Date of Birth</td><td className="py-1.5 px-2 border border-black font-bold text-center">{formatDateLong(data.dateOfBirth) || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Place of Birth</td><td className="py-1.5 px-2 border border-black font-bold text-center"><span>{placeOfBirthLine1}</span>{placeOfBirthLine2 && <><br /><span>{placeOfBirthLine2}</span></>}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Name of Mother</td><td className="py-1.5 px-2 border border-black font-bold text-center">{motherFull || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Citizenship of Mother</td><td className="py-1.5 px-2 border border-black font-bold text-center">{data.motherCitizenship || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Name of Father</td><td className="py-1.5 px-2 border border-black font-bold text-center">{fatherFull || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Citizenship of Father</td><td className="py-1.5 px-2 border border-black font-bold text-center">{data.fatherCitizenship || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Date of Marriage of Parents</td><td className="py-1.5 px-2 border border-black font-bold text-center">NOT APPLICABLE</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Place of Marriage of Parents</td><td className="py-1.5 px-2 border border-black font-bold text-center">NOT APPLICABLE</td></tr>
        </tbody>
      </table>
      <p className="mb-4 text-sm">This certification is issued upon the request of OCRG/OWNER/PARENTS/GUARDIAN for any legal purposes.</p>
      <div className="mb-4">
        <p className="font-bold text-sm mb-1">REMARKS:</p>
        <p className="text-sm">
          &quot;The child shall be known as pursuant to RA 9255.&quot; <span className="fill-blank inline-block px-1 min-w-[12rem] align-bottom font-bold">{childFull || '—'}</span>
        </p>
      </div>
      <p className="font-medium mb-2">Verified by:</p>
      <div className="mb-6">
        <span className="inline-block border-b border-black w-full min-h-[2rem] mb-4" aria-hidden />
        <div className="flex justify-between items-start gap-8">
          <div className="text-left">
            <p className="font-bold text-sm">{regOfficerName}</p>
            <p className="text-xs">Registration Officer IV</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm">{ccrName}</p>
            <p className="text-xs italic">City Civil Registrar</p>
          </div>
        </div>
      </div>
      <p className="font-bold text-sm mb-4 shrink-0">Note: This certification is not valid if it has mark, erasure or alteration of any entry.</p>
      <div className="mt-auto shrink-0">
        <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
      </div>
    </div>
  )
}
