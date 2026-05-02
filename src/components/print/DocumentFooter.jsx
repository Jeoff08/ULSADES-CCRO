import React from 'react'

function normalizeContactPhone(phone) {
  const raw = String(phone || '').trim()
  const digits = raw.replace(/\D/g, '')

  if (!digits) return '228-1311'
  if (digits.endsWith('2245038') || digits.endsWith('2272806') || digits.endsWith('2281311')) {
    return '228-1311'
  }
  return raw
}

export default function DocumentFooter({ contactPhone, contactEmail, sloganBlue, contentClassName }) {
  const displayPhone = normalizeContactPhone(contactPhone)

  return (
    <div className="print-doc-footer mt-4 w-full">
      <hr className="border-black border-t mb-3" />
      <div className={`grid grid-cols-2 gap-6 items-start ${contentClassName || 'text-xs'}`}>
        <div className="leading-tight space-y-0.5">
          <p className="font-bold">CONTACT DETAILS:</p>
          <p>Telephone No.: {displayPhone}</p>
          <p>Email: {contactEmail || 'civilregistrar.iligan@gmail.com'}</p>
        </div>
        <div className="text-right leading-tight space-y-0.5 italic font-bold text-blue-600">
          <p>Births, Marriages and Deaths matter,</p>
          <p>Register them all!</p>
        </div>
      </div>
    </div>
  )
}
