import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  clearSupplementalActive,
  clearSupplementalDraft,
  deleteSavedSupplemental,
  getSavedSupplementalList,
  loadSavedSupplementalToDraft,
} from './lib/supplementalSavedStorage'

function formatSavedAt(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-PH', { dateStyle: 'medium' }) + ' ' + d.toLocaleTimeString('en-PH', { timeStyle: 'short' })
  } catch {
    return iso
  }
}

function formatSupplementType(type) {
  const t = String(type || '').toLowerCase()
  if (t === 'sex') return 'Sex'
  if (t === 'middlename' || t === 'middle_name' || t === 'middle name') return 'Middle Name'
  return 'Geographical'
}

function supplementTypeBadgeClass(type) {
  const t = String(type || '').toLowerCase()
  if (t === 'sex') return 'border-red-200 bg-red-50 text-red-700'
  if (t === 'middlename' || t === 'middle_name' || t === 'middle name') return 'border-blue-200 bg-blue-50 text-blue-700'
  return 'border-green-200 bg-green-50 text-green-700'
}

export default function SupplementalSaved() {
  const navigate = useNavigate()
  const [rev, setRev] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const list = useMemo(() => getSavedSupplementalList().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)), [rev])
  const supplementalTotal = list.length
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return list
    return list.filter((item) => {
      const label = String(item.label || 'Supplemental Report').toLowerCase()
      const kind = formatSupplementType(item?.data?.supplementType).toLowerCase()
      const savedAt = formatSavedAt(item.savedAt).toLowerCase()
      return label.includes(q) || kind.includes(q) || savedAt.includes(q)
    })
  }, [list, searchQuery])

  return (
    <div className="p-6">
      <h1 className="text-base font-bold text-gray-800 mb-1">Supplemental – Files Saved</h1>
      <p className="text-sm text-gray-500 mb-4">Supplemental reports saved from the form appear here.</p>
      <div className="mb-3 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/ausf/saved"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[var(--primary-blue)] text-[var(--primary-blue)] text-sm font-medium rounded-lg hover:bg-[var(--primary-blue)]/10 no-underline text-center min-h-[2.75rem]"
          >
            AUSF saved
          </Link>
          <Link
            to="/court-decree/saved"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[var(--primary-blue)] text-[var(--primary-blue)] text-sm font-medium rounded-lg hover:bg-[var(--primary-blue)]/10 no-underline text-center min-h-[2.75rem]"
          >
            Court Decree saved
          </Link>
          <Link
            to="/legitimation/saved"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[var(--primary-blue)] text-[var(--primary-blue)] text-sm font-medium rounded-lg hover:bg-[var(--primary-blue)]/10 no-underline text-center min-h-[2.75rem]"
          >
            Legitimation saved
          </Link>
          <span
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-emerald-600 bg-emerald-50 text-emerald-900 text-sm font-semibold rounded-lg text-center min-h-[2.75rem] cursor-default"
            aria-current="page"
          >
            Supplemental saved
          </span>
        </div>
        <Link
          to="/legal-instrument/supplemental"
          onClick={() => {
            clearSupplementalActive()
            clearSupplementalDraft()
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-blue)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-blue-light)] no-underline w-full sm:w-auto justify-center"
        >
          New Supplemental
        </Link>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 inline-block" aria-label={`Supplemental total: ${supplementalTotal}`}>
          <span className="text-sm font-bold text-gray-600">Total: {supplementalTotal}</span>
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
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500 text-center">
          No saved Supplemental files yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-sm text-gray-500 text-center">
              No matches for &quot;{searchQuery}&quot;. Try a different search term.
            </div>
          ) : (
          filteredList.map((item) => (
            <li key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="min-w-0">
                <p className="font-medium text-gray-800 truncate">{item.label || 'Supplemental Report'}</p>
                <p className="text-xs text-gray-500 mt-0.5">Affidavit for Supplemental Report · {formatSavedAt(item.savedAt)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${supplementTypeBadgeClass(item?.data?.supplementType)}`}>
                  {formatSupplementType(item?.data?.supplementType)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (loadSavedSupplementalToDraft(item.id)) navigate('/legal-instrument/supplemental')
                  }}
                  className="px-3 py-1.5 border border-[var(--primary-blue)] text-[var(--primary-blue)] text-sm font-medium rounded-lg hover:bg-[var(--primary-blue)]/10"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (loadSavedSupplementalToDraft(item.id)) navigate('/legal-instrument/supplemental/print')
                  }}
                  className="px-3 py-1.5 bg-[var(--primary-blue)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-blue-light)]"
                >
                  View &amp; Print
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const label = item.label || 'this saved supplemental report'
                    const ok = window.confirm(
                      `Delete "${label}"?\n\nThis removes the saved file from this device. You cannot undo this action.`
                    )
                    if (!ok) return
                    deleteSavedSupplemental(item.id)
                    setRev((v) => v + 1)
                  }}
                  className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Remove
                </button>
              </div>
            </li>
          ))
          )}
        </ul>
      )}
    </div>
  )
}

