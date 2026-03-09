import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { COURT_DECREE_TYPES } from './courtDecree/constants'
import { LEGITIMATION_TYPES } from './legitimation/constants'

const AUSF_ITEMS = [
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

const categories = [
  {
    id: 'ausf',
    title: 'AUSF',
    meaning: 'Affidavit to Use the Surname of Father – legal document allowing a child to use the father\'s surname.',
    about: 'AUSF (Affidavit to Use the Surname of the Father) is a legal document that allows an illegitimate child to use the surname of the father. It applies when the child is born to parents who are not married. The father must execute an Affidavit to Use the Surname of the Father (AUSF) in order for the child to use his surname. This document is filed with the Local Civil Registrar where the child\'s birth was registered. AUSF covers various scenarios: children aged 0–6 and 7–17, registration of the affidavit, registration of acknowledgement, LCR forms, annotations, and transmittal documents for processing.',
    path: '/ausf',
    files: AUSF_ITEMS,
  },
  {
    id: 'court-decree',
    title: 'Court Decree',
    meaning: 'Certificates and annotations for court-ordered civil registry documents (adoption, rescission, annulment, etc.).',
    about: 'Court Decree documents pertain to civil registry records that have been ordered or amended by the court. These include orders of adoption, rescission of adoption, annulment of marriage, legal separation, and other judicial decrees affecting civil registry entries. The Local Civil Registrar issues certificates of authenticity and registration, transmittals, LCR forms, and annotations to reflect these court decisions in the civil registry.',
    path: '/court-decree',
    files: COURT_DECREE_TYPES.map((t) => ({
      title: t.title.replace(/^\d+\.\s*/, ''),
      desc: t.desc,
      path: '/court-decree/form',
      type: t.id,
    })),
  },
  {
    id: 'legitimation',
    title: 'Legitimation',
    meaning: 'Affidavits and registrations for legitimating a child born to unmarried parents through subsequent marriage.',
    about: 'Legitimation is the process by which a child born to unmarried parents becomes legitimate when the parents later marry each other. Under Philippine law, children conceived or born outside of marriage become legitimate upon the subsequent marriage of their parents. The process involves executing an Affidavit of Legitimation (sole or joint), registering it with the Local Civil Registrar, and annotating the child\'s Certificate of Live Birth. This gives the child the same rights as those born to married parents, including the right to use the father\'s surname.',
    path: '/legitimation',
    files: LEGITIMATION_TYPES.map((t) => ({
      title: t.title.replace(/^\d+\.\s*/, ''),
      desc: t.desc,
      path: '/legitimation/form',
      type: t.id,
    })),
  },
]

export default function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState(null)

  const showDetail = !!selectedCategory

  return (
    <div className="relative min-h-full overflow-hidden">
      <div
        className={`absolute inset-0 w-full p-6 transition-transform duration-[550ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          showDetail ? 'translate-x-[-100%] pointer-events-none' : 'translate-x-0'
        }`}
        style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
      >
        <div className="mb-6">
          <h1 className="text-base font-bold text-gray-800 mb-1">Dashboard</h1>
          <p className="text-sm text-gray-500">Choose a transaction type to start data entry.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <section
            key={cat.id}
            className="relative bg-[var(--card-bg)] rounded-xl shadow-sm border border-gray-100 overflow-visible flex flex-col"
          >
            <button
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className="text-left w-full p-5 border-b border-gray-100 shrink-0 rounded-t-xl focus:bg-gray-50/50 focus:outline-none"
            >
              <h2 className="font-semibold text-gray-800 text-base mb-1">{cat.title}</h2>
              <p className="text-sm text-gray-500">{cat.meaning}</p>
            </button>
            <div className="p-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide cursor-default">
                Files
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <p className="text-xs text-gray-400 mt-1">Click category to view files</p>
            </div>
          </section>
        ))}
        </div>
      </div>

      <div
        className={`absolute inset-0 w-full p-6 bg-[var(--main-bg)] overflow-y-auto transition-transform duration-[550ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          showDetail ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
        }`}
        style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
        aria-hidden={!showDetail}
      >
        {selectedCategory && (
          <div className="max-w-3xl mx-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 text-sm font-medium text-[var(--primary-blue)] mb-8 transition focus:underline focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{selectedCategory.title}</h1>
            <p className="text-base text-gray-600 leading-relaxed mb-2">{selectedCategory.meaning}</p>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">{selectedCategory.about}</p>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Files
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
              {selectedCategory.files.map((f) => (
                <Link
                  key={f.type}
                  to={{ pathname: f.path, search: `?type=${f.type}` }}
                  onClick={() => setSelectedCategory(null)}
                  className="block w-full px-4 py-2.5 rounded-lg text-left transition focus:bg-gray-100 focus:outline-none"
                >
                  <p className="font-medium text-gray-800 text-sm">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{f.desc}</p>
                </Link>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="mt-6 px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg transition focus:bg-gray-50 focus:outline-none"
            >
              Close
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
