import { splitFieldLines } from '../../../lib/printUtils'

/** Iligan CCR transmittal — checklist options (supplemental print). */

export const SUPPLEMENTAL_TRANSMITTAL_DOC_TYPE_OPTIONS = [
  { id: 'birth', label: 'Birth Certificate' },
  { id: 'marriage', label: 'Marriage Certificate' },
  { id: 'death', label: 'Death Certificate' },
]

export const SUPPLEMENTAL_TRANSMITTAL_ENDORSEMENT_OPTIONS = [
  { id: 'legitimation', label: 'Legitimation' },
  { id: 'mc98', label: 'MC 98-1 (Negative Result)' },
  { id: 'blurred-crd', label: 'Blurred CRD copy' },
  { id: 'mc2010', label: 'MC 2010-04' },
  { id: 'supplemental-report', label: 'Supplemental Report' },
  { id: 'ack9255', label: 'Acknowledgement 9255' },
]

export const SUPPLEMENTAL_TRANSMITTAL_ATTACHMENT_OPTIONS = [
  { id: 'ocrg', label: 'OCRG Copy' },
  { id: 'cert-lcr-1a', label: 'Certification LCR #1A' },
  { id: 'cert-local', label: 'Certified Copy - Local File' },
  { id: 'ausf', label: 'AUSF' },
  { id: 'negative-crd', label: 'Negative CRD Copy' },
  { id: 'blurred-crd-att', label: 'Blurred CRD Copy' },
  { id: 'annotated', label: 'Annotated Copy' },
  { id: 'supp-affidavit', label: 'Supplemental Affidavit' },
  { id: 'cert-registration', label: 'Certification - Registration' },
]

export function getDefaultSupplementalTransmittalFields() {
  return {
    transmittalDate: '',
    transmittalRecipient: '',
    transmittalToPosition1: '',
    transmittalToPosition2: '',
    transmittalToOffice1: '',
    transmittalToOffice2: '',
    transmittalThru: '',
    transmittalThruPosition1: '',
    transmittalThruPosition2: '',
    transmittalThruPosition3: '',
    transmittalThruPosition4: '',
    transmittalColbName: '',
    transmittalRegistryNo: '',
    transmittalDob: '',
    transmittalFather: '',
    transmittalMother: '',
    transmittalSalutation: 'Sir:',
    transmittalDocType: '',
    transmittalEndorsementIds: [],
    transmittalAttachmentIds: [],
    /** Index into RECEIVED_BY_OPTIONS for transmittal sign-off block. */
    transmittalSignatoryOptionIndex: DEFAULT_TRANSMITTAL_SIGNATORY_INDEX,
  }
}

/** Merge saved draft + defaults. Transmittal fields stay blank unless explicitly filled in editor. */
export function pickTransmittalStateFromDraft(base) {
  const defaults = getDefaultSupplementalTransmittalFields()
  const out = { ...defaults }
  for (const key of Object.keys(defaults)) {
    if (base[key] === undefined || base[key] === null) continue
    if (key === 'transmittalEndorsementIds' || key === 'transmittalAttachmentIds') {
      out[key] = Array.isArray(base[key]) ? [...base[key]] : []
    } else {
      out[key] = base[key]
    }
  }
  migrateLegacyTransmittalMultiline(base, out)
  return out
}

/** Older drafts used single multiline strings; map into discrete fields when new fields are blank. */
function migrateLegacyTransmittalMultiline(base, out) {
  const p1 = String(out.transmittalToPosition1 || '').trim()
  const p2 = String(out.transmittalToPosition2 || '').trim()
  if (!p1 && !p2 && String(base.transmittalRecipientTitle || '').trim()) {
    const lines = splitFieldLines(base.transmittalRecipientTitle)
    if (lines[0]) out.transmittalToPosition1 = lines[0]
    if (lines.length > 1) out.transmittalToPosition2 = lines.slice(1).join(', ')
  }
  const o1 = String(out.transmittalToOffice1 || '').trim()
  const o2 = String(out.transmittalToOffice2 || '').trim()
  if (!o1 && !o2 && String(base.transmittalRecipientOffice || '').trim()) {
    const lines = splitFieldLines(base.transmittalRecipientOffice)
    if (lines[0]) out.transmittalToOffice1 = lines[0]
    if (lines[1]) out.transmittalToOffice2 = lines[1]
  }
  const t1 = String(out.transmittalThruPosition1 || '').trim()
  const t2 = String(out.transmittalThruPosition2 || '').trim()
  if (!t1 && !t2 && String(base.transmittalThruTitle || '').trim()) {
    const lines = splitFieldLines(base.transmittalThruTitle)
    if (lines[0]) out.transmittalThruPosition1 = lines[0]
    if (lines.length > 1) out.transmittalThruPosition2 = lines.slice(1).join(', ')
  }
}

/** Lines for print: discrete fields first, else legacy newline fields. */
export function transmittalRecipientPositionLines(data) {
  const a = String(data.transmittalToPosition1 || '').trim()
  const b = String(data.transmittalToPosition2 || '').trim()
  if (a || b) return [a, b].filter(Boolean)
  return splitFieldLines(data.transmittalRecipientTitle)
}

export function transmittalRecipientOfficeLinesForPrint(data) {
  const a = String(data.transmittalToOffice1 || '').trim()
  const b = String(data.transmittalToOffice2 || '').trim()
  if (a || b) return [a, b].filter(Boolean)
  return splitFieldLines(data.transmittalRecipientOffice)
}

export function transmittalThruPositionLinesForPrint(data) {
  const a = String(data.transmittalThruPosition1 || '').trim()
  const b = String(data.transmittalThruPosition2 || '').trim()
  const c = String(data.transmittalThruPosition3 || '').trim()
  const d = String(data.transmittalThruPosition4 || '').trim()
  if (a || b || c || d) return [a, b, c, d].filter(Boolean)
  return splitFieldLines(data.transmittalThruTitle)
}

export const SUPPLEMENTAL_TRANSMITTAL_SALUTATION_PRESETS = [
  'Sir:',
  "Ma'am:",
  'Madam:',
  'Madam and Sir:',
  'To whom it may concern:',
]

/** Default signatory on all transmittal letters (AUSF, Court Decree, Legitimation, Supplemental, MC2010). */
export const DEFAULT_TRANSMITTAL_SIGNATORY = {
  name: 'LORELIE L. CANTO',
  title: 'REGISTRATION OFFICER IV',
}

/** Signatory block after “Respectfully yours,” on supplemental transmittal (CCR letter). */
export const RECEIVED_BY_OPTIONS = [
  { name: 'ATTY. YUSSIF DON JUSTIN F. MARTIL', title: 'CITY CIVIL REGISTRAR' },
  { name: DEFAULT_TRANSMITTAL_SIGNATORY.name, title: DEFAULT_TRANSMITTAL_SIGNATORY.title },
  { name: 'PHOEBE L. BENIGA', title: 'REGISTRATION OFFICER II' },
  { name: 'JAN FLAURENCE A. OBLENDA', title: 'REGISTRATION OFFICER II' },
]

export const DEFAULT_TRANSMITTAL_SIGNATORY_INDEX = RECEIVED_BY_OPTIONS.findIndex(
  (row) =>
    row.name.trim().toUpperCase() === DEFAULT_TRANSMITTAL_SIGNATORY.name &&
    row.title.trim().toUpperCase() === DEFAULT_TRANSMITTAL_SIGNATORY.title,
)

export function resolveTransmittalSignatory(data) {
  const idx = clampTransmittalSignatoryIndex(data?.transmittalSignatoryOptionIndex)
  return RECEIVED_BY_OPTIONS[idx] || DEFAULT_TRANSMITTAL_SIGNATORY
}

export function clampTransmittalSignatoryIndex(raw) {
  const n = Number(raw)
  const max = RECEIVED_BY_OPTIONS.length - 1
  if (!Number.isFinite(n)) return DEFAULT_TRANSMITTAL_SIGNATORY_INDEX
  return Math.min(Math.max(0, Math.floor(n)), max)
}

/** Index into RECEIVED_BY_OPTIONS when name+title match a preset; otherwise -1. */
export function matchReceivedByPresetIndex(name, title) {
  const n = String(name ?? '').trim().toUpperCase()
  const t = String(title ?? '').trim().toUpperCase()
  return RECEIVED_BY_OPTIONS.findIndex(
    (p) => p.name.trim().toUpperCase() === n && p.title.trim().toUpperCase() === t
  )
}
