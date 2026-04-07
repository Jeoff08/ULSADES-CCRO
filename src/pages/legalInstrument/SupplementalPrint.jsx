import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SupplementalReportAffidavit from '../legitimation/print/SupplementalReportAffidavit'
import LcrForm1ABirthAvailable from '../courtDecree/print/LcrForm1ABirthAvailable'
import { saveCurrentViewAsPdf } from '../../lib/savePdf'
import { PAPER_SIZES } from '../../components/print'
import { getActiveSavedSupplemental, getSupplementalDraft } from './lib/supplementalSavedStorage'
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
const sidebarBtnSelected = ' ring-2 ring-offset-1 ring-[var(--primary-blue)]'

export default function SupplementalPrint() {
  const baseData = useMemo(() => {
    const active = getActiveSavedSupplemental()
    if (active?.data) return { ...defaultSupplementalDraft, ...active.data }
    return getSupplementalDraft(defaultSupplementalDraft)
  }, [])
  const [item3Custom, setItem3Custom] = useState(baseData.item3Custom || '')
  const [item5Custom, setItem5Custom] = useState(baseData.item5Custom || '')
  const [paperSize, setPaperSize] = useState('a4')
  const [savingPdf, setSavingPdf] = useState(false)
  const [activePanel, setActivePanel] = useState('affidavit')
  const data = useMemo(
    () => ({ ...baseData, item3Custom, item5Custom }),
    [baseData, item3Custom, item5Custom]
  )
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
  const paperSpec = useMemo(
    () => PAPER_SIZES.find((p) => p.id === paperSize) || PAPER_SIZES[0],
    [paperSize]
  )
  usePrintPageSize(paperSize)

  useEffect(() => {
    if (!showForm1a && activePanel === 'form1a') setActivePanel('affidavit')
  }, [showForm1a, activePanel])

  const handleSavePdf = async () => {
    if (savingPdf) return
    setSavingPdf(true)
    try {
      const result = await saveCurrentViewAsPdf('Supplemental-Report')
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
      setSavingPdf(false)
    }
  }

  return (
    <div className="p-4 print:p-0">
      <div className="no-print mb-3 max-w-6xl mx-auto flex items-center justify-between gap-2">
        <p className="text-sm text-gray-500">
          <Link to="/" className="text-[var(--primary-blue)] hover:underline">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link to="/legal-instrument/supplemental" className="text-[var(--primary-blue)] hover:underline">Supplemental Form</Link>
          <span className="mx-2">/</span>
          <span>Print Output</span>
        </p>
        <div className="flex items-center gap-2">
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
          <button
            type="button"
            onClick={handleSavePdf}
            disabled={savingPdf}
            className="px-3 py-1.5 rounded-md bg-[var(--primary-blue)] text-white text-sm font-medium hover:bg-[var(--primary-blue-light)] disabled:opacity-60"
          >
            {savingPdf ? 'Saving...' : 'Save as PDF'}
          </button>
        </div>
      </div>
      <div id="supplemental-print-page" className="flex gap-6 items-start print:block">
        <aside className="no-print w-56 shrink-0 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">View &amp; Print</h2>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setActivePanel('affidavit')}
              className={`${sidebarBtnAffidavit}${activePanel === 'affidavit' ? sidebarBtnSelected : ''}`}
            >
              Supplemental affidavit
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
          {showForm1a ? (
            <p className="text-xs text-gray-600 leading-snug">
              Form 1A uses Legitimation and Court Decree records. It pre-fills when one record matches the COLB / affiant name; otherwise pick from the list or enter manually. PDF/print includes both documents.
            </p>
          ) : (
            <p className="text-xs text-gray-600 leading-snug">
              Use the Supplemental form and confirm Include Form 1A to unlock FORM 1A here.
            </p>
          )}
        </aside>

        <div className="flex-1 min-w-0 print:w-full print:max-w-none">
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
      </div>
    </div>
  )
}
