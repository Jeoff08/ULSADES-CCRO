import React from 'react'
import { useParams, Link } from 'react-router-dom'

const TITLES = {
  negative: 'Negative',
  'clear-copy-blurred': 'Clear Copy / Blurred Copy',
  'mc2010-04': 'MC2010-04',
  supplemental: 'Supplemental',
}

export default function LegalInstrumentPage() {
  const { slug } = useParams()
  const title = TITLES[slug] || 'Legal Instrument'

  return (
    <div className="max-w-2xl mx-auto p-8">
      <p className="text-sm text-gray-500 mb-2">
        <Link to="/" className="text-[var(--primary-blue)] hover:underline">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <span>Legal Instrument</span>
      </p>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>
      <p className="text-gray-600 leading-relaxed">
        This legal instrument workflow is not yet connected in ULSADES. Use the sidebar when forms are available, or contact the system administrator.
      </p>
    </div>
  )
}
