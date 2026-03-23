import React from 'react'
import { formatDateLong, formatDateCert, fullName } from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'

export default function RegistrationOfAusf({ data }) {
  const affiantName = data.applicantName || fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const regDate = formatDateLong(data.ausfDateOfRegistration)
  const registryNo = data.ausfRegistryNo
  const issuedDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const affidavitLabel = 'Affidavit to Use Surname of the Father'
  const signatoryName = data.certificateSignatoryName || 'LORELIE L. CANTO'
  const signatoryTitle = 'Registration Officer IV'

  return (
    <div className="ausf-doc print-doc print-doc-cert-registration ausf-registration-cert bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-4">
      <PrintHeaderRow />
      <hr className="border-black my-3" />
      <div className="cert-reg-body mt-12 flex flex-col flex-1 min-h-0">
        <h2 className="cert-reg-title text-center font-bold text-xl uppercase tracking-tight">CERTIFICATE OF REGISTRATION</h2>
        <p className="cert-reg-to-whom font-bold mt-6">TO WHOM IT MAY CONCERN:</p>
        <p className="cert-reg-p mb-5 text-justify cert-reg-justify">
          THIS IS TO CERTIFY that the {affidavitLabel} executed by <span className="fill-blank inline-block px-1 min-w-[8rem]">{affiantName}</span> had been registered in this office on <span className="fill-blank inline-block px-1 min-w-[8rem]">{regDate}</span> under Registry Number <span className="fill-blank inline-block px-1 min-w-[5rem]">{registryNo}</span>.
        </p>
        <p className="cert-reg-p mb-5 mt-6 text-justify cert-reg-justify">This certification is issued for whatever legal purposes it may serve.</p>
        <p className="cert-reg-p mb-5 mt-6 text-justify cert-reg-justify">Issued this <span className="fill-blank inline-block px-1 min-w-[8rem]">{issuedDate}</span> at Iligan City, Philippines.</p>
        <div className="cert-reg-signatory-spacer flex-1 min-h-0" aria-hidden="true" />
        <div className="cert-reg-signatory text-left mt-2">
          <p className="font-bold uppercase text-base">{signatoryName}</p>
          <p className="text-sm text-black mt-0.5">{signatoryTitle}</p>
        </div>
      </div>
      <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
    </div>
  )
}

