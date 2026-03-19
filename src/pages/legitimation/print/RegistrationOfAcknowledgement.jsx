import React, { useState } from 'react'
import { formatDateCert, formatDateLong, fullName } from '../../../lib/printUtils'
import { DocumentFooter, PrintHeaderRow } from '../../../components/print'

/** Certificate of Registration – Affidavit of Acknowledgement (layout matches provided certificate sample). */
export default function RegistrationOfAcknowledgement({ data }) {
  const executorName = fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast).toUpperCase() || ''
  const [registeredDate, setRegisteredDate] = useState(() => formatDateLong(data.affidavitAckDate) || '')
  const [registryNo, setRegistryNo] = useState(() => data.affidavitAckRegistryNo || '')
  const issuedDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const signatory = (data.cityCivilRegistrarName || 'YUSSIF DON JUSTIN F. MARTIL').toUpperCase()

  return (
    <div className="registration-of-ack-doc ausf-doc print-doc legitimation-registrar-footer-print bg-white text-black text-base max-w-[210mm] mx-auto px-6 py-4 leading-relaxed flex flex-col min-h-[297mm]">
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
          <input
            type="text"
            value={registeredDate}
            onChange={(e) => setRegisteredDate(e.target.value)}
            placeholder=""
            className="registration-of-ack-input inline-block border-0 border-b border-black bg-transparent outline-none min-w-[18ch] max-w-[22ch] align-baseline text-inherit font-inherit p-0"
            aria-label="Registration date"
          />{' '}
          under Registry Number{' '}
          <input
            type="text"
            value={registryNo}
            onChange={(e) => setRegistryNo(e.target.value)}
            placeholder=""
            className="registration-of-ack-input registration-of-ack-registry inline-block border-0 border-b border-black bg-transparent outline-none min-w-[10ch] max-w-[14ch] align-baseline text-inherit font-inherit p-0"
            aria-label="Registry number"
          />.
        </p>
        <p className="mt-4">
          This certification is issued for whatever legal purposes it may serve.
        </p>
        <p className="mt-4">
          Issued this <span className="font-bold underline">{issuedDate}</span> at Iligan City, Philippines.
        </p>
      </div>

      <div className="min-h-[6rem] flex-1" aria-hidden />

      <div className="print-doc-footer-wrap mt-auto pt-6 flex flex-col items-end flex-shrink-0">
        <div className="flex flex-col items-end mb-8">
          <div className="legitimation-registrar-signatory-block mr-10 inline-flex flex-col items-center leading-none text-center">
            <div className="font-bold uppercase text-[15px]">{signatory}</div>
            <div className="text-[13px] italic">City Civil Registrar</div>
          </div>
        </div>
        <div className="w-full mt-6">
          <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
        </div>
      </div>

      <style>{`
        .registration-of-ack-doc .print-doc-footer .text-right p { color: #2563eb; }
        .registration-of-ack-doc .registration-of-ack-input { min-width: 18ch; }
        .registration-of-ack-doc .registration-of-ack-registry { min-width: 10ch; }
        @media print {
          .registration-of-ack-doc .registration-of-ack-input {
            -webkit-appearance: none;
            appearance: none;
            background: transparent !important;
          }
        }
      `}</style>
    </div>
  )
}
