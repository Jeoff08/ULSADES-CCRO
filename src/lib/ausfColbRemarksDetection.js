/**
 * AUSF-specific COLB REMARKS/ANNOTATIONS detection.
 * Uses shared core; AUSF overlay/fallback constants only. Edits here do not affect Court Decree.
 */

import { detectRemarksBoxCore } from './colbRemarksDetectionCore'

/** Fallback overlay when OCR fails (AUSF layout). */
export const FALLBACK_OVERLAY = {
  left: 0.12,
  top: 0.85,
  width: 0.88,
  height: 0.14,
}

const AUSF_OVERLAY_MAX_BOTTOM = 0.96

/**
 * Run OCR on the certificate image and detect the REMARKS/ANNOTATIONS box (AUSF).
 * @param {string} imageDataUrl - data URL of the certificate image (PNG/JPG)
 * @returns {Promise<{ left: number, top: number, width: number, height: number } | null>}
 */
export async function detectRemarksBox(imageDataUrl) {
  return detectRemarksBoxCore(imageDataUrl, { overlayMaxBottom: AUSF_OVERLAY_MAX_BOTTOM })
}
