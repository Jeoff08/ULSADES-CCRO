import React, { useState, useRef } from 'react'
import { buildDefaultAnnotationText } from '../../../lib/printUtils'
import { DocumentFooter } from '../../../components/print'

const MAX_FILE_SIZE_MB = 25

/**
 * Annotation (Child Not Ack): same as AnnotationChildAck — file must be attached.
 * Output format: "Acknowledged by [Name] on [DATE] under Registry Number [No]. The child shall be known as [CHILD NAME] pursuant to R.A. 9255"
 */
export default function AnnotationChildNotAck({ data, onColbScanChange, onAnnotationChange }) {
  const hasScan = Boolean(data.colbScanDataUrl)
  const defaultAnnotation = buildDefaultAnnotationText(data)
  const annotationText = data.annotationChildAckText || defaultAnnotation

  // Render annotation in two lines (break after " under ") with "known as [NAME]" bold+underline
  const renderAnnotationContent = () => {
    const text = annotationText || '—'
    const pursuantIdx = text.toLowerCase().indexOf('pursuant')
    if (pursuantIdx <= 0) {
      const match = text.match(/known as\s+(.+?)\s+pursuant/i)
      if (match) {
        const before = text.slice(0, text.indexOf(match[1]))
        const name = match[1]
        const after = text.slice(text.indexOf(match[1]) + name.length)
        return <>{before}<strong style={{ textDecoration: 'underline' }}>{name}</strong>{after}</>
      }
      return text
    }
    const mainPart = text.slice(0, pursuantIdx).trim()
    const pursuantPart = text.slice(pursuantIdx).replace(/["\s]+$/g, '').trim()
    const underIdx = mainPart.indexOf(' under ')
    const firstLine = underIdx >= 0 ? mainPart.slice(0, underIdx + 7) : mainPart
    const secondLineContent = underIdx >= 0 ? mainPart.slice(underIdx + 7) : ''
    const nameMatch = secondLineContent.match(/known as\s+(.+?)\s*$/i) || mainPart.match(/known as\s+(.+?)\s*$/i) || text.match(/known as\s+(.+?)\s+pursuant/i)
    const name = nameMatch ? nameMatch[1].trim() : ''
    const knownAsIdx = secondLineContent.toLowerCase().indexOf('known as')
    const secondBeforeName = knownAsIdx >= 0 ? secondLineContent.slice(0, knownAsIdx + 9) : secondLineContent
    const secondAfterName = name && knownAsIdx >= 0 ? secondLineContent.slice(knownAsIdx + 9 + name.length) : ''
    return (
      <span className="inline-block">
        <span>{firstLine}</span>
        <br />
        <span>{secondBeforeName}</span>
        {name ? <strong style={{ textDecoration: 'underline' }}>{name}</strong> : null}
        <span>{secondAfterName}</span>
        <br />
        <span>{pursuantPart}</span>
      </span>
    )
  }

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadList, setUploadList] = useState([])
  const fileInputRef = useRef(null)

  const handleFileSelect = (file) => {
    if (!file) return
    const tooLarge = file.size > MAX_FILE_SIZE_MB * 1024 * 1024
    const invalidType = !/^(image\/|application\/pdf)/.test(file.type)
    const id = `${file.name}-${Date.now()}`
    if (tooLarge) {
      setUploadList((prev) => [...prev.filter((i) => i.id !== id), { id, name: file.name, size: file.size, progress: 0, error: 'File size is too large' }])
      return
    }
    if (invalidType) {
      setUploadList((prev) => [...prev.filter((i) => i.id !== id), { id, name: file.name, size: file.size, progress: 0, error: 'Image or PDF only' }])
      return
    }
    setUploadList((prev) => [...prev, { id, file, name: file.name, size: file.size, progress: 0 }])
    const steps = 8
    let step = 0
    const interval = setInterval(() => {
      step += 1
      setUploadList((prev) => prev.map((i) => (i.id === id ? { ...i, progress: Math.min((step / steps) * 100, 99) } : i)))
      if (step >= steps) {
        clearInterval(interval)
        const reader = new FileReader()
        reader.onload = () => {
          setUploadList((prev) => prev.map((i) => (i.id === id ? { ...i, progress: 100, dataUrl: reader.result } : i)))
        }
        reader.onerror = () => {
          setUploadList((prev) => prev.map((i) => (i.id === id ? { ...i, error: 'Failed to read file' } : i)))
        }
        reader.readAsDataURL(file)
      }
    }, 80)
  }

  const handleInputChange = (e) => {
    const file = e.target?.files?.[0]
    handleFileSelect(file)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0]
    if (file) handleFileSelect(file)
  }
  const handleDragOver = (e) => e.preventDefault()

  const cancelUpload = (id) => setUploadList((prev) => prev.filter((i) => i.id !== id))

  const completedFile = uploadList.find((i) => i.dataUrl)

  const handleAttachAndClose = () => {
    if (!completedFile?.dataUrl) return
    onColbScanChange?.(completedFile.dataUrl)
    setUploadList([])
    setShowUploadModal(false)
  }

  const handleCloseModal = () => {
    setUploadList([])
    setShowUploadModal(false)
  }

  const isPdf = (name) => /\.pdf$/i.test(name || '')

  return (
    <div className={`ausf-doc print-doc colb-annotation-ack bg-white text-black text-sm max-w-[210mm] mx-auto flex flex-col relative ${hasScan ? 'px-4 py-3 print:px-0 print:py-0 print:max-w-none' : 'px-4 py-3'}`}>
      <h2 className="text-base font-bold uppercase mb-3 text-center print:hidden">Annotation (Child Not Ack) — COLB Office File</h2>

      <div className="no-print mb-4 flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={handleInputChange}
        />
        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          Upload and attach file
        </button>
        {hasScan && (
          <button
            type="button"
            onClick={() => onColbScanChange?.('')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-red-600 text-red-700 bg-red-50 hover:bg-red-100 text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Remove
          </button>
        )}
      </div>

      {hasScan ? (
        <div className="colb-print-area relative mb-4">
          <p className="text-xs font-medium text-gray-600 mb-1 print:hidden">Attached file</p>
          <div className="relative border border-gray-300 rounded overflow-hidden print:border-0">
            {data.colbScanDataUrl.startsWith('data:image') ? (
              <>
                <img
                  src={data.colbScanDataUrl}
                  alt="COLB office file scan"
                  className="w-full max-h-[520px] object-contain object-top print:max-h-[270mm] print:w-full"
                />
                <div
                  className="colb-annotation-overlay colb-annotation-overlay-remarks"
                  aria-label="REMARKS/ANNOTATIONS (For LCRO/OCRG Use Only)"
                >
                  <p className="colb-annotation-remarks-label">REMARKS/ANNOTATIONS (For LCRO/OCRG Use Only)</p>
                  <div className="colb-annotation-remarks-body">
                    <p className="colb-annotation-remarks-text" style={{ fontSize: '15px', textAlign: 'left' }}>
                      {renderAnnotationContent()}
                    </p>
                  </div>
                </div>
              </>
            ) : data.colbScanDataUrl.startsWith('data:application/pdf') ? (
              <div className="relative">
                <iframe
                  src={data.colbScanDataUrl}
                  title="COLB office file scan"
                  className="w-full h-[520px] print:hidden"
                />
                <p className="print:block hidden p-4 text-sm">PDF attached. For printing with annotation overlay, please attach an image (PNG/JPG) of the COLB scan.</p>
              </div>
            ) : (
              <div className="p-4 text-sm text-gray-500">Attached file. <a href={data.colbScanDataUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Open in new tab</a> to view.</div>
            )}
          </div>
          <div className="no-print mt-3">
            <p className="font-medium text-sm mb-1">Edit annotation</p>
            <textarea
              value={annotationText}
              onChange={(e) => onAnnotationChange?.(e.target.value)}
              placeholder="Acknowledged by [Name] on MAY 7, 2025 under Registry Number 2025-0990. The child shall be known as [CHILD NAME] pursuant to R.A. 9255"
              className="w-full min-h-[5rem] p-3 border border-gray-300 rounded-lg text-sm font-sans"
              rows={4}
            />
          </div>
        </div>
      ) : (
        <div className="border border-amber-200 bg-amber-50 mb-4 p-3 rounded no-print">
          <p className="text-sm text-amber-800 font-medium">Attach scan copy of COLB office file using the button above</p>
          <p className="text-xs text-gray-600 mt-0.5">The annotation will show in the format: Acknowledged by [Name] on [DATE] under Registry Number [No]. The child shall be known as [CHILD NAME] pursuant to R.A. 9255</p>
        </div>
      )}

      {!hasScan && (
        <div className="print:hidden">
          <p className="font-medium text-sm mb-1">REMARKS/ANNOTATION (Child not acknowledged)</p>
          <div className="border border-black min-h-[5rem] p-4 bg-white">
            <p className="text-sm whitespace-pre-wrap text-justify">{renderAnnotationContent()}</p>
          </div>
        </div>
      )}

      <div className="mt-auto pt-4 shrink-0 print:hidden">
        <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="upload-modal-title-notack">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-start justify-between px-6 pt-6 pb-2">
              <div>
                <h3 id="upload-modal-title-notack" className="text-lg font-bold text-gray-900">Upload File</h3>
                <p className="text-sm text-gray-500 mt-0.5">Attach a scan copy of the COLB office file. Image or PDF (max {MAX_FILE_SIZE_MB} MB).</p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="flex-1 min-h-0 flex gap-6 px-6 pb-6 pt-2">
              <div
                className="flex-1 min-w-0 flex flex-col items-center justify-center border-2 border-dashed border-[#6366f1]/50 rounded-xl p-8 bg-[#6366f1]/5 cursor-pointer hover:border-[#6366f1] hover:bg-[#6366f1]/10 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-[#6366f1] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium text-gray-700 mb-1">Drag and drop file here</p>
                <p className="text-xs text-gray-500 mb-3">-OR-</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                  className="px-4 py-2 rounded-lg bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-medium"
                >
                  Browse Files
                </button>
              </div>

              <div className="w-56 shrink-0 flex flex-col">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Upload Files</h4>
                <div className="flex-1 min-h-0 overflow-auto space-y-2">
                  {uploadList.length === 0 ? (
                    <p className="text-xs text-gray-400">No files yet</p>
                  ) : (
                    uploadList.map((item) => (
                      <div key={item.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <div className="flex items-start gap-2">
                          <span className="shrink-0 w-8 h-8 rounded flex items-center justify-center bg-[#6366f1]/10 text-[#6366f1]">
                            {isPdf(item.name) ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.error || (item.dataUrl ? 'Completed' : `${Math.round(item.progress)}%`)}</p>
                            {!item.error && (
                              <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-[#6366f1] rounded-full transition-all duration-200" style={{ width: `${item.dataUrl ? 100 : item.progress}%` }} />
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => cancelUpload(item.id)}
                            className="shrink-0 text-xs font-medium text-gray-500 hover:text-red-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleAttachAndClose}
                disabled={!completedFile?.dataUrl}
                className="px-4 py-2 rounded-lg bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium"
              >
                Attach file
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
