import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SupplementalReportAffidavit from '../legitimation/print/SupplementalReportAffidavit'
import LcrForm1ABirthAvailable from '../courtDecree/print/LcrForm1ABirthAvailable'
import LcrForm2ADeathAvailable from '../courtDecree/print/LcrForm2ADeathAvailable'
import LcrForm3AMarriageAvailable from '../courtDecree/print/LcrForm3AMarriageAvailable'
import SupplementalTransmittal from './print/SupplementalTransmittal'
import { saveCurrentViewAsPdf } from '../../lib/savePdf'
import { PAPER_SIZES, getPaperPageSpec } from '../../components/print'
import { getActiveSavedSupplemental, getSupplementalDraft, saveSupplementalDraft, saveOrUpdateSupplemental } from './lib/supplementalSavedStorage'
import {
  getDefaultSupplementalTransmittalFields,
  pickTransmittalStateFromDraft,
} from './lib/supplementalTransmittalDefaults'
import { defaultLegitimation } from '../legitimation/lib/legitimationDefaults'
import { defaultCourtDecree } from '../courtDecree/lib/courtDecreeDefaults'

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
  lcrData: { ...defaultLegitimation },
  lcrSource: 'courtDecree',
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

const LCR_SOURCE_LABEL = { ausf: 'AUSF', courtDecree: 'Court Decree', legitimation: 'Legitimation' }

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
  const [paperSize, setPaperSize] = useState('a4')
  const [savingPdf, setSavingPdf] = useState(false)
  const [exportMode, setExportMode] = useState(null)
  const [activePanel, setActivePanel] = useState('affidavit')
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewPdfUrl, setPreviewPdfUrl] = useState('')
  const data = useMemo(
    () => ({ ...baseData, item3Custom, item5Custom }),
    [baseData, item3Custom, item5Custom]
  )
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
  const showTransmittalOutput = hasTransmittalData
  const supType = String(data.supplementType || '').toLowerCase()
  /** Opt-in button sets includeForm1a; sex-only backward compat when field was never saved. */
  const showForm1a =
    data.includeForm1a === true || (supType === 'sex' && data.includeForm1a === undefined)

  const [lcrData, setLcrData] = useState(() => ({ ...baseData.lcrData }))

  useEffect(() => {
    setItem3Custom(baseData.item3Custom || '')
    setItem5Custom(baseData.item5Custom || '')
    const raw = baseData.lcrData
    const fallback = baseData.lcrType === '1A' ? { ...defaultLegitimation } : { ...defaultCourtDecree }
    setLcrData(raw && typeof raw === 'object' ? { ...raw } : { ...fallback })
  }, [location.key, baseData])

  const handleLcrDataChange = (next) => {
    setLcrData(next)
    // Persist to storage immediately so PDF generation and navigation work with latest
    const updated = { ...data, lcrData: next }
    saveSupplementalDraft(updated)
    saveOrUpdateSupplemental(updated)
  }
  /** Same @page sizing as Court Decree / Legitimation / AUSF — honor paper picker for Save PDF + Preview (Electron uses preferCSSPageSize). */
  const paperSpec = useMemo(() => getPaperPageSpec(paperSize), [paperSize])
  usePrintPageSize(paperSize)

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
      if (result?.ok) return
      if (result?.cancelled) {
        window.alert('Save cancelled. No PDF file was created.')
        return
      }
      window.alert(result?.reason || 'Unable to save PDF.')
    } catch (error) {
      console.error('Failed to save PDF:', error)
      window.alert(error?.message || 'Unable to save PDF right now. Please try again.')
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
    <div className="p-4 print:p-0">
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
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            title="Paper size"
          >
            {PAPER_SIZES.map((p) => (
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
            <button
              type="button"
              onClick={() => {
                if (!showAffidavitOutput) return
                setActivePanel('affidavit')
              }}
              disabled={!showAffidavitOutput}
              title={showAffidavitOutput ? 'Supplemental affidavit output' : 'No supplemental affidavit data yet'}
              className={`${sidebarBtnAffidavit}${activePanel === 'affidavit' ? sidebarBtnSelected : ''} ${!showAffidavitOutput ? 'opacity-45 cursor-not-allowed hover:bg-[var(--primary-blue)]/80' : ''}`}
            >
              Supplemental affidavit
            </button>
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
              className={`${sidebarBtnTransmittal}${activePanel === 'transmittal' ? sidebarBtnSelected : ''} ${!showTransmittalOutput ? 'opacity-45 cursor-not-allowed hover:bg-[#1a4d3a]' : ''}`}
            >
              Transmittal
            </button>
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
              className={`${sidebarBtnForm1a}${activePanel === 'form1a' ? sidebarBtnSelected : ''} ${!showForm1a ? 'opacity-45 cursor-not-allowed hover:bg-[#283750]' : ''}`}
            >
              FORM {data.lcrType}
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0 print:w-full print:max-w-none">
          {showBundleForRender ? (
          <div id="supplemental-print-bundle">
            <div
              id="supplemental-print-affidavit"
              className={
                activePanel === 'affidavit'
                  ? 'block'
                  : 'hidden print:block print:[page-break-before:avoid]'
              }
            >
              <SupplementalReportAffidavit
                data={data}
                onItem3CustomChange={setItem3Custom}
                onItem5CustomChange={setItem5Custom}
                paperWidth={`${paperSpec.widthMm}mm`}
                paperHeight={`${paperSpec.heightMm}mm`}
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
                ) : (
                  <>No record selected on the supplemental form — manual entry. </>
                )}
                Table cells are editable below; changes are saved with this supplemental file.
              </div>
              <div className="max-w-[210mm] mx-auto">
                {data.lcrType === '1A' && (
                  <LcrForm1ABirthAvailable
                    data={lcrData}
                    editableTable
                    onDataChange={handleLcrDataChange}
                  />
                )}
                {data.lcrType === '2A' && (
                  <LcrForm2ADeathAvailable
                    data={lcrData}
                    editableTable
                    onDataChange={handleLcrDataChange}
                  />
                )}
                {data.lcrType === '3A' && (
                  <LcrForm3AMarriageAvailable
                    data={lcrData}
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
              />
            </div>
          ) : null}
        </div>
      </div>
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
    </div>
  )
}
