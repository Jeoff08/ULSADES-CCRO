import React from 'react'
import {
  formatDateLong,
  formatDateCert,
  formatDateReg,
  formatDateDobShort,
  fullName,
} from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'

/** LCR Form No. 1A (Birth-Available) – legitimation form. Matches LCR official layout. */
export default function LcrForm1A({ data }) {
  const childFull = fullName(data.childFirst, data.childMiddle, data.childLast)
  const motherFull = fullName(data.motherFirst, data.motherMiddle, data.motherLast)
  const fatherFull = fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const formDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const ccrName = (data.cityCivilRegistrarName || 'YUSSIF DON JUSTIN F. MARTIL').toUpperCase()
  const verifiedByName = (data.verifiedByName || data.lcrStaffName || 'SHIRLY L. DEMECILLO').toUpperCase()

  const placeOfBirth = [
    data.placeOfBirthStreet,
    data.placeOfBirthCity,
    data.placeOfBirthProvince,
  ]
    .filter(Boolean)
    .join(', ')
    .trim() || '—'

  const placeOfMarriage = [
    data.solemnizingOfficer,
    data.placeOfMarriageCity,
    data.placeOfMarriageProvince,
    data.placeOfMarriageCountry,
  ]
    .filter(Boolean)
    .join(', ')
    .trim() || '—'

  const dateOfMarriageUppercase = (() => {
    if (!data.dateOfMarriage) return ''
    const d = new Date(data.dateOfMarriage)
    if (isNaN(d.getTime())) return ''
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  })()

  const remark = `Legitimated by the subsequent marriage of parents ${fatherFull || '—'} and ${motherFull || '—'} on ${dateOfMarriageUppercase || '—'} at ${placeOfMarriage} under Registry No. ${data.marriageRegistryNo || '—'}`

  const TableRow = ({ label, value }) => (
    <tr>
      <td className="py-1.5 px-2 border border-black font-medium align-top w-48">{label}</td>
      <td className="py-1.5 px-2 border border-black text-center">{value || '—'}</td>
    </tr>
  )

  return (
    <div className="ausf-doc print-doc print-doc-lcr-1a legitimation-lcr-1a bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-4 flex flex-col min-h-0 legitimation-lcr-1a-outer">
      <div className="legitimation-lcr-1a-sheet flex flex-col min-h-0 flex-1">
        <PrintHeaderRow />

        <div className="flex justify-between items-start gap-4 mb-4 shrink-0">
          <div>
            <p className="font-bold text-base">LCR Form No. 1A</p>
            <p className="text-sm italic">(Birth-Available)</p>
          </div>
          <p className="text-sm underline shrink-0">{formDate}</p>
        </div>

        <div className="legitimation-lcr-1a-body flex-1 min-h-0 flex flex-col">
        <p className="font-bold mb-2">TO WHOM IT MAY CONCERN:</p>

        <p className="mb-4">
          <span className="font-bold">WE CERTIFY</span> that, among others, the following facts of birth appear in our Register of Births on Page <span className="underline font-bold">{data.colbPageNo ?? data.colbPageNumber ?? '0'}</span> of Book number <span className="underline font-bold">{data.colbBookNo ?? data.colbBookNumber ?? '0'}</span>
        </p>

        <table className="w-full border-collapse text-sm mb-4 border border-black">
          <tbody>
            <TableRow label="LCR Registry Number" value={data.colbRegistryNo} />
            <TableRow label="Date of Registration" value={formatDateReg(data.colbRegDate)} />
            <TableRow label="Name of Child" value={childFull} />
            <TableRow label="Sex" value={data.sex} />
            <TableRow label="Date of Birth" value={formatDateDobShort(data.dateOfBirth)} />
            <TableRow label="Place of Birth" value={placeOfBirth} />
            <TableRow label="Name of Mother" value={motherFull} />
            <TableRow label="Citizenship of Mother" value={data.motherCitizenship} />
            <TableRow label="Name of Father" value={fatherFull} />
            <TableRow label="Citizenship of Father" value={data.fatherCitizenship} />
            <TableRow label="Date of Marriage of Parents" value={formatDateLong(data.dateOfMarriage)} />
            <TableRow label="Place of Marriage of Parents" value={placeOfMarriage} />
          </tbody>
        </table>

        <p className="mb-4 text-sm">
          This certification is issued upon the request of OCRG/OWNER/PARENTS/GUARDIAN for any legal purposes.
        </p>

        <div className="mb-4">
          <p className="font-bold text-sm mb-1">REMARKS:</p>
          <p className="text-sm font-bold italic">&quot;{remark}&quot;</p>
        </div>

        <div className="flex justify-between items-end gap-8 mb-4">
          <div>
            <p className="font-medium text-sm mb-1">Verified by:</p>
            <p className="font-bold underline">{verifiedByName}</p>
            <p className="text-xs">LCR - Staff</p>
          </div>
          <div className="text-right">
            <p className="font-bold underline">{ccrName}</p>
            <p className="text-sm italic">City Civil Registrar</p>
          </div>
        </div>

        <p className="font-bold text-sm mb-4 shrink-0">
          Note: This certification is not valid if it has mark, erasure or alteration of any entry.
        </p>
        </div>

        <div className="mt-auto shrink-0 print:mb-6 legitimation-lcr-1a-footer-wrap">
          <DocumentFooter
            contactPhone={data.contactPhone || '(063) 227-2806'}
            contactEmail={data.contactEmail || 'civilregistrar.iligan@gmail.com'}
            sloganBlue
          />
        </div>
      </div>
    </div>
  )
}
