import React, { useState, useCallback, useEffect, useMemo } from 'react'
import ConfirmRemoveRowModal from '../../../components/ConfirmRemoveRowModal'
import { formatDateCert, fullName } from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter, TRANSMITTAL_ATTACHMENTS_LOCAL, TRANSMITTAL_ATTACHMENTS_PSA } from '../../../components/print'
import {
  AUSF_TRANSMITTAL_ADDRESSEE_EXAMPLE_LINES,
  isLegacyAusfTransmittalRecipient,
} from '../lib/ausfDefaults'
import { DEFAULT_TRANSMITTAL_SIGNATORY } from '../../legalInstrument/lib/supplementalTransmittalDefaults'
import {
  loadTransmittalChecklist,
  saveTransmittalChecklist,
  labelsToChecklistItems,
  createEmptyChecklistItem,
} from '../lib/transmittalChecklistStorage'

/** Default six-line â€œTo PSAâ€ block for Court Decree local transmittal */
const DEFAULT_TRANSMITTAL_PSA_LINES = [
  'Minerva Eloisa P. Esquivas',
  'Assistant Secretary',
  'Deputy National Statistician',
  'Civil Registration and Central Support Office',
  'CRS Building, Philippines Statistics Authority Complex East Avenue Diliman',
  'Quezon City, 1101',
]

/** Legitimation local + out-of-town addressee (replaces former Cebu CCR block) */
const DEFAULT_LEGITIMATION_TRANSMITTAL_ADDRESSEE_LINES = [
  'Minerva Eloisa P. Esquivas',
  'Assistant Secretary',
  'Deputy National Statistician',
  'Civil Registration and Central Support Office',
  'CRS Building, Philippines Statistics Authority Complex East Avenue Diliman',
  'Quezon City, 1101',
]

/** Transmittal ATTN: editable prefix (bold) + name / title / office â€” example text is UI-only until user types */
const DEFAULT_ATTN_PREFIX = 'ATTN:'
const DEFAULT_TRANSMITTAL_ATTN_EXAMPLE_LINES = [
  'Marizza B. Grande',
  'Assistant National Statistician',
  'Civil Registration Service',
]

/** Print/PDF: any non-empty field; default ATTN: when detail lines exist but prefix is blank. */
function resolveAttnPrintBlock(prefixDraft, detailDraft, { uppercasePrefix = false } = {}) {
  const detailLines = [0, 1, 2].map((i) => String(detailDraft[i] ?? '').trim())
  const hasDetail = detailLines.some(Boolean)
  let prefix = String(prefixDraft ?? '').trim()
  if (!prefix && hasDetail) prefix = DEFAULT_ATTN_PREFIX
  if (!prefix && !hasDetail) return { prefix: '', detailLines: ['', '', ''] }
  const prefixOut = uppercasePrefix ? prefix.toUpperCase() : prefix
  return { prefix: prefixOut, detailLines }
}

function TransmittalAttnGhostField({ value, onChange, example, inputClassName, ariaLabel }) {
  const showExample = !String(value ?? '').trim()
  return (
    <div className="transmittal-attn-ghost-field relative w-full min-h-[1.35em]">
      {showExample ? (
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-0 max-w-full whitespace-pre text-[12pt] leading-[1.35] text-[#444] no-print"
        >
          {example}
        </span>
      ) : null}
      <input
        type="text"
        spellCheck={false}
        aria-label={ariaLabel}
        className={`${inputClassName} relative z-[1] w-full bg-transparent text-black`}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

function TransmittalAttnBlock({
  attnPrefixDraft,
  setAttnPrefixDraft,
  attnDetailDraft,
  setAttnDetailDraft,
  attnPrefixPrint,
  attnDetailPrintLines,
  inlineAttnPrefixInput,
  inlineAttnDetailInput,
  onPersistDraft,
  saveAttnFields,
  topGapClass = 'mt-[1em]',
  bottomGapClass = 'mb-[2em]',
}) {
  const hasAttnPrint =
    Boolean(attnPrefixPrint) || attnDetailPrintLines.some((line) => String(line ?? '').trim())

  return (
    <div
      className={[
        'transmittal-attn-block legitimation-transmittal-attn-block pl-[6ch] max-w-full text-left text-[12pt] leading-[1.35]',
        topGapClass,
        bottomGapClass,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {hasAttnPrint ? (
        <div
          className="legitimation-transmittal-attn-print legitimation-transmittal-attn-layout print-only grid min-w-0 grid-cols-[max-content_minmax(0,1fr)] items-start gap-x-1 gap-y-0"
          aria-hidden
        >
          {attnPrefixPrint ? (
            <p className="legitimation-transmittal-attn-prefix-wrap col-start-1 row-start-1 m-0 self-start whitespace-nowrap p-0 font-bold leading-[1.35] text-black">
              {attnPrefixPrint}
            </p>
          ) : null}
          {[0, 1, 2].map((i) => {
            const line = attnDetailPrintLines[i] ?? ''
            if (!String(line).trim()) return null
            const rowStart = i === 0 ? 'row-start-1' : i === 1 ? 'row-start-2' : 'row-start-3'
            return (
              <p
                key={`transmittal-attn-print-detail-${i}`}
                className={`legitimation-transmittal-attn-line col-start-2 ${rowStart} m-0 min-w-0 self-start p-0 font-normal leading-[1.35] text-black`}
              >
                {line}
              </p>
            )
          })}
        </div>
      ) : null}
      <div className="no-print legitimation-transmittal-attn-layout grid min-w-0 grid-cols-[max-content_minmax(0,1fr)] items-start gap-x-1 gap-y-0">
        <div className="legitimation-transmittal-attn-prefix-wrap col-start-1 row-start-1 m-0 self-start p-0">
          <TransmittalAttnGhostField
            value={attnPrefixDraft}
            onChange={(e) => setAttnPrefixDraft(e.target.value)}
            example={DEFAULT_ATTN_PREFIX}
            inputClassName={`${inlineAttnPrefixInput} font-bold normal-case`}
            ariaLabel="ATTN label (e.g. ATTN:)"
          />
        </div>
        {[0, 1, 2].map((i) => {
          const rowStart = i === 0 ? 'row-start-1' : i === 1 ? 'row-start-2' : 'row-start-3'
          return (
            <div
              key={`transmittal-attn-detail-${i}`}
              className={`legitimation-transmittal-attn-line col-start-2 ${rowStart} m-0 min-w-0 self-start p-0`}
            >
              <TransmittalAttnGhostField
                value={attnDetailDraft[i] ?? ''}
                onChange={(e) =>
                  setAttnDetailDraft((prev) => {
                    const next = [...prev]
                    while (next.length < 3) next.push('')
                    next[i] = e.target.value
                    return next
                  })
                }
                example={DEFAULT_TRANSMITTAL_ATTN_EXAMPLE_LINES[i]}
                inputClassName={`${inlineAttnDetailInput} font-normal normal-case`}
                ariaLabel={i === 0 ? 'ATTN addressee name' : `ATTN line ${i + 1}`}
              />
            </div>
          )
        })}
      </div>
      {typeof onPersistDraft === 'function' ? (
        <div className="no-print mt-2">
          <button
            type="button"
            onClick={saveAttnFields}
            className="text-sm font-medium text-slate-700 underline decoration-slate-400 underline-offset-2 hover:text-slate-900"
          >
            Save ATTN to draft
          </button>
        </div>
      ) : null}
    </div>
  )
}

const LEG_OOT_SAFE_KEYS = ['recipientName', 'recipientTitle', 'recipientOffice', 'transmittalOotLine4', 'transmittalOotLine5', 'transmittalOotLine6']

function readLegOotLinesFromSafe(src) {
  const s = src && typeof src === 'object' ? src : {}
  return LEG_OOT_SAFE_KEYS.map((k) => (s[k] != null ? String(s[k]) : ''))
}

/** Split legacy drafts that stored â€œATTN: â€¦â€ only in transmittalAttnLine1. */
function readAttnBlockDraftFrom(src) {
  const s = src && typeof src === 'object' ? src : {}
  let prefix = s.transmittalAttnPrefix != null ? String(s.transmittalAttnPrefix) : ''
  let line1 = s.transmittalAttnLine1 != null ? String(s.transmittalAttnLine1) : ''
  const line2 = s.transmittalAttnLine2 != null ? String(s.transmittalAttnLine2) : ''
  const line3 = s.transmittalAttnLine3 != null ? String(s.transmittalAttnLine3) : ''
  if (!prefix.trim() && line1.trim()) {
    const m = line1.match(/^(\s*ATTN\s*:\s*)([\s\S]*)$/i)
    if (m) {
      prefix = m[1].trim()
      line1 = (m[2] ?? '').trim()
    }
  }
  return {
    prefix,
    lines: [line1, line2, line3],
  }
}

/** Split â€œSUBJECT: â€¦â€ for hanging layout (bold label + wrapped body). */
function splitLegitimationSubjectLine(subjectText) {
  const s = String(subjectText ?? '')
  const m = s.match(/^\s*(SUBJECT\s*:\s*)([\s\S]*)$/i)
  if (m) return { label: 'SUBJECT:', body: (m[2] ?? '').trim() }
  return { label: 'SUBJECT:', body: s.trim() }
}
/** Example addressee for AUSF inputs (placeholder) and Court Decree OOT defaults */
const DEFAULT_AUSF_CD_TRANSMITTAL_ADDRESSEE_LINES = AUSF_TRANSMITTAL_ADDRESSEE_EXAMPLE_LINES

const AUSF_CD_RECIPIENT_SAFE_KEYS = ['recipientName', 'recipientTitle', 'recipientOffice', 'transmittalOotLine4', 'transmittalOotLine5', 'transmittalOotLine6']

function readAusfCdAddresseeFromSafe(src) {
  const s = src && typeof src === 'object' ? src : {}
  if (isLegacyAusfTransmittalRecipient(s)) {
    return AUSF_CD_RECIPIENT_SAFE_KEYS.map(() => '')
  }
  return AUSF_CD_RECIPIENT_SAFE_KEYS.map((k) => (s[k] != null ? String(s[k]) : ''))
}

/** AUSF: treat saved text that only matches the UI example as empty (not printed). */
function stripAusfExamplePlaceholderRows(rows) {
  return rows.map((line, i) => {
    const trimmed = String(line ?? '').trim()
    if (!trimmed) return ''
    const example = (DEFAULT_AUSF_CD_TRANSMITTAL_ADDRESSEE_LINES[i] ?? '').trim()
    if (trimmed.toUpperCase() === example.toUpperCase()) return ''
    return line
  })
}

/** Print/PDF: only non-empty addressee lines (first printed line gets emphasis). */
function filledAddresseePrintLines(rows, { uppercase = false } = {}) {
  return rows
    .map((line, i) => ({ i, text: String(line ?? '').trim() }))
    .filter(({ text }) => text.length > 0)
    .map(({ i, text }) => ({
      i,
      text: uppercase ? text.toUpperCase() : text,
    }))
}
const COURT_DECREE_DROPDOWN_3 = [
  'CERTIFICATE OF REGISTRATION OF COURT ORDER/DECREE',
  'CERTIFICATE OF REGISTRATION OF THE ORDER OF ADMINISTRATIVE ADOPTION',
  'CERTIFICATE OF REGISTRATION OF THE ORDER OF ADOPTION',
  'CERTIFIED PHOTOCOPY OF THE ORDER OF RESCISSION OF THE ADMINISTRATIVE ADOPTION',
  'ORIGINAL COPY OF THE CERTIFICATE OF REGISTRATION OF THE ORDER OF RESCISSION OF ADOPTION',
]
const COURT_DECREE_DROPDOWN_4 = [
  'CERTIFICATE OF AUTHENTICITY OF THE COURT ORDER/DECREE',
  'CERTIFICATE OF AUTHENTICITY OF THE ORDER OF ADMINISTRATIVE ADOPTION',
  'CERTIFICATE OF AUTHENTICITY OF THE ORDER OF ADOPTION',
  'CERTIFIED PHOTOCOPY OF THE CERTIFICATE OF FINALITY OF THE ORDER OF RESCISSION OF ADMINISTRATIVE ADOPTION',
  'ORIGINAL COPY OF THE CERTIFICATE OF AUTHENTICITY OF THE ORDER OF RESCISSION OF ADOPTION',
]
const COURT_DECREE_DROPDOWN_6 = [
  'CERTIFICATE OF AUTHENTICITY OF THE COURT ORDER/DECREE',
  'CERTIFICATE OF REGISTRATION OF COURT ORDER/DECREE',
  'CERTIFICATE OF REGISTRATION OF THE ORDER OF ADMINISTRATIVE ADOPTION',
  'CERTIFICATE OF REGISTRATION OF THE ORDER OF ADOPTION',
  'CERTIFIED PHOTOCOPY OF THE ORDER OF RESCISSION OF THE ADMINISTRATIVE ADOPTION',
  'ORIGINAL COPY OF THE CERTIFICATE OF REGISTRATION OF THE ORDER OF RESCISSION OF ADOPTION',
]
const COURT_DECREE_DROPDOWN_7 = [
  'LCR FORM 1A/2A/3A',
  'CERTIFIED PHOTOCOPY OF THE RESTORED RECTIFIED BIRTH RECORD',
  'NEW BIRTH CERTIFICATE',
]
const COURT_DECREE_OOT_DROPDOWN_1 = [
  'COURT ORDER/DECREE',
  'ORDER OF ADOPTION WITH ATTACHED CERTIFIED DRAFT NEW COLB',
  'ORDER OF ADMINISTRATIVE ADOPTION',
  'CERTIFIED PHOTOCOPY OF THE ANNOTATED NEW BIRTH CERTIFICATE',
  'CERTIFIED TRUE COPY OF THE ORDER OF RESCISSION OF ADOPTION',
]
const COURT_DECREE_OOT_DROPDOWN_2 = [
  'CERTIFICATE OF FINALITY',
  'CERTIFICATE OF FINALITY OF THE ORDER OF ADOPTION',
  'CERTIFICATE OF FINALITY OF THE ORDER OF ADMINISTRATIVE ADOPTION',
  'CERTIFIED PHOTOCOPY OF THE UNANNOTATED NEW BIRTH CERTIFICATE',
  'CERTIFIED TRUE COPY OF THE CERTIFICATE OF FINALITY OF THE ORDER OF RESCISSION OF ADOPTION',
]
const COURT_DECREE_OOT_DROPDOWN_3 = [
  'CERTIFICATE OF REGISTRATION OF COURT ORDER/DECREE',
  'CERTIFICATE OF REGISTRATION OF THE ORDER OF ADMINISTRATIVE ADOPTION',
  'CERTIFICATE OF REGISTRATION OF THE ORDER OF ADOPTION',
  'CERTIFIED PHOTOCOPY OF THE ORDER OF RESCISSION OF THE ADMINISTRATIVE ADOPTION',
  'ORIGINAL COPY OF THE CERTIFICATE OF REGISTRATION OF THE ORDER OF RESCISSION OF ADOPTION',
]
const COURT_DECREE_OOT_DROPDOWN_4 = [
  'CERTIFICATE OF AUTHENTICITY OF THE COURT ORDER/DECREE',
  'CERTIFICATE OF AUTHENTICITY OF THE ORDER OF ADMINISTRATIVE ADOPTION',
  'CERTIFICATE OF AUTHENTICITY OF THE ORDER OF ADOPTION',
  'CERTIFIED PHOTOCOPY OF THE CERTIFICATE OF FINALITY OF THE ORDER OF RESCISSION OF ADMINISTRATIVE ADOPTION',
  'ORIGINAL COPY OF THE CERTIFICATE OF AUTHENTICITY OF THE ORDER OF RESCISSION OF ADOPTION',
]
const LEGITIMATION_OOT_DROPDOWN_6 = [
  'AFFIDAVIT OF ACKNOWLEDGEMENT/PATERNITY',
  'BAPTISMAL',
  'MEDICAL RECORD(IMMUNIZATION CARD/HOSPITAL CERT.)',
  'INSURANCE POLICY(SSS/PAG-IBIG/PHILHEALTH)',
  'PICTURES',
  'SCHOOL RECORDS',
]

/**
 * Shared transmittal letter content. Use Transmittal.jsx (isOutOfTown=false) or OutOfTownTransmittal.jsx (isOutOfTown=true).
 * Pass optional attachments (e.g. COURT_DECREE_TRANSMITTAL_LIST) so the list is printed on the letter.
 * Pass optional checklistConfig { isOutOfTown, defaultLabels, listId } to render an editable checklist inside the document.
 * Pass optional onPersistDraft(partial) to save transmittal addressee fields (Court Decree / Legitimation print).
 * Print PDF uses larger text for elderly readability; header and footer are fixed in print.
 */
export default function TransmittalDoc({
  data,
  isOutOfTown,
  attachments: attachmentsProp,
  subjectLine,
  hideLineBelowDate,
  showLineAboveDate,
  checklistConfig,
  signatoryGapNone = false,
  onPersistDraft
}) {
  const safe = data && typeof data === 'object' ? data : {}
  const isPsaLetter = !isOutOfTown
  const childFull = fullName(safe.childFirst, safe.childMiddle, safe.fatherLast) || fullName(safe.childFirst, safe.childMiddle, safe.childLast) || 'â€”'
  const childFullCaps = (childFull !== 'â€”' ? childFull : '').toUpperCase()
  const transmittalDate = formatDateCert(safe.transmittalDate) || formatDateCert(safe.certificateIssuanceDate) || formatDateCert(new Date())
  const recipientAgency = (safe.recipientAgency || '').toUpperCase()
  const salutation = safe.transmittalSalutation || (isPsaLetter ? "Ma'am:" : "Sir/Ma'am:")
  // Local transmittal (AUSF): 7-item list; out-of-town: 11-item list; Court Decree local: 7 items (see print/constants)
  const defaultAttachments = isOutOfTown ? TRANSMITTAL_ATTACHMENTS_PSA : TRANSMITTAL_ATTACHMENTS_LOCAL
  const attachments = Array.isArray(attachmentsProp)
    ? attachmentsProp
    : defaultAttachments

  const [checklistItems, setChecklistItems] = useState(() => {
    if (!checklistConfig) return null
    const loaded = loadTransmittalChecklist(checklistConfig.isOutOfTown, checklistConfig.defaultLabels, checklistConfig.listId)
    if (loaded && loaded.length > 0) return loaded
    return labelsToChecklistItems(checklistConfig.defaultLabels || [])
  })

  useEffect(() => {
    if (!checklistConfig) return
    const loaded = loadTransmittalChecklist(checklistConfig.isOutOfTown, checklistConfig.defaultLabels, checklistConfig.listId)
    if (loaded && loaded.length > 0) setChecklistItems(loaded)
    else if (checklistConfig.defaultLabels?.length > 0) setChecklistItems(labelsToChecklistItems(checklistConfig.defaultLabels))
  }, [checklistConfig?.isOutOfTown, checklistConfig?.listId])

  const persistChecklist = useCallback(
    (nextItems) => {
      if (!checklistConfig) return
      setChecklistItems(nextItems)
      saveTransmittalChecklist(nextItems, checklistConfig.isOutOfTown, checklistConfig.listId)
    },
    [checklistConfig]
  )

  const onChecklistToggle = useCallback(
    (id) => {
      if (!checklistItems) return
      persistChecklist(checklistItems.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it)))
    },
    [checklistItems, persistChecklist]
  )

  const onChecklistLabelChange = useCallback(
    (id, value) => {
      if (!checklistItems) return
      persistChecklist(checklistItems.map((it) => (it.id === id ? { ...it, label: value } : it)))
    },
    [checklistItems, persistChecklist]
  )

  const onChecklistAdd = useCallback(() => {
    if (!checklistItems) return
    persistChecklist([...checklistItems, createEmptyChecklistItem(checklistItems.length)])
  }, [checklistItems, persistChecklist])

  const [removeConfirmId, setRemoveConfirmId] = useState(null)

  const requestChecklistRemove = useCallback(
    (id) => {
      if (!checklistItems || checklistItems.length <= 1) return
      setRemoveConfirmId(id)
    },
    [checklistItems]
  )

  const confirmChecklistRemove = useCallback(() => {
    if (!removeConfirmId || !checklistItems) return
    persistChecklist(checklistItems.filter((it) => it.id !== removeConfirmId))
    setRemoveConfirmId(null)
  }, [removeConfirmId, checklistItems, persistChecklist])

  const removeConfirmLabel = useMemo(() => {
    const item = checklistItems?.find((it) => it.id === removeConfirmId)
    return String(item?.label || '').trim()
  }, [checklistItems, removeConfirmId])

  const checkedLabels =
    checklistItems
      ?.filter((i) => i.completed && String(i.label || '').trim())
      .map((i) => String(i.label).trim()) || []
  const isCourtDecreeLocalChecklist =
    checklistConfig?.listId === 'court-decree-local' || checklistConfig?.listId === 'court-decree-local-v2'
  const isCourtDecreeOutOfTownChecklist = checklistConfig?.listId === 'court-decree-out-of-town'
  const isLegitimationOutOfTownChecklist = checklistConfig?.listId === 'legitimation-out-of-town'
  const getCourtDecreeDropdownOptionsByIndex = useCallback((zeroBasedIndex) => {
    if (isCourtDecreeLocalChecklist) {
      if (zeroBasedIndex === 2) return COURT_DECREE_DROPDOWN_3
      if (zeroBasedIndex === 3) return COURT_DECREE_DROPDOWN_4
      if (zeroBasedIndex === 5) return COURT_DECREE_DROPDOWN_6
      if (zeroBasedIndex === 6) return COURT_DECREE_DROPDOWN_7
      return null
    }
    if (isCourtDecreeOutOfTownChecklist) {
      if (zeroBasedIndex === 0) return COURT_DECREE_OOT_DROPDOWN_1
      if (zeroBasedIndex === 1) return COURT_DECREE_OOT_DROPDOWN_2
      if (zeroBasedIndex === 2) return COURT_DECREE_OOT_DROPDOWN_3
      if (zeroBasedIndex === 3) return COURT_DECREE_OOT_DROPDOWN_4
      return null
    }
    if (isLegitimationOutOfTownChecklist) {
      if (zeroBasedIndex === 5) return LEGITIMATION_OOT_DROPDOWN_6
      return null
    }
    return null
  }, [isCourtDecreeLocalChecklist, isCourtDecreeOutOfTownChecklist, isLegitimationOutOfTownChecklist])
  const listId = String(checklistConfig?.listId || '').trim()
  const isAusfTransmittal = !listId
  const isLegitimationTransmittal = Boolean(checklistConfig?.listId?.includes('legitimation'))
  const isCourtDecreeTransmittal = Boolean(checklistConfig?.listId?.includes('court-decree'))
  const displaySignatory = (
    safe.transmittalSignatoryName
    || DEFAULT_TRANSMITTAL_SIGNATORY.name
  ).toUpperCase()
  const signatoryTitle =
    safe.transmittalSignatoryTitle
    || DEFAULT_TRANSMITTAL_SIGNATORY.title
  const useAdjustedTransmittalLines = isAusfTransmittal || isLegitimationTransmittal || isCourtDecreeTransmittal
  const subject =
    subjectLine != null && subjectLine !== ''
      ? subjectLine
      : `SUBJECT: ENDORSEMENT OF AFFIDAVIT TO USE SURNAME OF\nFATHER IN FAVOR OF ${childFullCaps || childFull}`
  /** Court decree only: fixed addressee block directly above SUBJECT (~2 line space below). */
  const courtDecreeHeaderAboveSubjectGapClass = 'mb-[2em]'
  /** Legitimation local transmittal: space before SUBJECT. */
  const legitimationHeaderAboveSubjectGapClass = 'mb-[1.75em]'
  const isLegOot = isLegitimationTransmittal && isOutOfTown
  const isAusfOot = isOutOfTown && !isCourtDecreeTransmittal && !isLegitimationTransmittal
  const showCourtDecreeOot = isCourtDecreeTransmittal && isOutOfTown
  const showStyledOotAddressee = isLegOot || isAusfOot || showCourtDecreeOot

  const usesAusfCdSixLineRecipient =
    (isAusfTransmittal && isPsaLetter) || isAusfOot || showCourtDecreeOot

  const [ausfCdRecipientLines, setAusfCdRecipientLines] = useState(() => readAusfCdAddresseeFromSafe(safe))
  useEffect(() => {
    if (!usesAusfCdSixLineRecipient) return
    setAusfCdRecipientLines(readAusfCdAddresseeFromSafe(safe))
  }, [
    usesAusfCdSixLineRecipient,
    safe.recipientName,
    safe.recipientTitle,
    safe.recipientOffice,
    safe.transmittalOotLine4,
    safe.transmittalOotLine5,
    safe.transmittalOotLine6,
  ])

  const [legOotLines, setLegOotLines] = useState(() => readLegOotLinesFromSafe(safe))
  useEffect(() => {
    if (!isLegOot) return
    setLegOotLines(readLegOotLinesFromSafe(safe))
  }, [
    isLegOot,
    safe.recipientName,
    safe.recipientTitle,
    safe.recipientOffice,
    safe.transmittalOotLine4,
    safe.transmittalOotLine5,
    safe.transmittalOotLine6,
  ])

  const [attnPrefixDraft, setAttnPrefixDraft] = useState(() => readAttnBlockDraftFrom(safe).prefix)
  const [attnDetailDraft, setAttnDetailDraft] = useState(() => readAttnBlockDraftFrom(safe).lines)
  const showTransmittalAttnBlock =
    isLegitimationTransmittal || isAusfTransmittal || isCourtDecreeTransmittal

  useEffect(() => {
    if (!showTransmittalAttnBlock) return
    const { prefix, lines } = readAttnBlockDraftFrom(safe)
    setAttnPrefixDraft(prefix)
    setAttnDetailDraft(lines)
  }, [
    showTransmittalAttnBlock,
    safe.transmittalAttnPrefix,
    safe.transmittalAttnLine1,
    safe.transmittalAttnLine2,
    safe.transmittalAttnLine3,
  ])

  const ausfLocalLine1 = (ausfCdRecipientLines[0] || '').trim().toUpperCase()
  const ausfLocalLine2 = (ausfCdRecipientLines[1] || '').trim().toUpperCase()
  const ausfLocalLine3 = (ausfCdRecipientLines[2] || '').trim().toUpperCase()

  const needsPsaEditor = (isCourtDecreeTransmittal || isLegitimationTransmittal) && !isOutOfTown
  const readPsaDraftFrom = useCallback(
    (src) => [
      src.transmittalToPsaLine1 != null ? String(src.transmittalToPsaLine1) : '',
      src.transmittalToPsaLine2 != null ? String(src.transmittalToPsaLine2) : '',
      src.transmittalToPsaLine3 != null ? String(src.transmittalToPsaLine3) : '',
      src.transmittalToPsaLine4 != null ? String(src.transmittalToPsaLine4) : '',
      src.transmittalToPsaLine5 != null ? String(src.transmittalToPsaLine5) : '',
      src.transmittalToPsaLine6 != null ? String(src.transmittalToPsaLine6) : '',
    ],
    []
  )
  const [psaDraft, setPsaDraft] = useState(() => readPsaDraftFrom(safe))
  useEffect(() => {
    if (!needsPsaEditor) return
    setPsaDraft(readPsaDraftFrom(safe))
  }, [
    needsPsaEditor,
    readPsaDraftFrom,
    safe.transmittalToPsaLine1,
    safe.transmittalToPsaLine2,
    safe.transmittalToPsaLine3,
    safe.transmittalToPsaLine4,
    safe.transmittalToPsaLine5,
    safe.transmittalToPsaLine6,
  ])

  const courtDecreePsaPrintLines = filledAddresseePrintLines(psaDraft)
  const ausfPsaPrintLines = filledAddresseePrintLines(
    stripAusfExamplePlaceholderRows(ausfCdRecipientLines),
    { uppercase: true },
  )
  const courtDecreeOotPsaPrintLines = filledAddresseePrintLines(ausfCdRecipientLines)

  const savePsaFields = useCallback(() => {
    if (typeof onPersistDraft !== 'function') return
    if (isLegitimationTransmittal) {
      onPersistDraft({
        transmittalToPsaLine1: psaDraft[0],
        transmittalToPsaLine2: psaDraft[1],
        transmittalToPsaLine3: psaDraft[2],
        transmittalToPsaLine4: psaDraft[3],
        transmittalToPsaLine5: psaDraft[4],
        transmittalToPsaLine6: psaDraft[5],
      })
      return
    }
    onPersistDraft({
      transmittalToPsaLine1: psaDraft[0],
      transmittalToPsaLine2: psaDraft[1],
      transmittalToPsaLine3: psaDraft[2],
      transmittalToPsaLine4: psaDraft[3],
      transmittalToPsaLine5: psaDraft[4],
      transmittalToPsaLine6: psaDraft[5],
    })
  }, [onPersistDraft, psaDraft, isLegitimationTransmittal])

  const saveAusfCdRecipientFields = useCallback(() => {
    if (typeof onPersistDraft !== 'function') return
    onPersistDraft({
      recipientName: ausfCdRecipientLines[0],
      recipientTitle: ausfCdRecipientLines[1],
      recipientOffice: ausfCdRecipientLines[2],
      transmittalOotLine4: ausfCdRecipientLines[3],
      transmittalOotLine5: ausfCdRecipientLines[4],
      transmittalOotLine6: ausfCdRecipientLines[5],
    })
  }, [onPersistDraft, ausfCdRecipientLines])

  const saveLegOotLines = useCallback(() => {
    if (typeof onPersistDraft !== 'function') return
    onPersistDraft({
      recipientName: legOotLines[0],
      recipientTitle: legOotLines[1],
      recipientOffice: legOotLines[2],
      transmittalOotLine4: legOotLines[3],
      transmittalOotLine5: legOotLines[4],
      transmittalOotLine6: legOotLines[5],
    })
  }, [onPersistDraft, legOotLines])

  const saveAttnFields = useCallback(() => {
    if (typeof onPersistDraft !== 'function') return
    onPersistDraft({
      transmittalAttnPrefix: attnPrefixDraft,
      transmittalAttnLine1: attnDetailDraft[0],
      transmittalAttnLine2: attnDetailDraft[1],
      transmittalAttnLine3: attnDetailDraft[2],
    })
  }, [onPersistDraft, attnPrefixDraft, attnDetailDraft])

  const headerRuleClass = isLegitimationTransmittal
    ? 'border-black legitimation-transmittal-header-rule'
    : 'border-black my-2'

  /** Screen: looks like body text; print/PDF: hidden in favor of .print-only lines */
  const inlineAddrInput =
    'no-print w-full max-w-full border-0 border-b border-dashed border-transparent bg-transparent px-0 py-0.5 text-left outline-none ring-0 transition-colors hover:border-gray-300 focus:border-gray-500 placeholder:uppercase placeholder:text-gray-400'
  /** ATTN prefix (ATTN:): bold, caps in print; narrow field */
  const inlineAttnPrefixInput =
    'no-print max-w-[7.5ch] min-w-0 shrink-0 border-0 border-b border-dashed border-transparent bg-transparent px-0 py-0 text-left font-sans font-bold uppercase leading-[1.12] outline-none ring-0 transition-colors hover:border-gray-300 focus:border-gray-500 placeholder:text-slate-400 placeholder:uppercase'
  /** ATTN name / title lines: normal weight, title case */
  const inlineAttnDetailInput =
    'no-print w-full min-w-0 max-w-full border-0 border-b border-dashed border-transparent bg-transparent px-0 py-0 text-left font-sans font-normal normal-case leading-[1.12] outline-none ring-0 transition-colors hover:border-gray-300 focus:border-gray-500 placeholder:text-slate-400 placeholder:normal-case'
  /** Legitimation addressee: first filled line (for print emphasis) */
  const isFirstFilledLegitimationPsaLine = (i) => {
    const t = String(psaDraft[i] ?? '').trim()
    if (!t) return false
    for (let j = 0; j < i; j++) {
      if (String(psaDraft[j] ?? '').trim()) return false
    }
    return true
  }
  const isFirstFilledLegOotLine = (i) => {
    const t = String(legOotLines[i] ?? '').trim()
    if (!t) return false
    for (let j = 0; j < i; j++) {
      if (String(legOotLines[j] ?? '').trim()) return false
    }
    return true
  }

  /** Rows to show: filled lines plus one empty slot below the last filled (min 1, max 6). */
  const legitimationPsaRowIndices = (() => {
    let last = -1
    for (let k = 0; k < 6; k++) {
      if (String(psaDraft[k] ?? '').trim()) last = k
    }
    const count = last < 0 ? 1 : Math.min(6, last + 2)
    return Array.from({ length: count }, (_, k) => k)
  })()
  const legitimationOotRowIndices = (() => {
    let last = -1
    for (let k = 0; k < 6; k++) {
      if (String(legOotLines[k] ?? '').trim()) last = k
    }
    const count = last < 0 ? 1 : Math.min(6, last + 2)
    return Array.from({ length: count }, (_, k) => k)
  })()

  const attnPrint = resolveAttnPrintBlock(attnPrefixDraft, attnDetailDraft, {
    uppercasePrefix: isLegitimationTransmittal,
  })
  const attnPrefixPrint = attnPrint.prefix
  const attnDetailPrintLines = attnPrint.detailLines

  const psaBlockBottomClass = showTransmittalAttnBlock
    ? 'mb-0'
    : isAusfOot
      ? 'mb-6'
      : courtDecreeHeaderAboveSubjectGapClass

  const legitimationSubjectParts = isLegitimationTransmittal ? splitLegitimationSubjectLine(subject) : null

  return (
    <div
      className={[
        'ausf-doc print-doc print-doc-transmittal print-doc-transmittal-elderly bg-white text-black max-w-[210mm] mx-auto px-6 py-4 leading-normal flex flex-col min-h-[297mm] text-base',
        isLegitimationTransmittal ? 'legitimation-transmittal-doc' : '',
        isCourtDecreeTransmittal ? 'court-decree-transmittal-doc' : '',
        isAusfTransmittal ? 'ausf-transmittal-doc' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="print-doc-header">
        <PrintHeaderRow />
        {!hideLineBelowDate && <hr className={headerRuleClass} />}
        {showLineAboveDate && <hr className={headerRuleClass} />}
        {isCourtDecreeTransmittal ? (
          <p className="court-decree-transmittal-date font-bold text-sm text-left mt-2 mb-3 m-0">{transmittalDate}</p>
        ) : null}
        {isLegitimationTransmittal ? (
          <p className="legitimation-transmittal-print-date font-bold text-sm text-left m-0">{transmittalDate}</p>
        ) : null}
        {!isCourtDecreeTransmittal && !isLegitimationTransmittal ? (
          <p className="ausf-transmittal-print-date font-bold text-sm text-left m-0">{transmittalDate}</p>
        ) : null}
      </div>

      <div className="print-doc-body flex flex-col flex-1 min-h-0">
        {isCourtDecreeTransmittal && !isOutOfTown ? (
          <div className={`court-decree-transmittal-psa-header mt-4 pl-0 pr-0 text-left text-[12pt] leading-none normal-case ${psaBlockBottomClass}`}>
            <p className="print-only court-decree-transmittal-psa-block m-0 p-0 text-left leading-none normal-case">
              {courtDecreePsaPrintLines.map(({ i, text }, printIdx) => (
                <React.Fragment key={`court-decree-psa-print-${i}`}>
                  {printIdx > 0 ? <br /> : null}
                  <span className={printIdx === 0 ? 'court-decree-transmittal-psa-name font-bold' : ''}>
                    {text}
                  </span>
                </React.Fragment>
              ))}
            </p>
            <div className="no-print space-y-0">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={`court-decree-psa-edit-${i}`} className="m-0 leading-tight">
                  <input
                    type="text"
                    spellCheck={false}
                    aria-label={i === 0 ? 'PSA addressee line 1' : `PSA addressee line ${i + 1}`}
                    className={`${inlineAddrInput} normal-case placeholder:normal-case ${i === 0 ? 'court-decree-transmittal-psa-name font-bold text-[12pt]' : 'text-[12pt]'}`}
                    value={psaDraft[i]}
                    onChange={(e) =>
                      setPsaDraft((prev) => {
                        const next = [...prev]
                        while (next.length < 6) next.push('')
                        next[i] = e.target.value
                        return next
                      })
                    }
                    placeholder={DEFAULT_TRANSMITTAL_PSA_LINES[i]}
                  />
                </div>
              ))}
            </div>
            {typeof onPersistDraft === 'function' ? (
              <div className="no-print mt-2">
                <button
                  type="button"
                  onClick={savePsaFields}
                  className="text-sm font-medium text-slate-700 underline decoration-slate-400 underline-offset-2 hover:text-slate-900"
                >
                  Save to draft
                </button>
              </div>
            ) : null}
          </div>
        ) : isLegitimationTransmittal && !isOutOfTown ? (
          <div className={`legitimation-transmittal-psa-header mt-2 text-sm leading-tight space-y-0 text-left ${legitimationHeaderAboveSubjectGapClass}`}>
            {legitimationPsaRowIndices.map((i) => {
              const trimmed = String(psaDraft[i] ?? '').trim()
              const showPrintLine = trimmed.length > 0
              return (
                <div key={i} className="m-0 leading-tight">
                  {showPrintLine ? (
                    <p
                      className={`print-only m-0 leading-tight uppercase ${isFirstFilledLegitimationPsaLine(i) ? 'font-bold' : ''}`}
                    >
                      {trimmed.toUpperCase()}
                    </p>
                  ) : null}
                  <input
                    type="text"
                    spellCheck={false}
                    aria-label={i === 0 ? 'PSA addressee line 1' : `PSA addressee line ${i + 1}`}
                    className={`${inlineAddrInput} uppercase ${isFirstFilledLegitimationPsaLine(i) ? 'font-bold' : ''}`}
                    value={psaDraft[i] ?? ''}
                    onChange={(e) =>
                      setPsaDraft((prev) => {
                        const next = [...prev]
                        while (next.length < 6) next.push('')
                        next[i] = e.target.value
                        return next
                      })
                    }
                    placeholder={DEFAULT_LEGITIMATION_TRANSMITTAL_ADDRESSEE_LINES[i]}
                  />
                </div>
              )
            })}            {typeof onPersistDraft === 'function' ? (
              <div className="no-print mt-2">
                <button
                  type="button"
                  onClick={savePsaFields}
                  className="text-sm font-medium text-slate-700 underline decoration-slate-400 underline-offset-2 hover:text-slate-900"
                >
                  Save to draft
                </button>
              </div>
            ) : null}
          </div>
        ) : showStyledOotAddressee && isLegOot ? (
          <div
            className={[
              'oot-transmittal-addressee-header font-serif text-left flex flex-col gap-0 mb-6 max-w-full mt-2 text-base leading-snug',
              'legitimation-oot-addressee-print',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {legitimationOotRowIndices.map((i) => {
              const trimmed = String(legOotLines[i] ?? '').trim()
              const showPrintLine = trimmed.length > 0
              return (
                <div key={i} className="m-0 text-left">
                  {showPrintLine ? (
                    <p
                      className={`print-only m-0 text-left uppercase tracking-wide ${isFirstFilledLegOotLine(i) ? 'font-bold' : 'font-normal'}`}
                    >
                      {trimmed.toUpperCase()}
                    </p>
                  ) : null}
                  <input
                    type="text"
                    spellCheck={false}
                    aria-label={`Legitimation out-of-town addressee line ${i + 1}`}
                    className={`${inlineAddrInput} ${isFirstFilledLegOotLine(i) ? 'font-bold' : 'font-normal'} uppercase tracking-wide`}
                    value={legOotLines[i] ?? ''}
                    onChange={(e) =>
                      setLegOotLines((prev) => {
                        const next = [...prev]
                        while (next.length < 6) next.push('')
                        next[i] = e.target.value
                        return next
                      })
                    }
                    placeholder={DEFAULT_LEGITIMATION_TRANSMITTAL_ADDRESSEE_LINES[i]}
                  />
                </div>
              )
            })}            {typeof onPersistDraft === 'function' ? (
              <div className="no-print mt-2">
                <button
                  type="button"
                  onClick={saveLegOotLines}
                  className="text-sm font-medium text-slate-700 underline decoration-slate-400 underline-offset-2 hover:text-slate-900"
                >
                  Save to draft
                </button>
              </div>
            ) : null}
          </div>
        ) : usesAusfCdSixLineRecipient && isAusfTransmittal ? (
          <div
            className={`ausf-transmittal-psa-header mt-4 pl-0 pr-0 text-left text-[12pt] uppercase ${psaBlockBottomClass}`}
          >
            <p className="print-only ausf-transmittal-psa-block m-0 p-0 text-left uppercase">
              {ausfPsaPrintLines.map(({ i, text }, printIdx) => (
                <React.Fragment key={`ausf-psa-print-${i}`}>
                  {printIdx > 0 ? <br /> : null}
                  <span className={printIdx === 0 ? 'ausf-transmittal-psa-name' : 'ausf-transmittal-psa-line'}>
                    {text}
                  </span>
                </React.Fragment>
              ))}
            </p>
            <div className="no-print space-y-0">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={`ausf-psa-edit-${i}`} className="m-0 leading-tight">
                  <input
                    type="text"
                    spellCheck={false}
                    aria-label={i === 0 ? 'PSA addressee line 1' : `PSA addressee line ${i + 1}`}
                    className={`${inlineAddrInput} uppercase placeholder:uppercase ${i === 0 ? 'ausf-transmittal-psa-name text-[12pt]' : 'ausf-transmittal-psa-line text-[12pt]'}`}
                    value={ausfCdRecipientLines[i] ?? ''}
                    onChange={(e) =>
                      setAusfCdRecipientLines((prev) => {
                        const next = [...prev]
                        while (next.length < 6) next.push('')
                        next[i] = e.target.value
                        return next
                      })
                    }
                    placeholder={(DEFAULT_AUSF_CD_TRANSMITTAL_ADDRESSEE_LINES[i] ?? '').toUpperCase()}
                  />
                </div>
              ))}
            </div>
            {typeof onPersistDraft === 'function' ? (
              <div className="no-print mt-2">
                <button
                  type="button"
                  onClick={saveAusfCdRecipientFields}
                  className="text-sm font-medium text-slate-700 underline decoration-slate-400 underline-offset-2 hover:text-slate-900"
                >
                  Save to draft
                </button>
              </div>
            ) : null}
          </div>
        ) : usesAusfCdSixLineRecipient ? (
          <div
            className={`court-decree-transmittal-psa-header mt-4 pl-0 pr-0 text-left text-[12pt] leading-none normal-case ${psaBlockBottomClass}`}
          >
            <p className="print-only court-decree-transmittal-psa-block m-0 p-0 text-left leading-none normal-case">
              {courtDecreeOotPsaPrintLines.map(({ i, text }, printIdx) => (
                <React.Fragment key={`court-decree-oot-psa-print-${i}`}>
                  {printIdx > 0 ? <br /> : null}
                  <span className={printIdx === 0 ? 'court-decree-transmittal-psa-name font-bold' : ''}>
                    {text}
                  </span>
                </React.Fragment>
              ))}
            </p>
            <div className="no-print space-y-0">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={`court-decree-oot-psa-edit-${i}`} className="m-0 leading-tight">
                  <input
                    type="text"
                    spellCheck={false}
                    aria-label={i === 0 ? 'PSA addressee line 1' : `PSA addressee line ${i + 1}`}
                    className={`${inlineAddrInput} normal-case placeholder:normal-case ${i === 0 ? 'court-decree-transmittal-psa-name font-bold text-[12pt]' : 'text-[12pt]'}`}
                    value={ausfCdRecipientLines[i] ?? ''}
                    onChange={(e) =>
                      setAusfCdRecipientLines((prev) => {
                        const next = [...prev]
                        while (next.length < 6) next.push('')
                        next[i] = e.target.value
                        return next
                      })
                    }
                    placeholder={DEFAULT_AUSF_CD_TRANSMITTAL_ADDRESSEE_LINES[i]}
                  />
                </div>
              ))}
            </div>
            {typeof onPersistDraft === 'function' ? (
              <div className="no-print mt-2">
                <button
                  type="button"
                  onClick={saveAusfCdRecipientFields}
                  className="text-sm font-medium text-slate-700 underline decoration-slate-400 underline-offset-2 hover:text-slate-900"
                >
                  Save to draft
                </button>
              </div>
            ) : null}
          </div>
        ) : isPsaLetter && !isAusfTransmittal ? (
          <div className="mb-3 space-y-0.5">
            <p className="font-bold uppercase">{ausfLocalLine1}</p>
            <p className="uppercase">{ausfLocalLine2}</p>
            <p className="uppercase">{ausfLocalLine3}</p>
            {recipientAgency && <p>{recipientAgency}</p>}
          </div>
        ) : null}

        {showTransmittalAttnBlock ? (
          <TransmittalAttnBlock
            attnPrefixDraft={attnPrefixDraft}
            setAttnPrefixDraft={setAttnPrefixDraft}
            attnDetailDraft={attnDetailDraft}
            setAttnDetailDraft={setAttnDetailDraft}
            attnPrefixPrint={attnPrefixPrint}
            attnDetailPrintLines={attnDetailPrintLines}
            inlineAttnPrefixInput={inlineAttnPrefixInput}
            inlineAttnDetailInput={inlineAttnDetailInput}
            onPersistDraft={onPersistDraft}
            saveAttnFields={saveAttnFields}
            topGapClass="mt-[1em]"
            bottomGapClass={isLegitimationTransmittal ? 'mb-[1.25em]' : 'mb-[2em]'}
          />
        ) : null}

        {isLegitimationTransmittal ? (
          <div className="legitimation-transmittal-subject-hanging text-left text-[12pt] font-sans uppercase leading-snug">
            <span className="legitimation-transmittal-subject-label col-start-1 row-start-1 shrink-0 font-bold whitespace-nowrap">
              {legitimationSubjectParts.label}
            </span>
            <span className="legitimation-transmittal-subject-body col-start-2 row-start-1 min-w-0 font-normal whitespace-normal break-words">
              {legitimationSubjectParts.body}
            </span>
          </div>
        ) : (
          <p
            className={
              isCourtDecreeTransmittal
                ? 'court-decree-transmittal-subject-line font-bold uppercase text-[12pt] mb-[2em]'
                : 'ausf-transmittal-subject-line font-bold uppercase whitespace-pre-line mb-0'
            }
          >
            {subject}
          </p>
        )}

        <p
          className={
            isLegitimationTransmittal
              ? 'legitimation-transmittal-salutation mb-6'
              : isAusfTransmittal
                ? 'ausf-transmittal-salutation mb-6'
                : 'mb-6'
          }
        >
          {salutation}
        </p>

        <p className="mb-6">
          Respectfully forwarding to your good office the herein attached documents in relation to the above-cited subject, to wit:
        </p>

        <div className={`flex justify-center ${useAdjustedTransmittalLines ? 'mb-0' : 'mb-8'}`}>
          {checklistItems ? (
            <>
              <div className="no-print w-full max-w-2xl">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Attachments: all items are included by default. Uncheck the items you want to remove from the printed letter.
                </p>
                <ol className="list-none space-y-3 text-left">
                  {checklistItems.map((item, i) => (
                    <li
                      key={item.id}
                      className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-1"
                    >
                      <span className="w-6 shrink-0 text-left text-sm font-medium text-gray-700 sm:pt-2">
                        {i + 1}.
                      </span>
                      {(() => {
                        const options = getCourtDecreeDropdownOptionsByIndex(i)
                        if (!options) {
                          return (
                            <input
                              type="text"
                              className="w-full sm:flex-1 sm:min-w-[12rem] border border-gray-300 px-2 py-1.5 text-sm uppercase rounded"
                              value={item.label}
                              onChange={(e) => onChecklistLabelChange(item.id, e.target.value)}
                              placeholder="Attachment label"
                            />
                          )
                        }
                        const selectOptions = options.includes(item.label) ? options : [item.label, ...options]
                        return (
                          <select
                            className="w-full sm:flex-1 sm:basis-[20rem] sm:min-w-0 max-w-full border border-gray-300 px-2 py-1.5 text-sm uppercase rounded bg-white truncate"
                            value={item.label}
                            onChange={(e) => onChecklistLabelChange(item.id, e.target.value)}
                            title={item.label}
                          >
                            {selectOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )
                      })()}
                      <div className="flex flex-wrap items-center gap-2 sm:pt-1">
                        <label className="flex items-center gap-1.5 shrink-0 cursor-pointer">
                          <input type="checkbox" checked={!!item.completed} onChange={() => onChecklistToggle(item.id)} className="w-4 h-4 shrink-0" />
                          <span className="text-xs text-gray-600">Include in print (uncheck to remove)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => requestChecklistRemove(item.id)}
                          disabled={checklistItems.length <= 1}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label={`Remove attachment row ${i + 1}`}
                        >
                          <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  onClick={onChecklistAdd}
                  className="mt-3 inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg border border-[var(--primary-blue)] bg-white px-3 py-2 text-sm font-medium text-[var(--primary-blue)] hover:bg-[var(--primary-blue)]/10 transition-colors"
                  aria-label="Add attachment row"
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
                  </svg>
                  Add attachment
                </button>
              </div>
              <ol
                className={[
                  'print-only list-decimal list-inside space-y-1 text-left w-[28rem]',
                  isAusfTransmittal ? 'ausf-transmittal-attachments-print' : '',
                  isCourtDecreeTransmittal ? 'court-decree-transmittal-attachments-print' : '',
                  isLegitimationTransmittal ? 'legitimation-transmittal-attachments-print' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {checkedLabels.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            </>
          ) : (
            <ol className="list-decimal list-inside space-y-1 text-left w-[28rem]">
              {attachments.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          )}
        </div>

        {useAdjustedTransmittalLines ? (
          <div className="transmittal-closing-block text-left mb-6">
            <p className="transmittal-closing-action-line m-0">For appropriate action.</p>
            <p className="transmittal-closing-respectfully-line m-0">Respectfully yours,</p>
            <div className="transmittal-closing-signatory flex flex-col gap-0 pt-0 m-0 p-0">
              <div className="font-bold uppercase" style={{ lineHeight: '1.1', margin: 0, padding: 0 }}>{displaySignatory}</div>
              <div className="text-sm" style={{ lineHeight: '1.1', margin: 0, padding: 0 }}>{signatoryTitle}</div>
            </div>
          </div>
        ) : null}

        <div className="min-h-[2rem] flex-1" aria-hidden />
      </div>

      <footer
        className={`print-doc-footer-wrap mt-auto flex flex-col flex-shrink-0 ${useAdjustedTransmittalLines ? 'pt-0' : 'pt-4'}`}
        role="contentinfo"
      >
        {!useAdjustedTransmittalLines ? (
          <div className="text-left mb-6">
            <p className="mb-4">For appropriate action.</p>
            <p className="mb-12">Respectfully yours,</p>
            <div
              className={`flex flex-col ${signatoryGapNone || checklistConfig?.isOutOfTown || checklistConfig?.listId?.includes('legitimation') ? 'gap-0 pt-0' : 'gap-0 pt-1'}`}
              style={{ gap: 0 }}
            >
              <div className="font-bold uppercase" style={{ lineHeight: '1.1', margin: 0, padding: 0 }}>{displaySignatory}</div>
              <div className="text-sm" style={{ lineHeight: '1.1', margin: 0, padding: 0 }}>{signatoryTitle}</div>
            </div>
          </div>
        ) : null}
        <DocumentFooter contactPhone={safe.contactPhone} contactEmail={safe.contactEmail} />
      </footer>
      {removeConfirmId ? (
        <ConfirmRemoveRowModal
          title="Remove attachment?"
          message={
            removeConfirmLabel
              ? `Are you sure you want to remove "${removeConfirmLabel}" from the attachment list? This row will be deleted from the checklist.`
              : 'Are you sure you want to remove this attachment row from the list?'
          }
          onCancel={() => setRemoveConfirmId(null)}
          onConfirm={confirmChecklistRemove}
        />
      ) : null}
    </div>
  )
}
