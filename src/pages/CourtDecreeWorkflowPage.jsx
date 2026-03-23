import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { defaultCourtDecree } from './courtDecree/lib/courtDecreeDefaults'
import { getCourtDecreeDraft, saveCourtDecreeDraft } from './courtDecree/lib/courtDecreeStorage'
import { MARRIAGE_ANNOTATION_MODES as MODES } from './courtDecree/lib/marriageAnnotationMode'
import MarriageNullityArt42Annotation from './courtDecree/print/MarriageNullityArt42Annotation'
import MarriageAnnotationModeSidebar from './courtDecree/print/MarriageAnnotationModeSidebar'
import StandardAnnotationWithInstructions from './courtDecree/print/StandardAnnotationWithInstructions'
import { PAPER_SIZES } from '../components/print'

const TITLES = {
  'correction-of-entries': 'Correction of entries',
  adoption: 'Adoption',
  'nullity-of-marriage': 'Nullity of marriage',
  divorce: 'Divorce',
}

const PRINT_SIZE_STYLE_ID = 'print-paper-size-marriage-workflow'

function useWorkflowPrintSize(paperId) {
  useEffect(() => {
    const spec = PAPER_SIZES.find((p) => p.id === paperId) || PAPER_SIZES[0]
    document.documentElement.dataset.paperSize = paperId
    let el = document.getElementById(PRINT_SIZE_STYLE_ID)
    if (!el) {
      el = document.createElement('style')
      el.id = PRINT_SIZE_STYLE_ID
      document.head.appendChild(el)
    }
    el.textContent = `@media print { @page { size: ${spec.size}; } }`
    return () => {
      delete document.documentElement.dataset.paperSize
    }
  }, [paperId])
}

/** Merges stored court decree draft with defaults; forces marriage annotation mode per workflow route. */
function mergeMarriageWorkflowDraft(mode) {
  const stored = getCourtDecreeDraft()
  return {
    ...defaultCourtDecree,
    ...(stored && typeof stored === 'object' ? stored : {}),
    affectedDocument: 'MARRIAGE_CERTIFICATE',
    marriageAnnotationMode: mode,
  }
}

function NullityOfMarriageWorkflow() {
  const [data, setData] = useState(() => mergeMarriageWorkflowDraft(MODES.nullity))
  const [paperSize, setPaperSize] = useState('a4')

  useWorkflowPrintSize(paperSize)

  useEffect(() => {
    setData(mergeMarriageWorkflowDraft(MODES.nullity))
  }, [])

  const persist = (patch) => {
    setData((prev) => {
      const next = { ...prev, ...patch }
      try {
        saveCourtDecreeDraft(next)
      } catch (_) {}
      return next
    })
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 print:p-0">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50/80 p-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="marriage-workflow-paper-nullity">Paper size</label>
          <select
            id="marriage-workflow-paper-nullity"
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            {PAPER_SIZES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900"
          >
            Print / Save as PDF
          </button>
        </div>
        <Link
          to="/court-decree/print?type=marriage-nullity-art42"
          className="text-sm text-[var(--primary-blue)] hover:underline font-medium"
        >
          Open same view on Print page →
        </Link>
      </div>

      <div className="no-print flex flex-col sm:flex-row gap-4 items-start print:block">
        <aside className="w-full sm:w-56 shrink-0 print:hidden">
          <MarriageAnnotationModeSidebar
            data={data}
            allowedModes={[MODES.nullity, MODES.art42]}
            onModeChange={(m) => persist({ marriageAnnotationMode: m })}
          />
        </aside>
        <div className="flex-1 min-w-0 w-full print:w-full">
          <MarriageNullityArt42Annotation
            hideOutputTypeSelector
            data={data}
            onAttachmentChange={(url) => {
              persist({ marriageNullityScanDataUrl: url ?? '' })
            }}
            onModeChange={(m) => {
              persist({ marriageAnnotationMode: m })
            }}
          />
        </div>
      </div>
    </div>
  )
}

function DivorceWorkflow() {
  const [data, setData] = useState(() => mergeMarriageWorkflowDraft(MODES.divorce))
  const [paperSize, setPaperSize] = useState('a4')

  useWorkflowPrintSize(paperSize)

  useEffect(() => {
    setData(mergeMarriageWorkflowDraft(MODES.divorce))
  }, [])

  const persist = (patch) => {
    setData((prev) => {
      const next = { ...prev, ...patch }
      try {
        saveCourtDecreeDraft(next)
      } catch (_) {}
      return next
    })
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 print:p-0">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50/80 p-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="marriage-workflow-paper-divorce">Paper size</label>
          <select
            id="marriage-workflow-paper-divorce"
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            {PAPER_SIZES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900"
          >
            Print / Save as PDF
          </button>
        </div>
        <Link
          to="/court-decree/print?type=marriage-nullity-art42"
          className="text-sm text-[var(--primary-blue)] hover:underline font-medium"
        >
          Open same view on Print page →
        </Link>
      </div>

      <div className="no-print flex flex-col sm:flex-row gap-4 items-start print:block">
        <aside className="w-full sm:w-56 shrink-0 print:hidden">
          <MarriageAnnotationModeSidebar
            data={data}
            allowedModes={[MODES.divorce]}
            onModeChange={(m) => persist({ marriageAnnotationMode: m })}
          />
        </aside>
        <div className="flex-1 min-w-0 w-full print:w-full">
          <MarriageNullityArt42Annotation
            hideOutputTypeSelector
            data={data}
            onAttachmentChange={(url) => {
              persist({ marriageNullityScanDataUrl: url ?? '' })
            }}
            onModeChange={(m) => {
              persist({ marriageAnnotationMode: m })
            }}
          />
        </div>
      </div>
    </div>
  )
}

function AdoptionWorkflow() {
  return (
    <div className="w-full min-h-full">
      <StandardAnnotationWithInstructions />
    </div>
  )
}

export default function CourtDecreeWorkflowPage() {
  const { slug } = useParams()
  const title = TITLES[slug] || 'Court Decree'

  if (slug === 'nullity-of-marriage') {
    return <NullityOfMarriageWorkflow />
  }

  if (slug === 'divorce') {
    return <DivorceWorkflow />
  }

  if (slug === 'adoption') {
    return <AdoptionWorkflow />
  }

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
