import React from 'react'
import { formatDateCert, formatDateLong } from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'

const cellInputClass = 'w-full min-w-0 border-0 bg-transparent px-1 py-0.5 text-center text-inherit font-bold focus:outline-none focus:ring-1 focus:ring-blue-300 print:border-b print:border-gray-300'

/** LCR Form No. 2A (Death-Available). Data from Legitimation. Blank table cells are manual input in the output. */
export default function LcrForm2ADeathAvailable({ data }) {
  const deceasedName = data.documentOwnerName || [data.deceasedParentFirst, data.deceasedParentMiddle, data.deceasedParentLast].filter(Boolean).join(' ').trim()
  const colbPage = data.colbPageNumber ?? data.colbPageNo
  const colbBook = data.colbBookNumber ?? data.colbBookNo
  const colbRegDate = data.colbDateOfRegistration ?? data.colbRegDate
  const formDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const regOfficer = data.certificateSignatoryName || 'LORELIE L. CANTO'
  const ccrName = data.cityCivilRegistrarName || 'YUSSIF DON JUSTIN F. MARTIL'

  return (
    <div className="ausf-doc print-doc court-decree-lcr-form bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-2 flex flex-col">
      <div className="court-decree-lcr-header shrink-0">
        <PrintHeaderRow />
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="font-bold text-base">LCR Form No. 2A</p>
            <p className="text-sm">(Death-Available)</p>
          </div>
          <p className="text-sm font-medium">{formDate}</p>
        </div>
      </div>
      <div className="court-decree-lcr-body-wrap flex-1 min-h-0 flex flex-col">
        <div className="court-decree-lcr-body-scaled">
          <p className="font-bold mb-1">TO WHOM IT MAY CONCERN:</p>
          <p className="mb-2 text-left court-decree-lcr-body">
        <span className="font-bold">WE CERTIFY</span> that, among others, the following facts of death appear in our Register of Deaths on Page <span className="inline-block border-b border-black px-1 min-w-[2rem] text-center font-bold">{colbPage ?? ''}</span> of Book number <span className="inline-block border-b border-black px-1 min-w-[3rem] text-center font-bold">{colbBook ?? ''}</span>.
      </p>
      <table className="w-full border-collapse text-sm mb-2 border border-black court-decree-lcr-table">
        <tbody>
          <tr><td className="py-1 px-2 border border-black font-medium align-top w-48">LCR Registry Number</td><td className="py-1 px-2 border border-black font-bold text-center"><input type="text" className={cellInputClass} defaultValue={data.colbRegistryNo || ''} placeholder="—" /></td></tr>
          <tr><td className="py-1 px-2 border border-black font-medium align-top">Date of Registration</td><td className="py-1 px-2 border border-black font-bold text-center"><input type="text" className={cellInputClass} defaultValue={formatDateLong(colbRegDate) || ''} placeholder="—" /></td></tr>
          <tr><td className="py-1 px-2 border border-black font-medium align-top">Name of Deceased</td><td className="py-1 px-2 border border-black font-bold text-center"><input type="text" className={cellInputClass} defaultValue={deceasedName || ''} placeholder="—" /></td></tr>
          <tr><td className="py-1 px-2 border border-black font-medium align-top">Sex</td><td className="py-1 px-2 border border-black font-bold text-center"><input type="text" className={cellInputClass} defaultValue={data.sex || ''} placeholder="—" /></td></tr>
          <tr><td className="py-1 px-2 border border-black font-medium align-top">Civil Status</td><td className="py-1 px-2 border border-black font-bold text-center"><input type="text" className={cellInputClass} defaultValue={data.civilStatus || ''} placeholder="—" /></td></tr>
          <tr><td className="py-1 px-2 border border-black font-medium align-top">Citizenship</td><td className="py-1 px-2 border border-black font-bold text-center"><input type="text" className={cellInputClass} defaultValue={data.citizenship || ''} placeholder="—" /></td></tr>
          <tr><td className="py-1 px-2 border border-black font-medium align-top">Date of Death</td><td className="py-1 px-2 border border-black font-bold text-center"><input type="text" className={cellInputClass} defaultValue={formatDateLong(data.dateOfDeath) || data.dateOfDeath || data.dateIssued || ''} placeholder="—" /></td></tr>
          <tr><td className="py-1 px-2 border border-black font-medium align-top">Citizenship of Father</td><td className="py-1 px-2 border border-black font-bold text-center"><input type="text" className={cellInputClass} defaultValue={(data.citizenshipOfFather ?? data.fatherCitizenship) || ''} placeholder="—" /></td></tr>
          <tr><td className="py-1 px-2 border border-black font-medium align-top">Place of Death</td><td className="py-1 px-2 border border-black font-bold text-center"><input type="text" className={cellInputClass} defaultValue={data.placeOfDeath || data.courtThatIssued || ''} placeholder="—" /></td></tr>
          <tr><td className="py-1 px-2 border border-black font-medium align-top">Cause of Death</td><td className="py-1 px-2 border border-black font-bold text-center align-top"><textarea className={`${cellInputClass} block w-full min-h-[2rem] text-left resize-y`} defaultValue={data.causeOfDeath || ''} placeholder="—" rows={2} /></td></tr>
        </tbody>
      </table>
      <p className="mb-2 text-sm italic court-decree-lcr-body">This certification is issued upon the request of OCRG/OWNER/PARENTS/GUARDIAN for any legal purposes.</p>
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
        <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} sloganBlue />
      </div>
    </div>
  )
}
