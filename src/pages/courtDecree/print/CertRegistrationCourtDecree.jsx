import React from 'react'
import { formatDateCert } from '../../../lib/printUtils'
import { DocumentHeader, DocumentFooter } from '../../../components/print'

/**
 * Court decree Certificate of Registration (output matches sample PDF).
 * Layout and print PDF match CertAuthenticityCourtDecree.
 * Data: caseNo, dateIssued, issuedByName, courtThatIssued, caseTitle, dateRegistered, registryNumber, issuance date, signatory.
 */
export default function CertRegistrationCourtDecree({ data }) {
  const caseNo = data.caseNo || '—'
  const dateIssued = data.dateIssued || '—'
  const judgeName = data.issuedByName || '—'
  const court = data.courtThatIssued || '—'
  const caseTitle = (data.caseTitle || '—').toUpperCase()
  const dateReceived = data.dateRegistered || '—'
  const registryNo = data.registryNumber != null && data.registryNumber !== '' ? data.registryNumber : '—'
  const issuedDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const signatory = (data.cityCivilRegistrarName || 'YUSSIF DON JUSTIN F. MARTIL').toUpperCase()

  return (
    <div className="ausf-doc print-doc print-doc-cert-registration bg-white text-black text-base max-w-[210mm] mx-auto px-6 py-4 leading-relaxed flex flex-col min-h-[297mm]">
      <DocumentHeader registryNo={data.registryNumber} />

      <div className="print-doc-body flex flex-col flex-1 min-h-0">
        <h2 className="text-center font-bold text-[30px] uppercase mb-6 tracking-tight">CERTIFICATE OF REGISTRATION</h2>

        <p className="font-bold text-[18px] mb-4">TO WHOM IT MAY CONCERN:</p>

        <div className="cert-reg-body cert-auth-body-gaps text-justify text-[18px] leading-[1.8]">
          <p>
            THIS IS TO CERTIFY that the decision under {data.typeOfCase || 'Civil Case No.'} <span className="font-bold underline">{caseNo}</span> issued on <span className="font-bold underline">{dateIssued}</span> rendered by Judge <span className="font-bold underline">{judgeName}</span> of the <span className="font-bold underline">{court}</span>, RE: <span className="font-bold underline">{caseTitle}</span>, was already received by this office on <span className="font-bold underline">{dateReceived}</span> and therefore included in the official record of this office under Registry No. <span className="font-bold underline">{registryNo}</span>.
          </p>
          <p>
            This certification is issued upon the request of the interested party for whatever legal purposes it may serve.
          </p>
          <p>
            Issued this <span className="font-bold underline">{issuedDate}</span> at Iligan City, Philippines.
          </p>
        </div>

        <div className="min-h-[8rem] flex-1" aria-hidden />
      </div>

      <div className="print-doc-footer-wrap mt-auto pt-6 flex flex-col items-start flex-shrink-0">
        <div className="court-decree-cert-signatory-block ml-8 inline-flex flex-col items-center gap-0 leading-none mb-8">
          <p className="court-decree-cert-signatory-name m-0 font-bold uppercase text-[15px]">{signatory}</p>
          <p className="court-decree-cert-signatory-title m-0 text-[13px] italic">City Civil Registrar</p>
        </div>
        <div className="w-full">
          <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
        </div>
      </div>
    </div>
  )
}
