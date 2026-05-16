/** Discrete sizes for LCR / annotation remarks body text (print output). */
export const LCR_REMARKS_FONT_PT_MIN = 8
export const LCR_REMARKS_FONT_PT_MAX = 16
export const LCR_REMARKS_FONT_PT_OPTIONS = [8, 9, 10, 11, 12, 13, 14, 15, 16]
export const DEFAULT_LCR_REMARKS_FONT_PT = '12'

export function parseLcrRemarksFontPt(raw) {
  const n = Number(String(raw ?? '').trim())
  if (!Number.isFinite(n)) return DEFAULT_LCR_REMARKS_FONT_PT
  const clamped = Math.max(
    LCR_REMARKS_FONT_PT_MIN,
    Math.min(LCR_REMARKS_FONT_PT_MAX, Math.round(n)),
  )
  return String(clamped)
}

/** Inline style for rendered remarks body (overrides Tailwind text-* on that node). */
export function lcrRemarksBodyStyle(data) {
  const pt = parseLcrRemarksFontPt(data?.lcrRemarksFontSizePt)
  return { fontSize: `${pt}pt`, lineHeight: 1.35 }
}
