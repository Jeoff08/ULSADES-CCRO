import React from 'react'
import { formatDateCert } from '../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter } from '../../components/print'

/**
 * Court decree Certificate of Registration (output matches sample PDF).
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
    <div className="ausf-doc print-doc print-doc-cert-registration bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-4 leading-normal">
      <PrintHeaderRow />
      <hr className="border-black my-2" />

      <h2 className="text-center font-bold text-xl uppercase mb-6 tracking-tight">CERTIFICATE OF REGISTRATION</h2>

      <p className="font-bold mb-4">TO WHOM IT MAY CONCERN:</p>

      <p className="mb-4 text-justify">
        THIS IS TO CERTIFY that the decision under {data.typeOfCase || 'Civil Case No.'} <span className="font-bold underline">{caseNo}</span> issued on <span className="font-bold underline">{dateIssued}</span> rendered by Judge <span className="font-bold underline">{judgeName}</span> of the <span className="font-bold underline">{court}</span>, RE: <span className="font-bold underline">{caseTitle}</span>, was already received by this office on <span className="font-bold underline">{dateReceived}</span> and therefore included in the official record of this office under Registry No. <span className="font-bold underline">{registryNo}</span>.
      </p>

      <p className="mb-4 text-justify">
        This certification is issued upon the request of the interested party for whatever legal purposes it may serve.
      </p>

      <p className="mb-8 text-justify">
        Issued this <span className="font-bold underline">{issuedDate}</span> at Iligan City, Philippines.
      </p>

      <div className="mb-6">
        <p className="font-bold uppercase">{signatory}</p>
        <p className="text-sm italic">City Civil Registrar</p>
      </div>
      <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
    </div>
  )
}
