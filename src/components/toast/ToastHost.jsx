import React, { useEffect, useState } from 'react'

/** Hand-drawn style success check (brush stroke circle + check). */
function SuccessCheckIcon({ className = 'h-11 w-11' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="32"
        cy="32"
        r="26"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="100"
        className="toast-success-circle"
      />
      <path
        d="M19 33.5 L29.5 44 L47 22.5"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="toast-success-check"
      />
    </svg>
  )
}

function ToastItem({ toast, onDismiss }) {
  const [entered, setEntered] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const enterId = window.requestAnimationFrame(() => setEntered(true))
    return () => window.cancelAnimationFrame(enterId)
  }, [])

  const handleDismiss = () => {
    setExiting(true)
    window.setTimeout(() => onDismiss?.(toast.id), 280)
  }

  const isSuccess = toast.type === 'success'
  const durationMs = toast.durationMs || 5000

  if (isSuccess) {
    return (
      <div
        role="status"
        className={[
          'pointer-events-auto min-w-[280px] max-w-[380px] rounded-xl overflow-hidden',
          'border border-emerald-200/90 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/80',
          'shadow-[0_8px_28px_rgba(16,185,129,0.22),0_2px_8px_rgba(30,58,95,0.08)]',
          'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          entered && !exiting
            ? 'toast-top-right toast-enter translate-x-0 opacity-100 scale-100'
            : exiting
              ? 'translate-x-full opacity-0 scale-[0.98]'
              : 'translate-x-full opacity-0 scale-[0.96]',
        ].join(' ')}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" aria-hidden="true" />
        <div className="flex gap-3 items-start px-4 py-3.5 pl-3.5 relative">
          <span className="toast-success-icon-wrap shrink-0 text-emerald-500 drop-shadow-[0_1px_2px_rgba(16,185,129,0.35)]">
            <SuccessCheckIcon />
          </span>
          <div className="min-w-0 flex-1 pt-0.5 pr-6">
            <p className="text-sm font-bold text-emerald-950">{toast.title}</p>
            {toast.message ? (
              <p className="text-xs text-emerald-800/85 mt-0.5 leading-snug">{toast.message}</p>
            ) : null}
            {toast.actionLabel && toast.onAction ? (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => {
                    toast.onAction?.()
                    handleDismiss()
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  {toast.actionLabel}
                </button>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-xs font-semibold text-emerald-700/70 hover:text-emerald-950 transition-colors"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
        <div className="h-1 bg-emerald-100">
          <div
            className="toast-progress h-1 bg-emerald-500 rounded-br"
            style={{ animationDuration: `${durationMs}ms` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      role="status"
      className={[
        'pointer-events-auto min-w-[260px] max-w-[360px] rounded-xl border shadow-lg overflow-hidden bg-white',
        'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        entered && !exiting
          ? 'toast-top-right toast-enter translate-x-0 opacity-100'
          : exiting
            ? 'translate-x-full opacity-0'
            : 'translate-x-full opacity-0',
        toast.type === 'error' ? 'border-red-200' : 'border-gray-200',
      ].join(' ')}
    >
      <div
        className={[
          'h-1',
          toast.type === 'error' ? 'bg-red-500' : 'bg-[var(--primary-blue)]',
        ].join(' ')}
      />
      <div className="px-4 py-3 relative">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          aria-label="Close notification"
        >
          ×
        </button>
        <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
        {toast.message ? <p className="text-xs text-gray-600 mt-0.5">{toast.message}</p> : null}
        {toast.actionLabel && toast.onAction ? (
          <div className="mt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                toast.onAction?.()
                handleDismiss()
              }}
              className="px-3 py-1.5 rounded-lg bg-[var(--primary-blue)] text-white text-xs font-semibold hover:bg-[var(--primary-blue-light)] transition-colors"
            >
              {toast.actionLabel}
            </button>
          </div>
        ) : null}
      </div>
      <div className="h-1 bg-gray-100">
        <div
          className="toast-progress h-1 bg-gray-700/60"
          style={{ animationDuration: `${durationMs}ms` }}
        />
      </div>
    </div>
  )
}

export default function ToastHost({ toasts, onDismiss, className = 'z-[80]' }) {
  if (!toasts?.length) return null

  return (
    <div className={`fixed top-4 right-4 flex flex-col gap-2 pointer-events-none ${className}`}>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
