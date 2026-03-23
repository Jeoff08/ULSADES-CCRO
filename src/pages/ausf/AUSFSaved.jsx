import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSavedAUSFList, loadSavedAUSFToDraft, deleteSavedAUSF, restoreSavedAUSF } from './lib/ausfStorage'
import { hasAnyUploadsForRecord } from '../../lib/uploadedFileStore'
import hasUploadedFilesIcon from '../../assets/has-uploaded-files-icon.svg'

const FORM_TYPE_LABELS = {
  'ausf-only': 'AUSF only',
  'ausf-0-6': 'AUSF 0-6',
  'ausf-07-17': 'AUSF 07-17',
  'reg-ausf': 'Registration of AUSF',
  'reg-ack': 'Registration of Acknowledgement',
  'child-ack': 'Child Acknowledge',
  'child-ack-lcr': 'LCR Form 1A (Birth-Available)',
  'child-ack-annotation': 'Annotation',
  'child-not-ack': 'Child Not Acknowledged',
  'child-not-ack-lcr': 'LCR Form A1 (Child Not Acknowledged)',
  'child-not-ack-annotation': 'Annotation (Child Not Acknowledged)',
  'child-not-ack-transmittal': 'Transmittal (Child Not Acknowledged)',
  'out-of-town': 'Out-of-Town Transmittal',
}

function formatSavedAt(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-PH', { dateStyle: 'medium' }) + ' ' + d.toLocaleTimeString('en-PH', { timeStyle: 'short' })
  } catch {
    return iso
  }
}

const TOAST_DURATION_MS = 8000

function matchesSearch(item, query, formTypeLabels) {
  if (!query.trim()) return true
  const q = query.trim().toLowerCase()
  const label = (item.label || '').toLowerCase()
  const formLabel = (formTypeLabels[item.formType] || item.formType || '').toLowerCase()
  const savedAt = formatSavedAt(item.savedAt).toLowerCase()
  return label.includes(q) || formLabel.includes(q) || savedAt.includes(q)
}

const FORM_TYPE_HIDDEN_IN_AUSF_SAVED = 'child-ack-annotation'

function getAusfSavedListForDisplay() {
  return getSavedAUSFList().filter((item) => item.formType !== FORM_TYPE_HIDDEN_IN_AUSF_SAVED)
}

function sortAusfSavedList(items) {
  return [...items].sort((a, b) => {
    const aIsAusfOnly = a.formType === 'ausf-only'
    const bIsAusfOnly = b.formType === 'ausf-only'
    if (aIsAusfOnly && !bIsAusfOnly) return -1
    if (!aIsAusfOnly && bIsAusfOnly) return 1
    return new Date(b.savedAt) - new Date(a.savedAt)
  })
}

export default function AUSFSaved() {
  const [list, setList] = useState(() => sortAusfSavedList(getAusfSavedListForDisplay()))
  const [uploadsRev, setUploadsRev] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastProgress, setToastProgress] = useState(100)
  const [lastDeletedItem, setLastDeletedItem] = useState(null)
  const toastIntervalRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    setList(sortAusfSavedList(getAusfSavedListForDisplay()))
  }, [])

  useEffect(() => {
    const onFocus = () => setUploadsRev((v) => v + 1)
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  useEffect(() => {
    if (!toastVisible) return
    setToastProgress(100)
    const start = Date.now()
    const id = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / TOAST_DURATION_MS) * 100)
      setToastProgress(remaining)
      if (remaining <= 0) {
        setToastVisible(false)
      }
    }, 50)
    toastIntervalRef.current = id
    return () => clearInterval(id)
  }, [toastVisible])

  const handleViewPrint = (item) => {
    if (loadSavedAUSFToDraft(item.id)) navigate(`/ausf/print?id=${encodeURIComponent(item.id)}`)
  }

  const handleEdit = (item) => {
    if (loadSavedAUSFToDraft(item.id)) navigate(`/ausf?edit=1&id=${encodeURIComponent(item.id)}`)
  }

  const openDeleteConfirm = (id) => setConfirmDeleteId(id)
  const closeDeleteConfirm = () => setConfirmDeleteId(null)

  const handleConfirmDelete = () => {
    if (!confirmDeleteId) return
    const item = list.find((x) => x.id === confirmDeleteId)
    if (item) setLastDeletedItem({ ...item, data: item.data ? { ...item.data } : undefined })
    deleteSavedAUSF(confirmDeleteId)
    setList(sortAusfSavedList(getAusfSavedListForDisplay()))
    setConfirmDeleteId(null)
    setToastVisible(true)
  }

  const handleUndo = () => {
    if (lastDeletedItem && restoreSavedAUSF(lastDeletedItem)) {
      setList(sortAusfSavedList(getAusfSavedListForDisplay()))
      setLastDeletedItem(null)
      setToastVisible(false)
    }
  }

  const filteredList = list.filter((item) => matchesSearch(item, searchQuery, FORM_TYPE_LABELS))
  const ausfTotal = getAusfSavedListForDisplay().length

  return (
    <div className="p-6 ausf-saved-anim-page">
      <h1 className="text-base font-bold text-gray-800 mb-1">Files Saved</h1>
      <p className="text-sm text-gray-500 mb-4">
        AUSF forms saved when you click Done appear here. Start a new form or open a saved file to view and print.
      </p>
      <div className="flex flex-wrap gap-3 mb-3">
        <Link
          to="/ausf"
          className="ausf-saved-anim-action inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-blue)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-blue-light)] transition-all duration-200 ease-out hover:shadow-md hover:scale-[1.02] active:scale-[0.98] opacity-0"
          style={{ animationDelay: '0.05s' }}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          New AUSF
        </Link>
        <Link
          to="/court-decree/saved"
          className="ausf-saved-anim-action inline-flex items-center gap-2 px-4 py-2.5 border-2 border-[var(--primary-blue)] text-[var(--primary-blue)] text-sm font-medium rounded-lg hover:bg-[var(--primary-blue)]/10 transition-all duration-200 ease-out hover:shadow-md active:scale-[0.98] opacity-0 no-underline"
          style={{ animationDelay: '0.1s' }}
        >
          Court Decree saved
        </Link>
        <Link
          to="/legitimation/saved"
          className="ausf-saved-anim-action inline-flex items-center gap-2 px-4 py-2.5 border-2 border-[var(--primary-blue)] text-[var(--primary-blue)] text-sm font-medium rounded-lg hover:bg-[var(--primary-blue)]/10 transition-all duration-200 ease-out hover:shadow-md active:scale-[0.98] opacity-0 no-underline"
          style={{ animationDelay: '0.15s' }}
        >
          Legitimation saved
        </Link>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 inline-block" aria-label={`AUSF total: ${ausfTotal}`}>
          <span className="text-sm font-bold text-gray-600">Total: {ausfTotal}</span>
        </div>
        {list.length > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-2 ml-auto">
            <div className="relative min-w-[200px] w-full sm:w-auto sm:max-w-sm">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by label, form type, or date..."
                aria-label="Search saved files"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white focus:border-[var(--primary-blue)] focus:ring-2 focus:ring-[var(--primary-blue)]/20 outline-none transition-all duration-200"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-3 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 ease-out active:scale-95"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      {list.length === 0 ? (
        <div className="ausf-saved-anim-empty rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500 text-center">
          No saved AUSF files yet. Complete an AUSF form and click Done to save it here.
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-sm text-gray-500 text-center">
              No matches for &quot;{searchQuery}&quot;. Try a different search term.
            </div>
          ) : (
          filteredList.map((item, idx) => (
            <li
              key={item.id}
              className="ausf-saved-anim-item rounded-xl border border-gray-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm opacity-0 transition-all duration-200 ease-out hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5"
              style={{ animationDelay: `${0.2 + idx * 0.05}s` }}
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-800 truncate">
                  <span className="truncate">{item.label}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {FORM_TYPE_LABELS[item.formType] || item.formType} · {formatSavedAt(item.savedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {hasAnyUploadsForRecord('ausf', item.id) ? (
                  <span
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-amber-50/90 border border-amber-200/90"
                    title="Has uploaded file(s)"
                    aria-label="Has uploaded file(s)"
                  >
                    <img
                      src={hasUploadedFilesIcon}
                      alt=""
                      className="w-7 h-7 object-contain select-none pointer-events-none"
                      draggable={false}
                    />
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  className="px-3 py-1.5 border border-[var(--primary-blue)] text-[var(--primary-blue)] text-sm font-medium rounded-lg hover:bg-[var(--primary-blue)]/10 transition-all duration-200 ease-out active:scale-95"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleViewPrint(item)}
                  className="px-3 py-1.5 bg-[var(--primary-blue)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-blue-light)] transition-all duration-200 ease-out hover:shadow-md active:scale-95"
                >
                  View &amp; Print
                </button>
                <button
                  type="button"
                  onClick={() => openDeleteConfirm(item.id)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 ease-out active:scale-95"
                >
                  Remove
                </button>
              </div>
            </li>
          ))
          )}
        </ul>
      )}

      {confirmDeleteId != null && (
        <div className="ausf-saved-anim-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="confirm-remove-title">
          <div className="confirm-remove-modal w-full max-w-md overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.05)]">
            <div className="relative bg-gradient-to-b from-red-50/80 to-white px-6 pt-6 pb-5">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-red-500 to-red-400" aria-hidden="true" />
              <div className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 shadow-inner" aria-hidden="true">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h2 id="confirm-remove-title" className="text-base font-bold text-gray-900 tracking-tight">Remove saved file?</h2>
                  <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">This saved file will be permanently removed. You can use Undo in the toast after removing if you change your mind.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 px-6 pb-6 pt-1">
              <button
                type="button"
                onClick={closeDeleteConfirm}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 ease-out hover:shadow-md active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {toastVisible && (
        <div className="toast-enter toast-top-right fixed top-6 right-6 z-50 w-full min-w-[320px] max-w-[480px] overflow-hidden rounded-lg border border-[var(--primary-blue)]/20 bg-white shadow-[0_4px_20px_rgba(30,58,95,0.12),0_0_1px_rgba(0,0,0,0.06)]">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary-blue)]" aria-hidden="true" />
          <div className="pl-3 pr-3 pt-2.5 pb-2">
            <div className="flex gap-2.5 items-center">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary-blue)]/15 text-[var(--primary-blue)]">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-900">File removed</p>
                <p className="mt-0.5 text-[11px] text-gray-500">Closing in 8 seconds.</p>
                <button
                  type="button"
                  onClick={handleUndo}
                  className="mt-2 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--primary-blue)] px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-[var(--primary-blue-light)] transition-all duration-200 ease-out hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:ring-offset-2"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Undo
                </button>
              </div>
            </div>
          </div>
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-[var(--primary-blue)]/70 transition-[width] duration-150 ease-linear rounded-br"
              style={{ width: `${toastProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
