/**
 * COLB REMARKS detection – re-exports AUSF implementation for backward compatibility.
 * For AUSF: use this file or import from './ausfColbRemarksDetection'.
 * For Court Decree: import from './courtDecreeColbRemarksDetection' and use useCourtDecreeColbRemarksDetection.
 */

export { detectRemarksBox, FALLBACK_OVERLAY } from './ausfColbRemarksDetection'
