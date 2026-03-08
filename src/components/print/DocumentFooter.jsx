import React from 'react'

export default function DocumentFooter({ contactPhone, contactEmail }) {
  return (
    <div className="print-doc-footer mt-6">
      <hr className="border-black border-t mb-3" />
      <div className="flex justify-between items-start text-xs gap-4">
        <div>
          <p className="font-bold">CONTACT DETAILS:</p>
          <p>Telephone No.: {contactPhone || '(063) 224-5038'}</p>
          <p>Email: {contactEmail || 'civilregistrar.iligan@gmail.com'}</p>
        </div>
        <div className="text-right italic font-bold shrink-0">
          <p>Births, Marriages and Deaths matter,</p>
          <p>Register them all!</p>
        </div>
      </div>
    </div>
  )
}
