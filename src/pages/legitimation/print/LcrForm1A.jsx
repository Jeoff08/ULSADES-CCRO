import React from 'react'
import { formatDateCert, fullName } from '../../../lib/printUtils'
import { DocumentHeader, DocumentFooter } from '../../../components/print'

/** LCR FORM 1A – legitimation form print. */
export default function LcrForm1A({ data }) {
  const childFull = fullName(data.childFirst, data.childMiddle, data.childLast)
  const motherFull = fullName(data.motherFirst, data.motherMiddle, data.motherLast)
  const fatherFull = fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const issuedDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const signatory = (data.cityCivilRegistrarName || 'YUSSIF DON JUSTIN F. MARTIL').toUpperCase()

  return (
    <div className="ausf-doc print-doc bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-4 leading-normal flex flex-col min-h-[297mm]">
      <DocumentHeader registryNo={data.colbRegistryNo} />

      <h2 className="text-center font-bold text-xl uppercase mb-6 tracking-tight">LCR FORM 1A</h2>

      <p className="font-bold mb-4">TO WHOM IT MAY CONCERN:</p>

      <div className="space-y-6 text-justify leading-[2]">
        <p>
          This certifies that the birth of <span className="font-bold">{childFull || '—'}</span> has been registered.
          Parents: {fatherFull || '—'} and {motherFull || '—'}.
        </p>
        <p>
          COLB Registry No. <span className="font-bold">{data.colbRegistryNo || '—'}</span> dated {formatDateCert(data.colbRegDate) || '—'}.
        </p>
        <p>
          Issued this <span className="font-bold underline">{issuedDate}</span> at Iligan City, Philippines.
        </p>
      </div>

      <div className="min-h-[8rem] flex-1" aria-hidden />

      <div className="mt-auto pt-6 flex flex-col items-end">
        <div className="flex flex-col items-end text-right mb-8">
          <p className="font-bold uppercase">{signatory}</p>
          <p className="text-sm italic">City Civil Registrar</p>
        </div>
        <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
      </div>
    </div>
  )
}
