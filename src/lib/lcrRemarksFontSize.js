/** Discrete sizes for LCR / annotation remarks body text (print output). */
export const LCR_REMARKS_FONT_PT_MIN = 8
export const LCR_REMARKS_FONT_PT_MAX = 16
export const LCR_REMARKS_FONT_PT_OPTIONS = [8, 9, 10, 11, 12, 13, 14, 15, 16]
export const DEFAULT_LCR_REMARKS_FONT_PT = '12'

/** Class for REMARKS body nodes — print/PDF CSS reads `--lcr-remarks-font-pt`. */
export const LCR_REMARKS_PRINT_BODY_CLASS = 'lcr-remarks-print-body'

export function parseLcrRemarksFontPt(raw) {
  const n = Number(String(raw ?? '').trim())
  if (!Number.isFinite(n)) return DEFAULT_LCR_REMARKS_FONT_PT
  const clamped = Math.max(
    LCR_REMARKS_FONT_PT_MIN,
    Math.min(LCR_REMARKS_FONT_PT_MAX, Math.round(n)),
  )
  return String(clamped)
}

/** Inline style for rendered remarks body (screen + print; print uses CSS var with !important). */
export function lcrRemarksBodyStyle(data) {
  const pt = parseLcrRemarksFontPt(data?.lcrRemarksFontSizePt)
  return {
    '--lcr-remarks-font-pt': `${pt}pt`,
    fontSize: `${pt}pt`,
    lineHeight: 1.35,
  }
}

/** Merge module class names with the remarks print body marker. */
export function withLcrRemarksPrintClass(className = '') {
  return [className, LCR_REMARKS_PRINT_BODY_CLASS].filter(Boolean).join(' ')
}

/** Ensure LCR/annotation print nodes receive the chosen remarks font size (parent record wins). */
export function mergeLcrRemarksFontSizePt(target, source) {
  if (!target || typeof target !== 'object') return target
  return {
    ...target,
    lcrRemarksFontSizePt: parseLcrRemarksFontPt(
      source?.lcrRemarksFontSizePt ?? target?.lcrRemarksFontSizePt,
    ),
  }
}
