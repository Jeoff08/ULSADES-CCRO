import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { defaultLegitimation, syncLegitimationTransmittalFlagWithFormType } from './lib/legitimationDefaults'
import { saveLegitimationDraft } from './lib/legitimationStorage'
import { LEGITIMATION_TYPES } from './constants'
import { PAPER_SIZES } from '../../components/print'
import { getUploadedFile, restoreUploadedFileFromTrash } from '../../lib/uploadedFileStore'
import UploadFileModal from '../../components/upload/UploadFileModal'
import ToastHost from '../../components/toast/ToastHost'
import { useToasts } from '../../components/toast/useToasts'
import { useDebouncedSuccessToast } from '../../hooks/useDebouncedSuccessToast'
import { saveCurrentViewAsPdf, openSavedPdfInBrowser } from '../../lib/savePdf'
import {
  SoleAffidavitLegitimation,
  JointAffidavitLegitimation,
  RegistrationOfLegitimation,
  RegistrationOfAcknowledgement,
  LcrForm1A,
  Transmittal,
  OutOfTownTransmittal,
} from './print'
import { LEGITIMATION_LCR_1A_EXCLUDED_PAPER_SIZE_IDS } from './print/LcrForm1A'
import { RECEIVED_BY_OPTIONS, legitimationAffidavitCcrPersistPatch, legitimationAffidavitCcrSelectValue } from './print/legitimationAffidavitCcr'
import LcrRemarksFontSizeSelect from '../../components/lcr/LcrRemarksFontSizeSelect'
import {
  LCR_CERTIFICATION_COPIES,
  mergeLcrCertificationCopyIntoData,
  parseLcrPrintTypeId,
} from '../../lib/lcrCertificationRequest'
import {
  isLegitimationLcrTriplePdfView,
  lcrTriplePdfPageClassName,
  withLcrTriplePdfCapture,
} from '../../lib/lcrPdfExport'
const PRINT_SIZE_STYLE_ID = 'print-paper-size-legitimation'
const LEGITIMATION_TRANSMITTAL_TYPES = new Set(['transmittal', 'out-of-town-transmittal'])

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
    return syncLegitimationTransmittalFlagWithFormType({ ...defaultLegitimation, ...parsed })
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
  const resolvedType = type === 'annotation' ? 'lcr-form-1a' : type
  const validType = LEGITIMATION_TYPES.some((t) => t.id === resolvedType)
    ? resolvedType
    : parseLcrPrintTypeId(resolvedType).baseType === 'lcr-form-1a'
      ? 'lcr-form-1a'
      : 'joint-affidavit'
  const { baseType: lcrBaseType } = parseLcrPrintTypeId(validType)
  const [data, setData] = useState(() => getStoredData() || defaultLegitimation)
  const uploadInputRef = useRef(null)
  const uploadScopeRef = useRef('')
  const [uploadTick, setUploadTick] = useState(0)
  const [modal, setModal] = useState({ open: false, key: '', title: '' })
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewPdfUrl, setPreviewPdfUrl] = useState('')
  const { toasts, show, dismiss } = useToasts()
  const notifyLcrCertSaved = useDebouncedSuccessToast(show)
  const allowedTypes = LEGITIMATION_TYPES.filter((t) => {
    if (data.bothParentsAlive === 'NO' && t.id === 'joint-affidavit') return false
    if (data.bothParentsAlive === 'YES' && t.id === 'sole-affidavit') return false
    if (data.birthRegisteredIligan === 'NO' && parseLcrPrintTypeId(t.id).baseType === 'lcr-form-1a') return false
    if (data.legitimationTransmittalIsOutOfTown === true && parseLcrPrintTypeId(t.id).baseType === 'lcr-form-1a') return false
    if (LEGITIMATION_TRANSMITTAL_TYPES.has(t.id)) {
      const oot = data.legitimationTransmittalIsOutOfTown === true
      if (oot && t.id !== 'out-of-town-transmittal') return false
      if (!oot && t.id !== 'transmittal') return false
    }
    return true
  })
  const allowedTypeIds = allowedTypes.map((t) => t.id)

  useEffect(() => {
    const t = searchParams.get('type') || ''
    const { baseType } = parseLcrPrintTypeId(t)
    if (baseType === 'lcr-form-1a' && t !== baseType) {
      setSearchParams(
        (sp) => {
          const n = new URLSearchParams(sp)
          n.set('type', baseType)
          return n
        },
        { replace: true },
      )
    }
  }, [searchParams, setSearchParams])
  const showAffidavitCcrInSidebar =
    allowedTypeIds.includes('joint-affidavit') || allowedTypeIds.includes('sole-affidavit')
  const effectiveType = allowedTypeIds.includes(validType)
    ? validType
    : (allowedTypeIds[0] || 'joint-affidavit')
  const paperSizesForPrint = useMemo(() => {
    if (lcrBaseType === 'lcr-form-1a') {
      return PAPER_SIZES.filter((p) => !LEGITIMATION_LCR_1A_EXCLUDED_PAPER_SIZE_IDS.has(p.id))
    }
    return PAPER_SIZES
  }, [lcrBaseType])

  const pageSizeForPrint =
    lcrBaseType === 'lcr-form-1a' && LEGITIMATION_LCR_1A_EXCLUDED_PAPER_SIZE_IDS.has(paperSize)
      ? 'long'
      : paperSize

  useEffect(() => {
    if (lcrBaseType !== 'lcr-form-1a') return
    if (!LEGITIMATION_LCR_1A_EXCLUDED_PAPER_SIZE_IDS.has(paperSize)) return
    setPaperSize('long')
  }, [lcrBaseType, paperSize])

  const [affidavitCcrSidebarTarget, setAffidavitCcrSidebarTarget] = useState(() =>
    allowedTypeIds.includes('joint-affidavit') ? 'joint' : 'sole'
  )

  useEffect(() => {
    if (effectiveType === 'joint-affidavit') setAffidavitCcrSidebarTarget('joint')
    else if (effectiveType === 'sole-affidavit') setAffidavitCcrSidebarTarget('sole')
  }, [effectiveType])

  const affidavitCcrVariant =
    effectiveType === 'sole-affidavit' ? 'sole' : effectiveType === 'joint-affidavit' ? 'joint' : affidavitCcrSidebarTarget
  const handleSavePdf = async () => {
    try {
      const savePdf = () => saveCurrentViewAsPdf(`Legitimation-${effectiveType}`)
      const result = isLegitimationLcrTriplePdfView(lcrBaseType)
        ? await withLcrTriplePdfCapture({}, savePdf)
        : await savePdf()
      if (result?.ok) {
        show({
          type: 'success',
          title: 'PDF saved',
          message: result.filePath || '',
          actionLabel: 'Open',
          onAction: async () => {
            if (!result.filePath) return
            await openSavedPdfInBrowser(result.filePath)
          },
        })
        return
      }
      if (result?.cancelled) {
        show({ type: 'info', title: 'Save cancelled', message: 'No PDF file was created.' })
        return
      }
      show({ type: 'error', title: 'Save failed', message: result?.reason || 'Unable to save PDF.' })
    } catch (err) {
      show({ type: 'error', title: 'Save failed', message: err?.message || 'Unable to save PDF.' })
    }
  }
  const handlePreviewPdfModal = async () => {
    try {
      const bridge = window?.electronAPI
      if (!bridge || typeof bridge.previewPdfData !== 'function') {
        show({ type: 'error', title: 'Preview unavailable', message: 'PDF preview bridge is unavailable. Restart Electron.' })
        return
      }
      let result
      try {
        const previewPdf = () => bridge.previewPdfData()
        result = isLegitimationLcrTriplePdfView(lcrBaseType)
          ? await withLcrTriplePdfCapture({}, previewPdf)
          : await previewPdf()
      } catch (invokeErr) {
        const msg = String(invokeErr?.message || '')
        if (msg.includes("No handler registered for 'pdf:get-current-window-base64'")) {
          if (typeof bridge.previewPdf === 'function') {
            const fallback = await bridge.previewPdf(`Legitimation-${effectiveType}-preview`)
            if (fallback?.ok) {
              show({ type: 'info', title: 'Preview opened', message: 'Opened using fallback preview. Please restart Electron to enable in-app modal preview.' })
              return
            }
            show({ type: 'error', title: 'Preview failed', message: fallback?.reason || 'Unable to open fallback preview.' })
            return
          }
        }
        throw invokeErr
      }
      if (!result?.ok || !result?.base64) {
        show({ type: 'error', title: 'Preview failed', message: result?.reason || 'Unable to generate PDF preview.' })
        return
      }

      const binary = atob(result.base64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl)
      setPreviewPdfUrl(url)
      setPreviewModalOpen(true)
    } catch (err) {
      show({ type: 'error', title: 'Preview failed', message: err?.message || 'Unable to generate PDF preview.' })
    }
  }
  const closePreviewModal = () => {
    setPreviewModalOpen(false)
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl)
      setPreviewPdfUrl('')
    }
  }

  usePrintPageSize(pageSizeForPrint)

  useEffect(() => {
    const stored = getStoredData()
    if (stored) setData(stored)
  }, [])

  /** Keep URL print type aligned with transmittal toggle */
  useEffect(() => {
    const oot = data?.legitimationTransmittalIsOutOfTown === true
    if (oot && (validType === 'transmittal' || lcrBaseType === 'lcr-form-1a')) {
      setSearchParams((sp) => {
        const n = new URLSearchParams(sp)
        n.set('type', 'out-of-town-transmittal')
        return n
      }, { replace: true })
    } else if (!oot && validType === 'out-of-town-transmittal') {
      setSearchParams((sp) => {
        const n = new URLSearchParams(sp)
        n.set('type', 'transmittal')
        return n
      }, { replace: true })
    }
  }, [data?.legitimationTransmittalIsOutOfTown, validType, lcrBaseType, setSearchParams])

  useEffect(() => {
    if (!allowedTypeIds.includes(validType) && allowedTypeIds.length > 0) {
      setSearchParams({ type: allowedTypeIds[0] })
    }
  }, [validType, allowedTypeIds, setSearchParams])

  useEffect(() => () => {
    if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl)
  }, [previewPdfUrl])

  const childFull = [data.childFirst, data.childMiddle, data.childLast].filter(Boolean).join(' ')
  const fatherFull = [data.fatherFirst, data.fatherMiddle, data.fatherLast].filter(Boolean).join(' ')
  const motherFull = [data.motherFirst, data.motherMiddle, data.motherLast].filter(Boolean).join(' ')
  const subjectLine = `SUBJECT: LEGITIMATION IN FAVOR OF ${(childFull || '').toUpperCase()} - PARENTS ${(fatherFull || '').toUpperCase()} AND ${(motherFull || '').toUpperCase()}`

  const persistTransmittalDraft = useCallback((patch) => {
    setData((prev) => {
      const next = { ...prev, ...patch }
      saveLegitimationDraft(next)
      return next
    })
  }, [])

  const persistLcrRemarksFontPt = useCallback((pt) => {
    setData((prev) => {
      const next = { ...prev, lcrRemarksFontSizePt: pt }
      saveLegitimationDraft(next)
      return next
    })
  }, [])

  let content
  if (lcrBaseType === 'lcr-form-1a') {
    content = (
      <>
        {LCR_CERTIFICATION_COPIES.map((copy, idx) => (
          <div
            key={copy.id}
            className={lcrTriplePdfPageClassName(idx)}
          >
            <LcrForm1A
              data={mergeLcrCertificationCopyIntoData(data, copy.id)}
              onDataChange={(patch) => {
                setData((prev) => {
                  const next = { ...prev, ...patch }
                  saveLegitimationDraft(next)
                  return next
                })
              }}
            />
          </div>
        ))}
      </>
    )
  } else switch (effectiveType) {
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
    case 'transmittal':
      content = <Transmittal data={data} subjectLine={subjectLine} onPersistDraft={persistTransmittalDraft} />
      break
    case 'out-of-town-transmittal':
      content = <OutOfTownTransmittal data={data} subjectLine={subjectLine} onPersistDraft={persistTransmittalDraft} />
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
            {paperSizesForPrint.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <button type="button" onClick={handleSavePdf} className="px-3 py-2.5 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
            Save
          </button>
          <button type="button" onClick={handlePreviewPdfModal} className="px-3 py-2.5 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700">
            Preview PDF
          </button>
        </div>
      </div>
      <div className="flex gap-6">
        <aside className="no-print w-56 shrink-0 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">View &amp; Print</h2>
          <div className="flex flex-col gap-2">
            {allowedTypes.map((t) => {
              const isSelected = effectiveType === t.id
              const key = `legitimation:${recordId}:${t.id}`
              const uploaded = !!getUploadedFile(key)
              const sidebarTitle = t.id === 'sole-affidavit'
                ? 'SOLE AFFIDAVIT LEGITIMATION'
                : t.id === 'joint-affidavit'
                  ? 'JOINT AFFIDAVIT LEGITIMATION'
                  : String(t.title || '').replace(/^\s*\d+\.\s*/, '')
              return (
                <div key={t.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setSearchParams({ type: t.id })}
                    className={`text-left px-3 py-2.5 text-sm font-medium transition text-white rounded-lg bg-[#283750] hover:bg-[#1e2d42] w-full pr-[5.75rem] ${isSelected ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                  >
                    {sidebarTitle}
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
          {showAffidavitCcrInSidebar ? (
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
              <label htmlFor="legitimation-print-affidavit-ccr" className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">
                Affidavit — Received by (CCR)
              </label>
              {allowedTypeIds.includes('joint-affidavit') &&
                allowedTypeIds.includes('sole-affidavit') &&
                effectiveType !== 'joint-affidavit' &&
                effectiveType !== 'sole-affidavit' ? (
                <div className="mb-2">
                  <label htmlFor="legitimation-print-affidavit-ccr-target" className="block text-[10px] font-semibold text-gray-600 mb-1">
                    Which affidavit?
                  </label>
                  <select
                    id="legitimation-print-affidavit-ccr-target"
                    className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-800 mb-2"
                    value={affidavitCcrSidebarTarget}
                    onChange={(e) => setAffidavitCcrSidebarTarget(e.target.value === 'sole' ? 'sole' : 'joint')}
                  >
                    <option value="joint">Joint affidavit</option>
                    <option value="sole">Sole affidavit</option>
                  </select>
                </div>
              ) : null}
              <select
                id="legitimation-print-affidavit-ccr"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-2 py-2 text-xs text-gray-800 leading-snug"
                value={legitimationAffidavitCcrSelectValue(data, affidavitCcrVariant)}
                onChange={(e) => {
                  const v = e.target.value
                  if (v === 'custom') return
                  const opt = RECEIVED_BY_OPTIONS[Number(v)]
                  if (!opt) return
                  persistTransmittalDraft(legitimationAffidavitCcrPersistPatch(affidavitCcrVariant, opt))
                }}
              >
                {RECEIVED_BY_OPTIONS.map((opt, i) => (
                  <option key={`${opt.name}-${i}`} value={String(i)}>
                    {opt.name} — {opt.title}
                  </option>
                ))}
                {legitimationAffidavitCcrSelectValue(data, affidavitCcrVariant) === 'custom' ? (
                  <option value="custom">Custom (from draft — pick a row)</option>
                ) : null}
              </select>
              <p className="text-[10px] text-gray-500 mt-1.5 leading-snug">
                Only the Joint or Sole affidavit signature line is updated. LCR, registration, and transmittal still use the shared City Civil Registrar fields from the main form.
              </p>
            </div>
          ) : null}
          {lcrBaseType === 'lcr-form-1a' ? (
            <LcrRemarksFontSizeSelect
              id="legitimation-print-lcr-remarks-font"
              value={data.lcrRemarksFontSizePt}
              onChange={persistLcrRemarksFontPt}
              helpText="Applies to the REMARKS block on LCR Form 1A for this record."
            />
          ) : null}
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
      {previewModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4 no-print" role="dialog" aria-modal="true" aria-label="PDF preview">
          <div className="bg-white rounded-xl w-[95vw] h-[92vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">PDF preview</h3>
              <button
                type="button"
                onClick={closePreviewModal}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Close
              </button>
            </div>
            <iframe title="PDF preview" src={previewPdfUrl} className="w-full flex-1 border-0" />
          </div>
        </div>
      )}
      <ToastHost toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
