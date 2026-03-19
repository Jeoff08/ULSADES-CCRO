import React from 'react'
import { buildLcr3aTableDisplay } from '../lib/lcr3aTable'

/** LCR Form No. 3A — marriage facts table only (court decree). Form + continue flow: CourtDecreeForm.jsx. */
export default function LcrForm3ATableOnly({ data }) {
  const t = buildLcr3aTableDisplay(data)
  const cell = 'py-2 px-2 border border-black text-center font-bold text-sm align-top'
  const label = 'py-2 px-2 border border-black font-medium align-top w-[28%]'
  const head = 'py-2 px-2 border border-black font-bold text-center bg-gray-800 text-white'

  return (
    <div className="lcr-form-3a-table-only bg-white text-black text-sm max-w-[210mm] mx-auto p-6 print:p-4">
      <table className="w-full border-collapse border border-black table-fixed">
        <colgroup>
          <col style={{ width: '28%' }} />
          <col style={{ width: '36%' }} />
          <col style={{ width: '36%' }} />
        </colgroup>
        <thead>
          <tr>
            <td className="py-2 px-2 border border-black" />
            <td className={head}>HUSBAND</td>
            <td className={head}>WIFE</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={label}>Name:</td>
            <td className={`${cell} uppercase`}>{t.husbandName}</td>
            <td className={`${cell} uppercase`}>{t.wifeName}</td>
          </tr>
          <tr>
            <td className={label}>Date of Birth/Age:</td>
            <td className={cell}>{t.husbandDobAge}</td>
            <td className={cell}>{t.wifeDobAge}</td>
          </tr>
          <tr>
            <td className={label}>Citizenship:</td>
            <td className={`${cell} uppercase`}>{t.husbandCitizenship}</td>
            <td className={`${cell} uppercase`}>{t.wifeCitizenship}</td>
          </tr>
          <tr>
            <td className={label}>Civil Status:</td>
            <td className={`${cell} uppercase`}>{t.husbandCivilStatus}</td>
            <td className={`${cell} uppercase`}>{t.wifeCivilStatus}</td>
          </tr>
          <tr>
            <td className={label}>Mother:</td>
            <td className={`${cell} uppercase`}>{t.husbandMother}</td>
            <td className={`${cell} uppercase`}>{t.wifeMother}</td>
          </tr>
          <tr>
            <td className={label}>Father:</td>
            <td className={`${cell} uppercase`}>{t.husbandFather}</td>
            <td className={`${cell} uppercase`}>{t.wifeFather}</td>
          </tr>
          <tr>
            <td className={label}>Registry Number</td>
            <td className={`${cell} uppercase`} colSpan={2}>{t.registry}</td>
          </tr>
          <tr>
            <td className={`${label} leading-tight`}>Date of<br />Registration</td>
            <td className={cell} colSpan={2}>{t.dateRegistration}</td>
          </tr>
          <tr>
            <td className={label}>Date of Marriage</td>
            <td className={cell} colSpan={2}>{t.dateMarriage}</td>
          </tr>
          <tr>
            <td className={`${label} leading-tight`}>Place of<br />Marriage</td>
            <td className={`${cell} uppercase text-left sm:text-center align-top min-h-[2.5rem]`} colSpan={2}>{t.placeMarriage}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
