import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { afterUnsavedAcknowledge, useWarnIfUnsaved } from '../../hooks/useWarnIfUnsaved'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  getActiveSupplementalId,
  getSupplementalDraft,
  saveOrUpdateSupplemental,
  saveSupplementalDraft,
} from './lib/supplementalSavedStorage'
import {
  getDefaultSupplementalTransmittalFields,
  pickTransmittalStateFromDraft,
} from './lib/supplementalTransmittalDefaults'
import { defaultLegitimation } from '../legitimation/lib/legitimationDefaults'
import { defaultCourtDecree } from '../courtDecree/lib/courtDecreeDefaults'
import { getSavedAUSFList, getAUSFDraft } from '../ausf/lib/ausfStorage'
import { getSavedCourtDecreeList, getCourtDecreeDraft } from '../courtDecree/lib/courtDecreeStorage'
import { getSavedLegitimationList, getLegitimationDraft } from '../legitimation/lib/legitimationStorage'
import { mapSourceToSupplementalLcrData } from './lib/supplementalLcrPrefill'
import {
  getSupplementalMissingCorrectedLabels,
  resolveSupplementalAffidavitType,
} from './lib/supplementalAffidavitType'
import {
  SUPPLEMENTAL_LCR_FORM_TYPES,
  emptyLcrDataForType,
  getSupplementalLcrBundleFromDraft,
  persistLcrBundleToDraftShape,
  supplementalLcrSliceHasFilledFields,
} from './lib/supplementalLcrFormsState'
import SupplementalTransmittalFieldsEditor from './SupplementalTransmittalFieldsEditor'
import SupplementalLcrFooterSignatoryPickers from './SupplementalLcrFooterSignatoryPickers'
import LcrForm1ABirthAvailable from '../courtDecree/print/LcrForm1ABirthAvailable'
import LcrForm2ADeathAvailable from '../courtDecree/print/LcrForm2ADeathAvailable'
import LcrForm3AMarriageAvailable from '../courtDecree/print/LcrForm3AMarriageAvailable'
import LcrRemarksFontSizeSelect from '../../components/lcr/LcrRemarksFontSizeSelect'
import { FormBodyFieldShortcuts } from '../../components/forms/FormBodyFieldShortcuts'
import { mergeLcrRemarksFontSizePt } from '../../lib/lcrRemarksFontSize'
import { handleEnterFocusNextField } from '../../lib/formEnterFocusNext'
import { parseFormMonthInputToNumber1to12 } from '../../lib/printUtils'

const SUPPLEMENT_TYPE_LIST_KEY = 'ulsades_supplemental_type_list'

const SUPPLEMENT_TYPE_BUILTIN = [
  { value: 'geographical', label: 'Geographical (province)' },
  { value: 'sex', label: "Child's sex" },
  { value: 'middleName', label: "Child's middle name" },
]

/** Allow short built-in keys (e.g. sex) and longer custom descriptions. */
function isLikelySupplementType(value) {
  const s = String(value || '').trim()
  if (s.length < 3 || s.length > 120) return false
  return /[a-z0-9]/i.test(s)
}

function hasValue(v) {
  return String(v ?? '').trim().length > 0
}

function recordHasLcrType(data, lcrType) {
  return supplementalLcrSliceHasFilledFields(data, lcrType)
}

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
  includeForm1a: false,
  lcrType: '1A', // legacy + first form in bundle
  lcrRemarksFontSizePt: '12',
  lcrData: { ...defaultLegitimation },
  /** Multiple LCR forms (1A / 2A / 3A) in one supplemental — order is 1A then 2A then 3A. */
  lcrFormsIncluded: [],
  lcrFormsData: {},
  /** Which LCR form the LCR section is editing (must be in `lcrFormsIncluded` when non-empty). */
  lcrActiveFormType: '1A',
  /** manual = type LCR in LCR section; other modules = optional prefill from saved records. */
  lcrSource: 'manual', // 'manual' | 'ausf' | 'courtDecree' | 'legitimation'
  lcrSourceId: '',
  lcrPrefillLabel: '',
  /** When true, affidavit print/PDF shows the City Civil Registrar signatory block under the jurat. */
  affidavitShowCcrSignatory: true,
  ...getDefaultSupplementalTransmittalFields(),
}

export default function SupplementalForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState(() => {
    const loaded = getSupplementalDraft(defaultSupplementalDraft)
    return { ...loaded, ...pickTransmittalStateFromDraft(loaded) }
  })
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('affidavit')
  const activeSavedId = getActiveSupplementalId()
  const affiantNameInputRef = useRef(null)
  const [lcrSearchQuery, setLcrSearchQuery] = useState('')
  const [lcrSearchFocused, setLcrSearchFocused] = useState(false)
  const [showSupplementTypeSuggestions, setShowSupplementTypeSuggestions] = useState(false)
  const [supplementTypeSuggestionIndex, setSupplementTypeSuggestionIndex] = useState(-1)
  const [savedSupplementTypes, setSavedSupplementTypes] = useState([])

  const [dirtyBaselineTick, setDirtyBaselineTick] = useState(0)
  useEffect(() => {
    const id = setTimeout(() => setDirtyBaselineTick((x) => x + 1), 120)
    return () => clearTimeout(id)
  }, [location.key, activeSavedId])

  const acknowledgeSaved = useWarnIfUnsaved(form, [location.key, activeSavedId, dirtyBaselineTick])

  const lcrBundle = useMemo(() => getSupplementalLcrBundleFromDraft(form), [
    form.lcrFormsIncluded,
    form.lcrFormsData,
    form.includeForm1a,
    form.lcrType,
    form.lcrData,
  ])
  const hasLcrForms = lcrBundle.included.length > 0
  const activeLcrType = useMemo(() => {
    const t = form.lcrActiveFormType || '1A'
    if (lcrBundle.included.includes(t)) return t
    return lcrBundle.included[0] || '1A'
  }, [lcrBundle.included, form.lcrActiveFormType])

  const setActiveLcrFormType = (t) => {
    setForm((prev) => {
      const b = getSupplementalLcrBundleFromDraft(prev)
      if (!b.included.includes(t)) return prev
      const next = { ...prev, lcrActiveFormType: t }
      saveSupplementalDraft(next)
      return next
    })
  }

  const lcrRecords = useMemo(() => {
    if (form.lcrSource === 'manual') return []
    const sources = {
      ausf: { list: getSavedAUSFList(), draft: getAUSFDraft() },
      courtDecree: { list: getSavedCourtDecreeList(), draft: getCourtDecreeDraft() },
      legitimation: { list: getSavedLegitimationList(), draft: getLegitimationDraft() },
    }
    const key = form.lcrSource === 'ausf' || form.lcrSource === 'legitimation' ? form.lcrSource : 'courtDecree'
    const { list, draft } = sources[key]
    const rows = []
    if (draft && typeof draft === 'object' && recordHasLcrType(draft, activeLcrType)) {
      rows.push({ id: '__draft__', label: '[Current draft]', data: draft })
    }
    list.forEach((r) => {
      if (r?.data && recordHasLcrType(r.data, activeLcrType)) {
        rows.push({ id: r.id, label: r.label || r.id, data: r.data })
      }
    })
    return rows
  }, [form.lcrSource, activeLcrType])

  const filteredLcrRecords = useMemo(() => {
    const q = lcrSearchQuery.trim().toLowerCase()
    if (!q) return lcrRecords
    return lcrRecords.filter((r) => String(r.label || '').toLowerCase().includes(q))
  }, [lcrRecords, lcrSearchQuery])

  const lcrInlineFormData = useMemo(() => {
    const bundle = getSupplementalLcrBundleFromDraft(form)
    const t =
      bundle.included.includes(form.lcrActiveFormType) ? form.lcrActiveFormType : bundle.included[0] || '1A'
    const base = t === '1A' ? defaultLegitimation : defaultCourtDecree
    const slice = bundle.formsData[t] && typeof bundle.formsData[t] === 'object' ? bundle.formsData[t] : {}
    return mergeLcrRemarksFontSizePt({ ...base, ...slice }, form)
  }, [
    form.lcrRemarksFontSizePt,
    form.lcrFormsIncluded,
    form.lcrFormsData,
    form.lcrActiveFormType,
    form.includeForm1a,
    form.lcrType,
    form.lcrData,
  ])

  useEffect(() => {
    const loaded = getSupplementalDraft(defaultSupplementalDraft)
    const next = { ...loaded, ...pickTransmittalStateFromDraft(loaded) }
    const bundle = getSupplementalLcrBundleFromDraft(next)
    const hasMulti = Array.isArray(next.lcrFormsIncluded) && next.lcrFormsIncluded.length > 0
    const normalized =
      bundle.included.length > 0 && !hasMulti
        ? {
            ...next,
            ...persistLcrBundleToDraftShape(bundle.included, bundle.formsData),
            lcrActiveFormType: next.lcrActiveFormType || bundle.included[0],
          }
        : {
            ...next,
            lcrActiveFormType:
              bundle.included.includes(next.lcrActiveFormType) ? next.lcrActiveFormType : bundle.included[0] || next.lcrActiveFormType || '1A',
          }
    saveSupplementalDraft(normalized)
    setForm(normalized)
  }, [location.key])

  useEffect(() => {
    const bundle = getSupplementalLcrBundleFromDraft(form)
    if (bundle.included.length === 0 && activeSection === 'lcr') {
      setActiveSection('affidavit')
    }
  }, [form, activeSection])

  const handleBackToSaved = () => {
    saveSupplementalDraft(form)
    afterUnsavedAcknowledge(acknowledgeSaved, () => navigate('/legal-instrument/supplemental/saved'))
  }

  const update = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      saveSupplementalDraft(next)
      return next
    })
  }

  const saveSupplementTypeToList = useCallback((raw) => {
    const current = String(raw || '').trim()
    if (!isLikelySupplementType(current)) return
    setSavedSupplementTypes((prev) => {
      if (prev.some((t) => String(t).trim().toUpperCase() === current.toUpperCase())) return prev
      const next = [current, ...prev].slice(0, 40)
      localStorage.setItem(SUPPLEMENT_TYPE_LIST_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const mergedSupplementTypeRows = useMemo(() => {
    const seen = new Set()
    const out = []
    for (const row of SUPPLEMENT_TYPE_BUILTIN) {
      seen.add(String(row.value).toLowerCase())
      out.push({ value: row.value, label: row.label })
    }
    for (const s of savedSupplementTypes) {
      const v = String(s || '').trim()
      if (!isLikelySupplementType(v)) continue
      const k = v.toLowerCase()
      if (seen.has(k)) continue
      seen.add(k)
      out.push({ value: v, label: v })
    }
    return out
  }, [savedSupplementTypes])

  const filteredSupplementTypeRows = useMemo(() => {
    const q = String(form.supplementType || '').trim().toUpperCase()
    const base = mergedSupplementTypeRows
    if (!q) return base.slice(0, 12)
    return base
      .filter(
        (row) =>
          String(row.label).toUpperCase().includes(q) || String(row.value).toUpperCase().includes(q)
      )
      .slice(0, 12)
  }, [mergedSupplementTypeRows, form.supplementType])

  const chooseSupplementType = (value) => {
    update('supplementType', value)
    saveSupplementTypeToList(value)
    setShowSupplementTypeSuggestions(false)
    setSupplementTypeSuggestionIndex(-1)
  }

  useEffect(() => {
    try {
      const rawList = localStorage.getItem(SUPPLEMENT_TYPE_LIST_KEY)
      const parsed = rawList ? JSON.parse(rawList) : []
      if (Array.isArray(parsed)) {
        const cleaned = parsed
          .map((v) => String(v || '').trim())
          .filter((v) => isLikelySupplementType(v))
          .filter((v, i, arr) => arr.findIndex((x) => x.toUpperCase() === v.toUpperCase()) === i)
        localStorage.setItem(SUPPLEMENT_TYPE_LIST_KEY, JSON.stringify(cleaned))
        setSavedSupplementTypes(cleaned)
      } else {
        setSavedSupplementTypes([])
      }
    } catch {
      setSavedSupplementTypes([])
    }
  }, [])

  /** Remember custom supplement types while typing (draft already saves via `update`). */
  useEffect(() => {
    const v = String(form.supplementType || '').trim()
    if (!isLikelySupplementType(v)) return undefined
    const id = window.setTimeout(() => saveSupplementTypeToList(v), 400)
    return () => window.clearTimeout(id)
  }, [form.supplementType, saveSupplementTypeToList])

  const updateTransmittalPatch = (patch) => {
    setForm((prev) => {
      const next = { ...prev, ...patch }
      saveSupplementalDraft(next)
      return next
    })
  }

  const setColbSubject = (value) => {
    setForm((prev) => {
      const next = { ...prev, colbSubject: value }
      if (value === 'self') next.possessive = 'my'
      saveSupplementalDraft(next)
      return next
    })
  }

  const handleSave = () => {
    saveSupplementalDraft(form)
    saveOrUpdateSupplemental(form)
    acknowledgeSaved()
    setConfirmOpen(true)
  }

  const handleEnableLcr = (type) => {
    setForm((prev) => {
      const bundle = getSupplementalLcrBundleFromDraft(prev)
      if (bundle.included.includes(type)) {
        const next = { ...prev, lcrActiveFormType: type }
        saveSupplementalDraft(next)
        return next
      }
      let newData = type === '1A' ? { ...defaultLegitimation } : { ...defaultCourtDecree }
      if (prev.lcrSourceId && prev.lcrSource && prev.lcrSource !== 'manual') {
        const sources = {
          ausf: { list: getSavedAUSFList(), draft: getAUSFDraft() },
          courtDecree: { list: getSavedCourtDecreeList(), draft: getCourtDecreeDraft() },
          legitimation: { list: getSavedLegitimationList(), draft: getLegitimationDraft() },
        }
        const key = prev.lcrSource === 'ausf' || prev.lcrSource === 'legitimation' ? prev.lcrSource : 'courtDecree'
        const { list, draft } = sources[key]
        const rows = []
        if (draft && typeof draft === 'object') rows.push({ id: '__draft__', label: '[Current draft]', data: draft })
        list.forEach((r) => {
          if (r?.data) rows.push({ id: r.id, label: r.label || r.id, data: r.data })
        })
        const rec = rows.find((r) => r.id === prev.lcrSourceId)
        if (rec) newData = mapSourceToSupplementalLcrData(prev.lcrSource, rec.data, type)
      }
      const nextIncluded = [...bundle.included, type].sort(
        (a, b) => SUPPLEMENTAL_LCR_FORM_TYPES.indexOf(a) - SUPPLEMENTAL_LCR_FORM_TYPES.indexOf(b),
      )
      const nextForms = { ...bundle.formsData, [type]: newData }
      const next = {
        ...prev,
        ...persistLcrBundleToDraftShape(nextIncluded, nextForms),
        lcrActiveFormType: type,
        ...(prev.lcrSourceId ? {} : { lcrSourceId: '', lcrPrefillLabel: '' }),
      }
      saveSupplementalDraft(next)
      return next
    })
    setActiveSection('lcr')
  }

  const handleRemoveLcr = () => {
    setForm((prev) => {
      const next = {
        ...prev,
        lcrFormsIncluded: [],
        lcrFormsData: {},
        includeForm1a: false,
        lcrType: '1A',
        lcrData: { ...defaultLegitimation },
        lcrActiveFormType: '1A',
        lcrSourceId: '',
        lcrPrefillLabel: '',
      }
      saveSupplementalDraft(next)
      return next
    })
    setLcrSearchQuery('')
    setActiveSection('affidavit')
  }

  const handleRemoveOneLcr = (type) => {
    setForm((prev) => {
      const bundle = getSupplementalLcrBundleFromDraft(prev)
      const nextIncluded = bundle.included.filter((x) => x !== type)
      if (nextIncluded.length === 0) {
        queueMicrotask(() => setLcrSearchQuery(''))
      }
      const nextForms = { ...bundle.formsData }
      delete nextForms[type]
      const nextActive =
        prev.lcrActiveFormType === type
          ? nextIncluded[0] || '1A'
          : bundle.included.includes(prev.lcrActiveFormType)
            ? prev.lcrActiveFormType
            : nextIncluded[0] || '1A'
      const next = {
        ...prev,
        ...persistLcrBundleToDraftShape(nextIncluded, nextForms),
        lcrActiveFormType: nextActive,
      }
      saveSupplementalDraft(next)
      return next
    })
  }

  const handleLcrSourceChange = (src) => {
    setForm((prev) => {
      const next = { ...prev, lcrSource: src, lcrSourceId: '', lcrPrefillLabel: '' }
      saveSupplementalDraft(next)
      return next
    })
    setLcrSearchQuery('')
  }

  const handleSelectLcrRecord = (record) => {
    if (form.lcrSource === 'manual') return
    setForm((prev) => {
      const bundle = getSupplementalLcrBundleFromDraft(prev)
      const t =
        bundle.included.includes(prev.lcrActiveFormType) ? prev.lcrActiveFormType : bundle.included[0] || '1A'
      const mapped = mapSourceToSupplementalLcrData(prev.lcrSource, record.data, t)
      const nextForms = { ...bundle.formsData, [t]: mapped }
      const next = {
        ...prev,
        ...persistLcrBundleToDraftShape(bundle.included, nextForms),
        lcrSourceId: record.id,
        lcrPrefillLabel: record.label || '',
      }
      saveSupplementalDraft(next)
      return next
    })
    setLcrSearchFocused(false)
    setLcrSearchQuery(record.label || '')
  }

  const handleLcrInlineDataChange = (next) => {
    setForm((prev) => {
      const bundle = getSupplementalLcrBundleFromDraft(prev)
      const t =
        bundle.included.includes(prev.lcrActiveFormType) ? prev.lcrActiveFormType : bundle.included[0] || '1A'
      const prior = bundle.formsData[t] && typeof bundle.formsData[t] === 'object' ? bundle.formsData[t] : {}
      const nextSlice = next && typeof next === 'object' ? next : prior
      const nextForms = { ...bundle.formsData, [t]: nextSlice }
      const merged = { ...prev, ...persistLcrBundleToDraftShape(bundle.included, nextForms) }
      saveSupplementalDraft(merged)
      return merged
    })
  }

  /** Merge partial LCR fields for the active form so rapid typing does not drop characters. */
  const patchLcrInlineData = useCallback((partial) => {
    if (!partial || typeof partial !== 'object') return
    setForm((prev) => {
      const bundle = getSupplementalLcrBundleFromDraft(prev)
      const t =
        bundle.included.includes(prev.lcrActiveFormType) ? prev.lcrActiveFormType : bundle.included[0] || '1A'
      const base = bundle.formsData[t] && typeof bundle.formsData[t] === 'object' ? bundle.formsData[t] : {}
      const nextForms = { ...bundle.formsData, [t]: { ...base, ...partial } }
      const merged = { ...prev, ...persistLcrBundleToDraftShape(bundle.included, nextForms) }
      saveSupplementalDraft(merged)
      return merged
    })
  }, [])

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white'
  const supplementAffidavitType = useMemo(
    () => resolveSupplementalAffidavitType(form.supplementType),
    [form.supplementType]
  )
  const showItem1ChoiceBlock =
    supplementAffidavitType.kind === 'sex' || supplementAffidavitType.kind === 'custom'
  const { missing: missingLabel, corrected: correctedLabel } = useMemo(
    () => getSupplementalMissingCorrectedLabels(form.supplementType),
    [form.supplementType],
  )

  return (
    <div className="supplemental-form-page no-print">
      <div className="legitimation-form-page__card">
        <header className="legitimation-form-page__header no-print">
          <h1>Supplemental Report Automated Data Entry Form</h1>
          <p>Unified Legal Status Automated Data Entry System — Iligan City</p>
        </header>
        <FormBodyFieldShortcuts className="legitimation-form-page__body supplemental-form-page-content" onKeyDown={handleEnterFocusNextField}>
          <p className="text-sm text-gray-600 mb-5">
            Fill out this form to generate the Affidavit for Supplemental Report output.
          </p>
          {activeSavedId ? (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              You are editing a saved supplemental file. Your entries stay in this form and in the draft until you save.
              Use <span className="font-medium">Back to saved files</span> to return to the list (unsaved typing is kept in the draft).
              Use <span className="font-medium">New Supplemental</span> on the saved list to start a blank form.
            </div>
          ) : null}

          <div className="legitimation-form-page__section">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
              <aside className="w-full lg:w-56 shrink-0 lg:sticky lg:top-6 flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Form Sections</p>
                <button
                  type="button"
                  onClick={() => setActiveSection('affidavit')}
                  className={`w-full text-left rounded-xl border-2 px-4 py-3.5 shadow-sm transition-all ${activeSection === 'affidavit'
                    ? 'border-[var(--primary-blue)] bg-[var(--primary-blue)]/5 ring-1 ring-[var(--primary-blue)]/20'
                    : 'border-transparent bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <span className={`block text-sm font-bold ${activeSection === 'affidavit' ? 'text-[var(--primary-blue)]' : 'text-gray-900'}`}>
                    Affidavit (Supplemental)
                  </span>
                  <span className="block text-xs text-gray-600 mt-1 leading-snug">
                    Main affidavit form for the supplemental report
                  </span>
                </button>
                {!hasLcrForms ? (
                  <div className="flex flex-col gap-2 p-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Add LCR Form</p>
                    <p className="text-[10px] text-slate-500 leading-snug px-1 mb-0.5">
                      Pick a form, then use the <span className="font-semibold text-slate-600">LCR</span> section (same row as Transmittal) for manual entry or prefill. You can add more forms (1A, 2A, 3A) later from the sidebar.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleEnableLcr('1A')}
                      className="w-full text-left rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm hover:border-[var(--primary-blue)] hover:bg-slate-50 transition-all group"
                    >
                      <span className="block text-xs font-bold text-slate-700 group-hover:text-[var(--primary-blue)]">Form 1A (Birth)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEnableLcr('2A')}
                      className="w-full text-left rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm hover:border-[var(--primary-blue)] hover:bg-slate-50 transition-all group"
                    >
                      <span className="block text-xs font-bold text-slate-700 group-hover:text-[var(--primary-blue)]">Form 2A (Death)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEnableLcr('3A')}
                      className="w-full text-left rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm hover:border-[var(--primary-blue)] hover:bg-slate-50 transition-all group"
                    >
                      <span className="block text-xs font-bold text-slate-700 group-hover:text-[var(--primary-blue)]">Form 3A (Marriage)</span>
                    </button>
                  </div>
                ) : null}

                {hasLcrForms ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveSection('lcr')}
                      className={`w-full text-left rounded-xl border-2 px-4 py-3.5 shadow-sm transition-all ${activeSection === 'lcr'
                        ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/20'
                        : 'border-transparent bg-white hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                      <span className={`block text-sm font-bold ${activeSection === 'lcr' ? 'text-emerald-800' : 'text-gray-900'}`}>
                        LCR forms{lcrBundle.included.length > 1 ? '' : ` (${activeLcrType})`}
                      </span>
                      <span className="block text-xs text-gray-600 mt-1 leading-snug">
                        {lcrBundle.included.join(' · ')}
                        {lcrBundle.included.length > 1 ? ` — editing ${activeLcrType}` : ''}
                        {' · '}
                        {form.lcrSource === 'manual' ? 'Manual or prefill from a module' : 'Prefill from module or edit manually'}
                      </span>
                    </button>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-0.5">Switch form</span>
                      <div className="grid grid-cols-3 gap-1">
                        {lcrBundle.included.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setActiveLcrFormType(t)}
                            className={`py-1.5 text-[11px] font-bold rounded border transition-all ${activeLcrType === t
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                              }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      {SUPPLEMENTAL_LCR_FORM_TYPES.some((t) => !lcrBundle.included.includes(t)) ? (
                        <>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-0.5 mt-1">Add another form</span>
                          <div className="grid grid-cols-3 gap-1">
                            {SUPPLEMENTAL_LCR_FORM_TYPES.filter((t) => !lcrBundle.included.includes(t)).map((t) => (
                              <button
                                key={`add-${t}`}
                                type="button"
                                onClick={() => handleEnableLcr(t)}
                                className="py-1.5 text-[11px] font-bold rounded border border-dashed border-gray-300 bg-white text-gray-600 hover:border-emerald-400 hover:text-emerald-800 transition-all"
                              >
                                +{t}
                              </button>
                            ))}
                          </div>
                        </>
                      ) : null}
                      {lcrBundle.included.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveOneLcr(activeLcrType)}
                          className="w-full rounded-lg px-2 py-1.5 text-[11px] font-semibold text-red-700 border border-red-200 bg-white hover:bg-red-50 transition-colors"
                        >
                          Remove form {activeLcrType}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleRemoveLcr}
                        className="w-full rounded-lg px-2 py-1.5 text-[11px] font-semibold text-red-700 border border-red-200 bg-white hover:bg-red-50 transition-colors"
                      >
                        Remove all LCR forms
                      </button>
                    </div>
                  </>
                ) : null}

                <button
                  type="button"
                  onClick={() => setActiveSection('transmittal')}
                  className={`w-full text-left rounded-xl border-2 px-4 py-3.5 shadow-sm transition-all ${activeSection === 'transmittal'
                    ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500/20'
                    : 'border-transparent bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <span className={`block text-sm font-bold ${activeSection === 'transmittal' ? 'text-amber-700' : 'text-gray-900'}`}>
                    Transmittal (CCR letter)
                  </span>
                  <span className="block text-xs text-gray-600 mt-1 leading-snug">
                    Edit the transmittal letter for this report
                  </span>
                </button>

              </aside>

              <div className="flex-1 min-w-0">
                {activeSection === 'affidavit' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Supplement type</label>
                      <div className="relative">
                        <input
                          type="text"
                          className={`${inputClass} pr-10`}
                          value={form.supplementType ?? ''}
                          placeholder="e.g. geographical, sex, middleName, or your own description"
                          onChange={(e) => {
                            update('supplementType', e.target.value)
                            setShowSupplementTypeSuggestions(true)
                            setSupplementTypeSuggestionIndex(-1)
                          }}
                          onFocus={() => setShowSupplementTypeSuggestions(true)}
                          onBlur={(e) => {
                            const v = String(e.target.value || '').trim()
                            saveSupplementTypeToList(v)
                            if (!v) update('supplementType', 'geographical')
                            setTimeout(() => setShowSupplementTypeSuggestions(false), 120)
                          }}
                          onKeyDown={(e) => {
                            if (!showSupplementTypeSuggestions || filteredSupplementTypeRows.length === 0) return
                            if (e.key === 'ArrowDown') {
                              e.preventDefault()
                              setSupplementTypeSuggestionIndex((prev) => (prev + 1) % filteredSupplementTypeRows.length)
                              return
                            }
                            if (e.key === 'ArrowUp') {
                              e.preventDefault()
                              setSupplementTypeSuggestionIndex((prev) =>
                                prev <= 0 ? filteredSupplementTypeRows.length - 1 : prev - 1
                              )
                              return
                            }
                            if (e.key === 'Enter' && supplementTypeSuggestionIndex >= 0) {
                              e.preventDefault()
                              e.stopPropagation()
                              chooseSupplementType(filteredSupplementTypeRows[supplementTypeSuggestionIndex].value)
                              return
                            }
                            if (e.key === 'Escape') {
                              setShowSupplementTypeSuggestions(false)
                              setSupplementTypeSuggestionIndex(-1)
                            }
                          }}
                          aria-autocomplete="list"
                          aria-expanded={showSupplementTypeSuggestions && filteredSupplementTypeRows.length > 0}
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden>
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 11.166l3.71-3.935a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        {showSupplementTypeSuggestions && filteredSupplementTypeRows.length > 0 && (
                          <div className="absolute z-50 mt-1 w-full rounded-xl border border-indigo-100 bg-white shadow-[0_10px_30px_rgba(79,70,229,0.18)] overflow-hidden">
                            {filteredSupplementTypeRows.map((row, idx) => (
                              <button
                                key={`${row.value}-${idx}`}
                                type="button"
                                onMouseDown={(ev) => ev.preventDefault()}
                                onClick={() => chooseSupplementType(row.value)}
                                className={`w-full px-3 py-2 text-left text-sm transition ${idx === supplementTypeSuggestionIndex
                                  ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white'
                                  : 'text-gray-800 hover:bg-indigo-50'
                                  }`}
                              >
                                <span className="font-medium">{row.label}</span>
                                {String(row.label) !== String(row.value) ? (
                                  <span className={`block text-xs mt-0.5 ${idx === supplementTypeSuggestionIndex ? 'text-white/90' : 'text-gray-500'}`}>
                                    {row.value}
                                  </span>
                                ) : null}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Built-in types (<span className="font-mono">geographical</span>, <span className="font-mono">sex</span>,{' '}
                        <span className="font-mono">middleName</span>) keep fixed affidavit wording. Any other description updates the missing / corrected field labels below and items 3 &amp; 5 on the affidavit output. Types are saved automatically as you type.
                      </p>
                    </div>

                    <div className="md:col-span-2 rounded-lg border border-gray-200 bg-gray-50/90 px-3 py-2.5">
                      <label className="inline-flex items-start gap-2.5 cursor-pointer text-sm text-gray-800">
                        <input
                          type="checkbox"
                          className="mt-0.5 rounded border-gray-300 text-[var(--primary-blue)] focus:ring-[var(--primary-blue)]"
                          checked={form.affidavitShowCcrSignatory !== false}
                          onChange={(e) => update('affidavitShowCcrSignatory', e.target.checked)}
                        />
                        <span>
                          <span className="font-medium">Show City Civil Registrar signatory on affidavit (print/PDF)</span>
                          <span className="block text-xs text-gray-600 mt-0.5 leading-snug">
                            Always ATTY. YUSSIF DON JUSTIN F. MARTIL, REB and CITY CIVIL REGISTRAR below the jurat when checked
                            (separate from <span className="font-medium">Prepared / signed by</span> on the transmittal). Uncheck to omit; check again to restore.
                          </span>
                        </span>
                      </label>
                    </div>

                    <div><label className="block text-sm font-medium mb-1">REG. NO.</label><input className={inputClass} value={form.regNo} onChange={(e) => update('regNo', e.target.value)} placeholder="e.g. 2380-67" /></div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Certificate belongs to</label>
                      <select className={inputClass} value={form.possessive} onChange={(e) => update('possessive', e.target.value)}>
                        <option value="my">my</option>
                        <option value="his">his</option>
                        <option value="her">her</option>
                      </select>
                    </div>
                    <div><label className="block text-sm font-medium mb-1">City Line</label><input className={inputClass} value={form.cityLine} onChange={(e) => update('cityLine', e.target.value)} placeholder="e.g. GENERAL SANTOS CITY" /></div>
                    <div><label className="block text-sm font-medium mb-1">Affiant Name</label><input ref={affiantNameInputRef} className={inputClass} value={form.affiantName} onChange={(e) => update('affiantName', e.target.value)} /></div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Civil Status</label>
                      <select className={inputClass} value={form.civilStatus || 'single'} onChange={(e) => update('civilStatus', e.target.value)}>
                        <option value="married">married</option>
                        <option value="single">single</option>
                        <option value="widower">widower</option>
                        <option value="widow">widow</option>
                        <option value="divorced">divorced</option>
                      </select>
                    </div>
                    <div><label className="block text-sm font-medium mb-1">Residence Address</label><input className={inputClass} value={form.residenceAddress} onChange={(e) => update('residenceAddress', e.target.value)} /></div>
                    {showItem1ChoiceBlock && (
                      <div className="md:col-span-2">
                        <span className="block text-sm font-medium mb-1">Item 1 — Supplemental Report applies to</span>
                        <div className="flex flex-wrap gap-6">
                          <label className="inline-flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                            <input
                              type="radio"
                              name="colbSubject"
                              className="border-gray-400"
                              checked={form.colbSubject !== 'other'}
                              onChange={() => setColbSubject('self')}
                            />
                            My Certificate of Live Birth (option A)
                          </label>
                          <label className="inline-flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                            <input
                              type="radio"
                              name="colbSubject"
                              className="border-gray-400"
                              checked={form.colbSubject === 'other'}
                              onChange={() => setColbSubject('other')}
                            />
                            Someone else&apos;s — &quot;the Certificate of Live Birth of…&quot; (option B)
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          For items 2–6, set <strong className="font-medium">Certificate belongs to</strong> to <em className="not-italic">my</em>, <em className="not-italic">his</em>, or <em className="not-italic">her</em> to match whose COLB is being supplemented.
                        </p>
                      </div>
                    )}
                    {showItem1ChoiceBlock && form.colbSubject === 'other' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Name on the certificate (item 1, option B)</label>
                        <input className={inputClass} value={form.subjectColbName} onChange={(e) => update('subjectColbName', e.target.value)} placeholder="e.g. JOSE MARIA LEGASPI ACHA JR." />
                      </div>
                    )}
                    <div><label className="block text-sm font-medium mb-1">Place of registration (item 1)</label><input className={inputClass} value={form.registeredAt} onChange={(e) => update('registeredAt', e.target.value)} placeholder="e.g. ILIGAN CITY, LANAO DEL NORTE" /></div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Date of registration (item 1)</label>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          inputMode="text"
                          autoComplete="off"
                          className={inputClass}
                          value={form.regMonth || ''}
                          onChange={(e) => update('regMonth', e.target.value)}
                          onBlur={() => {
                            const raw = String(form.regMonth || '').trim()
                            if (!raw) {
                              update('regMonth', '')
                              return
                            }
                            const n = parseFormMonthInputToNumber1to12(raw)
                            if (n) update('regMonth', n)
                          }}
                          placeholder="Month (1–12 or e.g. May)"
                        />
                        <input
                          type="number"
                          min="1"
                          max="31"
                          className={inputClass}
                          value={form.regDay || ''}
                          onChange={(e) => update('regDay', e.target.value)}
                          placeholder="Day"
                        />
                        <input
                          type="number"
                          min="1900"
                          max="9999"
                          className={inputClass}
                          value={form.regYear || ''}
                          onChange={(e) => update('regYear', e.target.value)}
                          placeholder="Year"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Output format: MONTH DAY, YEAR</p>
                    </div>
                    <div><label className="block text-sm font-medium mb-1">{missingLabel}</label><input className={inputClass} value={form.missingGeo} onChange={(e) => update('missingGeo', e.target.value)} /></div>
                    <div><label className="block text-sm font-medium mb-1">{correctedLabel}</label><input className={inputClass} value={form.correctedGeo} onChange={(e) => update('correctedGeo', e.target.value)} /></div>
                    {hasLcrForms ? (
                      <div className="md:col-span-2 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-sm text-emerald-900">
                        {lcrBundle.included.length > 1 ? (
                          <>
                            <span className="font-semibold">LCR forms {lcrBundle.included.join(', ')}</span> are included. Open{' '}
                            <span className="font-bold">LCR forms</span> in the sidebar to switch which form you are editing; print/PDF will include every form you added.
                          </>
                        ) : (
                          <>
                            <span className="font-semibold">LCR Form {activeLcrType}</span> is included. Use the sidebar button{' '}
                            <span className="font-bold">LCR forms ({activeLcrType})</span> (above Transmittal) to enter or edit LCR fields manually or to prefill from a module.
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : activeSection === 'lcr' && hasLcrForms ? (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                    <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-base font-bold text-emerald-900">
                          LCR Form {activeLcrType}
                          {lcrBundle.included.length > 1 ? ` (${lcrBundle.included.length} forms in this file)` : ''}
                          {form.lcrSource === 'manual' ? ' — manual entry' : ' — prefill from module'}
                        </h2>
                        {form.lcrSource !== 'manual' && form.lcrPrefillLabel ? (
                          <span className="text-[11px] font-medium text-emerald-800 truncate max-w-[14rem]" title={form.lcrPrefillLabel}>
                            Prefilled: {form.lcrPrefillLabel}
                          </span>
                        ) : null}
                      </div>
                      <div
                        className={
                          form.lcrSource === 'manual'
                            ? 'grid grid-cols-1 gap-3'
                            : 'grid grid-cols-1 md:grid-cols-2 gap-3'
                        }
                      >
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">Source module</label>
                          <select
                            className={inputClass}
                            value={
                              form.lcrSource === 'ausf' || form.lcrSource === 'legitimation'
                                ? form.lcrSource
                                : form.lcrSource === 'manual'
                                  ? 'manual'
                                  : 'courtDecree'
                            }
                            onChange={(e) => handleLcrSourceChange(e.target.value)}
                          >
                            <option value="manual">Manual entry (type LCR below)</option>
                            <option value="ausf">AUSF</option>
                            <option value="courtDecree">Court Decree</option>
                            <option value="legitimation">Legitimation</option>
                          </select>
                        </div>
                        {form.lcrSource === 'manual' ? (
                          <div className="rounded-lg border border-emerald-200/80 bg-white/70 px-3 py-2.5">
                            <p className="text-[11px] text-gray-700 leading-snug">
                              All LCR fields are entered manually in the form below. Use <span className="font-semibold">Save</span> to keep them with this supplemental. Choose another source above if you want to copy from a saved record first.
                            </p>
                          </div>
                        ) : (
                          <div className="relative">
                            <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">Prefill from record</label>
                            <input
                              type="text"
                              className={`${inputClass} pr-8`}
                              placeholder="Search; click a row to load LCR fields"
                              value={lcrSearchQuery}
                              onChange={(e) => setLcrSearchQuery(e.target.value)}
                              onFocus={() => setLcrSearchFocused(true)}
                              onBlur={() => window.setTimeout(() => setLcrSearchFocused(false), 200)}
                            />
                            {lcrSearchQuery ? (
                              <button
                                type="button"
                                className="absolute right-2 top-[1.85rem] text-gray-400 hover:text-gray-600"
                                aria-label="Clear search"
                                onClick={() => setLcrSearchQuery('')}
                              >
                                ×
                              </button>
                            ) : null}
                            {lcrSearchFocused ? (
                              <ul
                                className="absolute z-30 left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
                                role="listbox"
                              >
                                {filteredLcrRecords.length === 0 ? (
                                  <li className="px-3 py-2 text-xs text-gray-500">No records match.</li>
                                ) : (
                                  filteredLcrRecords.map((r) => (
                                    <li key={r.id} className="border-b border-gray-100 last:border-0">
                                      <button
                                        type="button"
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleSelectLcrRecord(r)}
                                      >
                                        <span className="font-medium text-gray-900 block truncate">{r.label}</span>
                                        {r.id === '__draft__' ? (
                                          <span className="text-[10px] font-bold text-emerald-600 uppercase">Draft</span>
                                        ) : null}
                                      </button>
                                    </li>
                                  ))
                                )}
                              </ul>
                            ) : null}
                          </div>
                        )}
                      </div>
                      {form.lcrSource === 'manual' ? null : (form.lcrSource === 'ausf' || form.lcrSource === 'legitimation') &&
                        (activeLcrType === '2A' || activeLcrType === '3A') ? (
                        <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
                          Form {activeLcrType} is only fully prefilled from <strong className="font-semibold">Court Decree</strong>. With AUSF or Legitimation,
                          shared header fields are copied and the table may start mostly blank — edit every field below or on Print.
                        </p>
                      ) : (
                        <p className="text-[11px] text-gray-600 leading-snug">
                          Choosing a row copies that record into this supplemental&apos;s LCR data (your originals are not changed). You can still edit every field below.
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden ring-1 ring-slate-100">
                      <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/95">
                        <p className="text-xs font-bold text-slate-800">LCR Form {activeLcrType} — fill out here</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                          Same layout as Continue to Print. Scroll if needed; use Save to keep entries.
                        </p>
                      </div>
                      <div className="px-2 sm:px-3 pt-2 sm:pt-3 space-y-3">
                        <LcrRemarksFontSizeSelect
                          id="supplemental-form-lcr-remarks-font"
                          value={form.lcrRemarksFontSizePt}
                          onChange={(v) => update('lcrRemarksFontSizePt', v)}
                          helpText="Applies to the REMARKS block on this LCR form in preview and print/PDF."
                        />
                        <SupplementalLcrFooterSignatoryPickers
                          lcrData={lcrInlineFormData}
                          inputClass={inputClass}
                          onPatch={patchLcrInlineData}
                        />
                      </div>
                      <div className="max-h-[min(78vh,900px)] overflow-y-auto overflow-x-auto p-2 sm:p-3 bg-slate-50/40">
                        {activeLcrType === '1A' ? (
                          <LcrForm1ABirthAvailable
                            data={lcrInlineFormData}
                            editableTable
                            onDataChange={handleLcrInlineDataChange}
                          />
                        ) : null}
                        {activeLcrType === '2A' ? (
                          <LcrForm2ADeathAvailable
                            data={lcrInlineFormData}
                            editableTable
                            onDataChange={handleLcrInlineDataChange}
                          />
                        ) : null}
                        {activeLcrType === '3A' ? (
                          <LcrForm3AMarriageAvailable
                            data={lcrInlineFormData}
                            editableTable
                            onDataChange={handleLcrInlineDataChange}
                          />
                        ) : null}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-center">
                      <button
                        type="button"
                        onClick={() => setActiveSection('affidavit')}
                        className="text-emerald-800 font-bold hover:underline mr-4"
                      >
                        Return to Affidavit
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection('transmittal')}
                        className="text-amber-700 font-bold hover:underline"
                      >
                        Open Transmittal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <SupplementalTransmittalFieldsEditor data={form}
                      onPatch={updateTransmittalPatch}
                      inputClass={inputClass}
                    />
                    <div className="mt-8 p-4 rounded-xl bg-amber-50 border border-amber-200 text-center flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                      <button
                        type="button"
                        onClick={() => setActiveSection('affidavit')}
                        className="text-amber-700 font-bold hover:underline"
                      >
                        Return to Affidavit Form
                      </button>
                      {hasLcrForms ? (
                        <button
                          type="button"
                          onClick={() => setActiveSection('lcr')}
                          className="text-emerald-800 font-bold hover:underline"
                        >
                          Open LCR forms
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="ausf-form-page__actions mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="ausf-form-page__btn ausf-form-page__btn--primary px-4 py-2.5 text-sm font-medium"
            >
              Save
            </button>
            {activeSavedId ? (
              <button
                type="button"
                onClick={handleBackToSaved}
                className="ausf-form-page__btn ausf-form-page__btn--secondary px-4 py-2.5 text-sm font-medium"
              >
                Back to saved files
              </button>
            ) : null}
          </div>

          {confirmOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setConfirmOpen(false)}
              />
              <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-200">
                <div className="p-5">
                  <h3 className="text-base font-semibold text-gray-900">Saved</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {activeSavedId
                      ? 'Your changes have been saved to this supplemental file. Do you want to continue to the print output now?'
                      : 'Your Supplemental Report draft has been saved. Do you want to continue to the print output now?'}
                  </p>
                </div>
                <div className="px-5 pb-5 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmOpen(false)
                      afterUnsavedAcknowledge(acknowledgeSaved, () => navigate('/legal-instrument/supplemental/saved'))
                    }}
                    className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmOpen(false)}
                      className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        saveSupplementalDraft(form)
                        saveOrUpdateSupplemental(form)
                        afterUnsavedAcknowledge(acknowledgeSaved, () =>
                          navigate('/legal-instrument/supplemental/print'),
                        )
                      }}
                      className="px-3 py-2 rounded-lg text-sm font-medium bg-[var(--primary-blue)] text-white hover:bg-[var(--primary-blue-light)]"
                    >
                      Continue to Print
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </FormBodyFieldShortcuts>
      </div>
    </div>
  )
}
