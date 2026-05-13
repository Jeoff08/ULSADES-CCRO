import React from 'react'
import { RECEIVED_BY_OPTIONS, matchReceivedByIndex } from '../lib/receivedByOptions'

/**
 * Dropdown for standard registration officers + optional custom name/title fields.
 * @param {{ name: string, title: string }} props.value
 * @param {(next: { name: string, title: string }) => void} props.onChange
 */
export default function ReceivedByOfficerSelect({
  value,
  onChange,
  label = 'Registration officer (name & title)',
  selectClassName = 'mt-0.5 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white',
  inputClassName = 'mt-0.5 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white',
  idPrefix = 'received-by',
}) {
  const name = value?.name ?? ''
  const title = value?.title ?? ''
  const matched = matchReceivedByIndex(name, title)
  const selectValue = matched >= 0 ? String(matched) : '__custom__'

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-700" htmlFor={`${idPrefix}-preset`}>
        {label}
      </label>
      <select
        id={`${idPrefix}-preset`}
        className={selectClassName}
        value={selectValue}
        onChange={(e) => {
          const v = e.target.value
          if (v === '__custom__') return
          const opt = RECEIVED_BY_OPTIONS[Number(v)]
          if (opt) onChange({ name: opt.name, title: opt.title })
        }}
      >
        {RECEIVED_BY_OPTIONS.map((o, i) => (
          <option key={o.name} value={String(i)}>
            {o.name} — {o.title}
          </option>
        ))}
        <option value="__custom__">Custom…</option>
      </select>
      {selectValue === '__custom__' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <label className="block text-xs text-gray-600">
            Name
            <input
              id={`${idPrefix}-name`}
              type="text"
              className={inputClassName}
              value={name}
              onChange={(e) => onChange({ name: e.target.value, title })}
            />
          </label>
          <label className="block text-xs text-gray-600">
            Title
            <input
              id={`${idPrefix}-title`}
              type="text"
              className={inputClassName}
              value={title}
              onChange={(e) => onChange({ name, title: e.target.value })}
            />
          </label>
        </div>
      ) : null}
    </div>
  )
}
