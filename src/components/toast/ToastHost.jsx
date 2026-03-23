import React, { useEffect, useState } from 'react'

export default function ToastHost({ toasts, onDismiss }) {
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setEntered(true), 0)
    return () => window.clearTimeout(id)
  }, [])

  if (!toasts?.length) return null

  return (
    <div className="fixed top-4 right-4 z-[80] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            'pointer-events-auto min-w-[260px] max-w-[360px] rounded-xl border shadow-lg overflow-hidden bg-white',
            'transition-all duration-300 ease-out',
            entered ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-0',
            t.type === 'success' ? 'border-emerald-200' : t.type === 'error' ? 'border-red-200' : 'border-gray-200',
          ].join(' ')}
        >
          <div className={['h-1', t.type === 'success' ? 'bg-emerald-500' : t.type === 'error' ? 'bg-red-500' : 'bg-gray-500'].join(' ')} />
          <div className="px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">{t.title}</p>
            {t.message ? <p className="text-xs text-gray-600 mt-0.5">{t.message}</p> : null}
            {t.actionLabel && t.onAction ? (
              <div className="mt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    t.onAction?.()
                    onDismiss?.(t.id)
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-black"
                >
                  {t.actionLabel}
                </button>
                <button
                  type="button"
                  onClick={() => onDismiss?.(t.id)}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  Dismiss
                </button>
              </div>
            ) : null}
          </div>
          <div className="h-1 bg-gray-100">
            <div className="toast-progress h-1 bg-gray-700/60" />
          </div>
        </div>
      ))}
    </div>
  )
}

