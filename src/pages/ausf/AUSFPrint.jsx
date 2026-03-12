import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAUSFDraft } from './lib/ausfStorage'
import { defaultAUSF } from './lib/ausfDefaults'
import { TRANSMITTAL_ATTACHMENTS_LOCAL, TRANSMITTAL_ATTACHMENTS_PSA } from '../../components/print'
import AusfOnly from './print/AusfOnly'
import Ausf0717 from './print/Ausf0717'
import RegistrationOfAusf from './print/RegistrationOfAusf'
import RegistrationOfAcknowledgement from './print/RegistrationOfAcknowledgement'
import LcrForm1ABirthAvailable from './print/LcrForm1ABirthAvailable'
import LcrFormA1 from './print/LcrFormA1'
import AnnotationChildNotAck from './print/AnnotationChildNotAck'
import TransmittalDoc from './print/TransmittalDoc'
import LegacyPrintSummary from './print/LegacyPrintSummary'

const VIEW_PRINT_OPTIONS = [
  { label: 'AUSF only', type: 'ausf-only' },
  { label: 'AUSF 0-6', type: 'ausf-0-6' },
  { label: 'AUSF 07-17', type: 'ausf-07-17' },
  { label: 'Registration of AUSF', type: 'reg-ausf' },
  { label: 'Registration of Acknowledgement', type: 'reg-ack' },
  { label: 'LCR Form 1A (Birth-Available)', type: 'child-ack-lcr', labelLine1: 'LCR Form 1A (Birth-', labelLine2: 'Available)' },
  { label: 'Annotation (Child Ack)', type: 'child-ack-annotation' },
  { label: 'LCR Form A1', type: 'child-not-ack-lcr', buttonRoundedLeft: true },
  { label: 'Annotation (Child Not Ack)', type: 'child-not-ack-annotation' },
  { label: 'Transmittal', type: 'child-not-ack-transmittal' },
  { label: 'Out-of-Town Transmittal', type: 'out-of-town' },
]

const PAPER_SIZES = [
  { id: 'a4', label: 'A4 (210 × 297 mm)', size: '210mm 297mm', widthMm: 210, heightMm: 297 },
  { id: 'short', label: 'Short bond (8.5" × 11")', size: '8.5in 11in', widthMm: 215.9, heightMm: 279.4 },
  { id: 'long', label: 'Long (8.5" × 13")', size: '8.5in 13in', widthMm: 215.9, heightMm: 330.2 },
]

const PRINT_SIZE_STYLE_ID = 'print-paper-size'

function usePrintPageSize(paperId) {
  useEffect(() => {
    const spec = PAPER_SIZES.find((p) => p.id === paperId) || PAPER_SIZES[0]
    document.documentElement.dataset.paperSize = paperId
    let el = document.getElementById(PRINT_SIZE_STYLE_ID)
    if (!el) {
      el = document.createElement('style')
      el.id = PRINT_SIZE_STYLE_ID
      document.head.appendChild(el)
    }
    el.textContent = `@media print { @page { size: ${spec.size}; } }`
    return () => {
      delete document.documentElement.dataset.paperSize
    }
  }, [paperId])
}

export default function AUSFPrint() {
  const [data, setData] = useState(null)
  const [displayType, setDisplayType] = useState(null)
  const [paperSize, setPaperSize] = useState('a4')
  const navigate = useNavigate()

  usePrintPageSize(paperSize)

  useEffect(() => {
    const draft = getAUSFDraft()
    if (draft) {
      const loaded = { ...defaultAUSF, ...draft }
      setData(loaded)
      setDisplayType((prev) => prev ?? loaded.formType)
    } else {
      setData(null)
    }
  }, [])

  const defaultTitle = 'ULSADES - Unified Legal Status Automated Data Entry System | Iligan City Civil Registrar'
  useEffect(() => {
    document.title = 'AUSF'
    return () => { document.title = defaultTitle }
  }, [])

  const handlePrint = () => window.print()

  if (data === null) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-600 mb-4">No form data found. Fill out the form first, then click Done to view and print.</p>
        <button type="button" onClick={() => navigate('/')} className="px-4 py-2 bg-[var(--primary-blue)] text-white rounded-lg">Go to Dashboard</button>
      </div>
    )
  }

  const type = displayType || data.formType

  let content
  if (type === 'ausf-only' || type === 'ausf-0-6') content = <AusfOnly data={data} viewType={type} />
  else if (type === 'ausf-07-17') content = <Ausf0717 data={data} />
  else if (type === 'reg-ausf') content = <RegistrationOfAusf data={data} />
  else if (type === 'reg-ack') content = <RegistrationOfAcknowledgement data={data} />
  else if (type === 'child-ack-lcr' || type === 'child-ack-annotation') content = <LcrForm1ABirthAvailable data={data} />
  else if (type === 'child-not-ack-lcr') content = <LcrFormA1 data={data} />
  else if (type === 'child-not-ack-annotation') content = <AnnotationChildNotAck data={data} />
  else if (type === 'child-not-ack-transmittal') content = <TransmittalDoc data={data} isOutOfTown={false} checklistConfig={{ isOutOfTown: false, defaultLabels: TRANSMITTAL_ATTACHMENTS_LOCAL }} />
  else if (type === 'out-of-town') content = <TransmittalDoc data={data} isOutOfTown={true} checklistConfig={{ isOutOfTown: true, defaultLabels: TRANSMITTAL_ATTACHMENTS_PSA }} />
  else content = <LegacyPrintSummary data={data} />

  return (
    <div className="p-4 print:p-0">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold text-gray-800">AUSF – Print</h1>
          <button type="button" onClick={() => navigate('/ausf/saved')} className="px-3 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50">
            Back to Files Saved
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="paper-size-select">Paper size (for print)</label>
          <select
            id="paper-size-select"
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            {PAPER_SIZES.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <button type="button" onClick={handlePrint} className="px-3 py-2.5 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
            Print
          </button>
        </div>
      </div>
      <div className="flex gap-6">
        <aside className="no-print w-56 shrink-0 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">View &amp; Print</h2>
          <div className="flex flex-col gap-2">
            {VIEW_PRINT_OPTIONS.map((opt) => {
              const isSelected = type === opt.type
              const isLcrButton = opt.type === 'child-not-ack-lcr' || opt.type === 'child-ack-lcr'
              const btnClass = [
                'text-left px-3 py-2.5 text-sm font-medium transition text-white rounded-lg',
                isLcrButton ? 'bg-[#283750] hover:bg-[#1e2d42]' : 'bg-[var(--primary-blue)]/80 hover:bg-[var(--primary-blue)]',
                isSelected ? 'ring-2 ring-offset-1 ring-[var(--primary-blue)]' : '',
              ].filter(Boolean).join(' ')
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setDisplayType(opt.type)}
                  className={btnClass}
                >
                  {opt.labelLine1 != null ? (
                    <>
                      <span className="block leading-tight">{opt.labelLine1}</span>
                      <span className="block leading-tight">{opt.labelLine2}</span>
                    </>
                  ) : (
                    opt.label
                  )}
                </button>
              )
            })}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 flex flex-col gap-2">
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">To remove date, title, and URL from the printed page, uncheck &quot;Headers and footers&quot; in the print dialog.</p>
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          {content}
        </div>
      </div>
    </div>
  )
}
