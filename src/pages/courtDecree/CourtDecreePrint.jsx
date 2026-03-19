import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { defaultCourtDecree } from './lib/courtDecreeDefaults'
import { saveCourtDecreeDraft, getCourtDecreeDraft } from './lib/courtDecreeStorage'
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
  MarriageNullityArt42Annotation,
  MarriageAnnotationModeSidebar,
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

/** LCR + annotation print types tied to one civil document */
const LCR_TYPES_BY_AFFECTED = {
  BIRTH_CERTIFICATE: new Set(['lcr-form-1a', 'annotation-form-1a']),
  DEATH_CERTIFICATE: new Set(['lcr-form-2a', 'annotation-form-2a']),
  MARRIAGE_CERTIFICATE: new Set(['lcr-form-3a', 'annotation-form-3a']),
}

const RESTRICTED_PRINT_IDS = [
  'lcr-form-1a',
  'lcr-form-2a',
  'lcr-form-3a',
  'annotation-form-1a',
  'annotation-form-2a',
  'annotation-form-3a',
]

function isPrintTypeAllowedForAffected(printTypeId, affectedDocument) {
  const aff = (affectedDocument || '').trim()
  if (!aff || !LCR_TYPES_BY_AFFECTED[aff]) return true
  if (!RESTRICTED_PRINT_IDS.includes(printTypeId)) return true
  return LCR_TYPES_BY_AFFECTED[aff].has(printTypeId)
}

function defaultPrintTypeForAffected(affectedDocument) {
  const aff = (affectedDocument || '').trim()
  if (aff === 'BIRTH_CERTIFICATE') return 'lcr-form-1a'
  if (aff === 'DEATH_CERTIFICATE') return 'lcr-form-2a'
  if (aff === 'MARRIAGE_CERTIFICATE') return 'lcr-form-3a'
  return 'cert-authenticity'
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

  /** Not in sidebar — use Court Decree → Nullity of marriage. Direct URL still works. */
  const validType =
    type === 'marriage-nullity-art42'
      ? 'marriage-nullity-art42'
      : COURT_DECREE_TYPES.some((t) => t.id === type)
        ? type
        : 'cert-authenticity'

  useEffect(() => {
    const aff = (data.affectedDocument || '').trim()
    if (!aff || !LCR_TYPES_BY_AFFECTED[aff]) return
    if (!isPrintTypeAllowedForAffected(validType, aff)) {
      setSearchParams({ type: defaultPrintTypeForAffected(aff) }, { replace: true })
    }
  }, [data.affectedDocument, validType, setSearchParams])

  const LCR_1A_FORM_KEYS = [
    'lcr1aRegistryNumber', 'lcr1aDateRegistration', 'lcr1aNameOfChild', 'lcr1aSex', 'lcr1aDateOfBirth',
    'lcr1aPlaceOfBirth', 'lcr1aNameOfMother', 'lcr1aMotherCitizenship', 'lcr1aNameOfFather', 'lcr1aFatherCitizenship',
    'lcr1aDateMarriageParents', 'lcr1aPlaceMarriageParents',
    'childFirst', 'childMiddle', 'childLast', 'dateOfBirth', 'sex',
    'placeOfBirthStreet', 'placeOfBirthCity', 'placeOfBirthProvince',
    'motherFirst', 'motherMiddle', 'motherLast', 'motherCitizenship',
    'fatherFirst', 'fatherMiddle', 'fatherLast', 'fatherCitizenship',
    'colbRegistryNo', 'colbRegDate', 'colbPageNo', 'colbBookNo',
    'dateOfMarriage', 'placeOfMarriageCity', 'placeOfMarriageProvince', 'placeOfMarriageCountry',
    'placeOfMarriageOfParents',
    'certificateIssuanceDate', 'cityCivilRegistrarName', 'certificateSignatoryName',
    'contactPhone', 'contactEmail',
  ]

  // LCR Form 1A: court-decree form fields override matched legitimation draft
  const dataForLcr1A = useMemo(() => {
    if (validType !== 'lcr-form-1a' && validType !== 'annotation-form-1a') return data
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
    const base = { ...defaultLegitimation, ...(ownerData && typeof ownerData === 'object' ? ownerData : {}) }
    const out = { ...base }
    for (const k of LCR_1A_FORM_KEYS) {
      const v = data[k]
      if (v != null && String(v).trim() !== '') out[k] = typeof v === 'string' ? v.trim() : v
    }
    const reg = String(data.colbRegistryNo || '').trim() || String(data.registryNumber || '').trim()
    if (reg) out.colbRegistryNo = reg
    const pom = String(data.placeOfMarriageOfParents || '').trim()
    const pomFallback = [out.placeOfMarriageCity, out.placeOfMarriageProvince, out.placeOfMarriageCountry].filter(Boolean).join(', ')
    out.placeOfMarriageOfParents = pom || pomFallback
    const manualRemarks = String(data.lcrForm1aRemarks || '').trim()
    out.remarks = manualRemarks || buildLcrRemarks(data, out, 'BIRTH')
    return out
  }, [validType, data])

  const LCR_2A_FORM_KEYS = [
    'lcr2aRegistryNumber', 'lcr2aDateRegistration', 'lcr2aNameDeceased', 'lcr2aSex', 'lcr2aCivilStatus',
    'lcr2aCitizenship', 'lcr2aDateDeath', 'lcr2aCitizenshipFather', 'lcr2aPlaceDeath', 'lcr2aCauseDeath',
    'colbPageNo', 'colbBookNo', 'colbRegistryNo', 'colbRegDate', 'colbDateOfRegistration',
    'deceasedParentFirst', 'deceasedParentMiddle', 'deceasedParentLast',
    'documentOwnerName', 'sex', 'civilStatus', 'citizenship', 'dateOfDeath',
    'citizenshipOfFather', 'placeOfDeath', 'causeOfDeath',
    'certificateIssuanceDate', 'cityCivilRegistrarName', 'certificateSignatoryName',
    'contactPhone', 'contactEmail',
  ]

  const dataForLcr2A = useMemo(() => {
    if (validType !== 'lcr-form-2a') return data
    const ownerName = (data.lcr2aNameDeceased || data.documentOwnerName || '').trim()
    const normalize = (s) => (s || '').trim().toUpperCase()
    let ownerData = null
    if (ownerName) {
      const draft = getLegitimationDraft()
      if (draft) {
        const forDeath = getDocumentOwnerLabelFromLegitimationData(draft, 'DEATH_CERTIFICATE')
        const forMarriage = getDocumentOwnerLabelFromLegitimationData(draft, 'MARRIAGE_CERTIFICATE')
        if (normalize(forDeath) === normalize(ownerName) || normalize(forMarriage) === normalize(ownerName)) ownerData = draft
      }
      if (!ownerData) {
        const saved = getSavedLegitimationList()
        for (const item of saved) {
          if (!item.data) continue
          const forDeath = getDocumentOwnerLabelFromLegitimationData(item.data, 'DEATH_CERTIFICATE')
          const forMarriage = getDocumentOwnerLabelFromLegitimationData(item.data, 'MARRIAGE_CERTIFICATE')
          if (
            normalize(forDeath) === normalize(ownerName) ||
            normalize(forMarriage) === normalize(ownerName) ||
            normalize(item.label) === normalize(ownerName)
          ) {
            ownerData = item.data
            break
          }
        }
      }
    }
    if (!ownerData) ownerData = getLegitimationDraft()
    const base = { ...defaultLegitimation, ...(ownerData && typeof ownerData === 'object' ? ownerData : {}) }
    const out = { ...base }
    for (const k of LCR_2A_FORM_KEYS) {
      const v = data[k]
      if (v != null && String(v).trim() !== '') out[k] = typeof v === 'string' ? v.trim() : v
    }
    const reg = String(data.lcr2aRegistryNumber || '').trim() || String(data.colbRegistryNo || '').trim()
    if (reg) out.colbRegistryNo = reg
    out.remarks = buildLcrRemarks(data, out, 'DEATH')
    return out
  }, [validType, data])

  const LCR_3A_FORM_KEYS = [
    'lcr3aHusbandName', 'lcr3aHusbandDobAge', 'lcr3aHusbandCitizenship', 'lcr3aHusbandCivilStatus',
    'lcr3aHusbandMother', 'lcr3aHusbandFather', 'lcr3aWifeName', 'lcr3aWifeDobAge', 'lcr3aWifeCitizenship',
    'lcr3aWifeCivilStatus', 'lcr3aWifeMother', 'lcr3aWifeFather', 'lcr3aRegistryNumber', 'lcr3aDateRegistration',
    'lcr3aDateMarriage', 'lcr3aPlaceMarriage',
    'fatherFirst', 'fatherMiddle', 'fatherLast', 'motherFirst', 'motherMiddle', 'motherLast',
    'husbandDateOfBirth', 'wifeDateOfBirth', 'husbandAge', 'wifeAge',
    'fatherCitizenship', 'motherCitizenship', 'husbandCivilStatus', 'wifeCivilStatus',
    'husbandMotherName', 'wifeMotherName', 'husbandFatherName', 'wifeFatherName',
    'marriageRegistryNo', 'marriageDateOfRegistration', 'dateOfMarriage',
    'placeOfMarriageCity', 'placeOfMarriageProvince', 'placeOfMarriageCountry',
    'colbPageNo', 'colbBookNo', 'documentOwnerName',
    'certificateIssuanceDate', 'cityCivilRegistrarName', 'certificateSignatoryName',
    'contactPhone', 'contactEmail',
  ]

  const dataForLcr3A = useMemo(() => {
    if (validType !== 'lcr-form-3a') return data
    const normalize = (s) => (s || '').trim().toUpperCase()
    const ownerName = (data.documentOwnerName || '').trim()
    const hCourt = (data.lcr3aHusbandName || '').trim()
    const wCourt = (data.lcr3aWifeName || '').trim()
    let ownerData = null
    const matchLeg = (leg) => {
      if (!leg) return false
      const ml = (getDocumentOwnerLabelFromLegitimationData(leg, 'MARRIAGE_CERTIFICATE') || '').trim()
      if (ownerName && ml && normalize(ml) === normalize(ownerName)) return true
      const legH = [leg.fatherFirst, leg.fatherMiddle, leg.fatherLast].filter(Boolean).join(' ').trim()
      const legW = [leg.motherFirst, leg.motherMiddle, leg.motherLast].filter(Boolean).join(' ').trim()
      if (hCourt && wCourt && legH && legW && normalize(legH) === normalize(hCourt) && normalize(legW) === normalize(wCourt)) return true
      return false
    }
    const draft = getLegitimationDraft()
    if (matchLeg(draft)) ownerData = draft
    if (!ownerData) {
      for (const item of getSavedLegitimationList()) {
        if (item.data && matchLeg(item.data)) {
          ownerData = item.data
          break
        }
      }
    }
    if (!ownerData && ownerName) {
      for (const item of getSavedLegitimationList()) {
        if (item.data && normalize(item.label || '') === normalize(ownerName)) {
          ownerData = item.data
          break
        }
      }
    }
    if (!ownerData) ownerData = getLegitimationDraft()
    const base = { ...defaultLegitimation, ...(ownerData && typeof ownerData === 'object' ? ownerData : {}) }
    const out = { ...base }
    for (const k of LCR_3A_FORM_KEYS) {
      const v = data[k]
      if (v != null && String(v).trim() !== '') out[k] = typeof v === 'string' ? v.trim() : v
    }
    const reg = String(data.lcr3aRegistryNumber || '').trim() || String(data.marriageRegistryNo || '').trim()
    if (reg) out.marriageRegistryNo = reg
    out.remarks = buildLcrRemarks(data, out, 'MARRIAGE')
    return out
  }, [validType, data])

  /** Remarks for Annotation Form 2A only (legitimation + court merge). */
  const remarksForAnnotationForm2A = useMemo(() => {
    if (validType !== 'annotation-form-2a') return ''
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
    if (!ownerData) return buildLcrRemarks(data, { ...defaultLegitimation }, 'DEATH')
    return buildLcrRemarks(data, ownerData, 'DEATH')
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
      content = (
        <AnnotationForForm1A
          paperSize={paperSize}
          data={{ ...data, remarks: dataForLcr1A.remarks }}
          onAttachmentChange={(url) => {
            const next = { ...data, annotationForm1AScanDataUrl: url ?? '' }
            setData(next)
            try {
              const stored = getCourtDecreeDraft() || {}
              saveCourtDecreeDraft({ ...stored, annotationForm1AScanDataUrl: url ?? '' })
            } catch (_) {}
          }}
        />
      )
      break
    case 'annotation-form-2a':
      content = (
        <AnnotationForForm2A
          paperSize={paperSize}
          data={{ ...data, remarks: remarksForAnnotationForm2A }}
          onAttachmentChange={(url) => {
            const next = { ...data, annotationForm2AScanDataUrl: url ?? '' }
            setData(next)
            try {
              const stored = getCourtDecreeDraft() || {}
              saveCourtDecreeDraft({ ...stored, annotationForm2AScanDataUrl: url ?? '' })
            } catch (_) {}
          }}
        />
      )
      break
    case 'annotation-form-3a':
      content = <AnnotationForForm3A data={data} />
      break
    case 'marriage-nullity-art42':
      content = (
        <MarriageNullityArt42Annotation
          hugPrintSidebar
          hideOutputTypeSelector
          data={data}
          onAttachmentChange={(url) => {
            const next = { ...data, marriageNullityScanDataUrl: url ?? '' }
            setData(next)
            try {
              const stored = getCourtDecreeDraft() || {}
              saveCourtDecreeDraft({ ...stored, marriageNullityScanDataUrl: url ?? '' })
            } catch (_) {}
          }}
          onModeChange={(m) => {
            const next = { ...data, marriageAnnotationMode: m }
            setData(next)
            try {
              const stored = getCourtDecreeDraft() || {}
              saveCourtDecreeDraft({ ...stored, marriageAnnotationMode: m })
            } catch (_) {}
          }}
        />
      )
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
      <div className={validType === 'marriage-nullity-art42' ? 'flex gap-3 items-start' : 'flex gap-6'}>
        <aside className="no-print w-56 shrink-0 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">View &amp; Print</h2>
          <div className="flex flex-col gap-2">
            {(data.affectedDocument || '').trim() && LCR_TYPES_BY_AFFECTED[(data.affectedDocument || '').trim()] ? (
              <p className="text-xs text-gray-600 leading-snug -mt-1 mb-1">
                LCR &amp; annotation options match <span className="font-semibold text-gray-800">affected civil document</span> on the form.
              </p>
            ) : null}
            {COURT_DECREE_TYPES.filter((t) => isPrintTypeAllowedForAffected(t.id, data.affectedDocument)).map((t) => {
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
          {validType === 'marriage-nullity-art42' ? (
            <MarriageAnnotationModeSidebar
              belowPrintNav
              data={data}
              onModeChange={(m) => {
                const next = { ...data, marriageAnnotationMode: m }
                setData(next)
                try {
                  const stored = getCourtDecreeDraft() || {}
                  saveCourtDecreeDraft({ ...stored, marriageAnnotationMode: m })
                } catch (_) {}
              }}
            />
          ) : null}
        </aside>
        <div className="flex-1 min-w-0">
          {content}
        </div>
      </div>
    </div>
  )
}
