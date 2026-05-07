import React, { useEffect, useMemo, useState } from 'react'
import {
  setUploadedFile,
  getUploadedFile,
  listUploadedFileIndex,
} from '../../lib/uploadedFileStore'

/** Copy bytes from another scope into targetScope (duplicate), for Supplemental / MC2010 etc. */
export default function AttachFromLibraryModal({
  open,
  onClose,
  targetScopeKey,
  targetTitle = '',
  excludeScopeKeys = [],
  onAttached,
}) {
  const [query, setQuery] = useState('')
  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const exclude = useMemo(() => new Set(excludeScopeKeys.filter(Boolean)), [excludeScopeKeys])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return listUploadedFileIndex()
      .filter((r) => r.scope !== targetScopeKey && !exclude.has(r.scope))
      .filter((r) => {
        if (!q) return true
        const hay = `${r.title} ${r.name} ${r.scope}`.toLowerCase()
        return hay.includes(q)
      })
  }, [query, targetScopeKey, exclude, open])

  if (!open) return null

  const attach = (sourceScope) => {
    if (!targetScopeKey) return
    const src = getUploadedFile(sourceScope)
    if (!src?.dataUrl) return
    setUploadedFile(targetScopeKey, {
      title: targetTitle || src.title || '',
      name: src.name || 'attached-file',
      mimeType: src.mimeType || 'application/octet-stream',
      dataUrl: src.dataUrl,
      uploadedAt: new Date().toISOString(),
    })
    onAttached?.()
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-[65]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[min(85vh,32rem)]"
        >
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-start justify-between gap-4 shrink-0">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">From library</p>
              <h2 className="text-base font-bold text-gray-900">Attach scanned file already in ULSADES</h2>
              <p className="text-xs text-gray-600 mt-1 leading-snug">
                Copies an existing attachment (same as AUSF / Court Decree / Legitimation uploads) onto this{' '}
                {targetTitle || 'record'}.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 w-9 h-9 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              aria-label="Close"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>
          <div className="p-4 border-b border-gray-100 shrink-0">
            <label className="sr-only" htmlFor="attach-lib-filter">
              Filter files
            </label>
            <input
              id="attach-lib-filter"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by filename, title, or scope…"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
            />
          </div>
          <ul className="overflow-y-auto flex-1 min-h-0 p-3 space-y-1">
            {rows.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-gray-500">
                No matching files in storage. Upload a scan from AUSF, Court Decree, or Legitimation print screens first,
                or use Upload on this page.
              </li>
            ) : (
              rows.map((r) => (
                <li key={r.scope}>
                  <button
                    type="button"
                    onClick={() => attach(r.scope)}
                    className="w-full text-left rounded-xl border border-gray-200 hover:border-[var(--primary-blue)] hover:bg-[var(--primary-blue)]/5 px-3 py-2.5 transition-colors"
                  >
                    <span className="block text-sm font-semibold text-gray-900 truncate" title={r.name}>
                      {r.name}
                    </span>
                    {r.title ? (
                      <span className="block text-xs text-gray-600 truncate mt-0.5">{r.title}</span>
                    ) : null}
                    <span className="block text-[10px] font-mono text-gray-400 truncate mt-1" title={r.scope}>
                      {r.scope}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
