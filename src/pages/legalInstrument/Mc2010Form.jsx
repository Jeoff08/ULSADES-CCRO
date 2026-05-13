import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { afterUnsavedAcknowledge, useWarnIfUnsaved } from '../../hooks/useWarnIfUnsaved'
import { defaultLegitimation } from '../legitimation/lib/legitimationDefaults'
import { defaultCourtDecree } from '../courtDecree/lib/courtDecreeDefaults'
import { getSavedAUSFList, getAUSFDraft } from '../ausf/lib/ausfStorage'
import { getSavedCourtDecreeList, getCourtDecreeDraft } from '../courtDecree/lib/courtDecreeStorage'
import { getSavedLegitimationList, getLegitimationDraft } from '../legitimation/lib/legitimationStorage'
import { mapSourceToSupplementalLcrData } from './lib/supplementalLcrPrefill'
import SupplementalTransmittalFieldsEditor from './SupplementalTransmittalFieldsEditor'
import ManualLcrDataEditor from './ManualLcrDataEditor'
import { getDefaultSupplementalTransmittalFields, pickTransmittalStateFromDraft } from './lib/supplementalTransmittalDefaults'
import {
  clearMc2010Active,
  getActiveMc2010Id,
  getMc2010Draft,
  saveMc2010Draft,
  saveOrUpdateMc2010,
} from './lib/mc2010SavedStorage'
import { deriveAffectedDocumentsForPrint } from '../courtDecree/lib/courtDecreeAffectedDocuments'

function hasValue(v) {
  return String(v ?? '').trim().length > 0
}

function recordHasLcrType(data, lcrType) {
  if (!data || typeof data !== 'object') return false
  if (lcrType === '1A') return hasValue(data.lcr1aNameOfChild) || hasValue(data.colbRegistryNo) || hasValue(data.childFirst)
  if (lcrType === '2A') return hasValue(data.lcr2aNameDeceased) || hasValue(data.lcr2aRegistryNumber)
  if (lcrType === '3A') return hasValue(data.lcr3aHusbandName) || hasValue(data.lcr3aWifeName) || hasValue(data.marriageRegistryNo)
  return true
}

/** Court Decree LCR 1A/3A saves must not appear when prefilling 2A. Other form types (e.g. cert-authenticity) often still hold 2A fields. */
const COURT_DECREE_LCR_NOT_2A_FORM_TYPES = new Set([
  'lcr-form-1a',
  'annotation-form-1a',
  'lcr-form-3a',
  'annotation-form-3a',
])

/** Court Decree death/LCR-2A data may live on lcr2a* fields or (for cert-authenticity etc.) on documentOwnerName + date fields. */
function courtDecreeHas2AFieldsForPrefill(data) {
  if (!data || typeof data !== 'object') return false
  if (recordHasLcrType(data, '2A')) return true
  const ft = String(data.formType || '').trim()
  if (COURT_DECREE_LCR_NOT_2A_FORM_TYPES.has(ft)) return false
  const name =
    hasValue(data.documentOwnerName) ||
    hasValue(data.lcr2aNameDeceased)
  const deathContext =
    hasValue(data.dateOfDeath) ||
    hasValue(data.lcr2aDateDeath) ||
    hasValue(data.lcr2aPlaceDeath) ||
    hasValue(data.placeOfDeath) ||
    hasValue(data.lcr2aCauseDeath) ||
    hasValue(data.causeOfDeath)
  return name && deathContext
}

function courtDecreeRecordEligibleForMc20102A(data) {
  if (!courtDecreeHas2AFieldsForPrefill(data)) return false
  const ft = String(data.formType || '').trim()
  if (COURT_DECREE_LCR_NOT_2A_FORM_TYPES.has(ft)) return false
  if (recordHasLcrType(data, '3A')) return false

  const derived = deriveAffectedDocumentsForPrint(data)
  if (derived.includes('MARRIAGE_CERTIFICATE') || derived.includes('BIRTH_CERTIFICATE')) return false
  if (derived.includes('DEATH_CERTIFICATE')) return true
  return derived.length === 0
}

const defaultMc2010Draft = {
  includeForm1a: true,
  lcrType: '1A',
  lcrData: { ...defaultLegitimation },
  lcrSource: 'courtDecree',
  lcrSourceId: '',
  lcrPrefillLabel: '',
  ...getDefaultSupplementalTransmittalFields(),
  transmittalSalutation: "Sir/Ma'am:",
}

export default function Mc2010Form() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState(() => {
    const loaded = getMc2010Draft(defaultMc2010Draft)
    return { ...loaded, ...pickTransmittalStateFromDraft(loaded) }
  })
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('transmittal')
  const [lcrSearchQuery, setLcrSearchQuery] = useState('')
  const [lcrSearchFocused, setLcrSearchFocused] = useState(false)
  const activeSavedId = getActiveMc2010Id()

  const [dirtyBaselineTick, setDirtyBaselineTick] = useState(0)
  useEffect(() => {
    const id = setTimeout(() => setDirtyBaselineTick((x) => x + 1), 120)
    return () => clearTimeout(id)
  }, [location.key, activeSavedId])

  const acknowledgeSaved = useWarnIfUnsaved(form, [location.key, activeSavedId, dirtyBaselineTick])

  const lcrRecords = useMemo(() => {
    const sources = {
      ausf: { list: getSavedAUSFList(), draft: getAUSFDraft() },
      courtDecree: { list: getSavedCourtDecreeList(), draft: getCourtDecreeDraft() },
      legitimation: { list: getSavedLegitimationList(), draft: getLegitimationDraft() },
    }
    const key = form.lcrSource === 'ausf' || form.lcrSource === 'legitimation' ? form.lcrSource : 'courtDecree'
    const { list, draft } = sources[key]
    const rows = []
    const includeDraft =
      draft && typeof draft === 'object' &&
      (key === 'courtDecree' && form.lcrType === '2A'
        ? courtDecreeRecordEligibleForMc20102A(draft)
        : recordHasLcrType(draft, form.lcrType))
    if (includeDraft) rows.push({ id: '__draft__', label: '[Current draft]', data: draft })
    list.forEach((r) => {
      if (!r?.data) return
      const ok =
        key === 'courtDecree' && form.lcrType === '2A'
          ? courtDecreeRecordEligibleForMc20102A(r.data)
          : recordHasLcrType(r.data, form.lcrType)
      if (ok) rows.push({ id: r.id, label: r.label || r.id, data: r.data })
    })
    return rows
  }, [form.lcrSource, form.lcrType])

  const filteredLcrRecords = useMemo(() => {
    const q = lcrSearchQuery.trim().toLowerCase()
    if (!q) return lcrRecords
    return lcrRecords.filter((r) => String(r.label || '').toLowerCase().includes(q))
  }, [lcrRecords, lcrSearchQuery])

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white'
  const transmittalInputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all'

  const update = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      saveMc2010Draft(next)
      return next
    })
  }

  const updateTransmittalPatch = (patch) => {
    setForm((prev) => {
      const next = { ...prev, ...patch }
      saveMc2010Draft(next)
      return next
    })
  }

  const handleEnableLcr = (type) => {
    setForm((prev) => {
      let lcrData = type === '1A' ? { ...defaultLegitimation } : { ...defaultCourtDecree }
      if (prev.lcrSourceId && prev.lcrSource) {
        const sources = {
          ausf: { list: getSavedAUSFList(), draft: getAUSFDraft() },
          courtDecree: { list: getSavedCourtDecreeList(), draft: getCourtDecreeDraft() },
          legitimation: { list: getSavedLegitimationList(), draft: getLegitimationDraft() },
        }
        const key = prev.lcrSource === 'ausf' || prev.lcrSource === 'legitimation' ? prev.lcrSource : 'courtDecree'
        const { list, draft } = sources[key]
        const rows = []
        const includeDraft =
          draft && typeof draft === 'object' &&
          (key === 'courtDecree' && type === '2A'
            ? courtDecreeRecordEligibleForMc20102A(draft)
            : recordHasLcrType(draft, type))
        if (includeDraft) rows.push({ id: '__draft__', label: '[Current draft]', data: draft })
        list.forEach((r) => {
          if (!r?.data) return
          const ok =
            key === 'courtDecree' && type === '2A'
              ? courtDecreeRecordEligibleForMc20102A(r.data)
              : recordHasLcrType(r.data, type)
          if (ok) rows.push({ id: r.id, label: r.label || r.id, data: r.data })
        })
        const rec = rows.find((r) => r.id === prev.lcrSourceId)
        if (rec) lcrData = mapSourceToSupplementalLcrData(prev.lcrSource, rec.data, type)
      }
      const next = {
        ...prev,
        includeForm1a: true,
        lcrType: type,
        lcrData,
        ...(prev.lcrSourceId ? {} : { lcrSourceId: '', lcrPrefillLabel: '' }),
      }
      saveMc2010Draft(next)
      return next
    })
    setLcrSearchQuery('')
    setActiveSection('lcr')
  }

  const handleLcrSourceChange = (src) => {
    setForm((prev) => {
      const next = { ...prev, lcrSource: src, lcrSourceId: '', lcrPrefillLabel: '' }
      saveMc2010Draft(next)
      return next
    })
    setLcrSearchQuery('')
  }

  const handleSelectLcrRecord = (record) => {
    const mapped = mapSourceToSupplementalLcrData(form.lcrSource, record.data, form.lcrType)
    setForm((prev) => {
      const next = { ...prev, lcrData: mapped, lcrSourceId: record.id, lcrPrefillLabel: record.label || '' }
      saveMc2010Draft(next)
      return next
    })
    setLcrSearchFocused(false)
    setLcrSearchQuery(record.label || '')
  }

  const patchLcrData = (nextLcr) => {
    setForm((prev) => {
      const next = { ...prev, lcrData: nextLcr }
      saveMc2010Draft(next)
      return next
    })
  }

  const handleSave = () => {
    saveMc2010Draft(form)
    saveOrUpdateMc2010(form)
    acknowledgeSaved()
    setConfirmOpen(true)
  }

  return (
    <div className="supplemental-form-page no-print mc2010-form-page">
      <div className="legitimation-form-page__card">
        <header className="legitimation-form-page__header no-print">
          <h1>MC2010-04 Automated Data Entry Form</h1>
          <p>Unified Legal Status Automated Data Entry System — Iligan City</p>
        </header>
        <div className="legitimation-form-page__body supplemental-form-page-content">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <p className="text-sm text-gray-600">
                Use the sidebar to open the transmittal or the LCR worksheet; the main panel shows the full form for the section you pick.
              </p>
            </div>
            {activeSavedId ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm font-bold shadow-sm animate-in fade-in zoom-in duration-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Editing Saved File
              </span>
            ) : null}
          </div>

          {!activeSavedId ? (
            <button
              type="button"
              onClick={() => {
                clearMc2010Active()
                saveMc2010Draft(defaultMc2010Draft)
                setForm(defaultMc2010Draft)
                setLcrSearchQuery('')
                setActiveSection('transmittal')
              }}
              className="mb-5 px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white hover:bg-gray-50"
            >
              Reset to new MC2010 form
            </button>
          ) : null}

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            <aside className="w-full lg:w-52 shrink-0 lg:sticky lg:top-6 flex flex-col gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">Form sections</p>
              <button
                type="button"
                onClick={() => setActiveSection('transmittal')}
                className={`w-full text-left rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                  activeSection === 'transmittal'
                    ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Transmittal Letter
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('lcr')}
                className={`w-full text-left rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                  activeSection === 'lcr'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-950 shadow-sm ring-1 ring-indigo-300/50'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="block">LCR Form No. {form.lcrType || '1A'}</span>
                <span className="mt-0.5 block text-[11px] font-normal text-indigo-800/90 leading-snug">
                  {form.lcrType === '2A' ? 'Death' : form.lcrType === '3A' ? 'Marriage' : 'Birth'} — pull or manual
                </span>
              </button>
            </aside>

            <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="rounded-2xl border border-indigo-100/90 bg-white shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-7">
                  <div className="space-y-6">
                    {activeSection === 'transmittal' ? (
                      <SupplementalTransmittalFieldsEditor
                        data={form}
                        onPatch={updateTransmittalPatch}
                        inputClass={transmittalInputClass}
                        showRecipientCity={false}
                      />
                    ) : null}

                    {activeSection === 'lcr' ? (
                      <section className="space-y-5">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 border-b border-indigo-100 pb-4">
                          <h2 className="text-base font-bold text-indigo-950 sm:text-lg">
                            LCR Form No. {form.lcrType || '1A'} (
                            {form.lcrType === '2A' ? 'Death' : form.lcrType === '3A' ? 'Marriage' : 'Birth'} available)
                          </h2>
                          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-700 sm:text-right">
                            Prefill and manual entry
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:items-end">
                          <div>
                            <span className="mb-2 block text-[10px] font-bold uppercase tracking-wide text-gray-600">
                              LCR type
                            </span>
                            <div className="grid grid-cols-3 gap-1.5">
                              {['1A', '2A', '3A'].map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => handleEnableLcr(t)}
                                  className={`rounded-md py-2.5 text-xs font-bold transition-all ${
                                    form.lcrType === t
                                      ? 'bg-violet-600 text-white shadow-md ring-1 ring-violet-500/30'
                                      : 'border border-violet-200 bg-white text-gray-700 hover:border-violet-400 hover:bg-violet-50/50'
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label
                              htmlFor="mc2010-lcr-source-module"
                              className="mb-2 block text-[10px] font-bold uppercase tracking-wide text-gray-600"
                            >
                              Source module
                            </label>
                            <select
                              id="mc2010-lcr-source-module"
                              className={`${inputClass} border-violet-200 bg-white py-2.5 font-medium text-gray-800 shadow-sm focus:border-violet-500 focus:ring-violet-500/20`}
                              value={form.lcrSource === 'ausf' || form.lcrSource === 'legitimation' ? form.lcrSource : 'courtDecree'}
                              onChange={(e) => handleLcrSourceChange(e.target.value)}
                            >
                              <option value="ausf">AUSF</option>
                              <option value="courtDecree">Court Decree</option>
                              <option value="legitimation">Legitimation</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="mc2010-lcr-prefill-search"
                            className="block text-[10px] font-bold uppercase tracking-wide text-gray-600"
                          >
                            Prefill from record
                          </label>
                          <div className="relative">
                            <div className="relative">
                              <input
                                id="mc2010-lcr-prefill-search"
                                type="text"
                                className={`${inputClass} border-violet-200 pr-9 shadow-sm focus:border-violet-500 focus:ring-violet-500/20`}
                                placeholder="Search; click a row to load LCR fields"
                                value={lcrSearchQuery}
                                onChange={(e) => setLcrSearchQuery(e.target.value)}
                                onFocus={() => setLcrSearchFocused(true)}
                                onBlur={() => window.setTimeout(() => setLcrSearchFocused(false), 200)}
                              />
                              {lcrSearchQuery ? (
                                <button
                                  type="button"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  aria-label="Clear search"
                                  onClick={() => setLcrSearchQuery('')}
                                >
                                  ×
                                </button>
                              ) : null}
                            </div>
                            {lcrSearchFocused ? (
                              <ul className="absolute z-30 left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                {filteredLcrRecords.length === 0 ? (
                                  <li className="px-3 py-2 text-xs text-gray-500">No records match.</li>
                                ) : (
                                  filteredLcrRecords.map((r) => (
                                    <li key={r.id} className="border-b border-gray-100 last:border-0">
                                      <button
                                        type="button"
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-violet-50"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleSelectLcrRecord(r)}
                                      >
                                        <span className="font-medium text-gray-900 block truncate">{r.label}</span>
                                      </button>
                                    </li>
                                  ))
                                )}
                              </ul>
                            ) : null}
                          </div>
                          {form.lcrPrefillLabel ? (
                            <p className="text-[11px] font-medium text-indigo-900">Prefilled: {form.lcrPrefillLabel}</p>
                          ) : null}
                          {(form.lcrSource === 'ausf' || form.lcrSource === 'legitimation') &&
                          (form.lcrType === '2A' || form.lcrType === '3A') ? (
                            <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
                              Form {form.lcrType} is fully prefilled from <strong className="font-semibold">Court Decree</strong> only.
                            </p>
                          ) : (
                            <p className="text-[11px] leading-snug text-indigo-800/90">
                              Pull copies data only; refine on print.
                            </p>
                          )}
                        </div>

                        <div className="rounded-xl border-2 border-sky-100 bg-sky-50/35 p-4 sm:p-5">
                          <p className="mb-4 text-[10px] font-bold uppercase tracking-wide text-indigo-900">
                            Manual LCR (no saved record)
                          </p>
                          <ManualLcrDataEditor
                            lcrType={form.lcrType}
                            data={form.lcrData}
                            onPatch={patchLcrData}
                            inputClass={`${inputClass} border-violet-200/80`}
                          />
                        </div>
                      </section>
                    ) : null}
                  </div>
                </div>
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
            <button
              type="button"
              onClick={() => navigate('/legal-instrument/mc2010-04/saved')}
              className="ausf-form-page__btn ausf-form-page__btn--secondary px-4 py-2.5 text-sm font-medium"
            >
              Back to saved files
            </button>
          </div>

          {confirmOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmOpen(false)} />
              <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-200 p-5">
                <h3 className="text-base font-semibold text-gray-900">Saved</h3>
                <p className="mt-1 text-sm text-gray-600">MC2010-04 has been saved. Continue to print output?</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      afterUnsavedAcknowledge(acknowledgeSaved, () => navigate('/legal-instrument/mc2010-04/print'))
                    }
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-[var(--primary-blue)] text-white hover:bg-[var(--primary-blue-light)]"
                  >
                    Continue to Print
                  </button>
                </div>
              </div>
            </div>
          ) : null}

        </div>
      </div>
    </div>
  )
}
