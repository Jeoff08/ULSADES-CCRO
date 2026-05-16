import React from 'react'
import { LCR_REMARKS_FONT_PT_OPTIONS, parseLcrRemarksFontPt } from '../../lib/lcrRemarksFontSize'

/**
 * Dropdown for `lcrRemarksFontSizePt` — applies to LCR REMARKS blocks and related annotation text in print.
 */
export default function LcrRemarksFontSizeSelect({
  id,
  value,
  onChange,
  disabled,
  className = '',
  label = 'LCR remarks font size (printed)',
  helpText,
}) {
  const v = parseLcrRemarksFontPt(value)
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-3 shadow-sm ${className}`}>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">
        {label}
      </label>
      <select
        id={id}
        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-2 py-2 text-xs text-gray-800 leading-snug"
        value={v}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {LCR_REMARKS_FONT_PT_OPTIONS.map((pt) => (
          <option key={pt} value={String(pt)}>
            {pt} pt
          </option>
        ))}
      </select>
      {helpText ? (
        <p className="text-[10px] text-gray-500 mt-1.5 leading-snug">{helpText}</p>
      ) : null}
    </div>
  )
}
