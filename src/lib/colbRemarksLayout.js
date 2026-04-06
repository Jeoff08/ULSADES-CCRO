/**
 * COLB Certificate of Live Birth layout (300dpi-style page used for field-position PDFs).
 * Remarks box: same grid as FIELD_POSITIONS.remarks in the field-position tool.
 */
export const COLB_LAYOUT_DOC_PX = { width: 2550, height: 4200 }

/** REMARKS/ANNOTATIONS region on the layout (pixels, top-left origin). */
export const COLB_REMARKS_NOT_ACK_RECT_PX = { x: 519, y: 3306, width: 2292 }

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
