import React from 'react'
import { formatDateCert, formatDateLong, fullName } from '../../../lib/printUtils'
import { DocumentFooter, PrintHeaderRow } from '../../../components/print'

/** Certificate of Registration – Affidavit of Acknowledgement (layout matches provided certificate sample). */
export default function RegistrationOfAcknowledgement({ data }) {
  const executorName = fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast).toUpperCase() || '—'
  const registeredDate = formatDateLong(data.affidavitAckDate) || '—'
  const registryNo = data.affidavitAckRegistryNo || '—'
  const issuedDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const signatory = (data.cityCivilRegistrarName || 'YUSSIF DON JUSTIN F. MARTIL').toUpperCase()

  return (
    <div className="registration-of-ack-doc ausf-doc print-doc bg-white text-black text-base max-w-[210mm] mx-auto px-6 py-4 leading-relaxed flex flex-col min-h-[297mm]">
      <header className="print-doc-header mb-4">
        <PrintHeaderRow />
        <hr className="border-black border-t my-2" />
      </header>

      <h2 className="text-center font-bold text-[26px] uppercase mb-6 tracking-tight">CERTIFICATE OF REGISTRATION</h2>

      <p className="font-bold text-[18px] mb-4">TO WHOM IT MAY CONCERN:</p>

      <div className="text-justify text-[18px] leading-[1.8] space-y-3">
        <p>
          THIS IS TO CERTIFY that the Affidavit of Acknowledgement executed by{' '}
          <span className="font-bold underline uppercase">{executorName}</span>{' '}
          had been registered in this office on{' '}
          <span className="underline">{registeredDate}</span> under Registry Number{' '}
          <span className="underline">{registryNo}</span>.
        </p>
        <p className="mt-4">
          This certification is issued for whatever legal purposes it may serve.
        </p>
        <p className="mt-4">
          Issued this <span className="font-bold underline">{issuedDate}</span> at Iligan City, Philippines.
        </p>
      </div>

      <div className="min-h-[6rem] flex-1" aria-hidden />

      <div className="mt-auto pt-6 flex flex-col items-start">
        <div className="w-64 border-b border-black mb-1" aria-hidden />
        <p className="font-bold uppercase text-[18px]">{signatory}</p>
        <p className="text-base">City Civil Registrar</p>
        <div className="w-full mt-6">
          <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
        </div>
      </div>

      <style>{`
        .registration-of-ack-doc .print-doc-footer .text-right p { color: #2563eb; }
      `}</style>
    </div>
  )
}
