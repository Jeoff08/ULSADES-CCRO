import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { normalizeLcroStaffTitle } from '../../lib/printUtils'
import {
  filterLcroStaffNames,
  getLcroStaffTitleForName,
  loadLcroStaffNames,
  rememberLcroStaffName,
  saveLcroStaffProfile,
} from '../../lib/lcroStaffStorage'

/**
 * LCRO “Verified by” name (with suggestions) + title.
 * Selecting a name fills the title from saved profiles when known.
 */
export default function LcroStaffVerifiedByFields({
  /** `'courtDecree'` | `'legitimation'` — separate saved suggestion lists. */
  storageScope = 'courtDecree',
  name = '',
  title = '',
  onChange,
  onBlurPersist,
  nameLabel = 'Verified by (name to sign)',
  titleLabel = 'Verified by (title)',
  namePlaceholder = 'e.g. SHIRLY L. DEMECILLO',
  titlePlaceholder = 'e.g. Registration Officer II',
  inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50',
  disabled = false,
  nameInputClassName = '',
  titleInputClassName = '',
  showHelperText = true,
}) {
  const [savedNames, setSavedNames] = useState(() => loadLcroStaffNames(storageScope))
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionIndex, setSuggestionIndex] = useState(-1)

  useEffect(() => {
    setSavedNames(loadLcroStaffNames(storageScope))
  }, [storageScope])

  const filtered = useMemo(
    () => filterLcroStaffNames(savedNames, name, 8),
    [savedNames, name],
  )
  const titleDisplay = String(title ?? '').replace(/\bLCRO\s*-\s*Staff\b/gi, 'LCRO Staff')

  const emit = useCallback(
    (nextName, nextTitle) => {
      onChange?.({
        certificateSignatoryName: nextName,
        certificateSignatoryTitle: nextTitle,
        verifiedByName: nextName,
        verifiedByTitle: nextTitle,
      })
    },
    [onChange],
  )

  const chooseName = (picked) => {
    const trimmed = String(picked || '').trim()
    const suggestedTitle = getLcroStaffTitleForName(trimmed, storageScope)
    const nextTitle = suggestedTitle || normalizeLcroStaffTitle(title) || ''
    emit(trimmed, nextTitle)
    rememberLcroStaffName(trimmed, storageScope)
    setSavedNames(loadLcroStaffNames(storageScope))
    setShowSuggestions(false)
    setSuggestionIndex(-1)
    onBlurPersist?.({ name: trimmed, title: nextTitle })
  }

  const handleNameChange = (e) => {
    const v = e.target.value
    emit(v, title)
    setShowSuggestions(true)
    setSuggestionIndex(-1)
  }

  const handleNameBlur = (e) => {
    const v = String(e.target.value || '').trim()
    rememberLcroStaffName(v, storageScope)
    setSavedNames(loadLcroStaffNames(storageScope))
    saveLcroStaffProfile(v, title, storageScope)
    setTimeout(() => setShowSuggestions(false), 120)
    onBlurPersist?.({ name: v, title })
  }

  const handleTitleChange = (e) => {
    // Keep spaces while typing; normalize/trim on blur.
    const nextTitle = String(e.target.value ?? '').replace(/\bLCRO\s*-\s*Staff\b/gi, 'LCRO Staff')
    emit(name, nextTitle)
  }

  const handleTitleBlur = () => {
    const v = String(name || '').trim()
    const normalizedTitle = normalizeLcroStaffTitle(title)
    if (normalizedTitle !== title) emit(name, normalizedTitle)
    saveLcroStaffProfile(v, normalizedTitle, storageScope)
    onBlurPersist?.({ name: v, title: normalizedTitle })
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{nameLabel}</label>
        <div className="relative">
          <input
            type="text"
            value={name}
            disabled={disabled}
            onChange={handleNameChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => {
              if (!showSuggestions || filtered.length === 0) return
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
                chooseName(filtered[suggestionIndex])
              }
              if (e.key === 'Escape') {
                setShowSuggestions(false)
                setSuggestionIndex(-1)
              }
            }}
            placeholder={namePlaceholder}
            className={`${inputClass} ${nameInputClassName}`.trim()}
            autoComplete="off"
          />
          {showSuggestions && filtered.length > 0 && !disabled ? (
            <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
              <ul className="max-h-56 overflow-auto py-1">
                {filtered.map((staffName, idx) => {
                  const pos = getLcroStaffTitleForName(staffName, storageScope)
                  return (
                    <li key={staffName}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => chooseName(staffName)}
                        className={`w-full px-3 py-2 text-left text-sm transition ${
                          idx === suggestionIndex
                            ? 'bg-[var(--primary-blue)] text-white'
                            : 'text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        <span className="block font-medium">{staffName}</span>
                        {pos ? (
                          <span
                            className={`block text-xs mt-0.5 ${
                              idx === suggestionIndex ? 'text-white/90' : 'text-gray-500'
                            }`}
                          >
                            {pos}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}
        </div>
        {showHelperText ? (
          <p className="text-xs text-gray-500 mt-1">
            Saved on this computer when you finish typing. Pick a name to fill the position automatically.
          </p>
        ) : null}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{titleLabel}</label>
        <input
          type="text"
          value={titleDisplay}
          disabled={disabled}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          placeholder={titlePlaceholder}
          className={`${inputClass} ${titleInputClassName}`.trim()}
        />
      </div>
    </div>
  )
}

