import React, { useState, useEffect } from 'react'
import { afterUnsavedAcknowledge, useWarnIfUnsaved } from '../../hooks/useWarnIfUnsaved'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { defaultLegitimation, syncLegitimationTransmittalFlagWithFormType } from './lib/legitimationDefaults'
import { addSavedLegitimation, getLegitimationDraft, updateSavedLegitimation } from './lib/legitimationStorage'
import { DATE_MONTHS, LEGITIMATION_TYPES } from './constants'
import { commitFirstLetterUpperFromInput } from '../../lib/sentenceCase'
import ToastHost from '../../components/toast/ToastHost'
import { useToasts } from '../../components/toast/useToasts'
import { useDebouncedSuccessToast } from '../../hooks/useDebouncedSuccessToast'
import LcrRemarksFontSizeSelect from '../../components/lcr/LcrRemarksFontSizeSelect'
import { handleEnterFocusNextField } from '../../lib/formEnterFocusNext'
import { FormBodyFieldShortcuts } from '../../components/forms/FormBodyFieldShortcuts'
import FlexibleFormDateInput from '../../components/forms/FlexibleFormDateInput'
import { parseBirthToDate } from '../../lib/printUtils'

const inputClass = 'legitimation-form-page__input w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 transition-colors duration-150'

function isEmpty(v) {
  return v == null || String(v).trim() === ''
}

function getRequiredFields(form) {
  const base = [
    { key: 'childFirst', label: "Child's first name" },
    { key: 'childLast', label: "Child's surname" },
    { key: 'dateOfBirth', label: "Child's date of birth" },
    { key: 'sex', label: "Child's sex" },
    { key: 'placeOfBirthStreet', label: 'Place of birth (street/barangay)' },
    { key: 'placeOfBirthCity', label: 'Place of birth (city/municipality)' },
    { key: 'placeOfBirthProvince', label: 'Place of birth (province)' },
    { key: 'motherFirst', label: "Mother's first name" },
    { key: 'motherLast', label: "Mother's surname" },
    { key: 'fatherFirst', label: "Father's first name" },
    { key: 'fatherLast', label: "Father's surname" },
    { key: 'affidavitLegitDate', label: 'Affidavit of legitimation registration date' },
  ]
  if (form.birthRegisteredIligan !== 'NO') {
    base.push(
      { key: 'colbRegDate', label: 'COLB registration date' },
      { key: 'colbPageNo', label: 'COLB page number' },
      { key: 'colbBookNo', label: 'COLB book number' }
    )
  }
  if (form.acknowledgedByFatherInColb === 'NO') {
    base.push(
      { key: 'affidavitAckDate', label: 'Affidavit of acknowledgement registration date' }
    )
  }
  if (form.bothParentsAlive === 'NO') {
    base.push(
      { key: 'survivingParentFirst', label: 'Surviving parent first name' },
      { key: 'survivingParentLast', label: 'Surviving parent surname' },
      { key: 'deceasedParentFirst', label: 'Deceased parent first name' },
      { key: 'deceasedParentLast', label: 'Deceased parent surname' },
      { key: 'dateOfDeath', label: 'Date of death' }
    )
  }
  return base
}

function getMissingFields(form) {
  return getRequiredFields(form).filter(({ key }) => isEmpty(form[key]))
}

function dateToOutputFormat(str) {
  if (!str || typeof str !== 'string') return str
  const d = parseBirthToDate(str.trim())
  if (!d || isNaN(d.getTime())) return str
  const idx = d.getMonth() + 1
  const mon = DATE_MONTHS[idx]
  if (!mon) return str
  return `${String(d.getDate()).padStart(2, '0')}/${mon}/${d.getFullYear()}`
}

const LEGITIMATION_DATE_KEYS = ['dateOfBirth', 'dateOfDeath', 'affidavitAckDate', 'affidavitLegitDate', 'dateOfMarriage', 'colbRegDate']
const LEGITIMATION_TRANSMITTAL_TYPES = new Set(['transmittal', 'out-of-town-transmittal'])

function LegitimationSection({ number, title, children, instruction }) {
  return (
    <div className="legitimation-form-page__section-card mb-6 rounded-xl overflow-hidden border border-gray-200 bg-[var(--card-bg)] shadow-sm">
      <div className="legitimation-form-page__section-header bg-[var(--primary-blue)] text-white px-4 py-2.5 font-semibold text-sm uppercase tracking-wide">
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
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [missingFields, setMissingFields] = useState([])

  const [form, setForm] = useState(() => {
    if (isEdit && editId) {
      const draft = getLegitimationDraft()
      if (draft && typeof draft === 'object') {
        return syncLegitimationTransmittalFlagWithFormType({
          ...defaultLegitimation,
          ...draft,
          formType: draft.formType || typeFromUrl || 'joint-affidavit',
        })
      }
    }
    return {
      ...defaultLegitimation,
      formType: LEGITIMATION_TYPES.find(t => t.id === typeFromUrl)?.id || typeFromUrl || 'joint-affidavit',
    }
  })

  const [dirtyBaselineTick, setDirtyBaselineTick] = useState(0)
  useEffect(() => {
    const id = setTimeout(() => setDirtyBaselineTick((x) => x + 1), 120)
    return () => clearTimeout(id)
  }, [searchParams])

  const acknowledgeSaved = useWarnIfUnsaved(form, [searchParams.toString(), dirtyBaselineTick])

  const { toasts, show, dismiss } = useToasts()
  const notifyLcrCertSaved = useDebouncedSuccessToast(show)

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))
  const disableItem8 = form.acknowledgedByFatherInColb === 'YES'
  const disableItem11 = form.birthRegisteredIligan === 'NO'
  const scInput = (key) => (e) => {
    if (key === 'contactEmail') {
      update(key, e.target.value)
      return
    }
    commitFirstLetterUpperFromInput(e, (v) => update(key, v))
  }
  const onLcrCertPartyChange = (e) => {
    scInput('lcrCertificationRequestParty')(e)
    notifyLcrCertSaved()
  }

  useEffect(() => {
    setForm((prev) => {
      const s = (prev.sex || '').toString().trim().toUpperCase()
      const normalized = s === 'MALE' || s === 'FEMALE' ? s : ''
      return normalized === (prev.sex || '') ? prev : { ...prev, sex: normalized }
    })
  }, [])

  const proceedToPrint = () => {
    const formForOutput = { ...form }
    const editingId = String(editId || form._savedLegitimationId || '').trim()
    delete formForOutput._savedLegitimationId
    let finalSavedId = editingId
    LEGITIMATION_DATE_KEYS.forEach((key) => {
      if (formForOutput[key]) formForOutput[key] = dateToOutputFormat(formForOutput[key])
    })
    if (editingId) {
      const updated = updateSavedLegitimation(editingId, formForOutput)
      if (!updated) {
        const createdId = addSavedLegitimation(formForOutput)
        if (createdId) finalSavedId = String(createdId).trim()
      }
    } else {
      const createdId = addSavedLegitimation(formForOutput)
      if (createdId) finalSavedId = String(createdId).trim()
    }
    const path = finalSavedId
      ? `/legitimation/print?type=${form.formType}&id=${encodeURIComponent(finalSavedId)}`
      : `/legitimation/print?type=${form.formType}`
    afterUnsavedAcknowledge(acknowledgeSaved, () => navigate(path))
  }

  useEffect(() => {
    const type = searchParams.get('type')
    if (type && LEGITIMATION_TYPES.some(t => t.id === type)) {
      setForm((prev) => syncLegitimationTransmittalFlagWithFormType({ ...prev, formType: type }))
    }
  }, [searchParams])

  /** On legitimation transmittal views, keep one output only: local or out-of-town. */
  useEffect(() => {
    if (!LEGITIMATION_TRANSMITTAL_TYPES.has(form.formType)) return
    const want = form.legitimationTransmittalIsOutOfTown ? 'out-of-town-transmittal' : 'transmittal'
    if (form.formType === want) return
    setForm((prev) => (LEGITIMATION_TRANSMITTAL_TYPES.has(prev.formType) ? { ...prev, formType: want } : prev))
  }, [form.formType, form.legitimationTransmittalIsOutOfTown])

  let sectionIndex = 0
  const sectionDelay = (i) => ({ animationDelay: `${i * 0.06}s` })

  return (
    <div className="legitimation-form-page no-print">
      <div className="legitimation-form-page__card">
        <header className="legitimation-form-page__header no-print">
          <h1>Legitimation Automated Data Entry Form</h1>
          <p>Unified Legal Status Automated Data Entry System — Iligan City</p>
        </header>

        <FormBodyFieldShortcuts className="legitimation-form-page__body" onKeyDown={handleEnterFocusNextField}>
          <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
            <LegitimationSection
              number="1"
              title="Birth of child registered in Iligan?"
              instruction={form.birthRegisteredIligan === 'NO' ? "Don't Register the Affidavit of Legitimation, Don't prepare Form 1A and Don't Fill-in ITEM 11" : null}
            >
              <div className="legitimation-form-page__radio-group flex gap-4">
                <label className="legitimation-form-page__radio-label flex items-center gap-2"><input type="radio" className="legitimation-form-page__radio" checked={form.birthRegisteredIligan === 'YES'} onChange={() => update('birthRegisteredIligan', 'YES')} /> YES</label>
                <label className="legitimation-form-page__radio-label flex items-center gap-2"><input type="radio" className="legitimation-form-page__radio" checked={form.birthRegisteredIligan === 'NO'} onChange={() => update('birthRegisteredIligan', 'NO')} /> NO</label>
              </div>
            </LegitimationSection>
          </div>

          <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
            <LegitimationSection
              number="2"
              title="Acknowledged by father in COLB?"
              instruction={form.acknowledgedByFatherInColb === 'NO' ? 'Father is required to execute Affidavit of paternity/Acknowledgement and Fill-in ITEM 8' : null}
            >
              <div className="legitimation-form-page__radio-group flex gap-4">
                <label className="legitimation-form-page__radio-label flex items-center gap-2"><input type="radio" className="legitimation-form-page__radio" checked={form.acknowledgedByFatherInColb === 'YES'} onChange={() => update('acknowledgedByFatherInColb', 'YES')} /> YES</label>
                <label className="legitimation-form-page__radio-label flex items-center gap-2"><input type="radio" className="legitimation-form-page__radio" checked={form.acknowledgedByFatherInColb === 'NO'} onChange={() => update('acknowledgedByFatherInColb', 'NO')} /> NO</label>
              </div>
            </LegitimationSection>
          </div>

          <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
            <LegitimationSection
              number="3"
              title="Parent/s minor at the time of birth?"
              instruction={form.parentsMinorAtBirth === 'YES' ? 'Minority of the parent/s must be stated in the Affidavit of legitimation. Edit paragraph 2 and choose the statement that mentions EXCEPT AGE.' : null}
            >
              <div className="legitimation-form-page__radio-group flex gap-4">
                <label className="legitimation-form-page__radio-label flex items-center gap-2"><input type="radio" className="legitimation-form-page__radio" checked={form.parentsMinorAtBirth === 'YES'} onChange={() => update('parentsMinorAtBirth', 'YES')} /> YES</label>
                <label className="legitimation-form-page__radio-label flex items-center gap-2"><input type="radio" className="legitimation-form-page__radio" checked={form.parentsMinorAtBirth === 'NO'} onChange={() => update('parentsMinorAtBirth', 'NO')} /> NO</label>
              </div>
            </LegitimationSection>
          </div>

          <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
            <LegitimationSection
              number="3A"
              title="Transmittal type (local or out-of-town)"
            >
              <p className="text-sm text-gray-600 mb-3 max-w-2xl">
                Choose if this legitimation case is out of town. Print will show only one transmittal output: local Transmittal or Out-of-Town Transmittal.
              </p>
              <label className="flex items-start gap-3 mb-4 p-3 rounded-lg border border-gray-200 bg-white cursor-pointer hover:border-gray-300 transition-colors max-w-2xl">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 text-[var(--primary-blue)] focus:ring-[var(--primary-blue)]"
                  checked={Boolean(form.legitimationTransmittalIsOutOfTown)}
                  onChange={(e) => update('legitimationTransmittalIsOutOfTown', e.target.checked)}
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-900">Out of town</span>
                  <span className="block text-sm text-gray-600 mt-0.5">
                    Checked = Out-of-Town Transmittal only. Unchecked = local Transmittal only.
                  </span>
                </span>
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => update('legitimationTransmittalIsOutOfTown', false)}
                  className={`min-h-[2.75rem] px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-colors ${
                    !form.legitimationTransmittalIsOutOfTown
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  Local — Transmittal only
                </button>
                <button
                  type="button"
                  onClick={() => update('legitimationTransmittalIsOutOfTown', true)}
                  className={`min-h-[2.75rem] px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-colors ${
                    form.legitimationTransmittalIsOutOfTown
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  Out of town — Out-of-Town Transmittal only
                </button>
              </div>
            </LegitimationSection>
          </div>

          <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
            <LegitimationSection number="4" title="Details of child">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name of child (First, Middle, Surname)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" value={form.childFirst} onChange={scInput('childFirst')} placeholder="First" className={inputClass} />
                    <input type="text" value={form.childMiddle} onChange={scInput('childMiddle')} placeholder="Middle" className={inputClass} />
                    <input type="text" value={form.childLast} onChange={scInput('childLast')} placeholder="Surname" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
                    <FlexibleFormDateInput value={form.dateOfBirth} onChange={(v) => update('dateOfBirth', v)} placeholder="May 15 2026 or dd/mm/yyyy" inputClassName={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                    <div className="legitimation-form-page__gender-group flex gap-2" role="group" aria-label="Sex">
                      {['MALE', 'FEMALE'].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => update('sex', option)}
                          className={`legitimation-form-page__gender-chip ${form.sex === option ? 'legitimation-form-page__gender-chip--selected' : ''}`}
                        >
                          {option.charAt(0) + option.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Place of birth</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input type="text" value={form.placeOfBirthStreet} onChange={scInput('placeOfBirthStreet')} placeholder="House/Hospital/Street/Purok/Barangay" className={inputClass} />
                    <input type="text" value={form.placeOfBirthCity} onChange={scInput('placeOfBirthCity')} placeholder="City/Municipality" className={inputClass} />
                    <input type="text" value={form.placeOfBirthProvince} onChange={scInput('placeOfBirthProvince')} placeholder="Province" className={inputClass} />
                  </div>
                </div>
              </div>
            </LegitimationSection>
          </div>

          <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
            <LegitimationSection
              number="5"
              title="Both parent/s alive/present?"
              instruction={form.bothParentsAlive === 'NO' ? 'Fill-up ITEM 6 & 7 and use SOLE AFFIDAVIT' : null}
            >
              <div className="legitimation-form-page__radio-group flex gap-4">
                <label className="legitimation-form-page__radio-label flex items-center gap-2"><input type="radio" className="legitimation-form-page__radio" checked={form.bothParentsAlive === 'YES'} onChange={() => update('bothParentsAlive', 'YES')} /> YES</label>
                <label className="legitimation-form-page__radio-label flex items-center gap-2"><input type="radio" className="legitimation-form-page__radio" checked={form.bothParentsAlive === 'NO'} onChange={() => update('bothParentsAlive', 'NO')} /> NO</label>
              </div>
            </LegitimationSection>
          </div>

          <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
            <LegitimationSection number="6" title="Details of parents">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mother&apos;s maiden name (First, Middle, Surname)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" value={form.motherFirst} onChange={scInput('motherFirst')} className={inputClass} placeholder='First' />
                    <input type="text" value={form.motherMiddle} onChange={scInput('motherMiddle')} className={inputClass} placeholder='Middle' />
                    <input type="text" value={form.motherLast} onChange={scInput('motherLast')} className={inputClass} placeholder='Surname' />
                  </div>
                  <input type="text" value={form.motherCitizenship} onChange={scInput('motherCitizenship')} placeholder="Citizenship" className={`${inputClass} mt-2`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father&apos;s name (First, Middle, Surname)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" value={form.fatherFirst} onChange={scInput('fatherFirst')} className={inputClass} placeholder='First' />
                    <input type="text" value={form.fatherMiddle} onChange={scInput('fatherMiddle')} className={inputClass} placeholder='Middle' />
                    <input type="text" value={form.fatherLast} onChange={scInput('fatherLast')} className={inputClass} placeholder='Surname' />
                  </div>
                  <input type="text" value={form.fatherCitizenship} onChange={scInput('fatherCitizenship')} placeholder="Citizenship" className={`${inputClass} mt-2`} />
                </div>
              </div>
            </LegitimationSection>
          </div>

          <div className={`legitimation-form-page__section ${form.bothParentsAlive === 'YES' ? 'opacity-60' : ''}`} style={sectionDelay(sectionIndex++)}>
            <LegitimationSection
              number="7"
              title="Details of surviving and deceased parent"
              instruction={form.bothParentsAlive === 'YES' ? 'Disabled because both parents are alive (Item 5 is YES)' : null}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surviving parent</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" value={form.survivingParentFirst} onChange={scInput('survivingParentFirst')} className={`${inputClass} ${form.bothParentsAlive === 'YES' ? 'bg-gray-200 cursor-not-allowed' : ''}`} placeholder='First' disabled={form.bothParentsAlive === 'YES'} />
                    <input type="text" value={form.survivingParentMiddle} onChange={scInput('survivingParentMiddle')} className={`${inputClass} ${form.bothParentsAlive === 'YES' ? 'bg-gray-200 cursor-not-allowed' : ''}`} placeholder='Middle' disabled={form.bothParentsAlive === 'YES'} />
                    <input type="text" value={form.survivingParentLast} onChange={scInput('survivingParentLast')} className={`${inputClass} ${form.bothParentsAlive === 'YES' ? 'bg-gray-200 cursor-not-allowed' : ''}`} placeholder='Surname' disabled={form.bothParentsAlive === 'YES'} />
                  </div>
                  <input type="text" value={form.survivingParentCitizenship} onChange={scInput('survivingParentCitizenship')} placeholder="Citizenship" className={`${inputClass} mt-2 ${form.bothParentsAlive === 'YES' ? 'bg-gray-200 cursor-not-allowed' : ''}`} disabled={form.bothParentsAlive === 'YES'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deceased parent</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" value={form.deceasedParentFirst} onChange={scInput('deceasedParentFirst')} className={`${inputClass} ${form.bothParentsAlive === 'YES' ? 'bg-gray-200 cursor-not-allowed' : ''}`} placeholder='First' disabled={form.bothParentsAlive === 'YES'} />
                    <input type="text" value={form.deceasedParentMiddle} onChange={scInput('deceasedParentMiddle')} className={`${inputClass} ${form.bothParentsAlive === 'YES' ? 'bg-gray-200 cursor-not-allowed' : ''}`} placeholder='Middle' disabled={form.bothParentsAlive === 'YES'} />
                    <input type="text" value={form.deceasedParentLast} onChange={scInput('deceasedParentLast')} className={`${inputClass} ${form.bothParentsAlive === 'YES' ? 'bg-gray-200 cursor-not-allowed' : ''}`} placeholder='Surname' disabled={form.bothParentsAlive === 'YES'} />
                  </div>
                  <div className="mt-2">
                    <FlexibleFormDateInput value={form.dateOfDeath} onChange={(v) => update('dateOfDeath', v)} placeholder="May 15 2026 or dd/mm/yyyy" disabled={form.bothParentsAlive === 'YES'} inputClassName={`${inputClass} ${form.bothParentsAlive === 'YES' ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}`} />
                  </div>
                </div>
              </div>
            </LegitimationSection>
          </div>

          <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
            <LegitimationSection
              number="8"
              title="Details of affidavit of acknowledgement"
              instruction={disableItem8 ? 'Disabled because Item 2 is YES' : null}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registry number</label>
                  <input type="text" value={form.affidavitAckRegistryNo} onChange={scInput('affidavitAckRegistryNo')} className={`${inputClass} ${disableItem8 ? 'bg-gray-200 cursor-not-allowed' : ''}`} placeholder='e.g. 1139' disabled={disableItem8} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration date</label>
                  <FlexibleFormDateInput value={form.affidavitAckDate} onChange={(v) => update('affidavitAckDate', v)} placeholder="May 15 2026 or dd/mm/yyyy" disabled={disableItem8} inputClassName={`${inputClass} ${disableItem8 ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}`} />
                </div>
              </div>
            </LegitimationSection>
          </div>

          <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
            <LegitimationSection number="9" title="Details of the affidavit of legitimation">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registry number</label>
                  <input type="text" value={form.affidavitLegitRegistryNo} onChange={scInput('affidavitLegitRegistryNo')} placeholder="e.g. 1139" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration date</label>
                  <FlexibleFormDateInput value={form.affidavitLegitDate} onChange={(v) => update('affidavitLegitDate', v)} placeholder="May 15 2026 or dd/mm/yyyy" inputClassName={inputClass} />
                </div>
              </div>
            </LegitimationSection>
          </div>

          <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
            <LegitimationSection number="10" title="Details of marriage of parents" instruction="This section is optional — fill in when applicable.">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registry number <span className="font-normal text-gray-500">(optional)</span></label>
                    <input type="text" value={form.marriageRegistryNo} onChange={scInput('marriageRegistryNo')} placeholder="e.g. 2024-13" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of marriage <span className="font-normal text-gray-500">(optional)</span></label>
                    <FlexibleFormDateInput value={form.dateOfMarriage} onChange={(v) => update('dateOfMarriage', v)} placeholder="May 15 2026 or dd/mm/yyyy" inputClassName={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Place of marriage <span className="font-normal text-gray-500">(optional)</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input type="text" value={form.placeOfMarriageCity} onChange={scInput('placeOfMarriageCity')} placeholder="City/Municipality" className={inputClass} />
                    <input type="text" value={form.placeOfMarriageProvince} onChange={scInput('placeOfMarriageProvince')} placeholder="Province" className={inputClass} />
                    <input type="text" value={form.placeOfMarriageCountry} onChange={scInput('placeOfMarriageCountry')} placeholder="Country" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Solemnizing officer <span className="font-normal text-gray-500">(optional)</span></label>
                  <input type="text" value={form.solemnizingOfficer} onChange={scInput('solemnizingOfficer')} placeholder="e.g. RICHIE GAY T. MENDOZA" className={inputClass} />
                </div>
              </div>
            </LegitimationSection>
          </div>

          <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
            <LegitimationSection
              number="11"
              title="Details of registered COLB of child"
              instruction={disableItem11 ? 'Disabled because Item 1 is NO' : null}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registry number</label>
                  <input type="text" value={form.colbRegistryNo} onChange={scInput('colbRegistryNo')} placeholder="e.g. 2023-2.146" className={`${inputClass} ${disableItem11 ? 'bg-gray-200 cursor-not-allowed' : ''}`} disabled={disableItem11} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration date</label>
                  <FlexibleFormDateInput value={form.colbRegDate} onChange={(v) => update('colbRegDate', v)} placeholder="May 15 2026 or dd/mm/yyyy" disabled={disableItem11} inputClassName={`${inputClass} ${disableItem11 ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page number</label>
                  <input type="text" value={form.colbPageNo} onChange={scInput('colbPageNo')} className={`${inputClass} ${disableItem11 ? 'bg-gray-200 cursor-not-allowed' : ''}`} placeholder='e.g. 146' disabled={disableItem11} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Book number</label>
                  <input type="text" value={form.colbBookNo} onChange={scInput('colbBookNo')} className={`${inputClass} ${disableItem11 ? 'bg-gray-200 cursor-not-allowed' : ''}`} placeholder='e.g. 2' disabled={disableItem11} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">LCR Form 1A — party requesting certification (printed in bold)</label>
                  <input
                    type="text"
                    value={form.lcrCertificationRequestParty}
                    onChange={onLcrCertPartyChange}
                    placeholder="OCRG/OWNER/PARENTS/GUARDIAN"
                    className={`${inputClass} ${disableItem11 ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                    disabled={disableItem11}
                  />
                </div>
                <div className={`sm:col-span-2 ${disableItem11 ? 'opacity-50 pointer-events-none' : ''}`}>
                  <LcrRemarksFontSizeSelect
                    id="legitimation-lcr-remarks-font"
                    disabled={disableItem11}
                    value={form.lcrRemarksFontSizePt}
                    onChange={(v) => update('lcrRemarksFontSizePt', v)}
                    helpText="Controls how large the REMARKS paragraph prints on LCR Form 1A."
                  />
                </div>
              </div>
            </LegitimationSection>
          </div>

          <div className="legitimation-form-page__section" style={sectionDelay(sectionIndex++)}>
            <LegitimationSection number="12" title="Annotation" instruction="Choose from the two sample Annotations applicable to the client">
              <div className="mb-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => update('legitimationAnnotationOption', 'A')}
                  className={`min-h-[2.5rem] px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-colors ${
                    (form.legitimationAnnotationOption || 'A') === 'A'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  Use A
                </button>
                <button
                  type="button"
                  onClick={() => update('legitimationAnnotationOption', 'B')}
                  className={`min-h-[2.5rem] px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-colors ${
                    form.legitimationAnnotationOption === 'B'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  Use B
                </button>
              </div>
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
              onClick={() => {
                const missing = getMissingFields(form)
                if (missing.length > 0) {
                  setMissingFields(missing)
                  setShowValidationModal(true)
                  return
                }
                setShowConfirm(true)
              }}
              className="legitimation-form-page__btn legitimation-form-page__btn--primary"
            >
              Done
            </button>
            {isEdit ? (
              <button
                type="button"
                onClick={() => navigate('/legitimation/saved')}
                className="legitimation-form-page__btn legitimation-form-page__btn--secondary"
              >
                Back to Files Saved
              </button>
            ) : null}
          </div>

          {showValidationModal && (
            <div
              className="legitimation-form-page__validation-backdrop legitimation-form-page__modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 no-print"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="legitimation-validation-title"
              aria-describedby="legitimation-validation-desc"
              onClick={() => setShowValidationModal(false)}
            >
              <div
                className="legitimation-form-page__validation-modal legitimation-form-page__modal-dialog no-print"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="legitimation-form-page__validation-strip" aria-hidden />
                <div className="legitimation-form-page__validation-body">
                  <div className="legitimation-form-page__validation-icon" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      <path d="M12 16h.01" strokeWidth="2.5" />
                    </svg>
                  </div>
                  <div className="legitimation-form-page__validation-content">
                    <h2 id="legitimation-validation-title" className="legitimation-form-page__validation-title">
                      All required fields must be filled out
                    </h2>
                    <p id="legitimation-validation-desc" className="legitimation-form-page__validation-desc">
                      You cannot proceed until every required field is completed. Please review and fill in the items below.
                    </p>
                    {missingFields.length > 0 && (
                      <div className="legitimation-form-page__validation-list-wrap">
                        <p className="legitimation-form-page__validation-list-label">Missing ({missingFields.length}):</p>
                        <ul className="legitimation-form-page__validation-list">
                          {missingFields.map(({ label }) => (
                            <li key={label}>{label}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="legitimation-form-page__validation-actions">
                      <button
                        type="button"
                        onClick={() => setShowValidationModal(false)}
                        className="legitimation-form-page__validation-btn"
                      >
                        Got it
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
        </FormBodyFieldShortcuts>
      </div>
      <ToastHost toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
