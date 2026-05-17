import React, { useEffect, useRef } from 'react'
import { FIELD_POSITIONS } from '../../../lib/colbCertificateLayout'
import { lcrRemarksBodyStyle, withLcrRemarksPrintClass } from '../../../lib/lcrRemarksFontSize'

/** ANNOTATION FOR FORM 3A – court decree (Certificate of Marriage). */
export default function AnnotationForForm3A({ data, onRemarksChange }) {
  const remarks = String(data?.remarks ?? '')
  const sharedField = FIELD_POSITIONS.ausf_annotation_field
  const printFieldRect =
    sharedField &&
      Number.isFinite(sharedField.x) &&
      Number.isFinite(sharedField.y) &&
      Number.isFinite(sharedField.width) &&
      Number.isFinite(sharedField.height)
      ? {
        left: sharedField.x / 2550,
        top: sharedField.y / 4200,
        width: sharedField.width / 2550,
        height: sharedField.height / 4200,
      }
      : { left: 0.13, top: 0.86, width: 0.72, height: 0.05 }
  const printExpandedLeft = -0.01
  const printExpandedWidth = 1.07
  const remarksInputRef = useRef(null)

  useEffect(() => {
    const el = remarksInputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [remarks])

  return (
    <div className="ausf-doc print-doc print-doc-cert-auth bg-white text-black text-base max-w-[210mm] mx-auto px-6 py-4 leading-relaxed flex flex-col min-h-[297mm]">
      <div className="print-doc-body flex flex-col flex-1 min-h-0">
        <h2 className="text-center font-bold text-[30px] uppercase mb-6 tracking-tight print:hidden">ANNOTATION FOR FORM 3A</h2>

        <div className="mb-4 print:hidden">
          <p className="font-bold text-base mt-4 mb-1">REMARKS/ANNOTATIONS (For LCRO/OCRG Use Only)</p>
          <div className="border border-black bg-white min-h-[5rem] p-4">
            <textarea
              ref={remarksInputRef}
              value={remarks}
              onChange={(e) => onRemarksChange?.(e.target.value)}
              className={withLcrRemarksPrintClass('w-full min-h-[5rem] resize-none overflow-hidden bg-transparent leading-relaxed text-justify outline-none')}
              style={lcrRemarksBodyStyle(data)}
              rows={4}
            />
          </div>
        </div>

        <div className="hidden print:block flex-1 relative">
          <p
            className={withLcrRemarksPrintClass('absolute font-bold text-justify whitespace-pre-wrap break-words [overflow-wrap:anywhere]')}
            style={{
              left: `${printExpandedLeft * 100}%`,
              top: `${(printFieldRect.top ?? 0) * 100}%`,
              width: `${printExpandedWidth * 100}%`,
              minHeight: `${(printFieldRect.height ?? 0.1) * 100}%`,
              margin: 0,
              fontFamily: 'Arial, sans-serif',
              textAlign: 'justify',
              textJustify: 'inter-word',
              ...lcrRemarksBodyStyle(data),
            }}
          >
            {remarks}
          </p>
        </div>
      </div>
    </div>
  )
}
