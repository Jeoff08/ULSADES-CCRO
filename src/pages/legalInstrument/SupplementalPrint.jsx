import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SupplementalReportAffidavit from '../legitimation/print/SupplementalReportAffidavit'
import { saveCurrentViewAsPdf } from '../../lib/savePdf'
import { PAPER_SIZES } from '../../components/print'
import { clearSupplementalDraft, getActiveSavedSupplemental, getSupplementalDraft } from './lib/supplementalSavedStorage'

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
  const data = useMemo(
    () => ({ ...baseData, item3Custom, item5Custom }),
    [baseData, item3Custom, item5Custom]
  )
  const paperSpec = useMemo(
    () => PAPER_SIZES.find((p) => p.id === paperSize) || PAPER_SIZES[0],
    [paperSize]
  )
  usePrintPageSize(paperSize)

  useEffect(() => {
    clearSupplementalDraft()
  }, [])

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
      <div className="no-print mb-3 max-w-2xl mx-auto flex items-center justify-between gap-2">
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
      <div id="supplemental-print-page">
        <SupplementalReportAffidavit
          data={data}
          onItem3CustomChange={setItem3Custom}
          onItem5CustomChange={setItem5Custom}
          paperWidth={`${paperSpec.widthMm}mm`}
          paperHeight={`${paperSpec.heightMm}mm`}
        />
      </div>
    </div>
  )
}
