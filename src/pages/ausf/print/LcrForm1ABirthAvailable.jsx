import React from 'react'
import {
  formatDateCert,
  formatDateLong,
  fullName,
  joinCommaParts,
  splitTextForBoldUnderline,
} from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'
import LcrCertificationRequestLine from '../../../components/lcr/LcrCertificationRequestLine'
import LcrRemarksEditor from '../../../components/lcr/LcrRemarksEditor'
import LcrVerifiedByEditor from '../../../components/lcr/LcrVerifiedByEditor'

/** AUSF print type for LCR Form 1A (Birth-Available). */
export const AUSF_LCR_1A_BIRTH_PRINT_TYPE = 'child-ack-lcr'

/** Long bond only — not laid out for A4 or short (8.5" × 11"). */
export const AUSF_LCR_1A_BIRTH_EXCLUDED_PAPER_SIZE_IDS = new Set(['a4', 'short'])

const VALIDITY_NOTE_TEXT =
  'Note: This certification is not valid if it has mark, erasure or alteration of any entry.'

/** Print + PDF: verified-by left in signatory row; note centered above contact footer. */
const AUSF_LCR_1A_BIRTH_VERIFIED_BY_PRINT_STYLES = `
.ausf-lcr-1a-birth-available .ausf-lcr-cert-line,
.ausf-lcr-1a-birth-available .ausf-lcr-cert-line * {
  font-size: 16px !important;
  line-height: 1.3 !important;
}
@media print {
  .ausf-lcr-1a-birth-available .ausf-lcr-cert-line,
  .ausf-lcr-1a-birth-available .ausf-lcr-cert-line * {
    font-size: 12pt !important;
    line-height: 1.3 !important;
  }
  .ausf-lcr-1a-birth-available .ausf-lcr-verified-block .ausf-lcr-verified-by-region {
    align-self: flex-end !important;
    text-align: left !important;
    margin-bottom: 0 !important;
    margin-top: 0 !important;
    transform: none !important;
    position: relative !important;
    top: 1in !important;
    flex: 1 1 auto !important;
    min-width: 0 !important;
  }
  .ausf-lcr-1a-birth-available .ausf-lcr-verified-block .ausf-lcr-ccr-signatory-region {
    margin-top: 0 !important;
    transform: none !important;
    position: relative !important;
    top: 0 !important;
  }
  .ausf-lcr-1a-birth-available .ausf-lcr-verified-block .ausf-lcr-verified-by-bottom {
    margin-bottom: 0 !important;
    align-self: flex-start !important;
    width: auto !important;
  }
  .ausf-lcr-1a-birth-available .ausf-lcr-validity-note-region {
    margin-top: 0 !important;
    width: 100% !important;
  }
  .ausf-lcr-1a-birth-available.court-decree-lcr-form > footer.print-doc-footer .ausf-lcr-validity-note-region .lcr1a-note-line {
    text-align: center !important;
    width: 100% !important;
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }
  .ausf-lcr-1a-birth-available.court-decree-lcr-form > footer.print-doc-footer > .print-doc-footer {
    margin-top: 0 !important;
  }
  .ausf-lcr-1a-birth-available .ausf-lcr-to-whom {
    padding-left: 0 !important;
    margin-left: 0 !important;
    text-align: left !important;
  }
  .ausf-lcr-1a-birth-available .ausf-lcr-cert-legal-indent {
    text-indent: 0.5in !important;
  }
  .ausf-lcr-1a-birth-available.court-decree-lcr-form .court-decree-lcr-colb-val {
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
body.pdf-capture .ausf-lcr-1a-birth-available .ausf-lcr-cert-line,
body.pdf-capture .ausf-lcr-1a-birth-available .ausf-lcr-cert-line * {
  font-size: 12pt !important;
  line-height: 1.3 !important;
}
body.pdf-capture .ausf-lcr-1a-birth-available .ausf-lcr-to-whom {
  padding-left: 0 !important;
  margin-left: 0 !important;
  text-align: left !important;
}
body.pdf-capture .ausf-lcr-1a-birth-available .ausf-lcr-cert-legal-indent {
  text-indent: 0.5in !important;
}
body.pdf-capture .ausf-lcr-1a-birth-available.court-decree-lcr-form .court-decree-lcr-colb-val {
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
body.pdf-capture .ausf-lcr-1a-birth-available .ausf-lcr-verified-block .ausf-lcr-verified-by-region {
  align-self: flex-end !important;
  text-align: left !important;
  margin-bottom: 0 !important;
  margin-top: 0 !important;
  transform: none !important;
  position: relative !important;
  top: 1in !important;
  flex: 1 1 auto !important;
  min-width: 0 !important;
}
body.pdf-capture .ausf-lcr-1a-birth-available .ausf-lcr-verified-block .ausf-lcr-ccr-signatory-region {
  margin-top: 0 !important;
  transform: none !important;
  position: relative !important;
  top: 0 !important;
}
body.pdf-capture .ausf-lcr-1a-birth-available .ausf-lcr-verified-block .ausf-lcr-verified-by-bottom {
  margin-bottom: 0 !important;
  align-self: flex-start !important;
  width: auto !important;
}
body.pdf-capture .ausf-lcr-1a-birth-available .ausf-lcr-validity-note-region {
  margin-top: 0 !important;
  width: 100% !important;
}
body.pdf-capture .ausf-lcr-1a-birth-available.court-decree-lcr-form > footer.print-doc-footer .ausf-lcr-validity-note-region .lcr1a-note-line {
  text-align: center !important;
  width: 100% !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}
body.pdf-capture .ausf-lcr-1a-birth-available.court-decree-lcr-form > footer.print-doc-footer > .print-doc-footer {
  margin-top: 0 !important;
}
`

function AusfLcr1ABirthValidityNote() {
  return (
    <section className="ausf-lcr-validity-note-region shrink-0 w-full print:mt-0" aria-label="Certification validity note">
      <p className="lcr1a-note-line font-bold text-sm mb-0">{VALIDITY_NOTE_TEXT}</p>
    </section>
  )
}

/** LCR Form No. 1A (Birth-Available) for AUSF module.
 *  Updated signatory block to match the specific layout requested from the image.
 */
export default function LcrForm1ABirthAvailable({ data, onDataChange }) {
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
  const regOfficerDefaultName = data.lcrAckSignatoryName || data.certificateSignatoryName || 'LORELIE L. CANTO'
  const ccrName = (data.cityCivilRegistrarName || 'ATTY. YUSSIF DON JUSTIN F. MARTIL, REB').toUpperCase()
  const registryNo = data.colbRegistryNo || '—'

  const defaultRemarks = `"The child shall be known as ${childFull || '—'} pursuant to RA 9255."`
  const savedRemarks = data?.remarks ?? defaultRemarks
  const remarksBoldParts = [childFull || '—', childFull?.toUpperCase()].filter(Boolean)

  const renderRemarksPrint = (draft) =>
    splitTextForBoldUnderline(draft, remarksBoldParts).map((seg, i) =>
      seg.bold ? (
        <span key={i} className="font-bold underline">{seg.text}</span>
      ) : (
        seg.text
      )
    )


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
    { label: 'Date of Marriage of Parents', val: 'NOT APPLICABLE' },
    { label: 'Place of Marriage of Parents', val: 'NOT APPLICABLE' },
  ]

  const colbPage = data.colbPageNumber || '—'
  const colbBook = data.colbBookNumber || '—'

  return (
    <div className="ausf-doc print-doc print-doc-lcr-1a ausf-lcr-1a-birth-available court-decree-lcr-form bg-white text-black max-w-[8.5in] mx-auto px-6 pt-2 pb-0 flex flex-col min-h-0 h-full">
      <style dangerouslySetInnerHTML={{ __html: AUSF_LCR_1A_BIRTH_VERIFIED_BY_PRINT_STYLES }} />
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
              <LcrCertificationRequestLine
                data={data}
                variant="1a"
                copyKind={data?.lcrCertificationCopy}
                onPartyChange={onDataChange ? patchData : undefined}
                className="mb-2 court-decree-lcr-body ausf-lcr-cert-line"
                style={{ fontSize: '16px', lineHeight: 1.3 }}
              />

              <LcrRemarksEditor
                data={data}
                value={savedRemarks}
                onSave={onDataChange ? (v) => onDataChange({ ...data, remarks: v }) : undefined}
                blockClassName="mt-10 mb-4 court-decree-lcr-body ausf-lcr-remarks-block"
                labelClassName="font-bold text-sm mb-1 uppercase"
                printContent={renderRemarksPrint}
              />

              <div className="mt-10 mb-4 court-decree-lcr-body ausf-lcr-verified-block">
                <div className="flex justify-between items-end gap-4">
                  <LcrVerifiedByEditor
                    storageScope="courtDecree"
                    name={data.lcrAckSignatoryName || data.certificateSignatoryName}
                    title={data.lcrAckSignatoryTitle || data.certificateSignatoryTitle}
                    defaultName={regOfficerDefaultName}
                    defaultTitle="Registration Officer IV"
                    uppercasePrintName
                    onSave={
                      onDataChange
                        ? (patch) =>
                            onDataChange({
                              ...data,
                              lcrAckSignatoryName: patch.certificateSignatoryName,
                              lcrAckSignatoryTitle: patch.certificateSignatoryTitle,
                              certificateSignatoryName: patch.certificateSignatoryName,
                              certificateSignatoryTitle: patch.certificateSignatoryTitle,
                              verifiedByName: patch.verifiedByName,
                              verifiedByTitle: patch.verifiedByTitle,
                            })
                        : undefined
                    }
                    blockClassName="ausf-lcr-verified-by-region shrink-0 items-start text-left"
                    labelClassName="text-sm mb-1 self-start"
                    printNameClassName="font-bold uppercase text-sm leading-snug m-0 p-0 inline-block"
                    printTitleClassName="text-sm leading-snug m-0 p-0"
                  />
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
        <div className="ausf-lcr-note-hr-block mt-auto flex w-full flex-col">
          <AusfLcr1ABirthValidityNote />
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

