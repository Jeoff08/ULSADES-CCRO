import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SupplementalReportAffidavit from '../legitimation/print/SupplementalReportAffidavit'
import LcrForm1ABirthAvailable from '../courtDecree/print/LcrForm1ABirthAvailable'
import SupplementalTransmittal from './print/SupplementalTransmittal'
import { saveCurrentViewAsPdf } from '../../lib/savePdf'
import { PAPER_SIZES } from '../../components/print'
import { getActiveSavedSupplemental, getSupplementalDraft } from './lib/supplementalSavedStorage'
import {
  getDefaultSupplementalTransmittalFields,
  pickTransmittalStateFromDraft,
} from './lib/supplementalTransmittalDefaults'
import {
  buildForm1aDataForSupplemental,
  form1aDataFromLegitimationRecord,
  listLegitimationSourcesForForm1a,
  searchLegitimationForForm1a,
} from './lib/supplementalForm1a'
import { defaultLegitimation } from '../legitimation/lib/legitimationDefaults'

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
  form1aMatchName: '',
  ...getDefaultSupplementalTransmittalFields(),
}

const PRINT_SIZE_STYLE_ID = 'print-paper-size-supplemental'

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

const sidebarBtnBase =
  'w-full text-left px-3 py-2.5 text-sm font-medium transition text-white rounded-lg'
const sidebarBtnAffidavit = `${sidebarBtnBase} bg-[var(--primary-blue)]/80 hover:bg-[var(--primary-blue)]`
const sidebarBtnForm1a = `${sidebarBtnBase} bg-[#283750] hover:bg-[#1e2d42]`
const sidebarBtnTransmittal = `${sidebarBtnBase} bg-[#1a4d3a] hover:bg-[#143d2d]`
const sidebarBtnSelected = ' ring-2 ring-offset-1 ring-[var(--primary-blue)]'

export default function SupplementalPrint() {
  const baseData = useMemo(() => {
    const active = getActiveSavedSupplemental()
    const merged = active?.data
      ? { ...defaultSupplementalDraft, ...active.data }
      : getSupplementalDraft(defaultSupplementalDraft)
    const transmittalSlice = pickTransmittalStateFromDraft(merged)
    return { ...merged, ...transmittalSlice }
  }, [])
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

  const [form1aRecord, setForm1aRecord] = useState(() => ({ ...defaultLegitimation }))
  const [form1aSearchQuery, setForm1aSearchQuery] = useState('')
  const form1aSearchInputRef = useRef(null)

  const form1aAllRegistered = useMemo(
    () => (showForm1a ? listLegitimationSourcesForForm1a() : []),
    [showForm1a]
  )

  const form1aLegitimationMatches = useMemo(
    () => (showForm1a ? searchLegitimationForForm1a(form1aSearchQuery) : []),
    [showForm1a, form1aSearchQuery]
  )

  const form1aAutoFromLegitimation = useMemo(() => {
    if (!showForm1a) return null
    return buildForm1aDataForSupplemental(data)
  }, [
    showForm1a,
    data.supplementType,
    data.colbSubject,
    data.affiantName,
    data.subjectColbName,
    data.form1aMatchName,
    data.includeForm1a,
  ])
  const form1aHasAutoLegitimationMatch = form1aAutoFromLegitimation != null

  useEffect(() => {
    if (!showForm1a) return
    setForm1aRecord(form1aAutoFromLegitimation ?? { ...defaultLegitimation })
    setForm1aSearchQuery('')
  }, [showForm1a, form1aAutoFromLegitimation])

  useEffect(() => {
    if (!showForm1a) return
    const typed = form1aSearchQuery.trim()
    if (!typed) return
    if (form1aLegitimationMatches.length === 1) {
      setForm1aRecord(form1aDataFromLegitimationRecord(form1aLegitimationMatches[0].data))
    }
  }, [showForm1a, form1aSearchQuery, form1aLegitimationMatches])
  const effectivePaperSize = savingPdf && exportMode === 'bundle' ? 'short' : paperSize
  const paperSpec = useMemo(
    () => PAPER_SIZES.find((p) => p.id === effectivePaperSize) || PAPER_SIZES[0],
    [effectivePaperSize]
  )
  usePrintPageSize(effectivePaperSize)

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
  }
  const showBundleForRender = showAffidavitOutput && exportMode !== 'transmittal'
  const showTransmittalForRender = showTransmittalOutput && exportMode !== 'bundle'

  const savePdfWithExportMode = async (mode, suggestedBaseName) => {
    if (mode === 'bundle' && !showAffidavitOutput) {
      window.alert('No supplemental affidavit data yet. Fill the Supplemental form first, or use Save transmittal PDF.')
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

  const handlePreviewPdfModal = async () => {
    try {
      const bridge = window?.electronAPI
      if (!bridge || typeof bridge.previewPdfData !== 'function') {
        window.alert('PDF preview bridge is unavailable. Restart Electron.')
        return
      }
      const result = await bridge.previewPdfData()
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
          {activePanel !== 'transmittal' ? (
            <button
              type="button"
              onClick={() => savePdfWithExportMode('bundle', 'Supplemental-Report')}
              disabled={savingPdf || !showAffidavitOutput}
              className="px-3 py-1.5 rounded-md bg-[var(--primary-blue)] text-white text-sm font-medium hover:bg-[var(--primary-blue-light)] disabled:opacity-60"
              title={
                showAffidavitOutput
                  ? 'Affidavit and Form 1A only (no transmittal pages)'
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
                window.setTimeout(() => {
                  form1aSearchInputRef.current?.focus()
                  form1aSearchInputRef.current?.select?.()
                }, 0)
              }}
              disabled={!showForm1a}
              title={
                showForm1a
                  ? 'LCR Form No. 1A (Birth-Available)'
                  : 'Turn on “Include Form 1A” on the Supplemental form to enable this output.'
              }
              className={`${sidebarBtnForm1a}${activePanel === 'form1a' ? sidebarBtnSelected : ''} ${!showForm1a ? 'opacity-45 cursor-not-allowed hover:bg-[#283750]' : ''}`}
            >
              FORM 1A
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0 print:w-full print:max-w-none">
          {showBundleForRender ? (
          <div id="supplemental-print-bundle">
            <div
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
              className={
                activePanel === 'form1a'
                  ? 'block mt-0'
                  : 'hidden print:block print:mt-0 print:[page-break-before:always]'
              }
            >
              <div className="no-print mb-3 max-w-[210mm] mx-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p
                  className={
                    form1aHasAutoLegitimationMatch
                      ? 'text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1.5 mb-2'
                      : 'text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5 mb-2'
                  }
                >
                  {form1aHasAutoLegitimationMatch
                    ? 'Form 1A is pre-filled from the Legitimation/Court Decree record that matches this supplemental name (exact or single search match). You can still edit or pick another row below.'
                    : 'No single Legitimation/Court Decree match for this supplemental name — Form 1A starts blank. Choose a registered row below or type the form manually.'}
                </p>
                <label className="block text-xs font-semibold text-gray-800 mb-1">Registered Legitimation / Court Decree records</label>
                <input
                  ref={form1aSearchInputRef}
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white"
                  value={form1aSearchQuery}
                  onChange={(e) => setForm1aSearchQuery(e.target.value)}
                  placeholder="Leave empty to list everyone; type a name to narrow (child, parent, owner, or registry no.)"
                />
                <p className="text-[11px] text-gray-600 mt-1.5 leading-snug">
                  Registered entries from Legitimation and Court Decree (current draft + saved files) are listed below. Typing filters to rows where each word matches child/owner names, parents, saved label, or registry fields. Click a row to load Form 1A.
                </p>
                <p className="text-[11px] font-medium text-gray-700 mt-2">
                  {form1aAllRegistered.length === 0
                    ? 'No Legitimation/Court Decree draft or saved files yet.'
                    : form1aSearchQuery.trim()
                      ? `Showing ${form1aLegitimationMatches.length} of ${form1aAllRegistered.length} registered`
                      : `Showing all ${form1aAllRegistered.length} registered`}
                </p>
                {form1aAllRegistered.length > 0 && form1aLegitimationMatches.length > 0 ? (
                  <ul className="mt-2 max-h-60 overflow-y-auto rounded-md border border-gray-200 bg-white divide-y divide-gray-100">
                    {form1aLegitimationMatches.map((row) => (
                      <li key={row.sourceId}>
                        <button
                          type="button"
                          className="w-full text-left px-2 py-2 text-sm text-gray-800 hover:bg-[var(--primary-blue)]/10"
                          onClick={() => setForm1aRecord(form1aDataFromLegitimationRecord(row.data))}
                        >
                          <span className="font-medium">{row.childName || row.label}</span>
                          {row.sourceType ? (
                            <span className="block text-[11px] text-[var(--primary-blue)]">{row.sourceType}</span>
                          ) : null}
                          {row.childName && row.label && row.childName !== row.label ? (
                            <span className="block text-xs text-gray-500">{row.label}</span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : form1aAllRegistered.length > 0 ? (
                  <p className="text-xs text-amber-800 mt-2">No rows match that search. Try fewer words or clear the box to see everyone.</p>
                ) : null}
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-[var(--primary-blue)] hover:underline"
                  onClick={() => setForm1aRecord({ ...defaultLegitimation })}
                >
                  Clear form (blank manual entry)
                </button>
              </div>
              <div className="max-w-[210mm] mx-auto">
                <LcrForm1ABirthAvailable
                  data={form1aRecord}
                  editableTable
                  onDataChange={setForm1aRecord}
                />
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
