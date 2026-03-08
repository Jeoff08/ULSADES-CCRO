import React from 'react'
import { formatDateCert } from '../../../lib/printUtils'
import { DocumentHeader, DocumentFooter } from '../../../components/print'

/** ANNOTATION FOR FORM 2A – court decree. Layout matches Certificate of Authenticity. */
export default function AnnotationForForm2A({ data }) {
  const issuedDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const signatory = (data.cityCivilRegistrarName || 'YUSSIF DON JUSTIN F. MARTIL').toUpperCase()

  return (
    <div className="ausf-doc print-doc print-doc-cert-auth bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-4 leading-normal flex flex-col min-h-[297mm]">
      <DocumentHeader registryNo={data.registryNumber} />

      <h2 className="text-center font-bold text-xl uppercase mb-6 tracking-tight">ANNOTATION FOR FORM 2A</h2>

      <p className="font-bold mb-4">TO WHOM IT MAY CONCERN:</p>

      <div className="cert-auth-body space-y-6 text-justify leading-[2]">
        <p>
          This document is issued in relation to the court decree. Please follow the standard annotation instructions for LCR Form 2A.
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
        <div className="w-full">
          <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
        </div>
      </div>
    </div>
  )
}
