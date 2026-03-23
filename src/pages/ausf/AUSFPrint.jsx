import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAUSFDraft, saveAUSFDraft } from './lib/ausfStorage'
import { defaultAUSF } from './lib/ausfDefaults'
import { TRANSMITTAL_ATTACHMENTS_LOCAL, TRANSMITTAL_ATTACHMENTS_PSA } from '../../components/print'
import { getUploadedFile, restoreUploadedFileFromTrash } from '../../lib/uploadedFileStore'
import UploadFileModal from '../../components/upload/UploadFileModal'
import ToastHost from '../../components/toast/ToastHost'
import { useToasts } from '../../components/toast/useToasts'
import AusfOnly from './print/AusfOnly'
import Ausf06 from './print/Ausf06'
import Ausf0717 from './print/Ausf0717'
import RegistrationOfAusf from './print/RegistrationOfAusf'
import RegistrationOfAcknowledgement from './print/RegistrationOfAcknowledgement'
import LcrForm1ABirthAvailable from './print/LcrForm1ABirthAvailable'
import LcrFormA1 from './print/LcrFormA1'
import AnnotationChildAck from './print/AnnotationChildAck'
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
  const [searchParams] = useSearchParams()
  const recordId = searchParams.get('id') || 'draft'
  const uploadInputRef = useRef(null)
  const uploadScopeRef = useRef('')
  const [uploadTick, setUploadTick] = useState(0)
  const [modal, setModal] = useState({ open: false, key: '', title: '' })
  const { toasts, show, dismiss } = useToasts()

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
  const scopeKey = (typeId) => `ausf:${recordId}:${typeId}`
  const titleFor = (opt) => `AUSF – ${opt.label || opt.type}`
  const hasUploadFor = (typeId) => !!getUploadedFile(scopeKey(typeId))

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
  if (type === 'ausf-only') content = <AusfOnly data={data} />
  else if (type === 'ausf-0-6') content = <Ausf06 data={data} />
  else if (type === 'ausf-07-17') content = <Ausf0717 data={data} />
  else if (type === 'reg-ausf') content = <RegistrationOfAusf data={data} />
  else if (type === 'reg-ack') content = <RegistrationOfAcknowledgement data={data} />
  else if (type === 'child-ack-lcr') content = <LcrForm1ABirthAvailable data={data} />
  else if (type === 'child-ack-annotation') content = (
    <AnnotationChildAck
      data={{ ...data, colbScanDataUrl: data.colbScanDataUrlAck ?? '' }}
      onColbScanChange={(url) => {
        const next = { ...data, colbScanDataUrlAck: url }
        setData(next)
        saveAUSFDraft(next)
      }}
      onAnnotationChange={(text) => {
        const next = { ...data, annotationChildAckText: text }
        setData(next)
        saveAUSFDraft(next)
      }}
    />
  )
  else if (type === 'child-not-ack-lcr') content = <LcrFormA1 data={data} />
  else if (type === 'child-not-ack-annotation') content = (
    <AnnotationChildNotAck
      data={{ ...data, colbScanDataUrl: data.colbScanDataUrlNotAck ?? '' }}
      onColbScanChange={(url) => {
        const next = { ...data, colbScanDataUrlNotAck: url }
        setData(next)
        saveAUSFDraft(next)
      }}
      onAnnotationChange={(text) => {
        const next = { ...data, annotationChildAckText: text }
        setData(next)
        saveAUSFDraft(next)
      }}
    />
  )
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
              const uploaded = hasUploadFor(opt.type)
              return (
                <div key={opt.type} className="relative">
                  <button
                    type="button"
                    onClick={() => setDisplayType(opt.type)}
                    className={[btnClass, 'w-full pr-[5.75rem]'].join(' ')}
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
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {!uploaded ? (
                      <button
                        type="button"
                        onClick={() => setModal({ open: true, key: scopeKey(opt.type), title: titleFor(opt) })}
                        className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        aria-label="Upload file"
                        title="Upload file"
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden>
                          <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M8 8l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(`/uploaded/${encodeURIComponent(scopeKey(opt.type))}`)}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        aria-label="View uploaded file"
                        title="View uploaded file"
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden>
                          <path
                            d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </button>
                    )}
                    {uploaded ? <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="File uploaded" aria-label="File uploaded" /> : null}
                  </div>
                </div>
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
      <UploadFileModal
        open={modal.open}
        scopeKey={modal.key}
        title={modal.title}
        onClose={() => setModal({ open: false, key: '', title: '' })}
        onChanged={(evt) => {
          setUploadTick((t) => t + 1)
          if (evt?.kind === 'uploaded') {
            show({ type: 'success', title: 'File uploaded', message: evt.fileName ? `Saved: ${evt.fileName}` : '' })
          }
          if (evt?.kind === 'removed') {
            const key = evt.scopeKey
            show({
              type: 'info',
              title: 'File removed',
              message: 'You can undo within 5 seconds.',
              actionLabel: 'Undo',
              onAction: () => {
                restoreUploadedFileFromTrash(key)
                setUploadTick((t) => t + 1)
              },
            })
          }
        }}
      />
      <ToastHost toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
