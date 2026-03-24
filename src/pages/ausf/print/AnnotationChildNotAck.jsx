import React from 'react'
import { buildDefaultAnnotationText } from '../../../lib/printUtils'
import {
  COLB_LAYOUT_DOC_PX,
  COLB_REMARKS_NOT_ACK_RECT_PX,
  colbRectToCssPercentVars,
} from '../../../lib/colbRemarksLayout'
import { DocumentFooter } from '../../../components/print'

export function getAnnotationChildNotAckText(data) {
  const defaultAnnotation = buildDefaultAnnotationText(data || {})
  return (
    data?.annotationChildNotAckText ||
    data?.annotationChildAckText ||
    defaultAnnotation
  )
}

/**
 * Annotation (Child Not Ack): attach COLB scan; overlay aligns to REMARKS box
 * (2550×4200 layout: x=246, y=1959, w=2292, h=300).
 */
export default function AnnotationChildNotAck({ data, onAnnotationChange }) {
  const hasScan = Boolean(data.colbScanDataUrl)
  const annotationText = getAnnotationChildNotAckText(data)
  // Keep print overlay mapping consistent with the FieldPosition PDF formula:
  // yIn = ((field.y + 25) / docHeight) * pageHeightInches
  const overlayRectPx = {
    ...COLB_REMARKS_NOT_ACK_RECT_PX,
    y: COLB_REMARKS_NOT_ACK_RECT_PX.y + 25,
  }
  const overlayContainerStyle = {
    aspectRatio: `${COLB_LAYOUT_DOC_PX.width} / ${COLB_LAYOUT_DOC_PX.height}`,
    ...colbRectToCssPercentVars(overlayRectPx),
  }

  const renderAnnotationContent = () => {
    const text = annotationText || '—'
    const pursuantIdx = text.toLowerCase().indexOf('pursuant')
    if (pursuantIdx <= 0) {
      const match = text.match(/known as\s+(.+?)\s+pursuant/i)
      if (match) {
        const before = text.slice(0, text.indexOf(match[1]))
        const name = match[1]
        const after = text.slice(text.indexOf(match[1]) + name.length)
        return (
          <>
            {before}
            <strong style={{ textDecoration: 'underline' }}>{name}</strong>
            {after}
          </>
        )
      }
      return text
    }
    const mainPart = text.slice(0, pursuantIdx).trim()
    const pursuantPart = text.slice(pursuantIdx).replace(/["\s]+$/g, '').trim()
    const underIdx = mainPart.indexOf(' under ')
    const firstLine = underIdx >= 0 ? mainPart.slice(0, underIdx + 7) : mainPart
    const secondLineContent = underIdx >= 0 ? mainPart.slice(underIdx + 7) : ''
    const nameMatch =
      secondLineContent.match(/known as\s+(.+?)\s*$/i) ||
      mainPart.match(/known as\s+(.+?)\s*$/i) ||
      text.match(/known as\s+(.+?)\s+pursuant/i)
    const name = nameMatch ? nameMatch[1].trim() : ''
    const knownAsIdx = secondLineContent.toLowerCase().indexOf('known as')
    const secondBeforeName = knownAsIdx >= 0 ? secondLineContent.slice(0, knownAsIdx + 9) : secondLineContent
    const secondAfterName = name && knownAsIdx >= 0 ? secondLineContent.slice(knownAsIdx + 9 + name.length) : ''
    return (
      <span className="block w-full">
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

  return (
    <div className="ausf-doc print-doc colb-annotation-ack bg-white text-black text-sm max-w-[210mm] mx-auto flex flex-col relative print:min-h-[260mm] px-4 py-3 print:px-0 print:py-0 print:max-w-none">
      <h2 className="text-base font-bold uppercase mb-3 text-center print:hidden">Annotation (Child Not Ack) — COLB Office File</h2>

      {hasScan ? (
        <div className="colb-print-area relative mb-4">
          <p className="text-xs font-medium text-gray-600 mb-1 print:hidden">Scan copy of COLB office file</p>
          <div
            className="relative w-full max-h-[600px] print:max-h-[270mm] mx-auto overflow-visible colb-certificate-container colb-notack-full-height border border-gray-300 rounded overflow-hidden print:border-0"
            style={overlayContainerStyle}
          >
            {data.colbScanDataUrl.startsWith('data:image') ? (
              <>
                <img
                  src={data.colbScanDataUrl}
                  alt="COLB office file scan"
                  className="w-full h-full object-contain object-top print:w-full print:h-full print:object-bottom"
                />
                <div
                  className="colb-annotation-overlay-remarks colb-annotation-overlay-dynamic"
                  aria-label="REMARKS/ANNOTATIONS"
                  style={{
                    position: 'absolute',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    className="colb-annotation-remarks-body"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      alignItems: 'stretch',
                      height: '100%',
                    }}
                  >
                    <p className="colb-annotation-remarks-text text-sm" style={{ margin: 0 }}>
                      {renderAnnotationContent()}
                    </p>
                  </div>
                </div>
              </>
            ) : data.colbScanDataUrl.startsWith('data:application/pdf') ? (
              <div className="relative w-full h-full min-h-[200px]">
                <iframe
                  src={data.colbScanDataUrl}
                  title="COLB office file scan"
                  className="w-full h-full min-h-[400px] print:hidden"
                />
                <p className="print:block hidden p-4 text-sm">
                  PDF attached. For printing with annotation overlay, please attach an image (PNG/JPG) of the COLB scan.
                </p>
              </div>
            ) : (
              <div className="p-4 text-sm text-gray-500">
                Attached file.{' '}
                <a href={data.colbScanDataUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Open in new tab
                </a>{' '}
                to view.
              </div>
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
      ) : null}

      {!hasScan && (
        <div className="mb-4">
          <div className="colb-print-area relative mb-3">
            <p className="font-medium text-sm mb-1 print:hidden">REMARKS/ANNOTATION (Child not acknowledged)</p>
            <div
              className="relative w-full max-h-[600px] print:max-h-[270mm] mx-auto overflow-visible colb-certificate-container colb-notack-full-height border border-gray-300 rounded overflow-hidden print:border-0"
              style={overlayContainerStyle}
            >
              <div
                className="colb-annotation-overlay-remarks colb-annotation-overlay-dynamic"
                aria-label="REMARKS/ANNOTATIONS"
                style={{
                  position: 'absolute',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  border: '1px solid black',
                  background: '#e5e7eb',
                }}
              >
                <div
                  className="colb-annotation-remarks-body"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'stretch',
                    height: '100%',
                    background: 'transparent',
                  }}
                >
                  <p className="colb-annotation-remarks-text text-sm" style={{ margin: 0 }}>
                    {renderAnnotationContent()}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="no-print mb-4">
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
      )}

      <div className="mt-auto pt-4 shrink-0 print:hidden">
        <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
      </div>

    </div>
  )
}
