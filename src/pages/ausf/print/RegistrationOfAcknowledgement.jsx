import React from 'react'
import { formatDateLong, formatDateCert, fullName } from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'

export default function RegistrationOfAcknowledgement({ data }) {
  const affiantName = data.applicantName || fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const regDate = formatDateLong(data.ausfDateOfRegistration)
  const registryNo = data.ausfRegistryNo
  const issuedDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const affidavitLabel = 'Affidavit of Acknowledgement'
  const signatoryName = data.certificateSignatoryName || 'LORELIE L. CANTO'
  const signatoryTitle = data.certificateSignatoryTitle || 'Registration Officer IV'

  return (
    <div className="ausf-doc print-doc court-decree-lcr-form bg-white text-black text-sm max-w-[210mm] mx-auto px-16 pt-4 pb-0 flex flex-col min-h-0 h-full">
      <header className="print-doc-header shrink-0">
        <PrintHeaderRow />
        <hr className="border-black border-t my-2" />
        <div className="flex justify-end mt-1">
          <p className="text-base font-medium">Registry Number: <span className="font-bold underline">{registryNo}</span></p>
        </div>
      </header>
      <div className="cert-reg-body-wrap flex-1 flex flex-col min-h-0">
        <div className="cert-reg-body-scaled flex-1 flex flex-col">
          <div className="flex-1">
            <h2 className="cert-reg-title text-center font-bold text-2xl uppercase tracking-wide mt-12">CERTIFICATE OF REGISTRATION</h2>
            <p className="cert-reg-to-whom font-bold mt-12 text-base uppercase">TO WHOM IT MAY CONCERN:</p>
            <p className="cert-reg-p mt-8 text-justify text-base leading-relaxed">
              THIS IS TO CERTIFY that the {affidavitLabel} executed by <span className="font-bold underline px-1 uppercase">{affiantName}</span> had been registered in this office on <span className="font-bold underline px-1 uppercase">{regDate}</span> under Registry Number <span className="font-bold underline px-1">{registryNo}</span>.
            </p>
            <p className="cert-reg-p mt-8 text-justify text-base leading-relaxed">This certification is issued for whatever legal purposes it may serve.</p>
            <p className="cert-reg-p mt-8 text-justify text-base leading-relaxed uppercase font-bold">
              Issued this <span className="underline px-1">{issuedDate}</span> at Iligan City, Philippines.
            </p>
          </div>

          <div className="cert-reg-signatory text-left mt-20 mb-16">
            <div className="font-bold uppercase text-base leading-none m-0 p-0">{signatoryName}</div>
            <div className="text-sm text-black leading-none m-0 p-0">{signatoryTitle}</div>
          </div>
        </div>
      </div>
      <div className="shrink-0 mt-auto">
        <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
      </div>
    </div>
  )
}

