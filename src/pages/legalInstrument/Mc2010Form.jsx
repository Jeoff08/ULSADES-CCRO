import React, { useEffect, useMemo, useState } from 'react'
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
      const lcrData = type === '1A' ? { ...defaultLegitimation } : { ...defaultCourtDecree }
      const next = { ...prev, includeForm1a: true, lcrType: type, lcrData, lcrSourceId: '', lcrPrefillLabel: '' }
      saveMc2010Draft(next)
      return next
    })
    setLcrSearchQuery('')
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
        <div className="legitimation-form-page__body mc2010-form-page-content">
      <p className="text-sm text-gray-600 mb-5">Transmittal + LCR pullout (1A/2A/3A), ready for print and PDF.</p>
      {!activeSavedId ? (
        <button
          type="button"
          onClick={() => {
            clearMc2010Active()
            saveMc2010Draft(defaultMc2010Draft)
            setForm(defaultMc2010Draft)
            setLcrSearchQuery('')
          }}
          className="mb-4 px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white hover:bg-gray-50"
        >
          Reset to new MC2010 form
        </button>
      ) : null}

      <div className="legitimation-form-page__section">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">LCR type</label>
            <div className="grid grid-cols-3 gap-1">
              {['1A', '2A', '3A'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleEnableLcr(t)}
                  className={`py-2 text-xs font-bold rounded border transition-all ${
                    form.lcrType === t
                      ? 'bg-[var(--primary-blue)] text-white border-[var(--primary-blue)]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">Source module</label>
            <select
              className={inputClass}
              value={form.lcrSource === 'ausf' || form.lcrSource === 'legitimation' ? form.lcrSource : 'courtDecree'}
              onChange={(e) => handleLcrSourceChange(e.target.value)}
            >
              <option value="ausf">AUSF</option>
              <option value="courtDecree">Court Decree</option>
              <option value="legitimation">Legitimation</option>
            </select>
          </div>
        </div>

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
          {lcrSearchFocused ? (
            <ul className="absolute z-30 left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
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
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : null}
        </div>
      </div>
      </div>

      <SupplementalTransmittalFieldsEditor
        data={form}
        onPatch={updateTransmittalPatch}
        inputClass={inputClass}
        showRecipientCity={false}
      />

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
