import React, { useState, useEffect, useRef } from 'react'
import { afterUnsavedAcknowledge, useWarnIfUnsaved } from '../../hooks/useWarnIfUnsaved'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { defaultCourtDecree, syncCourtDecreeTransmittalFlagFromFormType } from './lib/courtDecreeDefaults'
import { deriveAffectedDocumentsForPrint, primaryAffectedDocumentForSave } from './lib/courtDecreeAffectedDocuments'
import CourtDecreeLcrColbFields from './components/CourtDecreeLcrColbFields'
import { addSavedCourtDecree, getCourtDecreeDraft, updateSavedCourtDecree, saveCourtDecreeDraft } from './lib/courtDecreeStorage'
import { COURT_DECREE_TYPES, AFFECTED_DOCUMENT_OPTIONS, DATE_MONTHS } from './constants'
import { isLcr1aTableComplete, isLcr2aTableComplete, isLcr3aTableComplete } from './lib/courtDecreeLcrCompletion'
import { commitFirstLetterUpperFromInput } from '../../lib/sentenceCase'
import { handleEnterFocusNextField } from '../../lib/formEnterFocusNext'
import { FormBodyFieldShortcuts } from '../../components/forms/FormBodyFieldShortcuts'
import {
  parseDdMmYyyyToDate,
  parseBirthToDate,
  isoYyyyMmDdToDdMmYyyy,
  parseFlexibleBirthDateToStored,
  storedBirthToDisplay,
} from '../../lib/printUtils'
import ToastHost from '../../components/toast/ToastHost'
import { useToasts } from '../../components/toast/useToasts'
import { useDebouncedSuccessToast } from '../../hooks/useDebouncedSuccessToast'
import LcrRemarksFontSizeSelect from '../../components/lcr/LcrRemarksFontSizeSelect'
import FlexibleFormDateInput from '../../components/forms/FlexibleFormDateInput'

const LCR_FORM_TYPES = ['lcr-form-1a', 'lcr-form-2a', 'lcr-form-3a']
const PREFERRED_LCRO_STAFF_KEY = 'ulsades_preferred_lcr_staff'
const LCRO_STAFF_LIST_KEY = 'ulsades_lcro_staff_list'
const COURT_THAT_ISSUED_LIST_KEY = 'ulsades_court_that_issued_list'
const COURT_THAT_ISSUED_OPTIONS = [
  "4TH SHARI'A CIRCUIT COURT, 4TH SHARIA JUDICIAL DISTRICT, ILIGAN CITY",
]
const ISSUED_BY_NAME_LIST_KEY = 'ulsades_court_decree_issued_by_name_list'
const ISSUED_BY_NAME_OPTIONS = []
const AUTHENTICATED_BY_LIST_KEY = 'ulsades_court_decree_authenticated_by_list'
const AUTHENTICATED_BY_OPTIONS = []

function isLikelyFullStaffName(value) {
  const name = String(value || '').trim()
  if (name.length < 5) return false
  // Require at least two name parts (e.g., first + last).
  return name.split(/\s+/).filter(Boolean).length >= 2
}

/** Institutional court line: long enough and at least two words (e.g. "REGIONAL TRIAL COURT ..."). */
function isLikelyCourtDecreeName(value) {
  const s = String(value || '').trim()
  if (s.length < 12) return false
  return s.split(/\s+/).filter(Boolean).length >= 2
}

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
function LcrFormNavLinks({
  form,
  activeType,
  showFullCourtLink = true,
  visibleTypes = ['lcr-form-1a', 'lcr-form-2a', 'lcr-form-3a'],
  /** When set, LCR type switches use this so the global “Unsaved Changes” guard does not block (e.g. section “Affected civil document?”). */
  acknowledgeSavedBeforeLcrSwitch = null,
}) {
  const navigate = useNavigate()
  const c1 = isLcr1aTableComplete(form)
  const c2 = isLcr2aTableComplete(form)
  const c3 = isLcr3aTableComplete(form)
  const cls = (t) =>
    `court-decree-form-page__form-link inline-flex items-center gap-1${activeType === t ? ' court-decree-form-page__form-link--active' : ''}`
  const lcrLinkProps = (to) =>
    acknowledgeSavedBeforeLcrSwitch
      ? {
          to,
          onClick: (e) => {
            if (e.button !== 0) return
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
            e.preventDefault()
            afterUnsavedAcknowledge(acknowledgeSavedBeforeLcrSwitch, () => navigate(to))
          },
        }
      : { to }
  return (
    <div className={`court-decree-form-page__form-links flex flex-wrap items-center gap-2${showFullCourtLink ? ' mb-4' : ''}`}>
      {visibleTypes.includes('lcr-form-1a') ? (
        <Link
          {...lcrLinkProps('/court-decree/form?type=lcr-form-1a')}
          className={cls('lcr-form-1a')}
          aria-label={c1 ? 'FORM 1A, all required fields filled' : 'FORM 1A'}
        >
          <span>FORM 1A</span>
          <LcrFormCompleteIcon show={c1} />
        </Link>
      ) : null}
      {visibleTypes.includes('lcr-form-2a') ? (
        <Link
          {...lcrLinkProps('/court-decree/form?type=lcr-form-2a')}
          className={cls('lcr-form-2a')}
          aria-label={c2 ? 'FORM 2A, all required fields filled' : 'FORM 2A'}
        >
          <span>FORM 2A</span>
          <LcrFormCompleteIcon show={c2} />
        </Link>
      ) : null}
      {visibleTypes.includes('lcr-form-3a') ? (
        <Link
          {...lcrLinkProps('/court-decree/form?type=lcr-form-3a')}
          className={cls('lcr-form-3a')}
          aria-label={c3 ? 'FORM 3A, all required fields filled' : 'FORM 3A'}
        >
          <span>FORM 3A</span>
          <LcrFormCompleteIcon show={c3} />
        </Link>
      ) : null}
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

function dateToOutputFormat(str) {
  if (!str || typeof str !== 'string') return str
  const d = parseBirthToDate(str.trim())
  if (!d || isNaN(d.getTime())) return str
  const idx = d.getMonth() + 1
  const mon = DATE_MONTHS[idx]
  if (!mon) return str
  return `${String(d.getDate()).padStart(2, '0')}/${mon}/${d.getFullYear()}`
}

const COURT_DECREE_DATE_KEYS = ['dateIssued', 'dateRegistered']

/** Type dd/mm/yyyy, mm/yyyy, month name + day + year, or “May 2026”; calendar sets a full date. */
function FlexibleBirthDateInput({ value, onChange }) {
  const pickerRef = useRef(null)
  const displayFromStored = (stored) => storedBirthToDisplay(stored)
  const [text, setText] = useState(() => displayFromStored(value))

  useEffect(() => {
    setText(displayFromStored(value))
  }, [value])

  const commit = () => {
    const trimmed = text.trim()
    if (!trimmed) {
      onChange('')
      setText('')
      return
    }
    const normalized = parseFlexibleBirthDateToStored(trimmed)
    if (normalized !== null) {
      onChange(normalized)
      setText(displayFromStored(normalized))
    } else {
      setText(displayFromStored(value))
    }
  }

  const pickIso = (iso) => {
    const ddmm = isoYyyyMmDdToDdMmYyyy(iso)
    if (ddmm) {
      onChange(ddmm)
      setText(ddmm)
    }
  }

  return (
    <div className="relative flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[180px]">
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          placeholder="May 15 2026, mm/yyyy, or dd/mm/yyyy"
          className={`${inputClass} pr-9 w-full`}
        />
        <button
          type="button"
          onClick={() => pickerRef.current?.showPicker?.() || pickerRef.current?.click()}
          className="court-decree-form-page__date-picker-btn absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded text-gray-500"
          title="Pick full date"
          tabIndex={-1}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </button>
        <input
          ref={pickerRef}
          type="date"
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={(e) => pickIso(e.target.value)}
        />
      </div>
      {text ? (
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

function mapAffectedToLcrPrintType(doc) {
  if (doc === 'BIRTH_CERTIFICATE') return 'lcr-form-1a'
  if (doc === 'DEATH_CERTIFICATE') return 'lcr-form-2a'
  if (doc === 'MARRIAGE_CERTIFICATE') return 'lcr-form-3a'
  return ''
}

function CourtDecreeSection({ number, title, children }) {
  return (
    <div className="court-decree-form-page__section-card mb-6 rounded-xl overflow-visible border border-gray-200 bg-[var(--card-bg)] shadow-sm">
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
  const [showForeignCountryModal, setShowForeignCountryModal] = useState(false)
  const [showForeignCountryNote, setShowForeignCountryNote] = useState(false)
  const [missingFields, setMissingFields] = useState([])
  const [savedLcroStaff, setSavedLcroStaff] = useState([])
  const [showStaffSuggestions, setShowStaffSuggestions] = useState(false)
  const [staffSuggestionIndex, setStaffSuggestionIndex] = useState(-1)
  const [showCourtIssuedSuggestions, setShowCourtIssuedSuggestions] = useState(false)
  const [courtIssuedSuggestionIndex, setCourtIssuedSuggestionIndex] = useState(-1)
  const [savedCourtsThatIssued, setSavedCourtsThatIssued] = useState([])
  const [showIssuedByNameSuggestions, setShowIssuedByNameSuggestions] = useState(false)
  const [issuedByNameSuggestionIndex, setIssuedByNameSuggestionIndex] = useState(-1)
  const [savedIssuedByNames, setSavedIssuedByNames] = useState([])
  const [showAuthenticatedBySuggestions, setShowAuthenticatedBySuggestions] = useState(false)
  const [authenticatedBySuggestionIndex, setAuthenticatedBySuggestionIndex] = useState(-1)
  const [savedAuthenticatedByNames, setSavedAuthenticatedByNames] = useState([])

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
        return syncCourtDecreeTransmittalFlagFromFormType({
          ...defaultCourtDecree,
          ...draft,
          formType: draft.formType || typeFromUrl || 'cert-authenticity',
        })
      }
    }
    base.formType = COURT_DECREE_TYPES.find((t) => t.id === typeFromUrl)?.id || 'cert-authenticity'
    const affected = urlToAffectedDoc(typeFromUrl)
    if (affected) {
      base.affectedDocument = affected
      base.affectedDocuments = [affected]
    }
    return base
  })

  const [dirtyBaselineTick, setDirtyBaselineTick] = useState(0)
  useEffect(() => {
    const id = setTimeout(() => setDirtyBaselineTick((x) => x + 1), 150)
    return () => clearTimeout(id)
  }, [searchParams])

  const acknowledgeSaved = useWarnIfUnsaved(form, [searchParams.toString(), dirtyBaselineTick])

  const { toasts, show, dismiss } = useToasts()
  const notifyLcrCertSaved = useDebouncedSuccessToast(show)

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))
  const updateAndPersistDraft = (key, value) =>
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      saveCourtDecreeDraft(next)
      return next
    })
  const setCourtDecreeTransmittalOutOfTown = (isOutOfTown) => {
    setForm((prev) => {
      const next = { ...prev, courtDecreeTransmittalIsOutOfTown: isOutOfTown }
      saveCourtDecreeDraft(next)
      return next
    })
  }
  const handleCountryChange = (value) => {
    const nextValue = String(value || '').trim().toUpperCase()
    if (nextValue === 'FOREIGN' && String(form.country || '').trim().toUpperCase() !== 'FOREIGN') {
      setShowForeignCountryModal(true)
      return
    }
    setShowForeignCountryNote(false)
    update('country', value)
  }
  const saveLcroStaffName = (rawName) => {
    const currentName = String(rawName || '').trim()
    if (!isLikelyFullStaffName(currentName)) return
    localStorage.setItem(PREFERRED_LCRO_STAFF_KEY, currentName)
    setSavedLcroStaff((prev) => {
      if (prev.some((name) => name.toUpperCase() === currentName.toUpperCase())) return prev
      const next = [currentName, ...prev]
      localStorage.setItem(LCRO_STAFF_LIST_KEY, JSON.stringify(next))
      return next
    })
  }
  const saveCourtThatIssuedName = (rawName) => {
    const current = String(rawName || '').trim()
    if (!isLikelyCourtDecreeName(current)) return
    setSavedCourtsThatIssued((prev) => {
      if (prev.some((name) => name.toUpperCase() === current.toUpperCase())) return prev
      const next = [current, ...prev].slice(0, 50)
      localStorage.setItem(COURT_THAT_ISSUED_LIST_KEY, JSON.stringify(next))
      return next
    })
  }
  const saveIssuedByNameToList = (rawName) => {
    const current = String(rawName || '').trim()
    if (!isLikelyFullStaffName(current)) return
    setSavedIssuedByNames((prev) => {
      if (prev.some((name) => name.toUpperCase() === current.toUpperCase())) return prev
      const next = [current, ...prev].slice(0, 50)
      localStorage.setItem(ISSUED_BY_NAME_LIST_KEY, JSON.stringify(next))
      return next
    })
  }
  const saveAuthenticatedByToList = (rawName) => {
    const current = String(rawName || '').trim()
    if (!isLikelyFullStaffName(current)) return
    setSavedAuthenticatedByNames((prev) => {
      if (prev.some((name) => name.toUpperCase() === current.toUpperCase())) return prev
      const next = [current, ...prev].slice(0, 50)
      localStorage.setItem(AUTHENTICATED_BY_LIST_KEY, JSON.stringify(next))
      return next
    })
  }
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
  const filteredLcroStaff = React.useMemo(() => {
    const query = String(form.certificateSignatoryName || '').trim().toUpperCase()
    if (!query) return savedLcroStaff.slice(0, 8)
    return savedLcroStaff
      .filter((name) => name.toUpperCase().includes(query))
      .slice(0, 8)
  }, [savedLcroStaff, form.certificateSignatoryName])
  const mergedCourtsThatIssued = React.useMemo(() => {
    const seen = new Set()
    const out = []
    for (const name of savedCourtsThatIssued) {
      const k = String(name || '').trim().toUpperCase()
      if (!k || seen.has(k)) continue
      seen.add(k)
      out.push(String(name).trim())
    }
    for (const name of COURT_THAT_ISSUED_OPTIONS) {
      const k = String(name || '').trim().toUpperCase()
      if (!k || seen.has(k)) continue
      seen.add(k)
      out.push(name)
    }
    return out
  }, [savedCourtsThatIssued])
  const filteredCourtIssued = React.useMemo(() => {
    const query = String(form.courtThatIssued || '').trim().toUpperCase()
    const base = mergedCourtsThatIssued
    if (!query) return base.slice(0, 15)
    return base.filter((name) => name.toUpperCase().includes(query)).slice(0, 15)
  }, [mergedCourtsThatIssued, form.courtThatIssued])
  const mergedIssuedByNames = React.useMemo(() => {
    const seen = new Set()
    const out = []
    for (const name of savedIssuedByNames) {
      const k = String(name || '').trim().toUpperCase()
      if (!k || seen.has(k)) continue
      seen.add(k)
      out.push(String(name).trim())
    }
    for (const name of ISSUED_BY_NAME_OPTIONS) {
      const k = String(name || '').trim().toUpperCase()
      if (!k || seen.has(k)) continue
      seen.add(k)
      out.push(name)
    }
    return out
  }, [savedIssuedByNames])
  const filteredIssuedByNames = React.useMemo(() => {
    const query = String(form.issuedByName || '').trim().toUpperCase()
    const base = mergedIssuedByNames
    if (!query) return base.slice(0, 15)
    return base.filter((name) => name.toUpperCase().includes(query)).slice(0, 15)
  }, [mergedIssuedByNames, form.issuedByName])
  const mergedAuthenticatedByNames = React.useMemo(() => {
    const seen = new Set()
    const out = []
    for (const name of savedAuthenticatedByNames) {
      const k = String(name || '').trim().toUpperCase()
      if (!k || seen.has(k)) continue
      seen.add(k)
      out.push(String(name).trim())
    }
    for (const name of AUTHENTICATED_BY_OPTIONS) {
      const k = String(name || '').trim().toUpperCase()
      if (!k || seen.has(k)) continue
      seen.add(k)
      out.push(name)
    }
    return out
  }, [savedAuthenticatedByNames])
  const filteredAuthenticatedByNames = React.useMemo(() => {
    const query = String(form.authenticatedBy || '').trim().toUpperCase()
    const base = mergedAuthenticatedByNames
    if (!query) return base.slice(0, 15)
    return base.filter((name) => name.toUpperCase().includes(query)).slice(0, 15)
  }, [mergedAuthenticatedByNames, form.authenticatedBy])
  const chooseLcroStaff = (name) => {
    update('certificateSignatoryName', name)
    saveLcroStaffName(name)
    setShowStaffSuggestions(false)
    setStaffSuggestionIndex(-1)
  }
  const chooseCourtIssued = (name) => {
    updateAndPersistDraft('courtThatIssued', name)
    saveCourtThatIssuedName(name)
    setShowCourtIssuedSuggestions(false)
    setCourtIssuedSuggestionIndex(-1)
  }
  const chooseIssuedByName = (name) => {
    updateAndPersistDraft('issuedByName', name)
    saveIssuedByNameToList(name)
    setShowIssuedByNameSuggestions(false)
    setIssuedByNameSuggestionIndex(-1)
  }
  const chooseAuthenticatedBy = (name) => {
    updateAndPersistDraft('authenticatedBy', name)
    saveAuthenticatedByToList(name)
    setShowAuthenticatedBySuggestions(false)
    setAuthenticatedBySuggestionIndex(-1)
  }

  // Persistence for LCRO - Staff (permanently saved as requested)
  useEffect(() => {
    try {
      const rawList = localStorage.getItem(LCRO_STAFF_LIST_KEY)
      const parsed = rawList ? JSON.parse(rawList) : []
      if (Array.isArray(parsed)) {
        const cleaned = parsed
          .map((v) => String(v || '').trim())
          .filter((v) => isLikelyFullStaffName(v))
          .filter((v, i, arr) => arr.findIndex((x) => x.toUpperCase() === v.toUpperCase()) === i)
        localStorage.setItem(LCRO_STAFF_LIST_KEY, JSON.stringify(cleaned))
        setSavedLcroStaff(cleaned)
      }
    } catch {
      setSavedLcroStaff([])
    }
  }, [])

  useEffect(() => {
    try {
      const rawList = localStorage.getItem(COURT_THAT_ISSUED_LIST_KEY)
      const parsed = rawList ? JSON.parse(rawList) : []
      if (Array.isArray(parsed)) {
        const cleaned = parsed
          .map((v) => String(v || '').trim())
          .filter((v) => isLikelyCourtDecreeName(v))
          .filter((v, i, arr) => arr.findIndex((x) => x.toUpperCase() === v.toUpperCase()) === i)
        localStorage.setItem(COURT_THAT_ISSUED_LIST_KEY, JSON.stringify(cleaned))
        setSavedCourtsThatIssued(cleaned)
      } else {
        setSavedCourtsThatIssued([])
      }
    } catch {
      setSavedCourtsThatIssued([])
    }
  }, [])

  useEffect(() => {
    try {
      const rawList = localStorage.getItem(ISSUED_BY_NAME_LIST_KEY)
      const parsed = rawList ? JSON.parse(rawList) : []
      if (Array.isArray(parsed)) {
        const cleaned = parsed
          .map((v) => String(v || '').trim())
          .filter((v) => isLikelyFullStaffName(v))
          .filter((v, i, arr) => arr.findIndex((x) => x.toUpperCase() === v.toUpperCase()) === i)
        localStorage.setItem(ISSUED_BY_NAME_LIST_KEY, JSON.stringify(cleaned))
        setSavedIssuedByNames(cleaned)
      } else {
        setSavedIssuedByNames([])
      }
    } catch {
      setSavedIssuedByNames([])
    }
  }, [])

  useEffect(() => {
    try {
      const rawList = localStorage.getItem(AUTHENTICATED_BY_LIST_KEY)
      const parsed = rawList ? JSON.parse(rawList) : []
      if (Array.isArray(parsed)) {
        const cleaned = parsed
          .map((v) => String(v || '').trim())
          .filter((v) => isLikelyFullStaffName(v))
          .filter((v, i, arr) => arr.findIndex((x) => x.toUpperCase() === v.toUpperCase()) === i)
        localStorage.setItem(AUTHENTICATED_BY_LIST_KEY, JSON.stringify(cleaned))
        setSavedAuthenticatedByNames(cleaned)
      } else {
        setSavedAuthenticatedByNames([])
      }
    } catch {
      setSavedAuthenticatedByNames([])
    }
  }, [])

  useEffect(() => {
    const currentName = String(form.certificateSignatoryName || '').trim()
    if (!currentName) return
    localStorage.setItem(PREFERRED_LCRO_STAFF_KEY, currentName)
  }, [form.certificateSignatoryName])

  const proceedToPrint = () => {
    const formForOutput = { ...form }
    const editingId = String(editId || form._savedCourtDecreeId || '').trim()
    let finalSavedId = editingId
    delete formForOutput._savedCourtDecreeId
    const affectedDocuments = deriveAffectedDocumentsForPrint(formForOutput)
    let nextPrintType = form.formType
    if (affectedDocuments.length > 0) {
      formForOutput.affectedDocuments = affectedDocuments
      formForOutput.affectedDocument = primaryAffectedDocumentForSave(formForOutput, affectedDocuments)
      // If only one LCR table was filled, always open print view on that specific LCR output.
      if (!LCR_FORM_TYPES.includes(form.formType) && affectedDocuments.length === 1) {
        const mapped = mapAffectedToLcrPrintType(affectedDocuments[0])
        if (mapped) nextPrintType = mapped
      }
    }
    COURT_DECREE_DATE_KEYS.forEach((key) => {
      if (formForOutput[key]) formForOutput[key] = dateToOutputFormat(formForOutput[key])
    })
    if (editingId) {
      const updated = updateSavedCourtDecree(editingId, formForOutput)
      if (!updated) {
        const createdId = addSavedCourtDecree(formForOutput)
        if (createdId) finalSavedId = String(createdId).trim()
      }
    } else {
      const createdId = addSavedCourtDecree(formForOutput)
      if (createdId) finalSavedId = String(createdId).trim()
    }
    const path = finalSavedId
      ? `/court-decree/print?type=${nextPrintType}&id=${encodeURIComponent(finalSavedId)}`
      : `/court-decree/print?type=${nextPrintType}`
    afterUnsavedAcknowledge(acknowledgeSaved, () => navigate(path))
  }

  useEffect(() => {
    if (searchParams.get('hydrateDraft') === '1') return
    const type = searchParams.get('type')
    if (type && COURT_DECREE_TYPES.some(t => t.id === type)) {
      setForm((prev) => {
        const next = { ...prev, formType: type }
        const affected = urlToAffectedDoc(type)
        if (affected) {
          next.affectedDocument = affected
          next.affectedDocuments = [affected]
        }
        saveCourtDecreeDraft(next)
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
        const merged = syncCourtDecreeTransmittalFlagFromFormType({
          ...defaultCourtDecree,
          ...d,
          formType: 'cert-authenticity',
        })
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
    const chosenDoc = aff || form.affectedDocument || 'MARRIAGE_CERTIFICATE'
    saveCourtDecreeDraft({
      ...form,
      formType: 'cert-authenticity',
      affectedDocument: chosenDoc,
      affectedDocuments: [chosenDoc],
      documentOwnerName: doc || form.documentOwnerName,
    })
    setShowContinueDecreeModal(false)
    afterUnsavedAcknowledge(acknowledgeSaved, () =>
      navigate('/court-decree/form?type=cert-authenticity&hydrateDraft=1')
    )
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
  const visibleLcrTypes = [
    isLcr1aTableComplete(form) ? 'lcr-form-1a' : null,
    isLcr2aTableComplete(form) ? 'lcr-form-2a' : null,
    isLcr3aTableComplete(form) ? 'lcr-form-3a' : null,
  ].filter(Boolean)

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

        <FormBodyFieldShortcuts className="court-decree-form-page__body" onKeyDown={handleEnterFocusNextField}>
          {form.formType === 'lcr-form-1a' ? (
            <div className="court-decree-form-page__section" style={sectionDelay(0)}>
              <LcrFormNavLinks form={form} activeType="lcr-form-1a" />
              <CourtDecreeSection number="1" title="Table fields">
                <div className="space-y-4 max-w-8xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LCR Registry Number</label>
                    <input type="text" value={form.lcr1aRegistryNumber} onChange={scInput('lcr1aRegistryNumber')} placeholder="e.g. 2002-1956" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Registration</label>
                    <FlexibleFormDateInput value={form.lcr1aDateRegistration} onChange={(v) => update('lcr1aDateRegistration', v)} inputClassName={inputClass} />
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
                    <FlexibleFormDateInput value={form.lcr1aDateOfBirth} onChange={(v) => update('lcr1aDateOfBirth', v)} inputClassName={inputClass} />
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
                    <FlexibleFormDateInput value={form.lcr1aDateMarriageParents} onChange={(v) => update('lcr1aDateMarriageParents', v)} inputClassName={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Place of Marriage of Parents</label>
                    <input type="text" value={form.lcr1aPlaceMarriageParents} onChange={scInput('lcr1aPlaceMarriageParents')} placeholder="e.g. SAGUIARAN, LANAO DEL SUR" className={inputClass} />
                  </div>
                  <CourtDecreeLcrColbFields lcrKind="1a" form={form} scInput={scInput} inputClass={inputClass} />
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
                <div className="space-y-4 max-w-8xl">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">LCR Registry Number</label><input type="text" value={form.lcr2aRegistryNumber} onChange={scInput('lcr2aRegistryNumber')} className={inputClass} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Date of Registration</label><FlexibleFormDateInput value={form.lcr2aDateRegistration} onChange={(v) => update('lcr2aDateRegistration', v)} inputClassName={inputClass} /></div>
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
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Date of Death</label><FlexibleFormDateInput value={form.lcr2aDateDeath} onChange={(v) => update('lcr2aDateDeath', v)} inputClassName={inputClass} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Citizenship of Father</label><input type="text" value={form.lcr2aCitizenshipFather} onChange={scInput('lcr2aCitizenshipFather')} className={inputClass} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Place of Death</label><input type="text" value={form.lcr2aPlaceDeath} onChange={scInput('lcr2aPlaceDeath')} className={inputClass} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Cause of Death</label><textarea value={form.lcr2aCauseDeath} onChange={scInput('lcr2aCauseDeath')} rows={4} className={inputClass} placeholder="As stated on the record" /></div>
                  <CourtDecreeLcrColbFields lcrKind="2a" form={form} scInput={scInput} inputClass={inputClass} />
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
                <div className="space-y-6 max-w-8xl">
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
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Date of Registration</label><FlexibleFormDateInput value={form.lcr3aDateRegistration} onChange={(v) => update('lcr3aDateRegistration', v)} inputClassName={inputClass} /></div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Marriage</label>
                        <FlexibleFormDateInput
                          inputClassName={inputClass}
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
                  <CourtDecreeLcrColbFields lcrKind="3a" form={form} scInput={scInput} inputClass={inputClass} />
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
                      <select
                        value={form.country}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className={inputClass}
                      >
                        <option value="PHILIPPINES">PHILIPPINES</option>
                        <option value="FOREIGN">FOREIGN</option>
                      </select>
                      {(String(form.country || '').trim().toUpperCase() === 'FOREIGN' || showForeignCountryNote) && (
                        <p className="mt-2 text-center text-sm font-semibold text-red-600 uppercase">
                          Note: It must be registered at LCRO of Manila
                        </p>
                      )}
                    </div>
                    <div>
                      <div className="court-decree-form-page__label-tag">Court or Racco?</div>
                      <select
                        value={form.courtOrRacco}
                        onChange={(e) => update('courtOrRacco', e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Select option</option>
                        <option value="2024-05">Racco is (2024-05) adoption</option>
                        <option value="2012-02">Court is (2012-02) divorce, nullity, and marraige</option>
                      </select>
                    </div>
                  </div>
                </CourtDecreeSection>
              </div>

              <div className="court-decree-form-page__section" style={sectionDelay(sectionIndex++)}>
                <CourtDecreeSection number="2" title="Affected civil document?">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Forms (checked when filled)</label>
                      <LcrFormNavLinks
                        form={form}
                        activeType={form.formType}
                        showFullCourtLink={false}
                        acknowledgeSavedBeforeLcrSwitch={acknowledgeSaved}
                      />
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
                      <FlexibleFormDateInput value={form.dateIssued} onChange={(v) => update('dateIssued', v)} placeholder="May 15 2026 or dd/mm/yyyy" inputClassName={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Court that issued the court decree</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={form.courtThatIssued}
                          onChange={(e) => {
                            commitFirstLetterUpperFromInput(e, (v) => updateAndPersistDraft('courtThatIssued', v))
                            setShowCourtIssuedSuggestions(true)
                            setCourtIssuedSuggestionIndex(-1)
                          }}
                          onFocus={() => setShowCourtIssuedSuggestions(true)}
                          onBlur={(e) => {
                            saveCourtThatIssuedName(e.target.value)
                            setTimeout(() => setShowCourtIssuedSuggestions(false), 120)
                          }}
                          onKeyDown={(e) => {
                            if (!showCourtIssuedSuggestions || filteredCourtIssued.length === 0) return
                            if (e.key === 'ArrowDown') {
                              e.preventDefault()
                              setCourtIssuedSuggestionIndex((prev) => (prev + 1) % filteredCourtIssued.length)
                              return
                            }
                            if (e.key === 'ArrowUp') {
                              e.preventDefault()
                              setCourtIssuedSuggestionIndex((prev) => (prev <= 0 ? filteredCourtIssued.length - 1 : prev - 1))
                              return
                            }
                            if (e.key === 'Enter' && courtIssuedSuggestionIndex >= 0) {
                              e.preventDefault()
                              e.stopPropagation()
                              chooseCourtIssued(filteredCourtIssued[courtIssuedSuggestionIndex])
                              return
                            }
                            if (e.key === 'Escape') {
                              setShowCourtIssuedSuggestions(false)
                              setCourtIssuedSuggestionIndex(-1)
                            }
                          }}
                          placeholder="e.g. 4TH SHARI'A CIRCUIT COURT, ILIGAN CITY"
                          className={`${inputClass} pr-10`}
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden>
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.166l3.71-3.935a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                          </svg>
                        </span>
                        {showCourtIssuedSuggestions && filteredCourtIssued.length > 0 && (
                          <div className="absolute z-50 mt-1 w-full rounded-xl border border-indigo-100 bg-white shadow-[0_10px_30px_rgba(79,70,229,0.18)] overflow-hidden">
                            {filteredCourtIssued.map((name, idx) => (
                              <button
                                key={`${name}-${idx}`}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => chooseCourtIssued(name)}
                                className={`w-full px-3 py-2 text-left text-sm transition ${idx === courtIssuedSuggestionIndex
                                  ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white'
                                  : 'text-gray-800 hover:bg-indigo-50'
                                  }`}
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Courts you type are saved on this computer and suggested here when they match (at least two words and 12+ characters).
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issued/Rendered By (Title)</label>
                        <input type="text" value={form.issuedByTitle} onChange={scInput('issuedByTitle')} placeholder="e.g. Judge" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={form.issuedByName}
                            onChange={(e) => {
                              commitFirstLetterUpperFromInput(e, (v) => updateAndPersistDraft('issuedByName', v))
                              setShowIssuedByNameSuggestions(true)
                              setIssuedByNameSuggestionIndex(-1)
                            }}
                            onFocus={() => setShowIssuedByNameSuggestions(true)}
                            onBlur={(e) => {
                              saveIssuedByNameToList(e.target.value)
                              setTimeout(() => setShowIssuedByNameSuggestions(false), 120)
                            }}
                            onKeyDown={(e) => {
                              if (!showIssuedByNameSuggestions || filteredIssuedByNames.length === 0) return
                              if (e.key === 'ArrowDown') {
                                e.preventDefault()
                                setIssuedByNameSuggestionIndex((prev) => (prev + 1) % filteredIssuedByNames.length)
                                return
                              }
                              if (e.key === 'ArrowUp') {
                                e.preventDefault()
                                setIssuedByNameSuggestionIndex((prev) =>
                                  prev <= 0 ? filteredIssuedByNames.length - 1 : prev - 1
                                )
                                return
                              }
                              if (e.key === 'Enter' && issuedByNameSuggestionIndex >= 0) {
                                e.preventDefault()
                                e.stopPropagation()
                                chooseIssuedByName(filteredIssuedByNames[issuedByNameSuggestionIndex])
                                return
                              }
                              if (e.key === 'Escape') {
                                setShowIssuedByNameSuggestions(false)
                                setIssuedByNameSuggestionIndex(-1)
                              }
                            }}
                            placeholder="e.g. HON. OSOP MANGOTARA ALI"
                            className={`${inputClass} pr-10`}
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden>
                              <path
                                fillRule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.166l3.71-3.935a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                          {showIssuedByNameSuggestions && filteredIssuedByNames.length > 0 && (
                            <div className="absolute z-50 mt-1 w-full rounded-xl border border-indigo-100 bg-white shadow-[0_10px_30px_rgba(79,70,229,0.18)] overflow-hidden">
                              {filteredIssuedByNames.map((name, idx) => (
                                <button
                                  key={`${name}-${idx}`}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => chooseIssuedByName(name)}
                                  className={`w-full px-3 py-2 text-left text-sm transition ${idx === issuedByNameSuggestionIndex
                                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white'
                                    : 'text-gray-800 hover:bg-indigo-50'
                                    }`}
                                >
                                  {name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Names you type are saved on this computer and suggested here when they match (at least two words and five characters).
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type of Case</label>
                      <select
                        value={form.typeOfCase}
                        onChange={(e) => update('typeOfCase', e.target.value)}
                        className={inputClass}
                      >
                        <option value="Civil Case No.">Civil Case No.</option>
                        <option value="S.P. No">S.P. No</option>
                        <option value="RACCO">RACCO</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Case No</label>
                      <input type="text" value={form.caseNo} onChange={scInput('caseNo')} placeholder="e.g. 2025-034" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Authenticated By</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={form.authenticatedBy}
                          onChange={(e) => {
                            commitFirstLetterUpperFromInput(e, (v) => updateAndPersistDraft('authenticatedBy', v))
                            setShowAuthenticatedBySuggestions(true)
                            setAuthenticatedBySuggestionIndex(-1)
                          }}
                          onFocus={() => setShowAuthenticatedBySuggestions(true)}
                          onBlur={(e) => {
                            saveAuthenticatedByToList(e.target.value)
                            setTimeout(() => setShowAuthenticatedBySuggestions(false), 120)
                          }}
                          onKeyDown={(e) => {
                            if (!showAuthenticatedBySuggestions || filteredAuthenticatedByNames.length === 0) return
                            if (e.key === 'ArrowDown') {
                              e.preventDefault()
                              setAuthenticatedBySuggestionIndex((prev) => (prev + 1) % filteredAuthenticatedByNames.length)
                              return
                            }
                            if (e.key === 'ArrowUp') {
                              e.preventDefault()
                              setAuthenticatedBySuggestionIndex((prev) =>
                                prev <= 0 ? filteredAuthenticatedByNames.length - 1 : prev - 1
                              )
                              return
                            }
                            if (e.key === 'Enter' && authenticatedBySuggestionIndex >= 0) {
                              e.preventDefault()
                              e.stopPropagation()
                              chooseAuthenticatedBy(filteredAuthenticatedByNames[authenticatedBySuggestionIndex])
                              return
                            }
                            if (e.key === 'Escape') {
                              setShowAuthenticatedBySuggestions(false)
                              setAuthenticatedBySuggestionIndex(-1)
                            }
                          }}
                          placeholder="e.g. NASRODING A. ALI"
                          className={`${inputClass} pr-10`}
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden>
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 11.166l3.71-3.935a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        {showAuthenticatedBySuggestions && filteredAuthenticatedByNames.length > 0 && (
                          <div className="absolute z-50 mt-1 w-full rounded-xl border border-indigo-100 bg-white shadow-[0_10px_30px_rgba(79,70,229,0.18)] overflow-hidden">
                            {filteredAuthenticatedByNames.map((name, idx) => (
                              <button
                                key={`${name}-${idx}`}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => chooseAuthenticatedBy(name)}
                                className={`w-full px-3 py-2 text-left text-sm transition ${idx === authenticatedBySuggestionIndex
                                  ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white'
                                  : 'text-gray-800 hover:bg-indigo-50'
                                  }`}
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Names you type are saved on this computer and suggested here when they match (at least two words and five characters).
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Registry Number</label>
                        <input type="text" value={form.registryNumber} onChange={scInput('registryNumber')} placeholder="e.g. 64" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Registered</label>
                        <FlexibleFormDateInput value={form.dateRegistered} onChange={(v) => update('dateRegistered', v)} placeholder="May 15 2026 or dd/mm/yyyy" inputClassName={inputClass} />
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

              <div className="court-decree-form-page__section" style={sectionDelay(sectionIndex++)}>
                <CourtDecreeSection number="5" title="Transmittal letter (local or out of town)">
                  <p className="text-sm text-gray-600 mb-3 max-w-2xl">
                    Only one transmittal output is shown when you print: local Transmittal to PSA, or Out-of-Town
                    Transmittal — not both. This does not change certificates, LCR forms, or annotations.
                  </p>
                  <label className="flex items-start gap-3 mb-4 p-3 rounded-lg border border-gray-200 bg-white cursor-pointer hover:border-gray-300 transition-colors max-w-2xl">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 text-[var(--primary-blue)] focus:ring-[var(--primary-blue)]"
                      checked={Boolean(form.courtDecreeTransmittalIsOutOfTown)}
                      onChange={(e) => setCourtDecreeTransmittalOutOfTown(e.target.checked)}
                    />
                    <span>
                      <span className="block text-sm font-semibold text-gray-900">Out of town</span>
                      <span className="block text-sm text-gray-600 mt-0.5">
                        When checked, print shows Out-of-Town Transmittal only. When unchecked, print shows local
                        Transmittal only.
                      </span>
                    </span>
                  </label>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Or pick quickly</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setCourtDecreeTransmittalOutOfTown(false)}
                      className={`min-h-[2.75rem] px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-colors ${!form.courtDecreeTransmittalIsOutOfTown
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                    >
                      Local — Transmittal only
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourtDecreeTransmittalOutOfTown(true)}
                      className={`min-h-[2.75rem] px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-colors ${form.courtDecreeTransmittalIsOutOfTown
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                    >
                      Out of town — Out-of-Town Transmittal only
                    </button>
                  </div>
                </CourtDecreeSection>
              </div>

              <div className="court-decree-form-page__section" style={sectionDelay(sectionIndex++)}>
                <CourtDecreeSection number="6" title="Signatory">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LCR forms — party requesting certification (bold in print)</label>
                      <input
                        type="text"
                        value={form.lcrCertificationRequestParty}
                        onChange={onLcrCertPartyChange}
                        placeholder="Leave blank for defaults: 1A uses OCRG/OWNER/…; 2A and 3A use OCRG/DOCUMENT OWNER"
                        className={inputClass}
                      />
                      <p className="text-xs text-gray-500 mt-1">If you type here, this exact text is used on every LCR certification line. Leave blank to keep each form’s usual wording.</p>
                    </div>
                    <LcrRemarksFontSizeSelect
                      id="court-decree-lcr-remarks-font"
                      className="mt-2"
                      value={form.lcrRemarksFontSizePt}
                      onChange={(v) => updateAndPersistDraft('lcrRemarksFontSizePt', v)}
                      helpText="Controls how large the REMARKS text prints on LCR 1A / 2A / 3A."
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LCRO - Staff (Verified by)</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={form.certificateSignatoryName}
                          onChange={(e) => {
                            scInput('certificateSignatoryName')(e)
                            setShowStaffSuggestions(true)
                            setStaffSuggestionIndex(-1)
                          }}
                          onFocus={() => setShowStaffSuggestions(true)}
                          onBlur={(e) => {
                            saveLcroStaffName(e.target.value)
                            setTimeout(() => setShowStaffSuggestions(false), 120)
                          }}
                          onKeyDown={(e) => {
                            if (!showStaffSuggestions || filteredLcroStaff.length === 0) return
                            if (e.key === 'ArrowDown') {
                              e.preventDefault()
                              setStaffSuggestionIndex((prev) => (prev + 1) % filteredLcroStaff.length)
                              return
                            }
                            if (e.key === 'ArrowUp') {
                              e.preventDefault()
                              setStaffSuggestionIndex((prev) => (prev <= 0 ? filteredLcroStaff.length - 1 : prev - 1))
                              return
                            }
                            if (e.key === 'Enter' && staffSuggestionIndex >= 0) {
                              e.preventDefault()
                              e.stopPropagation()
                              chooseLcroStaff(filteredLcroStaff[staffSuggestionIndex])
                              return
                            }
                            if (e.key === 'Escape') {
                              setShowStaffSuggestions(false)
                              setStaffSuggestionIndex(-1)
                            }
                          }}
                          placeholder="e.g. SHIRLY L. DEMECILLO"
                          className={inputClass}
                        />
                        {showStaffSuggestions && filteredLcroStaff.length > 0 && (
                          <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                            <ul className="max-h-56 overflow-auto py-1">
                              {filteredLcroStaff.map((name, idx) => (
                                <li key={name}>
                                  <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => chooseLcroStaff(name)}
                                    className={`w-full px-3 py-2 text-left text-sm transition ${idx === staffSuggestionIndex
                                      ? 'bg-[var(--primary-blue)] text-white'
                                      : 'text-gray-800 hover:bg-gray-100'
                                      }`}
                                  >
                                    {name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">This name will be saved and used for future forms on this computer.</p>
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
            {isEdit ? (
              <button
                type="button"
                onClick={() => navigate('/court-decree/saved')}
                className="court-decree-form-page__btn court-decree-form-page__btn--secondary"
              >
                Back to Files Saved
              </button>
            ) : null}
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

          {showForeignCountryModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 court-decree-form-page__modal-backdrop no-print"
              onClick={() => setShowForeignCountryModal(false)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="court-decree-foreign-country-title"
            >
              <div className="court-decree-form-page__modal-dialog bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-100" onClick={(e) => e.stopPropagation()}>
                <h3 id="court-decree-foreign-country-title" className="text-lg font-bold text-gray-800 mb-2">Foreign record confirmation</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Has the foreign person/decree already been registered at LCRO of Manila?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      update('country', 'PHILIPPINES')
                      setShowForeignCountryNote(true)
                      setShowForeignCountryModal(false)
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium"
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      update('country', 'FOREIGN')
                      setShowForeignCountryNote(false)
                      setShowForeignCountryModal(false)
                    }}
                    className="px-4 py-2 rounded-lg bg-[var(--primary-blue)] text-white hover:opacity-90 text-sm font-semibold"
                  >
                    Yes
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
        </FormBodyFieldShortcuts>
      </div>
      <ToastHost toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
