import React, { useEffect, useState } from 'react'
import { formatDateCert, parseDdMmYyyyToDate } from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'
import { buildLcr1aTableDisplay } from '../lib/lcr1aTable'

function cellEditText(displayed) {
  const s = String(displayed ?? '').trim()
  if (!s || s === '—') return ''
  return s
}

/** Table row defs: display key from buildLcr1aTableDisplay + patch for supplemental manual edit. */
const LCR_1A_EDITABLE_ROWS = [
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

/** LCR Form No. 1A (Birth-Available). Uses Court Decree Form 1A fields as primary source.
 *  When editableTable + onDataChange (e.g. Supplemental print), table cells are manual inputs on screen. */
export default function LcrForm1ABirthAvailable({ data, editableTable = false, onDataChange }) {
  const table = buildLcr1aTableDisplay(data)
  const [editableRemarks, setEditableRemarks] = useState(data?.remarks || '')

  useEffect(() => {
    setEditableRemarks(data?.remarks || '')
  }, [data?.remarks])

  const patchData = (partial) => {
    onDataChange?.({ ...data, ...partial })
  }


  const colbPage = data.colbPageNumber ?? data.colbPageNo
  const colbBook = data.colbBookNumber ?? data.colbBookNo
  const formDate = (() => {
    const raw = data.certificateIssuanceDate
    const p = parseDdMmYyyyToDate(raw)
    if (p) return formatDateCert(p.toISOString().slice(0, 10))
    return formatDateCert(raw) || formatDateCert(new Date())
  })()
  const regOfficerName = data.certificateSignatoryName || 'SHIRLY L. DEMECILLO'
  const regOfficerTitle = data.certificateSignatoryTitle || 'Registration Officer II'
  const ccrName = data.cityCivilRegistrarName || 'YUSSIF DON JUSTIN F. MARTIL'

  return (
    <div className="ausf-doc print-doc print-doc-lcr-1a court-decree-lcr-form bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-2 flex flex-col">
      <div className="court-decree-lcr-header shrink-0">
      <header className="print-doc-header">
            <PrintHeaderRow />
            <hr className="border-black my-3" />
      </header>
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="font-bold text-base">LCR Form No. 1A</p>
            <p className="text-sm">(Birth-Available)</p>
          </div>
          <p className="text-sm font-medium">{formDate}</p>
        </div>
      </div>
      <div className="court-decree-lcr-body-wrap flex-1 min-h-0 flex flex-col">
        <div className="court-decree-lcr-body-scaled flex flex-col h-full">
          <div>
            <p className="font-bold mb-1">TO WHOM IT MAY CONCERN:</p>
            <p className="mb-2 text-left court-decree-lcr-body">
              <span className="font-bold">WE CERTIFY</span> that, among others, the following facts of birth appear in our Register of Births on Page{' '}
              {editableTable && onDataChange ? (
                <>
                  <input
                    type="text"
                    className="no-print inline-block border-b border-black px-1 min-w-[2rem] text-center font-bold max-w-[4rem] bg-white"
                    value={String(colbPage ?? '')}
                    onChange={(e) => patchData({ colbPageNo: e.target.value, colbPageNumber: e.target.value })}
                  />
                  <span className="hidden print:inline font-bold">{colbPage || ''}</span>
                </>
              ) : (
                <span className="inline-block border-b border-black px-1 min-w-[2rem] text-center font-bold">{colbPage || ''}</span>
              )}
              {' '}of Book number{' '}
              {editableTable && onDataChange ? (
                <>
                  <input
                    type="text"
                    className="no-print inline-block border-b border-black px-1 min-w-[3rem] text-center font-bold max-w-[5rem] bg-white"
                    value={String(colbBook ?? '')}
                    onChange={(e) => patchData({ colbBookNo: e.target.value, colbBookNumber: e.target.value })}
                  />
                  <span className="hidden print:inline font-bold">{colbBook || ''}</span>
                </>
              ) : (
                <span className="inline-block border-b border-black px-1 min-w-[3rem] text-center font-bold">{colbBook || ''}</span>
              )}
              .
            </p>
            <table className="w-full border-collapse text-sm mb-2 border border-black court-decree-lcr-table">
              <tbody>
                {editableTable && onDataChange
                  ? LCR_1A_EDITABLE_ROWS.map((row) => (
                      <tr key={row.k}>
                        <td className="py-1 px-2 border border-black font-medium align-top w-48">{row.label}</td>
                        <td className="py-1 px-2 border border-black font-bold text-center align-top">
                          <input
                            type="text"
                            className="no-print w-full min-w-0 text-center font-bold border-0 border-b border-dashed border-gray-400 bg-transparent focus:outline-none focus:border-[var(--primary-blue)] px-1"
                            value={cellEditText(table[row.k])}
                            onChange={(e) => patchData(row.patch(e.target.value))}
                          />
                          <span className="hidden print:inline">{table[row.k]}</span>
                        </td>
                      </tr>
                    ))
                  : (
                    <>
                      <tr><td className="py-1 px-2 border border-black font-medium align-top w-48">LCR Registry Number</td><td className="py-1 px-2 border border-black font-bold text-center">{table.registry}</td></tr>
                      <tr><td className="py-1 px-2 border border-black font-medium align-top">Date of Registration</td><td className="py-1 px-2 border border-black font-bold text-center">{table.dateReg}</td></tr>
                      <tr><td className="py-1 px-2 border border-black font-medium align-top">Name of Child</td><td className="py-1 px-2 border border-black font-bold text-center">{table.nameChild}</td></tr>
                      <tr><td className="py-1 px-2 border border-black font-medium align-top">Sex</td><td className="py-1 px-2 border border-black font-bold text-center">{table.sex}</td></tr>
                      <tr><td className="py-1 px-2 border border-black font-medium align-top">Date of Birth</td><td className="py-1 px-2 border border-black font-bold text-center">{table.dob}</td></tr>
                      <tr><td className="py-1 px-2 border border-black font-medium align-top">Place of Birth</td><td className="py-1 px-2 border border-black font-bold text-center">{table.pob}</td></tr>
                      <tr><td className="py-1 px-2 border border-black font-medium align-top">Name of Mother</td><td className="py-1 px-2 border border-black font-bold text-center">{table.mother}</td></tr>
                      <tr><td className="py-1 px-2 border border-black font-medium align-top">Citizenship of Mother</td><td className="py-1 px-2 border border-black font-bold text-center">{table.motherCit}</td></tr>
                      <tr><td className="py-1 px-2 border border-black font-medium align-top">Name of Father</td><td className="py-1 px-2 border border-black font-bold text-center">{table.father}</td></tr>
                      <tr><td className="py-1 px-2 border border-black font-medium align-top">Citizenship of Father</td><td className="py-1 px-2 border border-black font-bold text-center">{table.fatherCit}</td></tr>
                      <tr><td className="py-1 px-2 border border-black font-medium align-top">Date of Marriage of Parents</td><td className="py-1 px-2 border border-black font-bold text-center">{table.dom}</td></tr>
                      <tr><td className="py-1 px-2 border border-black font-medium align-top">Place of Marriage of Parents</td><td className="py-1 px-2 border border-black font-bold text-center">{table.pom}</td></tr>
                    </>
                  )}
              </tbody>
            </table>
            <p className="mb-2 text-sm court-decree-lcr-body">This certification is issued upon the request of OCRG/OWNER/PARENTS/GUARDIAN for any legal purposes.</p>
            <div className="mb-2 court-decree-lcr-body">
              <p className="font-bold text-sm mb-0.5">REMARKS:</p>
              <div className="no-print mb-1">
                <textarea
                  value={editableRemarks}
                  onChange={(e) => {
                    const v = e.target.value
                    setEditableRemarks(v)
                    onDataChange?.({ ...data, remarks: v })
                  }}
                  rows={3}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-[14px]"
                  placeholder="Type or edit remarks here..."
                />
              </div>
              <p className="text-[14px] leading-[1.35] text-justify whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                {editableRemarks}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="court-decree-lcr-footer mt-auto shrink-0">
        <div className="court-decree-lcr-body mb-1">
          <div className="mb-1 flex justify-between items-end gap-0">
            <div className="flex flex-col items-center text-center">
              <p className="font-bold text-sm mb-0.5 self-start">Verified by:</p>
              <p className="font-bold text-sm border-b border-black inline-block">{regOfficerName}</p>
              <p className="text-xs mt-0">{regOfficerTitle}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <p className="font-bold text-sm border-b border-black inline-block">{ccrName}</p>
              <p className="text-xs mt-0">City Civil Registrar</p>
            </div>
          </div>
          <p className="font-bold text-sm mb-1">Note: This certification is not valid if it has mark, erasure or alteration of any entry.</p>
        </div>
        <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} sloganBlue />
      </div>
    </div>
  )
}
