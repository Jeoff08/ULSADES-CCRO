import React from 'react'
import { formatDateCert, formatDateLong } from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'

/** LCR Form No. 3A (Marriage-Available) – court decree / marriage certification. */
export default function LcrForm3AMarriageAvailable({ data }) {
  const formDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const regOfficer = data.certificateSignatoryName || 'LORELIE L. CANTO'
  const ccrName = data.cityCivilRegistrarName || 'YUSSIF DON JUSTIN F. MARTIL'

  return (
    <div className="ausf-doc print-doc bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-4">
      <PrintHeaderRow />
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-bold text-base">LCR Form No. 3A</p>
          <p className="text-sm">(Marriage-Available)</p>
        </div>
        <p className="text-sm font-medium">{formDate}</p>
      </div>
      <p className="font-bold mb-2">TO WHOM IT MAY CONCERN:</p>
      <p className="mb-4">
        WE CERTIFY that, among others, the following facts of marriage appear in our Register of Marriages on Page <span className="font-bold underline align-middle px-1 min-w-[2rem] inline-block text-center">{data.colbPageNumber ?? '—'}</span> of Book number <span className="font-bold underline align-middle px-1 min-w-[3rem] inline-block text-center">{data.colbBookNumber ?? '—'}</span>.
      </p>
      <table className="w-full border-collapse text-sm mb-4 border border-black">
        <tbody>
          <tr><td className="py-1.5 px-2 border border-black font-medium w-48">LCR Registry Number</td><td className="py-1.5 px-2 border border-black">{data.colbRegistryNo || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium">Date of Registration</td><td className="py-1.5 px-2 border border-black">{formatDateLong(data.colbDateOfRegistration) || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium">Name of Husband / Wife</td><td className="py-1.5 px-2 border border-black">{data.documentOwnerName || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium">Date of Marriage</td><td className="py-1.5 px-2 border border-black">{data.dateIssued || data.dateOfMarriage || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium">Place of Marriage</td><td className="py-1.5 px-2 border border-black">{data.courtThatIssued || data.placeOfMarriage || '—'}</td></tr>
        </tbody>
      </table>
      <p className="mb-4 text-sm">This certification is issued upon the request of OCRG/DOCUMENT OWNER for any legal purposes.</p>
      <p className="font-bold text-sm mb-1">REMARKS:</p>
      <p className="min-h-[3rem] border-b border-gray-400 mb-6 text-sm">{data.remarks || data.caseTitle || ''}</p>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm mb-0.5">Verified by:</p>
          <p className="font-bold">{regOfficer}</p>
          <p className="text-xs italic">Registration Officer IV</p>
        </div>
        <div className="text-right">
          <p className="font-bold">{ccrName}</p>
          <p className="text-sm italic">City Civil Registrar</p>
        </div>
      </div>
      <p className="font-bold text-sm mb-4">Note: This certification is not valid if it has mark, erasure or alteration of any entry.</p>
      <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
    </div>
  )
}
