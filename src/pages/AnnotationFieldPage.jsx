import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAnnotationChildNotAckText,
  renderAnnotationNotAckRichContent,
} from "./ausf/print/AnnotationChildNotAck";
import { getAUSFDraft, loadAUSFDraftFromApi } from "./ausf/lib/ausfStorage";
import { defaultAUSF } from "./ausf/lib/ausfDefaults";
import { PAPER_SIZES } from "../components/print";
import ToastHost from "../components/toast/ToastHost";
import { useToasts } from "../components/toast/useToasts";
import { saveGeneratedPdfBase64 } from "../lib/savePdf";
import { buildAnnotationFieldPreviewPdfBase64 } from "../lib/annotationFieldPreviewPdf";
import { FIELD_POSITIONS } from "../lib/colbCertificateLayout";
import {
  COLB_LAYOUT_DOC_PX,
  colbRectToCssPercentVars,
} from "../lib/colbRemarksLayout";

const ANNOTATION_FIELD_RECT_PX = FIELD_POSITIONS.ausf_annotation_field;

const annotationFieldFrameStyle = {
  aspectRatio: `${COLB_LAYOUT_DOC_PX.width} / ${COLB_LAYOUT_DOC_PX.height}`,
  ...colbRectToCssPercentVars(ANNOTATION_FIELD_RECT_PX),
};

const PRINT_SIZE_STYLE_ID = "annotation-field-paper-size";

function base64ToBlobUrl(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
}

/** Same pattern as Field Position: blob URL + modal iframe (Field Position `usePdfPreviewUrl`). */
function usePdfPreviewUrl() {
  const [url, setUrl] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openPreview = useCallback((base64) => {
    setUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return base64ToBlobUrl(base64);
    });
    setIsOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsOpen(false);
    setUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  return { url, isOpen, openPreview, closePreview };
}

function useLegalPrintPageSize() {
  useEffect(() => {
    const spec = PAPER_SIZES.find((p) => p.id === "legal") || PAPER_SIZES[0];
    document.documentElement.dataset.paperSize = "legal";
    let el = document.getElementById(PRINT_SIZE_STYLE_ID);
    if (!el) {
      el = document.createElement("style");
      el.id = PRINT_SIZE_STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = `@media print { @page { size: ${spec.size}; } }`;
    return () => {
      delete document.documentElement.dataset.paperSize;
      el?.remove();
    };
  }, []);
}

/**
 * Sidebar "Annotation field" — centered annotation text + jsPDF preview (Field Position style) + Save PDF.
 */
export default function AnnotationFieldPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const { toasts, show, dismiss } = useToasts();
  const {
    url: pdfPreviewUrl,
    isOpen: pdfPreviewOpen,
    openPreview,
    closePreview,
  } = usePdfPreviewUrl();

  useLegalPrintPageSize();

  useEffect(() => {
    const draft = getAUSFDraft();
    if (draft) {
      setData({ ...defaultAUSF, ...draft });
    } else {
      setData(null);
    }
    loadAUSFDraftFromApi()
      .then((apiDraft) => {
        if (!apiDraft) return;
        setData({ ...defaultAUSF, ...apiDraft });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.title = "Annotation field | ULSADES";
    return () => {
      document.title =
        "ULSADES - Unified Legal Status Automated Data Entry System | Iligan City Civil Registrar";
    };
  }, []);

  const handlePreviewPdf = useCallback(() => {
    if (!data) return;
    const text = getAnnotationChildNotAckText(data);
    const base64 = buildAnnotationFieldPreviewPdfBase64(text);
    if (!base64) {
      show({
        type: "error",
        title: "Preview failed",
        message: "Could not generate PDF.",
      });
      return;
    }
    openPreview(base64);
  }, [data, openPreview, show]);

  const handleSavePdf = useCallback(async () => {
    if (!data) return;
    const text = getAnnotationChildNotAckText(data);
    const base64 = buildAnnotationFieldPreviewPdfBase64(text);
    if (!base64) {
      show({
        type: "error",
        title: "Save failed",
        message: "Could not generate PDF.",
      });
      return;
    }
    try {
      const result = await saveGeneratedPdfBase64(
        base64,
        "AUSF-annotation-child-not-ack",
      );
      if (result?.ok) {
        show({
          type: "success",
          title: "PDF saved",
          message: result.filePath || "",
        });
        return;
      }
      if (result?.cancelled) {
        show({
          type: "info",
          title: "Save cancelled",
          message: "No PDF file was created.",
        });
        return;
      }
      show({
        type: "error",
        title: "Save failed",
        message: result?.reason || "Unable to save PDF.",
      });
    } catch (err) {
      show({
        type: "error",
        title: "Save failed",
        message: err?.message || "Unable to save PDF.",
      });
    }
  }, [data, show]);

  if (data === null) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <h1 className="text-xl font-bold text-gray-900">Annotation field</h1>
        <p className="text-gray-600 mt-3 text-sm">
          No AUSF draft found. Fill out the AUSF form first so annotation text
          can load from your data.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/ausf")}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-(--primary-blue) hover:opacity-90"
          >
            Open AUSF form
          </button>
          <Link
            to="/ausf/saved"
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Files Saved
          </Link>
        </div>
        <ToastHost toasts={toasts} onDismiss={dismiss} />
      </div>
    );
  }

  const annotationText = getAnnotationChildNotAckText(data);

  return (
    <>
      {pdfPreviewOpen && pdfPreviewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 print-hide"
          role="dialog"
          aria-modal="true"
          aria-labelledby="annotation-field-pdf-preview-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={closePreview}
            aria-label="Close PDF preview"
          />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
              <h2
                id="annotation-field-pdf-preview-title"
                className="text-sm font-semibold text-slate-800"
              >
                PDF preview
              </h2>
              <button
                type="button"
                onClick={closePreview}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <iframe
              src={pdfPreviewUrl}
              title="Annotation field PDF preview"
              className="min-h-[70vh] w-full flex-1 border-0 bg-slate-100"
            />
          </div>
        </div>
      )}

      <div
        className="min-h-full flex flex-col bg-white ausf-doc print-doc colb-annotation-child-not-ack"
        data-paper-size="legal"
      >
        <div className="no-print shrink-0 border-b border-gray-200 bg-(--main-bg) px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-800">Annotation field</span>
            <span className="text-gray-300" aria-hidden>
              |
            </span>
            <Link to="/ausf" className="text-(--primary-blue) hover:underline">
              AUSF form
            </Link>
            <Link
              to="/ausf/print"
              className="text-(--primary-blue) hover:underline"
            >
              AUSF print
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePreviewPdf}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Preview PDF
            </button>
            <button
              type="button"
              onClick={handleSavePdf}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Save PDF
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 print:py-20 print:min-h-[355.6mm]">
          <div className="colb-print-area w-full max-w-[210mm] mx-auto">
            <div
              className="relative w-full max-h-[min(70vh,600px)] print:max-h-[355.6mm] mx-auto colb-certificate-container colb-notack-full-height border border-gray-300 rounded overflow-hidden print:border-0"
              style={annotationFieldFrameStyle}
            >
              <div
                className="colb-annotation-overlay-remarks colb-annotation-overlay-dynamic"
                aria-label="Annotation (Child not acknowledged)"
                style={{
                  position: "absolute",
                  boxSizing: "border-box",
                  overflow: "hidden",
                  border: "1px solid black",
                  background: "#e5e7eb",
                }}
              >
                <div className="colb-annotation-remarks-body colb-annotation-remarks-body--placeholder">
                  <p
                    className="colb-annotation-remarks-text text-sm"
                    style={{ margin: 0 }}
                  >
                    {renderAnnotationNotAckRichContent(annotationText)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ToastHost toasts={toasts} onDismiss={dismiss} />
      </div>
    </>
  );
}
