import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import LcrForm1ABirthAvailable from '../courtDecree/print/LcrForm1ABirthAvailable'
import LcrForm2ADeathAvailable from '../courtDecree/print/LcrForm2ADeathAvailable'
import LcrForm3AMarriageAvailable from '../courtDecree/print/LcrForm3AMarriageAvailable'
import Mc2010Transmittal from './print/Mc2010Transmittal'
import Mc2010EnclosurePreview from './print/Mc2010EnclosurePreview'
import ToastHost from '../../components/toast/ToastHost'
import { useToasts } from '../../components/toast/useToasts'
import { saveCurrentViewAsPdf, openSavedPdfInBrowser } from '../../lib/savePdf'
import { PAPER_SIZES, getPaperPageSpec } from '../../components/print'
import { getDefaultSupplementalTransmittalFields, pickTransmittalStateFromDraft } from './lib/supplementalTransmittalDefaults'
import { defaultLegitimation } from '../legitimation/lib/legitimationDefaults'
import { defaultCourtDecree } from '../courtDecree/lib/courtDecreeDefaults'
import { getActiveSavedMc2010, getMc2010Draft, saveMc2010Draft, saveOrUpdateMc2010 } from './lib/mc2010SavedStorage'
import { mc2010OutputUploadScope } from './lib/legalInstrumentAttachmentScope'
import { getUploadedFile, restoreUploadedFileFromTrash } from '../../lib/uploadedFileStore'
import UploadFileModal from '../../components/upload/UploadFileModal'
import PrintSidebarNavAttachIcons from '../../components/upload/PrintSidebarNavAttachIcons'

const defaultMc2010Draft = {
  includeForm1a: true,
  lcrType: '1A',
  lcrData: { ...defaultLegitimation },
  lcrSource: 'courtDecree',
  lcrSourceId: '',
  lcrPrefillLabel: '',
  ...getDefaultSupplementalTransmittalFields(),
  transmittalSalutation: "Sir/Ma'am:",
}

const PRINT_SIZE_STYLE_ID = 'print-paper-size-mc2010'

function mc2010UploadedUrl(scopeKey) {
  return `/uploaded/${encodeURIComponent(scopeKey)}`
}

function usePrintPageSize(paperId) {
  useEffect(() => {
    const spec = getPaperPageSpec(paperId)
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

export default function Mc2010Print() {
  const location = useLocation()
  const navigate = useNavigate()
  const baseData = useMemo(() => {
    const active = getActiveSavedMc2010()
    const merged = active?.data ? { ...defaultMc2010Draft, ...active.data } : getMc2010Draft(defaultMc2010Draft)
    return { ...merged, ...pickTransmittalStateFromDraft(merged) }
  }, [location.key])

  const [paperSize, setPaperSize] = useState('a4')
  const [savingPdf, setSavingPdf] = useState(false)
  const [activePanel, setActivePanel] = useState('transmittal')
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewPdfUrl, setPreviewPdfUrl] = useState('')
  const { toasts, show, dismiss } = useToasts()

  const { mc2010TransmittalKey, mc2010LcrKey, mc2010PacketKey } = useMemo(() => {
    const row = getActiveSavedMc2010()
    const id = row?.id ?? null
    return {
      mc2010TransmittalKey: mc2010OutputUploadScope(id, 'transmittal'),
      mc2010LcrKey: mc2010OutputUploadScope(id, 'lcr'),
      mc2010PacketKey: mc2010OutputUploadScope(id, 'packet'),
    }
  }, [location.key])

  const [uploadModal, setUploadModal] = useState({ open: false, key: '', title: '' })
  /** Bumps attachment indicators when uploads change without a router navigation (Undo, modal uploads). */
  const [attachmentsRev, setAttachmentsRev] = useState(0)
  const bumpAttachments = () => setAttachmentsRev((x) => x + 1)

  const hasMc2010TransmittalScan = useMemo(
    () => !!getUploadedFile(mc2010TransmittalKey),
    [mc2010TransmittalKey, location.key, attachmentsRev]
  )
  const hasMc2010LcrScan = useMemo(
    () => !!getUploadedFile(mc2010LcrKey),
    [mc2010LcrKey, location.key, attachmentsRev]
  )
  const hasMc2010PacketScan = useMemo(
    () => !!getUploadedFile(mc2010PacketKey),
    [mc2010PacketKey, location.key, attachmentsRev]
  )

  const openPacketAttachmentPage = () => {
    if (!mc2010PacketKey) return
    navigate(mc2010UploadedUrl(mc2010PacketKey))
  }

  const [lcrData, setLcrData] = useState(() => ({ ...baseData.lcrData }))

  const data = baseData
  const paperSpec = useMemo(() => getPaperPageSpec(paperSize), [paperSize])
  usePrintPageSize(paperSize)

  useEffect(() => {
    const raw = baseData.lcrData
    const fallback = baseData.lcrType === '1A' ? { ...defaultLegitimation } : { ...defaultCourtDecree }
    setLcrData(raw && typeof raw === 'object' ? { ...raw } : { ...fallback })
  }, [baseData])

  const handleLcrDataChange = (next) => {
    setLcrData(next)
    const updated = { ...data, lcrData: next }
    saveMc2010Draft(updated)
    saveOrUpdateMc2010(updated)
  }

  const PDF_EXPORT_CLASS = {
    transmittal: 'supplemental-pdf-export--transmittal-only',
    lcr: 'supplemental-pdf-export--lcr-only',
  }

  const savePdfWithExportMode = async (mode, suggestedBaseName) => {
    if (savingPdf) return
    setSavingPdf(true)
    const root = document.documentElement
    const cls = PDF_EXPORT_CLASS[mode]
    root.classList.add(cls)
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    try {
      const result = await saveCurrentViewAsPdf(suggestedBaseName)
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
    } finally {
      root.classList.remove(cls)
      setSavingPdf(false)
    }
  }

  const handlePreviewPdfModal = async () => {
    try {
      const bridge = window?.electronAPI
      if (!bridge || typeof bridge.previewPdfData !== 'function') return
      const previewMode = activePanel === 'form1a' ? 'lcr' : 'transmittal'
      const previewClass = PDF_EXPORT_CLASS[previewMode]
      const root = document.documentElement
      root.classList.add(previewClass)
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      let result
      try {
        result = await bridge.previewPdfData()
      } finally {
        root.classList.remove(previewClass)
      }
      if (!result?.ok || !result?.base64) return
      const binary = atob(result.base64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl)
      setPreviewPdfUrl(url)
      setPreviewModalOpen(true)
    } catch {}
  }

  const closePreviewModal = () => {
    setPreviewModalOpen(false)
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl)
      setPreviewPdfUrl('')
    }
  }

  useEffect(() => () => {
    if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl)
  }, [previewPdfUrl])

  const showLcr = data.includeForm1a !== false

  return (
    <div className="p-4 print:p-0 mc2010-print-anim-page">
      <div className="no-print mb-3 max-w-6xl mx-auto flex items-center justify-between gap-2">
        <Link
          to="/legal-instrument/mc2010-04/saved"
          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
        >
          Back to Files Saved
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <select
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            title="Paper size"
          >
            {PAPER_SIZES.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          {activePanel === 'form1a' && showLcr ? (
            <button
              type="button"
              onClick={() => savePdfWithExportMode('lcr', `MC2010-LCR-${data.lcrType || '1A'}`)}
              disabled={savingPdf}
              className="px-3 py-1.5 rounded-md bg-[#283750] text-white text-sm font-medium hover:bg-[#1e2d42] disabled:opacity-60"
            >
              {savingPdf ? 'Saving…' : `Save LCR Form ${data.lcrType || '1A'} PDF`}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => savePdfWithExportMode('transmittal', 'MC2010-Transmittal')}
              disabled={savingPdf}
              className="px-3 py-1.5 rounded-md bg-[#1a4d3a] text-white text-sm font-medium hover:bg-[#143d2d] disabled:opacity-60"
            >
              {savingPdf ? 'Saving…' : 'Save transmittal PDF'}
            </button>
          )}
          <button
            type="button"
            onClick={() => handlePreviewPdfModal()}
            disabled={savingPdf}
            className="px-3 py-1.5 rounded-md bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-45 disabled:cursor-not-allowed"
          >
            Preview PDF
          </button>
        </div>
      </div>

      <div id="supplemental-print-page" className="mc2010-print-root flex gap-6 items-start print:block">
        <aside className="no-print w-56 shrink-0 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">View &amp; Print</h2>
          <div className="flex flex-col gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setActivePanel('transmittal')}
                className={`w-full text-left px-3 py-2.5 text-sm font-medium transition text-white rounded-lg bg-[#1a4d3a] pr-[5.75rem] ${
                  activePanel === 'transmittal' ? 'ring-2 ring-offset-1 ring-[var(--primary-blue)]' : ''
                }`}
              >
                MC2010 Transmittal
              </button>
              <PrintSidebarNavAttachIcons
                scopeKey={mc2010TransmittalKey}
                hasUpload={hasMc2010TransmittalScan}
                onOpenUploadModal={() =>
                  setUploadModal({
                    open: true,
                    key: mc2010TransmittalKey,
                    title: 'MC2010-04 — Transmittal scan',
                  })
                }
              />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setActivePanel('form1a')}
                disabled={!showLcr}
                className={`w-full text-left px-3 py-2.5 text-sm font-medium transition text-white rounded-lg bg-[#283750] pr-[5.75rem] ${
                  activePanel === 'form1a' ? 'ring-2 ring-offset-1 ring-[var(--primary-blue)]' : ''
                } ${!showLcr ? 'opacity-45 cursor-not-allowed' : ''}`}
              >
                FORM {data.lcrType}
              </button>
              <PrintSidebarNavAttachIcons
                scopeKey={mc2010LcrKey}
                hasUpload={hasMc2010LcrScan}
                allowManageUpload
                iconsDisabled={!showLcr}
                onOpenUploadModal={() =>
                  setUploadModal({
                    open: true,
                    key: mc2010LcrKey,
                    title: `MC2010-04 — LCR Form ${data.lcrType || '1A'} scan`,
                  })
                }
              />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (!hasMc2010PacketScan) return
                  openPacketAttachmentPage()
                }}
                disabled={!hasMc2010PacketScan}
                title={
                  hasMc2010PacketScan
                    ? 'Open MC2010-04 attachment page'
                    : 'Use the upload icon to attach a scan first — this output enables after a file is saved'
                }
                className={`w-full text-left px-3 py-2.5 text-sm font-medium transition rounded-lg pr-[5.75rem] ${
                  hasMc2010PacketScan
                    ? 'text-white bg-slate-700 hover:bg-slate-800'
                    : 'text-slate-400 bg-slate-200 cursor-not-allowed'
                }`}
              >
                MC2010-04
              </button>
              <PrintSidebarNavAttachIcons
                scopeKey={mc2010PacketKey}
                hasUpload={hasMc2010PacketScan}
                onOpenUploadModal={() => openPacketAttachmentPage()}
              />
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0 print:w-full print:max-w-none">
          <div
            id="supplemental-print-transmittal"
            className={activePanel === 'transmittal' ? 'block' : 'hidden print:block'}
          >
            <Mc2010Transmittal
              data={data}
              paperWidth={`${paperSpec.widthMm}mm`}
              paperHeight={`${paperSpec.heightMm}mm`}
            />
          </div>
          {showLcr ? (
            <div id="supplemental-print-bundle">
              <div
                id="supplemental-print-lcr"
                className={
                  activePanel === 'form1a'
                    ? 'block mt-0'
                    : 'hidden print:block print:mt-0 print:[page-break-before:always]'
                }
              >
                <div className="max-w-[210mm] mx-auto">
                  {data.lcrType === '1A' ? <LcrForm1ABirthAvailable data={lcrData} editableTable onDataChange={handleLcrDataChange} /> : null}
                  {data.lcrType === '2A' ? <LcrForm2ADeathAvailable data={lcrData} editableTable onDataChange={handleLcrDataChange} /> : null}
                  {data.lcrType === '3A' ? <LcrForm3AMarriageAvailable data={lcrData} editableTable onDataChange={handleLcrDataChange} /> : null}
                </div>
              </div>
            </div>
          ) : null}
          {/* Kept off-screen layout for Electron/PDF enclosure-only capture; MC2010-04 viewing is /uploaded/... */}
          <div id="supplemental-print-enclosure" className="hidden print:hidden">
            <div className="mx-auto max-w-[210mm] rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <Mc2010EnclosurePreview entry={getUploadedFile(mc2010PacketKey)} />
            </div>
          </div>
        </div>
      </div>

      <UploadFileModal
        open={uploadModal.open}
        onClose={() => setUploadModal((m) => ({ ...m, open: false }))}
        scopeKey={uploadModal.key}
        title={uploadModal.title}
        offerLibraryAttach
        onChanged={(evt) => {
          bumpAttachments()
          if (evt?.kind === 'uploaded') {
            show({
              type: 'success',
              title: 'File uploaded',
              message: evt.fileName ? `Saved: ${evt.fileName}` : '',
            })
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
                bumpAttachments()
              },
            })
          }
        }}
      />

      {previewModalOpen ? (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4 no-print" role="dialog" aria-modal="true">
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
      ) : null}
      <ToastHost toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
