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
  { label: 'Annotation (Child Ack)', type: 'child-ack-annotation' },
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

/** Transmittal (local) – first image: 6 items */
export const TRANSMITTAL_ATTACHMENTS_LOCAL = [
  'AFFIDAVIT TO USE SURNAME OF THE FATHER',
  'CERTIFICATE OF REGISTRATION OF AUSF',
  'UN-ANNOTATED BIRTH CERTIFICATE',
  'ANNOTATED BIRTH CERTIFICATE',
  'LCR FORM 1A',
  'AFFIDAVIT OF ACKNOWLEDGEMENT',
]

/** Out-of-Town Transmittal – second image: 8 items */
export const TRANSMITTAL_ATTACHMENTS_PSA = [
  'CERTIFICATE OF LIVE BIRTH OF CHILD',
  'AFFIDAVIT TO USE SURNAME OF THE FATHER',
  'CERTIFICATE OF LIVE BIRTH OF PARENTS',
  'AFFIDAVIT OF GUARDIANSHIP',
  'AFFIDAVIT OF ACKNOWLEDGEMENT',
  'SCHOOL RECORDS',
  'INSURANCE POLICY',
  'PICTURES',
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

/** Court decree transmittal: list of 11 document types to print on transmittal/out-of-town letters */
export const COURT_DECREE_TRANSMITTAL_LIST = [
  'CERTIFICATE OF AUTHENTICITY',
  'CERTIFICATE OF REGISTRATION',
  'TRANSMITTAL',
  'OUT OF TOWN TRANSMITTAL',
  'LCR FORM 1A',
  'LCR FORM 2A',
  'LCR FORM 3A',
  'ANNOTATION FOR FORM 1A',
  'ANNOTATION FOR FORM 2A',
  'ANNOTATION FOR FORM 3A',
]

/** Court decree Out-of-Town transmittal: 4-item list per official letter format */
export const COURT_DECREE_OUT_OF_TOWN_ATTACHMENTS = [
  'COURT ORDER/DECREE',
  'CERTIFICATE OF FINALITY',
  'CERTIFICATE OF REGISTRATION OF COURT ORDER/DECREE',
  'CERTIFICATE OF AUTHENTICITY OF THE COURT ORDER/DECREE',
]

export const PRINT_SIZE_STYLE_ID = 'print-paper-size'
