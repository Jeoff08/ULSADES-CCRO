import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import PrintHeaderRow from '../../components/print/PrintHeaderRow'
import { getWronglyRegisterDraft } from './lib/wronglyRegisterSavedStorage'
import {
  SUPPLEMENTAL_TRANSMITTAL_ATTACHMENT_OPTIONS,
  SUPPLEMENTAL_TRANSMITTAL_DOC_TYPE_OPTIONS,
  SUPPLEMENTAL_TRANSMITTAL_ENDORSEMENT_OPTIONS,
  transmittalRecipientOfficeLinesForPrint,
  transmittalRecipientPositionLines,
  transmittalThruPositionLinesForPrint,
} from './lib/supplementalTransmittalDefaults'

function displayDate(iso) {
  if (!iso) return new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
  try {
    return new Date(iso).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

const tableCls = 'w-full border-collapse border border-black text-[13px]'
const tdBoxCls = 'border border-black w-9 text-center align-middle'
const tdLblCls = 'border border-black px-2 py-0.5'

export default function WronglyRegisterPrint() {
  const data = useMemo(() => getWronglyRegisterDraft({}), [])
  const endorsementIds = Array.isArray(data.transmittalEndorsementIds) ? data.transmittalEndorsementIds : []
  const attachmentIds = Array.isArray(data.transmittalAttachmentIds) ? data.transmittalAttachmentIds : []
  const docType = String(data.transmittalDocType || '').trim()

  return (
    <div className="p-4 print:p-0 supplemental-print-anim-page">
      <div className="no-print mb-3 max-w-6xl mx-auto flex items-center justify-between gap-2">
        <Link
          to="/legal-instrument/wrongly-register/saved"
          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
        >
          Back to Files Saved
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="px-3 py-2 rounded-lg bg-[var(--primary-blue)] text-white text-sm font-semibold hover:bg-[var(--primary-blue-light)]"
        >
          Print
        </button>
      </div>

      <div className="bg-white p-12 shadow-2xl max-w-[816px] mx-auto min-h-[1056px] text-gray-900 font-serif print:shadow-none print:p-0 ring-1 ring-gray-200 print:ring-0">
        <PrintHeaderRow />
        <hr className="border-black my-4" />

        <div className="flex justify-between items-start">
          <div />
          <div className="text-center flex-1">
            <p className="font-bold tracking-wide">TRANSMITTAL</p>
          </div>
          <div />
        </div>

        <div className="mt-6">
          <p className="underline font-semibold">{displayDate(data.transmittalDate)}</p>
          <p className="text-[11px] -mt-0.5">Date</p>
        </div>

        <div className="mt-6">
          <p className="font-bold uppercase">{data.transmittalRecipient}</p>
          {transmittalRecipientPositionLines(data).map((line) => (
            <p key={line} className="uppercase font-semibold">{line}</p>
          ))}
          {transmittalRecipientOfficeLinesForPrint(data).map((line) => (
            <p key={line} className="uppercase">{line}</p>
          ))}
        </div>

        <div className="mt-5">
          <p className="font-bold uppercase">ATTN: {data.transmittalThru}</p>
          {transmittalThruPositionLinesForPrint(data).map((line) => (
            <p key={line} className="uppercase">{line}</p>
          ))}
        </div>

        <p className="mt-6">{(data.transmittalSalutation || 'Sir:').trim()}</p>
        <p className="mt-2 leading-relaxed">
          We are transmitting the Civil Registry Document of{' '}
          <span className="font-bold underline uppercase">{data.transmittalColbName}</span>
        </p>

        <ul className="list-disc ml-10 mt-1 text-[13px] space-y-0.5">
          <li>
            LCR NO. <span className="font-bold underline">{data.transmittalRegistryNo}</span>
          </li>
          <li>
            Date of birth: <span className="font-bold underline">{displayDate(data.transmittalDob)}</span>
          </li>
          <li>
            Name of Father: <span className="font-bold underline uppercase">{data.transmittalFather}</span>
          </li>
          <li>
            Name of Mother: <span className="font-bold underline uppercase">{data.transmittalMother}</span>
          </li>
        </ul>

        <div className="mt-8 grid grid-cols-2 gap-10 items-start">
          <div>
            <p className="font-bold text-[13px] mb-1">Type of Document</p>
            <table className={tableCls}>
              <tbody>
                {SUPPLEMENTAL_TRANSMITTAL_DOC_TYPE_OPTIONS.map((row) => (
                  <tr key={row.id}>
                    <td className={tdBoxCls}>
                      <span className={`inline-block w-4 h-4 rounded-sm border border-black ${docType === row.id ? 'bg-[#0b61ff]' : ''}`} />
                    </td>
                    <td className={tdLblCls}>{row.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="font-bold text-[13px] mb-1 mt-5">Attachments</p>
            <table className={tableCls}>
              <tbody>
                {SUPPLEMENTAL_TRANSMITTAL_ATTACHMENT_OPTIONS.map((row) => (
                  <tr key={row.id}>
                    <td className={tdBoxCls}>
                      <span className={`inline-block w-4 h-4 rounded-sm border border-black ${attachmentIds.includes(row.id) ? 'bg-[#0b61ff]' : ''}`} />
                    </td>
                    <td className={tdLblCls}>{row.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <p className="font-bold text-[13px] mb-1">Request for Endorsement</p>
            <table className={tableCls}>
              <tbody>
                {SUPPLEMENTAL_TRANSMITTAL_ENDORSEMENT_OPTIONS.map((row) => (
                  <tr key={row.id}>
                    <td className={tdBoxCls}>
                      <span className={`inline-block w-4 h-4 rounded-sm border border-black ${endorsementIds.includes(row.id) ? 'bg-[#0b61ff]' : ''}`} />
                    </td>
                    <td className={tdLblCls}>{row.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 flex items-end justify-between">
          <div>
            <p>Respectfully yours,</p>
            <p className="mt-10 font-bold underline uppercase">{data.transmittalSignerName || '__________________________'}</p>
            <p className="text-[12px]">{data.transmittalSignerTitle || 'Registration Officer'}</p>
          </div>
          <div className="text-right">
            <p className="mt-10 font-bold underline uppercase">{data.transmittalDocOwner || '__________________________'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

