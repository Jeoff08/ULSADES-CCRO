import React from 'react'
import { formatDateMonthDayYearComma, formatSignatoryTitleForDisplay } from '../../../lib/printUtils'
import { DocumentHeader, DocumentFooter } from '../../../components/print'
import {
  formatAffectedDocumentLabel,
  resolveSingleAffectedDocumentForCertificate,
} from '../lib/courtDecreeAffectedDocuments'
import { resolveCourtDecreePrintCcr } from '../lib/courtDecreePrintCcr'

/**
 * Court decree Certificate of Authenticity (output matches sample PDF).
 * Data from court decree form: dateIssued, issuedByTitle, issuedByName, typeOfCase, caseNo, authenticatedBy,
 * courtOrRacco (Memo Circular No.), one affected civil document from saved choice (affectedDocument / form type / list), then LCR inference if needed, documentOwnerName, plus certificate issuance date and signatory.
 */
function documentOwnerForCertificate(data, affectedCode) {
  const direct = String(data?.documentOwnerName || '').trim()
  if (direct) return direct.toUpperCase()
  if (affectedCode === 'DEATH_CERTIFICATE') {
    const n = String(data?.lcr2aNameDeceased || '').trim()
    if (n) return n.toUpperCase()
  }
  if (affectedCode === 'BIRTH_CERTIFICATE') {
    const n = String(data?.lcr1aNameOfChild || '').trim()
    if (n) return n.toUpperCase()
  }
  if (affectedCode === 'MARRIAGE_CERTIFICATE') {
    const h = String(data?.lcr3aHusbandName || '').trim()
    const w = String(data?.lcr3aWifeName || '').trim()
    if (h && w) return `${h} & ${w}`.toUpperCase()
    if (h || w) return (h || w).toUpperCase()
  }
  return '—'
}

/** Gap between “Issued this …” and CCR signatory (screen, browser print, PDF capture). */
export const COURT_DECREE_CERT_SIGNATORY_AFTER_ISSUED_GAP = '8em'

export const COURT_DECREE_CERT_SIGNATORY_PRINT_STYLES = `
@media print {
  .court-decree-certificate-print .cert-auth-body .court-decree-cert-signatory-after-issued,
  .court-decree-certificate-print .cert-reg-body .court-decree-cert-signatory-after-issued,
  .print-doc-cert-registration.court-decree-certificate-print .cert-reg-body .court-decree-cert-signatory-after-issued,
  html[data-paper-size] .court-decree-certificate-print .court-decree-cert-signatory-after-issued {
    display: inline-flex !important;
    flex-direction: column !important;
    align-items: center !important;
    margin-top: ${COURT_DECREE_CERT_SIGNATORY_AFTER_ISSUED_GAP} !important;
  }
  .court-decree-certificate-print .court-decree-cert-body-spacer,
  .print-doc-cert-registration.court-decree-certificate-print .court-decree-cert-body-spacer {
    display: none !important;
    min-height: 0 !important;
    flex: none !important;
  }
}
body.pdf-capture .court-decree-certificate-print .cert-auth-body .court-decree-cert-signatory-after-issued,
body.pdf-capture .court-decree-certificate-print .cert-reg-body .court-decree-cert-signatory-after-issued,
body.pdf-capture .print-doc-cert-registration.court-decree-certificate-print .cert-reg-body .court-decree-cert-signatory-after-issued,
body.pdf-capture html[data-paper-size] .court-decree-certificate-print .court-decree-cert-signatory-after-issued {
  display: inline-flex !important;
  flex-direction: column !important;
  align-items: center !important;
  margin-top: ${COURT_DECREE_CERT_SIGNATORY_AFTER_ISSUED_GAP} !important;
}
body.pdf-capture .court-decree-certificate-print .court-decree-cert-body-spacer,
body.pdf-capture .print-doc-cert-registration.court-decree-certificate-print .court-decree-cert-body-spacer {
  display: none !important;
  min-height: 0 !important;
  flex: none !important;
}
`

/** Print/PDF: CoA and CoR titles 16pt (screen uses 14pt on h2); CoR body justified with normal word spacing. */
export const COURT_DECREE_CERT_LAYOUT_PRINT_STYLES = `
@media print {
  .court-decree-certificate-print.print-doc-cert-auth .court-decree-cert-main-title,
  html[data-paper-size] .court-decree-certificate-print.print-doc-cert-auth .court-decree-cert-main-title {
    font-size: 16pt !important;
    line-height: 1.2 !important;
  }
  .court-decree-certificate-print.print-doc-cert-registration .court-decree-cert-main-title,
  html[data-paper-size] .court-decree-certificate-print.print-doc-cert-registration .court-decree-cert-main-title {
    font-size: 16pt !important;
    line-height: 1.2 !important;
  }
  .ausf-doc.print-doc.print-doc-cert-registration.court-decree-certificate-print .cert-reg-body,
  .ausf-doc.print-doc.print-doc-cert-registration.court-decree-certificate-print .cert-reg-body p,
  .ausf-doc.print-doc.print-doc-cert-registration.court-decree-certificate-print .cert-reg-body span,
  .court-decree-certificate-print.print-doc-cert-registration .cert-reg-body,
  .court-decree-certificate-print.print-doc-cert-registration .cert-reg-body p,
  .court-decree-certificate-print.print-doc-cert-registration .cert-reg-body span,
  html[data-paper-size] .ausf-doc.print-doc.print-doc-cert-registration.court-decree-certificate-print .cert-reg-body,
  html[data-paper-size] .ausf-doc.print-doc.print-doc-cert-registration.court-decree-certificate-print .cert-reg-body p,
  html[data-paper-size] .court-decree-certificate-print.print-doc-cert-registration .cert-reg-body,
  html[data-paper-size] .court-decree-certificate-print.print-doc-cert-registration .cert-reg-body p,
  html[data-paper-size] .court-decree-certificate-print.print-doc-cert-registration .cert-reg-body span {
    text-align: justify !important;
    text-justify: inter-word !important;
    word-spacing: normal !important;
    letter-spacing: normal !important;
  }
}
body.pdf-capture .court-decree-certificate-print.print-doc-cert-auth .court-decree-cert-main-title,
body.pdf-capture html[data-paper-size] .court-decree-certificate-print.print-doc-cert-auth .court-decree-cert-main-title {
  font-size: 16pt !important;
  line-height: 1.2 !important;
}
body.pdf-capture .court-decree-certificate-print.print-doc-cert-registration .court-decree-cert-main-title,
body.pdf-capture html[data-paper-size] .court-decree-certificate-print.print-doc-cert-registration .court-decree-cert-main-title {
  font-size: 16pt !important;
  line-height: 1.2 !important;
}
body.pdf-capture .ausf-doc.print-doc.print-doc-cert-registration.court-decree-certificate-print .cert-reg-body,
body.pdf-capture .ausf-doc.print-doc.print-doc-cert-registration.court-decree-certificate-print .cert-reg-body p,
body.pdf-capture .ausf-doc.print-doc.print-doc-cert-registration.court-decree-certificate-print .cert-reg-body span,
body.pdf-capture .court-decree-certificate-print.print-doc-cert-registration .cert-reg-body,
body.pdf-capture .court-decree-certificate-print.print-doc-cert-registration .cert-reg-body p,
body.pdf-capture .court-decree-certificate-print.print-doc-cert-registration .cert-reg-body span,
body.pdf-capture html[data-paper-size] .ausf-doc.print-doc.print-doc-cert-registration.court-decree-certificate-print .cert-reg-body,
body.pdf-capture html[data-paper-size] .ausf-doc.print-doc.print-doc-cert-registration.court-decree-certificate-print .cert-reg-body p,
body.pdf-capture html[data-paper-size] .court-decree-certificate-print.print-doc-cert-registration .cert-reg-body,
body.pdf-capture html[data-paper-size] .court-decree-certificate-print.print-doc-cert-registration .cert-reg-body p,
body.pdf-capture html[data-paper-size] .court-decree-certificate-print.print-doc-cert-registration .cert-reg-body span {
  text-align: justify !important;
  text-justify: inter-word !important;
  word-spacing: normal !important;
  letter-spacing: normal !important;
}
`

export const COURT_DECREE_CERT_ALL_PRINT_STYLES =
  COURT_DECREE_CERT_SIGNATORY_PRINT_STYLES + COURT_DECREE_CERT_LAYOUT_PRINT_STYLES

export function CourtDecreeCertSignatory({ name, title, className = '' }) {
  const afterIssued = String(className).includes('court-decree-cert-signatory-after-issued')
  return (
    <div
      className={`court-decree-cert-signatory-block ml-0 inline-flex flex-col items-center gap-0 leading-none ${className}`.trim()}
      style={afterIssued ? { marginTop: COURT_DECREE_CERT_SIGNATORY_AFTER_ISSUED_GAP } : undefined}
    >
      <p className="court-decree-cert-signatory-name m-0 font-bold uppercase text-[15px]">{name}</p>
      <p className="court-decree-cert-signatory-title m-0 text-[13px] italic">{title}</p>
    </div>
  )
}

/**
 * @param {object} props
 * @param {object} props.data Court decree draft fields
 */
export default function CertAuthenticityCourtDecree({ data }) {
  const dateIssued = data.dateIssued || '—'
  const judgeName = data.issuedByName || (data.issuedByTitle ? `${data.issuedByTitle} ${data.issuedByName || ''}`.trim() : '') || '—'
  const typeOfCase = data.typeOfCase || 'Civil Case No.'
  const caseNo = data.caseNo || '—'
  const authenticatedBy = data.authenticatedBy || '—'
  const memoCircular = data.courtOrRacco || '2012-02'
  const isOutOfTown = data?.courtDecreeTransmittalIsOutOfTown === true
  const affectedCode = isOutOfTown ? '' : resolveSingleAffectedDocumentForCertificate(data)
  const affectedDoc = isOutOfTown ? '' : formatAffectedDocumentLabel(affectedCode)
  const documentOwner = documentOwnerForCertificate(data, affectedCode)
  const issuedDate =
    formatDateMonthDayYearComma(data.certificateIssuanceDate) || formatDateMonthDayYearComma(new Date())
  const { row: ccrRow } = resolveCourtDecreePrintCcr(data)
  const signatory = ccrRow.name.toUpperCase()
  const signatoryTitle = formatSignatoryTitleForDisplay(ccrRow.title)

  return (
    <div className="ausf-doc print-doc print-doc-cert-auth court-decree-certificate-print bg-white text-black text-base max-w-[210mm] mx-auto px-0 py-4 leading-relaxed flex flex-col min-h-[297mm]">
      <style dangerouslySetInnerHTML={{ __html: COURT_DECREE_CERT_ALL_PRINT_STYLES }} />
      <DocumentHeader />

      <div className="print-doc-body flex flex-col flex-1 min-h-0">
        <h2 className="court-decree-cert-main-title text-center font-bold text-[14pt] uppercase mb-6 tracking-tight">CERTIFICATE OF AUTHENTICITY</h2>

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
          <CourtDecreeCertSignatory
            name={signatory}
            title={signatoryTitle}
            className="court-decree-cert-signatory-after-issued mb-0"
          />
        </div>

        <div className="court-decree-cert-body-spacer min-h-[8rem] flex-1" aria-hidden />
      </div>

      <div className="print-doc-footer-wrap mt-auto pt-6 flex flex-col items-start flex-shrink-0">
        <div className="w-full">
          <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
        </div>
      </div>
    </div>
  )
}
