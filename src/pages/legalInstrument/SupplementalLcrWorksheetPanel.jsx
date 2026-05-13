import React, { useEffect, useMemo, useState } from 'react'
import ManualLcrDataEditor from './ManualLcrDataEditor'
import { mapSourceToSupplementalLcrData } from './lib/supplementalLcrPrefill'
import { recordHasLcrType } from './lib/supplementalEnableLcr'
import { getSavedAUSFList, getAUSFDraft } from '../ausf/lib/ausfStorage'
import { getSavedCourtDecreeList, getCourtDecreeDraft } from '../courtDecree/lib/courtDecreeStorage'
import { getSavedLegitimationList, getLegitimationDraft } from '../legitimation/lib/legitimationStorage'

function rowDisplayName(r) {
  const d = r?.data || {}
  return (
    r?.label
    || d.lcr1aNameOfChild
    || d.lcr2aNameDeceased
    || [d.lcr3aHusbandName, d.lcr3aWifeName].filter(Boolean).join(' & ')
    || ''
  )
}

/**
 * LCR prefill + manual fields for Supplemental (embedded main form or dedicated route).
 */
export default function SupplementalLcrWorksheetPanel({
  form,
  onPatch,
  onLcrTypeChange,
  onLcrSourceModuleChange,
  onRemoveLcr,
}) {
  const [lcrPrefillSearch, setLcrPrefillSearch] = useState('')
  const [showRecordList, setShowRecordList] = useState(false)

  const worksheetInputClass =
    'w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'

  useEffect(() => {
    setLcrPrefillSearch('')
    setShowRecordList(false)
  }, [form.lcrType, form.lcrSource])

  const lcrRecords = useMemo(() => {
    if (!form.lcrSource) return []
    const sources = {
      ausf: { list: getSavedAUSFList(), draft: getAUSFDraft() },
      courtDecree: { list: getSavedCourtDecreeList(), draft: getCourtDecreeDraft() },
      legitimation: { list: getSavedLegitimationList(), draft: getLegitimationDraft() },
    }
    const key = form.lcrSource === 'ausf' || form.lcrSource === 'legitimation' ? form.lcrSource : 'courtDecree'
    const { list, draft } = sources[key]
    const rows = []
    if (draft && typeof draft === 'object' && recordHasLcrType(draft, form.lcrType)) {
      rows.push({ id: '__draft__', label: '[Current draft]', data: draft })
    }
    list.forEach((r) => {
      if (r?.data && recordHasLcrType(r.data, form.lcrType)) {
        rows.push({ id: r.id, label: r.label || r.id, data: r.data })
      }
    })
    return rows
  }, [form.lcrSource, form.lcrType])

  const worksheetPrefillList = useMemo(() => {
    const q = lcrPrefillSearch.trim().toLowerCase()
    if (!q) return lcrRecords
    return lcrRecords.filter((r) => {
      const hay = `${rowDisplayName(r)} ${r.label || ''} ${r.id || ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [lcrRecords, lcrPrefillSearch])

  const handleSelectLcrRecord = (record) => {
    const mapped = mapSourceToSupplementalLcrData(form.lcrSource, record.data, form.lcrType)
    onPatch({
      lcrData: mapped,
      lcrSourceId: record.id,
      lcrPrefillLabel: record.label || rowDisplayName(record) || '',
    })
    setLcrPrefillSearch('')
    setShowRecordList(false)
  }

  const patchLcrData = (nextLcr) => {
    onPatch({ lcrData: nextLcr })
  }

  const restrictLcrTo1a = form.lcrSource === 'ausf' || form.lcrSource === 'legitimation'

  return (
    <section className="space-y-5 p-1 sm:p-2">
      <div className="flex flex-col gap-1 border-b border-indigo-100 pb-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <h2 className="text-base font-bold text-violet-900 sm:text-lg">
          LCR Form No. {form.lcrType || '1A'} (
          {form.lcrType === '2A' ? 'Death' : form.lcrType === '3A' ? 'Marriage' : 'Birth'} available)
        </h2>
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-700 sm:text-right">
          Prefill and manual entry
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:items-end">
        <div>
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-wide text-gray-600">LCR type</span>
          <div className="grid grid-cols-3 gap-1.5">
            {['1A', '2A', '3A']
              .filter((t) => (restrictLcrTo1a ? t === '1A' : true))
              .map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onLcrTypeChange?.(t)}
                  className={`rounded-md py-2.5 text-xs font-bold transition-all ${
                    form.lcrType === t
                      ? 'bg-violet-600 text-white shadow-md ring-1 ring-violet-500/30'
                      : 'border border-violet-200 bg-white text-gray-700 hover:border-violet-400'
                  }`}
                >
                  {t}
                </button>
              ))}
          </div>
        </div>
        <div>
          <label htmlFor="supplemental-lcr-source-module" className="mb-2 block text-[10px] font-bold uppercase tracking-wide text-gray-600">
            Source module
          </label>
          <select
            id="supplemental-lcr-source-module"
            className={worksheetInputClass}
            value={form.lcrSource || ''}
            onChange={(e) => {
              const v = e.target.value
              onLcrSourceModuleChange?.(v)
              setLcrPrefillSearch('')
              setShowRecordList(false)
            }}
          >
            <option value="">Select module…</option>
            <option value="ausf">AUSF</option>
            <option value="courtDecree">Court Decree</option>
            <option value="legitimation">Legitimation</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="supplemental-lcr-prefill-search" className="block text-[10px] font-bold uppercase tracking-wide text-gray-600">
          Prefill from record
        </label>
        {!form.lcrSource ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-2 py-2 text-xs text-amber-900">
            Choose a source module above before searching saved records.
          </p>
        ) : null}
        <div className="relative max-w-3xl">
          <div className="relative">
            <input
              id="supplemental-lcr-prefill-search"
              type="text"
              className={`${worksheetInputClass} pr-9`}
              placeholder="Search; click a row to load LCR fields"
              value={lcrPrefillSearch}
              onChange={(e) => setLcrPrefillSearch(e.target.value)}
              onFocus={() => setShowRecordList(true)}
              onBlur={() => window.setTimeout(() => setShowRecordList(false), 200)}
              disabled={!form.lcrSource}
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowRecordList(!showRecordList)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-violet-500 hover:bg-violet-50 disabled:opacity-40"
              aria-label="Toggle record list"
              disabled={!form.lcrSource}
            >
              <svg className={`h-4 w-4 transition-transform ${showRecordList ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          {showRecordList && form.lcrSource ? (
            <ul className="absolute left-0 right-0 z-30 mt-1 max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {worksheetPrefillList.length === 0 ? (
                <li className="px-3 py-2 text-xs text-gray-500">No records match.</li>
              ) : (
                worksheetPrefillList.map((r) => (
                  <li key={r.id} className="border-b border-gray-100 last:border-0">
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-violet-50"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectLcrRecord(r)}
                    >
                      <span className="block truncate font-medium text-gray-900">{rowDisplayName(r) || r.label}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : null}
        </div>
        <p className="text-[11px] leading-snug text-indigo-800/90">Pull copies data only; refine on print.</p>
      </div>

      <div className="rounded-xl border-2 border-sky-100 bg-sky-50/35 p-3 sm:p-4">
        <ManualLcrDataEditor
          lcrType={form.lcrType}
          data={form.lcrData}
          onPatch={patchLcrData}
          inputClass={worksheetInputClass}
        />
      </div>

      {restrictLcrTo1a && (form.lcrType === '2A' || form.lcrType === '3A') ? (
        <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
          AUSF and Legitimation prefills apply to Form 1A only — switch source to Court Decree for 2A or 3A.
        </p>
      ) : null}

      {onRemoveLcr ? (
        <div className="pt-1 border-t border-gray-100">
          <button
            type="button"
            onClick={onRemoveLcr}
            className="text-xs font-semibold text-red-700 hover:text-red-800 underline-offset-2 hover:underline"
          >
            Remove LCR from this supplemental file
          </button>
        </div>
      ) : null}
    </section>
  )
}
