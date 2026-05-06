export const SEAL_LEFT_SRC = '/iligan_seal_transparent.png'
export const LOGO_RIGHT_SRC = '/logo-shortcut.png'

export const FILL = 'fill-blank inline-block'
export const FILL_BOLD = 'fill-blank inline-block font-bold'

export const VIEW_PRINT_OPTIONS = [
  { label: 'AUSF only', type: 'ausf-only' },
  { label: 'AUSF 0-6', type: 'ausf-0-6' },
  { label: 'AUSF 07-17', type: 'ausf-07-17' },
  { label: 'Registration of AUSF', type: 'reg-ausf' },
  { label: 'Registration of Acknowledgement', type: 'reg-ack' },
  { label: 'LCR Form 1A (Birth-Available)', type: 'child-ack-lcr', labelLine1: 'LCR Form 1A (Birth-', labelLine2: 'Available)' },
  { label: 'Annotation Ack Field', type: 'child-ack-annotation' },
  { label: 'LCR Form A1', type: 'child-not-ack-lcr', buttonRoundedLeft: true },
  { label: 'Annotation (Child Not Ack)', type: 'child-not-ack-annotation' },
  { label: 'Transmittal', type: 'child-not-ack-transmittal' },
  { label: 'Out-of-Town Transmittal', type: 'out-of-town' },
]

export const PAPER_SIZES = [
  { id: 'a4', label: 'A4 (210 × 297 mm)', size: '210mm 297mm', widthMm: 210, heightMm: 297 },
  { id: 'short', label: 'Short bond (8.5" × 11")', size: '8.5in 11in', widthMm: 215.9, heightMm: 279.4 },
  { id: 'long', label: 'Long (8.5" × 13")', size: '8.5in 13in', widthMm: 215.9, heightMm: 330.2 },
]

/** US Legal — AUSF / Court Decree annotations only (not listed in general paper pickers). */
export const LEGAL_PAPER_PAGE_SPEC = {
  id: 'legal',
  label: 'Legal (8.5" × 14")',
  size: '8.5in 14in',
  widthMm: 215.9,
  heightMm: 355.6,
}

export function getPaperPageSpec(paperId) {
  if (paperId === 'legal') return LEGAL_PAPER_PAGE_SPEC
  return PAPER_SIZES.find((p) => p.id === paperId) || PAPER_SIZES[0]
}

/** AUSF Transmittal (local / not out-of-town): 7 items per office checklist */
export const TRANSMITTAL_ATTACHMENTS_LOCAL = [
  'AFFIDAVIT TO USE SURNAME OF THE FATHER',
  'CERTIFICATE OF REGISTRATION OF AUSF',
  'UN-ANNOTATED BIRTH CERTIFICATE',
  'ANNOTATED BIRTH CERTIFICATE',
  'LCR FORM 1A',
  'AFFIDAVIT OF ACKNOWLEDGEMENT',
  'CERTIFICATE OF REGISTRATION OF ACKNOWLEDGEMENT',
]

/** AUSF Out-of-Town Transmittal: 11 items per office checklist */
export const TRANSMITTAL_ATTACHMENTS_PSA = [
  'CERTIFICATE OF LIVE BIRTH OF CHILD',
  'AFFIDAVIT TO USE SURNAME OF THE FATHER',
  'CERTIFICATE OF LIVE BIRTH OF PARENTS',
  'AFFIDAVIT OF GUARDIANSHIP',
  'AFFIDAVIT OF ACKNOWLEDGEMENT',
  'DEATH CERTIFICATE',
  'BAPTISMAL',
  'MEDICAL RECORDS',
  'INSURANCE POLICY',
  'PICTURES',
  'SCHOOL RECORDS',
]

/** Legitimation transmittal: 7-item list per endorsement letter format */
export const LEGITIMATION_TRANSMITTAL_LIST = [
  'AFFIDAVIT OF LEGITIMATION',
  'CERTIFICATE OF REGISTRATION',
  'MARRIAGE CERTIFICATE OF PARENTS',
  'MARRIAGE ADVISORY OF PARENTS',
  'UN-ANNOTATED BIRTH CERTIFICATE',
  'ANNOTATED BIRTH CERTIFICATE',
  'LCR FORM 1A',
]

/** Legitimation Out-of-Town transmittal: 6-item list per official letter format */
export const LEGITIMATION_OUT_OF_TOWN_ATTACHMENTS = [
  'CERTIFICATE OF LIVE BIRTH OF CHILD',
  'MARRIAGE CERTIFICATE OF PARENTS',
  'MARRIAGE ADVISORY OF PARENTS',
  'AFFIDAVIT OF LEGITIMATION',
  'CERTIFICATE OF LIVE BIRTH OF PARENTS',
  'VALID ID OF PARENT/S',
]

/** Court decree local transmittal: 7-item attachment list (PSA routing letter) */
export const COURT_DECREE_TRANSMITTAL_LIST = [
  'COURT ORDER/DECREE',
  'CERTIFICATE OF FINALITY',
  'CERTIFICATE OF REGISTRATION OF COURT ORDER/DECREE',
  'CERTIFICATE OF AUTHENTICITY OF THE COURT ORDER/DECREE',
  'UN-ANNOTATED CERTIFICATE OF BIRTH/MARRIAGE/DEATH',
  'ANNOTATED CERTIFICATE OF BIRTH/MARRIAGE/DEATH',
  'LCR FORM 1A/2A/3A',
]

/** Court decree Out-of-Town transmittal: 4-item list per official letter format */
export const COURT_DECREE_OUT_OF_TOWN_ATTACHMENTS = [
  'COURT ORDER/DECREE',
  'CERTIFICATE OF FINALITY',
  'CERTIFICATE OF REGISTRATION OF COURT ORDER/DECREE',
  'CERTIFICATE OF AUTHENTICITY OF THE COURT ORDER/DECREE',
]

export const PRINT_SIZE_STYLE_ID = 'print-paper-size'
