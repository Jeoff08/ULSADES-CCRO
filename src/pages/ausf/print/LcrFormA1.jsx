import React from 'react'
import {
  formatDateCert,
  formatDateLong,
  fullName,
  joinCommaParts
} from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'
import { lcrRemarksBodyStyle, withLcrRemarksPrintClass } from '../../../lib/lcrRemarksFontSize'
import LcrCertificationRequestPartyInline from '../../../components/lcr/LcrCertificationRequestPartyInline'

/** AUSF print type for LCR Form A1. */
export const AUSF_LCR_A1_PRINT_TYPE = 'child-not-ack-lcr'

/** Long bond only — not laid out for A4 or short (8.5" × 11"). */
export const AUSF_LCR_A1_EXCLUDED_PAPER_SIZE_IDS = new Set(['a4', 'short'])

/** Print + PDF: nudge verified-by down; keep CCR signatory fixed. */
const AUSF_LCR_A1_VERIFIED_BY_PRINT_STYLES = `
.ausf-lcr-a1-form .ausf-lcr-cert-line,
.ausf-lcr-a1-form .ausf-lcr-cert-line * {
  font-size: 16px !important;
  line-height: 1.3 !important;
}
@media print {
  .ausf-lcr-a1-form .ausf-lcr-cert-line,
  .ausf-lcr-a1-form .ausf-lcr-cert-line * {
    font-size: 10pt !important;
    line-height: 1.3 !important;
  }
  html[data-paper-size="long"] .ausf-lcr-a1-form .ausf-lcr-verified-block > .flex > .ausf-lcr-verified-by-region,
  html[data-paper-size="legal"] .ausf-lcr-a1-form .ausf-lcr-verified-block > .flex > .ausf-lcr-verified-by-region {
    position: relative !important;
    top: 0.8in !important;
    margin-top: 0 !important;
    transform: none !important;
  }
  html[data-paper-size="long"] .ausf-lcr-a1-form .ausf-lcr-verified-block > .flex > .ausf-lcr-ccr-signatory-region,
  html[data-paper-size="legal"] .ausf-lcr-a1-form .ausf-lcr-verified-block > .flex > .ausf-lcr-ccr-signatory-region {
    position: relative !important;
    top: 0 !important;
    margin-top: 0 !important;
    transform: none !important;
  }
  html[data-paper-size="long"] .ausf-lcr-a1-form.court-decree-lcr-form > footer.print-doc-footer .ausf-lcr-a1-note-hr-block,
  html[data-paper-size="legal"] .ausf-lcr-a1-form.court-decree-lcr-form > footer.print-doc-footer .ausf-lcr-a1-note-hr-block {
    margin-top: auto !important;
    width: 100% !important;
  }
  html[data-paper-size="long"] .ausf-lcr-a1-form.court-decree-lcr-form > footer.print-doc-footer .ausf-lcr-a1-note-hr-block .lcr1a-note-line,
  html[data-paper-size="legal"] .ausf-lcr-a1-form.court-decree-lcr-form > footer.print-doc-footer .ausf-lcr-a1-note-hr-block .lcr1a-note-line {
    width: 100% !important;
    text-align: center !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }
  html[data-paper-size="long"] .ausf-lcr-a1-form .ausf-lcr-a1-note-hr-block > .print-doc-footer,
  html[data-paper-size="legal"] .ausf-lcr-a1-form .ausf-lcr-a1-note-hr-block > .print-doc-footer {
    margin-top: 0 !important;
    padding-top: 0 !important;
  }
  html[data-paper-size="long"] .ausf-lcr-a1-form .ausf-lcr-a1-note-hr-block > .print-doc-footer > hr,
  html[data-paper-size="legal"] .ausf-lcr-a1-form .ausf-lcr-a1-note-hr-block > .print-doc-footer > hr {
    margin-top: 0 !important;
  }
  html[data-paper-size="long"] .ausf-lcr-a1-form .ausf-lcr-to-whom,
  html[data-paper-size="legal"] .ausf-lcr-a1-form .ausf-lcr-to-whom {
    padding-left: 0 !important;
    margin-left: 0 !important;
    text-align: left !important;
  }
  html[data-paper-size="long"] .ausf-lcr-a1-form .ausf-lcr-cert-legal-indent,
  html[data-paper-size="legal"] .ausf-lcr-a1-form .ausf-lcr-cert-legal-indent {
    text-indent: 0.5in !important;
  }
  html[data-paper-size="long"] .ausf-lcr-a1-form.court-decree-lcr-form .court-decree-lcr-colb-val,
  html[data-paper-size="legal"] .ausf-lcr-a1-form.court-decree-lcr-form .court-decree-lcr-colb-val {
    display: inline !important;
    position: static !important;
    top: auto !important;
    transform: none !important;
    border: none !important;
    width: auto !important;
    min-width: 0 !important;
    text-decoration: underline !important;
    text-decoration-color: #000 !important;
    text-underline-offset: 0.08em !important;
    text-decoration-skip-ink: none !important;
  }
}
body.pdf-capture .ausf-lcr-a1-form .ausf-lcr-cert-line,
body.pdf-capture .ausf-lcr-a1-form .ausf-lcr-cert-line * {
  font-size: 10pt !important;
  line-height: 1.3 !important;
}
html[data-paper-size="long"] body.pdf-capture .ausf-lcr-a1-form .ausf-lcr-to-whom,
html[data-paper-size="legal"] body.pdf-capture .ausf-lcr-a1-form .ausf-lcr-to-whom {
  padding-left: 0 !important;
  margin-left: 0 !important;
  text-align: left !important;
}
html[data-paper-size="long"] body.pdf-capture .ausf-lcr-a1-form .ausf-lcr-cert-legal-indent,
html[data-paper-size="legal"] body.pdf-capture .ausf-lcr-a1-form .ausf-lcr-cert-legal-indent {
  text-indent: 0.5in !important;
}
html[data-paper-size="long"] body.pdf-capture .ausf-lcr-a1-form.court-decree-lcr-form .court-decree-lcr-colb-val,
html[data-paper-size="legal"] body.pdf-capture .ausf-lcr-a1-form.court-decree-lcr-form .court-decree-lcr-colb-val {
  display: inline !important;
  position: static !important;
  top: auto !important;
  transform: none !important;
  border: none !important;
  width: auto !important;
  min-width: 0 !important;
  text-decoration: underline !important;
  text-decoration-color: #000 !important;
  text-underline-offset: 0.08em !important;
  text-decoration-skip-ink: none !important;
}
html[data-paper-size="long"] body.pdf-capture .ausf-lcr-a1-form .ausf-lcr-verified-block > .flex > .ausf-lcr-verified-by-region,
html[data-paper-size="legal"] body.pdf-capture .ausf-lcr-a1-form .ausf-lcr-verified-block > .flex > .ausf-lcr-verified-by-region {
  position: relative !important;
  top: 0.8in !important;
  margin-top: 0 !important;
  transform: none !important;
}
html[data-paper-size="long"] body.pdf-capture .ausf-lcr-a1-form .ausf-lcr-verified-block > .flex > .ausf-lcr-ccr-signatory-region,
html[data-paper-size="legal"] body.pdf-capture .ausf-lcr-a1-form .ausf-lcr-verified-block > .flex > .ausf-lcr-ccr-signatory-region {
  position: relative !important;
  top: 0 !important;
  margin-top: 0 !important;
  transform: none !important;
}
html[data-paper-size="long"] body.pdf-capture .ausf-lcr-a1-form.court-decree-lcr-form > footer.print-doc-footer .ausf-lcr-a1-note-hr-block,
html[data-paper-size="legal"] body.pdf-capture .ausf-lcr-a1-form.court-decree-lcr-form > footer.print-doc-footer .ausf-lcr-a1-note-hr-block {
  margin-top: auto !important;
  width: 100% !important;
}
html[data-paper-size="long"] body.pdf-capture .ausf-lcr-a1-form.court-decree-lcr-form > footer.print-doc-footer .ausf-lcr-a1-note-hr-block .lcr1a-note-line,
html[data-paper-size="legal"] body.pdf-capture .ausf-lcr-a1-form.court-decree-lcr-form > footer.print-doc-footer .ausf-lcr-a1-note-hr-block .lcr1a-note-line {
  width: 100% !important;
  text-align: center !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
html[data-paper-size="long"] body.pdf-capture .ausf-lcr-a1-form .ausf-lcr-a1-note-hr-block > .print-doc-footer,
html[data-paper-size="legal"] body.pdf-capture .ausf-lcr-a1-form .ausf-lcr-a1-note-hr-block > .print-doc-footer {
  margin-top: 0 !important;
  padding-top: 0 !important;
}
html[data-paper-size="long"] body.pdf-capture .ausf-lcr-a1-form .ausf-lcr-a1-note-hr-block > .print-doc-footer > hr,
html[data-paper-size="legal"] body.pdf-capture .ausf-lcr-a1-form .ausf-lcr-a1-note-hr-block > .print-doc-footer > hr {
  margin-top: 0 !important;
}
`

/** LCR Form No. 1A (Birth-Available) for AUSF module (A1 version).
 *  Updated signatory block to match the specific layout requested from the image.
 */
export default function LcrFormA1({ data, onDataChange }) {
  const patchData = (partial) => {
    onDataChange?.({ ...data, ...partial })
  }
  const childFull = fullName(data.childFirst, data.childMiddle, data.fatherLast) || fullName(data.childFirst, data.childMiddle, data.childLast)
  const motherFull = fullName(data.motherFirst, data.motherMiddle, data.motherLast)
  const fatherFull = fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const showMotherName = Boolean(String(motherFull).trim())
  const showFatherName = Boolean(String(fatherFull).trim())
  const placeOfBirth = joinCommaParts(data.placeOfBirthAddress, data.placeOfBirthCity, data.placeOfBirthProvince) || '—'
  const formDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const regOfficerName = (data.lcrNotAckSignatoryName || data.certificateSignatoryName || 'LORELIE L. CANTO').toUpperCase()
  const regOfficerTitle = data.lcrNotAckSignatoryTitle || 'Registration Officer IV'
  const ccrName = (data.cityCivilRegistrarName || 'YUSSIF DON JUSTIN F. MARTIL').toUpperCase()
  const registryNo = data.colbRegistryNo || '—'
  const verifiedByLabel = 'Verified by:'

  // Specific remarks for A1 form
  const ackDate = formatDateLong(data.colbDateOfRegistration)?.toUpperCase() || '—'


  const tableData = [
    { label: 'LCR Registry Number', val: registryNo },
    { label: 'Date of Registration', val: formatDateLong(data.colbDateOfRegistration) || '—' },
    { label: 'Name of Child', val: childFull || '—' },
    { label: 'Sex', val: data.sex || '—' },
    { label: 'Date of Birth', val: formatDateLong(data.dateOfBirth) || '—' },
    { label: 'Place of Birth', val: placeOfBirth },
    ...(showMotherName ? [{ label: 'Name of Mother', val: motherFull }] : []),
    { label: 'Citizenship of Mother', val: data.motherCitizenship || '—' },
    ...(showFatherName ? [{ label: 'Name of Father', val: fatherFull }] : []),
    { label: 'Citizenship of Father', val: data.fatherCitizenship || '—' },
    { label: 'Date of Marriage of Parents', val: '' },
    { label: 'Place of Marriage of Parents', val: '' },
  ]

  const colbPage = data.colbPageNumber || '—'
  const colbBook = data.colbBookNumber || '—'

  return (
    <div className="ausf-doc print-doc print-doc-lcr-1a ausf-lcr-a1-form court-decree-lcr-form bg-white text-black text-sm max-w-[8.5in] mx-auto px-6 pt-2 pb-0 flex flex-col min-h-0 h-full">
      <style dangerouslySetInnerHTML={{ __html: AUSF_LCR_A1_VERIFIED_BY_PRINT_STYLES }} />
      <div className="court-decree-lcr-header shrink-0">
        <header className="print-doc-header">
          <PrintHeaderRow />
          <hr className="border-black my-3" />
        </header>
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="font-bold text-base">LCR Form No. 1A</p>
            <p className="text-sm">(Birth-Available)</p>
          </div>
          <p className="text-sm font-medium">{formDate}</p>
        </div>
      </div>

      <div className="court-decree-lcr-body-wrap flex-1 min-h-0 flex flex-col">
        <div className="court-decree-lcr-body-scaled flex flex-col min-h-0">
          <div>
            <p className="font-bold mb-1 pl-8 ausf-lcr-to-whom">TO WHOM IT MAY CONCERN:</p>
            <p className="mb-2 text-left court-decree-lcr-body">
              <span className="font-bold">WE CERTIFY</span> that, among others, the following facts of birth appear in our Register of Births on Page{' '}
              <span className="court-decree-lcr-colb-val font-bold">{colbPage}</span>
              {' '}of Book number{' '}
              <span className="court-decree-lcr-colb-val font-bold">{colbBook}</span>
              .
            </p>

            <table className="w-full border-collapse text-sm mt-6 mb-2 border border-black court-decree-lcr-table">
              <tbody>
                {tableData.map((row) => (
                  <tr key={row.label}>
                    <td className="py-1 px-2 border border-black font-medium align-top w-48">{row.label}</td>
                    <td className="py-1 px-2 border border-black font-bold text-left align-top">{row.val}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="lcr-form-bottom-content">
              <p
                className="mb-2 court-decree-lcr-body ausf-lcr-cert-line"
                style={{ fontSize: '16px', lineHeight: 1.3 }}
              >
                This certification is issued upon the request of{' '}
                <LcrCertificationRequestPartyInline
                  data={data}
                  variant="1a"
                  onPartyChange={onDataChange ? patchData : undefined}
                />{' '}
                for any legal purposes.
              </p>

              <div className="mt-10 mb-4 court-decree-lcr-body ausf-lcr-remarks-block">
                <p className="font-bold text-sm mb-1 uppercase">REMARKS:</p>
                <p
                  className={withLcrRemarksPrintClass('text-justify break-words [overflow-wrap:anywhere]')}
                  style={lcrRemarksBodyStyle(data)}
                >
                  Acknowledged by <span className="font-bold underline">{fatherFull || '—'}</span> on <span className="font-bold underline">{ackDate}</span> under Registry Number <span className="font-bold underline">{registryNo}</span>. The child shall be known as <span className="font-bold underline">{childFull?.toUpperCase() || '—'}</span>
                </p>
              </div>

              <div className="mt-10 mb-4 court-decree-lcr-body ausf-lcr-verified-block">
                <div className="flex justify-between items-end gap-4">
                  <div className="ausf-lcr-verified-by-region shrink-0 flex flex-col items-start text-left">
                    <p className="text-sm mb-1">{verifiedByLabel}</p>
                    <div className="font-bold uppercase text-sm leading-snug m-0 p-0">{regOfficerName}</div>
                    <div className="text-sm leading-snug m-0 p-0">{regOfficerTitle}</div>
                  </div>
                  <div className="ausf-lcr-ccr-signatory-region text-center flex flex-col items-center shrink-0">
                    <div className="font-bold uppercase text-sm leading-snug m-0 p-0">{ccrName}</div>
                    <div className="italic text-xs leading-snug m-0 p-0">City Civil Registrar</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="print-doc-footer mt-auto shrink-0 flex flex-col">
        <div className="ausf-lcr-a1-note-hr-block mt-auto flex w-full flex-col">
          <p className="lcr1a-note-line font-bold text-sm mb-0">Note: This certification is not valid if it has mark, erasure or alteration of any entry.</p>
          <DocumentFooter
            contactPhone={data.contactPhone || '228-1311'}
            contactEmail={data.contactEmail || 'civilregistrar.iligan@gmail.com'}
            sloganBlue
          />
        </div>
      </footer>
    </div>
  )
}
