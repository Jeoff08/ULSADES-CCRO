/**
 * Court Decree–specific COLB REMARKS/ANNOTATIONS detection (Form 102 / LCR Form 1A).
 * Uses shared core; Court Decree overlay/fallback constants only. Edits here do not affect AUSF.
 */

import { detectRemarksBoxCore } from './colbRemarksDetectionCore'

/** Form 102: keep overlay above the bottom green border (normalized). */
export const FORM_102_OVERLAY_MAX_BOTTOM = 0.96

/** Fallback overlay when OCR fails (Court Decree / Form 102 layout). */
export const FALLBACK_OVERLAY = {
  left: 0.12,
  top: 0.85,
  width: 0.88,
  height: 0.14,
}

/** Form 102 REMARKS/ANNOTATIONS area – fixed fallback; narrower width for remarks text. */
export const FORM_102_REMARKS_OVERLAY = {
  left: 0.09,
  top: 0.85,
  width: 0.82,
  height: 0.11,
}

/**
 * Run OCR on the certificate image and detect the REMARKS/ANNOTATIONS box (Court Decree / Form 102).
 * @param {string} imageDataUrl - data URL of the certificate image (PNG/JPG)
 * @returns {Promise<{ left: number, top: number, width: number, height: number } | null>}
 */
export async function detectRemarksBox(imageDataUrl) {
  return detectRemarksBoxCore(imageDataUrl, { overlayMaxBottom: FORM_102_OVERLAY_MAX_BOTTOM })
}
