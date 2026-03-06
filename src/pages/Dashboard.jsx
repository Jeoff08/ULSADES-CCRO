import React from 'react'
import { Link } from 'react-router-dom'

const sections = [
  { title: 'AUSF 0-6', desc: 'Affidavit to Use the Surname of Father (ages 0-6)', path: '/ausf', type: 'ausf' },
  { title: 'AUSF 07-17', desc: 'Affidavit to Use the Surname of Father (ages 7-17)', path: '/ausf', type: 'ausf-07-17' },
  { title: 'Registration of AUSF', desc: 'Register the AUSF document', path: '/ausf', type: 'reg-ausf' },
  { title: 'Registration of Acknowledgement', desc: 'Register affidavit of acknowledgement', path: '/ausf', type: 'reg-ack' },
  { title: 'LCR Form 1A (Birth-Available)', desc: 'Child Acknowledge — Birth certification', path: '/ausf', type: 'child-ack-lcr' },
  { title: 'Annotation', desc: 'Child Acknowledge — Annotation', path: '/ausf', type: 'child-ack-annotation' },
  { title: 'LCR Form A1 (Child Not Acknowledged)', desc: 'LCR Form 1A certification', path: '/ausf', type: 'child-not-ack-lcr' },
  { title: 'Annotation (Child Not Acknowledged)', desc: 'Certificate of Live Birth (Municipal Form 102)', path: '/ausf', type: 'child-not-ack-annotation' },
  { title: 'Transmittal (Child Not Acknowledged)', desc: 'Endorsement letter to Municipal Civil Registrar', path: '/ausf', type: 'child-not-ack-transmittal' },
  { title: 'Out of Town Transmittal', desc: 'Transmittal for out-of-town / PSA', path: '/ausf', type: 'out-of-town' },
]

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-base font-bold text-gray-800 mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500">Choose a transaction type to start data entry.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.type}
            to={{ pathname: s.path, search: `?type=${s.type}` }}
            className="block p-5 bg-[var(--card-bg)] rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[var(--primary-green)]/30 transition group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-gray-800 text-sm group-hover:text-[var(--primary-blue)] transition">{s.title}</h2>
                <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
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
