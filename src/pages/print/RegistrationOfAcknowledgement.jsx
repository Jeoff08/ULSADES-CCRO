import React from 'react'
import { formatDateLong, formatDateCert, fullName } from '../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter } from '../../components/print'

export default function RegistrationOfAcknowledgement({ data }) {
  const affiantName = data.applicantName || fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const regDate = formatDateLong(data.ausfDateOfRegistration)
  const registryNo = data.ausfRegistryNo
  const issuedDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const affidavitLabel = 'Affidavit of Acknowledgement'
  const signatoryName = data.certificateSignatoryName || 'LORELIE L. CANTO'
  const signatoryTitle = 'Registration Officer IV'

  return (
    <div className="ausf-doc print-doc print-doc-cert-registration bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-4">
      <PrintHeaderRow />
      <hr className="border-black my-3" />
      <div className="cert-reg-body mt-12 flex flex-col flex-1 min-h-0">
        <h2 className="text-center font-bold text-xl uppercase mb-10 tracking-tight">CERTIFICATE OF REGISTRATION</h2>
        <p className="font-bold mb-3 mt-6">TO WHOM IT MAY CONCERN:</p>
        <p className="mb-4 text-justify cert-reg-justify">
          THIS IS TO CERTIFY that the {affidavitLabel} executed by <span className="fill-blank inline-block px-1 min-w-[8rem]">{affiantName}</span> had been registered in this office on <span className="fill-blank inline-block px-1 min-w-[8rem]">{regDate}</span> under Registry Number <span className="fill-blank inline-block px-1 min-w-[5rem]">{registryNo}</span>.
        </p>
        <p className="mb-4 text-justify cert-reg-justify">This certification is issued for whatever legal purposes it may serve.</p>
        <p className="mb-4 text-justify cert-reg-justify">Issued this <span className="fill-blank inline-block px-1 min-w-[8rem]">{issuedDate}</span> at Iligan City, Philippines.</p>
        <div className="flex-1 min-h-[2rem]" aria-hidden="true" />
        <div className="text-left">
          <p className="font-bold uppercase text-base">{signatoryName}</p>
          <p className="text-sm text-black mt-0.5">{signatoryTitle}</p>
        </div>
        <div className="flex-1 min-h-[2rem]" aria-hidden="true" />
      </div>
      <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
    </div>
  )
}
