import { FIELD_POSITIONS, PDF_LAYOUT } from './colbCertificateLayout'

/**
 * COLB Certificate of Live Birth layout at 300 dpi → Legal bond 8.5" × 14"
 * (2550 px = 8.5 in, 4200 px = 14 in). Used for print overlay % mapping.
 */
export const COLB_LAYOUT_DOC_PX = {
  width: PDF_LAYOUT.document.width,
  height: PDF_LAYOUT.document.height,
}

/**
 * REMARKS/ANNOTATIONS overlay (layout pixels, top-left origin).
 * Driven by `FIELD_POSITIONS.ausf_annotation_field` (tune there for AUSF annotation placement).
 */
export const COLB_REMARKS_NOT_ACK_RECT_PX = { ...FIELD_POSITIONS.ausf_annotation_field }

/**
 * @param {{ x: number, y: number, width: number, height: number }} rectPx
 * @param {{ width: number, height: number }} [docPx]
 * @returns {Record<string, string>} React `style` entries for CSS variables used by `.colb-annotation-overlay-dynamic`
 */
export function colbRectToCssPercentVars(rectPx, docPx = COLB_LAYOUT_DOC_PX) {
  return {
    '--colb-overlay-left': `${(rectPx.x / docPx.width) * 100}%`,
    '--colb-overlay-top': `${(rectPx.y / docPx.height) * 100}%`,
    '--colb-overlay-width': `${(rectPx.width / docPx.width) * 100}%`,
    '--colb-overlay-height': `${(rectPx.height / docPx.height) * 100}%`,
  }
}
