import React from 'react'
import { buildLcr1aTableDisplay } from '../courtDecree/lib/lcr1aTable'
import { buildLcr2aTableDisplay } from '../courtDecree/lib/lcr2aTable'
import { buildLcr3aTableDisplay } from '../courtDecree/lib/lcr3aTable'

function cellEditText(displayed) {
  const s = String(displayed ?? '').trim()
  if (!s || s === '—') return ''
  return s
}

const LCR_1A_ROWS = [
  { k: 'registry', label: 'LCR Registry Number', patch: (v) => ({ colbRegistryNo: v, lcr1aRegistryNumber: v }) },
  { k: 'dateReg', label: 'Date of Registration', patch: (v) => ({ colbRegDate: v, lcr1aDateRegistration: v }) },
  { k: 'nameChild', label: 'Name of Child', patch: (v) => ({ lcr1aNameOfChild: v }) },
  { k: 'sex', label: 'Sex', patch: (v) => ({ lcr1aSex: v, sex: v }) },
  { k: 'dob', label: 'Date of Birth', patch: (v) => ({ lcr1aDateOfBirth: v, dateOfBirth: v }) },
  { k: 'pob', label: 'Place of Birth', patch: (v) => ({ lcr1aPlaceOfBirth: v }) },
  { k: 'mother', label: 'Name of Mother', patch: (v) => ({ lcr1aNameOfMother: v }) },
  { k: 'motherCit', label: 'Citizenship of Mother', patch: (v) => ({ lcr1aMotherCitizenship: v, motherCitizenship: v }) },
  { k: 'father', label: 'Name of Father', patch: (v) => ({ lcr1aNameOfFather: v }) },
  { k: 'fatherCit', label: 'Citizenship of Father', patch: (v) => ({ lcr1aFatherCitizenship: v, fatherCitizenship: v }) },
  { k: 'dom', label: 'Date of Marriage of Parents', patch: (v) => ({ lcr1aDateMarriageParents: v, dateOfMarriage: v }) },
  { k: 'pom', label: 'Place of Marriage of Parents', patch: (v) => ({ lcr1aPlaceMarriageParents: v, placeOfMarriageOfParents: v }) },
]

const LCR_2A_ROWS = [
  { k: 'registry', label: 'LCR Registry Number', patch: (v) => ({ lcr2aRegistryNumber: v, colbRegistryNo: v }) },
  { k: 'dateRegistration', label: 'Date of Registration', patch: (v) => ({ lcr2aDateRegistration: v, colbRegDate: v }) },
  { k: 'nameDeceased', label: 'Name of Deceased', patch: (v) => ({ lcr2aNameDeceased: v }) },
  { k: 'sex', label: 'Sex', patch: (v) => ({ lcr2aSex: v, sex: v }) },
  { k: 'civilStatus', label: 'Civil Status', patch: (v) => ({ lcr2aCivilStatus: v }) },
  { k: 'citizenship', label: 'Citizenship', patch: (v) => ({ lcr2aCitizenship: v }) },
  { k: 'dateDeath', label: 'Date of Death', patch: (v) => ({ lcr2aDateDeath: v, dateOfDeath: v }) },
  { k: 'citizenshipFather', label: 'Citizenship of Father', patch: (v) => ({ lcr2aCitizenshipFather: v }) },
  { k: 'placeDeath', label: 'Place of Death', patch: (v) => ({ lcr2aPlaceDeath: v }) },
  { k: 'causeOfDeath', label: 'Cause of Death', patch: (v) => ({ lcr2aCauseDeath: v }) },
]

const LCR_3A_PAIRS = [
  { label: 'Name', hk: 'husbandName', wk: 'wifeName', hp: (v) => ({ lcr3aHusbandName: v }), wp: (v) => ({ lcr3aWifeName: v }) },
  { label: 'Date of Birth/Age', hk: 'husbandDobAge', wk: 'wifeDobAge', hp: (v) => ({ lcr3aHusbandDobAge: v }), wp: (v) => ({ lcr3aWifeDobAge: v }) },
  { label: 'Citizenship', hk: 'husbandCitizenship', wk: 'wifeCitizenship', hp: (v) => ({ lcr3aHusbandCitizenship: v }), wp: (v) => ({ lcr3aWifeCitizenship: v }) },
  { label: 'Civil Status', hk: 'husbandCivilStatus', wk: 'wifeCivilStatus', hp: (v) => ({ lcr3aHusbandCivilStatus: v }), wp: (v) => ({ lcr3aWifeCivilStatus: v }) },
  { label: 'Mother', hk: 'husbandMother', wk: 'wifeMother', hp: (v) => ({ lcr3aHusbandMother: v }), wp: (v) => ({ lcr3aWifeMother: v }) },
  { label: 'Father', hk: 'husbandFather', wk: 'wifeFather', hp: (v) => ({ lcr3aHusbandFather: v }), wp: (v) => ({ lcr3aWifeFather: v }) },
]

const LCR_3A_FULL = [
  { k: 'registry', label: 'Registry Number', patch: (v) => ({ lcr3aRegistryNumber: v, marriageRegistryNo: v }) },
  { k: 'dateRegistration', label: 'Date of Registration', patch: (v) => ({ lcr3aDateRegistration: v }) },
  { k: 'dateMarriage', label: 'Date of Marriage', patch: (v) => ({ lcr3aDateMarriage: v, dateOfMarriage: v }) },
  { k: 'placeMarriage', label: 'Place of Marriage', patch: (v) => ({ lcr3aPlaceMarriage: v }) },
]

/**
 * Manual LCR fields for Supplemental / MC2010-04 drafts. Patches align with LcrForm* print components.
 */
export default function ManualLcrDataEditor({ lcrType, data, onPatch, inputClass }) {
  const d = data && typeof data === 'object' ? data : {}
  const ic = inputClass || 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white'

  const apply = (partial) => {
    onPatch?.({ ...d, ...partial })
  }

  if (lcrType === '1A') {
    const table = buildLcr1aTableDisplay(d)
    const page = String(d.colbPageNumber ?? d.colbPageNo ?? '')
    const book = String(d.colbBookNumber ?? d.colbBookNo ?? '')
    return (
      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Manual LCR (Form 1A)</h4>
        <p className="text-[11px] text-slate-600 leading-snug">
          Use when no saved AUSF, Court Decree, or Legitimation record applies. Same fields as the printed LCR table.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-slate-700">
            Register — Page
            <input className={`mt-1 ${ic}`} value={page} onChange={(e) => apply({ colbPageNo: e.target.value, colbPageNumber: e.target.value })} />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Register — Book no.
            <input className={`mt-1 ${ic}`} value={book} onChange={(e) => apply({ colbBookNo: e.target.value, colbBookNumber: e.target.value })} />
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {LCR_1A_ROWS.map((row) => (
            <label key={row.k} className="text-xs font-semibold text-slate-700 md:col-span-2">
              {row.label}
              <input className={`mt-1 ${ic}`} value={cellEditText(table[row.k])} onChange={(e) => apply(row.patch(e.target.value))} />
            </label>
          ))}
        </div>
        <label className="text-xs font-semibold text-slate-700 block">
          Remarks (optional)
          <textarea className={`mt-1 ${ic} min-h-[4rem]`} value={String(d.remarks ?? '')} onChange={(e) => apply({ remarks: e.target.value })} />
        </label>
      </div>
    )
  }

  if (lcrType === '2A') {
    const t = buildLcr2aTableDisplay(d)
    const page = String(d.colbPageNumber ?? d.colbPageNo ?? '')
    const book = String(d.colbBookNumber ?? d.colbBookNo ?? '')
    return (
      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Manual LCR (Form 2A)</h4>
        <p className="text-[11px] text-slate-600 leading-snug">Enter death LCR facts when no record is available to prefill.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-slate-700">
            Register — Page
            <input className={`mt-1 ${ic}`} value={page} onChange={(e) => apply({ colbPageNo: e.target.value, colbPageNumber: e.target.value })} />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Register — Book no.
            <input className={`mt-1 ${ic}`} value={book} onChange={(e) => apply({ colbBookNo: e.target.value, colbBookNumber: e.target.value })} />
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {LCR_2A_ROWS.map((row) => (
            <label key={row.k} className="text-xs font-semibold text-slate-700 md:col-span-2">
              {row.label}
              <input className={`mt-1 ${ic}`} value={cellEditText(t[row.k])} onChange={(e) => apply(row.patch(e.target.value))} />
            </label>
          ))}
        </div>
        <label className="text-xs font-semibold text-slate-700 block">
          Remarks (optional)
          <textarea className={`mt-1 ${ic} min-h-[4rem]`} value={String(d.remarks ?? '')} onChange={(e) => apply({ remarks: e.target.value })} />
        </label>
      </div>
    )
  }

  if (lcrType === '3A') {
    const t = buildLcr3aTableDisplay(d)
    const page = String(d.colbPageNumber ?? d.colbPageNo ?? '')
    const book = String(d.colbBookNumber ?? d.colbBookNo ?? '')
    return (
      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Manual LCR (Form 3A)</h4>
        <p className="text-[11px] text-slate-600 leading-snug">Enter marriage LCR facts when no record is available to prefill.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-slate-700">
            Register — Page
            <input className={`mt-1 ${ic}`} value={page} onChange={(e) => apply({ colbPageNo: e.target.value, colbPageNumber: e.target.value })} />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Register — Book no.
            <input className={`mt-1 ${ic}`} value={book} onChange={(e) => apply({ colbBookNo: e.target.value, colbBookNumber: e.target.value })} />
          </label>
        </div>
        <div className="space-y-2">
          {LCR_3A_PAIRS.map((row, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
              <span className="text-xs font-semibold text-slate-700 md:pt-6">{row.label}</span>
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Husband
                <input className={`mt-1 ${ic}`} value={cellEditText(t[row.hk])} onChange={(e) => apply(row.hp(e.target.value))} />
              </label>
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Wife
                <input className={`mt-1 ${ic}`} value={cellEditText(t[row.wk])} onChange={(e) => apply(row.wp(e.target.value))} />
              </label>
            </div>
          ))}
          {LCR_3A_FULL.map((row) => (
            <label key={row.k} className="text-xs font-semibold text-slate-700 block">
              {row.label}
              <input className={`mt-1 ${ic}`} value={cellEditText(t[row.k])} onChange={(e) => apply(row.patch(e.target.value))} />
            </label>
          ))}
        </div>
        <label className="text-xs font-semibold text-slate-700 block">
          Remarks (optional)
          <textarea className={`mt-1 ${ic} min-h-[4rem]`} value={String(d.remarks ?? '')} onChange={(e) => apply({ remarks: e.target.value })} />
        </label>
      </div>
    )
  }

  return null
}
