import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { defaultCourtDecree } from './lib/courtDecreeDefaults'
import { addSavedCourtDecree, getCourtDecreeDraft, updateSavedCourtDecree, saveCourtDecreeDraft } from './lib/courtDecreeStorage'
import { COURT_DECREE_TYPES, AFFECTED_DOCUMENT_OPTIONS, DATE_MONTHS } from './constants'
import { isLcr1aTableComplete, isLcr2aTableComplete, isLcr3aTableComplete } from './lib/courtDecreeLcrCompletion'
import { commitFirstLetterUpperFromInput } from '../../lib/sentenceCase'
import { parseDdMmYyyyToDate, parseBirthToDate } from '../../lib/printUtils'
const LCR_FORM_TYPES = ['lcr-form-1a', 'lcr-form-2a', 'lcr-form-3a']

const inputClass = 'court-decree-form-page__input w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 transition-colors duration-150'

function isEmpty(v) {
  return v == null || String(v).trim() === ''
}

const REQUIRED_FIELDS = [
  { key: 'country', label: 'Country' },
  { key: 'courtOrRacco', label: 'Court or Racco' },
  { key: 'documentOwnerName', label: 'Document owner/s' },
  { key: 'dateIssued', label: 'Date Issued' },
  { key: 'courtThatIssued', label: 'Court that issued the decree' },
  { key: 'issuedByTitle', label: 'Issued/Rendered By (Title)' },
  { key: 'issuedByName', label: 'Issued/Rendered By (Name)' },
  { key: 'typeOfCase', label: 'Type of Case' },
  { key: 'caseNo', label: 'Case No' },
  { key: 'authenticatedBy', label: 'Authenticated By' },
  { key: 'registryNumber', label: 'Registry Number' },
  { key: 'dateRegistered', label: 'Date Registered' },
  { key: 'caseTitle', label: 'Case Title' },
]

/** LCR Form 1A: only the printed facts table */
const REQUIRED_LCR_1A_TABLE = [
  { key: 'lcr1aRegistryNumber', label: 'LCR Registry Number' },
  { key: 'lcr1aDateRegistration', label: 'Date of Registration' },
  { key: 'lcr1aNameOfChild', label: 'Name of Child' },
  { key: 'lcr1aSex', label: 'Sex' },
  { key: 'lcr1aDateOfBirth', label: 'Date of Birth' },
  { key: 'lcr1aPlaceOfBirth', label: 'Place of Birth' },
  { key: 'lcr1aNameOfMother', label: 'Name of Mother' },
  { key: 'lcr1aMotherCitizenship', label: 'Citizenship of Mother' },
  { key: 'lcr1aNameOfFather', label: 'Name of Father' },
  { key: 'lcr1aFatherCitizenship', label: 'Citizenship of Father' },
  { key: 'lcr1aDateMarriageParents', label: 'Date of Marriage of Parents' },
  { key: 'lcr1aPlaceMarriageParents', label: 'Place of Marriage of Parents' },
]

const REQUIRED_LCR_2A_TABLE = [
  { key: 'lcr2aRegistryNumber', label: 'LCR Registry Number' },
  { key: 'lcr2aDateRegistration', label: 'Date of Registration' },
  { key: 'lcr2aNameDeceased', label: 'Name of Deceased' },
  { key: 'lcr2aSex', label: 'Sex' },
  { key: 'lcr2aCivilStatus', label: 'Civil Status' },
  { key: 'lcr2aCitizenship', label: 'Citizenship' },
  { key: 'lcr2aDateDeath', label: 'Date of Death' },
  { key: 'lcr2aCitizenshipFather', label: 'Citizenship of Father' },
  { key: 'lcr2aPlaceDeath', label: 'Place of Death' },
  { key: 'lcr2aCauseDeath', label: 'Cause of Death' },
]

const REQUIRED_LCR_3A_TABLE = [
  { key: 'lcr3aHusbandName', label: 'Husband — Name' },
  { key: 'lcr3aHusbandCitizenship', label: 'Husband — Citizenship' },
  { key: 'lcr3aHusbandCivilStatus', label: 'Husband — Civil Status' },
  { key: 'lcr3aHusbandMother', label: 'Husband — Mother' },
  { key: 'lcr3aHusbandFather', label: 'Husband — Father' },
  { key: 'lcr3aWifeName', label: 'Wife — Name' },
  { key: 'lcr3aWifeCitizenship', label: 'Wife — Citizenship' },
  { key: 'lcr3aWifeCivilStatus', label: 'Wife — Civil Status' },
  { key: 'lcr3aWifeMother', label: 'Wife — Mother' },
  { key: 'lcr3aWifeFather', label: 'Wife — Father' },
  { key: 'lcr3aRegistryNumber', label: 'Registry Number' },
  { key: 'lcr3aDateRegistration', label: 'Date of Registration' },
  { key: 'lcr3aDateMarriage', label: 'Date of Marriage' },
  { key: 'lcr3aPlaceMarriage', label: 'Place of Marriage' },
]

function LcrFormCompleteIcon({ show }) {
  if (!show) return null
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4 text-green-600 shrink-0"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  )
}

/** FORM 1A / 2A / 3A switcher with green check when that table is fully filled */
function LcrFormNavLinks({ form, activeType, showFullCourtLink = true }) {
  const c1 = isLcr1aTableComplete(form)
  const c2 = isLcr2aTableComplete(form)
  const c3 = isLcr3aTableComplete(form)
  const cls = (t) =>
    `court-decree-form-page__form-link inline-flex items-center gap-1${activeType === t ? ' court-decree-form-page__form-link--active' : ''}`
  return (
    <div className={`court-decree-form-page__form-links flex flex-wrap items-center gap-2${showFullCourtLink ? ' mb-4' : ''}`}>
      <Link
        to="/court-decree/form?type=lcr-form-1a"
        className={cls('lcr-form-1a')}
        aria-label={c1 ? 'FORM 1A, all required fields filled' : 'FORM 1A'}
      >
        <span>FORM 1A</span>
        <LcrFormCompleteIcon show={c1} />
      </Link>
      <Link
        to="/court-decree/form?type=lcr-form-2a"
        className={cls('lcr-form-2a')}
        aria-label={c2 ? 'FORM 2A, all required fields filled' : 'FORM 2A'}
      >
        <span>FORM 2A</span>
        <LcrFormCompleteIcon show={c2} />
      </Link>
      <Link
        to="/court-decree/form?type=lcr-form-3a"
        className={cls('lcr-form-3a')}
        aria-label={c3 ? 'FORM 3A, all required fields filled' : 'FORM 3A'}
      >
        <span>FORM 3A</span>
        <LcrFormCompleteIcon show={c3} />
      </Link>
      {showFullCourtLink ? (
        <Link to="/court-decree/form?type=cert-authenticity" className="text-sm text-[var(--primary-blue)] underline self-center ml-2">
          Full court decree form
        </Link>
      ) : null}
    </div>
  )
}

function hasLcr3aHusbandDob(form) {
  if (!isEmpty(form.lcr3aHusbandDobAge)) return true
  return parseBirthToDate(form.husbandDateOfBirth) != null
}
function hasLcr3aWifeDob(form) {
  if (!isEmpty(form.lcr3aWifeDobAge)) return true
  return parseBirthToDate(form.wifeDateOfBirth) != null
}

function getMissingFields(form) {
  if (form.formType === 'lcr-form-1a') {
    return REQUIRED_LCR_1A_TABLE.filter(({ key }) => isEmpty(form[key]))
  }
  if (form.formType === 'lcr-form-2a') {
    return REQUIRED_LCR_2A_TABLE.filter(({ key }) => isEmpty(form[key]))
  }
  if (form.formType === 'lcr-form-3a') {
    const missing = REQUIRED_LCR_3A_TABLE.filter(({ key }) => isEmpty(form[key]))
    if (!hasLcr3aHusbandDob(form)) missing.push({ key: 'husbandDateOfBirth', label: 'Husband — Date of Birth' })
    if (!hasLcr3aWifeDob(form)) missing.push({ key: 'wifeDateOfBirth', label: 'Wife — Date of Birth' })
    return missing
  }
  return REQUIRED_FIELDS.filter(({ key }) => isEmpty(form[key]))
}

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

function refDateForAge(marriageDdMmYyyy) {
  const m = parseDdMmYyyyToDate(String(marriageDdMmYyyy || '').trim())
  if (m) return m
  return new Date()
}

function computeAgeYears(birth, ref) {
  if (!birth || !ref || isNaN(birth.getTime()) || isNaN(ref.getTime())) return null
  let age = ref.getFullYear() - birth.getFullYear()
  const mo = ref.getMonth() - birth.getMonth()
  if (mo < 0 || (mo === 0 && ref.getDate() < birth.getDate())) age--
  return Math.max(0, age)
}

function formatFlexibleBirthDigits(digits) {
  const d = digits.replace(/\D/g, '').slice(0, 8)
  if (d.length === 0) return ''
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  if (d.length <= 6) return `${d.slice(0, 2)}/${d.slice(2, 6)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4, 8)}`
}

function storedBirthToDisplay(stored) {
  const raw = String(stored || '').trim()
  if (!raw) return ''
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return isoToDdMmYyyy(raw.slice(0, 10))
  return raw
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

const COURT_DECREE_DATE_KEYS = ['dateIssued', 'dateRegistered']

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
        className="court-decree-form-page__date-picker-btn absolute right-1.5 p-1 rounded text-gray-500"
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

/** Type dd/mm/yyyy (8 digits) or mm/yyyy (6 digits), or use calendar. */
function FlexibleBirthDateInput({ value, onChange }) {
  const pickerRef = useRef(null)
  const displayStored = storedBirthToDisplay(value)
  const digitsOnly = displayStored.replace(/\D/g, '')
  const displayValue = formatFlexibleBirthDigits(digitsOnly)

  return (
    <div className="relative flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[180px]">
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={(e) => onChange(formatFlexibleBirthDigits(e.target.value))}
          placeholder="dd/mm/yyyy or mm/yyyy"
          maxLength={10}
          className={`${inputClass} pr-9 w-full`}
        />
        <button
          type="button"
          onClick={() => pickerRef.current?.showPicker?.() || pickerRef.current?.click()}
          className="court-decree-form-page__date-picker-btn absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded text-gray-500"
          title="Pick full date"
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
      {displayValue ? (
        <button type="button" className="text-sm text-[var(--primary-blue)] underline shrink-0" onClick={() => onChange('')}>
          Clear
        </button>
      ) : null}
    </div>
  )
}

/** Document owner from LCR 1A/2A/3A when main decree field is empty */
function deriveDocumentOwnerFromLcr(f) {
  if (!f || typeof f !== 'object') return ''
  const aff = String(f.affectedDocument || '').trim()
  const child = String(f.lcr1aNameOfChild || '').trim()
  const deceased = String(f.lcr2aNameDeceased || '').trim()
  const h = String(f.lcr3aHusbandName || '').trim()
  const w = String(f.lcr3aWifeName || '').trim()
  const marriage = h && w ? `${h} & ${w}` : h || w
  if (aff === 'BIRTH_CERTIFICATE' && child) return child
  if (aff === 'DEATH_CERTIFICATE' && deceased) return deceased
  if (aff === 'MARRIAGE_CERTIFICATE' && marriage) return marriage
  if (child) return child
  if (deceased) return deceased
  if (marriage) return marriage
  return ''
}

function CourtDecreeSection({ number, title, children }) {
  return (
    <div className="court-decree-form-page__section-card mb-6 rounded-xl overflow-hidden border border-gray-200 bg-[var(--card-bg)] shadow-sm">
      <div className="court-decree-form-page__section-header bg-[var(--primary-blue)] text-white px-4 py-2.5 font-semibold text-sm uppercase tracking-wide">
        {number} {title}
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}

export default function CourtDecreeForm() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const typeFromUrl = searchParams.get('type') || 'cert-authenticity'
  const [showConfirm, setShowConfirm] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [showContinueDecreeModal, setShowContinueDecreeModal] = useState(false)
  const [missingFields, setMissingFields] = useState([])

  const editId = searchParams.get('id')
  const isEdit = searchParams.get('edit') === '1'
  const [blockPrintReason, setBlockPrintReason] = useState(null)

  const urlToAffectedDoc = (t) => {
    if (t === 'lcr-form-1a') return 'BIRTH_CERTIFICATE'
    if (t === 'lcr-form-2a') return 'DEATH_CERTIFICATE'
    if (t === 'lcr-form-3a') return 'MARRIAGE_CERTIFICATE'
    return null
  }

  const [form, setForm] = useState(() => {
    const base = { ...defaultCourtDecree }
    if (isEdit && editId) {
      const draft = getCourtDecreeDraft()
      if (draft && typeof draft === 'object') {
        Object.assign(base, draft, { formType: draft.formType || typeFromUrl || 'cert-authenticity' })
        return base
      }
    }
    base.formType = COURT_DECREE_TYPES.find(t => t.id === typeFromUrl)?.id || typeFromUrl || 'cert-authenticity'
    const affected = urlToAffectedDoc(typeFromUrl)
    if (affected) base.affectedDocument = affected
    return base
  })

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))
  const scInput = (key) => (e) => {
    if (key === 'contactEmail') {
      update(key, e.target.value)
      return
    }
    commitFirstLetterUpperFromInput(e, (v) => update(key, v))
  }

  const proceedToPrint = () => {
    const formForOutput = { ...form }
    COURT_DECREE_DATE_KEYS.forEach((key) => {
      if (formForOutput[key]) formForOutput[key] = dateToOutputFormat(formForOutput[key])
    })
    if (isEdit && editId) {
      updateSavedCourtDecree(editId, formForOutput)
    } else {
      addSavedCourtDecree(formForOutput)
    }
    navigate(`/court-decree/print?type=${form.formType}`)
  }

  useEffect(() => {
    if (searchParams.get('hydrateDraft') === '1') return
    const type = searchParams.get('type')
    if (type && COURT_DECREE_TYPES.some(t => t.id === type)) {
      setForm((prev) => {
        const next = { ...prev, formType: type }
        const affected = urlToAffectedDoc(type)
        if (affected) next.affectedDocument = affected
        return next
      })
    }
  }, [searchParams])

  const hydrateDraft = searchParams.get('hydrateDraft')
  useEffect(() => {
    if (hydrateDraft !== '1') return
    try {
      const d = getCourtDecreeDraft()
      if (d && typeof d === 'object') {
        const merged = { ...defaultCourtDecree, ...d, formType: 'cert-authenticity' }
        setForm(merged)
      }
    } finally {
      navigate('/court-decree/form?type=cert-authenticity', { replace: true })
    }
  }, [hydrateDraft, navigate])

  const handleLcrTableCompleteContinue = () => {
    const missing = getMissingFields(form)
    if (missing.length > 0) {
      setMissingFields(missing)
      setShowValidationModal(true)
      return
    }
    setShowContinueDecreeModal(true)
  }

  const confirmContinueToFullCourtDecree = () => {
    let doc = ''
    if (form.formType === 'lcr-form-1a') doc = (form.lcr1aNameOfChild || '').trim()
    else if (form.formType === 'lcr-form-2a') doc = (form.lcr2aNameDeceased || '').trim()
    else if (form.formType === 'lcr-form-3a') {
      const h = (form.lcr3aHusbandName || '').trim()
      const w = (form.lcr3aWifeName || '').trim()
      doc = h && w ? `${h} & ${w}` : h || w
    }
    const aff = urlToAffectedDoc(form.formType)
    saveCourtDecreeDraft({
      ...form,
      formType: 'cert-authenticity',
      affectedDocument: aff || form.affectedDocument,
      documentOwnerName: doc || form.documentOwnerName,
    })
    setShowContinueDecreeModal(false)
    navigate('/court-decree/form?type=cert-authenticity&hydrateDraft=1')
  }

  useEffect(() => {
    if (form.formType === 'lcr-form-1a') {
      if ((form.lcr1aNameOfChild || '').trim()) setBlockPrintReason(null)
    } else if (form.formType === 'lcr-form-2a') {
      if ((form.lcr2aNameDeceased || '').trim()) setBlockPrintReason(null)
    } else if (form.formType === 'lcr-form-3a') {
      if ((form.lcr3aHusbandName || '').trim() && (form.lcr3aWifeName || '').trim()) setBlockPrintReason(null)
    } else if ((form.documentOwnerName || '').trim()) setBlockPrintReason(null)
  }, [form.documentOwnerName, form.lcr1aNameOfChild, form.lcr2aNameDeceased, form.lcr3aHusbandName, form.lcr3aWifeName, form.formType])

  const isLcrFormType = LCR_FORM_TYPES.includes(form.formType)

  let sectionIndex = 0
  const sectionDelay = (i) => ({ animationDelay: `${i * 0.06}s` })

  return (
    <div className="court-decree-form-page no-print">
      <div className="court-decree-form-page__card">
        <header className="court-decree-form-page__header no-print">
          <h1>
            {form.formType === 'lcr-form-1a'
              ? 'LCR Form No. 1A (Birth-Available)'
              : form.formType === 'lcr-form-2a'
                ? 'LCR Form No. 2A (Death-Available)'
                : form.formType === 'lcr-form-3a'
                  ? 'LCR Form No. 3A (Marriage-Available)'
                  : 'Court Decree Automated Data Entry Form'}
          </h1>
          <p>
            {form.formType === 'lcr-form-1a'
              ? 'Facts table only — same fields as print output'
              : form.formType === 'lcr-form-2a'
                ? 'Death table only — same fields as print output'
                : form.formType === 'lcr-form-3a'
                  ? 'Marriage table only — same fields as print output'
                  : 'Unified Legal Status Automated Data Entry System — Iligan City'}
          </p>
        </header>

        <div className="court-decree-form-page__body">
      {form.formType === 'lcr-form-1a' ? (
      <div className="court-decree-form-page__section" style={sectionDelay(0)}>
        <LcrFormNavLinks form={form} activeType="lcr-form-1a" />
        <CourtDecreeSection number="1" title="Table fields">
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LCR Registry Number</label>
              <input type="text" value={form.lcr1aRegistryNumber} onChange={scInput('lcr1aRegistryNumber')} placeholder="e.g. 2002-1956" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Registration</label>
              <DateInput value={form.lcr1aDateRegistration} onChange={(v) => update('lcr1aDateRegistration', v)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name of Child</label>
              <input type="text" value={form.lcr1aNameOfChild} onChange={scInput('lcr1aNameOfChild')} placeholder="e.g. ABDARIE LANTUD IBRAHIM" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
              <select value={form.lcr1aSex} onChange={(e) => update('lcr1aSex', e.target.value)} className={inputClass}>
                <option value="">—</option>
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <DateInput value={form.lcr1aDateOfBirth} onChange={(v) => update('lcr1aDateOfBirth', v)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Place of Birth</label>
              <input type="text" value={form.lcr1aPlaceOfBirth} onChange={scInput('lcr1aPlaceOfBirth')} placeholder="e.g. 8 EAST ROS. HTS. TUBOD" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name of Mother</label>
              <input type="text" value={form.lcr1aNameOfMother} onChange={scInput('lcr1aNameOfMother')} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Citizenship of Mother</label>
              <input type="text" value={form.lcr1aMotherCitizenship} onChange={scInput('lcr1aMotherCitizenship')} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name of Father</label>
              <input type="text" value={form.lcr1aNameOfFather} onChange={scInput('lcr1aNameOfFather')} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Citizenship of Father</label>
              <input type="text" value={form.lcr1aFatherCitizenship} onChange={scInput('lcr1aFatherCitizenship')} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Marriage of Parents</label>
              <DateInput value={form.lcr1aDateMarriageParents} onChange={(v) => update('lcr1aDateMarriageParents', v)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Place of Marriage of Parents</label>
              <input type="text" value={form.lcr1aPlaceMarriageParents} onChange={scInput('lcr1aPlaceMarriageParents')} placeholder="e.g. SAGUIARAN, LANAO DEL SUR" className={inputClass} />
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">When this table is fully filled, continue to the main court decree form for country, court decree details, and other print types.</p>
              <button
                type="button"
                onClick={handleLcrTableCompleteContinue}
                className="court-decree-form-page__btn px-4 py-2.5 rounded-lg font-semibold text-sm bg-white border-2 border-[var(--primary-blue)] text-[var(--primary-blue)] hover:bg-[var(--primary-blue)]/5"
              >
                Table complete — continue to court decree form
              </button>
            </div>
          </div>
        </CourtDecreeSection>
      </div>
      ) : form.formType === 'lcr-form-2a' ? (
      <div className="court-decree-form-page__section" style={sectionDelay(0)}>
        <LcrFormNavLinks form={form} activeType="lcr-form-2a" />
        <CourtDecreeSection number="1" title="Table fields">
          <div className="space-y-4 max-w-2xl">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">LCR Registry Number</label><input type="text" value={form.lcr2aRegistryNumber} onChange={scInput('lcr2aRegistryNumber')} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date of Registration</label><DateInput value={form.lcr2aDateRegistration} onChange={(v) => update('lcr2aDateRegistration', v)} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Name of Deceased</label><input type="text" value={form.lcr2aNameDeceased} onChange={scInput('lcr2aNameDeceased')} className={inputClass} /></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
              <select value={form.lcr2aSex} onChange={(e) => update('lcr2aSex', e.target.value)} className={inputClass}>
                <option value="">—</option>
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Civil Status</label><input type="text" value={form.lcr2aCivilStatus} onChange={scInput('lcr2aCivilStatus')} placeholder="e.g. SINGLE" className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Citizenship</label><input type="text" value={form.lcr2aCitizenship} onChange={scInput('lcr2aCitizenship')} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date of Death</label><DateInput value={form.lcr2aDateDeath} onChange={(v) => update('lcr2aDateDeath', v)} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Citizenship of Father</label><input type="text" value={form.lcr2aCitizenshipFather} onChange={scInput('lcr2aCitizenshipFather')} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Place of Death</label><input type="text" value={form.lcr2aPlaceDeath} onChange={scInput('lcr2aPlaceDeath')} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Cause of Death</label><textarea value={form.lcr2aCauseDeath} onChange={scInput('lcr2aCauseDeath')} rows={4} className={inputClass} placeholder="As stated on the record" /></div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">When this table is fully filled, continue to the main court decree form for country, court decree details, and other print types.</p>
              <button
                type="button"
                onClick={handleLcrTableCompleteContinue}
                className="court-decree-form-page__btn px-4 py-2.5 rounded-lg font-semibold text-sm bg-white border-2 border-[var(--primary-blue)] text-[var(--primary-blue)] hover:bg-[var(--primary-blue)]/5"
              >
                Table complete — continue to court decree form
              </button>
            </div>
          </div>
        </CourtDecreeSection>
      </div>
      ) : form.formType === 'lcr-form-3a' ? (
      <div className="court-decree-form-page__section" style={sectionDelay(0)}>
        <LcrFormNavLinks form={form} activeType="lcr-form-3a" />
        <CourtDecreeSection number="1" title="Table fields (Husband / Wife / Marriage)">
          <div className="space-y-6 max-w-3xl">
            <div>
              <p className="font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-3">Husband</p>
              <div className="space-y-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={form.lcr3aHusbandName} onChange={scInput('lcr3aHusbandName')} placeholder="e.g. NORHADJE P. DIRAMPATAN" className={inputClass} /></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <FlexibleBirthDateInput
                    value={form.husbandDateOfBirth}
                    onChange={(v) =>
                      setForm((prev) => {
                        const ref = refDateForAge(prev.lcr3aDateMarriage)
                        const hb = parseBirthToDate(v)
                        return {
                          ...prev,
                          husbandDateOfBirth: v,
                          lcr3aHusbandDobAge: '',
                          husbandAge: hb ? String(computeAgeYears(hb, ref)) : '',
                        }
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Type <strong>dd/mm/yyyy</strong> (8 digits) or <strong>mm/yyyy</strong> (6 digits) for month/year only. Calendar sets full date. Age fills automatically from <strong>Date of Marriage</strong> below (or today if empty).
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age (auto)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.husbandAge}
                    onChange={(e) => update('husbandAge', e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="Fills when DOB is set"
                    className={inputClass}
                  />
                </div>
                {form.lcr3aHusbandDobAge && !form.husbandDateOfBirth ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Legacy free-text DOB/Age (clear to use calendar above)</label>
                    <input type="text" value={form.lcr3aHusbandDobAge} onChange={scInput('lcr3aHusbandDobAge')} className={inputClass} />
                  </div>
                ) : null}
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Citizenship</label><input type="text" value={form.lcr3aHusbandCitizenship} onChange={scInput('lcr3aHusbandCitizenship')} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Civil Status</label><input type="text" value={form.lcr3aHusbandCivilStatus} onChange={scInput('lcr3aHusbandCivilStatus')} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Mother</label><input type="text" value={form.lcr3aHusbandMother} onChange={scInput('lcr3aHusbandMother')} placeholder="e.g. MARIAM T. PIQUERO (D)" className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Father</label><input type="text" value={form.lcr3aHusbandFather} onChange={scInput('lcr3aHusbandFather')} className={inputClass} /></div>
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-3">Wife</p>
              <div className="space-y-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={form.lcr3aWifeName} onChange={scInput('lcr3aWifeName')} placeholder="e.g. AURORA JOSE MARIE C. FIGUEROA" className={inputClass} /></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <FlexibleBirthDateInput
                    value={form.wifeDateOfBirth}
                    onChange={(v) =>
                      setForm((prev) => {
                        const ref = refDateForAge(prev.lcr3aDateMarriage)
                        const wb = parseBirthToDate(v)
                        return {
                          ...prev,
                          wifeDateOfBirth: v,
                          lcr3aWifeDobAge: '',
                          wifeAge: wb ? String(computeAgeYears(wb, ref)) : '',
                        }
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Type <strong>dd/mm/yyyy</strong> or <strong>mm/yyyy</strong>, or use calendar. Age updates from date of marriage (or today).
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age (auto)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.wifeAge}
                    onChange={(e) => update('wifeAge', e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="Fills when DOB is set"
                    className={inputClass}
                  />
                </div>
                {form.lcr3aWifeDobAge && !form.wifeDateOfBirth ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Legacy free-text DOB/Age (clear to use calendar above)</label>
                    <input type="text" value={form.lcr3aWifeDobAge} onChange={scInput('lcr3aWifeDobAge')} className={inputClass} />
                  </div>
                ) : null}
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Citizenship</label><input type="text" value={form.lcr3aWifeCitizenship} onChange={scInput('lcr3aWifeCitizenship')} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Civil Status</label><input type="text" value={form.lcr3aWifeCivilStatus} onChange={scInput('lcr3aWifeCivilStatus')} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Mother</label><input type="text" value={form.lcr3aWifeMother} onChange={scInput('lcr3aWifeMother')} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Father</label><input type="text" value={form.lcr3aWifeFather} onChange={scInput('lcr3aWifeFather')} placeholder="e.g. JOSE G. FIGUEROA (D)" className={inputClass} /></div>
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-3">Marriage</p>
              <div className="space-y-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Registry Number</label><input type="text" value={form.lcr3aRegistryNumber} onChange={scInput('lcr3aRegistryNumber')} placeholder="e.g. 2009-813" className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date of Registration</label><DateInput value={form.lcr3aDateRegistration} onChange={(v) => update('lcr3aDateRegistration', v)} /></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Marriage</label>
                  <DateInput
                    value={form.lcr3aDateMarriage}
                    onChange={(v) =>
                      setForm((prev) => {
                        const ref = refDateForAge(v)
                        const next = { ...prev, lcr3aDateMarriage: v }
                        const hb = parseBirthToDate(prev.husbandDateOfBirth)
                        const wb = parseBirthToDate(prev.wifeDateOfBirth)
                        if (hb) next.husbandAge = String(computeAgeYears(hb, ref))
                        if (wb) next.wifeAge = String(computeAgeYears(wb, ref))
                        return next
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">Used to calculate age at marriage for husband and wife.</p>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Place of Marriage</label><input type="text" value={form.lcr3aPlaceMarriage} onChange={scInput('lcr3aPlaceMarriage')} placeholder="Full venue as on certificate" className={inputClass} /></div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">When this table is fully filled, continue to the main court decree form for country, court decree details, and other print types.</p>
              <button
                type="button"
                onClick={handleLcrTableCompleteContinue}
                className="court-decree-form-page__btn px-4 py-2.5 rounded-lg font-semibold text-sm bg-white border-2 border-[var(--primary-blue)] text-[var(--primary-blue)] hover:bg-[var(--primary-blue)]/5"
              >
                Table complete — continue to court decree form
              </button>
            </div>
          </div>
        </CourtDecreeSection>
      </div>
      ) : (
      <>
      <div className="court-decree-form-page__section" style={sectionDelay(sectionIndex++)}>
      <CourtDecreeSection number="1" title="What country issued the court order/decree">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              value={form.country}
              onChange={scInput('country')}
              className={inputClass}
            />
          </div>
          <div>
            <div className="court-decree-form-page__label-tag">Court or Racco?</div>
            <input
              type="text"
              value={form.courtOrRacco}
              onChange={scInput('courtOrRacco')}
              placeholder="e.g. 2012-02"
              className={inputClass}
            />
          </div>
        </div>
      </CourtDecreeSection>
      </div>

      <div className="court-decree-form-page__section" style={sectionDelay(sectionIndex++)}>
      <CourtDecreeSection number="2" title="Affected civil document?">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Forms (checked when filled)</label>
            <LcrFormNavLinks form={form} activeType={form.formType} showFullCourtLink={false} />
          </div>
        </div>
      </CourtDecreeSection>
      </div>

      <div className="court-decree-form-page__section" style={sectionDelay(sectionIndex++)}>
      <CourtDecreeSection number="3" title="Document owner/s">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Document owner/s</label>
          <input
            type="text"
            value={form.documentOwnerName}
            onChange={scInput('documentOwnerName')}
            placeholder="e.g. SPS. FRANCIS CANO CUBERO AND JULIEMAE ORLANES BAGTONG"
            className={inputClass}
          />
        </div>
      </CourtDecreeSection>
      </div>

      <div className="court-decree-form-page__section" style={sectionDelay(sectionIndex++)}>
      <CourtDecreeSection number="4" title="Court decree details">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Issued</label>
            <DateInput value={form.dateIssued} onChange={(v) => update('dateIssued', v)} placeholder="dd/mm/yyyy" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Court that issued the court decree</label>
            <input type="text" value={form.courtThatIssued} onChange={scInput('courtThatIssued')} placeholder="e.g. 4TH SHARI'A CIRCUIT COURT, ILIGAN CITY" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issued/Rendered By (Title)</label>
              <input type="text" value={form.issuedByTitle} onChange={scInput('issuedByTitle')} placeholder="e.g. Judge" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" value={form.issuedByName} onChange={scInput('issuedByName')} placeholder="e.g. HON. OSOP MANGOTARA ALI" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type of Case</label>
            <input type="text" value={form.typeOfCase} onChange={scInput('typeOfCase')} placeholder="e.g. Civil Case No." className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Case No</label>
            <input type="text" value={form.caseNo} onChange={scInput('caseNo')} placeholder="e.g. 2025-034" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Authenticated By</label>
            <input type="text" value={form.authenticatedBy} onChange={scInput('authenticatedBy')} placeholder="e.g. NASRODING A. ALI" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registry Number</label>
              <input type="text" value={form.registryNumber} onChange={scInput('registryNumber')} placeholder="e.g. 64" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Registered</label>
              <DateInput value={form.dateRegistered} onChange={(v) => update('dateRegistered', v)} placeholder="dd/mm/yyyy" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Case Title</label>
            <textarea
              value={form.caseTitle}
              onChange={scInput('caseTitle')}
              rows={3}
              placeholder="e.g. IN RE: JOINT PETITION TO APPROVE AND REGISTER THE DIVORCE OF SPOUSES..."
              className={inputClass}
            />
          </div>
        </div>
      </CourtDecreeSection>
      </div>
      </>
      )}

      {blockPrintReason && (
        <div className="court-decree-form-page__section no-print p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm" role="alert">
          {blockPrintReason}
        </div>
      )}
      <div className="court-decree-form-page__actions no-print">
        <button
          type="button"
          onClick={() => navigate('/court-decree')}
          className="court-decree-form-page__btn court-decree-form-page__btn--secondary"
        >
          Back
        </button>
<button
        type="button"
        onClick={() => {
          const missing = getMissingFields(form)
          if (missing.length > 0) {
            setMissingFields(missing)
            setShowValidationModal(true)
            setBlockPrintReason(null)
            return
          }
          if (isLcrFormType && form.formType !== 'lcr-form-1a' && form.formType !== 'lcr-form-2a' && form.formType !== 'lcr-form-3a' && !(form.documentOwnerName || '').trim()) {
            setBlockPrintReason('Please enter a document owner.')
            return
          }
          setBlockPrintReason(null)
          setShowConfirm(true)
        }}
        className="court-decree-form-page__btn court-decree-form-page__btn--primary"
      >
        Done
      </button>
      </div>

      {showValidationModal && (
        <div
          className="court-decree-form-page__validation-backdrop court-decree-form-page__modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 no-print"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="court-decree-validation-title"
          aria-describedby="court-decree-validation-desc"
          onClick={() => setShowValidationModal(false)}
        >
          <div
            className="court-decree-form-page__validation-modal court-decree-form-page__modal-dialog no-print"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="court-decree-form-page__validation-strip" aria-hidden />
            <div className="court-decree-form-page__validation-body">
              <div className="court-decree-form-page__validation-icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  <path d="M12 16h.01" strokeWidth="2.5" />
                </svg>
              </div>
              <div className="court-decree-form-page__validation-content">
                <h2 id="court-decree-validation-title" className="court-decree-form-page__validation-title">
                  All required fields must be filled out
                </h2>
                <p id="court-decree-validation-desc" className="court-decree-form-page__validation-desc">
                  You cannot proceed until every required field is completed. Please review and fill in the items below.
                </p>
                {missingFields.length > 0 && (
                  <div className="court-decree-form-page__validation-list-wrap">
                    <p className="court-decree-form-page__validation-list-label">Missing ({missingFields.length}):</p>
                    <ul className="court-decree-form-page__validation-list">
                      {missingFields.map(({ label }) => (
                        <li key={label}>{label}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="court-decree-form-page__validation-actions">
                  <button
                    type="button"
                    onClick={() => setShowValidationModal(false)}
                    className="court-decree-form-page__validation-btn"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showContinueDecreeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 court-decree-form-page__modal-backdrop no-print" onClick={() => setShowContinueDecreeModal(false)} role="dialog" aria-modal="true" aria-labelledby="court-decree-continue-title">
          <div className="court-decree-form-page__modal-dialog bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-100" onClick={(e) => e.stopPropagation()}>
            <h3 id="court-decree-continue-title" className="text-lg font-bold text-gray-800 mb-2">LCR table complete</h3>
            <p className="text-gray-600 text-sm mb-4">
              All required fields in this LCR table are filled. Continue to the full court decree form? Your table entries stay saved so you can still print LCR 1A / 2A / 3A from the print menu. Next, complete country, document owner, and court decree details.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowContinueDecreeModal(false)}
                className="court-decree-form-page__btn court-decree-form-page__btn--secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmContinueToFullCourtDecree}
                className="court-decree-form-page__btn court-decree-form-page__btn--primary"
              >
                Continue to court decree form
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 court-decree-form-page__modal-backdrop no-print" onClick={() => setShowConfirm(false)} role="dialog" aria-modal="true" aria-labelledby="court-decree-confirm-title">
          <div className="court-decree-form-page__modal-dialog bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-100" onClick={(e) => e.stopPropagation()}>
            <h3 id="court-decree-confirm-title" className="text-lg font-bold text-gray-800 mb-2">Confirm submission</h3>
            <p className="text-gray-600 text-sm mb-4">
              Are you sure you want to proceed? Please verify that all entries are correct. You will be directed to the print view.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="court-decree-form-page__btn court-decree-form-page__btn--secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { setShowConfirm(false); proceedToPrint() }}
                className="court-decree-form-page__btn court-decree-form-page__btn--primary"
              >
                Confirm &amp; Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="court-decree-form-page__footer-note no-print">created by: ATTY. YUSSIF DON JUSTINE F. MARTIL</p>
        </div>
      </div>
    </div>
  )
}
