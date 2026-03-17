import React from 'react'

export default function FormSection({ number, title, children, noNumber }) {
  return (
    <div className="form-section mb-6 rounded-xl overflow-hidden border border-gray-200 bg-[var(--card-bg)] shadow-sm">
      <div className="form-section__header bg-[var(--primary-blue)] text-white px-4 py-2.5 font-semibold text-sm uppercase tracking-wide">
        {noNumber ? title : `${number}. ${title}`}
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}
