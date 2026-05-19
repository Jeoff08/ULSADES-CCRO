import React, { useMemo } from 'react'
import { normalizeLcroStaffTitle } from '../../lib/printUtils'
import { RECEIVED_BY_OPTIONS, matchReceivedByPresetIndex } from './lib/supplementalTransmittalDefaults'

/** LCR footer pickers for supplemental data entry (no-print). */
export default function SupplementalLcrFooterSignatoryPickers({ lcrData, onPatch, inputClass }) {
  const vn = lcrData?.certificateSignatoryName
  const vt = lcrData?.certificateSignatoryTitle
  const cn = lcrData?.cityCivilRegistrarName
  const ct = lcrData?.cityCivilRegistrarTitle

  const ccrIdx = useMemo(() => matchReceivedByPresetIndex(cn, ct), [cn, ct])
  const ccrSelect =
    !String(cn || '').trim() && !String(ct || '').trim()
      ? ''
      : ccrIdx >= 0
        ? String(ccrIdx)
        : 'custom'

  return (
    <div className="no-print rounded-lg border border-slate-200 bg-white/95 p-3 mb-3 space-y-3 text-sm max-w-[210mm] mx-auto">
      <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
        LCR bottom signatures (Verified by / City Civil Registrar)
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
            Verified by (LCRO staff) — type as printed
          </label>
          <p className="text-[10px] text-slate-500 leading-snug">
            Enter the name and title shown on the left signature line of the LCR (e.g. LCRO staff).
          </p>
          <input
            type="text"
            className={inputClass}
            placeholder="Name (e.g. SHIRLY L. DEMECILLO)"
            value={vn || ''}
            onChange={(e) => onPatch({ certificateSignatoryName: e.target.value })}
          />
          <input
            type="text"
            className={inputClass}
            placeholder="Title (e.g. LCRO Staff)"
            value={normalizeLcroStaffTitle(vt) || ''}
            onChange={(e) => onPatch({ certificateSignatoryTitle: normalizeLcroStaffTitle(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
            City Civil Registrar (right block)
          </label>
          <select
            className={inputClass}
            value={ccrSelect}
            onChange={(e) => {
              const v = e.target.value
              if (v === '') return
              if (v === 'custom') {
                onPatch({
                  cityCivilRegistrarName: String(cn || '').trim(),
                  cityCivilRegistrarTitle: String(ct || '').trim(),
                })
                return
              }
              const p = RECEIVED_BY_OPTIONS[Number(v)]
              if (p) onPatch({ cityCivilRegistrarName: p.name, cityCivilRegistrarTitle: p.title })
            }}
          >
            <option value="">Select name and title…</option>
            {RECEIVED_BY_OPTIONS.map((p, i) => (
              <option key={`c-${i}`} value={String(i)}>
                {p.name} — {p.title}
              </option>
            ))}
            <option value="custom">Other (type below)</option>
          </select>
          {ccrSelect === 'custom' ? (
            <div className="space-y-2">
              <input
                type="text"
                className={inputClass}
                placeholder="Name"
                value={cn || ''}
                onChange={(e) => onPatch({ cityCivilRegistrarName: e.target.value })}
              />
              <input
                type="text"
                className={inputClass}
                placeholder="Title"
                value={ct || ''}
                onChange={(e) => onPatch({ cityCivilRegistrarTitle: e.target.value })}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
