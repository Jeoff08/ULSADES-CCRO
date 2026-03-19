import React from 'react'
import { buildLcr1aTableDisplay } from '../lib/lcr1aTable'

/** LCR Form 1A — facts table only (court decree). Form + “Table complete — continue to court decree form”: CourtDecreeForm.jsx. */
export default function LcrForm1ATableOnly({ data }) {
  const t = buildLcr1aTableDisplay(data)
  const rows = [
    ['LCR Registry Number', t.registry, false],
    ['Date of Registration', t.dateReg, true],
    ['Name of Child', t.nameChild, false],
    ['Sex', t.sex, false],
    ['Date of Birth', t.dob, true],
    ['Place of Birth', t.pob, false],
    ['Name of Mother', t.mother, false],
    ['Citizenship of Mother', t.motherCit, false],
    ['Name of Father', t.father, false],
    ['Citizenship of Father', t.fatherCit, false],
    ['Date of Marriage of Parents', t.dom, true],
    ['Place of Marriage of Parents', t.pom, false],
  ]
  return (
    <div className="lcr-form-1a-table-only bg-white text-black text-sm max-w-[210mm] mx-auto p-6 print:p-4">
      <table className="w-full border-collapse border border-black">
        <tbody>
          {rows.map(([label, val, isDate]) => (
            <tr key={label}>
              <td className="py-2 px-3 border border-black font-medium align-top w-[42%]">{label}</td>
              <td
                className={`py-2 px-3 border border-black text-center font-bold ${
                  isDate ? '' : 'uppercase'
                }`}
              >
                {val}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
