/** RA 9048 / RA 10172 — Correction of clerical error (COLB) — defaults & option lists. */

export const CLERICAL_DESCRIPTION_OPTIONS = [
  "Child's first & middle names (unclear)",
  "Child's first & middle names (unclear) (LCRO Copy)",
  "Child's first & middle names (unclear) (OCRG Copy)",
  "Child's first name",
  "Child's first name (LCRO Copy)",
  "Child's first name (OCRG Copy)",
  "Child's first name (offline)",
  "Child's first name (offline) (LCRO Copy)",
  "Child's first name (offline) (OCRG Copy)",
  "Child's first name (unclear)",
  "Child's first name (unclear) (LCRO Copy)",
  "Child's first name (unclear) (OCRG Copy)",
]

export function defaultCorrectionRow() {
  return {
    id: `r-${Math.random().toString(36).slice(2, 11)}`,
    description: CLERICAL_DESCRIPTION_OPTIONS[3],
    from: '',
    to: '',
  }
}

/** Form dropdown — stored value is the short key; prints use `formatTypeOfDocumentForPrint`. */
export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'Birth', label: 'Birth' },
  { value: 'Marriage', label: 'Marriage' },
  { value: 'Death', label: 'Death' },
]

const DOCUMENT_TYPE_VALUES = new Set(['Birth', 'Marriage', 'Death'])

/** Civil-registry wording on RA templates */
export function formatTypeOfDocumentForPrint(data) {
  const t = String(data?.typeOfDocument || '').trim()
  const map = {
    Birth: 'Certificate of Live Birth',
    Marriage: 'Marriage Certificate',
    Death: 'Death Certificate',
  }
  return map[t] || t || '—'
}

export function normalizeTypeOfDocument(value) {
  const raw = String(value ?? '').trim()
  if (DOCUMENT_TYPE_VALUES.has(raw)) return raw
  const s = raw.toLowerCase()
  if (/birth|colb|live birth/.test(s)) return 'Birth'
  if (/marriage/.test(s)) return 'Marriage'
  if (/death/.test(s)) return 'Death'
  return 'Birth'
}

export const NATIONALITY_OPTIONS = ['American', 'German', 'Canadian', 'British', 'Chinese', 'Indian']

const NATIONALITY_SET = new Set(NATIONALITY_OPTIONS)

export function normalizeNationality(value) {
  const n = String(value ?? '').trim()
  if (NATIONALITY_SET.has(n)) return n
  return ''
}

export const defaultCorrectionOfEntries = {
  typeOfPetition: 'RA 9048',
  migrantPetition: 'No',
  petitionNumber: '',
  fatherName: '',
  motherName: '',
  typeOfDocument: 'Birth',
  registryNumber: '',
  documentOwnerName: '',
  dateOfBirth: '',
  placeOfBirth: '',
  petitionerName: '',
  petitionerOwnerOfDocument: 'Yes',
  nationality: '',
  petitionerAddress: '',
  idPresented: '',

  corrections: [{ id: 'init-1', description: CLERICAL_DESCRIPTION_OPTIONS[3], from: '', to: '' }],

  orFilingFeeNumber: '',
  amountPaidFiling: '',
  dateOfReceiptFiling: '',
  orCertificationNumber: '',

  receivedByName: '',
  subscribeByCcr: 'Yes',
  suggestedDateOfDecision: '',
  suggestedDateHoliday: 'No',

  supportingDocuments: ['', '', '', '', '', ''],

  ocrgAffirmedDate: '',
  affirmedNumber: '',
  ocrgImpugnedDate: '',
  impugnedNumber: '',
  certificateOfFinalityDate: '',


  placeOfPosting: 'Iligan, Lanao del Norte',

  decisionCmcrGranted: true,
  decisionCmcrDenied: false,
  decisionCmcrDate: '',

  decisionCrgAffirmed: false,
  decisionCrgImpugned: false,
  decisionCrgDate: '',

  decisionAppealAffirmed: false,
  decisionAppealReversed: false,
  decisionAppealDate: '',

  decisionReconGranted: false,
  decisionReconDenied: false,
  decisionReconDate: '',

  remarksRecordSheet: '',
  certificateOfFinalityIssuedOn: '',

  secondTransmittalDate: '',
  psaAddressee: 'HON. USEC. CLAIRE DENNIS S. MAPA',
  psaAddresseeTitle: 'National Statistician and Civil Registrar General',
  psaOrgLine: 'Philippine Statistics Authority',
  psaAddressLine: '8/F CRS Building, PSA Complex, East Ave., Diliman, Quezon City',
  thruName: 'ATTY. ELIEZER P. AMBATALI',
  thruTitle: 'Director III, Legal Service, Office of the Director',
  thruAddressLine: '4th Floor TAM Bldg., PSA Complex, East Avenue, Diliman, Quezon City',

  receivedAtOfficeLine: 'Office of the City Civil Registrar, Iligan, Lanao del Norte',
  receivedDate: '',
  receivedOfficerName: '',
  swornDay: '',
  swornMonth: '',
  swornYear: '',
  swornPlace: 'Iligan City, Lanao del Norte',
  idTypeForSworn: '',

  paymentOrFiling: '',
  paymentAmountFiling: '',
  paymentDateFiling: '',



  cofDecisionDate: '',
  cofIssuanceDate: '',
  cofOcrgNo: '',
  cofAnnotationBody: '',

  cityCivilRegistrarName: 'ATTY. YUSSIF DON JUSTIN F. MARTIL, REB',

  secondTransmittalBullets: [
    'R.A. Form No. 12 - Record Sheet',
    'R.A. Form No. 9.1 - Certificate of Posting',
    'R.A. Form No. 8.1 - Notice of Posting',
    'R.A. Form No. 1.1 - Petition Form',
    'COLB (PSA/LCRO Copy)',
    "Different ID's",
    'Birth Certificate of Child/Children',
  ],
}

/** Build display petition no e.g. CCE-0141-2026 */
export function formatPetitionNumberDisplay(data) {
  const y = data?.petitionYear || new Date().getFullYear()
  const n = String(data?.petitionNumber || '').trim()
  if (!n) return `CCE-____-${y}`
  if (/^CCE-/i.test(n)) return n
  return `CCE-${n}-${y}`
}

export function mergeCorrectionDefaults(stored) {
  const base = {
    ...defaultCorrectionOfEntries,
    ...(stored && typeof stored === 'object' ? stored : {}),
  }
  if (!Array.isArray(base.corrections) || base.corrections.length === 0) {
    base.corrections = [defaultCorrectionRow()]
  }
  base.typeOfDocument = normalizeTypeOfDocument(base.typeOfDocument)
  base.nationality = normalizeNationality(base.nationality)
  return base
}

/** Single source: form draft → all IDs render from `getCorrectionOfEntriesDraft()`. Order = one combined PDF. */
export const CORRECTION_COMPLETE_PACKET_ID = 'all-outputs'

export const CORRECTION_PRINT_ALL_IDS = [
  'certification',
  'petition-form',
  'certificate-of-posting',
  'record-sheet',
  'notice-for-posting',
  'certificate-of-finality',
  'second-transmittal-letter',
  'second-transmittal-enclosures',
]

/** Sidebar: grouped print outputs (Petition / First transmittal / Second transmittal). */
export const CORRECTION_PRINT_GROUPS = [
  {
    id: 'petition',
    label: 'Petition',
    children: [
      { id: 'certification', label: 'Certification' },
      { id: 'petition-form', label: 'Petition (RA 9048 Form No. 1.1)' },
      { id: 'certificate-of-posting', label: 'Certificate of Posting (RA Form 8.1)' },
    ],
  },
  {
    id: 'first-transmittal',
    label: 'First transmittal',
    children: [
      { id: 'record-sheet', label: 'Record Sheet (RA Form No. 12)' },
      { id: 'notice-for-posting', label: 'Notice for Posting' },
      { id: 'certificate-of-finality', label: 'Certificate of Finality' },
    ],
  },
  {
    id: 'second-transmittal',
    label: 'Second transmittal',
    children: [
      { id: 'second-transmittal-letter', label: 'Letter to PSA' },
      { id: 'second-transmittal-enclosures', label: 'Enclosed documents (checklist)' },
    ],
  },
]
