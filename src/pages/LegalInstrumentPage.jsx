import React from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import SupplementalForm from './legalInstrument/SupplementalForm'
import Mc2010Form from './legalInstrument/Mc2010Form'
import LcrSearchAndPrint from './legalInstrument/LcrSearchAndPrint'

const TITLES = {
  supplemental: 'Supplemental',
  negative: 'Negative',
  'mc2010-04': 'MC2010-04',
  'negative-2': 'Negative',
  'clear-copy': 'Clear Copy',
}

export default function LegalInstrumentPage() {
  const { slug } = useParams()
  const title = TITLES[slug] || 'Legal Instrument'

  if (slug === 'wrongly-register') {
    return <Navigate to="/" replace />
  }

  if (slug === 'supplemental') {
    return <SupplementalForm />
  }

  if (slug === 'mc2010-04') {
    return <Mc2010Form />
  }

  // New flow for the other legal instruments
  if (TITLES[slug]) {
    return <LcrSearchAndPrint title={title} type={slug} />
  }

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
