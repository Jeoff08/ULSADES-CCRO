import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  getActiveSupplementalId,
  getSupplementalDraft,
  saveOrUpdateSupplemental,
  saveSupplementalDraft,
} from './lib/supplementalSavedStorage'
import { listLegitimationSourcesForForm1a, searchLegitimationForForm1a } from './lib/supplementalForm1a'

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
  form1aMatchName: '',
}

export default function SupplementalForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState(() => getSupplementalDraft(defaultSupplementalDraft))
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [form1aModalOpen, setForm1aModalOpen] = useState(false)
  const [form1aRemoveModalOpen, setForm1aRemoveModalOpen] = useState(false)
  const [colbMatchFocused, setColbMatchFocused] = useState(false)
  const activeSavedId = getActiveSupplementalId()
  const form1aColbMatchInputRef = useRef(null)
  const affiantNameInputRef = useRef(null)

  useEffect(() => {
    setForm(getSupplementalDraft(defaultSupplementalDraft))
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

  const handleEnableForm1a = () => {
    update('includeForm1a', true)
    setForm1aModalOpen(false)
    window.setTimeout(() => {
      const needsColbMatch = type === 'geographical' || type === 'middleName'
      const target = needsColbMatch ? form1aColbMatchInputRef.current : affiantNameInputRef.current
      target?.focus?.()
      target?.select?.()
    }, 0)
  }

  const handleRemoveForm1a = () => {
    setForm((prev) => {
      const next = { ...prev, includeForm1a: false, form1aMatchName: '' }
      saveSupplementalDraft(next)
      return next
    })
    setForm1aRemoveModalOpen(false)
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white'
  const type = form.supplementType || 'geographical'
  const showItem1ChoiceBlock = type === 'sex'
  const legitimationSourceCount = useMemo(
    () => (form.includeForm1a ? listLegitimationSourcesForForm1a().length : 0),
    [form.includeForm1a]
  )
  const colbMatchList = useMemo(
    () =>
      form.includeForm1a && (type === 'geographical' || type === 'middleName')
        ? searchLegitimationForForm1a(form.form1aMatchName || '')
        : [],
    [form.includeForm1a, form.form1aMatchName, type]
  )
  const showColbLegitimationDropdown =
    form.includeForm1a && colbMatchFocused && (type === 'geographical' || type === 'middleName')
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
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Supplemental Report Form</h1>
        {activeSavedId ? (
          <button
            type="button"
            onClick={handleBackToSaved}
            className="shrink-0 px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            Back to saved files
          </button>
        ) : null}
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
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Print bundle</p>
          {!form.includeForm1a ? (
            <button
              type="button"
              onClick={() => setForm1aModalOpen(true)}
              className="w-full text-left rounded-xl border-2 border-[var(--primary-blue)] bg-white px-4 py-3.5 shadow-sm hover:bg-[var(--primary-blue)]/5 transition-colors"
            >
              <span className="block text-sm font-bold text-[var(--primary-blue)]">LCR Form 1A</span>
              <span className="block text-xs text-gray-600 mt-1 leading-snug">
                Tap to add Birth-Available form with supplemental print output
              </span>
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled
                className="w-full text-left rounded-xl border-2 border-emerald-500 bg-emerald-50/90 px-4 py-3.5 shadow-sm cursor-default"
              >
                <span className="block text-sm font-bold text-emerald-900">LCR Form 1A</span>
                <span className="block text-xs text-emerald-800 mt-1 font-medium">Included in print</span>
              </button>
              <button
                type="button"
                onClick={() => setForm1aRemoveModalOpen(true)}
                className="w-full rounded-lg px-3 py-2 text-xs font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              >
                Remove Form 1A
              </button>
              {(type === 'geographical' || type === 'middleName') && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 mt-1 relative">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    COLB name match (optional)
                  </label>
                  <input
                    ref={form1aColbMatchInputRef}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-800 bg-white"
                    value={form.form1aMatchName || ''}
                    onChange={(e) => update('form1aMatchName', e.target.value)}
                    onFocus={() => setColbMatchFocused(true)}
                    onBlur={() => {
                      window.setTimeout(() => setColbMatchFocused(false), 180)
                    }}
                    placeholder="Type to filter; pick from list or type freely"
                    autoComplete="off"
                  />
                  {showColbLegitimationDropdown && colbMatchList.length > 0 ? (
                    <ul
                      className="absolute left-3 right-3 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                      role="listbox"
                    >
                      {colbMatchList.map((row) => (
                        <li key={row.sourceId} role="option">
                          <button
                            type="button"
                            className="w-full text-left px-2 py-2 text-sm text-gray-800 hover:bg-[var(--primary-blue)]/10"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              const v = (row.childName || row.label || '').trim()
                              update('form1aMatchName', v)
                              setColbMatchFocused(false)
                            }}
                          >
                            <span className="font-medium">{row.childName || row.label}</span>
                            {row.sourceType ? (
                              <span className="block text-xs text-[var(--primary-blue)]">{row.sourceType}</span>
                            ) : null}
                            {row.childName && row.label && row.childName !== row.label ? (
                              <span className="block text-xs text-gray-500">{row.label}</span>
                            ) : null}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {showColbLegitimationDropdown && colbMatchList.length === 0 ? (
                    <p className="absolute left-3 right-3 top-full z-20 mt-1 rounded-md border border-gray-200 bg-white px-2 py-2 text-sm text-gray-600 shadow-lg">
                      {legitimationSourceCount === 0
                        ? 'No Legitimation/Court Decree draft or saved files yet.'
                        : 'No registered name matches that text. Clear the field to see everyone, or type a different name.'}
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </aside>

        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Supplement type</label>
          <select className={inputClass} value={type} onChange={(e) => update('supplementType', e.target.value)}>
            <option value="geographical">Geographical (province)</option>
            <option value="sex">Child&apos;s sex</option>
            <option value="middleName">Child&apos;s middle name</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Output for items 3 and 5 follows this choice.</p>
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
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2.5 bg-[var(--primary-blue)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-blue-light)]"
        >
          Save
        </button>
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

      {form1aModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px]"
            onClick={() => setForm1aModalOpen(false)}
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="h-1.5 w-full bg-gradient-to-r from-[var(--primary-blue)] via-cyan-500 to-emerald-500" />
            <div className="p-5 sm:p-6">
              <div className="inline-flex items-center rounded-full border border-[var(--primary-blue)]/25 bg-[var(--primary-blue)]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--primary-blue)]">
                Print bundle
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-900">Add LCR Form No. 1A</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Include LCR Form No. 1A (Birth-Available) after the supplemental affidavit.
                Form 1A can auto-fill from Legitimation or Court Decree when a single matching record is found.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                After you continue, the form will focus the first relevant field so you can type immediately.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setForm1aModalOpen(false)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEnableForm1a}
                className="rounded-lg bg-[var(--primary-blue)] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--primary-blue-light)]"
              >
                Continue and Enable
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {form1aRemoveModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-rose-950/35 backdrop-blur-[1px]"
            onClick={() => setForm1aRemoveModalOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-2xl">
            <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400" />
            <div className="p-5 sm:p-6">
              <div className="inline-flex items-center rounded-full border border-rose-300 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-700">
                Remove from bundle
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-900">Remove LCR Form 1A?</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                This will remove Form 1A from the supplemental print output and clear the current COLB name match field.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                You can enable it again anytime.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-rose-100 bg-rose-50/40 px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setForm1aRemoveModalOpen(false)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Keep Form 1A
              </button>
              <button
                type="button"
                onClick={handleRemoveForm1a}
                className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

