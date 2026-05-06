import React, { useEffect, useMemo, useRef, useState } from 'react'
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
import SupplementalTransmittalFieldsEditor from './SupplementalTransmittalFieldsEditor'

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
  lcrType: '1A', // '1A', '2A', or '3A'
  lcrData: { ...defaultLegitimation },
  /** Where to pull LCR table data from when using “Prefill from record”. */
  lcrSource: 'courtDecree', // 'ausf' | 'courtDecree' | 'legitimation'
  lcrSourceId: '',
  lcrPrefillLabel: '',
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

  const lcrRecords = useMemo(() => {
    const sources = {
      ausf: { list: getSavedAUSFList(), draft: getAUSFDraft() },
      courtDecree: { list: getSavedCourtDecreeList(), draft: getCourtDecreeDraft() },
      legitimation: { list: getSavedLegitimationList(), draft: getLegitimationDraft() },
    }
    const key = form.lcrSource === 'ausf' || form.lcrSource === 'legitimation' ? form.lcrSource : 'courtDecree'
    const { list, draft } = sources[key]
    const rows = []
    if (draft && typeof draft === 'object') {
      rows.push({ id: '__draft__', label: '[Current draft]', data: draft })
    }
    list.forEach((r) => {
      if (r?.data) rows.push({ id: r.id, label: r.label || r.id, data: r.data })
    })
    return rows
  }, [form.lcrSource])

  const filteredLcrRecords = useMemo(() => {
    const q = lcrSearchQuery.trim().toLowerCase()
    if (!q) return lcrRecords
    return lcrRecords.filter((r) => String(r.label || '').toLowerCase().includes(q))
  }, [lcrRecords, lcrSearchQuery])

  useEffect(() => {
    const loaded = getSupplementalDraft(defaultSupplementalDraft)
    const next = { ...loaded, ...pickTransmittalStateFromDraft(loaded) }
    saveSupplementalDraft(next)
    setForm(next)
  }, [location.key])

  const handleBackToSaved = () => {
    saveSupplementalDraft(form)
    navigate('/legal-instrument/supplemental/saved')
  }

  const update = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      saveSupplementalDraft(next)
      return next
    })
  }

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
    setConfirmOpen(true)
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
        if (draft && typeof draft === 'object') rows.push({ id: '__draft__', label: '[Current draft]', data: draft })
        list.forEach((r) => {
          if (r?.data) rows.push({ id: r.id, label: r.label || r.id, data: r.data })
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
      saveSupplementalDraft(next)
      return next
    })
    window.setTimeout(() => {
      affiantNameInputRef.current?.focus?.()
      affiantNameInputRef.current?.select?.()
    }, 0)
  }

  const handleRemoveLcr = () => {
    setForm((prev) => {
      const next = { ...prev, includeForm1a: false, lcrSourceId: '', lcrPrefillLabel: '' }
      saveSupplementalDraft(next)
      return next
    })
    setLcrSearchQuery('')
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
    const mapped = mapSourceToSupplementalLcrData(form.lcrSource, record.data, form.lcrType)
    setForm((prev) => {
      const next = {
        ...prev,
        lcrData: mapped,
        lcrSourceId: record.id,
        lcrPrefillLabel: record.label || '',
      }
      saveSupplementalDraft(next)
      return next
    })
    setLcrSearchFocused(false)
    setLcrSearchQuery(record.label || '')
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white'
  const type = form.supplementType || 'geographical'
  const showItem1ChoiceBlock = type === 'sex'
  const missingLabel =
    type === 'sex'
      ? 'Missing on COLB (optional — leave blank for NOT STATED)'
      : type === 'middleName'
        ? 'Missing / blank on COLB (optional)'
        : 'Missing province entry'
  const correctedLabel =
    type === 'sex'
      ? "Correct child's sex (e.g. MALE, FEMALE)"
      : type === 'middleName'
        ? "Correct child's middle name"
        : 'Correct province entry'

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Supplemental Report Form</h1>
      </div>
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

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        <aside className="w-full lg:w-56 shrink-0 lg:sticky lg:top-6 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Form Sections</p>
          <button
            type="button"
            onClick={() => setActiveSection('affidavit')}
            className={`w-full text-left rounded-xl border-2 px-4 py-3.5 shadow-sm transition-all ${
              activeSection === 'affidavit'
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
          {!form.includeForm1a ? (
            <div className="flex flex-col gap-2 p-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Add LCR Form</p>
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
          ) : (
            <div className="flex flex-col gap-2">
              <div className="w-full text-left rounded-xl border-2 border-emerald-500 bg-emerald-50/90 px-4 py-3.5 shadow-sm">
                <span className="block text-sm font-bold text-emerald-900">Form {form.lcrType} Included</span>
                <span className="block text-xs text-emerald-800 mt-1 font-medium">Bundle updated</span>
                <button
                  type="button"
                  onClick={handleRemoveLcr}
                  className="mt-3 w-full rounded-lg px-3 py-1.5 text-xs font-semibold border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-100 transition-colors"
                >
                  Remove Form {form.lcrType}
                </button>
              </div>
              <div className="mt-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Change LCR Type</label>
                <div className="grid grid-cols-3 gap-1">
                  {['1A', '2A', '3A'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleEnableLcr(t)}
                      className={`py-1.5 text-[11px] font-bold rounded border transition-all ${
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
            </div>
          )}

          <button
            type="button"
            onClick={() => setActiveSection('transmittal')}
            className={`w-full text-left rounded-xl border-2 px-4 py-3.5 shadow-sm transition-all ${
              activeSection === 'transmittal'
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
                <select className={inputClass} value={type} onChange={(e) => update('supplementType', e.target.value)}>
                  <option value="geographical">Geographical (province)</option>
                  <option value="sex">Child&apos;s sex</option>
                  <option value="middleName">Child&apos;s middle name</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Output for items 3 and 5 follows this choice.</p>
              </div>

              {form.includeForm1a ? (
                <div className="md:col-span-2 p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-emerald-900">
                      LCR Form {form.lcrType} — pull from module
                    </h3>
                    {form.lcrPrefillLabel ? (
                      <span className="text-[11px] font-medium text-emerald-800 truncate max-w-[14rem]" title={form.lcrPrefillLabel}>
                        Prefilled: {form.lcrPrefillLabel}
                      </span>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  </div>
                  {(form.lcrSource === 'ausf' || form.lcrSource === 'legitimation') &&
                  (form.lcrType === '2A' || form.lcrType === '3A') ? (
                    <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
                      Form {form.lcrType} is only fully prefilled from <strong className="font-semibold">Court Decree</strong>. With AUSF or Legitimation,
                      shared header fields are copied and the table starts mostly blank — you can still edit every cell on the print screen.
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-600 leading-snug">
                      Choosing a row copies that record into this supplemental&apos;s LCR output (your originals are not changed). Edit the table on the print page.
                    </p>
                  )}
                </div>
              ) : null}

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
                    type="number"
                    min="1"
                    max="12"
                    className={inputClass}
                    value={form.regMonth || ''}
                    onChange={(e) => update('regMonth', e.target.value)}
                    placeholder="Month (1-12)"
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
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <SupplementalTransmittalFieldsEditor
                data={form}
                onPatch={updateTransmittalPatch}
                inputClass={inputClass}
              />
              <div className="mt-8 p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <button
                  type="button"
                  onClick={() => setActiveSection('affidavit')}
                  className="text-amber-700 font-bold hover:underline"
                >
                  Return to Affidavit Form
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2.5 bg-[var(--primary-blue)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-blue-light)]"
        >
          Save
        </button>
        {activeSavedId ? (
          <button
            type="button"
            onClick={handleBackToSaved}
            className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
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
                  navigate('/legal-instrument/supplemental/saved')
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
                  onClick={() => navigate('/legal-instrument/supplemental/print')}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-[var(--primary-blue)] text-white hover:bg-[var(--primary-blue-light)]"
                >
                  Continue to Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
