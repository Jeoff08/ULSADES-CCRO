import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { defaultLegitimation } from './lib/legitimationDefaults'
import { LEGITIMATION_TYPES } from './constants'
import { PAPER_SIZES } from '../../components/print'
import { getUploadedFile, restoreUploadedFileFromTrash } from '../../lib/uploadedFileStore'
import UploadFileModal from '../../components/upload/UploadFileModal'
import ToastHost from '../../components/toast/ToastHost'
import { useToasts } from '../../components/toast/useToasts'
import {
  SoleAffidavitLegitimation,
  JointAffidavitLegitimation,
  RegistrationOfLegitimation,
  RegistrationOfAcknowledgement,
  LcrForm1A,
  Transmittal,
  OutOfTownTransmittal,
  Annotation,
} from './print'

const PRINT_SIZE_STYLE_ID = 'print-paper-size-legitimation'

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

function getStoredData() {
  try {
    const raw = localStorage.getItem('legitimationDraft')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return { ...defaultLegitimation, ...parsed }
  } catch {
    return null
  }
}

export default function LegitimationPrint() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [paperSize, setPaperSize] = useState('a4')
  const type = searchParams.get('type') || 'joint-affidavit'
  const recordId = searchParams.get('id') || 'draft'
  const [data, setData] = useState(() => getStoredData() || defaultLegitimation)
  const uploadInputRef = useRef(null)
  const uploadScopeRef = useRef('')
  const [uploadTick, setUploadTick] = useState(0)
  const [modal, setModal] = useState({ open: false, key: '', title: '' })
  const { toasts, show, dismiss } = useToasts()

  usePrintPageSize(paperSize)

  useEffect(() => {
    const stored = getStoredData()
    if (stored) setData(stored)
  }, [])

  const validType = LEGITIMATION_TYPES.some((t) => t.id === type) ? type : 'joint-affidavit'

  const childFull = [data.childFirst, data.childMiddle, data.childLast].filter(Boolean).join(' ')
  const fatherFull = [data.fatherFirst, data.fatherMiddle, data.fatherLast].filter(Boolean).join(' ')
  const motherFull = [data.motherFirst, data.motherMiddle, data.motherLast].filter(Boolean).join(' ')
  const subjectLine = `SUBJECT: LEGITIMATION IN FAVOR OF ${(childFull || '').toUpperCase()} - PARENTS ${(fatherFull || '').toUpperCase()} AND ${(motherFull || '').toUpperCase()}`

  let content
  switch (validType) {
    case 'sole-affidavit':
      content = <SoleAffidavitLegitimation data={data} />
      break
    case 'joint-affidavit':
      content = <JointAffidavitLegitimation data={data} />
      break
    case 'registration-legitimation':
      content = <RegistrationOfLegitimation data={data} />
      break
    case 'registration-acknowledgement':
      content = <RegistrationOfAcknowledgement data={data} />
      break
    case 'lcr-form-1a':
      content = <LcrForm1A data={data} />
      break
    case 'transmittal':
      content = <Transmittal data={data} subjectLine={subjectLine} />
      break
    case 'out-of-town-transmittal':
      content = <OutOfTownTransmittal data={data} subjectLine={subjectLine} />
      break
    case 'annotation':
      content = <Annotation data={data} />
      break
    default:
      content = <JointAffidavitLegitimation data={data} />
  }

  return (
    <div className="p-4 print:p-0">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold text-gray-800">Legitimation – Print</h1>
          <button type="button" onClick={() => navigate('/legitimation/saved')} className="px-3 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50">
            Back to Files Saved
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="legitimation-paper-size">Paper size (for print)</label>
          <select
            id="legitimation-paper-size"
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            {PAPER_SIZES.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <button type="button" onClick={() => window.print()} className="px-3 py-2.5 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
            Print
          </button>
        </div>
      </div>
      <div className="flex gap-6">
        <aside className="no-print w-56 shrink-0 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">View &amp; Print</h2>
          <div className="flex flex-col gap-2">
            {LEGITIMATION_TYPES.map((t) => {
              const isSelected = validType === t.id
              const key = `legitimation:${recordId}:${t.id}`
              const uploaded = !!getUploadedFile(key)
              return (
                <div key={t.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setSearchParams({ type: t.id })}
                    className={`text-left px-3 py-2.5 text-sm font-medium transition text-white rounded-lg bg-[#283750] hover:bg-[#1e2d42] w-full pr-[5.75rem] ${isSelected ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                  >
                    {String(t.title || '').replace(/^\s*\d+\.\s*/, '')}
                  </button>
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {!uploaded ? (
                      <button
                        type="button"
                        onClick={() => setModal({ open: true, key, title: `Legitimation – ${t.title}` })}
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
                        onClick={() => navigate(`/uploaded/${encodeURIComponent(key)}`)}
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
