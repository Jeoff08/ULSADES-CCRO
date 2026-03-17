import React from 'react'
import { formatDateCert } from '../../../lib/printUtils'
import { DocumentHeader, DocumentFooter } from '../../../components/print'

/**
 * Court decree Certificate of Authenticity (output matches sample PDF).
 * Data from court decree form: dateIssued, issuedByTitle, issuedByName, typeOfCase, caseNo, authenticatedBy,
 * courtOrRacco (Memo Circular No.), affectedDocument, documentOwnerName, plus certificate issuance date and signatory.
 */
export default function CertAuthenticityCourtDecree({ data }) {
  const dateIssued = data.dateIssued || '—'
  const judgeName = data.issuedByName || (data.issuedByTitle ? `${data.issuedByTitle} ${data.issuedByName || ''}`.trim() : '') || '—'
  const typeOfCase = data.typeOfCase || 'Civil Case No.'
  const caseNo = data.caseNo || '—'
  const authenticatedBy = data.authenticatedBy || '—'
  const memoCircular = data.courtOrRacco || '2012-02'
  const affectedDoc = data.affectedDocument === 'BIRTH_CERTIFICATE' ? 'BIRTH CERTIFICATE' : data.affectedDocument === 'DEATH_CERTIFICATE' ? 'DEATH CERTIFICATE' : 'MARRIAGE CERTIFICATE'
  const documentOwner = (data.documentOwnerName || '—').toUpperCase()
  const issuedDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const signatory = (data.cityCivilRegistrarName || 'YUSSIF DON JUSTIN F. MARTIL').toUpperCase()

  return (
    <div className="ausf-doc print-doc print-doc-cert-auth bg-white text-black text-base max-w-[210mm] mx-auto px-6 py-4 leading-relaxed flex flex-col min-h-[297mm]">
      <DocumentHeader registryNo={data.registryNumber} />

      <div className="print-doc-body flex flex-col flex-1 min-h-0">
        <h2 className="text-center font-bold text-[30px] uppercase mb-6 tracking-tight">CERTIFICATE OF AUTHENTICITY</h2>

        <p className="font-bold text-[18px] mb-4">TO WHOM IT MAY CONCERN:</p>

        <div className="cert-auth-body cert-auth-body-gaps text-justify text-[18px] leading-[1.8]">
          <p>
            THIS IS TO CERTIFY that the attached certified copy of Court Decision/Order dated <span className="font-bold underline">{dateIssued}</span> issued by Judge <span className="font-bold underline">{judgeName}</span>, under {typeOfCase} <span className="font-bold underline">{caseNo}</span>, is the exact copy of what have been confirmed/signed authentic by <span className="font-bold underline">{authenticatedBy}</span>. As such, the Court Decision/Order is registered in the Register of Court Decision / Order pursuant to Memorandum Circular No. <span className="font-bold underline">{memoCircular}</span>.
          </p>
          <p>
            This certification is issued for the purpose of processing of the amended/annotated <span className="font-bold underline">{affectedDoc}</span> of <span className="font-bold underline">{documentOwner}</span>.
          </p>
          <p>
            Issued this <span className="font-bold underline">{issuedDate}</span> at Iligan City, Philippines.
          </p>
        </div>

        <div className="min-h-[8rem] flex-1" aria-hidden />
      </div>

      <div className="print-doc-footer-wrap mt-auto pt-6 flex flex-col items-start flex-shrink-0">
        <div className="flex flex-col items-start text-left mb-8">
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
