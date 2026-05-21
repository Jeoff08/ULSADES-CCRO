import React, { useMemo } from 'react'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'
import { formatTransmittalDateLong, formatDobDayMonthYearUpper } from '../../../lib/printUtils'
import {
  SUPPLEMENTAL_TRANSMITTAL_DOC_TYPE_OPTIONS,
  ccrTransmittalThruBlockForPrint,
  ccrTransmittalToLinesForPrint,
  getVisibleTransmittalAttachmentRows,
  getVisibleTransmittalEndorsementRows,
  resolveTransmittalSignatory,
} from '../lib/supplementalTransmittalDefaults'

const tableCls = 'w-full border-collapse border border-black text-[14px] leading-tight'
const tablePrintCls = 'w-auto border-collapse border border-black text-[14px] leading-tight'
const tdBoxCls = 'border border-black w-10 min-w-[2.25rem] text-center align-middle py-1'
const tdLblCls = 'border border-black px-2 py-1 text-left'

function filledBox() {
  return (
    <div
      className="mx-auto min-h-[1.05rem] min-w-[1.05rem] w-[1.1rem] h-[1.1rem] bg-blue-600 border border-black"
      aria-hidden
    />
  )
}

function emptyBox() {
  return (
    <div
      className="mx-auto min-h-[1.05rem] min-w-[1.05rem] w-[1.1rem] h-[1.1rem] border border-black bg-white"
      aria-hidden
    />
  )
}

export default function SupplementalTransmittal({
  data,
  paperWidth = '210mm',
  paperHeight = '297mm',
  onSignatoryOptionIndexChange,
}) {
  const dateLine = formatTransmittalDateLong(data.transmittalDate || '')
  const dobLine = formatDobDayMonthYearUpper(data.transmittalDob || '')

  const docType = data.transmittalDocType || ''
  const endorsementIds = Array.isArray(data.transmittalEndorsementIds) ? data.transmittalEndorsementIds : []
  const attachmentIds = Array.isArray(data.transmittalAttachmentIds) ? data.transmittalAttachmentIds : []

  const signatory = resolveTransmittalSignatory(data)
  const toLines = ccrTransmittalToLinesForPrint(data)
  const thruBlock = ccrTransmittalThruBlockForPrint(data)

  const docTypeRowsPrint = useMemo(
    () => SUPPLEMENTAL_TRANSMITTAL_DOC_TYPE_OPTIONS.filter((row) => docType === row.id),
    [docType]
  )
  const endorsementRowsPrint = useMemo(
    () =>
      getVisibleTransmittalEndorsementRows(data).filter(
        (row) => endorsementIds.includes(row.id) && String(row.label || '').trim()
      ),
    [data, endorsementIds]
  )
  const attachmentRowsPrint = useMemo(
    () =>
      getVisibleTransmittalAttachmentRows(data).filter(
        (row) => attachmentIds.includes(row.id) && String(row.label || '').trim()
      ),
    [data, attachmentIds]
  )
  const hasAnyChecklistForPrint =
    docTypeRowsPrint.length > 0 || endorsementRowsPrint.length > 0 || attachmentRowsPrint.length > 0

  const emph = (v) => {
    const t = (v || '').trim().toUpperCase()
    if (!t) return <span className="inline-block min-w-[10ch] border-b border-black" />
    return <span className="font-bold underline">{t}</span>
  }

  return (
    <div
      className="ausf-doc print-doc print-doc-transmittal supplemental-transmittal-doc bg-white text-black mx-auto px-7 py-5 leading-snug flex flex-col"
      style={{ fontFamily: 'Arial, sans-serif', width: paperWidth, minHeight: paperHeight }}
    >
      <div className="print-doc-header shrink-0">
        <PrintHeaderRow headerImageClassName="w-28 h-28 object-contain shrink-0" singleLineAddress />
        <hr className="border-black my-2" />
      </div>

      <div className="print-doc-body flex flex-col flex-1 min-h-0">
        <h1 className="supplemental-transmittal-title text-center text-2xl font-bold tracking-[0.14em] mb-5">
          TRANSMITTAL
        </h1>
        <div className="supplemental-transmittal-letter-body ml-2 pl-6 flex flex-col flex-1 min-h-0 min-w-0">
        {/* Print + preview: letter body (date through sign-off) */}
        <p className="supplemental-transmittal-date-line font-bold text-sm mb-6">
          {dateLine || '\u00a0'}
        </p>

        <div className="mb-6 space-y-1 text-sm">
          <p className="font-bold uppercase">{toLines[0]}</p>
          {toLines.slice(1).map((line, i) => (
            <p key={`rec-psa-${i}`} className="uppercase">
              {line}
            </p>
          ))}
        </div>

        <div className="supplemental-transmittal-attn-block mb-6 text-sm ml-10 md:ml-16 space-y-0.5">
          <p>
            <span className="font-bold">{thruBlock.prefix}</span>{' '}
            <span className="font-bold uppercase">{thruBlock.lines[0]}</span>
          </p>
          {thruBlock.lines.slice(1).map((line, i) => (
            <p key={`thru-title-${i}`} className="uppercase leading-snug">
              {line}
            </p>
          ))}
        </div>

        <div className="text-sm space-y-4 mb-4 text-left">
          <p>
            <span className="font-bold">{(data.transmittalSalutation || 'Sir:').trim()}</span>{' '}
            We are transmitting the Civil Registry Document of: {emph(data.transmittalColbName)}
          </p>
          <ul className="list-none space-y-2 pl-0">
            <li>
              <span className="select-none" aria-hidden>
                •{' '}
              </span>
              <span className="font-bold">Registry No:</span> {emph(data.transmittalRegistryNo)}
            </li>
            <li>
              <span className="select-none" aria-hidden>
                •{' '}
              </span>
              <span className="font-bold">Date of Birth:</span> {emph(dobLine)}
            </li>
            <li>
              <span className="select-none" aria-hidden>
                •{' '}
              </span>
              <span className="font-bold">Name of Father:</span> {emph(data.transmittalFather)}
            </li>
            <li>
              <span className="select-none" aria-hidden>
                •{' '}
              </span>
              <span className="font-bold">Name of Mother:</span> {emph(data.transmittalMother)}
            </li>
          </ul>
        </div>

        {/* Screen: show all rows. Print/PDF: show only selected rows (see print-only grid below). */}
        <div className="supplemental-transmittal-checklist-grid no-print mb-4 grid grid-cols-2 gap-x-6 gap-y-5 items-start text-[14px]">
          <div className="col-start-1 row-start-1 min-w-0">
            <p className="font-bold text-sm mb-1 uppercase tracking-tight">Type of Document</p>
            <table className={tableCls}>
              <tbody>
                {SUPPLEMENTAL_TRANSMITTAL_DOC_TYPE_OPTIONS.map((row) => (
                  <tr key={row.id}>
                    <td className={tdBoxCls}>{docType === row.id ? filledBox() : emptyBox()}</td>
                    <td className={tdLblCls}>{row.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="col-start-2 row-start-1 row-span-2 self-start min-w-0">
            <p className="font-bold text-sm mb-1 uppercase tracking-tight">Request for Endorsement</p>
            <table className={tableCls}>
              <tbody>
                {getVisibleTransmittalEndorsementRows(data).map((row, i) => (
                  <tr key={row.id}>
                    <td className={tdBoxCls}>
                      {endorsementIds.includes(row.id) ? filledBox() : emptyBox()}
                    </td>
                    <td className={tdLblCls}>
                      {i + 1}. {row.label || '\u00a0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="col-start-1 row-start-2 min-w-0">
            <p className="font-bold text-sm mb-1 uppercase tracking-tight">Attachments</p>
            <table className={tableCls}>
              <tbody>
                {getVisibleTransmittalAttachmentRows(data).map((row, i) => (
                  <tr key={row.id}>
                    <td className={tdBoxCls}>
                      {attachmentIds.includes(row.id) ? filledBox() : emptyBox()}
                    </td>
                    <td className={tdLblCls}>
                      {i + 1}. {row.label || '\u00a0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {hasAnyChecklistForPrint ? (
          <div className="supplemental-transmittal-checklist-grid supplemental-transmittal-checklist-print-only mb-4 hidden print:grid grid-cols-2 gap-x-6 gap-y-5 items-start text-[14px]">
            {docTypeRowsPrint.length > 0 ? (
              <div className="col-start-1 row-start-1 min-w-0">
                <p className="font-bold text-sm mb-1 uppercase tracking-tight">Type of Document</p>
                <table className={tablePrintCls}>
                  <tbody>
                    {docTypeRowsPrint.map((row) => (
                      <tr key={row.id}>
                        <td className={tdBoxCls}>{filledBox()}</td>
                        <td className={tdLblCls}>{row.label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {endorsementRowsPrint.length > 0 ? (
              <div className="col-start-2 row-start-1 row-span-2 self-start min-w-0">
                <p className="font-bold text-sm mb-1 uppercase tracking-tight">Request for Endorsement</p>
                <table className={tablePrintCls}>
                  <tbody>
                    {endorsementRowsPrint.map((row, i) => (
                      <tr key={row.id}>
                        <td className={tdBoxCls}>{filledBox()}</td>
                        <td className={tdLblCls}>
                          {i + 1}. {row.label}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {attachmentRowsPrint.length > 0 ? (
              <div className="supplemental-transmittal-print-attachments col-start-1 row-start-2 min-w-0">
                <p className="font-bold text-sm mb-1 uppercase tracking-tight">Attachments</p>
                <table className={tablePrintCls}>
                  <tbody>
                    {attachmentRowsPrint.map((row, i) => (
                      <tr key={row.id}>
                        <td className={tdBoxCls}>{filledBox()}</td>
                        <td className={tdLblCls}>
                          {i + 1}. {row.label}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="hidden print:block text-sm italic text-gray-800 mb-4">
            No document type or checklist items were selected for this transmittal.
          </p>
        )}

        <div className="supplemental-transmittal-body-spacer flex-1 min-h-0 min-w-0" aria-hidden />
        <div className="supplemental-transmittal-sign-off flex flex-col gap-0 pt-0 text-sm print:pb-0 shrink-0">
          <p className="mb-1.5">Respectfully yours,</p>
          <p className="font-bold uppercase leading-none">{signatory.name}</p>
          <p className="leading-none">{signatory.title}</p>
        </div>
        </div>
      </div>

      <footer className="print-doc-footer-wrap mt-auto pt-1 print:pt-0 shrink-0" role="contentinfo">
        <DocumentFooter
          sloganBlue
          contactPhone="(063) 227 - 2806"
          contactEmail="civilregistrar.iligan@gmail.com"
          contentClassName="text-[14px] leading-snug"
        />
      </footer>
    </div>
  )
}
