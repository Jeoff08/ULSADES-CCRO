import React from 'react'
import { formatDateCert, formatDateLong, fullName } from '../../../lib/printUtils'
import { DocumentHeader, DocumentFooter } from '../../../components/print'

/** ANNOTATION – legitimation form print. */
export default function Annotation({ data }) {
  const childFull = fullName(data.childFirst, data.childMiddle, data.childLast)
  const motherFull = fullName(data.motherFirst, data.motherMiddle, data.motherLast)
  const fatherFull = fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const dateMarriage = formatDateLong(data.dateOfMarriage) || '—'
  const place = [data.placeOfMarriageCity, data.placeOfMarriageProvince, data.placeOfMarriageCountry].filter(Boolean).join(', ').trim()
  const atPlace = place ? ` at ${place.toUpperCase()}` : ''
  const regNoTrim = String(data.affidavitLegitRegistryNo || '').trim()
  const regClause = regNoTrim ? ` under registry number ${regNoTrim}` : ''
  const selected = String(data.legitimationAnnotationOption || '').trim().toUpperCase()
  const withAck = selected === 'B' ? true : selected === 'A' ? false : data.acknowledgedByFatherInColb === 'YES'

  const annotationWithAck = `Legitimated by the subsequent marriage of parents ${(fatherFull || '').toUpperCase()} and ${(motherFull || '').toUpperCase()} on ${dateMarriage.toUpperCase()}${atPlace}${regClause}. The child shall be known as ${(childFull || '').toUpperCase()}.`
  const annotationWithoutAck = `Legitimated by the subsequent marriage of parents ${(fatherFull || '').toUpperCase()} and ${(motherFull || '').toUpperCase()} on ${dateMarriage.toUpperCase()}${atPlace}${regClause}.`

  const annotationText = withAck ? annotationWithAck : annotationWithoutAck
  const issuedDate = formatDateLong(data.certificateIssuanceDate) || formatDateLong(new Date())
  const signatory = (data.cityCivilRegistrarName || 'ATTY. YUSSIF DON JUSTIN F. MARTIL, REB').toUpperCase()

  return (
    <div className="ausf-doc print-doc legitimation-annotation-doc bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-4 leading-normal flex flex-col min-h-[297mm]">
      <DocumentHeader registryNo={data.colbRegistryNo} />

      <h2 className="text-center font-bold text-xl uppercase mb-6 tracking-tight">ANNOTATION</h2>

      <p className="legitimation-annotation-to-whom font-bold mb-4 text-[18px]">TO WHOM IT MAY CONCERN:</p>

      <div className="legitimation-annotation-body space-y-6 text-justify leading-[2]">
        <p>
          The following annotation is applicable for the child <span className="font-bold">{childFull || '—'}</span>:
        </p>
        <p className="font-bold italic py-2">
          {annotationText}
        </p>
        <p>
          Issued this <span className="font-bold underline">{issuedDate}</span> at Iligan City, Philippines.
        </p>
      </div>

      <div className="min-h-[8rem] flex-1" aria-hidden />

      <div className="legitimation-annotation-body mt-auto pt-6 flex flex-col items-start">
        <div className="flex flex-col items-start text-left mb-8">
          <p className="font-bold uppercase">{signatory}</p>
          <p className="text-sm italic">City Civil Registrar</p>
        </div>
        <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
      </div>
    </div>
  )
}
