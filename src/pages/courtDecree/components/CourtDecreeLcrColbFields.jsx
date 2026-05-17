import React from 'react'
import { COURT_DECREE_LCR_COLB_FORM_GROUPS } from '../lib/courtDecreeColbPrintStyle'

/** Page + book number inputs for one LCR form (matches print COLB line). */
export default function CourtDecreeLcrColbFields({ lcrKind, form, scInput, inputClass }) {
  const group = COURT_DECREE_LCR_COLB_FORM_GROUPS.find((g) => g.lcrKind === lcrKind)
  if (!group) return null

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-3 space-y-2">
      <p className="text-sm font-semibold text-gray-800">{group.title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Page</label>
          <input
            type="text"
            inputMode="numeric"
            value={form[group.pageKey] ?? ''}
            onChange={scInput(group.pageKey)}
            placeholder={group.pagePlaceholder}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Book number</label>
          <input
            type="text"
            inputMode="numeric"
            value={form[group.bookKey] ?? ''}
            onChange={scInput(group.bookKey)}
            placeholder={group.bookPlaceholder}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  )
}
