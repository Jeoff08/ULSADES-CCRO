/** Files Saved row title: receipt/owner when set, otherwise applicant (or module subject name). */
export function savedFilesListLabel(data, applicantName, fallback = '') {
  const receipt = String(data?.receiptOrFileOwner ?? '').trim()
  if (receipt) return receipt
  const applicant = String(applicantName ?? '').trim()
  if (applicant) return applicant
  return String(fallback ?? '').trim()
}

export function ausfSavedApplicantName(data) {
  return String(data?.applicantName ?? '').trim()
}

export function courtDecreeSavedApplicantName(data) {
  return String(data?.documentOwnerName ?? '').trim()
}

export function legitimationSavedApplicantName(data) {
  const applicant = String(data?.applicantName ?? '').trim()
  if (applicant) return applicant
  return [data?.childFirst, data?.childMiddle, data?.childLast]
    .map((p) => String(p ?? '').trim())
    .filter(Boolean)
    .join(' ')
}

export function supplementalSavedApplicantName(data) {
  return String(data?.affiantName ?? '').trim()
}

export function mc2010SavedApplicantName(data) {
  return String(data?.transmittalColbName ?? '').trim()
}

export function resolveAusfSavedRowLabel(item, fallback = 'AUSF') {
  return savedFilesListLabel(item?.data, ausfSavedApplicantName(item?.data), item?.label || fallback)
}

export function resolveCourtDecreeSavedRowLabel(item, fallback = 'Court Decree') {
  return savedFilesListLabel(item?.data, courtDecreeSavedApplicantName(item?.data), item?.label || fallback)
}

export function resolveLegitimationSavedRowLabel(item, fallback = 'Legitimation') {
  return savedFilesListLabel(item?.data, legitimationSavedApplicantName(item?.data), item?.label || fallback)
}

export function resolveSupplementalSavedRowLabel(item, fallback = 'Supplemental Report') {
  return savedFilesListLabel(item?.data, supplementalSavedApplicantName(item?.data), item?.label || fallback)
}

export function resolveMc2010SavedRowLabel(item, fallback = 'MC2010-04') {
  return savedFilesListLabel(item?.data, mc2010SavedApplicantName(item?.data), item?.label || fallback)
}
