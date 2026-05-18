import React from 'react'

export default function SavedFileRemovedToast({ visible, progress, onUndo }) {
  if (!visible) return null

  return (
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
              onClick={onUndo}
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
          className="h-full bg-[var(--primary-blue)]/70 transition-all duration-150 ease-linear rounded-br"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
