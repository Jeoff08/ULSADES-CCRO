import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { commitFirstLetterUpperFromInput } from '../lib/sentenceCase'
import FlexibleFormDateInput from './forms/FlexibleFormDateInput'

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

/** Text input with optional dropdown suggestions (e.g. mother's maiden surname → child middle name). */
export function FormSuggestInput({
  label,
  id,
  value,
  onChange,
  suggestions = [],
  placeholder,
  className = '',
  labelBelow,
  capitalizeFirstLetter = true,
  /** Max dropdown height (scroll when list is longer). */
  suggestionListMaxHeightClass = 'max-h-48',
  /** When false, list stays open on focus even if value exactly matches a suggestion. */
  hideListOnExactMatch = true,
  /** When false, show matches on focus without typing first (use for short saved lists). */
  requireTypeToShow = null,
}) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionIndex, setSuggestionIndex] = useState(-1)
  const [listPosition, setListPosition] = useState(null)
  const anchorRef = useRef(null)

  const trimmed = String(value ?? '').trim()
  const pool = [...new Set(suggestions.map((s) => String(s ?? '').trim()).filter(Boolean))]
  const needle = trimmed.toLowerCase()
  const filtered = pool.filter((s) => {
    if (!needle) return true
    const hay = s.toLowerCase()
    return hay.includes(needle) || needle.includes(hay)
  })
  const exactMatch = needle && pool.some((s) => s.toLowerCase() === needle)
  const needsTypedFilter = requireTypeToShow ?? pool.length > 15
  const showList =
    showSuggestions &&
    filtered.length > 0 &&
    (hideListOnExactMatch ? !exactMatch : true) &&
    (!needsTypedFilter || needle.length > 0)

  const choose = (next) => {
    onChange(next)
    setShowSuggestions(false)
    setSuggestionIndex(-1)
  }

  const updateListPosition = useCallback(() => {
    const el = anchorRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setListPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    })
  }, [])

  useLayoutEffect(() => {
    if (!showList) {
      setListPosition(null)
      return undefined
    }
    updateListPosition()
    const onReposition = () => updateListPosition()
    window.addEventListener('scroll', onReposition, true)
    window.addEventListener('resize', onReposition)
    return () => {
      window.removeEventListener('scroll', onReposition, true)
      window.removeEventListener('resize', onReposition)
    }
  }, [showList, updateListPosition, filtered.length])

  const suggestionList = showList && listPosition ? (
    <div
      role="listbox"
      id={id ? `${id}-suggestions` : undefined}
      style={{
        position: 'fixed',
        top: listPosition.top,
        left: listPosition.left,
        width: listPosition.width,
        zIndex: 9999,
      }}
      className={`rounded-lg border border-gray-300 bg-white shadow-lg overflow-y-auto overflow-x-hidden ${suggestionListMaxHeightClass}`}
    >
      {filtered.map((item, idx) => (
        <button
          key={item}
          type="button"
          onMouseDown={(ev) => ev.preventDefault()}
          onClick={() => choose(item)}
          className={`w-full px-3 py-2 text-left text-sm transition ${idx === suggestionIndex ? 'bg-emerald-600 text-white' : 'text-gray-800 hover:bg-emerald-50'
            }`}
        >
          {item}
        </button>
      ))}
    </div>
  ) : null

  return (
    <div className={className}>
      {label && !labelBelow && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative z-10" ref={anchorRef}>
        <input
          id={id}
          type="text"
          value={value}
          autoComplete="off"
          aria-controls={id ? `${id}-suggestions` : undefined}
          onChange={
            capitalizeFirstLetter
              ? (e) => {
                commitFirstLetterUpperFromInput(e, onChange)
                setShowSuggestions(true)
                setSuggestionIndex(-1)
              }
              : (e) => {
                onChange(e.target.value)
                setShowSuggestions(true)
                setSuggestionIndex(-1)
              }
          }
          onFocus={() => {
            setShowSuggestions(true)
            updateListPosition()
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={(e) => {
            if (!showList) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setSuggestionIndex((prev) => (prev + 1) % filtered.length)
              return
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault()
              setSuggestionIndex((prev) => (prev <= 0 ? filtered.length - 1 : prev - 1))
              return
            }
            if (e.key === 'Enter' && suggestionIndex >= 0) {
              e.preventDefault()
              e.stopPropagation()
              choose(filtered[suggestionIndex])
              return
            }
            if (e.key === 'Escape') {
              setShowSuggestions(false)
              setSuggestionIndex(-1)
            }
          }}
          placeholder={placeholder}
          className={inputClass}
          aria-autocomplete="list"
          aria-expanded={showList}
        />
        {typeof document !== 'undefined' && suggestionList
          ? createPortal(suggestionList, document.body)
          : null}
      </div>
      {label && labelBelow && (
        <label htmlFor={id} className="block text-xs font-medium text-gray-500 mt-0.5">
          {label}
        </label>
      )}
    </div>
  )
}

export const ILIGAN_PLACE_SUGGESTION = {
  city: 'ILIGAN CITY',
  province: 'LANAO DEL NORTE',
  label: 'ILIGAN CITY | LANAO DEL NORTE',
}

function filterPlaceCityProvinceSuggestions(suggestions, cityValue, provinceValue) {
  const city = String(cityValue ?? '').trim().toLowerCase()
  const province = String(provinceValue ?? '').trim().toLowerCase()
  const combined = `${city} ${province}`.trim()
  return suggestions.filter((s) => {
    const label = (s.label || `${s.city} | ${s.province}`).toLowerCase()
    const hay = `${s.city} ${s.province}`.toLowerCase()
    if (!combined) return true
    if (label.includes(combined) || hay.includes(combined)) return true
    if (city && (s.city.toLowerCase().includes(city) || label.includes(city))) return true
    if (province && (s.province.toLowerCase().includes(province) || label.includes(province))) return true
    return combined.split(/\s+/).filter(Boolean).every((w) => label.includes(w) || hay.includes(w))
  })
}

function isPlaceCityProvinceSelected(suggestion, cityValue, provinceValue) {
  return (
    suggestion.city.toLowerCase() === String(cityValue ?? '').trim().toLowerCase() &&
    suggestion.province.toLowerCase() === String(provinceValue ?? '').trim().toLowerCase()
  )
}

/** City + province inputs with dropdown (e.g. ILIGAN CITY | LANAO DEL NORTE). */
export function FormPlaceCityProvinceInputs({
  cityValue,
  provinceValue,
  onCityChange,
  onProvinceChange,
  /** When set, city + province are updated together on suggestion pick (avoids stale batched state). */
  onPick,
  cityId = 'place-city',
  provinceId = 'place-province',
  cityPlaceholder = 'City/Municipality',
  provincePlaceholder = 'Province',
  inputClassName = inputClass,
  suggestions = [ILIGAN_PLACE_SUGGESTION],
  capitalizeFirstLetter = true,
}) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionIndex, setSuggestionIndex] = useState(-1)
  const [anchorField, setAnchorField] = useState('city')
  const blurHideRef = useRef(null)

  const pool = suggestions.map((s) => ({
    ...s,
    label: s.label || `${s.city} | ${s.province}`,
  }))
  const filtered = filterPlaceCityProvinceSuggestions(pool, cityValue, provinceValue)
  const alreadySelected = pool.some((s) => isPlaceCityProvinceSelected(s, cityValue, provinceValue))
  const showList = showSuggestions && filtered.length > 0 && !alreadySelected

  const pick = (item) => {
    if (blurHideRef.current) {
      clearTimeout(blurHideRef.current)
      blurHideRef.current = null
    }
    if (onPick) onPick(item.city, item.province)
    else {
      onCityChange(item.city)
      onProvinceChange(item.province)
    }
    setShowSuggestions(false)
    setSuggestionIndex(-1)
  }

  const onFieldChange = (handler) =>
    capitalizeFirstLetter
      ? (e) => {
        commitFirstLetterUpperFromInput(e, handler)
        setShowSuggestions(true)
        setSuggestionIndex(-1)
      }
      : (e) => {
        handler(e.target.value)
        setShowSuggestions(true)
        setSuggestionIndex(-1)
      }

  const handleKeyDown = (e) => {
    if (!showList) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSuggestionIndex((prev) => (prev + 1) % filtered.length)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSuggestionIndex((prev) => (prev <= 0 ? filtered.length - 1 : prev - 1))
      return
    }
    if (e.key === 'Enter' && showList) {
      e.preventDefault()
      e.stopPropagation()
      pick(filtered[Math.max(0, suggestionIndex)])
      return
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSuggestionIndex(-1)
    }
  }

  const suggestionList = showList ? (
    <div
      className="absolute z-[200] mt-1 w-full min-w-[14rem] rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
      role="listbox"
    >
      {filtered.map((item, idx) => (
        <button
          key={item.label}
          type="button"
          onMouseDown={(ev) => {
            ev.preventDefault()
            pick(item)
          }}
          className={`w-full px-3 py-2 text-left text-sm transition ${idx === suggestionIndex ? 'bg-emerald-600 text-white' : 'text-gray-800 hover:bg-emerald-50'
            }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  ) : null

  const openSuggestions = (field) => {
    if (blurHideRef.current) {
      clearTimeout(blurHideRef.current)
      blurHideRef.current = null
    }
    setAnchorField(field)
    setShowSuggestions(true)
    setSuggestionIndex(filtered.length > 0 ? 0 : -1)
  }

  const focusCity = () => openSuggestions('city')
  const focusProvince = () => openSuggestions('province')

  const blurField = () => {
    blurHideRef.current = setTimeout(() => {
      setShowSuggestions(false)
      setSuggestionIndex(-1)
      blurHideRef.current = null
    }, 180)
  }

  return (
    <>
      <div className="relative z-[1]">
        <input
          id={cityId}
          type="text"
          value={cityValue}
          autoComplete="off"
          onChange={onFieldChange(onCityChange)}
          onFocus={focusCity}
          onBlur={blurField}
          onKeyDown={handleKeyDown}
          placeholder={cityPlaceholder}
          className={inputClassName}
          aria-autocomplete="list"
          aria-expanded={showList && anchorField === 'city'}
        />
        {showList && anchorField === 'city' ? suggestionList : null}
      </div>
      <div className="relative z-[1]">
        <input
          id={provinceId}
          type="text"
          value={provinceValue}
          autoComplete="off"
          onChange={onFieldChange(onProvinceChange)}
          onFocus={focusProvince}
          onBlur={blurField}
          onKeyDown={handleKeyDown}
          placeholder={provincePlaceholder}
          className={inputClassName}
          aria-autocomplete="list"
          aria-expanded={showList && anchorField === 'province'}
        />
        {showList && anchorField === 'province' ? suggestionList : null}
      </div>
    </>
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

/** Full calendar date: type month name + day + year, or dd/mm/yyyy; stored as dd/mm/yyyy. */
export function FormFlexibleDateInput({
  label,
  id,
  value,
  onChange,
  placeholder,
  className = '',
  labelBelow,
}) {
  return (
    <div className={className}>
      {label && !labelBelow && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <FlexibleFormDateInput id={id} value={value} onChange={onChange} placeholder={placeholder} inputClassName={inputClass} />
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
