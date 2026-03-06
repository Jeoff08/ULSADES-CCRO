import React from 'react'

export default function FormSection({ number, title, children, noNumber }) {
  return (
    <div className="mb-6 rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-[var(--card-bg)]">
      <div className="bg-[var(--primary-blue)] text-white px-4 py-2.5 font-semibold text-sm">
        {noNumber ? title : `${number}. ${title}`}
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}
