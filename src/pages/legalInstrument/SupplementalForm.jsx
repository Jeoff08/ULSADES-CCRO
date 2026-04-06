import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addSavedSupplemental, getSupplementalDraft, saveSupplementalDraft } from './lib/supplementalSavedStorage'

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
}

export default function SupplementalForm() {
  const navigate = useNavigate()
  const initial = useMemo(() => getSupplementalDraft(defaultSupplementalDraft), [])
  const [form, setForm] = useState(initial)
  const [confirmOpen, setConfirmOpen] = useState(false)

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
    // Draft is already persisted on each change, but save again
    // so the modal action is explicit and future-proof.
    saveSupplementalDraft(form)
    addSavedSupplemental(form)
    setConfirmOpen(true)
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Supplemental Report Form</h1>
      <p className="text-sm text-gray-600 mb-5">
        Fill out this form to generate the Affidavit for Supplemental Report output.
      </p>

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
                Your Supplemental Report draft has been saved. Do you want to continue to the print output now?
              </p>
            </div>
            <div className="px-5 pb-5 flex items-center justify-end gap-2">
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
      )}
    </div>
  )
}

