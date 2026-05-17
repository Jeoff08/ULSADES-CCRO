import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import LcrForm1ABirthAvailable from '../courtDecree/print/LcrForm1ABirthAvailable'
import LcrForm2ADeathAvailable from '../courtDecree/print/LcrForm2ADeathAvailable'
import LcrForm3AMarriageAvailable from '../courtDecree/print/LcrForm3AMarriageAvailable'
import SupplementalLcrFooterSignatoryPickers from './SupplementalLcrFooterSignatoryPickers'
import Mc2010Transmittal from './print/Mc2010Transmittal'
import Mc2010EnclosurePreview from './print/Mc2010EnclosurePreview'
import ToastHost from '../../components/toast/ToastHost'
import { useToasts } from '../../components/toast/useToasts'
import { saveCurrentViewAsPdf, openSavedPdfInBrowser } from '../../lib/savePdf'
import { PAPER_SIZES, getPaperPageSpec } from '../../components/print'
import {
  getDefaultSupplementalTransmittalFields,
  pickTransmittalStateFromDraft,
  clampTransmittalSignatoryIndex,
  RECEIVED_BY_OPTIONS,
} from './lib/supplementalTransmittalDefaults'
import { defaultLegitimation } from '../legitimation/lib/legitimationDefaults'
import { defaultCourtDecree } from '../courtDecree/lib/courtDecreeDefaults'
import { getActiveSavedMc2010, getMc2010Draft, saveMc2010Draft, saveOrUpdateMc2010 } from './lib/mc2010SavedStorage'
import { mc2010OutputUploadScope } from './lib/legalInstrumentAttachmentScope'
import { getUploadedFile, restoreUploadedFileFromTrash } from '../../lib/uploadedFileStore'
import UploadFileModal from '../../components/upload/UploadFileModal'
import PrintSidebarNavAttachIcons from '../../components/upload/PrintSidebarNavAttachIcons'
import LcrRemarksFontSizeSelect from '../../components/lcr/LcrRemarksFontSizeSelect'
import { mergeLcrRemarksFontSizePt, parseLcrRemarksFontPt } from '../../lib/lcrRemarksFontSize'

const defaultMc2010Draft = {
  includeForm1a: true,
  lcrType: '1A',
  lcrRemarksFontSizePt: '12',
  lcrData: { ...defaultLegitimation },
  lcrSource: 'courtDecree',
  lcrSourceId: '',
  lcrPrefillLabel: '',
  ...getDefaultSupplementalTransmittalFields(),
  transmittalSalutation: "Sir/Ma'am:",
}

function trimStr(v) {
  return String(v ?? '').trim()
}

/** True when the user entered any transmittal letter / checklist fields (not only defaults like salutation). */
function mc2010TransmittalHasUserContent(data) {
  if (!data || typeof data !== 'object') return false
  if (trimStr(data.transmittalDate)) return true
  if (trimStr(data.transmittalRecipient)) return true
  if (trimStr(data.transmittalToPosition1) || trimStr(data.transmittalToPosition2)) return true
  if (trimStr(data.transmittalToOffice1) || trimStr(data.transmittalToOffice2)) return true
  if (
    trimStr(data.transmittalThru) ||
    trimStr(data.transmittalThruPosition1) ||
    trimStr(data.transmittalThruPosition2) ||
    trimStr(data.transmittalThruPosition3) ||
    trimStr(data.transmittalThruPosition4)
  ) {
    return true
  }
  if (trimStr(data.transmittalColbName)) return true
  if (trimStr(data.transmittalRegistryNo)) return true
  if (trimStr(data.transmittalDob)) return true
  if (trimStr(data.transmittalFather) || trimStr(data.transmittalMother)) return true
  if (Array.isArray(data.transmittalEndorsementIds) && data.transmittalEndorsementIds.length > 0) return true
  if (Array.isArray(data.transmittalAttachmentIds) && data.transmittalAttachmentIds.length > 0) return true
  if (trimStr(data.transmittalDocType)) return true
  return false
}

/** True when LCR is included and merged LCR data has meaningful entries for the selected form type. */
function mc2010LcrHasUserContent(data) {
  if (!data || data.includeForm1a === false) return false
  const lcrType = data.lcrType || '1A'
  const slice = data.lcrData && typeof data.lcrData === 'object' ? data.lcrData : {}
  const base = lcrType === '1A' ? defaultLegitimation : defaultCourtDecree
  const merged = { ...base, ...slice }
  if (lcrType === '1A') {
    return (
      trimStr(merged.lcr1aNameOfChild) ||
      trimStr(merged.lcr1aRegistryNumber) ||
      trimStr(merged.colbRegistryNo) ||
      trimStr(merged.childFirst)
    )
  }
  if (lcrType === '2A') {
    return (
      trimStr(merged.lcr2aNameDeceased) ||
      trimStr(merged.lcr2aRegistryNumber) ||
      trimStr(merged.lcr2aDateDeath)
    )
  }
  if (lcrType === '3A') {
    return (
      trimStr(merged.lcr3aHusbandName) ||
      trimStr(merged.lcr3aWifeName) ||
      trimStr(merged.marriageRegistryNo) ||
      trimStr(merged.lcr3aRegistryNumber)
    )
  }
  return false
}

const PRINT_SIZE_STYLE_ID = 'print-paper-size-mc2010'

const LCR_SOURCE_LABEL = {
  manual: 'Manual entry',
  ausf: 'AUSF',
  courtDecree: 'Court Decree',
  legitimation: 'Legitimation',
}

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
  const [lcrRemarksFontSizePt, setLcrRemarksFontSizePt] = useState(() =>
    parseLcrRemarksFontPt(baseData.lcrRemarksFontSizePt),
  )

  useEffect(() => {
    setLcrRemarksFontSizePt(parseLcrRemarksFontPt(baseData.lcrRemarksFontSizePt))
  }, [location.key, baseData.lcrRemarksFontSizePt])

  const data = useMemo(
    () => ({ ...baseData, lcrRemarksFontSizePt }),
    [baseData, lcrRemarksFontSizePt],
  )

  const dataRef = useRef(data)
  const lcrDataRef = useRef(lcrData)
  dataRef.current = data
  lcrDataRef.current = lcrData

  const [transmittalSignatoryIdx, setTransmittalSignatoryIdx] = useState(() =>
    clampTransmittalSignatoryIndex(baseData.transmittalSignatoryOptionIndex)
  )

  const transmittalViewData = useMemo(
    () => ({ ...data, transmittalSignatoryOptionIndex: transmittalSignatoryIdx }),
    [data, transmittalSignatoryIdx]
  )

  const handleTransmittalSignatoryChange = (rawIdx) => {
    const clamped = clampTransmittalSignatoryIndex(rawIdx)
    setTransmittalSignatoryIdx(clamped)
    const updated = { ...dataRef.current, transmittalSignatoryOptionIndex: clamped }
    saveMc2010Draft(updated)
    saveOrUpdateMc2010(updated)
  }

  const lcrPrintData = useMemo(
    () => mergeLcrRemarksFontSizePt(lcrData, data),
    [lcrData, data.lcrRemarksFontSizePt],
  )

  const handleLcrRemarksFontChange = (pt) => {
    const parsed = parseLcrRemarksFontPt(pt)
    setLcrRemarksFontSizePt(parsed)
    const updated = { ...dataRef.current, lcrRemarksFontSizePt: parsed }
    dataRef.current = updated
    saveMc2010Draft(updated)
    saveOrUpdateMc2010(updated)
  }
  const paperSpec = useMemo(() => getPaperPageSpec(paperSize), [paperSize])
  usePrintPageSize(paperSize)

  const transmittalHasData = useMemo(() => mc2010TransmittalHasUserContent(baseData), [baseData])

  const { printTransmittal, printLcr } = useMemo(() => {
    const transmittalFilled = mc2010TransmittalHasUserContent(baseData)
    const lcrFilled = mc2010LcrHasUserContent({ ...baseData, lcrData })
    const bothEmpty = !transmittalFilled && !lcrFilled
    const includeLcr = baseData.includeForm1a !== false
    return {
      printTransmittal: transmittalFilled || bothEmpty,
      printLcr: includeLcr && (lcrFilled || bothEmpty),
    }
  }, [baseData, lcrData])

  useEffect(() => {
    const raw = baseData.lcrData
    const fallback = baseData.lcrType === '1A' ? { ...defaultLegitimation } : { ...defaultCourtDecree }
    const next = raw && typeof raw === 'object' ? { ...raw } : { ...fallback }
    setLcrData(next)
    const t = mc2010TransmittalHasUserContent(baseData)
    if (t) setActivePanel('transmittal')
    else if (baseData.includeForm1a !== false) setActivePanel('form1a')
    else setActivePanel('transmittal')
  }, [baseData])

  useEffect(() => {
    setTransmittalSignatoryIdx(clampTransmittalSignatoryIndex(baseData.transmittalSignatoryOptionIndex))
  }, [baseData])

  useEffect(() => {
    if (!transmittalHasData && activePanel === 'transmittal' && baseData.includeForm1a !== false) {
      setActivePanel('form1a')
    }
  }, [transmittalHasData, activePanel, baseData.includeForm1a])

  const handleLcrDataChange = (next) => {
    setLcrData(next)
    lcrDataRef.current = next
    const updated = { ...dataRef.current, lcrData: next, transmittalSignatoryOptionIndex: transmittalSignatoryIdx }
    saveMc2010Draft(updated)
    saveOrUpdateMc2010(updated)
  }

  /** Merge partial LCR edits (e.g. footer pickers) into latest `lcrData` so saves never use a stale closure. */
  const patchLcrFooter = (partial) => {
    if (!partial || typeof partial !== 'object') return
    setLcrData((prev) => {
      const base = prev && typeof prev === 'object' ? prev : {}
      const next = { ...base, ...partial }
      lcrDataRef.current = next
      const updated = {
        ...dataRef.current,
        lcrData: next,
        transmittalSignatoryOptionIndex: transmittalSignatoryIdx,
      }
      saveMc2010Draft(updated)
      saveOrUpdateMc2010(updated)
      return next
    })
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
      const t = mc2010TransmittalHasUserContent(baseData)
      const l = mc2010LcrHasUserContent({ ...baseData, lcrData })
      const bothEmpty = !t && !l
      const pt = t || bothEmpty
      const pl = baseData.includeForm1a !== false && (l || bothEmpty)
      const previewMode =
        pt && pl ? (activePanel === 'form1a' ? 'lcr' : 'transmittal') : pl ? 'lcr' : 'transmittal'
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
    } catch { }
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
          {printTransmittal ? (
            <button
              type="button"
              onClick={() => savePdfWithExportMode('transmittal', 'MC2010-Transmittal')}
              disabled={savingPdf}
              className="px-3 py-1.5 rounded-md bg-[#1a4d3a] text-white text-sm font-medium hover:bg-[#143d2d] disabled:opacity-60"
            >
              {savingPdf ? 'Saving…' : 'Save transmittal PDF'}
            </button>
          ) : null}
          {printLcr && showLcr ? (
            <button
              type="button"
              onClick={() => savePdfWithExportMode('lcr', `MC2010-LCR-${data.lcrType || '1A'}`)}
              disabled={savingPdf}
              className="px-3 py-1.5 rounded-md bg-[#283750] text-white text-sm font-medium hover:bg-[#1e2d42] disabled:opacity-60"
            >
              {savingPdf ? 'Saving…' : `Save LCR Form ${data.lcrType || '1A'} PDF`}
            </button>
          ) : null}
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
                disabled={!transmittalHasData}
                title={
                  transmittalHasData
                    ? undefined
                    : 'Fill out the transmittal on the MC2010 form first — this view is disabled until transmittal fields have data.'
                }
                onClick={() => {
                  if (!transmittalHasData) return
                  setActivePanel('transmittal')
                }}
                className={`w-full text-left px-3 py-2.5 text-sm font-medium transition rounded-lg pr-[5.75rem] ${
                  transmittalHasData
                    ? `text-white bg-[#1a4d3a] ${activePanel === 'transmittal' ? 'ring-2 ring-offset-1 ring-[var(--primary-blue)]' : ''}`
                    : 'text-white/80 bg-[#1a4d3a]/45 cursor-not-allowed'
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
                className={`w-full text-left px-3 py-2.5 text-sm font-medium transition text-white rounded-lg bg-[#283750] pr-[5.75rem] ${activePanel === 'form1a' ? 'ring-2 ring-offset-1 ring-[var(--primary-blue)]' : ''
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
                className={`w-full text-left px-3 py-2.5 text-sm font-medium transition rounded-lg pr-[5.75rem] ${hasMc2010PacketScan
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
            {activePanel === 'transmittal' ? (
              <div className="no-print rounded-lg border border-slate-200 bg-slate-50/95 p-2.5 space-y-1.5 ring-1 ring-slate-100">
                <label htmlFor="mc2010-print-prepared-signed" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                  Prepared / signed by
                </label>
                <select
                  id="mc2010-print-prepared-signed"
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs text-gray-900 bg-white"
                  value={transmittalSignatoryIdx}
                  onChange={(e) => handleTransmittalSignatoryChange(Number(e.target.value))}
                  title="Signatory shown after “Respectfully yours,” on the MC2010 transmittal"
                >
                  {RECEIVED_BY_OPTIONS.map((row, i) => (
                    <option key={row.name} value={i}>
                      {row.name} — {row.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {activePanel === 'form1a' && showLcr ? (
              <LcrRemarksFontSizeSelect
                id="mc2010-print-lcr-remarks-font"
                value={data.lcrRemarksFontSizePt}
                onChange={handleLcrRemarksFontChange}
                helpText="Applies to the REMARKS block on this LCR form in preview and print/PDF."
              />
            ) : null}
          </div>
        </aside>

        <div className="flex-1 min-w-0 print:w-full print:max-w-none">
          <div
            id="supplemental-print-transmittal"
            className={`${activePanel === 'transmittal' ? 'block' : 'hidden'} ${printTransmittal ? 'print:block' : 'print:hidden'
              }`}
          >
            <Mc2010Transmittal
              data={transmittalViewData}
              paperWidth={`${paperSpec.widthMm}mm`}
              paperHeight={`${paperSpec.heightMm}mm`}
            />
          </div>
          {showLcr ? (
            <div id="supplemental-print-bundle">
              <div
                id="supplemental-print-lcr"
                className={`${activePanel === 'form1a' ? 'block mt-0' : 'hidden'} ${printLcr
                    ? `print:block print:mt-0 ${printTransmittal ? 'print:[page-break-before:always]' : 'print:[page-break-before:auto]'
                    }`
                    : 'print:hidden'
                  }`}
              >
                <div className="no-print mb-3 max-w-[210mm] mx-auto rounded-lg border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-[11px] text-emerald-900 leading-snug">
                  <span className="font-semibold">LCR Form {data.lcrType}</span>
                  {' — same court print layout for all sources. '}
                  {data.lcrPrefillLabel ? (
                    <>
                      Prefilled from <span className="font-semibold">{LCR_SOURCE_LABEL[data.lcrSource] || data.lcrSource}</span>
                      {': '}
                      <span className="italic">{data.lcrPrefillLabel}</span>
                      {'. '}
                    </>
                  ) : data.lcrSource === 'manual' ? (
                    <>Manual entry on the MC2010 form — edit the table below. </>
                  ) : (
                    <>No record selected on the MC2010 form — fill the table below or return to the form to prefill. </>
                  )}
                  Table cells are editable below; bottom signatures use the block under this note; changes are saved with this MC2010 file.
                </div>
                <SupplementalLcrFooterSignatoryPickers
                  lcrData={lcrData}
                  inputClass="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white"
                  onPatch={patchLcrFooter}
                />
                <div className="max-w-[210mm] mx-auto">
                  {data.lcrType === '1A' ? <LcrForm1ABirthAvailable data={lcrPrintData} editableTable onDataChange={handleLcrDataChange} /> : null}
                  {data.lcrType === '2A' ? <LcrForm2ADeathAvailable data={lcrPrintData} editableTable onDataChange={handleLcrDataChange} /> : null}
                  {data.lcrType === '3A' ? <LcrForm3AMarriageAvailable data={lcrPrintData} editableTable onDataChange={handleLcrDataChange} /> : null}
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
