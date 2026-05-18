import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SupplementalReportAffidavit from '../legitimation/print/SupplementalReportAffidavit'
import LcrForm1ABirthAvailable from '../courtDecree/print/LcrForm1ABirthAvailable'
import LcrForm2ADeathAvailable from '../courtDecree/print/LcrForm2ADeathAvailable'
import LcrForm3AMarriageAvailable from '../courtDecree/print/LcrForm3AMarriageAvailable'
import SupplementalTransmittal from './print/SupplementalTransmittal'
import SupplementalLcrFooterSignatoryPickers from './SupplementalLcrFooterSignatoryPickers'
import ToastHost from '../../components/toast/ToastHost'
import { useToasts } from '../../components/toast/useToasts'
import { saveCurrentViewAsPdf, openSavedPdfInBrowser } from '../../lib/savePdf'
import { PAPER_SIZES, getPaperPageSpec } from '../../components/print'
import { getActiveSavedSupplemental, getSupplementalDraft, saveSupplementalDraft, saveOrUpdateSupplemental } from './lib/supplementalSavedStorage'
import { supplementalOutputUploadScope } from './lib/legalInstrumentAttachmentScope'
import { getUploadedFile, restoreUploadedFileFromTrash } from '../../lib/uploadedFileStore'
import UploadFileModal from '../../components/upload/UploadFileModal'
import PrintSidebarNavAttachIcons from '../../components/upload/PrintSidebarNavAttachIcons'
import {
  getDefaultSupplementalTransmittalFields,
  pickTransmittalStateFromDraft,
  clampTransmittalSignatoryIndex,
  RECEIVED_BY_OPTIONS,
} from './lib/supplementalTransmittalDefaults'
import { defaultLegitimation } from '../legitimation/lib/legitimationDefaults'
import { defaultCourtDecree } from '../courtDecree/lib/courtDecreeDefaults'
import LcrRemarksFontSizeSelect from '../../components/lcr/LcrRemarksFontSizeSelect'
import { mergeLcrRemarksFontSizePt, parseLcrRemarksFontPt } from '../../lib/lcrRemarksFontSize'

/**
 * Transmittal sign-off roster (dropdown after “Respectfully yours,”): `RECEIVED_BY_OPTIONS` in
 * `./lib/supplementalTransmittalDefaults.js` — ATTY. YUSSIF DON JUSTIN F. MARTIL; LORELIE L. CANTO;
 * PHOEBE L. BENIGA; JAN FLAURENCE A. OBLENDA.
 */
const defaultSupplementalDraft = {
  supplementType: 'geographical',
  colbSubject: 'self',
  subjectColbName: '',
  regNo: '',
  possessive: 'my',
  civilStatus: 'single',
  cityLine: '',
  affiantName: '',
  residenceAddress: '',
  registeredAt: '',
  regMonth: '',
  regDay: '',
  regYear: '',
  registeredOn: '',
  missingGeo: '',
  correctedGeo: '',
  item3Custom: '',
  item5Custom: '',
  includeForm1a: false,
  lcrType: '1A',
  lcrRemarksFontSizePt: '12',
  lcrData: { ...defaultLegitimation },
  lcrSource: 'manual',
  lcrSourceId: '',
  lcrPrefillLabel: '',
  ...getDefaultSupplementalTransmittalFields(),
}

const PRINT_SIZE_STYLE_ID = 'print-paper-size-supplemental'

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

const sidebarBtnBase =
  'w-full text-left px-3 py-2.5 text-sm font-medium transition text-white rounded-lg'
const sidebarBtnAffidavit = `${sidebarBtnBase} bg-[var(--primary-blue)]/80 hover:bg-[var(--primary-blue)]`
const sidebarBtnForm1a = `${sidebarBtnBase} bg-[#283750] hover:bg-[#1e2d42]`
const sidebarBtnTransmittal = `${sidebarBtnBase} bg-[#1a4d3a] hover:bg-[#143d2d]`
const sidebarBtnSelected = ' ring-2 ring-offset-1 ring-[var(--primary-blue)]'

const LCR_SOURCE_LABEL = {
  manual: 'Manual entry',
  ausf: 'AUSF',
  courtDecree: 'Court Decree',
  legitimation: 'Legitimation',
}

export default function SupplementalPrint() {
  const location = useLocation()
  const baseData = useMemo(() => {
    const active = getActiveSavedSupplemental()
    const merged = active?.data
      ? { ...defaultSupplementalDraft, ...active.data }
      : getSupplementalDraft(defaultSupplementalDraft)
    const transmittalSlice = pickTransmittalStateFromDraft(merged)
    return { ...merged, ...transmittalSlice }
  }, [location.key])
  const [item3Custom, setItem3Custom] = useState(baseData.item3Custom || '')
  const [item5Custom, setItem5Custom] = useState(baseData.item5Custom || '')
  const [paperSize, setPaperSize] = useState('long')
  const [savingPdf, setSavingPdf] = useState(false)
  const [exportMode, setExportMode] = useState(null)
  const [activePanel, setActivePanel] = useState('affidavit')
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewPdfUrl, setPreviewPdfUrl] = useState('')
  const { toasts, show, dismiss } = useToasts()
  const [uploadTick, setUploadTick] = useState(0)
  const [uploadModal, setUploadModal] = useState({ open: false, key: '', title: '' })
  const [transmittalSignatoryIdxOverride, setTransmittalSignatoryIdxOverride] = useState(null)
  const [lcrRemarksFontSizePt, setLcrRemarksFontSizePt] = useState(() =>
    parseLcrRemarksFontPt(baseData.lcrRemarksFontSizePt),
  )

  useEffect(() => {
    setTransmittalSignatoryIdxOverride(null)
    setLcrRemarksFontSizePt(parseLcrRemarksFontPt(baseData.lcrRemarksFontSizePt))
  }, [location.key, baseData.lcrRemarksFontSizePt])

  const { supplementalAffidavitKey, supplementalTransmittalKey, supplementalLcrKey } = useMemo(() => {
    const row = getActiveSavedSupplemental()
    const id = row?.id ?? null
    return {
      supplementalAffidavitKey: supplementalOutputUploadScope(id, 'affidavit'),
      supplementalTransmittalKey: supplementalOutputUploadScope(id, 'transmittal'),
      supplementalLcrKey: supplementalOutputUploadScope(id, 'lcr'),
    }
  }, [location.key])

  const hasAffidavitScan = useMemo(
    () => !!getUploadedFile(supplementalAffidavitKey),
    [supplementalAffidavitKey, uploadTick]
  )
  const hasTransmittalScan = useMemo(
    () => !!getUploadedFile(supplementalTransmittalKey),
    [supplementalTransmittalKey, uploadTick]
  )
  const hasLcrScan = useMemo(
    () => !!getUploadedFile(supplementalLcrKey),
    [supplementalLcrKey, uploadTick]
  )

  const data = useMemo(() => {
    const rawIdx =
      transmittalSignatoryIdxOverride !== null && transmittalSignatoryIdxOverride !== undefined
        ? transmittalSignatoryIdxOverride
        : baseData.transmittalSignatoryOptionIndex
    return {
      ...baseData,
      item3Custom,
      item5Custom,
      lcrRemarksFontSizePt,
      transmittalSignatoryOptionIndex: clampTransmittalSignatoryIndex(rawIdx),
    }
  }, [baseData, item3Custom, item5Custom, transmittalSignatoryIdxOverride, lcrRemarksFontSizePt])

  const hasAffidavitData = useMemo(() => {
    const values = [
      data.affiantName,
      data.residenceAddress,
      data.registeredAt,
      data.regMonth,
      data.regDay,
      data.regYear,
      data.registeredOn,
      data.missingGeo,
      data.correctedGeo,
      data.item3Custom,
      data.item5Custom,
      data.subjectColbName,
      data.cityLine,
      data.regNo,
    ]
    return values.some((v) => String(v || '').trim() !== '')
  }, [data])
  const showAffidavitOutput = hasAffidavitData
  const hasTransmittalData = useMemo(() => {
    // Treat transmittal as "present" only when user selected checklist/doc items
    // specific to the transmittal output section.
    const hasDocType = String(data.transmittalDocType || '').trim() !== ''
    const hasEndorsements = Array.isArray(data.transmittalEndorsementIds) && data.transmittalEndorsementIds.length > 0
    const hasAttachments = Array.isArray(data.transmittalAttachmentIds) && data.transmittalAttachmentIds.length > 0
    return hasDocType || hasEndorsements || hasAttachments
  }, [data])
  const supType = String(data.supplementType || '').trim().toLowerCase()
  /** Child's middle name: Iligan header affidavit — long bond only (see paper-size effect). */
  const isMiddleNameAffidavit =
    supType === 'middlename' ||
    supType === 'middle_name' ||
    supType === 'middle name' ||
    supType === 'middle-name'
  /** Child sex: same compact print path as middle name (`data-supplement-mn`). */
  const isSexSupplementAffidavit = supType === 'sex'
  /** Geographical: same compact print path as child sex. */
  const isGeographicalSupplementAffidavit = supType === 'geographical'
  /** Geographical + Child's Sex: affidavit only in print/PDF (no transmittal or LCR). */
  const isAffidavitOnlySupplementOutput =
    isSexSupplementAffidavit || isGeographicalSupplementAffidavit
  const showTransmittalOutput = hasTransmittalData && !isAffidavitOnlySupplementOutput
  /** Shared compact COLB supplemental PDF styling (`data-supplement-mn` rules). */
  const isColbCompactPrintAffidavit =
    isMiddleNameAffidavit || isSexSupplementAffidavit || isGeographicalSupplementAffidavit
  /** Opt-in on form; never bundled for geographical or Child's Sex. */
  const showForm1a = !isAffidavitOnlySupplementOutput && data.includeForm1a === true

  const [lcrData, setLcrData] = useState(() => ({ ...baseData.lcrData }))

  useEffect(() => {
    setItem3Custom(baseData.item3Custom || '')
    setItem5Custom(baseData.item5Custom || '')
    const raw = baseData.lcrData
    const fallback = baseData.lcrType === '1A' ? { ...defaultLegitimation } : { ...defaultCourtDecree }
    setLcrData(raw && typeof raw === 'object' ? { ...raw } : { ...fallback })
  }, [location.key, baseData])

  const dataRef = useRef(data)
  const lcrDataRef = useRef(lcrData)
  dataRef.current = data
  lcrDataRef.current = lcrData

  const lcrPrintData = useMemo(
    () => mergeLcrRemarksFontSizePt(lcrData, data),
    [lcrData, data.lcrRemarksFontSizePt],
  )

  const handleLcrRemarksFontChange = (pt) => {
    const parsed = parseLcrRemarksFontPt(pt)
    setLcrRemarksFontSizePt(parsed)
    const updated = { ...dataRef.current, lcrRemarksFontSizePt: parsed }
    dataRef.current = updated
    saveSupplementalDraft(updated)
    saveOrUpdateSupplemental(updated)
  }

  const handleLcrDataChange = (next) => {
    setLcrData(next)
    lcrDataRef.current = next
    const updated = { ...dataRef.current, lcrData: next }
    saveSupplementalDraft(updated)
    saveOrUpdateSupplemental(updated)
  }

  /** Merge partial LCR edits into latest `lcrData` so footer typing always persists (no stale closure). */
  const patchLcrData = (partial) => {
    if (!partial || typeof partial !== 'object') return
    setLcrData((prev) => {
      const base = prev && typeof prev === 'object' ? prev : {}
      const next = { ...base, ...partial }
      lcrDataRef.current = next
      const updated = { ...dataRef.current, lcrData: next }
      saveSupplementalDraft(updated)
      saveOrUpdateSupplemental(updated)
      return next
    })
  }

  const handleTransmittalSignatoryIndexChange = (idx) => {
    const clamped = clampTransmittalSignatoryIndex(idx)
    setTransmittalSignatoryIdxOverride(clamped)
    const updated = {
      ...dataRef.current,
      lcrData: lcrDataRef.current,
      transmittalSignatoryOptionIndex: clamped,
    }
    saveSupplementalDraft(updated)
    saveOrUpdateSupplemental(updated)
  }
  /** Supplemental affidavit: long bond only (8.5" × 13"). */
  const affidavitPaperSpec = useMemo(() => getPaperPageSpec('long'), [])
  const selectablePaperSizes = useMemo(() => {
    if (showAffidavitOutput && activePanel === 'affidavit') {
      return PAPER_SIZES.filter((p) => p.id === 'long')
    }
    return PAPER_SIZES
  }, [showAffidavitOutput, activePanel])
  const printPageSize =
    showAffidavitOutput && activePanel === 'affidavit' ? 'long' : paperSize
  /** Same @page sizing as Court Decree / Legitimation / AUSF — honor paper picker for Save PDF + Preview (Electron uses preferCSSPageSize). */
  const paperSpec = useMemo(() => getPaperPageSpec(printPageSize), [printPageSize])
  usePrintPageSize(printPageSize)

  /** Long bond compact COLB layout (middle name / sex / geographical). */
  const colbCompactAffidavitWidthMm = useMemo(() => {
    const insetMm = 25.4
    const narrow = Math.max(158, affidavitPaperSpec.widthMm - insetMm)
    if (isMiddleNameAffidavit || isColbCompactPrintAffidavit) return narrow
    return null
  }, [isMiddleNameAffidavit, isColbCompactPrintAffidavit, affidavitPaperSpec.widthMm])

  useEffect(() => {
    if (showAffidavitOutput && activePanel === 'affidavit') {
      setPaperSize('long')
    }
  }, [showAffidavitOutput, activePanel, location.key])

  useEffect(() => {
    if (!showAffidavitOutput) {
      if (showTransmittalOutput && (activePanel === 'affidavit' || activePanel === 'form1a')) {
        setActivePanel('transmittal')
      }
      return
    }
    if (!showTransmittalOutput && activePanel === 'transmittal') {
      setActivePanel(showForm1a ? 'form1a' : 'affidavit')
      return
    }
    if (!showForm1a && activePanel === 'form1a') setActivePanel('affidavit')
  }, [showAffidavitOutput, showForm1a, showTransmittalOutput, activePanel])

  const PDF_EXPORT_CLASS = {
    bundle: 'supplemental-pdf-export--bundle-only',
    transmittal: 'supplemental-pdf-export--transmittal-only',
    lcr: 'supplemental-pdf-export--lcr-only',
  }

  /** Affidavit bundle and/or LCR block — hide transmittal unless exporting transmittal only */
  const showBundleForRender =
    (showAffidavitOutput || showForm1a) && exportMode !== 'transmittal'
  const showTransmittalForRender = showTransmittalOutput && exportMode !== 'bundle' && exportMode !== 'lcr'

  const savePdfWithExportMode = async (mode, suggestedBaseName) => {
    if (mode === 'bundle' && !showAffidavitOutput) {
      window.alert('No supplemental affidavit data yet. Fill the Supplemental form first, or use Save transmittal PDF.')
      return
    }
    if (mode === 'lcr' && !showForm1a) {
      window.alert('No LCR form in this supplemental. Add Form 1A, 2A, or 3A on the Supplemental form first.')
      return
    }
    if (mode === 'transmittal' && !showTransmittalOutput) {
      window.alert('No supplemental transmittal data yet. Fill transmittal fields first, or use Save affidavit PDF.')
      return
    }
    if (savingPdf) return
    setSavingPdf(true)
    setExportMode(mode)
    const root = document.documentElement
    const cls = PDF_EXPORT_CLASS[mode]
    root.classList.add(cls)
    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    })
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
    } catch (error) {
      console.error('Failed to save PDF:', error)
      show({
        type: 'error',
        title: 'Save failed',
        message: error?.message || 'Unable to save PDF right now. Please try again.',
      })
    } finally {
      root.classList.remove(cls)
      setExportMode(null)
      setSavingPdf(false)
    }
  }

  const getExportModeForActivePanel = () => {
    if (activePanel === 'transmittal' && showTransmittalOutput) return 'transmittal'
    if (activePanel === 'form1a' && showForm1a) return 'lcr'
    return 'bundle'
  }

  const handlePreviewPdfModal = async () => {
    try {
      const bridge = window?.electronAPI
      if (!bridge || typeof bridge.previewPdfData !== 'function') {
        window.alert('PDF preview bridge is unavailable. Restart Electron.')
        return
      }
      const previewMode = getExportModeForActivePanel()
      const previewClass = PDF_EXPORT_CLASS[previewMode]
      const root = document.documentElement
      root.classList.add(previewClass)
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      })
      let result
      try {
        result = await bridge.previewPdfData()
      } catch (invokeErr) {
        const msg = String(invokeErr?.message || '')
        if (msg.includes("No handler registered for 'pdf:get-current-window-base64'") && typeof bridge.previewPdf === 'function') {
          const fallback = await bridge.previewPdf(`Supplemental-preview`)
          if (fallback?.ok) {
            window.alert('Preview opened externally (fallback). Restart Electron for in-app modal preview.')
            return
          }
        }
        throw invokeErr
      } finally {
        root.classList.remove(previewClass)
      }
      if (!result?.ok || !result?.base64) {
        window.alert(result?.reason || 'Unable to generate PDF preview.')
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
    } catch (error) {
      window.alert(error?.message || 'Unable to generate PDF preview.')
    }
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

  return (
    <div className="p-4 print:p-0 supplemental-print-anim-page">
      <style>
        {`
/* Supplemental bundle + transmittal: 16px on screen, 12pt in print/PDF (short, A4, long) */
#supplemental-print-page #supplemental-print-bundle,
#supplemental-print-page #supplemental-print-bundle * {
  font-size: 16px;
}
@media print {
  #supplemental-print-page #supplemental-print-bundle,
  #supplemental-print-page #supplemental-print-bundle * {
    font-size: 12pt !important;
  }
  #supplemental-print-page #supplemental-print-affidavit .supplemental-report-doc,
  #supplemental-print-page #supplemental-print-affidavit .supplemental-report-doc * {
    font-size: 12pt !important;
  }
}
body.pdf-capture #supplemental-print-page #supplemental-print-bundle,
body.pdf-capture #supplemental-print-page #supplemental-print-bundle * {
  font-size: 12pt !important;
}
body.pdf-capture #supplemental-print-page #supplemental-print-affidavit .supplemental-report-doc,
body.pdf-capture #supplemental-print-page #supplemental-print-affidavit .supplemental-report-doc * {
  font-size: 12pt !important;
}
/* Child's middle name (long) / child sex / geographical: compact bond + shared print tweaks */
#supplemental-print-affidavit[data-supplement-mn="1"] .supplemental-report-doc {
  padding-left: 0.3in !important;
  padding-right: 0.3in !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  line-height: 1.5 !important;
  box-sizing: border-box !important;
}
@media print {
  #supplemental-print-affidavit .supplemental-report-doc.print-doc {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-left: 0.3in !important;
    padding-right: 0.3in !important;
    height: 13in !important;
    min-height: 13in !important;
    max-height: 13in !important;
    display: flex !important;
    flex-direction: column !important;
    box-sizing: border-box !important;
  }
  #supplemental-print-affidavit .supplemental-report-doc.print-doc .supplemental-report-top-header {
    margin-top: 0.3in !important;
    flex-shrink: 0 !important;
  }
  #supplemental-print-affidavit .supplemental-affidavit-body {
    flex: 1 1 0% !important;
    display: flex !important;
    flex-direction: column !important;
    min-height: 0 !important;
    overflow: visible !important;
  }
  #supplemental-print-affidavit .supplemental-report-doc.print-doc > .supplemental-affidavit-registrar-signatory {
    display: flex !important;
    visibility: visible !important;
    flex-shrink: 0 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  #supplemental-print-affidavit .supplemental-affidavit-registrar-signatory .supplemental-affidavit-ccr-name,
  #supplemental-print-affidavit .supplemental-affidavit-registrar-signatory .supplemental-affidavit-ccr-title {
    font-size: 12pt !important;
  }
  #supplemental-print-affidavit .supplemental-report-doc.print-doc > .supplemental-bottom-wrap {
    margin-top: auto !important;
    flex-shrink: 0 !important;
    margin-bottom: 1em !important;
  }
  #supplemental-print-affidavit .supplemental-bottom-wrap .print-doc-footer {
    margin-top: 0 !important;
  }
}
body.pdf-capture #supplemental-print-affidavit .supplemental-report-doc.print-doc {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  padding-left: 0.3in !important;
  padding-right: 0.3in !important;
  height: 13in !important;
  min-height: 13in !important;
  max-height: 13in !important;
  display: flex !important;
  flex-direction: column !important;
  box-sizing: border-box !important;
}
body.pdf-capture #supplemental-print-affidavit .supplemental-report-doc.print-doc .supplemental-report-top-header {
  margin-top: 0.3in !important;
  flex-shrink: 0 !important;
}
body.pdf-capture #supplemental-print-affidavit .supplemental-affidavit-body {
  flex: 1 1 0% !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
  overflow: visible !important;
}
body.pdf-capture #supplemental-print-affidavit .supplemental-report-doc.print-doc > .supplemental-affidavit-registrar-signatory {
  display: flex !important;
  visibility: visible !important;
  flex-shrink: 0 !important;
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}
body.pdf-capture #supplemental-print-affidavit .supplemental-affidavit-registrar-signatory .supplemental-affidavit-ccr-name,
body.pdf-capture #supplemental-print-affidavit .supplemental-affidavit-registrar-signatory .supplemental-affidavit-ccr-title {
  font-size: 12pt !important;
}
body.pdf-capture #supplemental-print-affidavit .supplemental-report-doc.print-doc > .supplemental-bottom-wrap {
  margin-top: auto !important;
  flex-shrink: 0 !important;
  margin-bottom: 1em !important;
}
body.pdf-capture #supplemental-print-affidavit .supplemental-bottom-wrap .print-doc-footer {
  margin-top: 0 !important;
}
#supplemental-print-affidavit[data-supplement-mn="1"] .supplemental-report-doc .mb-4 {
  margin-bottom: 0.3rem !important;
}
#supplemental-print-affidavit[data-supplement-mn="1"] .supplemental-report-doc .grid {
  gap: 0.3rem !important;
}
#supplemental-print-affidavit .supplemental-report-top-header .grid img {
  width: 100px !important;
  height: 100px !important;
  max-width: 100px !important;
  max-height: 100px !important;
}
@media print {
  html[data-paper-size="short"] #supplemental-print-affidavit[data-supplement-mn="1"] .supplemental-report-doc,
  html[data-paper-size="long"] #supplemental-print-affidavit[data-supplement-mn="1"] .supplemental-report-doc {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  #supplemental-print-affidavit .supplemental-report-doc .supplemental-bottom-wrap .print-doc-footer,
  #supplemental-print-affidavit .supplemental-report-doc .supplemental-bottom-wrap .print-doc-footer p {
    line-height: 1 !important;
  }
}
/* Geographical + Child's Sex: 1.5 line spacing; 0.3in top (header), 0.3in left/right (print) */
@media print {
  #supplemental-print-affidavit[data-supplement-geo-sex="1"] .supplemental-report-doc.print-doc {
    padding-top: 0 !important;
    padding-left: 0.3in !important;
    padding-right: 0.3in !important;
    box-sizing: border-box !important;
    line-height: 1.5 !important;
  }
  #supplemental-print-affidavit[data-supplement-geo-sex="1"] .supplemental-report-doc.print-doc .supplemental-report-top-header {
    margin-top: 0.3in !important;
  }
  #supplemental-print-affidavit[data-supplement-geo-sex="1"] .supplemental-report-doc .supplemental-report-content,
  #supplemental-print-affidavit[data-supplement-geo-sex="1"] .supplemental-report-doc .supplemental-report-content p,
  #supplemental-print-affidavit[data-supplement-geo-sex="1"] .supplemental-report-doc .supplemental-report-content li,
  #supplemental-print-affidavit[data-supplement-geo-sex="1"] .supplemental-report-doc .supplemental-report-content span,
  #supplemental-print-affidavit[data-supplement-geo-sex="1"] .supplemental-report-doc .supplemental-report-content div,
  #supplemental-print-affidavit[data-supplement-geo-sex="1"] .supplemental-report-doc .supplemental-numbered-items,
  #supplemental-print-affidavit[data-supplement-geo-sex="1"] .supplemental-report-doc .supplemental-numbered-items li {
    line-height: 1.5 !important;
  }
}
body.pdf-capture #supplemental-print-affidavit[data-supplement-geo-sex="1"] .supplemental-report-doc.print-doc {
  padding-top: 0 !important;
  padding-left: 0.3in !important;
  padding-right: 0.3in !important;
  box-sizing: border-box !important;
  line-height: 1.5 !important;
}
body.pdf-capture #supplemental-print-affidavit[data-supplement-geo-sex="1"] .supplemental-report-doc.print-doc .supplemental-report-top-header {
  margin-top: 0.3in !important;
}
body.pdf-capture #supplemental-print-affidavit[data-supplement-geo-sex="1"] .supplemental-report-doc .supplemental-report-content,
body.pdf-capture #supplemental-print-affidavit[data-supplement-geo-sex="1"] .supplemental-report-doc .supplemental-report-content p,
body.pdf-capture #supplemental-print-affidavit[data-supplement-geo-sex="1"] .supplemental-report-doc .supplemental-report-content li,
body.pdf-capture #supplemental-print-affidavit[data-supplement-geo-sex="1"] .supplemental-report-doc .supplemental-report-content span,
body.pdf-capture #supplemental-print-affidavit[data-supplement-geo-sex="1"] .supplemental-report-doc .supplemental-report-content div,
body.pdf-capture #supplemental-print-affidavit[data-supplement-geo-sex="1"] .supplemental-report-doc .supplemental-numbered-items,
body.pdf-capture #supplemental-print-affidavit[data-supplement-geo-sex="1"] .supplemental-report-doc .supplemental-numbered-items li {
  line-height: 1.5 !important;
}
body.pdf-capture #supplemental-print-affidavit .supplemental-report-doc .supplemental-bottom-wrap .print-doc-footer p {
  line-height: 1 !important;
}
/* Geographical + Child's Sex: hide transmittal/LCR and legacy wrapper headers in print/PDF */
@media print {
  .supplemental-print-anim-page:has(#supplemental-print-affidavit[data-supplement-geo-sex="1"]) #supplemental-print-transmittal,
  .supplemental-print-anim-page:has(#supplemental-print-affidavit[data-supplement-geo-sex="1"]) #supplemental-print-lcr,
  #supplemental-print-bundle:has(#supplemental-print-affidavit[data-supplement-geo-sex="1"]) + #supplemental-print-transmittal,
  #supplemental-print-bundle:has(#supplemental-print-affidavit[data-supplement-geo-sex="1"]) #supplemental-print-lcr,
  #supplemental-print-affidavit[data-supplement-geo-sex="1"] .ccr-header,
  #supplemental-print-affidavit[data-supplement-geo-sex="1"] .print-doc-header {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    max-height: 0 !important;
    overflow: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
  }
}
body.pdf-capture .supplemental-print-anim-page:has(#supplemental-print-affidavit[data-supplement-geo-sex="1"]) #supplemental-print-transmittal,
body.pdf-capture .supplemental-print-anim-page:has(#supplemental-print-affidavit[data-supplement-geo-sex="1"]) #supplemental-print-lcr,
body.pdf-capture #supplemental-print-bundle:has(#supplemental-print-affidavit[data-supplement-geo-sex="1"]) + #supplemental-print-transmittal,
body.pdf-capture #supplemental-print-bundle:has(#supplemental-print-affidavit[data-supplement-geo-sex="1"]) #supplemental-print-lcr,
body.pdf-capture #supplemental-print-affidavit[data-supplement-geo-sex="1"] .ccr-header,
body.pdf-capture #supplemental-print-affidavit[data-supplement-geo-sex="1"] .print-doc-header {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  max-height: 0 !important;
  overflow: hidden !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
}
        `}
      </style>
      <div className="no-print mb-3 max-w-6xl mx-auto flex items-center justify-between gap-2">
        <Link
          to="/legal-instrument/supplemental/saved"
          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
        >
          Back to Files Saved
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <select
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value)}
            disabled={showAffidavitOutput && activePanel === 'affidavit'}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white disabled:opacity-70 disabled:cursor-not-allowed"
            title={
              showAffidavitOutput && activePanel === 'affidavit'
                ? 'Supplemental affidavit is printed on long bond only'
                : 'Paper size'
            }
          >
            {selectablePaperSizes.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          {activePanel === 'form1a' && showForm1a ? (
            <button
              type="button"
              onClick={() =>
                savePdfWithExportMode('lcr', `Supplemental-LCR-${data.lcrType || '1A'}`)
              }
              disabled={savingPdf || !showForm1a}
              className="px-3 py-1.5 rounded-md bg-[#283750] text-white text-sm font-medium hover:bg-[#1e2d42] disabled:opacity-60"
              title={`Save PDF for LCR Form ${data.lcrType || '1A'} only (same layout as Court Decree / AUSF / Legitimation)`}
            >
              {savingPdf ? 'Saving...' : `Save LCR Form ${data.lcrType || '1A'} PDF`}
            </button>
          ) : activePanel !== 'transmittal' ? (
            <button
              type="button"
              onClick={() => savePdfWithExportMode('bundle', 'Supplemental-Report')}
              disabled={savingPdf || !showAffidavitOutput}
              className="px-3 py-1.5 rounded-md bg-[var(--primary-blue)] text-white text-sm font-medium hover:bg-[var(--primary-blue-light)] disabled:opacity-60"
              title={
                showAffidavitOutput
                  ? `Affidavit${showForm1a ? ` + LCR Form ${data.lcrType || '1A'}` : ''} (no transmittal pages)`
                  : 'No supplemental affidavit data yet'
              }
            >
              {savingPdf ? 'Saving...' : 'Save affidavit PDF'}
            </button>
          ) : null}
          {showTransmittalOutput && activePanel === 'transmittal' ? (
            <button
              type="button"
              onClick={() => savePdfWithExportMode('transmittal', 'Supplemental-Transmittal')}
              disabled={savingPdf}
              className="px-3 py-1.5 rounded-md bg-[#1a4d3a] text-white text-sm font-medium hover:bg-[#143d2d] disabled:opacity-60"
              title="CCR transmittal letter only"
            >
              {savingPdf ? 'Saving...' : 'Save transmittal PDF'}
            </button>
          ) : null}
          <button
            type="button"
            onClick={handlePreviewPdfModal}
            className="px-3 py-1.5 rounded-md bg-gray-600 text-white text-sm font-medium hover:bg-gray-700"
            title={
              activePanel === 'form1a' && showForm1a
                ? `Preview LCR Form ${data.lcrType || '1A'} PDF`
                : activePanel === 'transmittal'
                  ? 'Preview transmittal letter PDF'
                  : 'Preview affidavit PDF (and LCR pages if included)'
            }
          >
            Preview PDF
          </button>
        </div>
      </div>
      <div id="supplemental-print-page" className="flex gap-6 items-start print:block">
        <aside className="no-print w-56 shrink-0 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">View &amp; Print</h2>
          <div className="flex flex-col gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (!showAffidavitOutput) return
                  setActivePanel('affidavit')
                }}
                disabled={!showAffidavitOutput}
                title={showAffidavitOutput ? 'Supplemental affidavit output' : 'No supplemental affidavit data yet'}
                className={`${sidebarBtnAffidavit}${activePanel === 'affidavit' ? sidebarBtnSelected : ''} ${!showAffidavitOutput ? 'opacity-45 cursor-not-allowed hover:bg-[var(--primary-blue)]/80' : ''} pr-[5.75rem]`}
              >
                Supplemental affidavit
              </button>
              <PrintSidebarNavAttachIcons
                scopeKey={supplementalAffidavitKey}
                hasUpload={hasAffidavitScan}
                iconsDisabled={!showAffidavitOutput}
                onOpenUploadModal={() =>
                  setUploadModal({
                    open: true,
                    key: supplementalAffidavitKey,
                    title: 'Supplemental Report — Affidavit scan',
                  })
                }
              />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (!showTransmittalOutput) return
                  setActivePanel('transmittal')
                }}
                disabled={!showTransmittalOutput}
                title={
                  showTransmittalOutput
                    ? 'CCR transmittal output'
                    : 'No transmittal checklist/document selections yet'
                }
                className={`${sidebarBtnTransmittal}${activePanel === 'transmittal' ? sidebarBtnSelected : ''} ${!showTransmittalOutput ? 'opacity-45 cursor-not-allowed hover:bg-[#1a4d3a]' : ''} pr-[5.75rem]`}
              >
                Transmittal
              </button>
              <PrintSidebarNavAttachIcons
                scopeKey={supplementalTransmittalKey}
                hasUpload={hasTransmittalScan}
                iconsDisabled={!showTransmittalOutput}
                onOpenUploadModal={() =>
                  setUploadModal({
                    open: true,
                    key: supplementalTransmittalKey,
                    title: 'Supplemental Report — Transmittal scan',
                  })
                }
              />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (!showForm1a) return
                  setActivePanel('form1a')
                }}
                disabled={!showForm1a}
                title={
                  showForm1a
                    ? `LCR Form No. ${data.lcrType}`
                    : 'Turn on “Include LCR Form” on the Supplemental form to enable this output.'
                }
                className={`${sidebarBtnForm1a}${activePanel === 'form1a' ? sidebarBtnSelected : ''} ${!showForm1a ? 'opacity-45 cursor-not-allowed hover:bg-[#283750]' : ''} pr-[5.75rem]`}
              >
                FORM {data.lcrType}
              </button>
              <PrintSidebarNavAttachIcons
                scopeKey={supplementalLcrKey}
                hasUpload={hasLcrScan}
                iconsDisabled={!showForm1a}
                onOpenUploadModal={() =>
                  setUploadModal({
                    open: true,
                    key: supplementalLcrKey,
                    title: `Supplemental Report — LCR Form ${data.lcrType || '1A'} scan`,
                  })
                }
              />
            </div>
            {showTransmittalOutput || (showAffidavitOutput && isMiddleNameAffidavit) ? (
              <div className="no-print relative z-10 rounded-lg border border-slate-200 bg-slate-50/95 p-2.5 space-y-1.5 ring-1 ring-slate-100">
                <label htmlFor="supplemental-print-prepared-signed" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                  Prepared / signed by
                </label>
                <select
                  id="supplemental-print-prepared-signed"
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs text-gray-900 bg-white"
                  value={clampTransmittalSignatoryIndex(data.transmittalSignatoryOptionIndex)}
                  onChange={(e) => handleTransmittalSignatoryIndexChange(Number(e.target.value))}
                  title={
                    showTransmittalOutput && showAffidavitOutput && isMiddleNameAffidavit
                      ? "Signatory on transmittal and on the child's middle name affidavit footer"
                      : showTransmittalOutput
                        ? 'Signatory after "Respectfully yours," on the supplemental transmittal'
                        : "Signatory on the child's middle name affidavit footer"
                  }
                >
                  {RECEIVED_BY_OPTIONS.map((row, i) => (
                    <option key={row.name} value={i}>
                      {row.name} — {row.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {showForm1a ? (
              <LcrRemarksFontSizeSelect
                id="supplemental-print-lcr-remarks-font"
                value={data.lcrRemarksFontSizePt}
                onChange={handleLcrRemarksFontChange}
                helpText="Applies to the REMARKS block on this LCR form in preview and print/PDF."
              />
            ) : null}
          </div>
        </aside>

        <div className="flex-1 min-w-0 print:w-full print:max-w-none">
          {showBundleForRender ? (
            <div id="supplemental-print-bundle">
              <div
                id="supplemental-print-affidavit"
                {...(isColbCompactPrintAffidavit ? { 'data-supplement-mn': '1' } : {})}
                {...(isSexSupplementAffidavit || isGeographicalSupplementAffidavit
                  ? { 'data-supplement-geo-sex': '1' }
                  : {})}
                className={
                  `${activePanel === 'affidavit' ? 'block' : 'hidden print:block print:[page-break-before:avoid]'} ${isMiddleNameAffidavit || isColbCompactPrintAffidavit ? 'mx-auto' : ''
                    }`.trim()
                }
              >
                <SupplementalReportAffidavit
                  data={data}
                  onItem3CustomChange={setItem3Custom}
                  onItem5CustomChange={setItem5Custom}
                  paperWidth={`${colbCompactAffidavitWidthMm ?? affidavitPaperSpec.widthMm}mm`}
                  paperHeight={`${affidavitPaperSpec.heightMm}mm`}
                />
              </div>

              {showForm1a ? (
                <div
                  id="supplemental-print-lcr"
                  className={
                    activePanel === 'form1a'
                      ? 'block mt-0'
                      : 'hidden print:block print:mt-0 print:[page-break-before:always]'
                  }
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
                      <>Manual entry on the supplemental form — edit the table below. </>
                    ) : (
                      <>No record selected on the supplemental form — fill the table below or return to the form to prefill. </>
                    )}
                    Table cells are editable below; changes are saved with this supplemental file.
                  </div>
                  <SupplementalLcrFooterSignatoryPickers
                    lcrData={lcrData}
                    inputClass="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white"
                    onPatch={patchLcrData}
                  />
                  <div className="max-w-[210mm] mx-auto">
                    {data.lcrType === '1A' && (
                      <LcrForm1ABirthAvailable
                        data={lcrPrintData}
                        editableTable
                        onDataChange={handleLcrDataChange}
                      />
                    )}
                    {data.lcrType === '2A' && (
                      <LcrForm2ADeathAvailable
                        data={lcrPrintData}
                        editableTable
                        onDataChange={handleLcrDataChange}
                      />
                    )}
                    {data.lcrType === '3A' && (
                      <LcrForm3AMarriageAvailable
                        data={lcrPrintData}
                        editableTable
                        onDataChange={handleLcrDataChange}
                      />
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {showTransmittalForRender ? (
            <div
              id="supplemental-print-transmittal"
              className={
                activePanel === 'transmittal'
                  ? `block mt-0 ${showBundleForRender ? 'print:[page-break-before:always]' : ''}`
                  : `hidden print:block print:mt-0 ${showBundleForRender ? 'print:[page-break-before:always]' : ''}`
              }
            >
              <SupplementalTransmittal
                data={data}
                paperWidth={`${paperSpec.widthMm}mm`}
                paperHeight={`${paperSpec.heightMm}mm`}
                onSignatoryOptionIndexChange={handleTransmittalSignatoryIndexChange}
              />
            </div>
          ) : null}
        </div>
      </div>
      <UploadFileModal
        open={uploadModal.open}
        onClose={() => setUploadModal((m) => ({ ...m, open: false }))}
        scopeKey={uploadModal.key}
        title={uploadModal.title}
        offerLibraryAttach
        onChanged={(evt) => {
          setUploadTick((t) => t + 1)
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
