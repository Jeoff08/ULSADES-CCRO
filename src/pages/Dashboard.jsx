import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { COURT_DECREE_TYPES } from './courtDecree/constants'
import { LEGITIMATION_TYPES } from './legitimation/constants'
import { getSavedAUSFList, loadSavedAUSFListFromApi } from './ausf/lib/ausfStorage'
import { getSavedCourtDecreeList } from './courtDecree/lib/courtDecreeStorage'
import { getSavedLegitimationList } from './legitimation/lib/legitimationStorage'

const AUSF_ITEMS = [
  { title: 'AUSF 0-6', desc: 'Affidavit to Use the Surname of Father (ages 0-6)', path: '/ausf', type: 'ausf' },
  { title: 'AUSF 07-17', desc: 'Affidavit to Use the Surname of Father (ages 7-17)', path: '/ausf', type: 'ausf-07-17' },
  { title: 'Registration of AUSF', desc: 'Register the AUSF document', path: '/ausf', type: 'reg-ausf' },
  { title: 'Registration of Acknowledgement', desc: 'Register affidavit of acknowledgement', path: '/ausf', type: 'reg-ack' },
  { title: 'LCR Form 1A (Birth-Available)', desc: 'Child Acknowledge — Birth certification', path: '/ausf', type: 'child-ack-lcr' },
  { title: 'LCR Form A1 (Child Not Acknowledged)', desc: 'LCR Form 1A certification', path: '/ausf', type: 'child-not-ack-lcr' },
  { title: 'Transmittal (Child Not Acknowledged)', desc: 'Endorsement letter to Municipal Civil Registrar', path: '/ausf', type: 'child-not-ack-transmittal' },
  { title: 'Out of Town Transmittal', desc: 'Transmittal for out-of-town / PSA', path: '/ausf', type: 'out-of-town' },
]

const categories = [
  {
    id: 'ausf',
    title: 'AUSF',
    meaning: 'Affidavit to Use the Surname of Father – legal document allowing a child to use the father\'s surname.',
    about: 'AUSF (Affidavit to Use the Surname of the Father) is a legal document that allows an illegitimate child to use the surname of the father. It applies when the child is born to parents who are not married. The father must execute an Affidavit to Use the Surname of the Father (AUSF) in order for the child to use his surname. This document is filed with the Local Civil Registrar where the child\'s birth was registered. AUSF covers various scenarios: children aged 0–6 and 7–17, registration of the affidavit, registration of acknowledgement, LCR forms, and transmittal documents for processing.',
    path: '/ausf',
    files: AUSF_ITEMS,
  },
  {
    id: 'court-decree',
    title: 'Court Decree',
    meaning: 'Certificates and annotations for court-ordered civil registry documents (adoption, rescission, annulment, etc.).',
    about: 'Court Decree documents pertain to civil registry records that have been ordered or amended by the court. These include orders of adoption, rescission of adoption, annulment of marriage, legal separation, and other judicial decrees affecting civil registry entries. The Local Civil Registrar issues certificates of authenticity and registration, transmittals, LCR forms, and annotations to reflect these court decisions in the civil registry.',
    path: '/court-decree',
    files: [
      ...COURT_DECREE_TYPES.map((t) => ({
        title: t.title.replace(/^\d+\.\s*/, ''),
        desc: t.desc,
        path: '/court-decree/form',
        type: t.id,
      })),
      {
        title: 'Marriage — Nullity / Art. 42',
        desc: 'Annulment, nullity, or Art. 42 (opens under Nullity of marriage)',
        to: '/court-decree/workflow/nullity-of-marriage',
        type: 'nullity-workflow',
      },
    ],
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

const CATEGORY_ACCENTS = {
  ausf: { dot: 'bg-teal-500', soft: 'from-teal-50 to-cyan-100', ring: 'group-hover:ring-teal-200' },
  'court-decree': { dot: 'bg-indigo-500', soft: 'from-indigo-50 to-blue-100', ring: 'group-hover:ring-indigo-200' },
  legitimation: { dot: 'bg-amber-500', soft: 'from-amber-50 to-yellow-100', ring: 'group-hover:ring-amber-200' },
}

export default function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [ausfCount, setAusfCount] = useState(() => getSavedAUSFList().length)

  const showDetail = !!selectedCategory

  const totalCounts = {
    ausf: ausfCount,
    'court-decree': getSavedCourtDecreeList().length,
    legitimation: getSavedLegitimationList().length,
  }

  React.useEffect(() => {
    loadSavedAUSFListFromApi()
      .then((list) => setAusfCount(list.length))
      .catch(() => { })
  }, [])

  return (
    <div className="relative min-h-full overflow-hidden">
      <div
        className={`absolute inset-0 w-full p-6 transition-transform duration-[550ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${showDetail ? 'translate-x-[-100%] pointer-events-none' : 'translate-x-0'
          }`}
        style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
      >
        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white/85 backdrop-blur px-5 py-4 shadow-sm">
          <p className="text-[11px] tracking-[0.18em] uppercase font-semibold text-slate-500 mb-1">Civil Registry Workspace</p>
          <h1 className="text-xl font-bold text-slate-800 mb-1">Dashboard</h1>
          <p className="text-sm text-slate-600">Choose a transaction type to start data entry.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <section
              key={cat.id}
              className={`group relative bg-[var(--card-bg)] rounded-2xl shadow-sm border border-slate-200/80 overflow-visible flex flex-col transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/30 ${CATEGORY_ACCENTS[cat.id]?.ring || ''}`}
            >
              <div className={`pointer-events-none absolute inset-x-0 top-0 h-20 rounded-t-2xl bg-gradient-to-br ${CATEGORY_ACCENTS[cat.id]?.soft || 'from-slate-50 to-slate-100'} opacity-80`} />
              <button
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className="relative text-left w-full p-5 border-b border-slate-100 shrink-0 rounded-t-2xl focus:bg-gray-50/50 focus:outline-none"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h2 className="font-semibold text-slate-800 text-base">{cat.title}</h2>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-2 py-1 text-[11px] font-semibold text-slate-600">
                    <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_ACCENTS[cat.id]?.dot || 'bg-slate-500'}`} />
                    Open
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{cat.meaning}</p>
              </button>
              <div className="p-4 pt-3 flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-[0.14em] cursor-default">
                  Available forms
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p className="text-xs text-slate-500">Click this card to browse and start forms.</p>
              </div>
              <div
                className="dashboard-card-total mt-4 mx-4 mb-4 p-4 rounded-xl border-2 flex items-center justify-center min-h-[4.5rem] shrink-0 bg-gradient-to-r from-[#e8f4f8] to-[#f1fbff] border-[#7ac3bc]"
                aria-label={`Total saved: ${totalCounts[cat.id]}`}
              >
                <span className="text-2xl font-extrabold text-[#0f766e] tabular-nums">Total: {totalCounts[cat.id]}</span>
              </div>
            </section>
          ))}
        </div>
      </div>

      <div
        className={`absolute inset-0 w-full p-6 bg-[var(--main-bg)] overflow-y-auto transition-transform duration-[550ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${showDetail ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
          }`}
        style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
        aria-hidden={!showDetail}
      >
        {selectedCategory && (
          <div className="max-w-3xl mx-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary-blue)] mb-6 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow focus:underline focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm mb-4">
              <h1 className="text-2xl font-bold text-slate-800 mb-2">{selectedCategory.title}</h1>
              <p className="text-base text-slate-700 leading-relaxed mb-2">{selectedCategory.meaning}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{selectedCategory.about}</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-[0.14em] mb-3">
              Files
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
              {selectedCategory.files.map((f) => (
                <Link
                  key={f.type}
                  to={f.to ?? { pathname: f.path, search: `?type=${f.type}` }}
                  onClick={() => setSelectedCategory(null)}
                  className="group block w-full px-4 py-3 rounded-xl text-left border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 focus:bg-gray-100 focus:outline-none"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-800 text-sm">{f.title}</p>
                    <span className="text-slate-400 transition-transform group-hover:translate-x-0.5">→</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{f.desc}</p>
                </Link>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="mt-6 px-5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg bg-white transition hover:-translate-y-0.5 hover:shadow focus:bg-gray-50 focus:outline-none"
            >
              Close
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
