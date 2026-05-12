import React from 'react'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'
import { formatTransmittalDateLong, formatDobDayMonthYearUpper } from '../../../lib/printUtils'
import {
  SUPPLEMENTAL_TRANSMITTAL_ATTACHMENT_OPTIONS,
  SUPPLEMENTAL_TRANSMITTAL_DOC_TYPE_OPTIONS,
  SUPPLEMENTAL_TRANSMITTAL_ENDORSEMENT_OPTIONS,
  transmittalRecipientOfficeLinesForPrint,
  transmittalRecipientPositionLines,
  transmittalThruPositionLinesForPrint,
} from '../lib/supplementalTransmittalDefaults'

const tableCls = 'w-full border-collapse border border-black text-[16px] print:text-[12pt] leading-tight'
/** Narrow checkbox column + small box (screen); print tuned in index.css */
const checklistTableCls = `${tableCls} mc2010-checklist-table`
const tdBoxCls =
  'border border-black mc2010-checklist-box-cell w-[1.95rem] min-w-[1.95rem] text-center align-middle py-0.5 px-0'
const tdLblCls = 'border border-black px-2 py-0.5 text-left'

/** ~2 line-heights of air in print; stack-tight paragraphs use margin 0 !important so we use spacers. */
function Mc2010LetterGap() {
  return <div className="h-4 shrink-0 print:h-[12pt]" aria-hidden />
}

function filledBox() {
  return (
    <div
      className="mc2010-checklist-box mx-auto h-[12px] w-[12px] min-h-[12px] min-w-[12px] bg-blue-600 border border-black print:h-[10pt] print:w-[10pt] print:min-h-[10pt] print:min-w-[10pt]"
      aria-hidden
    />
  )
}

function emptyBox() {
  return (
    <div
      className="mc2010-checklist-box mx-auto h-[12px] w-[12px] min-h-[12px] min-w-[12px] border border-black bg-white print:h-[10pt] print:w-[10pt] print:min-h-[10pt] print:min-w-[10pt]"
      aria-hidden
    />
  )
}

export default function Mc2010Transmittal({ data, paperWidth = '210mm', paperHeight = '297mm' }) {
  const dateLine = formatTransmittalDateLong(data.transmittalDate || '')
  const dobLine = formatDobDayMonthYearUpper(data.transmittalDob || '')
  const docType = data.transmittalDocType || ''
  const endorsementIds = Array.isArray(data.transmittalEndorsementIds) ? data.transmittalEndorsementIds : []
  const attachmentIds = Array.isArray(data.transmittalAttachmentIds) ? data.transmittalAttachmentIds : []
  const recipientTitleLines = transmittalRecipientPositionLines(data)
  const recipientOfficeLines = transmittalRecipientOfficeLinesForPrint(data)
  const thruTitleLines = transmittalThruPositionLinesForPrint(data)
  const trimmedThru = (data.transmittalThru || '').trim()
  const recipientName = ((data.transmittalRecipient || '').trim() || '\u00a0')

  const emph = (v) => {
    const t = (v || '').trim().toUpperCase()
    if (!t) return <span className="inline-block min-w-[10ch] border-b border-black" />
    return <span className="font-bold underline">{t}</span>
  }
  return (
    <div
      className="ausf-doc print-doc print-doc-transmittal mc2010-transmittal-doc bg-white text-black mx-auto py-5 leading-snug flex flex-col"
      style={{ fontFamily: 'Arial, sans-serif', width: paperWidth, minHeight: paperHeight }}
    >
      <div className="print-doc-header shrink-0">
        <PrintHeaderRow headerImageClassName="mc2010-transmittal-header-img w-20 h-20 object-contain shrink-0" singleLineAddress />
        <hr className="border-black my-2" />
      </div>

      <div className="print-doc-body flex flex-col flex-1 min-h-0">
        <h1 className="text-center text-[16px] print:text-[12pt] font-bold tracking-[0.14em] mb-4">TRANSMITTAL</h1>
        <div className="ml-2 pl-6 pr-2 flex flex-col flex-1 min-h-0 min-w-0 text-[16px] print:text-[12pt] leading-[1.2]">
          {/* Single paragraph + <br /> so print/PDF has no sibling-p gap */}
          <p className="mc2010-stack-tight-p mc2010-date-block">
            <span className="font-bold">{dateLine || '\u00a0'}</span>
            <br />
            <span>Date</span>
          </p>
          <Mc2010LetterGap />

          <p className="mc2010-stack-tight-p mc2010-recipient-block uppercase">
            <span className="font-bold">{recipientName}</span>
            {recipientTitleLines.map((line, i) => (
              <React.Fragment key={`rec-title-${i}`}>
                <br />
                {line}
              </React.Fragment>
            ))}
            {recipientOfficeLines.map((line, i) => (
              <React.Fragment key={`rec-office-${i}`}>
                <br />
                {line}
              </React.Fragment>
            ))}
          </p>

          {trimmedThru ? (
            <>
              <Mc2010LetterGap />
              <p className="mc2010-stack-tight-p mc2010-attn-block ml-14 uppercase">
                <span className="font-bold">Attn:</span>{' '}
                <span className="font-bold">{trimmedThru}</span>
                {thruTitleLines.map((line, i) => (
                  <React.Fragment key={`thru-title-${i}`}>
                    <br />
                    {line}
                  </React.Fragment>
                ))}
              </p>
              <Mc2010LetterGap />
            </>
          ) : null}

          <div className="space-y-1.5 mb-4 text-left">
            <p>
              <span className="font-bold">{(data.transmittalSalutation || "Sir/Ma'am:").trim()}</span>
              {' '}We are transmitting the Civil Registry Document of: {emph(data.transmittalColbName)}
            </p>
            <ul className="list-none space-y-0.5 pl-0">
              <li><span aria-hidden>• </span><span className="font-bold">Registry No:</span> {emph(data.transmittalRegistryNo)}</li>
              <li><span aria-hidden>• </span>Date of Birth: {emph(dobLine)}</li>
              <li><span aria-hidden>• </span>Name of Father: {emph(data.transmittalFather)}</li>
              <li><span aria-hidden>• </span>Name of Mother: {emph(data.transmittalMother)}</li>
            </ul>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-x-8 gap-y-4 items-start text-[16px] print:text-[12pt] leading-tight">
            <div className="col-start-1 row-start-1 min-w-0">
              <p className="font-bold mb-1 uppercase">Type of Document</p>
              <table className={checklistTableCls}>
                <tbody>
                  {SUPPLEMENTAL_TRANSMITTAL_DOC_TYPE_OPTIONS.map((row) => (
                    <tr key={row.id} className={docType === row.id ? 'mc2010-checked-row' : 'mc2010-unchecked-row'}>
                      <td className={tdBoxCls}>{docType === row.id ? filledBox() : emptyBox()}</td>
                      <td className={tdLblCls}>{row.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-start-2 row-start-1 row-span-2 self-start min-w-0">
              <p className="font-bold mb-1 uppercase">Request for Endorsement</p>
              <table className={checklistTableCls}>
                <tbody>
                  {SUPPLEMENTAL_TRANSMITTAL_ENDORSEMENT_OPTIONS.map((row, i) => (
                    <tr key={row.id} className={endorsementIds.includes(row.id) ? 'mc2010-checked-row' : 'mc2010-unchecked-row'}>
                      <td className={tdBoxCls}>{endorsementIds.includes(row.id) ? filledBox() : emptyBox()}</td>
                      <td className={tdLblCls}>{`${i + 1}. ${row.label}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-start-1 row-start-2 min-w-0">
              <p className="font-bold mb-1 uppercase">Attachments</p>
              <table className={checklistTableCls}>
                <tbody>
                  {SUPPLEMENTAL_TRANSMITTAL_ATTACHMENT_OPTIONS.map((row, i) => (
                    <tr key={row.id} className={attachmentIds.includes(row.id) ? 'mc2010-checked-row' : 'mc2010-unchecked-row'}>
                      <td className={tdBoxCls}>{attachmentIds.includes(row.id) ? filledBox() : emptyBox()}</td>
                      <td className={tdLblCls}>{`${i + 1}. ${row.label}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex-1 min-h-0 min-w-0" />
          <div className="flex flex-col gap-0 pt-0 print:pb-0 shrink-0">
            <p className="mb-1.5">Respectfully yours,</p>
            <p className="mc2010-stack-tight-p mc2010-signatory-lines">
              <span className="font-bold uppercase">LORELIE L. CANTO</span>
              <br />
              <span>Registration Officer IV</span>
            </p>
            <p className="mt-4">Received and</p>
          </div>
        </div>
      </div>

      <footer className="print-doc-footer-wrap mt-auto pt-1 print:pt-0 shrink-0" role="contentinfo">
        <DocumentFooter
          sloganBlue
          contactPhone="(063) 224 - 5038"
          contactEmail="civilregistrar.iligan@gmail.com"
          contentClassName="text-[14px] leading-snug"
        />
      </footer>
    </div>
  )
}
