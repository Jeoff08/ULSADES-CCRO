import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { defaultCourtDecree } from '../../lib/courtDecreeDefaults'
import { addSavedCourtDecree, getCourtDecreeDraft, updateSavedCourtDecree } from '../../lib/courtDecreeStorage'
import { COURT_DECREE_TYPES, AFFECTED_DOCUMENT_OPTIONS } from './constants'

const inputClass = 'w-full border border-orange-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-orange-100 focus:border-[var(--primary-blue)] focus:ring-2 focus:ring-[var(--primary-blue)]/20'

function CourtDecreeSection({ number, title, children }) {
  return (
    <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 bg-white">
      <div className="bg-[var(--primary-blue)] text-white px-4 py-2.5 font-semibold text-sm uppercase">
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

  const [form, setForm] = useState(() => {
    const draft = getCourtDecreeDraft()
    if (draft && typeof draft === 'object') {
      return { ...defaultCourtDecree, ...draft, formType: draft.formType || typeFromUrl || 'cert-authenticity' }
    }
    return {
      ...defaultCourtDecree,
      formType: COURT_DECREE_TYPES.find(t => t.id === typeFromUrl)?.id || typeFromUrl || 'cert-authenticity',
    }
  })

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const proceedToPrint = () => {
    const editId = searchParams.get('id')
    const isEdit = searchParams.get('edit') === '1'
    if (isEdit && editId) {
      updateSavedCourtDecree(editId, form)
    } else {
      addSavedCourtDecree(form)
    }
    navigate(`/court-decree/print?type=${form.formType}`)
  }

  useEffect(() => {
    const type = searchParams.get('type')
    if (type && COURT_DECREE_TYPES.some(t => t.id === type)) {
      setForm((prev) => ({ ...prev, formType: type }))
    }
  }, [searchParams])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white bg-red-600 px-6 py-4 rounded-lg text-center uppercase">
          Court Decree Automated Data Entry Form
        </h1>
      </div>

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
            <div className="bg-[var(--primary-blue)] text-white text-xs px-2 py-1 rounded mb-1 w-fit">Court or Racco?</div>
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
          <p className="text-sm text-gray-600">NOTE: Manually fill-up Form 3A</p>
          <div className="flex gap-4">
            <Link to="/court-decree/form?type=lcr-form-1a" className="text-[var(--primary-blue)] font-medium hover:underline">FORM 1A</Link>
            <Link to="/court-decree/form?type=lcr-form-2a" className="text-[var(--primary-blue)] font-medium hover:underline">FORM 2A</Link>
            <Link to="/court-decree/form?type=lcr-form-3a" className="text-[var(--primary-blue)] font-medium hover:underline">FORM 3A</Link>
          </div>
        </div>
      </CourtDecreeSection>

      <CourtDecreeSection number="3" title="Document owner/s">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={form.documentOwnerName}
            onChange={(e) => update('documentOwnerName', e.target.value)}
            placeholder="e.g. SPS. FRANCIS CANO CUBERO AND JULIEMAE ORLANES BAGTONG"
            className={inputClass}
          />
        </div>
      </CourtDecreeSection>

      <CourtDecreeSection number="4" title="Court decree details">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Issued</label>
            <input type="text" value={form.dateIssued} onChange={(e) => update('dateIssued', e.target.value)} placeholder="e.g. 30-May-25" className={inputClass} />
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
              <input type="text" value={form.dateRegistered} onChange={(e) => update('dateRegistered', e.target.value)} placeholder="e.g. 13-Jun-25" className={inputClass} />
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

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => navigate('/court-decree')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2 bg-[var(--primary-blue)] text-white rounded-lg text-sm font-medium hover:opacity-90"
        >
          Done
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowConfirm(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm submission</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to proceed? Please verify that all entries are correct. You will be directed to the print view.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { setShowConfirm(false); proceedToPrint() }}
                className="px-4 py-2 bg-[var(--primary-blue)] text-white rounded-lg text-sm font-medium hover:opacity-90"
              >
                Confirm &amp; Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="mt-8 text-xs text-gray-500">created by: ATTY. YUSSIF DON JUSTIN F. MARTIL</p>
    </div>
  )
}
