import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";

// ── AUSF draft storage (inlined from ausf/lib/ausfStorage) ─────────────────
const AUSF_DRAFT_STORAGE_KEY = "ulsades_ausf_draft";
const AUSF_FORM_TYPES = new Set([
  "ausf-only",
  "ausf-0-6",
  "ausf-07-17",
  "reg-ausf",
  "reg-ack",
  "child-ack",
  "child-ack-lcr",
  "child-ack-annotation",
  "child-not-ack",
  "child-not-ack-lcr",
  "child-not-ack-annotation",
  "child-not-ack-transmittal",
  "out-of-town",
]);

function isAUSFRecord(item) {
  return AUSF_FORM_TYPES.has(item?.formType);
}

async function apiGetDraft(path) {
  const base = import.meta.env.VITE_API_URL || "";
  const res = await fetch(`${base}${path}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || res.statusText);
  return json;
}

function getAUSFDraft() {
  try {
    const raw = localStorage.getItem(AUSF_DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function loadAUSFDraftFromApi() {
  const { data } = await apiGetDraft("/api/draft");
  if (!data || !isAUSFRecord(data)) return null;
  localStorage.setItem(AUSF_DRAFT_STORAGE_KEY, JSON.stringify(data));
  return data;
}

// ── Default AUSF shape (inlined from ausf/lib/ausfDefaults) ─────────────────
const defaultAUSF = {
  formType: "ausf-0-6",
  applicantName: "",
  civilStatus: "single",
  relationshipToChild: "",
  birthRegisteredInIligan: "YES",
  childAlreadyAcknowledged: "NO",
  motherFirst: "",
  motherMiddle: "",
  motherLast: "",
  motherCitizenship: "Filipino",
  fatherFirst: "",
  fatherMiddle: "",
  fatherLast: "",
  fatherCitizenship: "Filipino",
  childFirst: "",
  childMiddle: "",
  childLast: "",
  dateOfBirth: "",
  age: "",
  sex: "MALE",
  placeOfBirthAddress: "",
  placeOfBirthCity: "ILIGAN CITY",
  placeOfBirthProvince: "LANAO DEL NORTE",
  colbRegistryNo: "",
  colbDateOfRegistration: "",
  colbPageNumber: "",
  colbBookNumber: "",
  ausfRegistryNo: "",
  ausfDateOfRegistration: "",
  ackRegistryNo: "",
  ackDateOfRegistration: "",
  publicDocRegistryNo: "",
  publicDocDate: "",
  publicDocOffice: "",
  filingLocation: "ILIGAN CITY",
  affidavitExecutionDate: "",
  cityCivilRegistrarName: "Atty. Yussif Don Justin F. Martil",
  certificateSignatoryName: "LORELIE L. CANTO",
  certificateIssuanceDate: "",
  contactPhone: "228-1311",
  contactEmail: "civilregistrar.iligan@gmail.com",
  motherReligion: "",
  motherOccupation: "",
  motherAge: "",
  motherResidence: "",
  motherTotalChildrenAlive: "",
  motherChildrenLiving: "",
  motherChildrenDead: "",
  fatherReligion: "",
  fatherOccupation: "",
  fatherAge: "",
  fatherResidence: "",
  typeOfBirth: "SINGLE",
  birthOrder: "",
  birthWeight: "",
  colbRegistryNoForm102: "",
  attendantName: "",
  attendantTitle: "",
  attendantAddress: "",
  attendantDate: "",
  informantName: "",
  informantRelationship: "",
  informantAddress: "",
  informantDate: "",
  preparedByName: "",
  preparedByTitle: "",
  preparedByDate: "",
  receivedByName: "",
  receivedByTitle: "",
  receivedByDate: "",
  registeredByName: "",
  registeredByTitle: "",
  registeredByDate: "",
  transmittalDate: "",
  recipientName: "",
  recipientTitle: "",
  recipientOffice: "",
  transmittalSignatoryName: "",
  colbScanDataUrl: "",
  annotationChildAckText: "",
  annotationChildNotAckText: "",
  colbScanDataUrlAck: "",
  colbScanDataUrlNotAck: "",
};

// ── COLB / PDF layout (subset from colbCertificateLayout) ─────────────────
const PDF_LAYOUT = {
  document: {
    width: 2550,
    height: 4200,
    pageWidthInches: 8.5,
    pageHeightInches: 14,
    dpi: 300,
  },
  pdfDefaultFontSize: 14,
  pdfMinShrinkSize: 7,
  pdfShrinkStep: 0.5,
  lineHeightRatio: 1.2,
};

const FIELD_POSITIONS = {
  ausf_ack_annotation_field: { x: 2244, y: 200, width: 204, height: 2940 },
};

const PDF_CENTER_OFFSETS = {
  x: 0. - 0.1, // + right, - left
  y: 0. - 5.4, // + down, - up
};

// ── Print @page size for Legal (from print/constants PAPER_SIZES) ──────────
const LEGAL_PAGE_SIZE_SPEC = { id: "legal", size: "8.5in 14in" };

// ── printUtils.fullName ─────────────────────────────────────────────────────
function fullName(first, middle, last) {
  return [first, middle, last].filter(Boolean).join(" ").trim() || "";
}

// ── savePdf.saveGeneratedPdfBase64 ──────────────────────────────────────────
function sanitizeFileName(name) {
  return (
    String(name || "document")
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
      .trim() || "document"
  );
}

async function saveGeneratedPdfBase64(base64, suggestedBaseName = "document") {
  const fileName = `${sanitizeFileName(suggestedBaseName)}.pdf`;
  const bridge = window?.electronAPI;

  if (bridge?.savePdfFromBase64 && typeof bridge.savePdfFromBase64 === "function") {
    const result = await bridge.savePdfFromBase64(base64, fileName);
    if (!result) return { ok: false, reason: "Unknown response from main process" };
    return result;
  }

  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    return { ok: true, filePath: fileName };
  } catch {
    throw new Error("PDF save is unavailable. Run the app in Electron or use a modern browser.");
  }
}

// ── Toasts (inlined from components/toast/useToasts) ───────────────────────
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    const t = timersRef.current.get(id);
    if (t) window.clearTimeout(t);
    timersRef.current.delete(id);
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const show = useCallback(
    (toast) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const next = {
        id,
        type: toast?.type || "info",
        title: toast?.title || "Notice",
        message: toast?.message || "",
        actionLabel: toast?.actionLabel || "",
        onAction: typeof toast?.onAction === "function" ? toast.onAction : null,
      };
      setToasts((prev) => [next, ...prev].slice(0, 4));
      const timer = window.setTimeout(() => dismiss(id), 5000);
      timersRef.current.set(id, timer);
      return id;
    },
    [dismiss],
  );

  return { toasts, show, dismiss };
}

// ── ToastHost (inlined from components/toast/ToastHost) ────────────────────
function ToastHost({ toasts, onDismiss }) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setEntered(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  if (!toasts?.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[80] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "pointer-events-auto min-w-[260px] max-w-[360px] rounded-xl border shadow-lg overflow-hidden bg-white",
            "transition-all duration-300 ease-out",
            entered ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0",
            t.type === "success"
              ? "border-emerald-200"
              : t.type === "error"
                ? "border-red-200"
                : "border-gray-200",
          ].join(" ")}
        >
          <div
            className={[
              "h-1",
              t.type === "success"
                ? "bg-emerald-500"
                : t.type === "error"
                  ? "bg-red-500"
                  : "bg-gray-500",
            ].join(" ")}
          />
          <div className="px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">{t.title}</p>
            {t.message ? <p className="text-xs text-gray-600 mt-0.5">{t.message}</p> : null}
            {t.actionLabel && t.onAction ? (
              <div className="mt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    t.onAction?.();
                    onDismiss?.(t.id);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-black"
                >
                  {t.actionLabel}
                </button>
                <button
                  type="button"
                  onClick={() => onDismiss?.(t.id)}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  Dismiss
                </button>
              </div>
            ) : null}
          </div>
          <div className="h-1 bg-gray-100">
            <div className="toast-progress h-1 bg-gray-700/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── DocumentFooter (inlined from components/print/DocumentFooter) ─────────
function normalizeContactPhone(phone) {
  const raw = String(phone || "").trim();
  const digits = raw.replace(/\D/g, "");

  if (!digits) return "228-1311";
  if (digits.endsWith("2245038") || digits.endsWith("2272806") || digits.endsWith("2281311")) {
    return "228-1311";
  }
  return raw;
}

function DocumentFooter({ contactPhone, contactEmail, sloganBlue, contentClassName }) {
  const displayPhone = normalizeContactPhone(contactPhone);

  return (
    <div className="print-doc-footer mt-4 w-full">
      <hr className="border-black border-t mb-3" />
      <div className={`grid grid-cols-2 gap-6 items-start ${contentClassName || "text-xs"}`}>
        <div className="leading-tight space-y-0.5">
          <p className="font-bold">CONTACT DETAILS:</p>
          <p>Telephone No.: {displayPhone}</p>
          <p>Email: {contactEmail || "civilregistrar.iligan@gmail.com"}</p>
        </div>
        <div className="text-right leading-tight space-y-0.5 italic font-bold text-blue-600">
          <p>Births, Marriages and Deaths matter,</p>
          <p>Register them all!</p>
        </div>
      </div>
    </div>
  );
}

// ── Page-local helpers ──────────────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 25;
const PRINT_SIZE_STYLE_ID = "annotation-ack-field-paper-size";

function base64ToBlobUrl(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
}

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
    const spec = LEGAL_PAGE_SIZE_SPEC;
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

/** Render annotation for ack: name bold+underline, "pursuant" on second line */
function renderAckAnnotationContent(annotationText) {
  const text = annotationText || "—";
  const pursuantIdx = text.toLowerCase().indexOf("pursuant");
  if (pursuantIdx > 0) {
    const mainPart = text.slice(0, pursuantIdx).trim();
    const pursuantPart = text
      .slice(pursuantIdx)
      .replace(/["\\s]+$/g, "")
      .trim();
    const nameMatch = mainPart.match(/known as\s+(.+?)(?:\s*"|$)/i);
    const name = nameMatch ? nameMatch[1].trim() : "";
    const beforeName = mainPart.slice(0, mainPart.toLowerCase().indexOf("known as") + 9);
    return (
      <span className="inline-block text-center bg-gray-200 px-4 py-2 rounded">
        <span>
          {beforeName}
          <strong style={{ textDecoration: "underline" }}>{name}</strong>
          {'"'}
        </span>
        <br />
        <span>{pursuantPart}</span>
      </span>
    );
  }
  const match = text.match(/known as\s+(.+?)\s+pursuant/i);
  if (match) {
    const before = text.slice(0, text.indexOf(match[1]));
    const name = match[1];
    const after = text.slice(text.indexOf(match[1]) + name.length);
    return (
      <>
        {before}
        <strong style={{ textDecoration: "underline" }}>{name}</strong>
        {after}
      </>
    );
  }
  return text;
}

/**
 * PDF generation for Ack field: vertical text (270deg) in the right-side remarks area.
 */
function buildVerticalAnnotationPdfBase64(plainText) {
  const doc = new jsPDF({ orientation: "portrait", unit: "in", format: "legal" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255);

  const { width: docW, height: docH, pageWidthInches, pageHeightInches } = PDF_LAYOUT.document;

  const box = FIELD_POSITIONS.ausf_ack_annotation_field;

  const boxWIn = (box.width / docW) * pageWidthInches;
  const boxHIn = (box.height / docH) * pageHeightInches;
  const boxLeftIn = (box.x / docW) * pageWidthInches;
  const boxTopIn = (box.y / docH) * pageHeightInches;

  const centerX = boxLeftIn + boxWIn / 2 + PDF_CENTER_OFFSETS.x;
  const centerY = boxTopIn + boxHIn / 2 + PDF_CENTER_OFFSETS.y;

  const str = String(plainText ?? "").trim() || "—";
  let fontPt = PDF_LAYOUT.pdfDefaultFontSize;
  const minPt = PDF_LAYOUT.pdfMinShrinkSize;

  const innerW = Math.max(0.3, boxHIn - 0.4);
  let lines;
  let lineHeightIn;

  for (; ;) {
    doc.setFontSize(fontPt);
    lines = doc.splitTextToSize(str, innerW);
    lineHeightIn = (fontPt * PDF_LAYOUT.lineHeightRatio) / 72;
    if (lines.length * lineHeightIn <= boxWIn - 0.1 || fontPt <= minPt) break;
    fontPt -= PDF_LAYOUT.pdfShrinkStep;
  }

  const totalBlockWidth = lines.length * lineHeightIn;
  let startX = centerX - totalBlockWidth / 2 + lineHeightIn / 2;

  // Draw a black background over the full annotation field area.
  const fieldInset = 0.02;
  const bgX = boxLeftIn + fieldInset;
  const bgY = 2.9 + fieldInset;
  const bgW = Math.max(0.1, boxWIn - fieldInset * 2);
  const bgH = Math.max(0.1, 8.8 - fieldInset * 2);
  doc.setFillColor(0, 0, 0);
  doc.rect(bgX, bgY, bgW, bgH, "F");

  lines.forEach((line, i) => {
    const textW = doc.getTextWidth(line);
    const x = startX + i * lineHeightIn;
    doc.text(line, x, centerY + textW / 2, { angle: 270 });
  });

  const dataUri = doc.output("datauristring");
  return dataUri.includes(",") ? dataUri.split(",")[1] : "";
}

/**
 * Sidebar "Annotation Ack field" page — mirrors AnnotationFieldPage but
 * shows the AnnotationChildAck data (acknowledged child annotation).
 */
export default function AnnotationAckFieldPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const { toasts, show, dismiss } = useToasts();
  const {
    url: pdfPreviewUrl,
    isOpen: pdfPreviewOpen,
    openPreview,
    closePreview,
  } = usePdfPreviewUrl();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadList, setUploadList] = useState([]);
  const fileInputRef = useRef(null);

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
      .catch(() => { });
  }, []);

  useEffect(() => {
    document.title = "Annotation Ack field | ULSADES";
    return () => {
      document.title =
        "ULSADES - Unified Legal Status Automated Data Entry System | Iligan City Civil Registrar";
    };
  }, []);

  const getAckAnnotationText = useCallback((d) => {
    if (!d) return "";
    const childFull =
      fullName(d.childFirst, d.childMiddle, d.fatherLast) ||
      fullName(d.childFirst, d.childMiddle, d.childLast);
    const defaultAnnotation = childFull
      ? `"This child shall be known as ${childFull.toUpperCase()} pursuant to R.A. 9255"`
      : "";
    return d.annotationChildAckText || defaultAnnotation;
  }, []);

  const handlePreviewPdf = useCallback(() => {
    if (!data) return;
    const text = getAckAnnotationText(data);
    const base64 = buildVerticalAnnotationPdfBase64(text);
    if (!base64) {
      show({
        type: "error",
        title: "Preview failed",
        message: "Could not generate PDF.",
      });
      return;
    }
    openPreview(base64);
  }, [data, openPreview, show, getAckAnnotationText]);

  const handleSavePdf = useCallback(async () => {
    if (!data) return;
    const text = getAckAnnotationText(data);
    const base64 = buildVerticalAnnotationPdfBase64(text);
    if (!base64) {
      show({
        type: "error",
        title: "Save failed",
        message: "Could not generate PDF.",
      });
      return;
    }
    try {
      const result = await saveGeneratedPdfBase64(base64, "AUSF-annotation-child-ack");
      if (result?.ok) {
        show({
          type: "success",
          title: "PDF saved",
          message: result.filePath || "",
          actionLabel: "Open",
          onAction: async () => {
            if (!result.filePath) return;
            await (
              window?.electronAPI?.openPdfInBrowser?.(result.filePath) ||
              window?.electronAPI?.openPdfInChrome?.(result.filePath)
            );
          },
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
  }, [data, show, getAckAnnotationText]);

  const handleFileSelect = (file) => {
    if (!file) return;
    const tooLarge = file.size > MAX_FILE_SIZE_MB * 1024 * 1024;
    const invalidType = !/^(image\/|application\/pdf)/.test(file.type);
    const id = `${file.name}-${Date.now()}`;
    if (tooLarge) {
      setUploadList((prev) => [
        ...prev.filter((i) => i.id !== id),
        { id, name: file.name, size: file.size, progress: 0, error: "File size is too large" },
      ]);
      return;
    }
    if (invalidType) {
      setUploadList((prev) => [
        ...prev.filter((i) => i.id !== id),
        { id, name: file.name, size: file.size, progress: 0, error: "Image or PDF only" },
      ]);
      return;
    }
    setUploadList((prev) => [...prev, { id, file, name: file.name, size: file.size, progress: 0 }]);
    const steps = 8;
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setUploadList((prev) =>
        prev.map((i) => (i.id === id ? { ...i, progress: Math.min((step / steps) * 100, 99) } : i)),
      );
      if (step >= steps) {
        clearInterval(interval);
        const reader = new FileReader();
        reader.onload = () => {
          setUploadList((prev) =>
            prev.map((i) => (i.id === id ? { ...i, progress: 100, dataUrl: reader.result } : i)),
          );
        };
        reader.onerror = () => {
          setUploadList((prev) =>
            prev.map((i) => (i.id === id ? { ...i, error: "Failed to read file" } : i)),
          );
        };
        reader.readAsDataURL(file);
      }
    }, 80);
  };

  const handleInputChange = (e) => {
    const file = e.target?.files?.[0];
    handleFileSelect(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileSelect(file);
  };
  const handleDragOver = (e) => e.preventDefault();
  const cancelUpload = (id) => setUploadList((prev) => prev.filter((i) => i.id !== id));
  const completedFile = uploadList.find((i) => i.dataUrl);

  const handleAttachAndClose = () => {
    if (!completedFile?.dataUrl) return;
    setData((prev) => ({ ...prev, colbScanDataUrl: completedFile.dataUrl }));
    setUploadList([]);
    setShowUploadModal(false);
  };
  const handleCloseModal = () => {
    setUploadList([]);
    setShowUploadModal(false);
  };
  const isPdf = (name) => /\.pdf$/i.test(name || "");

  if (data === null) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <h1 className="text-xl font-bold text-gray-900">Annotation Ack field</h1>
        <p className="text-gray-600 mt-3 text-sm">
          No AUSF draft found. Fill out the AUSF form first so annotation text can load from your data.
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

  const hasScan = Boolean(data.colbScanDataUrl);
  const annotationText = getAckAnnotationText(data);

  return (
    <>
      {pdfPreviewOpen && pdfPreviewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 print-hide"
          role="dialog"
          aria-modal="true"
          aria-labelledby="annotation-ack-field-pdf-preview-title"
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
                id="annotation-ack-field-pdf-preview-title"
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
              title="Annotation Ack field PDF preview"
              className="min-h-[70vh] w-full flex-1 border-0 bg-slate-100"
            />
          </div>
        </div>
      )}

      <div
        className="min-h-full flex flex-col bg-white ausf-doc print-doc colb-annotation-ack"
        data-paper-size="legal"
      >
        <div className="no-print shrink-0 border-b border-gray-200 bg-(--main-bg) px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-800">Annotation Ack field</span>
            <span className="text-gray-300" aria-hidden>
              |
            </span>
            <Link to="/ausf" className="text-(--primary-blue) hover:underline">
              AUSF form
            </Link>
            <Link to="/ausf/print" className="text-(--primary-blue) hover:underline">
              AUSF print
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-2 text-sm font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Upload scan
            </button>
            {hasScan && (
              <button
                type="button"
                onClick={() => setData((prev) => ({ ...prev, colbScanDataUrl: "" }))}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-red-600 text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 text-sm font-medium"
              >
                Remove scan
              </button>
            )}
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

        <div className="flex-1 flex flex-col px-4 py-6 max-w-[210mm] mx-auto w-full">
          <h2 className="text-base font-bold uppercase mb-3 text-center print:hidden">
            Annotation Ack Field — COLB Office File
          </h2>

          <div className="no-print mb-4">
            <p className="font-medium text-sm mb-1">Edit annotation</p>
            <textarea
              value={annotationText}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  annotationChildAckText: e.target.value,
                }))
              }
              placeholder='"The child shall be known as [FULL NAME] pursuant to R.A. 9255"'
              className="w-full min-h-[5rem] p-3 border border-gray-300 rounded-lg text-sm font-sans bg-gray-50"
              rows={4}
            />
          </div>

          {hasScan ? (
            <div className="colb-print-area relative mb-4">
              <p className="text-xs font-medium text-gray-600 mb-1 print:hidden">
                Scan copy of COLB office file
              </p>
              <div className="relative border border-gray-300 rounded overflow-hidden print:border-0">
                {data.colbScanDataUrl.startsWith("data:image") ? (
                  <>
                    <img
                      src={data.colbScanDataUrl}
                      alt="COLB office file scan"
                      className="w-full max-h-[520px] object-contain object-top print:max-h-[270mm] print:w-full"
                    />
                    <div
                      className="absolute flex items-center justify-center"
                      style={{
                        top: `${(FIELD_POSITIONS.ausf_ack_annotation_field.y / 4200) * 100}%`,
                        left: `${(FIELD_POSITIONS.ausf_ack_annotation_field.x / 2550) * 100}%`,
                        width: `${(FIELD_POSITIONS.ausf_ack_annotation_field.width / 2550) * 100}%`,
                        height: `${(FIELD_POSITIONS.ausf_ack_annotation_field.height / 4200) * 100}%`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "absolute",
                        padding: "1rem",
                      }}
                    >
                      <p
                        className="text-xs font-sans font-normal text-black whitespace-nowrap"
                        style={{
                          transform: "rotate(270deg)",
                          transformOrigin: "center center",
                        }}
                      >
                        {renderAckAnnotationContent(annotationText)}
                      </p>
                    </div>
                  </>
                ) : data.colbScanDataUrl.startsWith("data:application/pdf") ? (
                  <div className="relative">
                    <iframe
                      src={data.colbScanDataUrl}
                      title="COLB office file scan"
                      className="w-full h-[520px] print:hidden"
                    />
                    <p className="print:block hidden p-4 text-sm">
                      PDF attached. For printing with annotation overlay, please attach an image (PNG/JPG) of the
                      COLB scan.
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
            </div>
          ) : (
            <div className="border border-amber-200 bg-amber-50 mb-4 p-3 rounded no-print">
              <p className="text-sm text-amber-800 font-medium">
                Attach scan copy of COLB office file using the button above
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                The white REMARKS/ANNOTATION section on the right of the COLB will show the annotation when printed.
              </p>
            </div>
          )}

          {!hasScan && (
            <div className="print:hidden mb-4">
              <p className="font-medium text-sm mb-1">REMARKS/ANNOTATION (Child acknowledged)</p>
              <div className="border border-black min-h-[5rem] p-4 bg-gray-100">
                <p className="text-sm whitespace-pre-wrap">{renderAckAnnotationContent(annotationText)}</p>
              </div>
            </div>
          )}

          <div className="mt-auto pt-4 shrink-0 print:hidden">
            <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
          </div>
        </div>

        <ToastHost toasts={toasts} onDismiss={dismiss} />
      </div>

      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ack-upload-modal-title"
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-start justify-between px-6 pt-6 pb-2">
              <div>
                <h3 id="ack-upload-modal-title" className="text-lg font-bold text-gray-900">
                  Upload File
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Attach a scan copy of the COLB office file. Image or PDF (max {MAX_FILE_SIZE_MB} MB).
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 min-h-0 flex gap-6 px-6 pb-6 pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleInputChange}
              />
              <div
                className="flex-1 min-w-0 flex flex-col items-center justify-center border-2 border-dashed border-[#6366f1]/50 rounded-xl p-8 bg-[#6366f1]/5 cursor-pointer hover:border-[#6366f1] hover:bg-[#6366f1]/10 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-14 w-14 text-[#6366f1] mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-700 mb-1">Drag and drop file here</p>
                <p className="text-xs text-gray-500 mb-3">-OR-</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
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
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.error ||
                                (item.dataUrl ? "Completed" : `${Math.round(item.progress)}%`)}
                            </p>
                            {!item.error && (
                              <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#6366f1] rounded-full transition-all duration-200"
                                  style={{
                                    width: `${item.dataUrl ? 100 : item.progress}%`,
                                  }}
                                />
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
    </>
  );
}
