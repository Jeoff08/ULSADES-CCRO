import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { defaultLegitimation } from './lib/legitimationDefaults'
import { clearLegitimationDraft } from './lib/legitimationStorage'
import { LEGITIMATION_TYPES } from './constants'
import { PAPER_SIZES } from '../../components/print'
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
  const [data, setData] = useState(() => getStoredData() || defaultLegitimation)

  usePrintPageSize(paperSize)

  useEffect(() => {
    const stored = getStoredData()
    if (stored) {
      setData(stored)
      clearLegitimationDraft()
    }
  }, [])

  const validType = LEGITIMATION_TYPES.some((t) => t.id === type) ? type : 'joint-affidavit'

  const handleBack = () => {
    clearLegitimationDraft()
    navigate(`/legitimation/form?type=${validType}`)
  }

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
          <button type="button" onClick={handleBack} className="px-3 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50">
            Back to Form
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
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSearchParams({ type: t.id })}
                  className={`text-left px-3 py-2.5 text-sm font-medium transition text-white rounded-lg bg-[#283750] hover:bg-[#1e2d42] ${isSelected ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                >
                  {t.title}
                </button>
              )
            })}
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          {content}
        </div>
      </div>
    </div>
  )
}
