import React, { useState, useCallback, useEffect } from 'react'
import { formatDateCert, fullName } from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter, TRANSMITTAL_ATTACHMENTS_LOCAL, TRANSMITTAL_ATTACHMENTS_PSA } from '../../../components/print'
import { loadTransmittalChecklist, saveTransmittalChecklist, labelsToChecklistItems } from '../lib/transmittalChecklistStorage'

/** Default four-line “To PSA” block for Court Decree + Legitimation local transmittal */
const DEFAULT_TRANSMITTAL_PSA_LINES = [
  'ENGR. MARIZZA B. GRANDE',
  'OIC – Assistant National Statistician',
  'Civil Registration Services',
  'Philippine Statistics Authority',
]

const DEFAULT_LEGITIMATION_OOT_LINES = ['EVANGELYN T. ABATAYO', 'CITY CIVIL REGISTRAR', 'CEBU CITY, CEBU']
const DEFAULT_COURT_DECREE_OOT_LINES = ['ELMERA V. BROCA', 'MUNICIPAL CIVIL REGISTRAR', 'BAROY, LANAO DEL NORTE']
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

/** AUSF local transmittal — default “To” block when draft fields are blank */
const DEFAULT_AUSF_LOCAL_TRANSMITTAL = {
  recipientName: 'KANYE WEST',
  recipientTitle: 'LAAGAN',
  recipientOffice: 'ILIGAN CITY, ILIGAN',
}

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
  const childFull = fullName(safe.childFirst, safe.childMiddle, safe.fatherLast) || fullName(safe.childFirst, safe.childMiddle, safe.childLast) || '—'
  const childFullCaps = (childFull !== '—' ? childFull : '').toUpperCase()
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

  const checkedLabels = checklistItems?.filter((i) => i.completed).map((i) => i.label) || []
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
  const defaultSignatoryName = 'LORELIE L. CANTO'
  const defaultSignatoryTitle = 'Registration Officer IV'
  const displaySignatory = (safe.transmittalSignatoryName || defaultSignatoryName).toUpperCase()
  const signatoryTitle = safe.transmittalSignatoryTitle || defaultSignatoryTitle
  const listId = String(checklistConfig?.listId || '').trim()
  const isAusfTransmittal = !listId
  const isLegitimationTransmittal = Boolean(checklistConfig?.listId?.includes('legitimation'))
  const isCourtDecreeTransmittal = Boolean(checklistConfig?.listId?.includes('court-decree'))
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

  const ootDefaults = showCourtDecreeOot ? DEFAULT_COURT_DECREE_OOT_LINES : isLegOot ? DEFAULT_LEGITIMATION_OOT_LINES : ['', '', '']

  const [ootDraft, setOotDraft] = useState({
    n: safe.recipientName != null ? String(safe.recipientName) : '',
    t: safe.recipientTitle != null ? String(safe.recipientTitle) : '',
    o: safe.recipientOffice != null ? String(safe.recipientOffice) : '',
  })
  useEffect(() => {
    setOotDraft({
      n: safe.recipientName != null ? String(safe.recipientName) : '',
      t: safe.recipientTitle != null ? String(safe.recipientTitle) : '',
      o: safe.recipientOffice != null ? String(safe.recipientOffice) : '',
    })
  }, [safe.recipientName, safe.recipientTitle, safe.recipientOffice])

  const ootLine1 = (ootDraft.n || '').trim() || ootDefaults[0] || '\u00a0'
  const ootLine2 = (ootDraft.t || '').trim() || ootDefaults[1] || '\u00a0'
  const ootLine3 = (ootDraft.o || '').trim() || ootDefaults[2] || '\u00a0'

  /** AUSF local “To” lines for print (draft + defaults) */
  const ausfLocalLine1 = ((ootDraft.n || '').trim() || DEFAULT_AUSF_LOCAL_TRANSMITTAL.recipientName).toUpperCase()
  const ausfLocalLine2 = ((ootDraft.t || '').trim() || DEFAULT_AUSF_LOCAL_TRANSMITTAL.recipientTitle).toUpperCase()
  const ausfLocalLine3 = ((ootDraft.o || '').trim() || DEFAULT_AUSF_LOCAL_TRANSMITTAL.recipientOffice).toUpperCase()

  const needsPsaEditor = (isCourtDecreeTransmittal || isLegitimationTransmittal) && !isOutOfTown
  const readPsaDraftFrom = useCallback(
    (src) => [
      src.transmittalToPsaLine1 != null ? String(src.transmittalToPsaLine1) : '',
      src.transmittalToPsaLine2 != null ? String(src.transmittalToPsaLine2) : '',
      src.transmittalToPsaLine3 != null ? String(src.transmittalToPsaLine3) : '',
      src.transmittalToPsaLine4 != null ? String(src.transmittalToPsaLine4) : '',
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
  ])

  const psaLinesForLetter = [0, 1, 2, 3].map((i) => (psaDraft[i] || '').trim() || DEFAULT_TRANSMITTAL_PSA_LINES[i])

  const savePsaFields = useCallback(() => {
    if (typeof onPersistDraft !== 'function') return
    onPersistDraft({
      transmittalToPsaLine1: psaDraft[0],
      transmittalToPsaLine2: psaDraft[1],
      transmittalToPsaLine3: psaDraft[2],
      transmittalToPsaLine4: psaDraft[3],
    })
  }, [onPersistDraft, psaDraft])

  const saveOotFields = useCallback(() => {
    if (typeof onPersistDraft !== 'function') return
    onPersistDraft({
      recipientName: ootDraft.n,
      recipientTitle: ootDraft.t,
      recipientOffice: ootDraft.o,
    })
  }, [onPersistDraft, ootDraft])

  const headerRuleClass = isLegitimationTransmittal
    ? 'border-black legitimation-transmittal-header-rule'
    : 'border-black my-2'

  /** Screen: looks like body text; print/PDF: hidden in favor of .print-only lines */
  const inlineAddrInput =
    'no-print w-full max-w-full border-0 border-b border-dashed border-transparent bg-transparent px-0 py-0.5 text-left outline-none ring-0 transition-colors hover:border-gray-300 focus:border-gray-500 placeholder:uppercase placeholder:text-gray-400'
  /** AUSF local addressee: dashed rule always visible (matches paper template) */
  const inlineAusfLocalAddrInput =
    'no-print w-full max-w-full border-0 border-b border-dashed border-slate-400/90 bg-transparent px-0 py-0.5 text-left outline-none ring-0 transition-colors focus:border-slate-600 placeholder:uppercase placeholder:text-gray-400'

  return (
    <div
      className={[
        'ausf-doc print-doc print-doc-transmittal print-doc-transmittal-elderly bg-white text-black max-w-[210mm] mx-auto px-6 py-4 leading-normal flex flex-col min-h-[297mm] text-base',
        isLegitimationTransmittal ? 'legitimation-transmittal-doc' : '',
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
          <div className={`court-decree-transmittal-psa-header mt-4 text-sm leading-tight space-y-0 text-left ${courtDecreeHeaderAboveSubjectGapClass}`}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="m-0 leading-tight">
                <p
                  className={`print-only m-0 leading-tight uppercase ${i === 0 ? 'court-decree-transmittal-psa-name font-bold text-[12pt]' : ''}`}
                >
                  {psaLinesForLetter[i].toUpperCase()}
                </p>
                <input
                  type="text"
                  spellCheck={false}
                  aria-label={i === 0 ? 'PSA addressee line 1' : `PSA addressee line ${i + 1}`}
                  className={`${inlineAddrInput} uppercase ${i === 0 ? 'court-decree-transmittal-psa-name font-bold text-[12pt]' : ''}`}
                  value={psaDraft[i]}
                  onChange={(e) =>
                    setPsaDraft((prev) => {
                      const next = [...prev]
                      next[i] = e.target.value
                      return next
                    })
                  }
                  placeholder={DEFAULT_TRANSMITTAL_PSA_LINES[i]}
                />
              </div>
            ))}
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
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="m-0 leading-tight">
                <p className={`print-only m-0 leading-tight uppercase ${i === 0 ? 'font-bold' : ''}`}>{psaLinesForLetter[i].toUpperCase()}</p>
                <input
                  type="text"
                  spellCheck={false}
                  aria-label={i === 0 ? 'PSA addressee line 1' : `PSA addressee line ${i + 1}`}
                  className={`${inlineAddrInput} uppercase ${i === 0 ? 'font-bold' : ''}`}
                  value={psaDraft[i]}
                  onChange={(e) =>
                    setPsaDraft((prev) => {
                      const next = [...prev]
                      next[i] = e.target.value
                      return next
                    })
                  }
                  placeholder={DEFAULT_TRANSMITTAL_PSA_LINES[i]}
                />
              </div>
            ))}
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
        ) : showStyledOotAddressee ? (
          <div
            className={[
              'oot-transmittal-addressee-header font-serif text-left flex flex-col gap-0 mb-6 max-w-full',
              showCourtDecreeOot ? 'court-decree-oot-transmittal-mcr-header' : '',
              isCourtDecreeTransmittal && isOutOfTown ? '' : 'mt-2 text-base leading-snug',
              isLegOot ? 'legitimation-oot-addressee-print' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="m-0 text-left">
              <p className="print-only m-0 text-left font-bold uppercase tracking-wide">{ootLine1.toUpperCase()}</p>
              <input
                type="text"
                spellCheck={false}
                aria-label="Out-of-town addressee name"
                className={`${inlineAddrInput} font-bold uppercase tracking-wide`}
                value={ootDraft.n}
                onChange={(e) => setOotDraft((d) => ({ ...d, n: e.target.value }))}
                placeholder={ootDefaults[0] || 'Name'}
              />
            </div>
            <div className="m-0 text-left">
              <p className="print-only m-0 text-left font-normal uppercase tracking-wide">{ootLine2.toUpperCase()}</p>
              <input
                type="text"
                spellCheck={false}
                aria-label="Out-of-town addressee title"
                className={`${inlineAddrInput} font-normal uppercase tracking-wide`}
                value={ootDraft.t}
                onChange={(e) => setOotDraft((d) => ({ ...d, t: e.target.value }))}
                placeholder={ootDefaults[1] || 'Title'}
              />
            </div>
            <div className="m-0 text-left">
              <p className="print-only m-0 text-left font-normal uppercase tracking-wide">{ootLine3.toUpperCase()}</p>
              <input
                type="text"
                spellCheck={false}
                aria-label="Out-of-town addressee location"
                className={`${inlineAddrInput} font-normal uppercase tracking-wide`}
                value={ootDraft.o}
                onChange={(e) => setOotDraft((d) => ({ ...d, o: e.target.value }))}
                placeholder={ootDefaults[2] || 'Location'}
              />
            </div>
            {typeof onPersistDraft === 'function' ? (
              <div className="no-print mt-2">
                <button
                  type="button"
                  onClick={saveOotFields}
                  className="text-sm font-medium text-slate-700 underline decoration-slate-400 underline-offset-2 hover:text-slate-900"
                >
                  Save to draft
                </button>
              </div>
            ) : null}
          </div>
        ) : isPsaLetter && isAusfTransmittal ? (
          <div className="ausf-local-transmittal-addressee mb-3 max-w-full space-y-0 font-serif text-left text-base leading-snug">
            <div className="m-0 text-left">
              <p className="print-only m-0 text-left font-bold uppercase tracking-wide">{ausfLocalLine1}</p>
              <input
                type="text"
                spellCheck={false}
                aria-label="Transmittal addressee name"
                className={`${inlineAusfLocalAddrInput} font-bold uppercase tracking-wide`}
                value={ootDraft.n}
                onChange={(e) => setOotDraft((d) => ({ ...d, n: e.target.value }))}
                placeholder="NAME"
              />
            </div>
            <div className="m-0 text-left">
              <p className="print-only m-0 text-left font-normal uppercase tracking-wide">{ausfLocalLine2}</p>
              <input
                type="text"
                spellCheck={false}
                aria-label="Transmittal addressee title"
                className={`${inlineAusfLocalAddrInput} font-normal uppercase tracking-wide`}
                value={ootDraft.t}
                onChange={(e) => setOotDraft((d) => ({ ...d, t: e.target.value }))}
                placeholder="TITLE"
              />
            </div>
            <div className="m-0 text-left">
              <p className="print-only m-0 text-left font-normal uppercase tracking-wide">{ausfLocalLine3}</p>
              <input
                type="text"
                spellCheck={false}
                aria-label="Transmittal addressee location"
                className={`${inlineAusfLocalAddrInput} font-normal uppercase tracking-wide`}
                value={ootDraft.o}
                onChange={(e) => setOotDraft((d) => ({ ...d, o: e.target.value }))}
                placeholder="LOCATION"
              />
            </div>
            {recipientAgency ? <p className="uppercase">{recipientAgency}</p> : null}
            {typeof onPersistDraft === 'function' ? (
              <div className="no-print mt-2">
                <button
                  type="button"
                  onClick={saveOotFields}
                  className="text-sm font-medium text-slate-700 underline decoration-slate-400 underline-offset-2 hover:text-slate-900"
                >
                  Save to draft
                </button>
              </div>
            ) : null}
          </div>
        ) : isPsaLetter ? (
          <div className="mb-3 space-y-0.5">
            <p className="font-bold uppercase">{ausfLocalLine1}</p>
            <p className="uppercase">{ausfLocalLine2}</p>
            <p className="uppercase">{ausfLocalLine3}</p>
            {recipientAgency && <p>{recipientAgency}</p>}
          </div>
        ) : null}

        <p
          className={
            isCourtDecreeTransmittal
              ? 'court-decree-transmittal-subject-line font-bold uppercase text-[12pt] mb-[2em]'
              : isLegitimationTransmittal
                ? 'legitimation-transmittal-subject-line font-bold uppercase text-[12pt] mb-[2em]'
                : 'ausf-transmittal-subject-line font-bold uppercase whitespace-pre-line mb-0'
          }
        >
          {subject}
        </p>

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
          I am respectfully forwarding to your good office the attached documents in relation to the above-cited subject, to wit:
        </p>

        <div className="flex justify-center mb-8">
          {checklistItems ? (
            <>
              <div className="no-print w-full max-w-2xl">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Attachments: all items are included by default. Uncheck the items you want to remove from the printed letter.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-left">
                  {checklistItems.map((item, i) => (
                    <li key={item.id} className="flex flex-wrap items-center gap-2">
                      <span className="w-5 shrink-0 text-left">{i + 1}.</span>
                      {(() => {
                        const options = getCourtDecreeDropdownOptionsByIndex(i)
                        if (!options) {
                          return (
                            <input
                              type="text"
                              className="flex-1 min-w-[12rem] border border-gray-300 px-2 py-1 text-sm uppercase rounded"
                              value={item.label}
                              onChange={(e) => onChecklistLabelChange(item.id, e.target.value)}
                            />
                          )
                        }
                        const selectOptions = options.includes(item.label) ? options : [item.label, ...options]
                        return (
                          <select
                            className="flex-1 basis-[20rem] min-w-0 max-w-full border border-gray-300 px-2 py-1 text-sm uppercase rounded bg-white truncate"
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
                      <label className="flex items-center gap-1 shrink-0 cursor-pointer">
                        <input type="checkbox" checked={!!item.completed} onChange={() => onChecklistToggle(item.id)} className="w-4 h-4" />
                        <span className="text-xs text-gray-600">Include in print (uncheck to remove)</span>
                      </label>
                    </li>
                  ))}
                </ol>
              </div>
              <ol
                className={[
                  'print-only list-decimal list-inside space-y-1 text-left w-[28rem]',
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

        <div className="min-h-[2rem] flex-1" aria-hidden />
      </div>

      <footer className="print-doc-footer-wrap mt-auto pt-4 flex flex-col flex-shrink-0" role="contentinfo">
        <div className="text-left mb-6">
          <p className={`mb-4 ${useAdjustedTransmittalLines ? 'legitimation-transmittal-action-line' : ''}`}>For appropriate action.</p>
          <p className={`mb-12 ${useAdjustedTransmittalLines ? 'legitimation-transmittal-respectfully-line' : ''}`}>Respectfully yours,</p>
          <div className={`flex flex-col ${signatoryGapNone || checklistConfig?.isOutOfTown || checklistConfig?.listId?.includes('legitimation') ? 'gap-0 pt-0' : 'gap-0 pt-1'}`} style={{ gap: 0 }}>
            <div className="font-bold uppercase" style={{ lineHeight: '1.1', margin: 0, padding: 0 }}>{displaySignatory}</div>
            <div className="text-sm" style={{ lineHeight: '1.1', margin: 0, padding: 0 }}>{signatoryTitle}</div>
          </div>
        </div>
        <DocumentFooter contactPhone={safe.contactPhone} contactEmail={safe.contactEmail} />
      </footer>
    </div>
  )
}
