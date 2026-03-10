import React from 'react'
import { formatDateCert } from '../../../lib/printUtils'
import { DocumentHeader, DocumentFooter } from '../../../components/print'

/** ANNOTATION FOR FORM 2A – court decree. Print layout matches Certificate of Authenticity. */
export default function AnnotationForForm2A({ data }) {
  const issuedDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const signatory = (data.cityCivilRegistrarName || 'YUSSIF DON JUSTIN F. MARTIL').toUpperCase()

  return (
    <div className="ausf-doc print-doc print-doc-cert-auth bg-white text-black text-base max-w-[210mm] mx-auto px-6 py-4 leading-relaxed flex flex-col min-h-[297mm]">
      <DocumentHeader registryNo={data.registryNumber} />

      <div className="print-doc-body flex flex-col flex-1 min-h-0">
        <h2 className="text-center font-bold text-[30px] uppercase mb-6 tracking-tight">ANNOTATION FOR FORM 2A</h2>

        <p className="font-bold text-[18px] mb-4">TO WHOM IT MAY CONCERN:</p>

        <div className="cert-auth-body cert-auth-body-gaps text-justify text-[18px] leading-[1.8] pl-4 print:pl-6">
          <p>
            This document is issued in relation to the court decree. Please follow the standard annotation instructions for LCR Form 2A.
          </p>
          <p>
            Issued this <span className="font-bold underline">{issuedDate}</span> at Iligan City, Philippines.
          </p>
        </div>

        <div className="min-h-[8rem] flex-1" aria-hidden />
      </div>

      <div className="print-doc-footer-wrap mt-auto pt-6 flex flex-col items-end flex-shrink-0">
        <div className="flex flex-col items-end text-right mb-8 w-full max-w-md">
          <p className="font-bold uppercase">{signatory}</p>
          <p className="text-base italic">City Civil Registrar</p>
        </div>
        <div className="w-full">
          <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
        </div>
      </div>
    </div>
  )
}
