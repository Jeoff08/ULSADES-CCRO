import React from 'react'
import { buildLcr2aTableDisplay } from '../lib/lcr2aTable'

/** LCR Form No. 2A — death facts table only (court decree). Form + continue flow: CourtDecreeForm.jsx. */
export default function LcrForm2ATableOnly({ data }) {
  const t = buildLcr2aTableDisplay(data)
  const label = 'py-2 px-3 border border-black font-medium align-top w-[42%]'
  const cell = 'py-2 px-3 border border-black text-center font-bold text-sm'
  const valCause = 'py-2 px-3 border border-black text-left font-bold text-sm whitespace-pre-wrap align-top min-h-[3rem]'

  const rows = [
    ['LCR Registry Number', t.registry, true],
    ['Date of Registration', t.dateRegistration, false],
    ['Name of Deceased', t.nameDeceased, true],
    ['Sex', t.sex, true],
    ['Civil Status', t.civilStatus, true],
    ['Citizenship', t.citizenship, true],
    ['Date of Death', t.dateDeath, false],
    ['Citizenship of Father', t.citizenshipFather, true],
    ['Place of Death', t.placeDeath, true],
  ]

  return (
    <div className="lcr-form-2a-table-only bg-white text-black text-sm max-w-[210mm] mx-auto p-6 print:p-4">
      <table className="w-full border-collapse border border-black">
        <tbody>
          {rows.map(([lb, v, upper]) => (
            <tr key={lb}>
              <td className={label}>{lb}</td>
              <td className={upper ? `${cell} uppercase` : cell}>{v}</td>
            </tr>
          ))}
          <tr>
            <td className={label}>Cause of Death</td>
            <td className={valCause}>{t.causeOfDeath}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
