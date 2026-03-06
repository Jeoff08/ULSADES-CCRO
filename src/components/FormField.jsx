import React from 'react'

const inputClass =
  'w-full border border-orange-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-orange-50/30 focus:border-[var(--primary-blue)] focus:ring-2 focus:ring-[var(--primary-blue)]/20'

export function FormInput({ label, id, value, onChange, type = 'text', placeholder, className = '', labelBelow }) {
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
        onChange={(e) => onChange(e.target.value)}
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
    <div className={className}>
      {label && <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>}
      <div className="flex gap-4">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="border-[var(--primary-blue)] text-[var(--primary-green)]"
            />
            <span className="border border-orange-300 rounded-lg px-3 py-1.5 min-w-[4rem] text-center text-sm bg-orange-50/30">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
