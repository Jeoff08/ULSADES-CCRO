import React, { useState, useEffect, useRef } from 'react'
import { formatDateCert, parseDdMmYyyyToDate } from '../../../lib/printUtils'
import { ensureImageDataUrl } from '../../../lib/colbUtils'
import { DocumentHeader, DocumentFooter, PrintHeaderRow } from '../../../components/print'
import {
  MARRIAGE_ANNOTATION_MODES as MODES,
  resolveMarriageAnnotationMode,
} from '../lib/marriageAnnotationMode'

const MAX_FILE_SIZE_MB = 25

/**
 * Marriage certificate print: Nullity, Divorce, or Art. 42 termination. Optional scan upload.
 */
export default function MarriageNullityArt42Annotation({
  data,
  onAttachmentChange,
  onModeChange,
  /** When false, parent renders mode buttons in sidebar (Print / workflow). */
  hideOutputTypeSelector = false,
  hugPrintSidebar = false,
}) {
  const mode = resolveMarriageAnnotationMode(data?.marriageAnnotationMode)
  const hasScan = Boolean(data?.marriageNullityScanDataUrl)
  const [displayImageUrl, setDisplayImageUrl] = useState(null)

  useEffect(() => {
    const url = data?.marriageNullityScanDataUrl
    if (!url) {
      setDisplayImageUrl(null)
      return
    }
    if (String(url).startsWith('data:image/')) {
      setDisplayImageUrl(url)
      return
    }
    if (String(url).startsWith('data:application/pdf')) {
      ensureImageDataUrl(url).then(setDisplayImageUrl).catch(() => setDisplayImageUrl(null))
      return
    }
    setDisplayImageUrl(null)
  }, [data?.marriageNullityScanDataUrl])

  const husband = (data?.lcr3aHusbandName || '').trim() || '_______________'
  const wife = (data?.lcr3aWifeName || '').trim() || '_______________'
  const dateRaw = data?.lcr3aDateMarriage
  const p = parseDdMmYyyyToDate(dateRaw)
  const marriageDate = p ? formatDateCert(p.toISOString().slice(0, 10)) : formatDateCert(dateRaw) || '_______________'
  const place = (data?.lcr3aPlaceMarriage || '').trim() || '_______________'
  const registry =
    String(data?.lcr3aRegistryNumber || '').trim() ||
    String(data?.registryNumber || '').trim() ||
    '—'

  const art42Text = `The marriage entered into by ${husband} and ${wife} celebrated on ${marriageDate} in ${place} is hereby terminated pursuant to Article 42 of the Family Code of the Philippines.`

  const issuedDate = formatDateCert(data?.certificateIssuanceDate) || formatDateCert(new Date())
  const signatory = (data?.cityCivilRegistrarName || 'YUSSIF DON JUSTIN F. MARTIL').toUpperCase()

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadList, setUploadList] = useState([])
  const fileInputRef = useRef(null)
  const [attaching, setAttaching] = useState(false)

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

  const handleAttachAndClose = async () => {
    if (!completedFile?.dataUrl) return
    setAttaching(true)
    try {
      const imageDataUrl = await ensureImageDataUrl(completedFile.dataUrl)
      onAttachmentChange?.(imageDataUrl)
      setUploadList([])
      setShowUploadModal(false)
    } catch {
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

  const rootAlign = hugPrintSidebar
    ? 'max-w-[210mm] w-full ml-0 mr-auto pl-0 pr-4 sm:pr-6 print:mx-auto print:px-6'
    : 'max-w-[210mm] mx-auto px-6'

  return (
    <div
      className={`ausf-doc print-doc print-doc-cert-auth bg-white text-black text-base py-4 leading-relaxed flex flex-col min-h-[297mm] ${rootAlign}`}
    >
      <div className="no-print mb-4 space-y-3">
        {!hideOutputTypeSelector ? (
          <>
            <p className="text-sm font-medium text-gray-700">Output type</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onModeChange?.(MODES.nullity)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold border-2 transition ${
                  mode === MODES.nullity
                    ? 'bg-[#1e3a5f] text-white border-[#1e3a5f] ring-2 ring-offset-2 ring-[#1e3a5f]/40'
                    : 'bg-white text-gray-800 border-gray-300 hover:border-[#1e3a5f] hover:bg-gray-50'
                }`}
              >
                Annulment / Nullity
              </button>
              <button
                type="button"
                onClick={() => onModeChange?.(MODES.divorce)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold border-2 transition ${
                  mode === MODES.divorce
                    ? 'bg-[#1e3a5f] text-white border-[#1e3a5f] ring-2 ring-offset-2 ring-[#1e3a5f]/40'
                    : 'bg-white text-gray-800 border-gray-300 hover:border-[#1e3a5f] hover:bg-gray-50'
                }`}
              >
                Divorce
              </button>
              <button
                type="button"
                onClick={() => onModeChange?.(MODES.art42)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold border-2 transition text-left max-w-[280px] ${
                  mode === MODES.art42
                    ? 'bg-[#1e3a5f] text-white border-[#1e3a5f] ring-2 ring-offset-2 ring-[#1e3a5f]/40'
                    : 'bg-white text-gray-800 border-gray-300 hover:border-[#1e3a5f] hover:bg-gray-50'
                }`}
              >
                Termination (subsequent marriage) — Art. 42
              </button>
            </div>
          </>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 pt-1">
        <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleInputChange} />
        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-medium"
        >
          Upload certificate / decree scan
        </button>
        {hasScan && (
          <button
            type="button"
            onClick={() => onAttachmentChange?.('')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-red-600 text-red-700 bg-red-50 text-sm font-medium"
          >
            Remove attachment
          </button>
        )}
        </div>
      </div>

      {mode === MODES.nullity ? (
        <>
          <div className="print-doc-header mb-4">
            <PrintHeaderRow />
            <hr className="border-black border-t my-2" />
            <p className="text-center font-bold text-lg uppercase tracking-wide">Office of the City Civil Registrar</p>
            <h2 className="text-center font-bold text-[26px] uppercase mt-4 mb-2 tracking-tight">Certificate of Marriage</h2>
            <p className="text-center font-bold text-[18px] uppercase mb-1">Annulment / Declaration of Nullity</p>
            <p className="text-center text-[15px] mb-4">
              Marriage void from the beginning <span className="font-semibold">(Art. 35, 36, 37, 38 &amp; 53, Family Code)</span>
            </p>
            <div className="flex justify-end items-baseline gap-2 text-[19px] mb-2">
              <span>Registry No.</span>
              <span className="font-bold underline min-w-[6rem] text-center">{registry}</span>
            </div>
          </div>

          <div className="print-doc-body flex flex-col flex-1 min-h-0">
            <p className="text-sm text-gray-600 print:text-black mb-2 print:hidden">
              Fill husband, wife, and marriage details on the court decree form (LCR 3A section). Attach a scan of the certificate or court decree below.
            </p>
            {hasScan && displayImageUrl ? (
              <div className="mb-4 border border-black rounded overflow-hidden bg-gray-50">
                <p className="text-xs font-medium text-gray-600 p-2 print:hidden">Attached scan</p>
                <img src={displayImageUrl} alt="Marriage certificate or decree" className="w-full max-h-[520px] object-contain object-top print:max-h-none" />
              </div>
            ) : hasScan && !displayImageUrl ? (
              <p className="text-sm text-gray-500 py-8 text-center">Converting PDF…</p>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg min-h-[200px] flex items-center justify-center text-gray-500 text-sm print:hidden">
                No file attached — use Upload to add certificate or decree image/PDF
              </div>
            )}

            <div className="mt-4 text-justify text-[16px] leading-relaxed print:block">
              <p className="mb-2">
                <span className="font-bold">Parties:</span> {husband} and {wife}
              </p>
              <p className="mb-2">
                <span className="font-bold">Marriage:</span> {marriageDate} at {place}
              </p>
              {data?.caseTitle ? (
                <p className="mb-2">
                  <span className="font-bold">Case / reference:</span> {data.caseTitle}
                </p>
              ) : null}
            </div>
          </div>
        </>
      ) : mode === MODES.divorce ? (
        <>
          <div className="print-doc-header mb-4">
            <PrintHeaderRow />
            <hr className="border-black border-t my-2" />
            <p className="text-center font-bold text-lg uppercase tracking-wide">Office of the City Civil Registrar</p>
            <h2 className="text-center font-bold text-[26px] uppercase mt-4 mb-2 tracking-tight">Certificate of Marriage</h2>
            <p className="text-center font-bold text-[18px] uppercase mb-1">Divorce</p>
            <p className="text-center text-[15px] mb-4">
              Marriage dissolved / terminated <span className="font-semibold">(per final decree of the court)</span>
            </p>
            <div className="flex justify-end items-baseline gap-2 text-[19px] mb-2">
              <span>Registry No.</span>
              <span className="font-bold underline min-w-[6rem] text-center">{registry}</span>
            </div>
          </div>

          <div className="print-doc-body flex flex-col flex-1 min-h-0">
            <p className="text-sm text-gray-600 print:text-black mb-2 print:hidden">
              Fill husband, wife, and marriage details on the court decree form (LCR 3A section). Attach a scan of the decree or certificate below.
            </p>
            {hasScan && displayImageUrl ? (
              <div className="mb-4 border border-black rounded overflow-hidden bg-gray-50">
                <p className="text-xs font-medium text-gray-600 p-2 print:hidden">Attached scan</p>
                <img src={displayImageUrl} alt="Marriage certificate or decree" className="w-full max-h-[520px] object-contain object-top print:max-h-none" />
              </div>
            ) : hasScan && !displayImageUrl ? (
              <p className="text-sm text-gray-500 py-8 text-center">Converting PDF…</p>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg min-h-[200px] flex items-center justify-center text-gray-500 text-sm print:hidden">
                No file attached — use Upload to add certificate or decree image/PDF
              </div>
            )}

            <div className="mt-4 text-justify text-[16px] leading-relaxed print:block">
              <p className="mb-2">
                <span className="font-bold">Parties:</span> {husband} and {wife}
              </p>
              <p className="mb-2">
                <span className="font-bold">Marriage:</span> {marriageDate} at {place}
              </p>
              {data?.caseTitle ? (
                <p className="mb-2">
                  <span className="font-bold">Case / reference:</span> {data.caseTitle}
                </p>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <>
          <DocumentHeader registryNo={registry} />
          <div className="print-doc-body flex flex-col flex-1 min-h-0">
            <h2 className="text-center font-bold text-[22px] uppercase mb-4 print:hidden">Article 42 — Annotation (MC 2020-13)</h2>
            <div className="border border-black bg-gray-50 print:bg-white p-6 my-4 text-justify text-[17px] leading-[1.75]">
              <p className="font-semibold text-center mb-4 uppercase text-sm print:text-base text-gray-700 print:text-black">Suggested annotation on Certificate of Marriage</p>
              <p>&quot;{art42Text}&quot;</p>
            </div>
            {hasScan && displayImageUrl ? (
              <div className="mb-4 border border-gray-200 rounded overflow-hidden">
                <p className="text-xs text-gray-600 p-2 print:hidden">Attached reference (certificate / affidavit)</p>
                <img src={displayImageUrl} alt="Attachment" className="w-full max-h-[400px] object-contain object-top print:max-h-[240mm]" />
              </div>
            ) : hasScan && !displayImageUrl ? (
              <p className="text-sm text-gray-500 py-4">Converting PDF…</p>
            ) : null}
          </div>
        </>
      )}

      <div className="print-doc-footer-wrap mt-auto pt-6 flex flex-col items-end flex-shrink-0">
        <p className="w-full text-sm mb-2 print:text-center">Issued this <span className="font-bold underline">{issuedDate}</span> at Iligan City, Philippines.</p>
        <div className="flex flex-col items-end text-right mb-8 w-full max-w-md">
          <p className="font-bold uppercase">{signatory}</p>
          <p className="text-base italic">City Civil Registrar</p>
        </div>
        <div className="w-full">
          <DocumentFooter contactPhone={data?.contactPhone} contactEmail={data?.contactEmail} />
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 print:hidden" role="dialog" aria-modal="true" aria-labelledby="marriage-nullity-upload-title">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between px-6 pt-6 pb-2">
              <div>
                <h3 id="marriage-nullity-upload-title" className="text-lg font-bold text-gray-900">Upload file</h3>
                <p className="text-sm text-gray-500 mt-0.5">Certificate of marriage, court decree, or affidavit scan. Image or PDF (max {MAX_FILE_SIZE_MB} MB).</p>
              </div>
              <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1 rounded" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex-1 min-h-0 flex gap-6 px-6 pb-6 pt-2">
              <div
                className="flex-1 min-w-0 flex flex-col items-center justify-center border-2 border-dashed border-[#6366f1]/50 rounded-xl p-8 bg-[#6366f1]/5 cursor-pointer hover:border-[#6366f1]"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <p className="text-sm font-medium text-gray-700 mb-3">Drag and drop or browse</p>
                <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }} className="px-4 py-2 rounded-lg bg-[#4f46e5] text-white text-sm font-medium">
                  Browse files
                </button>
              </div>
              <div className="w-56 shrink-0 overflow-auto space-y-2">
                {uploadList.length === 0 ? (
                  <p className="text-xs text-gray-400">No files yet</p>
                ) : (
                  uploadList.map((item) => (
                    <div key={item.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 w-8 h-8 rounded flex items-center justify-center bg-[#6366f1]/10 text-[#6366f1]">
                          {isPdf(item.name) ? 'PDF' : 'IMG'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.error || (item.dataUrl ? 'Ready' : `${Math.round(item.progress)}%`)}</p>
                        </div>
                        <button type="button" onClick={() => cancelUpload(item.id)} className="text-xs text-gray-500 hover:text-red-600">Cancel</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-lg border border-gray-300 text-sm">Close</button>
              <button
                type="button"
                onClick={handleAttachAndClose}
                disabled={!completedFile?.dataUrl || attaching}
                className="px-4 py-2 rounded-lg bg-[#6366f1] text-white text-sm disabled:opacity-50"
              >
                {attaching ? 'Attaching…' : 'Attach'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
