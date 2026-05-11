import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getActiveWronglyRegisterId, getWronglyRegisterDraft } from './lib/wronglyRegisterSavedStorage'
import { PAPER_SIZES, getPaperPageSpec } from '../../components/print'
import { saveCurrentViewAsPdf, openSavedPdfInBrowser } from '../../lib/savePdf'
import { getUploadedFile, restoreUploadedFileFromTrash } from '../../lib/uploadedFileStore'
import UploadFileModal from '../../components/upload/UploadFileModal'
import PrintSidebarNavAttachIcons from '../../components/upload/PrintSidebarNavAttachIcons'
import { wronglyRegisterOutputUploadScope } from './lib/legalInstrumentAttachmentScope'
import { mergeBirthRegisterPageBookFields, pickBirthRegisterPageBook } from './lib/registerBirthBookPagePick'
import ToastHost from '../../components/toast/ToastHost'
import { useToasts } from '../../components/toast/useToasts'
import LcrForm2ADeathAvailable from '../courtDecree/print/LcrForm2ADeathAvailable'
import LcrForm3AMarriageAvailable from '../courtDecree/print/LcrForm3AMarriageAvailable'
import {
  WronglyRegisterForwardingMunicipalView,
  WronglyRegisterLcrCityForm1AView,
  WronglyRegisterOcrMunicipalForm1AView,
  WronglyRegisterTransmittalView,
} from './print/wronglyRegisterPrintViews'

function displayDate(iso) {
  if (!iso) return new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
  try {
    return new Date(iso).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

const PRINT_SIZE_STYLE_ID = 'print-paper-size-wrongly-register'

/** Screen + base inline padding; print/PDF overrides in index.css must match these values. */
function wronglyRegisterSheetPaddingCss(paperId) {
  if (paperId === 'short') return '5.5mm 6.5mm'
  if (paperId === 'a4') return '8mm'
  if (paperId === 'long') return '10mm 9mm'
  return '10mm'
}

function usePrintPageSize(paperId) {
  useEffect(() => {
    const spec = getPaperPageSpec(paperId)
    document.documentElement.dataset.paperSize = paperId
    let el = document.getElementById(PRINT_SIZE_STYLE_ID)
    if (!el) {
      el = document.createElement('style')
      el.id = PRINT_SIZE_STYLE_ID
      document.head.appendChild(el)
    }
    el.textContent = `
      .wrongly-register-print-sheet {
        font-size: 16px;
      }
      /* Ensure nested components follow the base font size */
      .wrongly-register-print-sheet .text-sm,
      .wrongly-register-print-sheet .text-\\[13px\\],
      .wrongly-register-print-sheet .text-\\[14px\\] {
        font-size: 1em !important;
      }
      .wrongly-register-print-sheet .text-base,
      .wrongly-register-print-sheet .text-\\[15px\\] {
        font-size: 1.1em !important;
      }
      .wrongly-register-print-sheet .text-xs,
      .wrongly-register-print-sheet .text-\\[11px\\],
      .wrongly-register-print-sheet .text-\\[12px\\] {
        font-size: 0.85em !important;
      }

      @media print {
        @page { 
          size: ${spec.size}; 
          margin: 0; 
        }
        .wrongly-register-print-sheet {
          font-size: 12pt !important;
        }
        html[data-paper-size="${paperId}"] .wrongly-register-print-sheet .wrongly-wr-transmittal-body-content {
          margin-left: 14mm !important;
          margin-right: 0 !important;
        }
        /* Move footer lower on Long bondpaper for LCR 1A (City & OCR) */
        html[data-paper-size="long"] .wrongly-wr-lcr-sheet,
        html[data-paper-size="long"] .wrongly-wr-ocr-sheet {
          padding-bottom: 0 !important;
        }
      }
    `
    return () => {
      delete document.documentElement.dataset.paperSize
    }
  }, [paperId])
}

export default function WronglyRegisterPrint() {
  const location = useLocation()
  const draftPayload = useMemo(() => getWronglyRegisterDraft({}), [location.key])
  const data = useMemo(() => mergeBirthRegisterPageBookFields(draftPayload), [draftPayload])
  const [activePanel, setActivePanel] = useState('transmittal')
  const [paperSize, setPaperSize] = useState('a4')
  const [savingPdf, setSavingPdf] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewPdfUrl, setPreviewPdfUrl] = useState('')
  const [uploadModal, setUploadModal] = useState({ open: false, key: '', title: '' })
  const [uploadsRev, setUploadsRev] = useState(0)
  const { toasts, show, dismiss } = useToasts()
  const activeSavedId = getActiveWronglyRegisterId()
  const paperSpec = useMemo(() => getPaperPageSpec(paperSize), [paperSize])
  const pageShellStyle = useMemo(
    () => ({
      width: `${paperSpec.widthMm}mm`,
      minHeight: `${paperSpec.heightMm}mm`,
      padding: wronglyRegisterSheetPaddingCss(paperSize),
      boxSizing: 'border-box',
    }),
    [paperSpec, paperSize]
  )
  const transmittalPageShellStyle = useMemo(
    () => ({
      width: `${paperSpec.widthMm}mm`,
      minHeight: `${paperSpec.heightMm}mm`,
      padding: wronglyRegisterSheetPaddingCss(paperSize),
      boxSizing: 'border-box',
    }),
    [paperSpec, paperSize]
  )
  usePrintPageSize(paperSize)

  const scanScope = useMemo(() => ({
    transmittal: wronglyRegisterOutputUploadScope(activeSavedId, 'transmittal'),
    ocr1a: wronglyRegisterOutputUploadScope(activeSavedId, 'ocr1a'),
    forwarding: wronglyRegisterOutputUploadScope(activeSavedId, 'forwarding'),
    lcrSelected: wronglyRegisterOutputUploadScope(activeSavedId, 'lcr-selected'),
  }), [activeSavedId])

  const hasTransmittalScan = useMemo(
    () => !!getUploadedFile(scanScope.transmittal),
    [scanScope.transmittal, uploadsRev, location.key]
  )
  const hasOcr1aScan = useMemo(
    () => !!getUploadedFile(scanScope.ocr1a),
    [scanScope.ocr1a, uploadsRev, location.key]
  )
  const hasForwardingScan = useMemo(
    () => !!getUploadedFile(scanScope.forwarding),
    [scanScope.forwarding, uploadsRev, location.key]
  )
  const hasLcrSelectedScan = useMemo(
    () => !!getUploadedFile(scanScope.lcrSelected),
    [scanScope.lcrSelected, uploadsRev, location.key]
  )

  const EXPORT_CLASS = {
    transmittal: 'wrongly-pdf-export--transmittal-only',
    ocr: 'wrongly-pdf-export--ocr-only',
    forwarding: 'wrongly-pdf-export--forwarding-only',
    lcr: 'wrongly-pdf-export--lcr-only',
  }

  const selectedLcrForm = String(data.lcrForm || '1A')
  const pb = pickBirthRegisterPageBook(data)
  const regPage = String(data.lcrPage || data.colbPageNumber || data.colbPageNo || pb.page || '').trim()
  const regBook = String(data.lcrBook || data.colbBookNumber || data.colbBookNo || pb.book || '').trim()

  const selectedLcrData = useMemo(() => {
    if (selectedLcrForm === '2A') {
      return {
        lcr2aNameDeceased: data.lcrChildName || '',
        lcr2aRegistryNumber: data.lcrRegistryNo || '',
        colbRegistryNo: data.lcrRegistryNo || '',
        lcr2aDateRegistration: data.lcrDateRegistration || '',
        colbRegDate: data.lcrDateRegistration || '',
        lcr2aSex: data.lcrSex || '',
        sex: data.lcrSex || '',
        lcr2aDateDeath: data.lcrBirthDate || '',
        dateOfDeath: data.lcrBirthDate || '',
        lcr2aPlaceDeath: data.lcrPlaceBirth || '',
        lcr2aCitizenshipFather: data.lcrFatherCitizenship || '',
        colbPageNumber: regPage,
        colbBookNumber: regBook,
        colbPageNo: regPage,
        colbBookNo: regBook,
      }
    }
    if (selectedLcrForm === '3A') {
      return {
        lcr3aHusbandName: data.lcrMotherName || '',
        lcr3aWifeName: data.lcrFatherName || '',
        lcr3aRegistryNumber: data.lcrRegistryNo || '',
        marriageRegistryNo: data.lcrRegistryNo || '',
        lcr3aDateRegistration: data.lcrDateRegistration || '',
        lcr3aDateMarriage: data.lcrBirthDate || '',
        dateOfMarriage: data.lcrBirthDate || '',
        lcr3aPlaceMarriage: data.lcrPlaceBirth || '',
        colbPageNumber: regPage,
        colbBookNumber: regBook,
        colbPageNo: regPage,
        colbBookNo: regBook,
      }
    }
    return {
      lcr1aNameOfChild: data.lcrChildName || '',
      lcr1aRegistryNumber: data.lcrRegistryNo || '',
      colbRegistryNo: data.lcrRegistryNo || '',
      lcr1aDateRegistration: data.lcrDateRegistration || '',
      colbRegDate: data.lcrDateRegistration || '',
      lcr1aSex: data.lcrSex || '',
      sex: data.lcrSex || '',
      lcr1aDateOfBirth: data.lcrBirthDate || '',
      dateOfBirth: data.lcrBirthDate || '',
      lcr1aPlaceOfBirth: data.lcrPlaceBirth || '',
      lcr1aNameOfMother: data.lcrMotherName || '',
      lcr1aMotherCitizenship: data.lcrMotherCitizenship || '',
      motherCitizenship: data.lcrMotherCitizenship || '',
      lcr1aNameOfFather: data.lcrFatherName || '',
      lcr1aFatherCitizenship: data.lcrFatherCitizenship || '',
      fatherCitizenship: data.lcrFatherCitizenship || '',
      lcr1aDateMarriageParents: data.lcrDateMarriage || '',
      dateOfMarriage: data.lcrDateMarriage || '',
      lcr1aPlaceMarriageParents: data.lcrPlaceMarriage || '',
      placeOfMarriageOfParents: data.lcrPlaceMarriage || '',
      colbPageNumber: regPage,
      colbBookNumber: regBook,
      colbPageNo: regPage,
      colbBookNo: regBook,
    }
  }, [selectedLcrForm, data, regPage, regBook])

  const savePdfWithMode = async (mode, baseName) => {
    if (savingPdf) return
    setSavingPdf(true)
    setIsCapturing(true)
    const root = document.documentElement
    const cls = EXPORT_CLASS[mode]
    root.classList.add(cls)
    try {
      const result = await saveCurrentViewAsPdf(baseName)
      if (result?.ok) {
        show({
          type: 'success',
          title: 'PDF saved',
          message: result.filePath || '',
          actionLabel: 'Open',
          onAction: async () => {
            if (!result.filePath) return
            await openSavedPdfInBrowser(result.filePath)
          },
        })
      } else if (result?.cancelled) {
        show({ type: 'info', title: 'Save cancelled', message: 'No PDF file was created.' })
      } else {
        show({ type: 'error', title: 'Save failed', message: result?.reason || 'Unable to save PDF.' })
      }
    } catch (err) {
      show({ type: 'error', title: 'Save failed', message: err?.message || 'Unable to save PDF.' })
    } finally {
      root.classList.remove(cls)
      setSavingPdf(false)
      setIsCapturing(false)
    }
  }

  const handlePreview = async () => {
    const bridge = window?.electronAPI
    if (!bridge || typeof bridge.previewPdfData !== 'function') {
      window.alert('PDF preview bridge is unavailable. Restart Electron.')
      return
    }
    const mode = activePanel === 'ocr-1a' ? 'ocr' : activePanel === 'forwarding' ? 'forwarding' : 'transmittal'
    const resolvedMode = activePanel === 'lcr-selected' ? 'lcr' : mode
    const cls = EXPORT_CLASS[resolvedMode]
    const root = document.documentElement
    setIsCapturing(true)
    root.classList.add(cls)
    try {
      const result = await bridge.previewPdfData()
      if (!result?.ok || !result?.base64) {
        window.alert(result?.reason || 'Unable to generate PDF preview.')
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
      window.alert(err?.message || 'Unable to generate PDF preview.')
    } finally {
      root.classList.remove(cls)
      setIsCapturing(false)
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
    <div className={`p-4 print:p-0 supplemental-print-anim-page ${isCapturing ? 'wrongly-register-capture-static' : ''}`}>
      <div className="no-print mb-3 max-w-6xl mx-auto flex items-center justify-between gap-2">
        <Link
          to="/legal-instrument/wrongly-register/saved"
          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
        >
          Back to Files Saved
        </Link>
        <div className="flex items-center gap-2">
          <select
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            title="Paper size"
          >
            {PAPER_SIZES.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => savePdfWithMode(
              activePanel === 'ocr-1a' ? 'ocr' : activePanel === 'forwarding' ? 'forwarding' : activePanel === 'lcr-selected' ? 'lcr' : 'transmittal',
              activePanel === 'ocr-1a' ? 'Wrongly-Register-OCR-Form-1A' : activePanel === 'forwarding' ? 'Wrongly-Register-Forwarding-Letter' : activePanel === 'lcr-selected' ? `Wrongly-Register-LCR-${selectedLcrForm}` : 'Wrongly-Register-Transmittal'
            )}
            disabled={savingPdf}
            className="px-3 py-1.5 rounded-md bg-[#1a4d3a] text-white text-sm font-medium hover:bg-[#143d2d] disabled:opacity-60"
          >
            {savingPdf ? 'Saving...' : 'Save PDF'}
          </button>
          <button
            type="button"
            onClick={handlePreview}
            disabled={savingPdf}
            className="px-3 py-1.5 rounded-md bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-60"
          >
            Preview PDF
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 rounded-lg bg-[var(--primary-blue)] text-white text-sm font-semibold hover:bg-[var(--primary-blue-light)]"
          >
            Print
          </button>
        </div>
      </div>

      <div id="supplemental-print-page" className="flex gap-6 items-start print:block">
        <aside className="no-print w-56 shrink-0 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">View &amp; Print</h2>
          <div className="relative">
            <button
              type="button"
              onClick={() => setActivePanel('transmittal')}
              className={`w-full text-left px-3 py-2.5 text-sm font-medium transition text-white rounded-lg bg-[#1a4d3a] pr-[5.75rem] ${activePanel === 'transmittal' ? 'ring-2 ring-offset-1 ring-[var(--primary-blue)]' : ''
                }`}
            >
              Transmittal
            </button>
            <PrintSidebarNavAttachIcons
              scopeKey={scanScope.transmittal}
              hasUpload={hasTransmittalScan}
              allowManageUpload
              onOpenUploadModal={() => setUploadModal({ open: true, key: scanScope.transmittal, title: 'Wrongly Register — Transmittal scan' })}
            />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setActivePanel('ocr-1a')}
              className={`w-full text-left px-3 py-2.5 text-sm font-medium transition text-white rounded-lg bg-[#283750] pr-[5.75rem] ${activePanel === 'ocr-1a' ? 'ring-2 ring-offset-1 ring-[var(--primary-blue)]' : ''
                }`}
            >
              OCR Form 1A
            </button>
            <PrintSidebarNavAttachIcons
              scopeKey={scanScope.ocr1a}
              hasUpload={hasOcr1aScan}
              allowManageUpload
              onOpenUploadModal={() => setUploadModal({ open: true, key: scanScope.ocr1a, title: 'Wrongly Register — OCR Form 1A scan' })}
            />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setActivePanel('forwarding')}
              className={`w-full text-left px-3 py-2.5 text-sm font-medium transition text-white rounded-lg bg-[var(--primary-blue)] pr-[5.75rem] ${activePanel === 'forwarding' ? 'ring-2 ring-offset-1 ring-[var(--primary-blue)]' : ''
                }`}
            >
              Forwarding Letter
            </button>
            <PrintSidebarNavAttachIcons
              scopeKey={scanScope.forwarding}
              hasUpload={hasForwardingScan}
              allowManageUpload
              onOpenUploadModal={() => setUploadModal({ open: true, key: scanScope.forwarding, title: 'Wrongly Register — Forwarding Letter scan' })}
            />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setActivePanel('lcr-selected')}
              className={`w-full text-left px-3 py-2.5 text-sm font-medium transition text-white rounded-lg bg-[#334155] pr-[5.75rem] ${activePanel === 'lcr-selected' ? 'ring-2 ring-offset-1 ring-[var(--primary-blue)]' : ''
                }`}
            >
              LCR Form {selectedLcrForm}
            </button>
            <PrintSidebarNavAttachIcons
              scopeKey={scanScope.lcrSelected}
              hasUpload={hasLcrSelectedScan}
              allowManageUpload
              onOpenUploadModal={() => setUploadModal({ open: true, key: scanScope.lcrSelected, title: `Wrongly Register — LCR Form ${selectedLcrForm} scan` })}
            />
          </div>
        </aside>

        <div className="flex-1 min-w-0 print:w-full print:max-w-none">
          <div
            id="wrongly-transmittal"
            className={activePanel === 'transmittal' ? 'block' : 'hidden print:block'}
          >
            <div
              className="wrongly-register-print-sheet wrongly-register-transmittal-sheet bg-white shadow-2xl mx-auto text-gray-900 print:shadow-none ring-1 ring-gray-200 print:ring-0 flex flex-col"
              style={transmittalPageShellStyle}
            >
              <WronglyRegisterTransmittalView data={data} displayDate={displayDate} />
            </div>
          </div>

          <div
            id="wrongly-ocr-1a"
            className={activePanel === 'ocr-1a' ? 'block mt-0' : 'hidden print:block print:mt-0 print:[page-break-before:always]'}
          >
            <div
              className="wrongly-register-print-sheet wrongly-wr-ocr-sheet bg-white shadow-2xl mx-auto text-gray-900 print:shadow-none print:p-0 ring-1 ring-gray-200 print:ring-0 flex flex-col"
              style={pageShellStyle}
            >
              <WronglyRegisterOcrMunicipalForm1AView data={data} colbPage={regPage} colbBook={regBook} />
            </div>
          </div>

          <div
            id="wrongly-forwarding-letter"
            className={activePanel === 'forwarding' ? 'block mt-0' : 'hidden print:block print:mt-0 print:[page-break-before:always]'}
          >
            <div
              className="wrongly-register-print-sheet wrongly-wr-forward-sheet bg-white shadow-2xl mx-auto text-gray-900 print:shadow-none print:p-0 ring-1 ring-gray-200 print:ring-0"
              style={pageShellStyle}
            >
              <WronglyRegisterForwardingMunicipalView data={data} displayDate={displayDate} />
            </div>
          </div>
          <div
            id="wrongly-lcr-selected"
            className={activePanel === 'lcr-selected' ? 'block mt-0' : 'hidden print:block print:mt-0 print:[page-break-before:always]'}
          >
            <div
              className="wrongly-register-print-sheet wrongly-wr-lcr-sheet bg-white shadow-2xl mx-auto print:shadow-none print:p-0 ring-1 ring-gray-200 print:ring-0 px-4 py-3 print:px-8 flex flex-col"
              style={{
                width: `${paperSpec.widthMm}mm`,
                minHeight: `${paperSpec.heightMm}mm`,
                boxSizing: 'border-box',
                padding: wronglyRegisterSheetPaddingCss(paperSize),
              }}
            >
              {selectedLcrForm === '1A' ? (
                <WronglyRegisterLcrCityForm1AView
                  tableData={selectedLcrData}
                  displayDate={displayDate}
                  issueDateIso={data.transmittalDate}
                  remarks={data.ocrRemarks}
                  amountPaid={data.ocrAmountPaid}
                  orNo={data.ocrORNumber}
                  datePaid={data.ocrDatePaid}
                  colbPage={regPage}
                  colbBook={regBook}
                />
              ) : null}
              {selectedLcrForm === '2A' ? <LcrForm2ADeathAvailable data={selectedLcrData} /> : null}
              {selectedLcrForm === '3A' ? <LcrForm3AMarriageAvailable data={selectedLcrData} /> : null}
            </div>
          </div>
        </div>
      </div>
      <UploadFileModal
        open={uploadModal.open}
        onClose={() => setUploadModal((m) => ({ ...m, open: false }))}
        scopeKey={uploadModal.key}
        title={uploadModal.title}
        offerLibraryAttach
        onChanged={(evt) => {
          setUploadsRev((v) => v + 1)
          if (evt?.kind === 'uploaded') {
            show({
              type: 'success',
              title: 'File uploaded',
              message: evt.fileName ? `Saved: ${evt.fileName}` : '',
            })
          }
          if (evt?.kind === 'removed') {
            const key = evt.scopeKey
            show({
              type: 'info',
              title: 'File removed',
              message: 'You can undo within 5 seconds.',
              actionLabel: 'Undo',
              onAction: () => {
                restoreUploadedFileFromTrash(key)
                setUploadsRev((v) => v + 1)
              },
            })
          }
        }}
      />
      {previewModalOpen ? (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4 no-print" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl w-[95vw] h-[92vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">PDF preview</h3>
              <button
                type="button"
                onClick={closePreviewModal}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Close
              </button>
            </div>
            <iframe title="PDF preview" src={previewPdfUrl} className="w-full flex-1 border-0" />
          </div>
        </div>
      ) : null}
      <ToastHost toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}



