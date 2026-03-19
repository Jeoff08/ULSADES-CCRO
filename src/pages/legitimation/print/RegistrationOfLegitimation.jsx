import React from 'react'
import { formatDateCert, fullName } from '../../../lib/printUtils'
import { DocumentHeader, DocumentFooter } from '../../../components/print'

/** REGISTRATION OF LEGITIMATION – legitimation form print (layout matches Certificate of Authenticity). */
export default function RegistrationOfLegitimation({ data }) {
  const childFull = fullName(data.childFirst, data.childMiddle, data.childLast)
  const motherFull = fullName(data.motherFirst, data.motherMiddle, data.motherLast)
  const fatherFull = fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const issuedDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const signatory = (data.cityCivilRegistrarName || 'YUSSIF DON JUSTIN F. MARTIL').toUpperCase()

  return (
    <div className="ausf-doc print-doc print-doc-cert-auth legitimation-registrar-footer-print bg-white text-black text-base max-w-[210mm] mx-auto px-6 py-4 leading-relaxed flex flex-col min-h-[297mm]">
      <DocumentHeader registryNo={data.affidavitLegitRegistryNo} />

      <div className="print-doc-body flex flex-col flex-1 min-h-0">
        <h2 className="text-center font-bold text-[30px] uppercase mb-6 tracking-tight">REGISTRATION OF LEGITIMATION</h2>

        <p className="font-bold text-[18px] mb-4">TO WHOM IT MAY CONCERN:</p>

        <div className="cert-auth-body cert-auth-body-gaps text-justify text-[18px] leading-[1.8]">
          <p>
            This certifies the registration of legitimation for the child <span className="font-bold underline">{childFull || '—'}</span>,
            parents <span className="font-bold underline">{fatherFull || '—'}</span> and <span className="font-bold underline">{motherFull || '—'}</span>.
          </p>
          <p>
            Registry No. <span className="font-bold underline">{data.affidavitLegitRegistryNo || '—'}</span> dated <span className="font-bold underline">{formatDateCert(data.affidavitLegitDate) || '—'}</span>.
          </p>
          <p>
            Issued this <span className="font-bold underline">{issuedDate}</span> at Iligan City, Philippines.
          </p>
        </div>

        <div className="min-h-[8rem] flex-1" aria-hidden />
      </div>

      <div className="print-doc-footer-wrap mt-auto pt-6 flex flex-col items-end flex-shrink-0">
        <div className="flex flex-col items-end mb-8">
          <div className="legitimation-registrar-signatory-block mr-10 inline-flex flex-col items-center leading-none text-center">
            <div className="font-bold uppercase text-[15px]">{signatory}</div>
            <div className="text-[13px] italic">City Civil Registrar</div>
          </div>
        </div>
        <div className="w-full">
          <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
        </div>
      </div>
    </div>
  )
}
