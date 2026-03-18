import React from 'react'
import { useParams, Link } from 'react-router-dom'

const TITLES = {
  'correction-of-entries': 'Correction of entries',
  adoption: 'Adoption',
  'nullity-of-marriage': 'Nullity of marriage',
  divorce: 'Divorce',
}

export default function CourtDecreeWorkflowPage() {
  const { slug } = useParams()
  const title = TITLES[slug] || 'Court Decree'

  return (
    <div className="max-w-2xl mx-auto p-8">
      <p className="text-sm text-gray-500 mb-2">
        <Link to="/" className="text-[var(--primary-blue)] hover:underline">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <Link to="/court-decree/form?type=cert-authenticity" className="text-[var(--primary-blue)] hover:underline">
          Court Decree
        </Link>
        <span className="mx-2">/</span>
        <span>{title}</span>
      </p>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>
      <p className="text-gray-600 leading-relaxed">
        This Court Decree workflow is not yet connected in ULSADES. When forms are ready, they will open from this menu. For existing certificates and LCR forms, use{' '}
        <Link to="/court-decree/form?type=cert-authenticity" className="text-[var(--primary-blue)] font-medium hover:underline">
          Court decree forms
        </Link>
        .
      </p>
    </div>
  )
}
