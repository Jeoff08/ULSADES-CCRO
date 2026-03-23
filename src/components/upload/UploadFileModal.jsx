import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUploadedFile, readFileAsDataUrl, setUploadedFile, moveUploadedFileToTrash } from '../../lib/uploadedFileStore'
import ConfirmRemoveModal from './ConfirmRemoveModal'

function IconUpload(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 8l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconEye(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

export default function UploadFileModal({ open, onClose, scopeKey, title, accept = 'image/*,application/pdf,text/*', onChanged }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)
  const existing = useMemo(() => (scopeKey ? getUploadedFile(scopeKey) : null), [scopeKey, open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const doPick = () => inputRef.current?.click()

  const onPick = async (e) => {
    const f = e.target.files?.[0]
    if (!f || !scopeKey) return
    setBusy(true)
    try {
      const dataUrl = await readFileAsDataUrl(f)
      setUploadedFile(scopeKey, {
        title: title || '',
        name: f.name,
        mimeType: f.type || 'application/octet-stream',
        dataUrl,
        uploadedAt: new Date().toISOString(),
      })
      onChanged?.()
      onChanged?.({ kind: 'uploaded', scopeKey, title: title || '', fileName: f.name })
      e.target.value = ''
      onClose?.()
    } finally {
      setBusy(false)
    }
  }

  const removeNow = (meta) => {
    if (!scopeKey) return
    moveUploadedFileToTrash(scopeKey, meta)
    onChanged?.({ kind: 'removed', scopeKey, title: title || '', ...meta })
    setConfirmRemoveOpen(false)
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
        >
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Attachment</p>
              <h2 className="text-base font-bold text-gray-900 truncate" title={title || ''}>
                {title || 'Upload file'}
              </h2>
              {existing?.name ? (
                <p className="text-xs text-gray-600 mt-1 truncate" title={existing.name}>
                  Current: <span className="font-medium">{existing.name}</span>
                </p>
              ) : (
                <p className="text-xs text-gray-600 mt-1">No file uploaded yet.</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 w-9 h-9 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              aria-label="Close"
              title="Close"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>

          <div className="p-5 space-y-3">
            <input ref={inputRef} type="file" className="hidden" accept={accept} onChange={onPick} />

            <button
              type="button"
              onClick={doPick}
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-black disabled:opacity-60"
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/60 border-t-white animate-spin" aria-hidden />
                  <span>Uploading…</span>
                </span>
              ) : (
                <>
                  <IconUpload className="w-5 h-5" />
                  {existing ? 'Replace file' : 'Upload file'}
                </>
              )}
            </button>

            {existing ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/uploaded/${encodeURIComponent(scopeKey)}`)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm font-semibold hover:bg-gray-50"
                >
                  <IconEye className="w-5 h-5" />
                  View
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRemoveOpen(true)}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-red-300 bg-white text-red-700 text-sm font-semibold hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ) : null}

            <p className="text-xs text-gray-500 leading-relaxed">
              Supported: images, PDF, and text files.
            </p>
          </div>
        </div>
      </div>
      <ConfirmRemoveModal
        open={confirmRemoveOpen}
        title={title ? `${title} — Remove attachment` : 'Remove attachment'}
        onClose={() => setConfirmRemoveOpen(false)}
        onConfirm={(meta) => removeNow(meta)}
      />
    </div>
  )
}

