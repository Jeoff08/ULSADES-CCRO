/**
 * Shared Certificate of Live Birth (Form 102) layout: 300 dpi legal 8.5"×14" (2550×4200 px).
 * Used by Field Position page (HTML + PDF) and AUSF Annotation (Child Not Ack) scan overlay.
 */

// PDF Layout dimensions (layout pixels)
export const PDF_LAYOUT = {
  document: {
    width: 2550,
    height: 4200,
    pageWidthInches: 8.5,
    pageHeightInches: 14,
    dpi: 300,
  },
  renderScale: 0.32,
  fieldFontSize: 20,
  pdfDefaultFontSize: 10,
  pdfMinShrinkSize: 7,
  pdfShrinkStep: 0.5,
  lineHeightRatio: 1.2,
  defaultWrapMaxHeight: 120,
};

export const FIELD_POSITIONS = {
  /** AUSF annotation (Child not acknowledged): overlay, Annotation field page, and jsPDF preview. Layout px on 2550×4200. */
  ausf_annotation_field: { x: 148, y: 3600, width: 2292, height: 210 },
};

export const PDF_COLUMN_GUTTER_PX = 20;

export const PDF_MULTI_COLUMN_ROWS = [];

export const PDF_FIELD_MAX_WIDTH_TO_X = {};

export const CENTERED_FIELD_KEYS = [];

export const INFORMANT_ADDRESS_COMPACT_LENGTH = 44;
export const INFORMANT_ADDRESS_COMPACT_PDF_PT = 8;
export const INFORMANT_ADDRESS_COMPACT_OVERLAY_PX =
  (INFORMANT_ADDRESS_COMPACT_PDF_PT / 10) * PDF_LAYOUT.fieldFontSize;

export const ATTENDANT_ADDRESS_SHRINK_MIN_CHARS = 35;
export const ATTENDANT_ADDRESS_SHRINK_MAX_CHARS = 60;
export const ATTENDANT_ADDRESS_MIN_FONT_PX = 12;

export const ATTENDANT_ADDRESS_SHRINK_MIN_CHARS_PDF = 35;
export const ATTENDANT_ADDRESS_SHRINK_MAX_CHARS_PDF = 60;
export const ATTENDANT_ADDRESS_MIN_FONT_PT = 9;

export function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
}

export function getMergedValue(merged, key) {
  return merged[key] ?? merged[camelToSnake(key)];
}

export function getEffectiveColumnWidthPx(fieldKey) {
  const field = FIELD_POSITIONS[fieldKey];
  if (!field) return null;
  if (field.width != null && field.width > 0) return field.width;

  const docWidth = PDF_LAYOUT.document.width;
  const y0 = field.y;
  for (const row of PDF_MULTI_COLUMN_ROWS) {
    const idx = row.indexOf(fieldKey);
    if (idx === -1) continue;
    const x0 = field.x;
    if (idx + 1 < row.length) {
      const nextField = FIELD_POSITIONS[row[idx + 1]];
      if (nextField && Math.abs(nextField.y - y0) < 50) {
        const x1 = nextField.x;
        return Math.max(48, x1 - x0 - PDF_COLUMN_GUTTER_PX);
      }
    }
    return Math.max(48, docWidth - x0 - PDF_COLUMN_GUTTER_PX);
  }

  const rightEdge = PDF_FIELD_MAX_WIDTH_TO_X[fieldKey];
  if (rightEdge != null) {
    return Math.max(48, rightEdge - field.x - PDF_COLUMN_GUTTER_PX);
  }
  return null;
}

export function toCobDisplay(value) {
  if (!value) return "";
  return String(value).toUpperCase();
}

export function getAttendantAddressFontPx(charCount) {
  if (charCount < ATTENDANT_ADDRESS_SHRINK_MIN_CHARS) {
    return PDF_LAYOUT.fieldFontSize;
  }
  if (charCount > ATTENDANT_ADDRESS_SHRINK_MAX_CHARS) {
    return ATTENDANT_ADDRESS_MIN_FONT_PX;
  }
  const range =
    ATTENDANT_ADDRESS_SHRINK_MAX_CHARS - ATTENDANT_ADDRESS_SHRINK_MIN_CHARS;
  const position = charCount - ATTENDANT_ADDRESS_SHRINK_MIN_CHARS;
  const fontRange = PDF_LAYOUT.fieldFontSize - ATTENDANT_ADDRESS_MIN_FONT_PX;
  return PDF_LAYOUT.fieldFontSize - (position / range) * fontRange;
}

export function getAttendantAddressFontPt(charCount) {
  if (charCount < ATTENDANT_ADDRESS_SHRINK_MIN_CHARS_PDF) {
    return PDF_LAYOUT.pdfDefaultFontSize;
  }
  if (charCount > ATTENDANT_ADDRESS_SHRINK_MAX_CHARS_PDF) {
    return ATTENDANT_ADDRESS_MIN_FONT_PT;
  }
  const range =
    ATTENDANT_ADDRESS_SHRINK_MAX_CHARS_PDF -
    ATTENDANT_ADDRESS_SHRINK_MIN_CHARS_PDF;
  const position = charCount - ATTENDANT_ADDRESS_SHRINK_MIN_CHARS_PDF;
  const fontRange =
    PDF_LAYOUT.pdfDefaultFontSize - ATTENDANT_ADDRESS_MIN_FONT_PT;
  return PDF_LAYOUT.pdfDefaultFontSize - (position / range) * fontRange;
}

export function joinTimeParts(time, ampm) {
  return [time, ampm].filter(Boolean).join(" ");
}

export function getSignatureOrName(signature, name) {
  return signature || name;
}

export function normalizeAttendantType(value) {
  if (!value) return null;
  const normalized = String(value).toLowerCase().trim();
  if (
    normalized === "physician" ||
    normalized === "md" ||
    normalized === "doctor"
  ) {
    return "physician";
  }
  if (normalized === "nurse" || normalized === "rn") {
    return "nurse";
  }
  if (normalized === "midwife") {
    return "midwife";
  }
  if (
    normalized === "hilot" ||
    normalized === "traditional birth attendant" ||
    normalized === "tba" ||
    normalized.includes("hilot")
  ) {
    return "hilot";
  }
  if (normalized === "other" || normalized === "others") {
    return "other";
  }
  return normalized;
}
