import { splitFieldLines } from '../../../lib/printUtils'
import {
  LOCAL_TRANSMITTAL_ATTN_LINES,
  LOCAL_TRANSMITTAL_ATTN_PREFIX,
  LOCAL_TRANSMITTAL_TO_PSA_LINES,
} from '../../../lib/transmittalLocalAddressee'

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

const TRANSMITTAL_DRAFT_ARRAY_KEYS = [
  'transmittalEndorsementIds',
  'transmittalAttachmentIds',
  'transmittalExtraEndorsements',
  'transmittalExtraAttachments',
  'transmittalHiddenEndorsementIds',
  'transmittalHiddenAttachmentIds',
]

export function createTransmittalCustomChecklistRow(prefix = 'custom') {
  return { id: `${prefix}-${Date.now()}`, label: '' }
}

export function getVisibleTransmittalEndorsementRows(data) {
  const hidden = new Set(
    Array.isArray(data?.transmittalHiddenEndorsementIds) ? data.transmittalHiddenEndorsementIds : []
  )
  const builtin = SUPPLEMENTAL_TRANSMITTAL_ENDORSEMENT_OPTIONS.filter((row) => !hidden.has(row.id))
  const extra = Array.isArray(data?.transmittalExtraEndorsements) ? data.transmittalExtraEndorsements : []
  return [...builtin, ...extra.filter((row) => row && row.id)]
}

export function getVisibleTransmittalAttachmentRows(data) {
  const hidden = new Set(
    Array.isArray(data?.transmittalHiddenAttachmentIds) ? data.transmittalHiddenAttachmentIds : []
  )
  const builtin = SUPPLEMENTAL_TRANSMITTAL_ATTACHMENT_OPTIONS.filter((row) => !hidden.has(row.id))
  const extra = Array.isArray(data?.transmittalExtraAttachments) ? data.transmittalExtraAttachments : []
  return [...builtin, ...extra.filter((row) => row && row.id)]
}

export function isTransmittalCustomChecklistRow(rowId, extraRows) {
  return Array.isArray(extraRows) && extraRows.some((row) => row.id === rowId)
}

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
    transmittalExtraEndorsements: [],
    transmittalExtraAttachments: [],
    transmittalHiddenEndorsementIds: [],
    transmittalHiddenAttachmentIds: [],
    /** Index into RECEIVED_BY_OPTIONS for transmittal sign-off block. */
    transmittalSignatoryOptionIndex: DEFAULT_TRANSMITTAL_SIGNATORY_INDEX,
  }
}

/** True when the user entered transmittal letter / checklist fields (not only default salutation). */
export function supplementalTransmittalHasFilledData(data) {
  if (!data || typeof data !== 'object') return false
  const t = (v) => String(v ?? '').trim()
  if (t(data.transmittalDate)) return true
  if (t(data.transmittalRecipient)) return true
  if (t(data.transmittalToPosition1) || t(data.transmittalToPosition2)) return true
  if (t(data.transmittalToOffice1) || t(data.transmittalToOffice2)) return true
  if (
    t(data.transmittalThru) ||
    t(data.transmittalThruPosition1) ||
    t(data.transmittalThruPosition2) ||
    t(data.transmittalThruPosition3) ||
    t(data.transmittalThruPosition4)
  ) {
    return true
  }
  if (t(data.transmittalColbName)) return true
  if (t(data.transmittalRegistryNo)) return true
  if (t(data.transmittalDob)) return true
  if (t(data.transmittalFather) || t(data.transmittalMother)) return true
  if (Array.isArray(data.transmittalEndorsementIds) && data.transmittalEndorsementIds.length > 0) return true
  if (Array.isArray(data.transmittalAttachmentIds) && data.transmittalAttachmentIds.length > 0) return true
  if (Array.isArray(data.transmittalExtraEndorsements) && data.transmittalExtraEndorsements.some((r) => t(r?.label))) return true
  if (Array.isArray(data.transmittalExtraAttachments) && data.transmittalExtraAttachments.some((r) => t(r?.label))) return true
  if (t(data.transmittalDocType)) return true
  return false
}

/** Merge saved draft + defaults. Transmittal fields stay blank unless explicitly filled in editor. */
export function pickTransmittalStateFromDraft(base) {
  const defaults = getDefaultSupplementalTransmittalFields()
  const out = { ...defaults }
  for (const key of Object.keys(defaults)) {
    if (base[key] === undefined || base[key] === null) continue
    if (TRANSMITTAL_DRAFT_ARRAY_KEYS.includes(key)) {
      if (key === 'transmittalExtraEndorsements' || key === 'transmittalExtraAttachments') {
        out[key] = Array.isArray(base[key])
          ? base[key].map((row) => ({ id: row.id, label: typeof row.label === 'string' ? row.label : '' }))
          : []
      } else {
        out[key] = Array.isArray(base[key]) ? [...base[key]] : []
      }
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

/** To block on MC2010 / Supplemental transmittal: saved addressee when set, else PSA default. */
export function ccrTransmittalToLinesForPrint(data) {
  const recipient = String(data?.transmittalRecipient ?? '').trim()
  const custom = [
    recipient,
    ...transmittalRecipientPositionLines(data || {}),
    ...transmittalRecipientOfficeLinesForPrint(data || {}),
  ].filter(Boolean)
  if (custom.length > 0) return custom
  return [...LOCAL_TRANSMITTAL_TO_PSA_LINES]
}

/** ATTN / Thru block: saved addressee when set, else PSA default. */
export function ccrTransmittalThruBlockForPrint(data) {
  const name = String(data?.transmittalThru ?? '').trim()
  const custom = [name, ...transmittalThruPositionLinesForPrint(data || {})].filter(Boolean)
  if (custom.length > 0) {
    return { prefix: LOCAL_TRANSMITTAL_ATTN_PREFIX, lines: custom }
  }
  return { prefix: LOCAL_TRANSMITTAL_ATTN_PREFIX, lines: [...LOCAL_TRANSMITTAL_ATTN_LINES] }
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

/** Normalize roster name for preset matching (optional trailing ", REB"). */
export function normReceivedByNameForMatch(raw) {
  return String(raw ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/,\s*REB\s*$/i, '')
}

/** Signatory block after “Respectfully yours,” on supplemental transmittal (CCR letter). */
export const RECEIVED_BY_OPTIONS = [
  { name: 'ATTY. YUSSIF DON JUSTIN F. MARTIL, REB', title: 'CITY CIVIL REGISTRAR' },
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
  const n = normReceivedByNameForMatch(name)
  const t = String(title ?? '').trim().toUpperCase()
  return RECEIVED_BY_OPTIONS.findIndex(
    (p) => normReceivedByNameForMatch(p.name) === n && p.title.trim().toUpperCase() === t
  )
}
