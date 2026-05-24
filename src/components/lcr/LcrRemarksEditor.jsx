import React, { useEffect, useState } from 'react'
import ToastHost from '../toast/ToastHost'
import { useToasts } from '../toast/useToasts'
import { lcrRemarksBodyStyle, withLcrRemarksPrintClass } from '../../lib/lcrRemarksFontSize'

/**
 * Editable LCR REMARKS block with a green Save / Saved control on the left (screen only).
 * Persists via `onSave` when the user clicks Save.
 */
export default function LcrRemarksEditor({
  data,
  value = '',
  onSave,
  printContent,
  blockClassName = '',
  label = 'REMARKS:',
  labelClassName = 'font-bold text-sm mb-0.5',
  printClassName = 'text-justify whitespace-pre-wrap break-words [overflow-wrap:anywhere]',
  textareaClassName = 'w-full border border-gray-300 rounded px-2 py-1',
  rows = 3,
  placeholder = 'Type or edit remarks here...',
}) {
  const { toasts, show, dismiss } = useToasts()
  const [draft, setDraft] = useState(value)
  const savedValue = String(value ?? '')
  const isDirty = draft !== savedValue

  useEffect(() => {
    setDraft(savedValue)
  }, [savedValue])

  const handleSave = () => {
    if (!isDirty) return
    onSave?.(draft)
    show({ type: 'success', title: 'Saved', message: 'LCR remarks updated.' })
  }

  const printBody =
    typeof printContent === 'function' ? printContent(draft) : printContent ?? draft

  return (
    <>
    <ToastHost toasts={toasts} onDismiss={dismiss} />
    <div className={blockClassName}>
      <p className={labelClassName}>{label}</p>
      {onSave ? (
        <div className="no-print mb-1 flex gap-2 items-start">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty}
            aria-label={isDirty ? 'Save remarks' : 'Remarks saved'}
            className={[
              'shrink-0 px-3 py-2 rounded-lg border-2 text-xs font-semibold transition-colors min-w-[4.75rem]',
              isDirty
                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                : 'border-emerald-600 bg-emerald-600 text-white cursor-default',
            ].join(' ')}
          >
            {isDirty ? 'Save' : 'Saved'}
          </button>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={rows}
            className={withLcrRemarksPrintClass(textareaClassName)}
            style={lcrRemarksBodyStyle(data)}
            placeholder={placeholder}
          />
        </div>
      ) : null}
      <p
        className={withLcrRemarksPrintClass(printClassName)}
        style={lcrRemarksBodyStyle(data)}
      >
        {printBody}
      </p>
    </div>
    </>
  )
}
