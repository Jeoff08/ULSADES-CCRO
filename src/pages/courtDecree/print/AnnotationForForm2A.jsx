import React, { useState, useEffect, useRef } from 'react'
import { formatDateCert } from '../../../lib/printUtils'
import { ensureImageDataUrl } from '../../../lib/colbUtils'
import { exportColbAsPdf } from '../../../lib/colbExportPdf'
import { useCourtDecreeColbRemarksDetection } from '../../../hooks/useCourtDecreeColbRemarksDetection'
import { FORM_102_REMARKS_OVERLAY, FORM_102_OVERLAY_MAX_BOTTOM } from '../../../lib/courtDecreeColbRemarksDetection'
import { DocumentHeader, DocumentFooter } from '../../../components/print'

const MAX_FILE_SIZE_MB = 25

const FALLBACK_REMARKS = 'Pursuant to the decision of the Court dated … Certificate of Death is hereby corrected and changed the following entries:'

/**
 * ANNOTATION FOR FORM 2A – court decree (Certificate of Death).
 * When a scan of the Certificate of Death (LCR Form 2A) is attached, the REMARKS/ANNOTATIONS area
 * is filled with the same remarks as LcrForm2ADeathAvailable (data.remarks), positioned via OCR or Form 102 fallback.
 * Layout: light gray box, justified, italic, 12px.
 */
export default function AnnotationForForm2A({ paperSize = 'a4', data, onAttachmentChange }) {
  const hasScan = Boolean(data?.annotationForm2AScanDataUrl)
  const [displayImageUrl, setDisplayImageUrl] = useState(null)

  useEffect(() => {
    if (!data?.annotationForm2AScanDataUrl) {
      setDisplayImageUrl(null)
      return
    }
    if (data.annotationForm2AScanDataUrl.startsWith('data:image/')) {
      setDisplayImageUrl(data.annotationForm2AScanDataUrl)
      return
    }
    if (data.annotationForm2AScanDataUrl.startsWith('data:application/pdf')) {
      ensureImageDataUrl(data.annotationForm2AScanDataUrl).then(setDisplayImageUrl).catch(() => setDisplayImageUrl(null))
      return
    }
    setDisplayImageUrl(null)
  }, [data?.annotationForm2AScanDataUrl])

  const { overlayRect, isAnalyzing, detectionFailed } = useCourtDecreeColbRemarksDetection(displayImageUrl || null)
  const rawRect = detectionFailed ? FORM_102_REMARKS_OVERLAY : overlayRect
  const effectiveRect = (() => {
    const top = rawRect.top ?? 0
    const height = rawRect.height ?? 0.16
    const maxBottom = FORM_102_OVERLAY_MAX_BOTTOM
    const bottom = top + height
    const clampedHeight = bottom <= maxBottom ? height : Math.max(0.08, maxBottom - top)
    return { ...rawRect, top, height: clampedHeight }
  })()

  const remarks = (data?.remarks || '').trim() || FALLBACK_REMARKS

  const issuedDate = formatDateCert(data?.certificateIssuanceDate) || formatDateCert(new Date())
  const signatory = (data?.cityCivilRegistrarName || 'YUSSIF DON JUSTIN F. MARTIL').toUpperCase()

  const colbExportRef = useRef(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadList, setUploadList] = useState([])
  const fileInputRef = useRef(null)
  const [imgAspectRatio, setImgAspectRatio] = useState(null)

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target
    if (naturalWidth && naturalHeight) setImgAspectRatio(naturalWidth / naturalHeight)
  }
  useEffect(() => {
    setImgAspectRatio(null)
  }, [data?.annotationForm2AScanDataUrl])

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
  const [attaching, setAttaching] = useState(false)

  const handleAttachAndClose = async () => {
    if (!completedFile?.dataUrl) return
    setAttaching(true)
    try {
      const imageDataUrl = await ensureImageDataUrl(completedFile.dataUrl)
      onAttachmentChange?.(imageDataUrl)
      setUploadList([])
      setShowUploadModal(false)
    } catch (err) {
      console.warn('Failed to process file:', err)
      setUploadList((prev) => prev.map((i) => (i.id === completedFile.id ? { ...i, error: 'Failed to process file' } : i)))
    } finally {
      setAttaching(false)
    }
  }

  const handleCloseModal = () => {
    setUploadList([])
    setShowUploadModal(false)
  }

  const isPdf = (name) => /\.pdf$/i.test(name || '')

  const wrapperClass = [
    'ausf-doc print-doc print-doc-cert-auth bg-white text-black text-base max-w-[210mm] mx-auto px-6 py-4 leading-relaxed flex flex-col min-h-[297mm]',
    'colb-annotation-form-2a',
    'court-decree-annotation-form-2a',
    hasScan ? 'annotation-form-2a-print-attachment-only' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapperClass} data-paper-size={paperSize}>
      <DocumentHeader registryNo={data?.registryNumber} />

      <div className="print-doc-body flex flex-col flex-1 min-h-0">
        <h2 className="text-center font-bold text-[30px] uppercase mb-6 tracking-tight print:hidden">ANNOTATION FOR FORM 2A</h2>

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
              <path fillRule="evenodd" d="M3 17a1 0 011-1h12a1 0 110 2H4a1 0 01-1-1zM6.293 6.707a1 0 010-1.414l3-3a1 0 011.414 0l3 3a1 0 01-1.414 1.414L11 5.414V13a1 0 11-2 0V5.414L7.707 6.707a1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Upload and attach file
          </button>
          {hasScan && displayImageUrl && (
            <button
              type="button"
              onClick={() => exportColbAsPdf(colbExportRef.current, `Annotation-Form2A-${Date.now()}.pdf`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 0 011-1h12a1 0 110 2H4a1 0 01-1-1zm3.293-7.707a1 0 011.414 0L9 10.586V3a1 0 112 0v7.586l1.293-1.293a1 0 111.414 1.414l-3 3a1 0 01-1.414 0l-3-3a1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export as PDF
            </button>
          )}
          {hasScan && (
            <button
              type="button"
              onClick={() => onAttachmentChange?.('')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-red-600 text-red-700 bg-red-50 hover:bg-red-100 text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 0 00-.894.553L7.382 4H4a1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 0 012 0v6a1 0 0 11-2 0V8zm5-1a1 0 00-1 1v6a1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Remove
            </button>
          )}
        </div>

        {!hasScan && (
          <div className="mb-4 print:hidden">
            <div className="border border-amber-200 bg-amber-50 mb-4 p-3 rounded no-print">
              <p className="text-sm text-amber-800 font-medium">Attach scan copy of Certificate of Death (Form 2A) using the button above</p>
              <p className="text-xs text-gray-600 mt-0.5">The REMARKS/ANNOTATIONS section will show the annotation when printed.</p>
            </div>
            <p className="font-bold text-base mt-4 mb-1">REMARKS/ANNOTATIONS (For LCRO/OCRG Use Only)</p>
            <div className="border border-black bg-white min-h-[5rem] p-4 flex items-center justify-center text-center">
              <p className="text-sm leading-relaxed">{remarks}</p>
            </div>
          </div>
        )}

        {hasScan && displayImageUrl ? (
          <div className="colb-print-area relative mb-4">
            <p className="text-xs font-medium text-gray-600 mb-1 print:hidden">Attached Form 2A (Certificate of Death)</p>
            <div
              ref={colbExportRef}
              className="relative w-full max-h-[600px] print:max-h-[275mm] mx-auto overflow-visible colb-certificate-container colb-form2a-full-height"
              style={{
                ...(imgAspectRatio != null ? { aspectRatio: imgAspectRatio } : {}),
                '--colb-overlay-left': `${effectiveRect.left * 100}%`,
                '--colb-overlay-top': `${effectiveRect.top * 100}%`,
                '--colb-overlay-width': `${effectiveRect.width * 100}%`,
                '--colb-overlay-height': `${effectiveRect.height * 100}%`,
              }}
            >
              {isAnalyzing && (
                <div className="colb-analyzing-overlay print:hidden" aria-live="polite">
                  <span className="colb-analyzing-text">Analyzing document…</span>
                </div>
              )}
              <img
                src={displayImageUrl}
                alt="Form 2A Certificate of Death"
                className="w-full h-full object-contain object-top print:w-full print:h-full"
                onLoad={handleImageLoad}
              />
              <div
                className="colb-annotation-overlay colb-annotation-overlay-remarks colb-annotation-overlay-dynamic"
                aria-label="REMARKS/ANNOTATIONS (For LCRO/OCRG Use Only)"
                style={{
                  position: 'absolute',
                  left: 'var(--colb-overlay-left)',
                  top: 'var(--colb-overlay-top)',
                  width: 'var(--colb-overlay-width)',
                  height: 'var(--colb-overlay-height)',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                <div className="colb-annotation-remarks-body">
                  <p className="colb-annotation-form2a-text colb-annotation-remarks-text text-center">
                    {remarks}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : hasScan && !displayImageUrl ? (
          <div className="p-4 text-sm text-gray-500 colb-loading-placeholder">
            {data?.annotationForm2AScanDataUrl?.startsWith('data:application/pdf') ? 'Converting PDF…' : 'Loading image…'}
          </div>
        ) : null}
      </div>

      <div className="print-doc-footer-wrap mt-auto pt-6 flex flex-col items-end flex-shrink-0">
        <div className="flex flex-col items-end text-right mb-8 w-full max-w-md">
          <p className="font-bold uppercase">{signatory}</p>
          <p className="text-base italic">City Civil Registrar</p>
        </div>
        <div className="w-full">
          <DocumentFooter contactPhone={data?.contactPhone} contactEmail={data?.contactEmail} />
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 print:hidden" role="dialog" aria-modal="true" aria-labelledby="upload-modal-title-2a">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between px-6 pt-6 pb-2">
              <div>
                <h3 id="upload-modal-title-2a" className="text-lg font-bold text-gray-900">Upload File</h3>
                <p className="text-sm text-gray-500 mt-0.5">Attach a scan of the Certificate of Death (Form 2A). Image or PDF (max {MAX_FILE_SIZE_MB} MB).</p>
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
                disabled={!completedFile?.dataUrl || attaching}
                className="px-4 py-2 rounded-lg bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium"
              >
                {attaching ? 'Attaching…' : 'Attach file'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
