import React, { useEffect, useRef, useState } from 'react'
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
import { applyEnableLcrType } from './lib/supplementalEnableLcr'
import SupplementalTransmittalFieldsEditor from './SupplementalTransmittalFieldsEditor'
import SupplementalLcrWorksheetPanel from './SupplementalLcrWorksheetPanel'

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
  lcrSource: '', // '' | 'ausf' | 'courtDecree' | 'legitimation'
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
  const formRef = useRef(form)
  useEffect(() => {
    formRef.current = form
  }, [form])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('affidavit')
  const activeSavedId = getActiveSupplementalId()

  const [dirtyBaselineTick, setDirtyBaselineTick] = useState(0)
  useEffect(() => {
    const id = setTimeout(() => setDirtyBaselineTick((x) => x + 1), 120)
    return () => clearTimeout(id)
  }, [location.key, activeSavedId])

  const acknowledgeSaved = useWarnIfUnsaved(form, [location.key, activeSavedId, dirtyBaselineTick])

  useEffect(() => {
    const loaded = getSupplementalDraft(defaultSupplementalDraft)
    const next = { ...loaded, ...pickTransmittalStateFromDraft(loaded) }
    saveSupplementalDraft(next)
    setForm(next)
  }, [location.key])

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
    const next = applyEnableLcrType(formRef.current, type)
    saveSupplementalDraft(next)
    formRef.current = next
    setForm(next)
    setActiveSection('lcr-worksheet')
  }

  const handleLcrSourceModuleChange = (v) => {
    setForm((prev) => {
      let next = { ...prev, lcrSource: v, lcrSourceId: '', lcrPrefillLabel: '' }
      if ((v === 'ausf' || v === 'legitimation') && next.lcrType !== '1A') {
        next = applyEnableLcrType(next, '1A')
      }
      saveSupplementalDraft(next)
      return next
    })
  }

  const handleRemoveLcr = () => {
    setForm((prev) => {
      const next = { ...prev, includeForm1a: false, lcrSourceId: '', lcrPrefillLabel: '', lcrSource: '' }
      saveSupplementalDraft(next)
      return next
    })
    setActiveSection('affidavit')
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white'
  const transmittalInputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all'
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
    <div className="supplemental-form-page no-print">
      <div className="legitimation-form-page__card">
        <header className="legitimation-form-page__header no-print">
          <h1>Supplemental Report Automated Data Entry Form</h1>
          <p>Unified Legal Status Automated Data Entry System — Iligan City</p>
        </header>
        <div className="legitimation-form-page__body supplemental-form-page-content">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <p className="text-sm text-gray-600">
                Affidavit, CCR transmittal, and optional LCR — use the sidebar to switch sections.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Open <strong className="font-semibold">LCR Form</strong> below the transmittal to prefill from saved files or enter manual LCR fields on the same page.
              </p>
            </div>
            {activeSavedId ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm font-bold shadow-sm animate-in fade-in zoom-in duration-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Editing Saved File
              </span>
            ) : null}
          </div>

          {activeSavedId ? (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 leading-relaxed">
              Draft is kept until you save. Use <span className="font-semibold">Back to saved files</span> to return to the list, or{' '}
              <span className="font-semibold">New Supplemental</span> on the saved list for a blank form.
            </div>
          ) : null}

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-6 flex flex-col gap-3">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 px-1">Form Sections</p>

              <button
                type="button"
                onClick={() => setActiveSection('affidavit')}
                className={`w-full text-left rounded-xl border-2 px-4 py-4 shadow-sm transition-all duration-200 ${activeSection === 'affidavit'
                    ? 'border-[var(--primary-blue)] bg-[var(--primary-blue)]/5 ring-1 ring-[var(--primary-blue)]/20'
                    : 'border-transparent bg-white hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${activeSection === 'affidavit' ? 'bg-[var(--primary-blue)]/15 text-[var(--primary-blue)]' : 'bg-gray-100 text-gray-500'
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div>
                    <span className={`block text-sm font-bold ${activeSection === 'affidavit' ? 'text-[var(--primary-blue)]' : 'text-gray-900'}`}>
                      Supplemental affidavit
                    </span>
                    <span className="block text-xs text-gray-600 mt-0.5 leading-snug">Affidavit for Supplemental Report</span>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('transmittal')}
                className={`w-full text-left rounded-xl border-2 px-4 py-4 shadow-sm transition-all duration-200 ${activeSection === 'transmittal'
                    ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500/20'
                    : 'border-transparent bg-white hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${activeSection === 'transmittal' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <span className={`block text-sm font-bold ${activeSection === 'transmittal' ? 'text-amber-800' : 'text-gray-900'}`}>
                      Transmittal Letter
                    </span>
                    <span className="block text-xs text-gray-600 mt-0.5 leading-snug">CCR letter for this report</span>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!form.includeForm1a) handleEnableLcr('1A')
                  else setActiveSection('lcr-worksheet')
                }}
                className={`w-full text-left rounded-xl border-2 px-4 py-4 shadow-sm transition-all duration-200 ${activeSection === 'lcr-worksheet'
                    ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500/20'
                    : 'border-transparent bg-white hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${activeSection === 'lcr-worksheet' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div>
                    <span className={`block text-sm font-bold ${activeSection === 'lcr-worksheet' ? 'text-indigo-800' : 'text-gray-900'}`}>
                      {form.includeForm1a ? `LCR Form No. ${form.lcrType || '1A'}` : 'LCR Form'}
                    </span>
                    <span className="block text-xs text-gray-600 mt-0.5 leading-snug">
                      {form.includeForm1a
                        ? `${form.lcrType === '2A' ? 'Death' : form.lcrType === '3A' ? 'Marriage' : 'Birth'} — pull or manual`
                        : 'Tap to attach Form 1A (change type on worksheet)'}
                    </span>
                  </div>
                </div>
              </button>
            </aside>

            <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-1">
                  <div className="space-y-6 p-4 sm:p-5">
                    {activeSection === 'affidavit' ? (
                      <>
                        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 shadow-sm">
                          <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            Supplemental affidavit
                          </h3>
                          <p className="text-xs text-blue-800/90 mt-2 leading-relaxed">
                            {form.includeForm1a
                              ? `LCR Form ${form.lcrType} is edited in the LCR section (sidebar). Print uses the standard court LCR layout on a separate sheet.`
                              : 'Optional: open LCR Form in the sidebar to attach Form 1A, 2A, or 3A to this supplemental file.'}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <div><label className="block text-sm font-medium mb-1">Affiant Name</label><input className={inputClass} value={form.affiantName} onChange={(e) => update('affiantName', e.target.value)} /></div>
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
                      </>
                    ) : null}

                    {activeSection === 'transmittal' ? (
                      <>
                        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 shadow-sm">
                          <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                            CCR transmittal
                          </h3>
                          <p className="text-xs text-blue-800/90 mt-2 leading-relaxed">
                            Checklist and letter for this supplemental file. Use the sidebar to return to the <strong className="font-semibold">Supplemental affidavit</strong> when needed.
                          </p>
                        </div>
                        <SupplementalTransmittalFieldsEditor
                          data={form}
                          onPatch={updateTransmittalPatch}
                          inputClass={transmittalInputClass}
                          showRecipientCity={false}
                        />
                      </>
                    ) : null}

                    {activeSection === 'lcr-worksheet' && form.includeForm1a ? (
                      <SupplementalLcrWorksheetPanel
                        form={form}
                        onPatch={updateTransmittalPatch}
                        onLcrTypeChange={handleEnableLcr}
                        onLcrSourceModuleChange={handleLcrSourceModuleChange}
                        onRemoveLcr={handleRemoveLcr}
                      />
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
                      onClick={() =>
                        afterUnsavedAcknowledge(acknowledgeSaved, () => navigate('/legal-instrument/supplemental/print'))
                      }
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
      </div>
    </div>
  )
}
