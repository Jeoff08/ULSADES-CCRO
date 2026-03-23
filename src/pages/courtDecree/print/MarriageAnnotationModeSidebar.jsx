import React from 'react'
import {
  MARRIAGE_ANNOTATION_MODES as M,
  resolveMarriageAnnotationMode,
} from '../lib/marriageAnnotationMode'

const btnBase =
  'w-full text-left px-3 py-2.5 text-sm font-medium text-white rounded-lg transition bg-[#283750] hover:bg-[#1e2d42]'

const OPTIONS = [
  [M.nullity, 'Annulment / Nullity'],
  [M.divorce, 'Divorce'],
  [M.art42, 'Termination (subsequent marriage) — Art. 42'],
]

/** Stacked controls matching View & Print sidebar (LCR-style). belowPrintNav: divider under main print list.
 *  allowedModes: if set, only those output types are listed (e.g. divorce-only workflow page). */
export default function MarriageAnnotationModeSidebar({ data, onModeChange, belowPrintNav = false, allowedModes = null }) {
  const mode = resolveMarriageAnnotationMode(data?.marriageAnnotationMode)
  const options = allowedModes?.length
    ? OPTIONS.filter(([id]) => allowedModes.includes(id))
    : OPTIONS

  return (
    <div
      className={`flex flex-col gap-2 ${belowPrintNav ? 'border-t border-gray-200 pt-3 mt-2' : ''}`}
    >
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">12. Marriage output</h2>
      <p className="text-xs text-gray-600 leading-snug -mt-1 mb-0.5">
        {options.length === 1 && options[0][0] === M.divorce
          ? 'Divorce certificate output.'
          : 'Nullity, divorce, or Art. 42 termination.'}
      </p>
      <div className="flex flex-col gap-2">
        {options.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onModeChange?.(id)}
            className={`${btnBase} ${mode === id ? 'ring-2 ring-offset-1 ring-[var(--primary-blue)]' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
