import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getAUSFDraft,
  saveAUSFDraft,
  loadAUSFDraftFromApi,
  saveAUSFDraftToApi,
} from "./lib/ausfStorage";
import { mergeAUSFDraftData } from "./lib/ausfDefaults";
import {
  deriveAusfJuratAffidavitFormType,
  AUSF_JURAT_PRINT_TYPES,
} from "./lib/ausfJuratRouting";
import {
  TRANSMITTAL_ATTACHMENTS_LOCAL,
  TRANSMITTAL_ATTACHMENTS_PSA,
  PAPER_SIZES,
  getPaperPageSpec,
} from "../../components/print";
import {
  getUploadedFile,
  restoreUploadedFileFromTrash,
} from "../../lib/uploadedFileStore";
import UploadFileModal from "../../components/upload/UploadFileModal";
import ToastHost from "../../components/toast/ToastHost";
import { useToasts } from "../../components/toast/useToasts";
import { useDebouncedSuccessToast } from "../../hooks/useDebouncedSuccessToast";
import { saveCurrentViewAsPdf, openSavedPdfInBrowser } from "../../lib/savePdf";
import AusfOnly, {
  AUSF_ONLY_EXCLUDED_PAPER_SIZE_IDS,
  AUSF_ONLY_PRINT_TYPE,
} from "./print/AusfOnly";
import Ausf06, {
  AUSF_06_EXCLUDED_PAPER_SIZE_IDS,
  AUSF_06_PRINT_TYPE,
} from "./print/Ausf06";
import Ausf0717, {
  AUSF_0717_EXCLUDED_PAPER_SIZE_IDS,
  AUSF_0717_PRINT_TYPE,
} from "./print/Ausf0717";
import RegistrationOfAusf from "./print/RegistrationOfAusf";
import RegistrationOfAcknowledgement from "./print/RegistrationOfAcknowledgement";
import LcrForm1ABirthAvailable, {
  AUSF_LCR_1A_BIRTH_EXCLUDED_PAPER_SIZE_IDS,
  AUSF_LCR_1A_BIRTH_PRINT_TYPE,
} from "./print/LcrForm1ABirthAvailable";
import LcrFormA1, {
  AUSF_LCR_A1_EXCLUDED_PAPER_SIZE_IDS,
  AUSF_LCR_A1_PRINT_TYPE,
} from "./print/LcrFormA1";
import TransmittalDoc from "./print/TransmittalDoc";
import LegacyPrintSummary from "./print/LegacyPrintSummary";
import {
  RECEIVED_BY_OPTIONS,
  AUSF_PREPARED_BY_PRINT_TYPES,
  preparedByOptionIndexForPrintType,
  patchPreparedByForPrintType,
  clearPreparedByOverrideForPrintType,
  mergeAusfTransmittalSignatoryIntoData,
} from "./lib/ausfPrintPreparedBy";
import LcrRemarksFontSizeSelect from "../../components/lcr/LcrRemarksFontSizeSelect";

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
  { label: "LCR Form A1", type: "child-not-ack-lcr", buttonRoundedLeft: true },
  { label: "Transmittal", type: "child-not-ack-transmittal" },
  { label: "Out-of-Town Transmittal", type: "out-of-town" },
];

const PRINT_SIZE_STYLE_ID = "print-paper-size";

const CHILD_ACK_TYPES = new Set(["child-ack-lcr"]);
const CHILD_NOT_ACK_TYPES = new Set([
  "child-not-ack-lcr",
  "child-not-ack-transmittal",
]);
const AUSF_TRANSMITTAL_FORM_TYPES = new Set([
  "child-not-ack-transmittal",
  "out-of-town",
]);
/** LCR outputs that show editable or generated remarks text */
const AUSF_LCR_REMARKS_FONT_TYPES = new Set([
  "child-ack-lcr",
  "child-not-ack-lcr",
]);
/** Jurat affidavit forms — only used when child is not yet acknowledged; hide when YES */
const AUSF_JURAT_CHILD_NOT_ACK_TYPES = new Set(["ausf-0-6", "ausf-07-17"]);

function usePrintPageSize(paperId) {
  useEffect(() => {
    const spec = getPaperPageSpec(paperId);
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
  const notifyLcrCertSaved = useDebouncedSuccessToast(show);

  const activePrintType = displayType ?? data?.formType;
  const paperSizesForPrint = useMemo(() => {
    if (activePrintType === AUSF_ONLY_PRINT_TYPE) {
      return PAPER_SIZES.filter((p) => !AUSF_ONLY_EXCLUDED_PAPER_SIZE_IDS.has(p.id));
    }
    if (activePrintType === AUSF_06_PRINT_TYPE) {
      return PAPER_SIZES.filter((p) => !AUSF_06_EXCLUDED_PAPER_SIZE_IDS.has(p.id));
    }
    if (activePrintType === AUSF_0717_PRINT_TYPE) {
      return PAPER_SIZES.filter((p) => !AUSF_0717_EXCLUDED_PAPER_SIZE_IDS.has(p.id));
    }
    if (
      activePrintType === AUSF_LCR_1A_BIRTH_PRINT_TYPE ||
      activePrintType === AUSF_LCR_A1_PRINT_TYPE
    ) {
      return PAPER_SIZES.filter(
        (p) =>
          !AUSF_LCR_1A_BIRTH_EXCLUDED_PAPER_SIZE_IDS.has(p.id) &&
          !AUSF_LCR_A1_EXCLUDED_PAPER_SIZE_IDS.has(p.id)
      );
    }
    return PAPER_SIZES;
  }, [activePrintType]);
  const pageSizeForPrint =
    (activePrintType === AUSF_ONLY_PRINT_TYPE &&
            AUSF_ONLY_EXCLUDED_PAPER_SIZE_IDS.has(paperSize)) ||
          (activePrintType === AUSF_06_PRINT_TYPE &&
            AUSF_06_EXCLUDED_PAPER_SIZE_IDS.has(paperSize)) ||
          (activePrintType === AUSF_0717_PRINT_TYPE &&
            AUSF_0717_EXCLUDED_PAPER_SIZE_IDS.has(paperSize)) ||
          (activePrintType === AUSF_LCR_1A_BIRTH_PRINT_TYPE &&
            AUSF_LCR_1A_BIRTH_EXCLUDED_PAPER_SIZE_IDS.has(paperSize)) ||
          (activePrintType === AUSF_LCR_A1_PRINT_TYPE &&
            AUSF_LCR_A1_EXCLUDED_PAPER_SIZE_IDS.has(paperSize))
        ? "long"
        : paperSize;
  usePrintPageSize(pageSizeForPrint);

  useEffect(() => {
    const excluded =
      activePrintType === AUSF_ONLY_PRINT_TYPE
        ? AUSF_ONLY_EXCLUDED_PAPER_SIZE_IDS
        : activePrintType === AUSF_06_PRINT_TYPE
          ? AUSF_06_EXCLUDED_PAPER_SIZE_IDS
          : activePrintType === AUSF_0717_PRINT_TYPE
            ? AUSF_0717_EXCLUDED_PAPER_SIZE_IDS
            : null;
    if (!excluded || !excluded.has(paperSize)) return;
    setPaperSize("long");
  }, [activePrintType, paperSize]);

  useEffect(() => {
    if (
      activePrintType !== AUSF_LCR_1A_BIRTH_PRINT_TYPE &&
      activePrintType !== AUSF_LCR_A1_PRINT_TYPE
    ) {
      return;
    }
    if (
      !AUSF_LCR_1A_BIRTH_EXCLUDED_PAPER_SIZE_IDS.has(paperSize) &&
      !AUSF_LCR_A1_EXCLUDED_PAPER_SIZE_IDS.has(paperSize)
    ) {
      return;
    }
    setPaperSize("long");
  }, [activePrintType, paperSize]);

  const acknowledged = data?.childAlreadyAcknowledged;
  const derivedJurat = React.useMemo(
    () => (data ? deriveAusfJuratAffidavitFormType(data) : "ausf-0-6"),
    [data?.childAlreadyAcknowledged, data?.age, data?.dateOfBirth]
  );

  const viewPrintOptions = React.useMemo(() => {
    let base;
    if (acknowledged === "YES") {
      base = VIEW_PRINT_OPTIONS.filter(
        (opt) =>
          !CHILD_NOT_ACK_TYPES.has(opt.type) &&
          !AUSF_JURAT_CHILD_NOT_ACK_TYPES.has(opt.type)
      );
    } else if (acknowledged === "NO") {
      base = VIEW_PRINT_OPTIONS.filter((opt) => !CHILD_ACK_TYPES.has(opt.type));
    } else {
      base = VIEW_PRINT_OPTIONS;
    }
    base = base.filter(
      (opt) =>
        !AUSF_JURAT_PRINT_TYPES.has(opt.type) || opt.type === derivedJurat
    );
    const oot = data?.ausfTransmittalIsOutOfTown === true;
    if (acknowledged === "NO") {
      base = base.filter((opt) => {
        if (opt.type === "child-not-ack-transmittal" && oot) return false;
        if (opt.type === "out-of-town" && !oot) return false;
        return true;
      });
    }
    return base;
  }, [acknowledged, derivedJurat, data?.ausfTransmittalIsOutOfTown]);

  const transmittalDocData = useMemo(() => {
    if (!data) return null;
    const t = displayType ?? data.formType;
    if (t === "child-not-ack-transmittal" || t === "out-of-town") {
      return mergeAusfTransmittalSignatoryIntoData(
        data,
        t === "out-of-town" ? "out-of-town" : "child-not-ack-transmittal",
      );
    }
    return data;
  }, [data, displayType]);

  const showAusfPreparedBySidebar = useMemo(
    () => viewPrintOptions.some((o) => AUSF_PREPARED_BY_PRINT_TYPES.has(o.type)),
    [viewPrintOptions],
  );

  /** Persist correct jurat formType on draft when age/ack changes */
  useEffect(() => {
    setData((prev) => {
      if (!prev) return prev;
      const want = deriveAusfJuratAffidavitFormType(prev);
      if (!AUSF_JURAT_PRINT_TYPES.has(prev.formType)) return prev;
      if (prev.formType === want) return prev;
      const next = { ...prev, formType: want };
      saveAUSFDraft(next);
      saveAUSFDraftToApi(next).catch(() => { });
      return next;
    });
  }, [data?.childAlreadyAcknowledged, data?.age, data?.dateOfBirth, data?.formType]);

  /** Local vs out-of-town: keep draft formType aligned when on a transmittal letter */
  useEffect(() => {
    setData((prev) => {
      if (!prev || prev.childAlreadyAcknowledged !== "NO") return prev;
      if (!AUSF_TRANSMITTAL_FORM_TYPES.has(prev.formType)) return prev;
      const want = prev.ausfTransmittalIsOutOfTown
        ? "out-of-town"
        : "child-not-ack-transmittal";
      if (prev.formType === want) return prev;
      const next = { ...prev, formType: want };
      saveAUSFDraft(next);
      saveAUSFDraftToApi(next).catch(() => { });
      return next;
    });
  }, [
    data?.ausfTransmittalIsOutOfTown,
    data?.childAlreadyAcknowledged,
    data?.formType,
  ]);

  /** Active jurat tab must match derived output */
  useEffect(() => {
    if (!data) return;
    const want = deriveAusfJuratAffidavitFormType(data);
    const cur = displayType ?? data.formType;
    if (AUSF_JURAT_PRINT_TYPES.has(cur) && cur !== want) {
      setDisplayType(want);
    }
  }, [
    displayType,
    data?.childAlreadyAcknowledged,
    data?.age,
    data?.dateOfBirth,
    data?.formType,
  ]);

  /** Hide transmittal tab mismatch when form flag says local vs out-of-town */
  useEffect(() => {
    if (!data || data.childAlreadyAcknowledged !== "NO") return;
    const oot = data.ausfTransmittalIsOutOfTown === true;
    const cur = displayType ?? data.formType;
    if (oot && cur === "child-not-ack-transmittal") {
      setDisplayType("out-of-town");
    } else if (!oot && cur === "out-of-town") {
      setDisplayType("child-not-ack-transmittal");
    }
  }, [
    data?.ausfTransmittalIsOutOfTown,
    data?.childAlreadyAcknowledged,
    displayType,
    data?.formType,
  ]);

  useEffect(() => {
    if (!activePrintType) return;
    if (acknowledged === "YES" && CHILD_NOT_ACK_TYPES.has(activePrintType)) {
      setDisplayType("child-ack-lcr");
    }
    if (
      acknowledged === "YES" &&
      AUSF_JURAT_CHILD_NOT_ACK_TYPES.has(activePrintType)
    ) {
      setDisplayType("ausf-only");
    }
    if (acknowledged === "NO" && CHILD_ACK_TYPES.has(activePrintType)) {
      setDisplayType("child-not-ack-lcr");
    }
    if (activePrintType === "child-ack-annotation") {
      setDisplayType("child-ack-lcr");
    }
    if (activePrintType === "child-not-ack-annotation") {
      setDisplayType("child-not-ack-lcr");
    }
  }, [acknowledged, activePrintType]);

  useEffect(() => {
    const draft = getAUSFDraft();
    if (draft) {
      const loaded = mergeAUSFDraftData(draft);
      setData(loaded);
      setDisplayType((prev) => prev ?? loaded.formType);
    } else {
      setData(null);
    }
    loadAUSFDraftFromApi()
      .then((apiDraft) => {
        if (!apiDraft) return;
        const loaded = mergeAUSFDraftData(apiDraft);
        setData(loaded);
        setDisplayType((prev) => prev ?? loaded.formType);
      })
      .catch(() => { });
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
          actionLabel: "Open",
          onAction: async () => {
            if (!result.filePath) return;
            await openSavedPdfInBrowser(result.filePath);
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
  };

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

  const persistAusfLcrPrintPatch = useCallback(
    (patch) => {
      setData((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        const prevParty = String(prev.lcrCertificationRequestParty ?? "");
        const nextParty = String(next.lcrCertificationRequestParty ?? "");
        if (prevParty !== nextParty) notifyLcrCertSaved();
        saveAUSFDraft(next);
        saveAUSFDraftToApi(next).catch(() => { });
        return next;
      });
    },
    [notifyLcrCertSaved],
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

  const preparedByIdx = AUSF_PREPARED_BY_PRINT_TYPES.has(type)
    ? preparedByOptionIndexForPrintType(data, type)
    : null;

  const handleAusfPreparedByChange = (e) => {
    const raw = e.target.value;
    const curType = displayType || data.formType;
    if (!AUSF_PREPARED_BY_PRINT_TYPES.has(curType)) return;
    let patch;
    if (raw === "") {
      patch = clearPreparedByOverrideForPrintType(curType);
    } else {
      const idx = Number(raw);
      if (!Number.isInteger(idx) || idx < 0 || idx >= RECEIVED_BY_OPTIONS.length) return;
      patch = patchPreparedByForPrintType(curType, idx);
    }
    const next = { ...data, ...patch };
    setData(next);
    saveAUSFDraft(next);
    saveAUSFDraftToApi(next).catch(() => { });
  };

  const handleAusfRemarksFontChange = (pt) => {
    const next = { ...data, lcrRemarksFontSizePt: pt };
    setData(next);
    saveAUSFDraft(next);
    saveAUSFDraftToApi(next).catch(() => { });
  };

  let content;
  if (type === "ausf-only") content = <AusfOnly data={data} />;
  else if (type === "ausf-0-6") content = <Ausf06 data={data} />;
  else if (type === "ausf-07-17") content = <Ausf0717 data={data} onPatch={persistAusfLcrPrintPatch} />;
  else if (type === "reg-ausf") content = <RegistrationOfAusf data={data} />;
  else if (type === "reg-ack")
    content = <RegistrationOfAcknowledgement data={data} />;
  else if (type === "child-ack-lcr")
    content = (
      <LcrForm1ABirthAvailable data={data} onDataChange={persistAusfLcrPrintPatch} />
    );
  else if (type === "child-not-ack-lcr") content = <LcrFormA1 data={data} onDataChange={persistAusfLcrPrintPatch} />;
  else if (type === "child-not-ack-transmittal")
    content = (
      <TransmittalDoc
        data={transmittalDocData ?? data}
        isOutOfTown={false}
        checklistConfig={{
          isOutOfTown: false,
          defaultLabels: TRANSMITTAL_ATTACHMENTS_LOCAL,
        }}
        onPersistDraft={(partial) => {
          const next = { ...data, ...partial };
          setData(next);
          saveAUSFDraft(next);
          saveAUSFDraftToApi(next).catch(() => { });
        }}
      />
    );
  else if (type === "out-of-town")
    content = (
      <TransmittalDoc
        data={transmittalDocData ?? data}
        isOutOfTown={true}
        checklistConfig={{
          isOutOfTown: true,
          defaultLabels: TRANSMITTAL_ATTACHMENTS_PSA,
        }}
        onPersistDraft={(partial) => {
          const next = { ...data, ...partial };
          setData(next);
          saveAUSFDraft(next);
          saveAUSFDraftToApi(next).catch(() => { });
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
          <label className="sr-only" htmlFor="paper-size-select">
            Paper size (for print)
          </label>
          <select
            id="paper-size-select"
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            {paperSizesForPrint.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
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
            {showAusfPreparedBySidebar ? (
              <div className="no-print relative z-10 rounded-lg border border-slate-200 bg-slate-50/95 p-2.5 space-y-1.5 ring-1 ring-slate-100">
                <label htmlFor="ausf-print-prepared-signed" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                  Prepared / signed by
                </label>
                <select
                  id="ausf-print-prepared-signed"
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs text-gray-900 bg-white disabled:opacity-50"
                  disabled={!AUSF_PREPARED_BY_PRINT_TYPES.has(type)}
                  value={preparedByIdx !== null ? String(preparedByIdx) : ""}
                  onChange={handleAusfPreparedByChange}
                  title={
                    AUSF_PREPARED_BY_PRINT_TYPES.has(type)
                      ? "Applies only to the print tab shown. Other outputs keep their own signatory until you change them there."
                      : "Open Registration, LCR, or Transmittal to set signatory."
                  }
                >
                  <option value="">Other (not in list)…</option>
                  {RECEIVED_BY_OPTIONS.map((row, i) => (
                    <option key={row.name} value={String(i)}>
                      {row.name} — {row.title}
                    </option>
                  ))}
                </select>
                {!AUSF_PREPARED_BY_PRINT_TYPES.has(type) ? (
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Choose Registration, LCR, or Transmittal above to enable.
                  </p>
                ) : null}
              </div>
            ) : null}
            {AUSF_LCR_REMARKS_FONT_TYPES.has(type) ? (
              <LcrRemarksFontSizeSelect
                id="ausf-print-lcr-remarks-font"
                value={data.lcrRemarksFontSizePt}
                onChange={handleAusfRemarksFontChange}
                helpText="Applies to the REMARKS block on LCR 1A and A1 for this record."
              />
            ) : null}
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

