import React from 'react'
import { Link } from 'react-router-dom'

import { LEGITIMATION_TYPES } from './constants'

export default function LegitimationDashboard() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-800 mb-1">Legitimation Automated Data Entry</h1>
          <p className="text-sm text-gray-500">Choose a form type to start data entry.</p>
        </div>
        <Link to="/legitimation/saved" className="text-[var(--primary-blue)] text-sm font-medium hover:underline">
          Saved entries
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LEGITIMATION_TYPES.map((doc) => (
          <Link
            key={doc.id}
            to={{ pathname: '/legitimation/form', search: `?type=${doc.id}` }}
            className="block p-5 bg-[var(--card-bg)] rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[var(--primary-green)]/30 transition group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-gray-800 text-sm group-hover:text-[var(--primary-blue)] transition">{doc.title}</h2>
                <p className="text-xs text-gray-500 mt-1">{doc.desc}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[var(--primary-blue)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--primary-green)]/20 transition">
                <svg className="w-5 h-5 text-[var(--primary-blue)] group-hover:text-[var(--primary-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
