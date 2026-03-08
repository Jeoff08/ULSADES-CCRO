import React from 'react'
import { fullName } from '../../lib/printUtils'

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  if (isNaN(d.getTime())) return str
  const day = String(d.getDate()).padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const year = String(d.getFullYear()).slice(-2)
  return `${day}-${months[d.getMonth()]}-${year}`
}

export default function LegacyPrintSummary({ data }) {
  const showItems4to7 = data.childAlreadyAcknowledged === 'NO'
  return (
    <div className="max-w-4xl mx-auto bg-white border border-gray-300 rounded-lg shadow-sm p-6 print:shadow-none print:border-0">
      <div className="bg-[var(--primary-blue)] text-white text-center py-3 px-4 rounded-t-lg mb-4">
        <h1 className="font-bold text-base">RA 9255 AUTOMATED DATA ENTRY FORM</h1>
        <p className="text-sm text-white/80 mt-0.5">Unified Legal Status Automated Data Entry System — Iligan City Civil Registrar Office</p>
      </div>
      <div className="mb-4 pb-2 border-b border-gray-200"><strong>Form type:</strong> {data.formType}</div>
      <div className="mb-4"><strong>NAME</strong>: {data.applicantName || '—'}</div>
      <div className="mb-4"><strong>RELATIONSHIP TO THE CHILD</strong>: {data.relationshipToChild || '—'}</div>
      {showItems4to7 && (
        <>
          <div className="mb-2 font-medium text-gray-700">DETAILS OF THE CHILD</div>
          <div className="text-sm space-y-1 mb-4">
            <p>Child: {fullName(data.childFirst, data.childMiddle, data.childLast)}</p>
            <p>DOB: {formatDate(data.dateOfBirth)}</p>
            <p>Place: {[data.placeOfBirthAddress, data.placeOfBirthCity, data.placeOfBirthProvince].filter(Boolean).join(', ')}</p>
          </div>
        </>
      )}
      <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-200">created by: ATTY. YUSSIF DON JUSTINE F. MARTIL</p>
    </div>
  )
}
