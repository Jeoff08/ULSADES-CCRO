import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { defaultLegitimation } from './lib/legitimationDefaults'
import { addSavedLegitimation, getLegitimationDraft, updateSavedLegitimation } from './lib/legitimationStorage'
import { DATE_MONTHS, LEGITIMATION_TYPES } from './constants'

const inputClass = 'w-full border border-orange-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-orange-100 focus:border-[var(--primary-blue)] focus:ring-2 focus:ring-[var(--primary-blue)]/20'

function formatDigitsToDdMmYyyy(digits) {
  const d = (digits || '').replace(/\D/g, '').slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

function isoToDdMmYyyy(iso) {
  if (!iso || typeof iso !== 'string') return ''
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return ''
  return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`
}

function dateToOutputFormat(str) {
  if (!str || typeof str !== 'string') return str
  const parts = str.trim().split('/')
  if (parts.length !== 3) return str
  const [dd, mm, yyyy] = parts
  const monthNum = parseInt(mm, 10)
  if (monthNum < 1 || monthNum > 12) return str
  return `${dd.padStart(2, '0')}/${DATE_MONTHS[monthNum]}/${yyyy}`
}

const LEGITIMATION_DATE_KEYS = ['dateOfBirth', 'dateOfDeath', 'affidavitAckDate', 'affidavitLegitDate', 'dateOfMarriage', 'colbRegDate']

function DateInput({ value, onChange, placeholder = 'dd/mm/yyyy' }) {
  const pickerRef = useRef(null)
  const handleInputChange = (e) => {
    const formatted = formatDigitsToDdMmYyyy(e.target.value)
    onChange(formatted)
  }
  const isDigitsAndSlashes = /^[\d/]*$/.test((value || '').trim())
  const displayValue = isDigitsAndSlashes ? formatDigitsToDdMmYyyy(value) : (value || '')
  return (
    <div className="relative flex items-center gap-1">
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        maxLength={10}
        className={`${inputClass} pr-9`}
      />
      <button
        type="button"
        onClick={() => pickerRef.current?.showPicker?.() || pickerRef.current?.click()}
        className="absolute right-1.5 p-1 rounded text-gray-500 hover:bg-orange-200/60 focus:ring-2 focus:ring-[var(--primary-blue)]/30"
        title="Pick date"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      </button>
      <input
        ref={pickerRef}
        type="date"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => onChange(isoToDdMmYyyy(e.target.value))}
      />
    </div>
  )
}

function LegitimationSection({ number, title, children, instruction }) {
  return (
    <div className="mb-6 rounded-xl overflow-hidden border border-gray-100 bg-[var(--card-bg)] shadow-sm">
      <div className="bg-[var(--primary-blue)] text-white px-4 py-2.5 font-semibold text-sm uppercase tracking-wide">
        {number} {title}
      </div>
      {instruction && (
        <div className="legitimation-form-page__section-instruction">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          Instruction: {instruction}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}

export default function LegitimationForm() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const typeFromUrl = searchParams.get('type') || 'joint-affidavit'
  const editId = searchParams.get('id')
  const isEdit = searchParams.get('edit') === '1'
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState(() => {
    if (isEdit && editId) {
      const draft = getLegitimationDraft()
      if (draft && typeof draft === 'object') {
        return { ...defaultLegitimation, ...draft, formType: draft.formType || typeFromUrl || 'joint-affidavit' }
      }
    }
    return {
      ...defaultLegitimation,
      formType: LEGITIMATION_TYPES.find(t => t.id === typeFromUrl)?.id || typeFromUrl || 'joint-affidavit',
    }
  })

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const proceedToPrint = () => {
    const formForOutput = { ...form }
    LEGITIMATION_DATE_KEYS.forEach((key) => {
      if (formForOutput[key]) formForOutput[key] = dateToOutputFormat(formForOutput[key])
    })
    if (isEdit && editId) {
      updateSavedLegitimation(editId, formForOutput)
    } else {
      addSavedLegitimation(formForOutput)
    }
    navigate(`/legitimation/print?type=${form.formType}`)
  }

  useEffect(() => {
    const type = searchParams.get('type')
    if (type && LEGITIMATION_TYPES.some(t => t.id === type)) {
      setForm((prev) => ({ ...prev, formType: type }))
    }
  }, [searchParams])

  let sectionIndex = 0
  const sectionDelay = (i) => ({ animationDelay: `${i * 0.06}s` })

  return (
    <div className="legitimation-form-page no-print">
      <div className="legitimation-form-page__card">
        <header className="legitimation-form-page__header no-print">
          <h1>Legitimation Automated Data Entry Form</h1>
          <p>Unified Legal Status Automated Data Entry System — Iligan City</p>
        </header>

        <div className="legitimation-form-page__body">
      <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
      <LegitimationSection number="1" title="Birth of child registered in Iligan?" instruction={form.birthRegisteredIligan === 'YES' ? 'Fill-in ITEM 11' : null}>
        <div className="flex gap-4">
          <label className="flex items-center gap-2"><input type="radio" checked={form.birthRegisteredIligan === 'YES'} onChange={() => update('birthRegisteredIligan', 'YES')} /> YES</label>
          <label className="flex items-center gap-2"><input type="radio" checked={form.birthRegisteredIligan === 'NO'} onChange={() => update('birthRegisteredIligan', 'NO')} /> NO</label>
        </div>
      </LegitimationSection>
      </div>

      <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
      <LegitimationSection number="2" title="Acknowledged by father in COLB?" instruction={form.acknowledgedByFatherInColb === 'YES' ? "Don't Fill-in ITEM 8" : null}>
        <div className="flex gap-4">
          <label className="flex items-center gap-2"><input type="radio" checked={form.acknowledgedByFatherInColb === 'YES'} onChange={() => update('acknowledgedByFatherInColb', 'YES')} /> YES</label>
          <label className="flex items-center gap-2"><input type="radio" checked={form.acknowledgedByFatherInColb === 'NO'} onChange={() => update('acknowledgedByFatherInColb', 'NO')} /> NO</label>
        </div>
      </LegitimationSection>
      </div>

      <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
      <LegitimationSection number="3" title="Parent/s minor at the time of birth?">
        <div className="flex gap-4">
          <label className="flex items-center gap-2"><input type="radio" checked={form.parentsMinorAtBirth === 'YES'} onChange={() => update('parentsMinorAtBirth', 'YES')} /> YES</label>
          <label className="flex items-center gap-2"><input type="radio" checked={form.parentsMinorAtBirth === 'NO'} onChange={() => update('parentsMinorAtBirth', 'NO')} /> NO</label>
        </div>
      </LegitimationSection>
      </div>

      <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
      <LegitimationSection number="4" title="Details of child">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name of child (First, Middle, Surname)</label>
            <div className="grid grid-cols-3 gap-2">
              <input type="text" value={form.childFirst} onChange={(e) => update('childFirst', e.target.value)} placeholder="First" className={inputClass} />
              <input type="text" value={form.childMiddle} onChange={(e) => update('childMiddle', e.target.value)} placeholder="Middle" className={inputClass} />
              <input type="text" value={form.childLast} onChange={(e) => update('childLast', e.target.value)} placeholder="Surname" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
              <DateInput value={form.dateOfBirth} onChange={(v) => update('dateOfBirth', v)} placeholder="dd/mm/yyyy" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
              <input type="text" value={form.sex} onChange={(e) => update('sex', e.target.value)} placeholder="e.g. MALE" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Place of birth</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input type="text" value={form.placeOfBirthStreet} onChange={(e) => update('placeOfBirthStreet', e.target.value)} placeholder="House/Hospital/Street/Purok/Barangay" className={inputClass} />
              <input type="text" value={form.placeOfBirthCity} onChange={(e) => update('placeOfBirthCity', e.target.value)} placeholder="City/Municipality" className={inputClass} />
              <input type="text" value={form.placeOfBirthProvince} onChange={(e) => update('placeOfBirthProvince', e.target.value)} placeholder="Province" className={inputClass} />
            </div>
          </div>
        </div>
      </LegitimationSection>
      </div>

      <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
      <LegitimationSection number="5" title="Both parent/s alive/present?" instruction={form.bothParentsAlive === 'YES' ? 'Fill-up ITEM 6 ONLY and use JOINT AFFIDAVIT' : null}>
        <div className="flex gap-4">
          <label className="flex items-center gap-2"><input type="radio" checked={form.bothParentsAlive === 'YES'} onChange={() => update('bothParentsAlive', 'YES')} /> YES</label>
          <label className="flex items-center gap-2"><input type="radio" checked={form.bothParentsAlive === 'NO'} onChange={() => update('bothParentsAlive', 'NO')} /> NO</label>
        </div>
      </LegitimationSection>
      </div>

      <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
      <LegitimationSection number="6" title="Details of parents">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mother&apos;s maiden name (First, Middle, Surname)</label>
            <div className="grid grid-cols-3 gap-2">
              <input type="text" value={form.motherFirst} onChange={(e) => update('motherFirst', e.target.value)} className={inputClass} />
              <input type="text" value={form.motherMiddle} onChange={(e) => update('motherMiddle', e.target.value)} className={inputClass} />
              <input type="text" value={form.motherLast} onChange={(e) => update('motherLast', e.target.value)} className={inputClass} />
            </div>
            <input type="text" value={form.motherCitizenship} onChange={(e) => update('motherCitizenship', e.target.value)} placeholder="Citizenship" className={`${inputClass} mt-2`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Father&apos;s name (First, Middle, Surname)</label>
            <div className="grid grid-cols-3 gap-2">
              <input type="text" value={form.fatherFirst} onChange={(e) => update('fatherFirst', e.target.value)} className={inputClass} />
              <input type="text" value={form.fatherMiddle} onChange={(e) => update('fatherMiddle', e.target.value)} className={inputClass} />
              <input type="text" value={form.fatherLast} onChange={(e) => update('fatherLast', e.target.value)} className={inputClass} />
            </div>
            <input type="text" value={form.fatherCitizenship} onChange={(e) => update('fatherCitizenship', e.target.value)} placeholder="Citizenship" className={`${inputClass} mt-2`} />
          </div>
        </div>
      </LegitimationSection>
      </div>

      <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
      <LegitimationSection number="7" title="Details of surviving and deceased parent">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Surviving parent</label>
            <div className="grid grid-cols-3 gap-2">
              <input type="text" value={form.survivingParentFirst} onChange={(e) => update('survivingParentFirst', e.target.value)} className={inputClass} />
              <input type="text" value={form.survivingParentMiddle} onChange={(e) => update('survivingParentMiddle', e.target.value)} className={inputClass} />
              <input type="text" value={form.survivingParentLast} onChange={(e) => update('survivingParentLast', e.target.value)} className={inputClass} />
            </div>
            <input type="text" value={form.survivingParentCitizenship} onChange={(e) => update('survivingParentCitizenship', e.target.value)} placeholder="Citizenship" className={`${inputClass} mt-2`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deceased parent</label>
            <div className="grid grid-cols-3 gap-2">
              <input type="text" value={form.deceasedParentFirst} onChange={(e) => update('deceasedParentFirst', e.target.value)} className={inputClass} />
              <input type="text" value={form.deceasedParentMiddle} onChange={(e) => update('deceasedParentMiddle', e.target.value)} className={inputClass} />
              <input type="text" value={form.deceasedParentLast} onChange={(e) => update('deceasedParentLast', e.target.value)} className={inputClass} />
            </div>
            <div className="mt-2">
              <DateInput value={form.dateOfDeath} onChange={(v) => update('dateOfDeath', v)} placeholder="Date of death (dd/mm/yyyy)" />
            </div>
          </div>
        </div>
      </LegitimationSection>
      </div>

      <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
      <LegitimationSection number="8" title="Details of affidavit of acknowledgement">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registry number</label>
            <input type="text" value={form.affidavitAckRegistryNo} onChange={(e) => update('affidavitAckRegistryNo', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration date</label>
            <DateInput value={form.affidavitAckDate} onChange={(v) => update('affidavitAckDate', v)} placeholder="dd/mm/yyyy" />
          </div>
        </div>
      </LegitimationSection>
      </div>

      <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
      <LegitimationSection number="9" title="Details of the affidavit of legitimation">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registry number</label>
            <input type="text" value={form.affidavitLegitRegistryNo} onChange={(e) => update('affidavitLegitRegistryNo', e.target.value)} placeholder="e.g. 1139" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration date</label>
            <DateInput value={form.affidavitLegitDate} onChange={(v) => update('affidavitLegitDate', v)} placeholder="dd/mm/yyyy" />
          </div>
        </div>
      </LegitimationSection>
      </div>

      <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
      <LegitimationSection number="10" title="Details of marriage of parents">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registry number</label>
              <input type="text" value={form.marriageRegistryNo} onChange={(e) => update('marriageRegistryNo', e.target.value)} placeholder="e.g. 2024-13" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of marriage</label>
              <DateInput value={form.dateOfMarriage} onChange={(v) => update('dateOfMarriage', v)} placeholder="dd/mm/yyyy" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Place of marriage</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input type="text" value={form.placeOfMarriageCity} onChange={(e) => update('placeOfMarriageCity', e.target.value)} placeholder="City/Municipality" className={inputClass} />
              <input type="text" value={form.placeOfMarriageProvince} onChange={(e) => update('placeOfMarriageProvince', e.target.value)} placeholder="Province" className={inputClass} />
              <input type="text" value={form.placeOfMarriageCountry} onChange={(e) => update('placeOfMarriageCountry', e.target.value)} placeholder="Country" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Solemnizing officer</label>
            <input type="text" value={form.solemnizingOfficer} onChange={(e) => update('solemnizingOfficer', e.target.value)} placeholder="e.g. RICHIE GAY T. MENDOZA" className={inputClass} />
          </div>
        </div>
      </LegitimationSection>
      </div>

      <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
      <LegitimationSection number="11" title="Details of registered COLB of child">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registry number</label>
            <input type="text" value={form.colbRegistryNo} onChange={(e) => update('colbRegistryNo', e.target.value)} placeholder="e.g. 2023-2.146" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration date</label>
            <DateInput value={form.colbRegDate} onChange={(v) => update('colbRegDate', v)} placeholder="dd/mm/yyyy" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page number</label>
            <input type="text" value={form.colbPageNo} onChange={(e) => update('colbPageNo', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Book number</label>
            <input type="text" value={form.colbBookNo} onChange={(e) => update('colbBookNo', e.target.value)} className={inputClass} />
          </div>
        </div>
      </LegitimationSection>
      </div>

      <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
      <LegitimationSection number="12" title="Annotation" instruction="Choose from the two sample Annotations applicable to the client">
        <p className="text-sm text-gray-600 mb-2">
          A. ANNOTATION WITHOUT ACKNOWLEDGEMENT: Legitimated by the subsequent marriage of parents (name of spouse) and (name of spouse) on (date of marriage) at (place of marriage) under registry number (Affidavit of Legitimation).
        </p>
        <p className="text-sm text-gray-600">
          B. ANNOTATION WITH ACKNOWLEDGEMENT: Legitimated by the subsequent marriage of parents (name of spouse) and (name of spouse) on (date of marriage) at (place of marriage) under registry number (Affidavit of Legitimation). The child shall be known as (complete name of child).
        </p>
      </LegitimationSection>
      </div>

      <div className="legitimation-form-page__actions no-print">
        <button
          type="button"
          onClick={() => navigate('/legitimation')}
          className="legitimation-form-page__btn legitimation-form-page__btn--secondary"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="legitimation-form-page__btn legitimation-form-page__btn--primary"
        >
          Done
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 legitimation-form-page__modal-backdrop no-print" onClick={() => setShowConfirm(false)} role="dialog" aria-modal="true" aria-labelledby="legitimation-confirm-title">
          <div className="legitimation-form-page__modal-dialog bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-100" onClick={(e) => e.stopPropagation()}>
            <h3 id="legitimation-confirm-title" className="text-lg font-bold text-gray-800 mb-2">Confirm submission</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to proceed? Please verify that all entries are correct. You will be directed to the print view.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowConfirm(false)} className="legitimation-form-page__btn legitimation-form-page__btn--secondary">Cancel</button>
              <button type="button" onClick={() => { setShowConfirm(false); proceedToPrint() }} className="legitimation-form-page__btn legitimation-form-page__btn--primary">Confirm &amp; Proceed</button>
            </div>
          </div>
        </div>
      )}

      <p className="legitimation-form-page__footer-note no-print">created by: ATTY. YUSSIF DON JUSTINE F. MARTIL</p>
        </div>
      </div>
    </div>
  )
}
