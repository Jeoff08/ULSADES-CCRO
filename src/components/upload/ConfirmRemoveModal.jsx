import React, { useEffect } from 'react'

export default function ConfirmRemoveModal({ open, onClose, title, onConfirm }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confirm removal</p>
              <h2 className="text-base font-bold text-gray-900 truncate" title={title || ''}>
                {title || 'Remove uploaded file'}
              </h2>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                The attachment will be removed from this slot. Where available, you can undo from the toast that appears afterward.
              </p>
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

          <div className="p-5 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onConfirm?.({ name: '', reason: '' })}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-red-300 bg-white text-red-700 text-sm font-semibold hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
