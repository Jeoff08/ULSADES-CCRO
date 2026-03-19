import React from 'react'
import { commitFirstLetterUpperFromInput } from '../lib/sentenceCase'

const inputClass =
  'form-field__input w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 transition-colors duration-150'

export function FormInput({
  label,
  id,
  value,
  onChange,
  type = 'text',
  placeholder,
  className = '',
  labelBelow,
  /** When true (default), only the first letter is uppercased; rest stays as typed. */
  capitalizeFirstLetter = true,
  sentenceCaseOnBlur,
}) {
  const cap =
    sentenceCaseOnBlur !== undefined ? sentenceCaseOnBlur : capitalizeFirstLetter
  const applyCap = type === 'text' && cap
  return (
    <div className={className}>
      {label && !labelBelow && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={
          applyCap
            ? (e) => commitFirstLetterUpperFromInput(e, onChange)
            : (e) => onChange(e.target.value)
        }
        placeholder={placeholder}
        className={inputClass}
      />
      {label && labelBelow && (
        <label htmlFor={id} className="block text-xs font-medium text-gray-500 mt-0.5">
          {label}
        </label>
      )}
    </div>
  )
}

export function FormSelect({ label, id, value, onChange, options, className = '', labelBelow }) {
  return (
    <div className={className}>
      {label && !labelBelow && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {label && labelBelow && (
        <label htmlFor={id} className="block text-xs font-medium text-gray-500 mt-0.5">
          {label}
        </label>
      )}
    </div>
  )
}

export function FormRadioGroup({ label, name, value, onChange, options, className = '' }) {
  return (
    <div className={`form-field__radio-group ${className}`.trim()}>
      {label && <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>}
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => (
          <label key={opt.value} className="form-field__radio-option flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="form-field__radio-input"
            />
            <span className="form-field__radio-label border border-gray-300 rounded-lg px-3 py-1.5 min-w-[4rem] text-center text-sm bg-gray-50 transition-colors duration-150">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
