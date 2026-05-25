import React from 'react'
import { formatDateLong, fullName, lcroStaffTitleForPrint } from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'

export default function RegistrationOfAcknowledgement({ data }) {
  const affiantName = data.applicantName || fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const regDate = formatDateLong(data.ackDateOfRegistration) || '\u00A0'
  const registryTrim = String(data.ackRegistryNo ?? '').trim()
  const registryNo = registryTrim || '\u00A0'
  const issuedDate = formatDateLong(data.certificateIssuanceDate) || formatDateLong(new Date())
  const affidavitLabel = 'Affidavit of Acknowledgement'
  const signatoryName = data.regAckSignatoryName || data.certificateSignatoryName || 'LORELIE L. CANTO'
  const signatoryTitle = lcroStaffTitleForPrint(
    data.regAckSignatoryTitle || data.certificateSignatoryTitle || 'Registration Officer IV',
  )

  return (
    <div className="ausf-reg-ack-registration-cert ausf-doc print-doc print-doc-cert-registration ausf-registration-cert bg-white text-black text-sm max-w-[210mm] mx-auto px-16 pt-4 pb-0 flex flex-col">
      <header className="print-doc-header shrink-0">
        <PrintHeaderRow />
        <hr className="border-black border-t my-2" />
      </header>
      <div className="cert-reg-body mt-12 flex flex-col shrink-0">
        <h2 className="cert-reg-title text-center font-bold text-[14pt] uppercase tracking-wide">CERTIFICATE OF REGISTRATION</h2>
        <p className="cert-reg-to-whom font-bold mt-12 text-base uppercase">TO WHOM IT MAY CONCERN:</p>
        <p className="cert-reg-p cert-reg-certify-line mt-8 text-justify text-base leading-relaxed cert-reg-justify">
          THIS IS TO CERTIFY that the {affidavitLabel} executed by{' '}
          <span className="font-bold underline px-1 uppercase">{affiantName}</span> had been registered in this office on{' '}
          <span className="fill-blank inline-block px-1 min-w-[10rem] uppercase align-baseline">{regDate}</span> under
          <span className="cert-reg-registry-run block">
            {' '}Registry Number{' '}
            <span
              className={[
                'fill-blank inline-block px-1 align-baseline',
                registryTrim ? 'min-w-[6rem]' : 'empty-blank',
              ].join(' ')}
            >
              {registryNo}
            </span>
            .
          </span>
        </p>
        <p className="cert-reg-p mt-8 text-justify text-base leading-relaxed cert-reg-justify">
          This certification is issued for whatever legal purposes it may serve.
        </p>
        <p className="cert-reg-p mt-8 text-justify text-base leading-relaxed cert-reg-justify uppercase font-bold">
          Issued this <span className="fill-blank inline-block px-1 min-w-[8rem] align-baseline">{issuedDate}</span> at Iligan City, Philippines.
        </p>
        <div className="cert-reg-signatory text-left mb-16" style={{ marginTop: '8em' }}>
          <div className="font-bold uppercase text-base leading-none m-0 p-0">{signatoryName}</div>
          <div className="text-sm text-black leading-none m-0 p-0">{signatoryTitle}</div>
        </div>
      </div>
      <div className="shrink-0 mt-auto">
        <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
      </div>
      <style>{`
        .ausf-reg-ack-registration-cert .cert-reg-registry-run {
          display: block;
          margin-top: 0;
        }
        .ausf-reg-ack-registration-cert .cert-reg-certify-line .fill-blank {
          border-bottom: 1px solid #000;
        }
        @media print {
          body:has(.ausf-reg-ack-registration-cert),
          main:has(.ausf-reg-ack-registration-cert),
          .ausf-print-preview-pane:has(.ausf-reg-ack-registration-cert),
          .ausf-print-preview-scale:has(.ausf-reg-ack-registration-cert),
          div:has(> .ausf-reg-ack-registration-cert) {
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .ausf-reg-ack-registration-cert,
          .ausf-reg-ack-registration-cert .cert-reg-body,
          .ausf-reg-ack-registration-cert .cert-reg-certify-line,
          .ausf-reg-ack-registration-cert .cert-reg-registry-run {
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            flex: none !important;
            min-height: 0 !important;
          }
          .ausf-reg-ack-registration-cert .cert-reg-title {
            font-size: 16pt !important;
            line-height: 1.2 !important;
          }
          .ausf-reg-ack-registration-cert .cert-reg-registry-run {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            page-break-inside: avoid !important;
          }
          .ausf-reg-ack-registration-cert .cert-reg-certify-line .fill-blank {
            border-bottom: 1px solid #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        body.pdf-capture:has(.ausf-reg-ack-registration-cert),
        body.pdf-capture main:has(.ausf-reg-ack-registration-cert) {
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
        }
        body.pdf-capture .ausf-reg-ack-registration-cert,
        body.pdf-capture .ausf-reg-ack-registration-cert .cert-reg-body,
        body.pdf-capture .ausf-reg-ack-registration-cert .cert-reg-registry-run {
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
        }
        body.pdf-capture .ausf-reg-ack-registration-cert .cert-reg-title {
          font-size: 16pt !important;
          line-height: 1.2 !important;
        }
        body.pdf-capture .ausf-reg-ack-registration-cert .cert-reg-registry-run {
          display: block !important;
          visibility: visible !important;
        }
        body.pdf-capture .ausf-reg-ack-registration-cert .cert-reg-certify-line .fill-blank {
          border-bottom: 1px solid #000 !important;
        }
      `}</style>
    </div>
  )
}
