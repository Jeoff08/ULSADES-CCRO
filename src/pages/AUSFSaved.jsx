import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSavedAUSFList, loadSavedAUSFToDraft, deleteSavedAUSF } from '../lib/ausfStorage'

const FORM_TYPE_LABELS = {
  'ausf-0-6': 'AUSF 0-6',
  'ausf-07-17': 'AUSF 07-17',
  'reg-ausf': 'Registration of AUSF',
  'reg-ack': 'Registration of Acknowledgement',
  'child-ack': 'Child Acknowledge',
  'child-ack-lcr': 'LCR Form 1A (Birth-Available)',
  'child-ack-annotation': 'Annotation',
  'child-not-ack': 'Child Not Acknowledged',
  'child-not-ack-lcr': 'LCR Form A1 (Child Not Acknowledged)',
  'child-not-ack-annotation': 'Annotation (Child Not Acknowledged)',
  'child-not-ack-transmittal': 'Transmittal (Child Not Acknowledged)',
  'out-of-town': 'Out-of-Town Transmittal',
}

function formatSavedAt(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-PH', { dateStyle: 'medium' }) + ' ' + d.toLocaleTimeString('en-PH', { timeStyle: 'short' })
  } catch {
    return iso
  }
}

export default function AUSFSaved() {
  const [list, setList] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    setList(getSavedAUSFList())
  }, [])

  const handleViewPrint = (id) => {
    if (loadSavedAUSFToDraft(id)) navigate('/ausf/print')
  }

  const handleDelete = (id) => {
    if (window.confirm('Remove this saved AUSF file?')) {
      deleteSavedAUSF(id)
      setList(getSavedAUSFList())
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-base font-bold text-gray-800 mb-1">Saved AUSF Files</h1>
      <p className="text-sm text-gray-500 mb-4">
        AUSF forms saved when you click Done appear here. Start a new form or open a saved file to view and print.
      </p>
      <div className="flex flex-wrap gap-3 mb-6">
        <Link
          to="/ausf?type=ausf"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-blue)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-blue-light)] transition"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          New AUSF
        </Link>
      </div>
      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500 text-center">
          No saved AUSF files yet. Complete a form and click Done to save it here.
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-gray-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-800 truncate">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {FORM_TYPE_LABELS[item.formType] || item.formType} · {formatSavedAt(item.savedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleViewPrint(item.id)}
                  className="px-3 py-1.5 bg-[var(--primary-blue)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-blue-light)] transition"
                >
                  View &amp; Print
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
