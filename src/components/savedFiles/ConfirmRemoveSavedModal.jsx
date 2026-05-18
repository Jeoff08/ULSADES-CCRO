import React from 'react'

/**
 * Delete confirmation for Files Saved lists (matches AUSF / Court Decree / Legitimation).
 * @param {string} backdropClassName - e.g. supplemental-saved-anim-backdrop
 */
export default function ConfirmRemoveSavedModal({ backdropClassName, onCancel, onConfirm }) {
  return (
    <div
      className={`${backdropClassName} fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-remove-title"
    >
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
              <h2 id="confirm-remove-title" className="text-base font-bold text-gray-900 tracking-tight">
                Remove saved file?
              </h2>
              <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
                This saved file will be permanently removed. You can use Undo in the toast after removing if you change your mind.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 px-6 pb-6 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
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
  )
}
