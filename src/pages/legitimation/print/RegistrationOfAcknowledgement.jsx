import React, { useState } from 'react'
import { formatDateLong, fullName } from '../../../lib/printUtils'
import { DocumentHeader, DocumentFooter } from '../../../components/print'

/** Certificate of Registration – Affidavit of Acknowledgement (shell matches Registration of Legitimation). */
export default function RegistrationOfAcknowledgement({ data }) {
  const executorName = fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast).toUpperCase() || ''
  const [registeredDate, setRegisteredDate] = useState(() => formatDateLong(data.affidavitAckDate) || '')
  const [registryNo, setRegistryNo] = useState(() => data.affidavitAckRegistryNo || '')
  const issuedDate = formatDateLong(data.certificateIssuanceDate) || formatDateLong(new Date())
  const signatory = (data.cityCivilRegistrarName || 'ATTY. YUSSIF DON JUSTIN F. MARTIL, REB').toUpperCase()

  return (
    <div className="registration-of-ack-doc ausf-doc print-doc print-doc-cert-auth legitimation-registrar-footer-print legitimation-cert-auth-no-indent bg-white text-black text-base max-w-[210mm] mx-auto px-0 py-4 leading-relaxed flex flex-col min-h-[297mm]">
      <DocumentHeader />

      <div className="print-doc-body flex flex-col flex-1 min-h-0">
        <h2 className="cert-doc-main-title text-center font-bold text-[14pt] uppercase mb-6 tracking-tight">CERTIFICATE OF REGISTRATION</h2>

        <p className="font-bold text-[18px] mb-2">TO WHOM IT MAY CONCERN:</p>

        <div className="cert-auth-body text-justify text-[18px] leading-[1.8] space-y-2">
          <p className="registration-of-ack-certify-line">
            THIS IS TO CERTIFY that the Affidavit of Acknowledgement executed by{' '}
            <span className="font-bold underline uppercase">{executorName}</span>{' '}
            had been registered in this office on{' '}
            <input
              type="text"
              value={registeredDate}
              onChange={(e) => setRegisteredDate(e.target.value)}
              placeholder=""
              className="registration-of-ack-input inline-block border-0 border-b border-black bg-transparent outline-none min-w-[12ch] max-w-[16ch] align-baseline text-inherit font-inherit text-center font-bold p-0"
              aria-label="Registration date"
            />
            <span className={String(registryNo || '').trim() ? 'inline' : 'no-print inline'}>
              {' '}under Registry Number{' '}
              <input
                type="text"
                value={registryNo}
                onChange={(e) => setRegistryNo(e.target.value)}
                placeholder=""
                className="registration-of-ack-input registration-of-ack-registry inline-block border-0 border-b border-black bg-transparent outline-none min-w-[8ch] max-w-[12ch] align-baseline text-inherit font-inherit text-center font-bold p-0"
                aria-label="Registry number"
              />
            </span>
            .
          </p>
          <p>This certification is issued for whatever legal purposes it may serve.</p>
          <p>
            Issued this <span className="font-bold underline">{issuedDate}</span> at Iligan City, Philippines.
          </p>
        </div>

        <div className="flex flex-col items-end mt-16 mb-8">
          <div className="legitimation-registrar-signatory-block mr-0 inline-flex flex-col items-center leading-none text-center">
            <div className="font-bold uppercase text-[15px]">{signatory}</div>
            <div className="text-[13px] italic">City Civil Registrar</div>
          </div>
        </div>

        <div className="min-h-[4rem] flex-1" aria-hidden />
      </div>

      <div className="print-doc-footer-wrap mt-auto pt-6 flex flex-col items-end flex-shrink-0">
        <div className="w-full">
          <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
        </div>
      </div>

      <style>{`
        @media print {
          .registration-of-ack-doc .cert-doc-main-title {
            font-size: 16pt !important;
            line-height: 1.2 !important;
          }
        }
        body.pdf-capture .registration-of-ack-doc .cert-doc-main-title {
          font-size: 16pt !important;
          line-height: 1.2 !important;
        }
        .registration-of-ack-doc .print-doc-footer .text-right p { color: #2563eb; }
        .registration-of-ack-doc .registration-of-ack-input { min-width: 12ch; max-width: 16ch; }
        .registration-of-ack-doc .registration-of-ack-registry { min-width: 8ch; max-width: 12ch; }
        .registration-of-ack-doc .registration-of-ack-input {
          text-align: center;
        }
        @media print {
          .registration-of-ack-doc .registration-of-ack-input {
            -webkit-appearance: none;
            appearance: none;
            background: transparent !important;
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  )
}
