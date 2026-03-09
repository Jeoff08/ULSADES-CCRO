import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSavedLegitimationList, loadSavedLegitimationToDraft, deleteSavedLegitimation, restoreSavedLegitimation } from '../../lib/legitimationStorage'

const LEGITIMATION_TYPE_LABELS = {
  'sole-affidavit': 'Sole Affidavit Legitimation',
  'joint-affidavit': 'Joint Affidavit Legitimation',
  'registration-legitimation': 'Registration of Legitimation',
  'registration-acknowledgement': 'Registration of Acknowledgement',
  'lcr-form-1a': 'LCR Form 1A',
  'transmittal': 'Transmittal',
  'out-of-town-transmittal': 'Out of Town Transmittal',
  'annotation': 'Annotation',
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

export default function LegitimationSaved() {
  const [list, setList] = useState(() => getSavedLegitimationList().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)))
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastProgress, setToastProgress] = useState(100)
  const [lastDeletedItem, setLastDeletedItem] = useState(null)
  const toastIntervalRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    setList(getSavedLegitimationList().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)))
  }, [])

  useEffect(() => {
    if (!toastVisible) return
    setToastProgress(100)
    const start = Date.now()
    const id = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / TOAST_DURATION_MS) * 100)
      setToastProgress(remaining)
      if (remaining <= 0) setToastVisible(false)
    }, 50)
    toastIntervalRef.current = id
    return () => clearInterval(id)
  }, [toastVisible])

  const handleViewPrint = (item) => {
    if (loadSavedLegitimationToDraft(item.id)) navigate(`/legitimation/print?type=${item.formType || 'joint-affidavit'}`)
  }

  const handleEdit = (item) => {
    if (loadSavedLegitimationToDraft(item.id)) navigate(`/legitimation/form?type=${item.formType || 'joint-affidavit'}&edit=1&id=${encodeURIComponent(item.id)}`)
  }

  const openDeleteConfirm = (id) => setConfirmDeleteId(id)
  const closeDeleteConfirm = () => setConfirmDeleteId(null)

  const handleConfirmDelete = () => {
    if (!confirmDeleteId) return
    const item = list.find((x) => x.id === confirmDeleteId)
    if (item) setLastDeletedItem({ ...item, data: item.data ? { ...item.data } : undefined })
    deleteSavedLegitimation(confirmDeleteId)
    setList(getSavedLegitimationList().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)))
    setConfirmDeleteId(null)
    setToastVisible(true)
  }

  const handleUndo = () => {
    if (lastDeletedItem && restoreSavedLegitimation(lastDeletedItem)) {
      setList(getSavedLegitimationList().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)))
      setLastDeletedItem(null)
      setToastVisible(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-base font-bold text-gray-800 mb-1">Legitimation – Files Saved</h1>
      <p className="text-sm text-gray-500 mb-4">
        Legitimation forms saved when you click Done appear here. Open a saved file to view and print, or start a new form.
      </p>
      <div className="flex flex-wrap gap-3 mb-6">
        <Link
          to="/ausf/saved"
          className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-[var(--primary-blue)] text-[var(--primary-blue)] text-sm font-medium rounded-lg hover:bg-[var(--primary-blue)]/10 transition"
        >
          AUSF saved
        </Link>
        <Link
          to="/court-decree/saved"
          className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-[var(--primary-blue)] text-[var(--primary-blue)] text-sm font-medium rounded-lg hover:bg-[var(--primary-blue)]/10 transition"
        >
          Court Decree saved
        </Link>
        <Link
          to="/legitimation/form?type=joint-affidavit"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-blue)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-blue-light)] transition"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          New Legitimation
        </Link>
      </div>
      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500 text-center">
          No saved Legitimation files yet. Complete a Legitimation form and click Done to save it here.
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-gray-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-800 truncate">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {LEGITIMATION_TYPE_LABELS[item.formType] || item.formType} · {formatSavedAt(item.savedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  className="px-3 py-1.5 border border-[var(--primary-blue)] text-[var(--primary-blue)] text-sm font-medium rounded-lg hover:bg-[var(--primary-blue)]/10 transition"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleViewPrint(item)}
                  className="px-3 py-1.5 bg-[var(--primary-blue)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-blue-light)] transition"
                >
                  View &amp; Print
                </button>
                <button
                  type="button"
                  onClick={() => openDeleteConfirm(item.id)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {confirmDeleteId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="confirm-remove-title">
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
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
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
                  className="mt-2 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--primary-blue)] px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-[var(--primary-blue-light)] transition focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:ring-offset-2"
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
              className="h-full bg-[var(--primary-blue)]/70 transition-all duration-150 ease-linear rounded-br"
              style={{ width: `${toastProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
