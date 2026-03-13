import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { defaultCourtDecree } from './lib/courtDecreeDefaults'
import { getLegitimationDraft, getSavedLegitimationList, getDocumentOwnerLabelFromLegitimationData } from '../legitimation/lib/legitimationStorage'
import { defaultLegitimation } from '../legitimation/lib/legitimationDefaults'
import { buildLcrRemarks } from './lib/lcrRemarks'
import { COURT_DECREE_TYPES } from './constants'
import { PAPER_SIZES } from '../../components/print'

const PRINT_SIZE_STYLE_ID = 'print-paper-size-court'

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
import {
  CertAuthenticityCourtDecree,
  CertRegistrationCourtDecree,
  Transmittal,
  OutOfTownTransmittal,
  LcrForm1ABirthAvailable,
  LcrForm2ADeathAvailable,
  LcrForm3AMarriageAvailable,
  AnnotationForForm1A,
  AnnotationForForm2A,
  AnnotationForForm3A,
} from './print'

function getStoredData() {
  try {
    const raw = localStorage.getItem('courtDecreeDraft')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return { ...defaultCourtDecree, ...parsed }
  } catch {
    return null
  }
}

export default function CourtDecreePrint() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [paperSize, setPaperSize] = useState('a4')
  const type = searchParams.get('type') || 'cert-authenticity'
  const [data, setData] = useState(() => getStoredData() || defaultCourtDecree)

  usePrintPageSize(paperSize)

  useEffect(() => {
    const stored = getStoredData()
    if (stored) setData(stored)
  }, [])

  const validType = COURT_DECREE_TYPES.some((t) => t.id === type) ? type : 'cert-authenticity'

  // For LCR Form 1A: Legitimation only — no Court Decree or AUSF data
  const dataForLcr1A = useMemo(() => {
    if (validType !== 'lcr-form-1a') return data
    const ownerName = (data.documentOwnerName || '').trim()
    const normalize = (s) => (s || '').trim().toUpperCase()
    let ownerData = null
    if (ownerName) {
      const draft = getLegitimationDraft()
      if (draft && normalize(getDocumentOwnerLabelFromLegitimationData(draft, 'BIRTH_CERTIFICATE')) === normalize(ownerName)) ownerData = draft
      if (!ownerData) {
        const saved = getSavedLegitimationList()
        for (const item of saved) {
          if (!item.data) continue
          if (normalize(getDocumentOwnerLabelFromLegitimationData(item.data, 'BIRTH_CERTIFICATE')) === normalize(ownerName) || normalize(item.label) === normalize(ownerName)) {
            ownerData = item.data
            break
          }
        }
      }
    }
    if (!ownerData) ownerData = getLegitimationDraft()
    if (!ownerData) return { ...defaultLegitimation }
    const leg = ownerData
    return {
      ...leg,
      colbDateOfRegistration: leg.colbRegDate,
      colbPageNumber: leg.colbPageNo,
      colbBookNumber: leg.colbBookNo,
      placeOfBirthAddress: leg.placeOfBirthStreet,
      dateOfMarriageOfParents: leg.dateOfMarriage,
      placeOfMarriageOfParents: [leg.placeOfMarriageCity, leg.placeOfMarriageProvince, leg.placeOfMarriageCountry].filter(Boolean).join(', '),
      remarks: buildLcrRemarks(data, leg, 'BIRTH'),
    }
  }, [validType, data])

  // For LCR Form 2A: Legitimation only — no Court Decree or AUSF data
  const dataForLcr2A = useMemo(() => {
    if (validType !== 'lcr-form-2a') return data
    const ownerName = (data.documentOwnerName || '').trim()
    const normalize = (s) => (s || '').trim().toUpperCase()
    let ownerData = null
    if (ownerName) {
      const draft = getLegitimationDraft()
      if (draft) {
        const forMarriage = getDocumentOwnerLabelFromLegitimationData(draft, 'MARRIAGE_CERTIFICATE')
        const forDeath = getDocumentOwnerLabelFromLegitimationData(draft, 'DEATH_CERTIFICATE')
        if (normalize(forMarriage) === normalize(ownerName) || normalize(forDeath) === normalize(ownerName)) ownerData = draft
      }
      if (!ownerData) {
        const saved = getSavedLegitimationList()
        for (const item of saved) {
          if (!item.data) continue
          const forMarriage = getDocumentOwnerLabelFromLegitimationData(item.data, 'MARRIAGE_CERTIFICATE')
          const forDeath = getDocumentOwnerLabelFromLegitimationData(item.data, 'DEATH_CERTIFICATE')
          const childLabel = [item.data.childFirst, item.data.childMiddle, item.data.childLast].filter(Boolean).join(' ').trim()
          if (normalize(forMarriage) === normalize(ownerName) || normalize(forDeath) === normalize(ownerName) || normalize(childLabel) === normalize(ownerName) || normalize(item.label) === normalize(ownerName)) {
            ownerData = item.data
            break
          }
        }
      }
    }
    if (!ownerData) ownerData = getLegitimationDraft()
    if (!ownerData) return { ...defaultLegitimation }
    const deceasedName = [ownerData.deceasedParentFirst, ownerData.deceasedParentMiddle, ownerData.deceasedParentLast].filter(Boolean).join(' ').trim()
    return {
      ...ownerData,
      documentOwnerName: ownerName || deceasedName,
      colbDateOfRegistration: ownerData.colbRegDate,
      colbPageNumber: ownerData.colbPageNo,
      colbBookNumber: ownerData.colbBookNo,
      remarks: buildLcrRemarks(data, ownerData, 'DEATH'),
    }
  }, [validType, data])

  // For LCR Form 3A (marriage): Legitimation only — no Court Decree or AUSF data
  const dataForLcr3A = useMemo(() => {
    if (validType !== 'lcr-form-3a') return data
    const ownerName = (data.documentOwnerName || '').trim()
    const normalize = (s) => (s || '').trim().toUpperCase()
    let ownerData = null
    if (ownerName) {
      const draft = getLegitimationDraft()
      if (draft && normalize(getDocumentOwnerLabelFromLegitimationData(draft, 'MARRIAGE_CERTIFICATE')) === normalize(ownerName)) ownerData = draft
      if (!ownerData) {
        const saved = getSavedLegitimationList()
        for (const item of saved) {
          if (!item.data) continue
          if (normalize(getDocumentOwnerLabelFromLegitimationData(item.data, 'MARRIAGE_CERTIFICATE')) === normalize(ownerName) || normalize(item.label) === normalize(ownerName)) {
            ownerData = item.data
            break
          }
        }
      }
    }
    if (!ownerData) ownerData = getLegitimationDraft()
    if (!ownerData) return { ...defaultLegitimation }
    return {
      ...ownerData,
      remarks: buildLcrRemarks(data, ownerData, 'MARRIAGE'),
    }
  }, [validType, data])

  const subjectLine = data.caseTitle
    ? `SUBJECT: IN RE: ${(data.caseTitle || '').toUpperCase()}`
    : `SUBJECT: IN RE: JOINT PETITION TO APPROVE AND REGISTER THE DIVORCE OF SPOUSES ${(data.documentOwnerName || '').toUpperCase()}`

  let content
  switch (validType) {
    case 'cert-authenticity':
      content = <CertAuthenticityCourtDecree data={data} />
      break
    case 'cert-registration':
      content = <CertRegistrationCourtDecree data={data} />
      break
    case 'transmittal':
      content = <Transmittal data={data} subjectLine={subjectLine} />
      break
    case 'out-of-town-transmittal':
      content = <OutOfTownTransmittal data={data} subjectLine={subjectLine} />
      break
    case 'lcr-form-1a':
      content = (
        <div className="court-decree-lcr-form-outer">
          <LcrForm1ABirthAvailable data={dataForLcr1A} />
        </div>
      )
      break
    case 'lcr-form-2a':
      content = (
        <div className="court-decree-lcr-form-outer">
          <LcrForm2ADeathAvailable data={dataForLcr2A} />
        </div>
      )
      break
    case 'lcr-form-3a':
      content = (
        <div className="court-decree-lcr-form-outer">
          <LcrForm3AMarriageAvailable data={dataForLcr3A} />
        </div>
      )
      break
    case 'annotation-form-1a':
      content = <AnnotationForForm1A data={data} />
      break
    case 'annotation-form-2a':
      content = <AnnotationForForm2A data={data} />
      break
    case 'annotation-form-3a':
      content = <AnnotationForForm3A data={data} />
      break
    default:
      content = <CertAuthenticityCourtDecree data={data} />
  }

  return (
    <div className="p-4 print:p-0">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold text-gray-800">Court Decree – Print</h1>
          <button type="button" onClick={() => navigate('/court-decree/saved')} className="px-3 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50">
            Back to Files Saved
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="court-decree-paper-size">Paper size (for print)</label>
          <select
            id="court-decree-paper-size"
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            {PAPER_SIZES.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2.5 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            Print
          </button>
        </div>
      </div>
      <div className="flex gap-6">
        <aside className="no-print w-56 shrink-0 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">View &amp; Print</h2>
          <div className="flex flex-col gap-2">
            {COURT_DECREE_TYPES.map((t) => {
              const isStandardAnnotation = t.id === 'standard-annotation'
              const isSelected = !isStandardAnnotation && validType === t.id
              const isLcrForm = ['lcr-form-1a', 'lcr-form-2a', 'lcr-form-3a'].includes(t.id)
              const btnClass = [
                'text-left px-3 py-2.5 text-sm font-medium transition text-white rounded-lg',
                isLcrForm ? 'bg-[#283750] hover:bg-[#1e2d42]' : 'bg-[var(--primary-blue)]/80 hover:bg-[var(--primary-blue)]',
                isSelected ? 'ring-2 ring-offset-1 ring-[var(--primary-blue)]' : '',
              ].filter(Boolean).join(' ')
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => (isStandardAnnotation ? navigate('/court-decree/instructions') : setSearchParams({ type: t.id }))}
                  className={btnClass}
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
