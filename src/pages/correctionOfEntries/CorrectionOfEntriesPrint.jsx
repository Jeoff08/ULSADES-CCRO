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
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewPdfUrl, setPreviewPdfUrl] = useState('')
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

  const handlePreviewPdfModal = async () => {
    try {
      const bridge = window?.electronAPI
      if (!bridge || typeof bridge.previewPdfData !== 'function') {
        show({ type: 'error', title: 'Preview unavailable', message: 'PDF preview bridge is unavailable.' })
        return
      }
      const result = await bridge.previewPdfData()
      if (!result?.ok || !result?.base64) {
        show({ type: 'error', title: 'Preview failed', message: result?.reason || 'Unable to generate PDF preview.' })
        return
      }

      const binary = atob(result.base64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl)
      setPreviewPdfUrl(url)
      setPreviewModalOpen(true)
    } catch (err) {
      show({ type: 'error', title: 'Preview failed', message: err?.message || 'Unable to generate PDF preview.' })
    }
  }

  const closePreviewModal = () => {
    setPreviewModalOpen(false)
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl)
      setPreviewPdfUrl('')
    }
  }

  useEffect(() => () => {
    if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl)
  }, [previewPdfUrl])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Redesigned Header to match Court Decree Reference */}
      <div className="no-print p-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold text-gray-800">Correction of Entries – Print</h1>
          <Link
            to="/correction-of-entries"
            className="px-3 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Files Saved
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="paper-size-select">Paper size</label>
          <select
            id="paper-size-select"
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {PAPER_SIZES.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSavePdf}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-shadow shadow-sm active:scale-95"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handlePreviewPdfModal}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-shadow shadow-sm active:scale-95"
          >
            Preview PDF
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 p-6 print:p-0 print:block w-full">
        <aside className="no-print w-64 shrink-0 flex flex-col gap-5 sticky top-6 h-fit">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest border-b border-gray-200 pb-2">View &amp; Print</h2>
          <p className="text-xs text-gray-500 leading-snug -mt-2">
            LCR and annotation options are limited to the civil document forms you filled out.
          </p>
          <div className="flex flex-col gap-4">
            {CORRECTION_PRINT_GROUPS.map((group) => (
              <div key={group.id} className="flex flex-col gap-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">
                  {group.label}
                </p>
                <div className="flex flex-col gap-2 pl-1">
                  {group.children.map((child) => {
                    const isSelected = activeId === child.id
                    const btnClass = [
                      'text-left px-3 py-3 text-[10px] font-bold transition rounded-lg uppercase tracking-tight relative',
                      isSelected 
                        ? 'bg-[#1a2e4c] text-white shadow-md ring-2 ring-[#0f172a]' 
                        : 'bg-[#2b4b7c] text-white hover:bg-[#1e3a8a]',
                    ].join(' ')
                    
                    return (
                      <div key={child.id} className="relative group/item">
                        <button
                          type="button"
                          onClick={() => selectPrintView(child.id, setActiveId, setSearchParams)}
                          className={btnClass + ' w-full'}
                        >
                          {child.label}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex-1 min-w-0 print:w-full print:max-w-none">
          <div
            className="correction-print-surface bg-gray-100/80 rounded-xl p-4 print:p-0 print:bg-white print:rounded-none min-h-[1123px] flex flex-col"
            data-active-print={activeId}
          >
            <div className="bg-white shadow-sm rounded-lg overflow-hidden print:shadow-none print:rounded-none flex-1">
              <ActiveView data={data} />
            </div>
          </div>
        </div>
      </div>

      {previewModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 no-print" role="dialog" aria-modal="true" aria-label="PDF preview">
          <div className="bg-white rounded-2xl w-[95vw] h-[92vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">PDF preview</h3>
              </div>
              <button
                type="button"
                onClick={closePreviewModal}
                className="px-5 py-1.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-white hover:border-gray-300 transition-all shadow-sm active:scale-95 bg-white"
              >
                Close
              </button>
            </div>
            <iframe title="PDF preview" src={previewPdfUrl} className="w-full flex-1 border-0" />
          </div>
        </div>
      )}
      <ToastHost toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
