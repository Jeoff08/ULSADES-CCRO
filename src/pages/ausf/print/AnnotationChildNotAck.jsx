import React, { useCallback, useMemo } from "react";
import { buildDefaultAnnotationText } from "../../../lib/printUtils";
import { ausfDraftToColbMerged } from "../../../lib/ausfDraftToColbMerged";
import {
  COLB_LAYOUT_DOC_PX,
  COLB_REMARKS_NOT_ACK_RECT_PX,
  colbRectToCssPercentVars,
} from "../../../lib/colbRemarksLayout";
import ColbCertificateFieldsOverlay from "../../../components/colb/ColbCertificateFieldsOverlay";
import { DocumentFooter, AnnotationPrintLayout } from "../../../components/print";
import { AnnotationRenderer } from "../../../components/annotations/AnnotationRenderer";

export function getAnnotationChildNotAckText(data) {
  const defaultAnnotation = buildDefaultAnnotationText(data || {});
  return (
    data?.annotationChildNotAckText ||
    data?.annotationChildAckText ||
    defaultAnnotation
  );
}

export function renderAnnotationNotAckRichContent(annotationText) {
  const text = annotationText || '—'
  const pursuantIdx = text.toLowerCase().indexOf('pursuant')
  if (pursuantIdx > 0) {
    const mainPart = text.slice(0, pursuantIdx).trim()
    const pursuantPart = text.slice(pursuantIdx).replace(/["\s]+$/g, '').trim()
    const nameMatch = mainPart.match(/known as\s+(.+?)(?:\s*"|$)/i)
    const name = nameMatch ? nameMatch[1].trim() : ''
    const beforeName = mainPart.slice(0, mainPart.toLowerCase().indexOf('known as') + 9)
    return (
      <span className="inline-block text-center">
        <span>
          {beforeName}
          <strong style={{ textDecoration: 'underline' }}>{name}</strong>
          {'"'}
        </span>
        <br />
        <span>{pursuantPart}</span>
      </span>
    )
  }
  const match = text.match(/known as\s+(.+?)\s+pursuant/i)
  if (match) {
    const name = match[1].trim()
    return (
      <span className="inline-block text-center">
        <span>
          The child shall be known as <strong style={{ textDecoration: 'underline' }}>{name}</strong> pursuant
        </span>
        <br />
        <span>to R.A. 9255</span>
      </span>
    )
  }
  return <span>{text}</span>
}

/**
 * Annotation (Child Not Ack): COLB scan on Legal 8.5"×14" (2550×4200 layout);
 * remarks overlay uses `FIELD_POSITIONS.ausf_annotation_field` via COLB_REMARKS_NOT_ACK_RECT_PX.
 */
export default function AnnotationChildNotAck({ data, onAnnotationChange }) {
  const hasScan = Boolean(data.colbScanDataUrl);
  const annotationText = getAnnotationChildNotAckText(data);
  const colbMerged = useMemo(() => ausfDraftToColbMerged(data || {}), [data]);
  const overlayRectPx = { ...COLB_REMARKS_NOT_ACK_RECT_PX };
  const overlayContainerStyle = {
    aspectRatio: `${COLB_LAYOUT_DOC_PX.width} / ${COLB_LAYOUT_DOC_PX.height}`,
    ...colbRectToCssPercentVars(overlayRectPx),
  };

  return (
    <AnnotationPrintLayout
      className="colb-annotation-ack colb-annotation-child-not-ack text-sm print:min-h-[355.6mm]"
      paperSize="legal"
      moduleClass="ausf-doc"
    >
      <h2 className="text-base font-bold uppercase mb-3 text-center print:hidden">
        Annotation (Child Not Ack) — COLB Office File
      </h2>

      {hasScan ? (
        <div className="colb-print-area relative mb-4">
          <p className="text-xs font-medium text-gray-600 mb-1 print:hidden">
            Scan copy of COLB office file
          </p>
          <div
            className="relative w-full max-h-[600px] print:max-h-[355.6mm] mx-auto overflow-visible colb-certificate-container colb-notack-full-height border border-gray-300 rounded overflow-hidden print:border-0"
            style={overlayContainerStyle}
          >
            {data.colbScanDataUrl.startsWith("data:image") ? (
              <>
                <img
                  src={data.colbScanDataUrl}
                  alt="COLB office file scan"
                  className="w-full h-full object-contain object-top print:w-full print:h-full print:object-bottom"
                />
                <ColbCertificateFieldsOverlay
                  merged={colbMerged}
                  omitFieldKeys={["remarks"]}
                />
                <div
                  className="colb-annotation-overlay-remarks colb-annotation-overlay-dynamic z-[2]"
                  aria-label="REMARKS/ANNOTATIONS"
                  style={{
                    position: "absolute",
                    boxSizing: "border-box",
                    overflow: "hidden",
                  }}
                >
                  <div className="colb-annotation-remarks-body colb-annotation-remarks-body--scan">
                    <p
                      className="colb-annotation-remarks-text text-sm"
                      style={{ margin: 0 }}
                    >
                      <AnnotationRenderer annotationText={annotationText} type="not-ack" />
                    </p>
                  </div>
                </div>
              </>
            ) : data.colbScanDataUrl.startsWith("data:application/pdf") ? (
              <div className="relative w-full h-full min-h-[200px]">
                <iframe
                  src={data.colbScanDataUrl}
                  title="COLB office file scan"
                  className="w-full h-full min-h-[400px] print:hidden"
                />
                <p className="print:block hidden p-4 text-sm">
                  PDF attached. For printing with annotation overlay, please
                  attach an image (PNG/JPG) of the COLB scan.
                </p>
              </div>
            ) : (
              <div className="p-4 text-sm text-gray-500">
                Attached file.{" "}
                <a
                  href={data.colbScanDataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Open in new tab
                </a>{" "}
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

      <div className="mt-4 pt-4 print:hidden">
        <DocumentFooter
          contactPhone={data.contactPhone}
          contactEmail={data.contactEmail}
        />
      </div>
    </AnnotationPrintLayout>
  );
}
