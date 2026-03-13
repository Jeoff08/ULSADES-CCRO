import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { defaultCourtDecree } from './lib/courtDecreeDefaults'
import { addSavedCourtDecree, getCourtDecreeDraft, updateSavedCourtDecree } from './lib/courtDecreeStorage'
import { getDocumentOwnerOptions } from '../../lib/documentOwnerOptions'
import { COURT_DECREE_TYPES, AFFECTED_DOCUMENT_OPTIONS, DATE_MONTHS } from './constants'

const LCR_FORM_TYPES = ['lcr-form-1a', 'lcr-form-2a', 'lcr-form-3a']

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

function CourtDecreeSection({ number, title, children }) {
  return (
    <div className="mb-6 rounded-xl overflow-hidden border border-gray-100 bg-[var(--card-bg)] shadow-sm">
      <div className="bg-[var(--primary-blue)] text-white px-4 py-2.5 font-semibold text-sm uppercase tracking-wide">
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

  const editId = searchParams.get('id')
  const isEdit = searchParams.get('edit') === '1'
  const [showOtherWarning, setShowOtherWarning] = useState(false)
  const [blockPrintReason, setBlockPrintReason] = useState(null)
  const [documentOwnerSuggestionsOpen, setDocumentOwnerSuggestionsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState(null)
  const documentOwnerInputRef = useRef(null)
  const documentOwnerWrapperRef = useRef(null)
  const documentOwnerSuggestionsRef = useRef(null)

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
  const documentOwnerGroups = isLcrFormType ? getDocumentOwnerOptions(form.affectedDocument) : { legitimation: [], courtDecree: [] }
  const documentOwnerOptionsFlat = [...documentOwnerGroups.legitimation, ...documentOwnerGroups.courtDecree]
  const hasDocumentOwnerOptions = documentOwnerOptionsFlat.length > 0
  const selectedOwnerMatch = hasDocumentOwnerOptions && documentOwnerOptionsFlat.some(
    (o) => (o.value || '').trim().toUpperCase() === (form.documentOwnerName || '').trim().toUpperCase()
  )
  const isOtherMode = isLcrFormType && (form.documentOwnerName || '').trim() && !selectedOwnerMatch

  const documentOwnerTyped = (form.documentOwnerName || '').trim()
  const documentOwnerQuery = documentOwnerTyped.toUpperCase()
  const filteredLegitimation = documentOwnerQuery
    ? documentOwnerGroups.legitimation.filter((o) => (o.value || '').toUpperCase().startsWith(documentOwnerQuery))
    : documentOwnerGroups.legitimation
  const filteredCourtDecree = documentOwnerQuery
    ? documentOwnerGroups.courtDecree.filter((o) => (o.value || '').toUpperCase().startsWith(documentOwnerQuery))
    : documentOwnerGroups.courtDecree
  const hasDocumentOwnerSuggestions = documentOwnerSuggestionsOpen && (filteredLegitimation.length > 0 || filteredCourtDecree.length > 0)

  const updateDropdownPosition = () => {
    const el = documentOwnerWrapperRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setDropdownPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width })
  }

  useLayoutEffect(() => {
    if (!hasDocumentOwnerSuggestions) {
      setDropdownPosition(null)
      return
    }
    updateDropdownPosition()
    window.addEventListener('scroll', updateDropdownPosition, true)
    window.addEventListener('resize', updateDropdownPosition)
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true)
      window.removeEventListener('resize', updateDropdownPosition)
    }
  }, [hasDocumentOwnerSuggestions])

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
          <div className="court-decree-form-page__instruction">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            NOTE: Manually fill-up Form 3A
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            <Link to="/court-decree/form?type=lcr-form-1a" className="text-[var(--primary-blue)] font-semibold text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/30 rounded px-2 py-1">FORM 1A</Link>
            <Link to="/court-decree/form?type=lcr-form-2a" className="text-[var(--primary-blue)] font-semibold text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/30 rounded px-2 py-1">FORM 2A</Link>
            <Link to="/court-decree/form?type=lcr-form-3a" className="text-[var(--primary-blue)] font-semibold text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/30 rounded px-2 py-1">FORM 3A</Link>
          </div>
          {isLcrFormType && (
            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm flex flex-col gap-2">
              <span className="font-medium">For LCR Form 1A / 2A / 3A:</span>
              <p>A matching Legitimation record must exist. If needed, fill and save a Legitimation record first, then return here and select the document owner.</p>
            </div>
          )}
        </div>
      </CourtDecreeSection>
      </div>

      <div className="court-decree-form-page__section" style={sectionDelay(sectionIndex++)}>
      <CourtDecreeSection number="3" title="Document owner/s">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isLcrFormType ? 'Document owner (from saved Legitimation or Court Decree records)' : 'Document owner/s'}
          </label>
          {isLcrFormType ? (
            <>
              {!hasDocumentOwnerOptions ? (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm space-y-3">
                  <p>No Legitimation records found. Save a Legitimation record first, then return to this form.</p>
                  <Link
                    to="/legitimation/form"
                    className="inline-flex items-center px-3 py-2 bg-[var(--primary-blue)] text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/50"
                  >
                    Open Legitimation form
                  </Link>
                </div>
              ) : (
                <>
                  <div ref={documentOwnerWrapperRef} className="relative flex items-stretch">
                    <input
                      ref={documentOwnerInputRef}
                      type="text"
                      value={form.documentOwnerName}
                      onChange={(e) => update('documentOwnerName', e.target.value)}
                      onFocus={() => setDocumentOwnerSuggestionsOpen(true)}
                      onBlur={() => {
                        setShowOtherWarning(true)
                        setTimeout(() => setDocumentOwnerSuggestionsOpen(false), 200)
                      }}
                      placeholder="Select or type document owner (e.g. SPS. FRANCIS CANO CUBERO AND JULIEMAE ORLANES BAGTONG)"
                      className={`${inputClass} rounded-r-none`}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        documentOwnerInputRef.current?.focus()
                        setDocumentOwnerSuggestionsOpen(true)
                      }}
                      className="flex items-center justify-center w-10 rounded-r-lg border border-l-0 border-orange-300 bg-orange-100 text-gray-600 hover:bg-orange-200/60 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/20 focus:ring-inset"
                      title="Show options"
                      aria-label="Show document owner options"
                    >
                      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {hasDocumentOwnerSuggestions && dropdownPosition && createPortal(
                      <ul
                        ref={documentOwnerSuggestionsRef}
                        className="fixed z-[100] max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg py-1 text-sm"
                        role="listbox"
                        style={{
                          top: dropdownPosition.top,
                          left: dropdownPosition.left,
                          width: dropdownPosition.width,
                        }}
                      >
                        {filteredLegitimation.length > 0 && (
                          <li className="px-3 py-1.5 text-gray-500 text-xs font-semibold uppercase tracking-wide border-b border-gray-100">Legitimation</li>
                        )}
                        {filteredLegitimation.map((opt) => (
                          <li
                            key={`leg-${opt.value}`}
                            role="option"
                            className="px-3 py-2 cursor-pointer hover:bg-[var(--primary-blue)]/10 text-gray-800"
                            onMouseDown={(e) => { e.preventDefault(); update('documentOwnerName', opt.value); documentOwnerInputRef.current?.focus(); }}
                          >
                            {opt.label}
                          </li>
                        ))}
                        {filteredCourtDecree.length > 0 && (
                          <li className="px-3 py-1.5 text-gray-500 text-xs font-semibold uppercase tracking-wide border-b border-gray-100 mt-1">Court Decree</li>
                        )}
                        {filteredCourtDecree.map((opt) => (
                          <li
                            key={`cd-${opt.value}`}
                            role="option"
                            className="px-3 py-2 cursor-pointer hover:bg-[var(--primary-blue)]/10 text-gray-800"
                            onMouseDown={(e) => { e.preventDefault(); update('documentOwnerName', opt.value); documentOwnerInputRef.current?.focus(); }}
                          >
                            {opt.label}
                          </li>
                        ))}
                      </ul>,
                      document.body
                    )}
                  </div>
                  {showOtherWarning && isOtherMode && (
                    <p className="mt-2 text-amber-700 text-sm">
                      No matching Legitimation record found for this name. LCR output may use default or draft data.
                    </p>
                  )}
                </>
              )}
            </>
          ) : (
            <input
              type="text"
              value={form.documentOwnerName}
              onChange={(e) => update('documentOwnerName', e.target.value)}
              placeholder="e.g. SPS. FRANCIS CANO CUBERO AND JULIEMAE ORLANES BAGTONG"
              className={inputClass}
            />
          )}
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
          if (isLcrFormType && !(form.documentOwnerName || '').trim()) {
            setBlockPrintReason('Please select or enter a document owner. For LCR Form 1A/2A/3A a matching Legitimation or Court Decree record is required.')
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

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 court-decree-form-page__modal-backdrop no-print" onClick={() => setShowConfirm(false)} role="dialog" aria-modal="true" aria-labelledby="court-decree-confirm-title">
          <div className="court-decree-form-page__modal-dialog bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-100" onClick={(e) => e.stopPropagation()}>
            <h3 id="court-decree-confirm-title" className="text-lg font-bold text-gray-800 mb-2">Confirm submission</h3>
            <p className="text-gray-600 text-sm mb-4">
              Are you sure you want to proceed? Please verify that all entries are correct. You will be directed to the print view.
            </p>
            {isLcrFormType && isOtherMode && (
              <p className="text-amber-700 text-sm mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                No matching Legitimation record found for the entered name. LCR output may use default or draft data. You may go back to select a saved record or proceed anyway.
              </p>
            )}
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
