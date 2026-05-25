import React from 'react'
import { formatDateCert, formatDateLong, fullName } from '../../../lib/printUtils'
import { DocumentHeader, DocumentFooter } from '../../../components/print'

/** REGISTRATION OF LEGITIMATION – legitimation form print (layout matches Certificate of Authenticity). */
export default function RegistrationOfLegitimation({ data }) {
  const childFull = fullName(data.childFirst, data.childMiddle, data.childLast)
  const motherFull = fullName(data.motherFirst, data.motherMiddle, data.motherLast)
  const fatherFull = fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const issuedDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const signatory = (data.cityCivilRegistrarName || 'ATTY. YUSSIF DON JUSTIN F. MARTIL, REB').toUpperCase()
  const legitRegistryTrim = String(data.affidavitLegitRegistryNo || '').trim()

  return (
    <div className="ausf-doc print-doc print-doc-cert-auth legitimation-registrar-footer-print legitimation-cert-auth-no-indent bg-white text-black text-base max-w-[210mm] mx-auto px-0 py-4 leading-relaxed flex flex-col min-h-[297mm]">
      <DocumentHeader />

      <div className="print-doc-body flex flex-col flex-1 min-h-0">
        <h2 className="cert-doc-main-title text-center font-bold text-[14pt] uppercase mb-6 tracking-tight">REGISTRATION OF LEGITIMATION</h2>

        <p className="font-bold text-[18px] mb-2">TO WHOM IT MAY CONCERN:</p>

        <div className="cert-auth-body text-justify text-[18px] leading-[1.8] space-y-2">
          <p>
            THIS IS TO CERTIFY that the Affidavit of Legitimation in favor of <span className="font-bold underline">{childFull || '—'}</span> had been
            registered in this office on{' '}
            <span className="font-bold underline">
              {(legitRegistryTrim ? formatDateLong(data.affidavitLegitDate) : formatDateCert(data.affidavitLegitDate)) || '—'}
            </span>
            {legitRegistryTrim ? (
              <>
                {' '}under Registry Number <span className="font-bold underline">{legitRegistryTrim}</span>
              </>
            ) : null}
            .
          </p>
          <p>
            This certification is issued for whatever legal purposes it may serve.
          </p>
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
          .legitimation-registrar-footer-print .cert-doc-main-title {
            font-size: 16pt !important;
            line-height: 1.2 !important;
          }
        }
        body.pdf-capture .legitimation-registrar-footer-print .cert-doc-main-title {
          font-size: 16pt !important;
          line-height: 1.2 !important;
        }
      `}</style>
    </div>
  )
}
