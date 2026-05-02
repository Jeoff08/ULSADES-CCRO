import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getAUSFDraft,
  saveAUSFDraft,
  loadAUSFDraftFromApi,
  saveAUSFDraftToApi,
} from "./lib/ausfStorage";
import { defaultAUSF } from "./lib/ausfDefaults";
import {
  TRANSMITTAL_ATTACHMENTS_LOCAL,
  TRANSMITTAL_ATTACHMENTS_PSA,
  PAPER_SIZES,
} from "../../components/print";
import {
  getUploadedFile,
  restoreUploadedFileFromTrash,
} from "../../lib/uploadedFileStore";
import UploadFileModal from "../../components/upload/UploadFileModal";
import ToastHost from "../../components/toast/ToastHost";
import { useToasts } from "../../components/toast/useToasts";
import { saveCurrentViewAsPdf } from "../../lib/savePdf";
import { buildAnnotationFieldPreviewPdfBase64 } from "../../lib/annotationFieldPreviewPdf";
import { saveGeneratedPdfBase64 } from "../../lib/savePdf";
import { getAnnotationChildNotAckText } from "./print/AnnotationChildNotAck";
import AusfOnly from "./print/AusfOnly";
import Ausf06 from "./print/Ausf06";
import Ausf0717 from "./print/Ausf0717";
import RegistrationOfAusf from "./print/RegistrationOfAusf";
import RegistrationOfAcknowledgement from "./print/RegistrationOfAcknowledgement";
import LcrForm1ABirthAvailable from "./print/LcrForm1ABirthAvailable";
import LcrFormA1 from "./print/LcrFormA1";
import AnnotationChildAck from "./print/AnnotationChildAck";
import AnnotationChildNotAck from "./print/AnnotationChildNotAck";
import TransmittalDoc from "./print/TransmittalDoc";
import LegacyPrintSummary from "./print/LegacyPrintSummary";

const VIEW_PRINT_OPTIONS = [
  { label: "AUSF only", type: "ausf-only" },
  { label: "AUSF 0-6", type: "ausf-0-6" },
  { label: "AUSF 07-17", type: "ausf-07-17" },
  { label: "Registration of AUSF", type: "reg-ausf" },
  { label: "Registration of Acknowledgement", type: "reg-ack" },
  {
    label: "LCR Form 1A (Birth-Available)",
    type: "child-ack-lcr",
    labelLine1: "LCR Form 1A (Birth-",
    labelLine2: "Available)",
  },
  { label: "Annotation (Child Ack)", type: "child-ack-annotation" },
  { label: "LCR Form A1", type: "child-not-ack-lcr", buttonRoundedLeft: true },
  { label: "Annotation (Child Not Ack)", type: "child-not-ack-annotation" },
  { label: "Transmittal", type: "child-not-ack-transmittal" },
  { label: "Out-of-Town Transmittal", type: "out-of-town" },
];

const PRINT_SIZE_STYLE_ID = "print-paper-size";

/** AUSF annotation views — Long bond (8.5" × 13") */
const AUSF_ANNOTATION_TYPES = new Set([
  "child-ack-annotation",
  "child-not-ack-annotation",
]);

const CHILD_ACK_TYPES = new Set(["child-ack-lcr", "child-ack-annotation"]);
const CHILD_NOT_ACK_TYPES = new Set([
  "child-not-ack-lcr",
  "child-not-ack-annotation",
  "child-not-ack-transmittal",
]);

function usePrintPageSize(paperId) {
  useEffect(() => {
    const spec = PAPER_SIZES.find((p) => p.id === paperId) || PAPER_SIZES[0];
    document.documentElement.dataset.paperSize = paperId;
    let el = document.getElementById(PRINT_SIZE_STYLE_ID);
    if (!el) {
      el = document.createElement("style");
      el.id = PRINT_SIZE_STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = `@media print { @page { size: ${spec.size}; } }`;
    return () => {
      delete document.documentElement.dataset.paperSize;
    };
  }, [paperId]);
}

export default function AUSFPrint() {
  const [data, setData] = useState(null);
  const [displayType, setDisplayType] = useState(null);
  const [paperSize, setPaperSize] = useState("a4");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recordId = searchParams.get("id") || "draft";
  const uploadInputRef = useRef(null);
  const uploadScopeRef = useRef("");
  const [uploadTick, setUploadTick] = useState(0);
  const [modal, setModal] = useState({ open: false, key: "", title: "" });
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState("");
  const { toasts, show, dismiss } = useToasts();

  const activePrintType = displayType ?? data?.formType;
  const pageSizeForPrint =
    activePrintType && AUSF_ANNOTATION_TYPES.has(activePrintType)
      ? "long"
      : paperSize;
  usePrintPageSize(pageSizeForPrint);

  const acknowledged = data?.childAlreadyAcknowledged;
  const viewPrintOptions = React.useMemo(() => {
    if (acknowledged === "YES") {
      return VIEW_PRINT_OPTIONS.filter((opt) => !CHILD_NOT_ACK_TYPES.has(opt.type));
    }
    if (acknowledged === "NO") {
      return VIEW_PRINT_OPTIONS.filter((opt) => !CHILD_ACK_TYPES.has(opt.type));
    }
    return VIEW_PRINT_OPTIONS;
  }, [acknowledged]);

  useEffect(() => {
    if (!activePrintType) return;
    if (acknowledged === "YES" && CHILD_NOT_ACK_TYPES.has(activePrintType)) {
      setDisplayType("child-ack-lcr");
    }
    if (acknowledged === "NO" && CHILD_ACK_TYPES.has(activePrintType)) {
      setDisplayType("child-not-ack-lcr");
    }
  }, [acknowledged, activePrintType]);

  useEffect(() => {
    if (!activePrintType) return;
    if (AUSF_ANNOTATION_TYPES.has(activePrintType)) {
      setPaperSize("long");
    } else {
      setPaperSize((prev) => (prev === "legal" ? "a4" : prev));
    }
  }, [activePrintType]);

  useEffect(() => {
    const draft = getAUSFDraft();
    if (draft) {
      const loaded = { ...defaultAUSF, ...draft };
      setData(loaded);
      setDisplayType((prev) => prev ?? loaded.formType);
    } else {
      setData(null);
    }
    loadAUSFDraftFromApi()
      .then((apiDraft) => {
        if (!apiDraft) return;
        const loaded = { ...defaultAUSF, ...apiDraft };
        setData(loaded);
        setDisplayType((prev) => prev ?? loaded.formType);
      })
      .catch(() => {});
  }, []);

  const defaultTitle =
    "ULSADES - Unified Legal Status Automated Data Entry System | Iligan City Civil Registrar";
  useEffect(() => {
    document.title = "AUSF";
    return () => {
      document.title = defaultTitle;
    };
  }, []);

  const handlePrint = async () => {
    try {
      const result = await saveCurrentViewAsPdf(`AUSF-${type}`);
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
  };

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

  const handlePreviewPdfModal = async () => {
    try {
      const bridge = window?.electronAPI;
      if (!bridge || typeof bridge.previewPdfData !== "function") {
        show({ type: "error", title: "Preview unavailable", message: "PDF preview bridge is unavailable. Restart Electron." });
        return;
      }
      const result = await bridge.previewPdfData();
      if (!result?.ok || !result?.base64) {
        show({ type: "error", title: "Preview failed", message: result?.reason || "Unable to generate PDF preview." });
        return;
      }
      const binary = atob(result.base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
      setPreviewPdfUrl(url);
      setPreviewModalOpen(true);
    } catch (err) {
      show({ type: "error", title: "Preview failed", message: err?.message || "Unable to generate PDF preview." });
    }
  };
  const closePreviewModal = () => {
    setPreviewModalOpen(false);
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
      setPreviewPdfUrl("");
    }
  };

  const scopeKey = (typeId) => `ausf:${recordId}:${typeId}`;
  const titleFor = (opt) => `AUSF – ${opt.label || opt.type}`;
  const hasUploadFor = (typeId) => !!getUploadedFile(scopeKey(typeId));

  useEffect(
    () => () => {
      if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
    },
    [previewPdfUrl]
  );

  if (data === null) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-600 mb-4">
          No form data found. Fill out the form first, then click Done to view
          and print.
        </p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-[var(--primary-blue)] text-white rounded-lg"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const type = displayType || data.formType;

  let content;
  if (type === "ausf-only") content = <AusfOnly data={data} />;
  else if (type === "ausf-0-6") content = <Ausf06 data={data} />;
  else if (type === "ausf-07-17") content = <Ausf0717 data={data} />;
  else if (type === "reg-ausf") content = <RegistrationOfAusf data={data} />;
  else if (type === "reg-ack")
    content = <RegistrationOfAcknowledgement data={data} />;
  else if (type === "child-ack-lcr")
    content = <LcrForm1ABirthAvailable data={data} />;
  else if (type === "child-ack-annotation")
    content = (
      <AnnotationChildAck
        data={{ ...data, colbScanDataUrl: data.colbScanDataUrlAck ?? "" }}
        onColbScanChange={(url) => {
          const next = { ...data, colbScanDataUrlAck: url };
          setData(next);
          saveAUSFDraft(next);
          saveAUSFDraftToApi(next).catch(() => {});
        }}
        onAnnotationChange={(text) => {
          const next = { ...data, annotationChildAckText: text };
          setData(next);
          saveAUSFDraft(next);
          saveAUSFDraftToApi(next).catch(() => {});
        }}
      />
    );
  else if (type === "child-not-ack-lcr") content = <LcrFormA1 data={data} />;
  else if (type === "child-not-ack-annotation")
    content = (
      <AnnotationChildNotAck
        data={{ ...data, colbScanDataUrl: data.colbScanDataUrlNotAck ?? "" }}
        onColbScanChange={(url) => {
          const next = { ...data, colbScanDataUrlNotAck: url };
          setData(next);
          saveAUSFDraft(next);
          saveAUSFDraftToApi(next).catch(() => {});
        }}
        onAnnotationChange={(text) => {
          const next = { ...data, annotationChildNotAckText: text };
          setData(next);
          saveAUSFDraft(next);
          saveAUSFDraftToApi(next).catch(() => {});
        }}
      />
    );
  else if (type === "child-not-ack-transmittal")
    content = (
      <TransmittalDoc
        data={data}
        isOutOfTown={false}
        checklistConfig={{
          isOutOfTown: false,
          defaultLabels: TRANSMITTAL_ATTACHMENTS_LOCAL,
        }}
      />
    );
  else if (type === "out-of-town")
    content = (
      <TransmittalDoc
        data={data}
        isOutOfTown={true}
        checklistConfig={{
          isOutOfTown: true,
          defaultLabels: TRANSMITTAL_ATTACHMENTS_PSA,
        }}
      />
    );
  else content = <LegacyPrintSummary data={data} />;

  return (
    <div className="p-4 print:p-0">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold text-gray-800">AUSF – Print</h1>
          <button
            type="button"
            onClick={() => navigate("/ausf/saved")}
            className="px-3 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            Back to Files Saved
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {type !== "child-not-ack-annotation" && (
            <>
              <label className="sr-only" htmlFor="paper-size-select">
                Paper size (for print)
              </label>
              <select
                id="paper-size-select"
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                disabled={
                  !!activePrintType &&
                  AUSF_ANNOTATION_TYPES.has(activePrintType)
                }
                title={
                  activePrintType && AUSF_ANNOTATION_TYPES.has(activePrintType)
                    ? 'Annotation outputs are fixed to Long (8.5" × 13") for printing'
                    : undefined
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {PAPER_SIZES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </>
          )}
          {type !== "child-not-ack-annotation" ? (
            <>
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-2.5 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handlePreviewPdfModal}
                className="px-3 py-2.5 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
              >
                Preview PDF
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSavePdf}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Save as PDF
              </button>
              <button
                type="button"
                onClick={handlePreviewPdfModal}
                className="px-3 py-2.5 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
              >
                Preview PDF
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-16">
        <aside className="no-print w-56 shrink-0 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            View &amp; Print
          </h2>
          <div className="flex flex-col gap-2">
            {viewPrintOptions.map((opt) => {
              const isSelected = type === opt.type;
              const isLcrButton =
                opt.type === "child-not-ack-lcr" ||
                opt.type === "child-ack-lcr";
              const btnClass = [
                "text-left px-3 py-2.5 text-sm font-medium transition text-white rounded-lg",
                isLcrButton
                  ? "bg-[#283750] hover:bg-[#1e2d42]"
                  : "bg-[var(--primary-blue)]/80 hover:bg-[var(--primary-blue)]",
                isSelected
                  ? "ring-2 ring-offset-1 ring-[var(--primary-blue)]"
                  : "",
              ]
                .filter(Boolean)
                .join(" ");
              const uploaded = hasUploadFor(opt.type);
              return (
                <div key={opt.type} className="relative">
                  <button
                    type="button"
                    onClick={() => setDisplayType(opt.type)}
                    className={[btnClass, "w-full pr-[5.75rem]"].join(" ")}
                  >
                    {opt.labelLine1 != null ? (
                      <>
                        <span className="block leading-tight">
                          {opt.labelLine1}
                        </span>
                        <span className="block leading-tight">
                          {opt.labelLine2}
                        </span>
                      </>
                    ) : (
                      opt.label
                    )}
                  </button>
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {!uploaded ? (
                      <button
                        type="button"
                        onClick={() =>
                          setModal({
                            open: true,
                            key: scopeKey(opt.type),
                            title: titleFor(opt),
                          })
                        }
                        className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        aria-label="Upload file"
                        title="Upload file"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="w-5 h-5"
                          aria-hidden
                        >
                          <path
                            d="M12 16V4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M8 8l4-4 4 4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M4 20h16"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/uploaded/${encodeURIComponent(scopeKey(opt.type))}`,
                          )
                        }
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        aria-label="View uploaded file"
                        title="View uploaded file"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="w-5 h-5"
                          aria-hidden
                        >
                          <path
                            d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                      </button>
                    )}
                    {uploaded ? (
                      <span
                        className="w-2.5 h-2.5 rounded-full bg-emerald-500"
                        title="File uploaded"
                        aria-label="File uploaded"
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 flex flex-col gap-2">
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
              To remove date, title, and URL from the printed page, uncheck
              &quot;Headers and footers&quot; in the print dialog.
            </p>
          </div>
        </aside>
        <div className="flex-1 min-w-0 ausf-print-preview-pane">
          <div className="ausf-print-preview-scale">{content}</div>
        </div>
      </div>
      <UploadFileModal
        open={modal.open}
        scopeKey={modal.key}
        title={modal.title}
        onClose={() => setModal({ open: false, key: "", title: "" })}
        onChanged={(evt) => {
          setUploadTick((t) => t + 1);
          if (evt?.kind === "uploaded") {
            show({
              type: "success",
              title: "File uploaded",
              message: evt.fileName ? `Saved: ${evt.fileName}` : "",
            });
          }
          if (evt?.kind === "removed") {
            const key = evt.scopeKey;
            show({
              type: "info",
              title: "File removed",
              message: "You can undo within 5 seconds.",
              actionLabel: "Undo",
              onAction: () => {
                restoreUploadedFileFromTrash(key);
                setUploadTick((t) => t + 1);
              },
            });
          }
        }}
      />
      {previewModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4 no-print" role="dialog" aria-modal="true" aria-label="PDF preview">
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
      )}
      <ToastHost toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
