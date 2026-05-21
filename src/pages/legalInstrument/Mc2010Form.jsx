import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { afterUnsavedAcknowledge, useWarnIfUnsaved } from '../../hooks/useWarnIfUnsaved'
import { useNavigate } from 'react-router-dom'
import { defaultLegitimation } from '../legitimation/lib/legitimationDefaults'
import { defaultCourtDecree } from '../courtDecree/lib/courtDecreeDefaults'
import { getSavedAUSFList, getAUSFDraft } from '../ausf/lib/ausfStorage'
import { getSavedCourtDecreeList, getCourtDecreeDraft } from '../courtDecree/lib/courtDecreeStorage'
import { getSavedLegitimationList, getLegitimationDraft } from '../legitimation/lib/legitimationStorage'
import { mapSourceToSupplementalLcrData } from './lib/supplementalLcrPrefill'
import SupplementalTransmittalFieldsEditor from './SupplementalTransmittalFieldsEditor'
import SupplementalLcrFooterSignatoryPickers from './SupplementalLcrFooterSignatoryPickers'
import LcrForm1ABirthAvailable from '../courtDecree/print/LcrForm1ABirthAvailable'
import LcrForm2ADeathAvailable from '../courtDecree/print/LcrForm2ADeathAvailable'
import LcrForm3AMarriageAvailable from '../courtDecree/print/LcrForm3AMarriageAvailable'
import LcrRemarksFontSizeSelect from '../../components/lcr/LcrRemarksFontSizeSelect'
import { mergeLcrRemarksFontSizePt } from '../../lib/lcrRemarksFontSize'
import { getDefaultSupplementalTransmittalFields, pickTransmittalStateFromDraft } from './lib/supplementalTransmittalDefaults'
import {
  clearMc2010Active,
  getActiveMc2010Id,
  getMc2010Draft,
  saveMc2010Draft,
  saveOrUpdateMc2010,
} from './lib/mc2010SavedStorage'
import { deriveAffectedDocumentsForPrint } from '../courtDecree/lib/courtDecreeAffectedDocuments'
import { handleEnterFocusNextField } from '../../lib/formEnterFocusNext'
import { FormBodyFieldShortcuts } from '../../components/forms/FormBodyFieldShortcuts'

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

/** Rows eligible for MC2010 LCR prefill (same rules as the search dropdown). */
function buildMc2010LcrRows(lcrSource, lcrType) {
  if (lcrSource === 'manual') return []
  const sources = {
    ausf: { list: getSavedAUSFList(), draft: getAUSFDraft() },
    courtDecree: { list: getSavedCourtDecreeList(), draft: getCourtDecreeDraft() },
    legitimation: { list: getSavedLegitimationList(), draft: getLegitimationDraft() },
  }
  const key = lcrSource === 'ausf' || lcrSource === 'legitimation' ? lcrSource : 'courtDecree'
  const { list, draft } = sources[key]
  const rows = []
  const includeDraft =
    draft &&
    typeof draft === 'object' &&
    (key === 'courtDecree' && lcrType === '2A'
      ? courtDecreeRecordEligibleForMc20102A(draft)
      : recordHasLcrType(draft, lcrType))
  if (includeDraft) rows.push({ id: '__draft__', label: '[Current draft]', data: draft })
  list.forEach((r) => {
    if (!r?.data) return
    const ok =
      key === 'courtDecree' && lcrType === '2A'
        ? courtDecreeRecordEligibleForMc20102A(r.data)
        : recordHasLcrType(r.data, lcrType)
    if (ok) rows.push({ id: r.id, label: r.label || r.id, data: r.data })
  })
  return rows
}

const defaultMc2010Draft = {
  receiptOrFileOwner: '',
  includeForm1a: true,
  lcrType: '1A',
  lcrRemarksFontSizePt: '12',
  lcrData: { ...defaultLegitimation },
  lcrSource: 'manual',
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

  const lcrRecords = useMemo(() => buildMc2010LcrRows(form.lcrSource, form.lcrType), [form.lcrSource, form.lcrType])

  const filteredLcrRecords = useMemo(() => {
    const q = lcrSearchQuery.trim().toLowerCase()
    if (!q) return lcrRecords
    return lcrRecords.filter((r) => String(r.label || '').toLowerCase().includes(q))
  }, [lcrRecords, lcrSearchQuery])

  const lcrInlineFormData = useMemo(() => {
    const base = form.lcrType === '1A' ? defaultLegitimation : defaultCourtDecree
    const slice = form.lcrData && typeof form.lcrData === 'object' ? form.lcrData : {}
    return mergeLcrRemarksFontSizePt({ ...base, ...slice }, form)
  }, [form.lcrType, form.lcrData, form.lcrRemarksFontSizePt])

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white'

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
      let lcrSourceId = prev.lcrSourceId
      let lcrPrefillLabel = prev.lcrPrefillLabel
      if (prev.lcrSource && prev.lcrSource !== 'manual' && prev.lcrSourceId) {
        const rows = buildMc2010LcrRows(prev.lcrSource, type)
        const rec = rows.find((r) => r.id === prev.lcrSourceId)
        if (rec) {
          lcrData = mapSourceToSupplementalLcrData(prev.lcrSource, rec.data, type)
        } else {
          lcrSourceId = ''
          lcrPrefillLabel = ''
        }
      }
      const next = {
        ...prev,
        includeForm1a: true,
        lcrType: type,
        lcrData,
        lcrSourceId,
        lcrPrefillLabel,
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
    setForm((prev) => {
      if (prev.lcrSource === 'manual') return prev
      const mapped = mapSourceToSupplementalLcrData(prev.lcrSource, record.data, prev.lcrType)
      const next = { ...prev, lcrData: mapped, lcrSourceId: record.id, lcrPrefillLabel: record.label || '' }
      saveMc2010Draft(next)
      return next
    })
    setLcrSearchFocused(false)
    setLcrSearchQuery(record.label || '')
  }

  const handleLcrInlineDataChange = (next) => {
    setForm((prev) => {
      const merged = {
        ...prev,
        lcrData: next && typeof next === 'object' ? next : prev.lcrData,
      }
      saveMc2010Draft(merged)
      return merged
    })
  }

  const patchLcrInlineData = useCallback((partial) => {
    if (!partial || typeof partial !== 'object') return
    setForm((prev) => {
      const base = prev.lcrData && typeof prev.lcrData === 'object' ? prev.lcrData : {}
      const merged = { ...prev, lcrData: { ...base, ...partial } }
      saveMc2010Draft(merged)
      return merged
    })
  }, [])

  const handleSave = () => {
    saveMc2010Draft(form)
    saveOrUpdateMc2010(form)
    acknowledgeSaved()
    setConfirmOpen(true)
  }

  return (
    <div className="mc2010-form-page no-print">
      <div className="legitimation-form-page__card">
        <header className="legitimation-form-page__header no-print">
          <h1>MC2010-04 Automated Data Entry Form</h1>
          <p>Unified Legal Status Automated Data Entry System — Iligan City</p>
        </header>
        <FormBodyFieldShortcuts className="legitimation-form-page__body mc2010-form-page-content" onKeyDown={handleEnterFocusNextField}>
          <p className="text-sm text-gray-600 mb-5">
            Use <span className="font-semibold">Form Sections</span> on the left to switch between the transmittal letter and the LCR form (manual entry or module prefill). The layout matches the supplemental transmittal editor for consistency.
          </p>
          <div className="mb-5 max-w-xl">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Receipt or owner of the file <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <input
              type="text"
              className={inputClass}
              value={form.receiptOrFileOwner}
              onChange={(e) => update('receiptOrFileOwner', e.target.value)}
              placeholder="Name shown in Files Saved when filled"
            />
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
              className="mb-4 px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white hover:bg-gray-50"
            >
              Reset to new MC2010 form
            </button>
          ) : null}

          <div className="legitimation-form-page__section">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
              <aside className="w-full lg:w-56 shrink-0 lg:sticky lg:top-6 flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Form Sections</p>

                <button
                  type="button"
                  onClick={() => setActiveSection('transmittal')}
                  className={`w-full text-left rounded-xl border-2 px-4 py-3.5 shadow-sm transition-all ${activeSection === 'transmittal'
                      ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500/20'
                      : 'border-transparent bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <span
                    className={`block text-sm font-bold ${activeSection === 'transmittal' ? 'text-amber-700' : 'text-gray-900'
                      }`}
                  >
                    Transmittal (CCR letter)
                  </span>
                  <span className="block text-xs text-gray-600 mt-1 leading-snug">CCR / transmittal details</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('lcr')}
                  className={`w-full text-left rounded-xl border-2 px-4 py-3.5 shadow-sm transition-all ${activeSection === 'lcr'
                      ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/20'
                      : 'border-transparent bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <span
                    className={`block text-sm font-bold ${activeSection === 'lcr' ? 'text-emerald-800' : 'text-gray-900'
                      }`}
                  >
                    LCR Form {form.lcrType}
                  </span>
                  <span className="block text-xs text-gray-600 mt-1 leading-snug">
                    {form.lcrType === '1A'
                      ? 'Birth certificate data'
                      : form.lcrType === '2A'
                        ? 'Death certificate data'
                        : 'Marriage certificate data'}
                  </span>
                </button>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-0.5">Switch LCR type</span>
                  <div className="grid grid-cols-3 gap-1">
                    {['1A', '2A', '3A'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleEnableLcr(t)}
                        className={`py-1.5 text-[11px] font-bold rounded border transition-all ${form.lcrType === t
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              <div className="flex-1 min-w-0">
                {activeSection === 'transmittal' ? (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <SupplementalTransmittalFieldsEditor
                      data={form}
                      onPatch={updateTransmittalPatch}
                      inputClass={inputClass}
                      showRecipientCity={false}
                      signatoryDropdownPlacement="endorsementColumn"
                    />
                    <div className="mt-8 p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                      <button
                        type="button"
                        onClick={() => setActiveSection('lcr')}
                        className="text-emerald-800 font-bold hover:underline"
                      >
                        Open LCR Form
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                    <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-base font-bold text-emerald-900">
                          LCR Form {form.lcrType}
                          {form.lcrSource === 'manual' ? ' — manual entry' : ' — prefill from module'}
                        </h2>
                        {form.lcrSource !== 'manual' && form.lcrPrefillLabel ? (
                          <span
                            className="text-[11px] font-medium text-emerald-800 truncate max-w-[14rem]"
                            title={form.lcrPrefillLabel}
                          >
                            Prefilled: {form.lcrPrefillLabel}
                          </span>
                        ) : null}
                      </div>
                      <div
                        className={
                          form.lcrSource === 'manual' ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-1 md:grid-cols-2 gap-3'
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
                              All LCR fields are entered manually in the form below. Use <span className="font-semibold">Save</span> to keep them with this MC2010 file. Choose another source above if you want to copy from a saved record first.
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
                        (form.lcrType === '2A' || form.lcrType === '3A') ? (
                        <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
                          Form {form.lcrType} is only fully prefilled from <strong className="font-semibold">Court Decree</strong>. With AUSF or Legitimation, shared header fields are copied and the table may start mostly blank — edit every field below or on Print.
                        </p>
                      ) : (
                        <p className="text-[11px] text-gray-600 leading-snug">
                          Choosing a row copies that record into this MC2010&apos;s LCR data (your originals are not changed). You can still edit every field below.
                        </p>
                      )}
                    </div>

                    <div className="no-print rounded-lg border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-[11px] text-emerald-900 leading-snug max-w-[210mm] mx-auto w-full">
                      <span className="font-semibold">LCR Form {form.lcrType}</span>
                      {' — same court print layout for all sources. '}
                      {form.lcrPrefillLabel ? (
                        <>
                          Prefilled: <span className="italic">{form.lcrPrefillLabel}</span>
                          {'. '}
                        </>
                      ) : form.lcrSource === 'manual' ? (
                        <>Manual entry on the MC2010 form — edit the table below. </>
                      ) : (
                        <>Choose a record above to prefill, or edit the table below. </>
                      )}
                      Table cells are editable below; bottom signatures use the block under this note; changes are saved with this MC2010 file.
                    </div>
                    <LcrRemarksFontSizeSelect
                      id="mc2010-form-lcr-remarks-font"
                      value={form.lcrRemarksFontSizePt}
                      onChange={(v) => update('lcrRemarksFontSizePt', v)}
                      className="max-w-[210mm] mx-auto w-full mb-3"
                      helpText="Applies to the REMARKS block on this LCR form in preview and print/PDF."
                    />
                    <SupplementalLcrFooterSignatoryPickers
                      lcrData={lcrInlineFormData}
                      inputClass={inputClass}
                      onPatch={patchLcrInlineData}
                    />

                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden ring-1 ring-slate-100">
                      <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/95">
                        <p className="text-xs font-bold text-slate-800">LCR Form {form.lcrType} — fill out here</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                          Same layout as Continue to Print. Scroll if needed; use Save to keep entries.
                        </p>
                      </div>
                      <div className="max-h-[min(78vh,900px)] overflow-y-auto overflow-x-auto p-2 sm:p-3 bg-slate-50/40">
                        {form.lcrType === '1A' ? (
                          <LcrForm1ABirthAvailable
                            data={lcrInlineFormData}
                            editableTable
                            onDataChange={handleLcrInlineDataChange}
                          />
                        ) : null}
                        {form.lcrType === '2A' ? (
                          <LcrForm2ADeathAvailable
                            data={lcrInlineFormData}
                            editableTable
                            onDataChange={handleLcrInlineDataChange}
                          />
                        ) : null}
                        {form.lcrType === '3A' ? (
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
                        onClick={() => setActiveSection('transmittal')}
                        className="text-amber-700 font-bold hover:underline"
                      >
                        Open Transmittal
                      </button>
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

        </FormBodyFieldShortcuts>
      </div>
    </div>
  )
}
