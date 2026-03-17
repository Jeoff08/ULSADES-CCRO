import React from 'react'
import { formatDateLong, fullName } from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'

const cellInputClass = 'w-full min-w-0 border-0 bg-transparent px-1 py-0.5 text-inherit font-bold focus:outline-none focus:ring-1 focus:ring-blue-300 read-only:focus:ring-0 read-only:cursor-default print:border-b print:border-gray-300'

/** LCR Form No. 3A (Marriage-Available). Data from Legitimation. Blank table cells are manual input in the output. */
export default function LcrForm3AMarriageAvailable({ data }) {
  const husbandName = fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const wifeName = fullName(data.motherFirst, data.motherMiddle, data.motherLast)
  const placeOfMarriage = [data.placeOfMarriageCity, data.placeOfMarriageProvince, data.placeOfMarriageCountry].filter(Boolean).join(', ')
  const marriageRegNo = data.marriageRegistryNo
  const marriageRegDate = data.marriageDateOfRegistration ?? data.colbRegDate
  const formDate = data.certificateIssuanceDate ? formatDateLong(data.certificateIssuanceDate) : ''
  const regOfficer = data.certificateSignatoryName || 'LORELIE L. CANTO'
  const ccrName = data.cityCivilRegistrarName || 'YUSSIF DON JUSTIN F. MARTIL'

  return (
    <div className="ausf-doc print-doc print-doc-lcr-3a court-decree-lcr-form bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-2 flex flex-col">
      <div className="court-decree-lcr-header shrink-0">
        <PrintHeaderRow />
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="font-bold text-base">LCR Form No. 3A</p>
            <p className="text-sm">(Marriage-Available)</p>
          </div>
          <p className="text-sm font-medium min-w-[8rem] min-h-[1.25rem]">{formDate || '\u00A0'}</p>
        </div>
      </div>
      <div className="court-decree-lcr-body-wrap flex-1 min-h-0 flex flex-col">
        <div className="court-decree-lcr-body-scaled">
          <p className="font-bold mb-1">TO WHOM IT MAY CONCERN:</p>
          <p className="mb-2 text-left court-decree-lcr-body">
        <span className="font-bold">WE CERTIFY</span> that, among others, the following facts of marriage appear in our Register of Marriages on Page <span className="inline-block min-w-[2rem] align-bottom">&nbsp;</span> of Book number <span className="inline-block min-w-[3rem] align-bottom">&nbsp;</span>.
      </p>
      <table className="w-full border-collapse text-sm mb-2 border border-black table-fixed court-decree-lcr-table">
        <colgroup>
          <col style={{ width: '28%' }} />
          <col style={{ width: '36%' }} />
          <col style={{ width: '36%' }} />
        </colgroup>
        <thead>
          <tr>
            <td className="py-1 px-2 border border-black font-bold align-top" />
            <td className="py-1 px-2 border border-black font-bold text-center bg-gray-800 text-white">HUSBAND</td>
            <td className="py-1 px-2 border border-black font-bold text-center bg-gray-800 text-white">WIFE</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-1 px-2 border border-black font-medium align-top">Name:</td>
            <td className="py-1 px-2 border border-black text-center min-h-[1.25rem] font-bold"><input type="text" className={`${cellInputClass} text-center`} defaultValue={husbandName || ''} placeholder="—" readOnly={!!husbandName} /></td>
            <td className="py-1 px-2 border border-black text-center min-h-[1.25rem] font-bold"><input type="text" className={`${cellInputClass} text-center`} defaultValue={wifeName || ''} placeholder="—" readOnly={!!wifeName} /></td>
          </tr>
          <tr>
            <td className="py-1 px-2 border border-black font-medium align-top">Date of Birth/Age:</td>
            <td className="py-1 px-2 border border-black text-center"><input type="text" className={`${cellInputClass} text-center`} defaultValue={data.husbandDateOfBirth ? formatDateLong(data.husbandDateOfBirth) : (data.husbandAge || '')} placeholder="—" readOnly={!!(data.husbandDateOfBirth || data.husbandAge)} /></td>
            <td className="py-1 px-2 border border-black text-center"><input type="text" className={`${cellInputClass} text-center`} defaultValue={data.wifeDateOfBirth ? formatDateLong(data.wifeDateOfBirth) : (data.wifeAge || '')} placeholder="—" readOnly={!!(data.wifeDateOfBirth || data.wifeAge)} /></td>
          </tr>
          <tr>
            <td className="py-1 px-2 border border-black font-medium align-top">Citizenship:</td>
            <td className="py-1 px-2 border border-black text-center font-bold"><input type="text" className={`${cellInputClass} text-center`} defaultValue={data.fatherCitizenship || ''} placeholder="—" readOnly={!!data.fatherCitizenship} /></td>
            <td className="py-1 px-2 border border-black text-center font-bold"><input type="text" className={`${cellInputClass} text-center`} defaultValue={data.motherCitizenship || ''} placeholder="—" readOnly={!!data.motherCitizenship} /></td>
          </tr>
          <tr>
            <td className="py-1 px-2 border border-black font-medium align-top">Civil Status:</td>
            <td className="py-1 px-2 border border-black text-center"><input type="text" className={`${cellInputClass} text-center`} defaultValue={data.husbandCivilStatus || ''} placeholder="—" readOnly={!!data.husbandCivilStatus} /></td>
            <td className="py-1 px-2 border border-black text-center"><input type="text" className={`${cellInputClass} text-center`} defaultValue={data.wifeCivilStatus || ''} placeholder="—" readOnly={!!data.wifeCivilStatus} /></td>
          </tr>
          <tr>
            <td className="py-1 px-2 border border-black font-medium align-top">Mother:</td>
            <td className="py-1 px-2 border border-black text-center"><input type="text" className={`${cellInputClass} text-center`} defaultValue={data.husbandMotherName || ''} placeholder="—" readOnly={!!data.husbandMotherName} /></td>
            <td className="py-1 px-2 border border-black text-center"><input type="text" className={`${cellInputClass} text-center`} defaultValue={data.wifeMotherName || ''} placeholder="—" readOnly={!!data.wifeMotherName} /></td>
          </tr>
          <tr>
            <td className="py-1 px-2 border border-black font-medium align-top">Father:</td>
            <td className="py-1 px-2 border border-black text-center"><input type="text" className={`${cellInputClass} text-center`} defaultValue={data.husbandFatherName || ''} placeholder="—" readOnly={!!data.husbandFatherName} /></td>
            <td className="py-1 px-2 border border-black text-center"><input type="text" className={`${cellInputClass} text-center`} defaultValue={data.wifeFatherName || ''} placeholder="—" readOnly={!!data.wifeFatherName} /></td>
          </tr>
          <tr>
            <td className="py-1 px-2 border border-black font-medium align-top">Registry Number</td>
            <td className="py-1 px-2 border border-black text-center font-bold" colSpan={2}><input type="text" className={`${cellInputClass} text-center`} defaultValue={marriageRegNo || ''} placeholder="—" readOnly={!!marriageRegNo} /></td>
          </tr>
          <tr>
            <td className="py-1 px-2 border border-black font-medium align-top leading-tight">Date of<br />Registration</td>
            <td className="py-1 px-2 border border-black text-center font-bold" colSpan={2}><input type="text" className={`${cellInputClass} text-center`} defaultValue={marriageRegDate ? formatDateLong(marriageRegDate) : ''} placeholder="—" readOnly={!!marriageRegDate} /></td>
          </tr>
          <tr>
            <td className="py-1 px-2 border border-black font-medium align-top">Date of Marriage</td>
            <td className="py-1 px-2 border border-black text-center font-bold" colSpan={2}><input type="text" className={`${cellInputClass} text-center`} defaultValue={data.dateOfMarriage ? formatDateLong(data.dateOfMarriage) : ''} placeholder="—" readOnly={!!data.dateOfMarriage} /></td>
          </tr>
          <tr>
            <td className="py-1 px-2 border border-black font-medium align-top leading-tight">Place of<br />Marriage</td>
            <td className="py-1 px-2 border border-black text-center align-top min-h-[2rem] font-bold" colSpan={2}><input type="text" className={`${cellInputClass} text-center`} defaultValue={placeOfMarriage || ''} placeholder="—" readOnly={!!placeOfMarriage} /></td>
          </tr>
        </tbody>
      </table>
      <p className="mb-2 text-sm italic court-decree-lcr-body">This certification is issued upon the request of OCRG/DOCUMENT OWNER for any legal purposes.</p>
      <div className="mb-2 court-decree-lcr-body">
        <p className="font-bold text-sm mb-0.5">REMARKS:</p>
        <p className="text-sm text-justify min-h-[1.5rem]">{data.remarks || ''}</p>
      </div>
      <div className="mb-2 flex justify-between items-end gap-8 court-decree-lcr-body">
        <div className="text-left">
          <p className="font-bold text-sm mb-0.5">Verified by:</p>
          <p className="font-bold text-sm">{regOfficer}</p>
          <p className="text-xs">LCRO - Staff</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-sm">{ccrName}</p>
          <p className="text-xs">City Civil Registrar</p>
        </div>
      </div>
          <p className="font-bold text-sm mb-2 court-decree-lcr-body">Note: This certification is not valid if it has mark, erasure or alteration of any entry.</p>
        </div>
      </div>
      <div className="court-decree-lcr-footer mt-auto shrink-0">
        <DocumentFooter contactPhone={data?.contactPhone} contactEmail={data?.contactEmail} sloganBlue />
      </div>
    </div>
  )
}
