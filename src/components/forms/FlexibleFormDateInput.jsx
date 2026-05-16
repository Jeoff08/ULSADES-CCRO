import React, { useEffect, useRef, useState } from 'react'
import {
  formStoredFullDateToDdMmDisplay,
  parseFlexibleFullDateToDdMmYyyy,
  isoYyyyMmDdToDdMmYyyy,
} from '../../lib/printUtils'

/**
 * Free-text date: month name + day + year (e.g. May 15 2026), dd/mm/yyyy, or ISO; normalizes to dd/mm/yyyy on blur.
 */
export default function FlexibleFormDateInput({
  id,
  value,
  onChange,
  className = '',
  disabled = false,
  placeholder = 'e.g. May 15 2026 or dd/mm/yyyy',
  inputClassName = '',
}) {
  const pickerRef = useRef(null)
  const [text, setText] = useState(() => formStoredFullDateToDdMmDisplay(value))

  useEffect(() => {
    setText(formStoredFullDateToDdMmDisplay(value))
  }, [value])

  const commit = () => {
    const trimmed = text.trim()
    if (!trimmed) {
      onChange('')
      setText('')
      return
    }
    const normalized = parseFlexibleFullDateToDdMmYyyy(trimmed)
    if (normalized) {
      onChange(normalized)
      setText(normalized)
      return
    }
    setText(formStoredFullDateToDdMmDisplay(value))
  }

  const pickIso = (iso) => {
    const ddmm = isoYyyyMmDdToDdMmYyyy(iso)
    if (ddmm) {
      onChange(ddmm)
      setText(ddmm)
    }
  }

  return (
    <div className={`relative flex items-center gap-1 ${className}`.trim()}>
      <input
        id={id}
        type="text"
        inputMode="text"
        autoComplete="off"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        placeholder={placeholder}
        disabled={disabled}
        className={`${inputClassName} pr-9 w-full`.trim()}
      />
      <button
        type="button"
        onClick={() =>
          !disabled && (pickerRef.current?.showPicker?.() || pickerRef.current?.click())
        }
        disabled={disabled}
        className={`absolute right-1.5 p-1 rounded text-gray-500 ${
          disabled ? 'cursor-not-allowed opacity-50' : ''
        }`}
        title={disabled ? 'Disabled' : 'Pick date'}
        tabIndex={-1}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>
      <input
        ref={pickerRef}
        type="date"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        disabled={disabled}
        onChange={(e) => pickIso(e.target.value)}
      />
    </div>
  )
}
