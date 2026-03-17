import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { defaultCourtDecree } from './lib/courtDecreeDefaults'
import { addSavedCourtDecree, getCourtDecreeDraft, updateSavedCourtDecree } from './lib/courtDecreeStorage'
import { COURT_DECREE_TYPES, AFFECTED_DOCUMENT_OPTIONS, DATE_MONTHS } from './constants'

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

function getMissingFields(form) {
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

  useEffect(() => {
    if ((form.documentOwnerName || '').trim()) setBlockPrintReason(null)
  }, [form.documentOwnerName])

  const isLcrFormType = LCR_FORM_TYPES.includes(form.formType)

  let sectionIndex = 0
  const sectionDelay = (i) => ({ animationDelay: `${i * 0.06}s` })

  return (
    <div className="court-decree-form-page no-print">
      <div className="court-decree-form-page__card">
        <header className="court-decree-form-page__header no-print">
          <h1>Court Decree Automated Data Entry Form</h1>
          <p>Unified Legal Status Automated Data Entry System — Iligan City</p>
        </header>

        <div className="court-decree-form-page__body">
      <div className="court-decree-form-page__section" style={sectionDelay(sectionIndex++)}>
      <CourtDecreeSection number="1" title="What country issued the court order/decree">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              value={form.country}
              onChange={(e) => update('country', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <div className="court-decree-form-page__label-tag">Court or Racco?</div>
            <input
              type="text"
              value={form.courtOrRacco}
              onChange={(e) => update('courtOrRacco', e.target.value)}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
            <select
              value={form.affectedDocument}
              onChange={(e) => update('affectedDocument', e.target.value)}
              className={inputClass}
            >
              {AFFECTED_DOCUMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="court-decree-form-page__instruction court-decree-form-page__instruction--muted flex items-center gap-2 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            NOTE: Manually fill-up Form 3A
          </div>
          <div className="court-decree-form-page__form-links flex flex-wrap gap-2 mt-3">
            <Link to="/court-decree/form?type=lcr-form-1a" className="court-decree-form-page__form-link">FORM 1A</Link>
            <Link to="/court-decree/form?type=lcr-form-2a" className="court-decree-form-page__form-link">FORM 2A</Link>
            <Link to="/court-decree/form?type=lcr-form-3a" className="court-decree-form-page__form-link">FORM 3A</Link>
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
            onChange={(e) => update('documentOwnerName', e.target.value)}
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
            <input type="text" value={form.courtThatIssued} onChange={(e) => update('courtThatIssued', e.target.value)} placeholder="e.g. 4TH SHARI'A CIRCUIT COURT, ILIGAN CITY" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issued/Rendered By (Title)</label>
              <input type="text" value={form.issuedByTitle} onChange={(e) => update('issuedByTitle', e.target.value)} placeholder="e.g. Judge" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" value={form.issuedByName} onChange={(e) => update('issuedByName', e.target.value)} placeholder="e.g. HON. OSOP MANGOTARA ALI" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type of Case</label>
            <input type="text" value={form.typeOfCase} onChange={(e) => update('typeOfCase', e.target.value)} placeholder="e.g. Civil Case No." className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Case No</label>
            <input type="text" value={form.caseNo} onChange={(e) => update('caseNo', e.target.value)} placeholder="e.g. 2025-034" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Authenticated By</label>
            <input type="text" value={form.authenticatedBy} onChange={(e) => update('authenticatedBy', e.target.value)} placeholder="e.g. NASRODING A. ALI" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registry Number</label>
              <input type="text" value={form.registryNumber} onChange={(e) => update('registryNumber', e.target.value)} placeholder="e.g. 64" className={inputClass} />
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
              onChange={(e) => update('caseTitle', e.target.value)}
              rows={3}
              placeholder="e.g. IN RE: JOINT PETITION TO APPROVE AND REGISTER THE DIVORCE OF SPOUSES..."
              className={inputClass}
            />
          </div>
        </div>
      </CourtDecreeSection>
      </div>

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
          if (isLcrFormType && !(form.documentOwnerName || '').trim()) {
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
