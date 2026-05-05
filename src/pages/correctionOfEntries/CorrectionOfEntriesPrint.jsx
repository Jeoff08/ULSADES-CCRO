import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PAPER_SIZES, getPaperPageSpec } from '../../components/print'
import { saveCurrentViewAsPdf } from '../../lib/savePdf'
import ToastHost from '../../components/toast/ToastHost'
import { useToasts } from '../../components/toast/useToasts'
import { CORRECTION_COMPLETE_PACKET_ID, CORRECTION_PRINT_GROUPS } from './lib/correctionOfEntriesDefaults'
import { CORRECTION_PRINT_RENDERERS } from './print/printViews'
import { getCorrectionOfEntriesDraft } from './lib/correctionOfEntriesStorage'

function selectPrintView(id, setActiveId, setSearchParams) {
  setActiveId(id)
  setSearchParams({ view: id }, { replace: true })
}

const PRINT_SIZE_STYLE_ID = 'print-paper-size-correction-entries'

function useCorrectionPrintPageSize(paperId) {
  useEffect(() => {
    const spec = getPaperPageSpec(paperId)
    document.documentElement.dataset.paperSize = paperId
    let el = document.getElementById(PRINT_SIZE_STYLE_ID)
    if (!el) {
      el = document.createElement('style')
      el.id = PRINT_SIZE_STYLE_ID
      document.head.appendChild(el)
    }
    el.textContent = `@media print { @page { size: ${spec.size}; margin: 12mm; } }`
    return () => {
      delete document.documentElement.dataset.paperSize
    }
  }, [paperId])
}

export default function CorrectionOfEntriesPrint() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [paperSize, setPaperSize] = useState('short')
  const [activeId, setActiveId] = useState(() => {
    const v = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('view') : ''
    if (v && CORRECTION_PRINT_RENDERERS[v]) return v
    return CORRECTION_COMPLETE_PACKET_ID
  })
  const [data, setData] = useState(() => getCorrectionOfEntriesDraft())
  const { toasts, show, dismiss } = useToasts()

  useCorrectionPrintPageSize(paperSize)

  useEffect(() => {
    const v = searchParams.get('view')
    if (v && CORRECTION_PRINT_RENDERERS[v]) {
      setActiveId(v)
    }
  }, [searchParams])

  const refresh = useCallback(() => {
    setData(getCorrectionOfEntriesDraft())
  }, [])

  useEffect(() => {
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refresh])

  const ActiveView = useMemo(
    () =>
      CORRECTION_PRINT_RENDERERS[activeId] ||
      CORRECTION_PRINT_RENDERERS[CORRECTION_COMPLETE_PACKET_ID],
    [activeId]
  )

  const handleSavePdf = async () => {
    try {
      const baseName =
        activeId === CORRECTION_COMPLETE_PACKET_ID
          ? 'CorrectionOfEntries-Complete-All-Outputs'
          : `CorrectionOfEntries-${activeId}`
      const result = await saveCurrentViewAsPdf(baseName)
      if (result?.ok) {
        show({ type: 'success', title: 'PDF saved', message: result.filePath || '' })
        return
      }
      if (result?.cancelled) {
        show({ type: 'info', title: 'Cancelled', message: 'No file saved.' })
        return
      }
      show({ type: 'error', title: 'Save failed', message: result?.reason || 'Unable to save.' })
    } catch (e) {
      show({ type: 'error', title: 'Save failed', message: e?.message || 'Error' })
    }
  }

  return (
    <div className="min-h-full bg-[var(--main-bg)]">
      <div className="no-print max-w-6xl mx-auto p-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white/90 sticky top-0 z-10">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/correction-of-entries" className="text-sm font-medium text-[var(--primary-blue)] hover:underline">
            ← Back to form
          </Link>
          <span className="text-xs text-gray-500 max-w-[min(28rem,40vw)] hidden sm:inline">
            All previews use the same saved form data (single entry point).
          </span>
          <label className="text-xs text-gray-600 flex items-center gap-2">
            Paper
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white"
            >
              {PAPER_SIZES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={handleSavePdf}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black"
          >
            Print / Save as PDF
          </button>
          <button type="button" onClick={refresh} className="text-xs text-gray-600 underline">
            Reload data
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-4 p-4 print:p-0 print:max-w-none print:block">
        <aside className="no-print w-full lg:w-64 shrink-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm print:hidden">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Outputs</p>
          <nav className="space-y-3 text-sm">
            {CORRECTION_PRINT_GROUPS.map((group) => (
              <div key={group.id}>
                <p className="font-semibold text-gray-800 text-[13px] mb-1.5 px-1">{group.label}</p>
                <ul className="space-y-0.5 pl-2 border-l-2 border-[#0d9488]/40 ml-1">
                  {group.children.map((child) => (
                    <li key={child.id}>
                      <button
                        type="button"
                        onClick={() => selectPrintView(child.id, setActiveId, setSearchParams)}
                        className={`w-full text-left px-2 py-1.5 rounded-md text-[12px] leading-snug transition ${
                          activeId === child.id
                            ? 'bg-[#0d9488]/15 text-[#0f766e] font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {child.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0 print:w-full print:max-w-none">
          <div
            className="correction-print-surface bg-gray-100/80 rounded-xl p-4 print:p-0 print:bg-white print:rounded-none"
            data-active-print={activeId}
          >
            <div className="bg-white shadow-sm rounded-lg overflow-hidden print:shadow-none print:rounded-none">
              <ActiveView data={data} />
            </div>
          </div>
        </div>
      </div>

      <ToastHost toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
