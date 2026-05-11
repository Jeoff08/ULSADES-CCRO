const draftId = (activeRecordId) =>
  activeRecordId && String(activeRecordId).trim() ? String(activeRecordId).trim() : 'draft'

/** One upload slot per Supplemental print output (affidavit, transmittal, LCR). */
export function supplementalOutputUploadScope(activeRecordId, output) {
  return `supplemental:${draftId(activeRecordId)}:${output}`
}

/** One upload slot per MC2010-04 print output (transmittal, LCR). */
export function mc2010OutputUploadScope(activeRecordId, output) {
  return `mc2010:${draftId(activeRecordId)}:${output}`
}

/** One upload slot per Wrongly Register print output (transmittal, ocr1a, forwarding). */
export function wronglyRegisterOutputUploadScope(activeRecordId, output) {
  return `wrongly-register:${draftId(activeRecordId)}:${output}`
}
