import React from 'react'

export default function DocumentFooter({ contactPhone, contactEmail, sloganBlue, contentClassName }) {
  return (
    <div className="print-doc-footer mt-4 w-full">
      <hr className="border-black border-t mb-3" />
      <div className={`grid grid-cols-2 gap-6 items-start ${contentClassName || 'text-xs'}`}>
        <div className="leading-tight space-y-0.5">
          <p className="font-bold">CONTACT DETAILS:</p>
          <p>Telephone No.: {contactPhone || '(063) 224-5038'}</p>
          <p>Email: {contactEmail || 'civilregistrar.iligan@gmail.com'}</p>
        </div>
        <div className={`text-right leading-tight space-y-0.5 italic font-bold ${sloganBlue ? 'text-blue-600' : ''}`}>
          <p>Births, Marriages and Deaths matter,</p>
          <p>Register them all!</p>
        </div>
      </div>
    </div>
  )
}
