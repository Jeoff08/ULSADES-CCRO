import React, { useState, useCallback, useEffect } from 'react'
import { formatDateCert, fullName } from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter, TRANSMITTAL_ATTACHMENTS_LOCAL, TRANSMITTAL_ATTACHMENTS_PSA } from '../../../components/print'
import { loadTransmittalChecklist, saveTransmittalChecklist, labelsToChecklistItems } from '../lib/transmittalChecklistStorage'

/**
 * Shared transmittal letter content. Use Transmittal.jsx (isOutOfTown=false) or OutOfTownTransmittal.jsx (isOutOfTown=true).
 * Pass optional attachments (e.g. COURT_DECREE_TRANSMITTAL_LIST) so the list is printed on the letter.
 * Pass optional checklistConfig { isOutOfTown, defaultLabels, listId } to render an editable checklist inside the document.
 * Print PDF uses larger text for elderly readability; header and footer are fixed in print.
 */
export default function TransmittalDoc({ data, isOutOfTown, attachments: attachmentsProp, subjectLine, hideLineBelowDate, showLineAboveDate, checklistConfig }) {
  const isPsaLetter = !isOutOfTown
  const childFull = fullName(data.childFirst, data.childMiddle, data.fatherLast) || fullName(data.childFirst, data.childMiddle, data.childLast) || '—'
  const childFullCaps = (childFull !== '—' ? childFull : '').toUpperCase()
  const transmittalDate = formatDateCert(data.transmittalDate) || formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const recipientName = (data.recipientName || '').toUpperCase()
  const recipientTitle = (data.recipientTitle || '').toUpperCase()
  const recipientOffice = (data.recipientOffice || '').toUpperCase()
  const recipientAgency = (data.recipientAgency || '').toUpperCase()
  const salutation = data.transmittalSalutation || (isPsaLetter ? "Ma'am:" : "Sir/Ma'am:")
  // Local transmittal (AUSF): 6-item list; out-of-town/PSA: 8-item list
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
  const defaultSignatoryName = 'LORELIE L. CANTO'
  const defaultSignatoryTitle = 'Registration Officer IV'
  const displaySignatory = (data.transmittalSignatoryName || defaultSignatoryName).toUpperCase()
  const signatoryTitle = data.transmittalSignatoryTitle || defaultSignatoryTitle
  const subject = subjectLine != null && subjectLine !== '' ? subjectLine : `SUBJECT: ENDORSEMENT OF AFFIDAVIT TO USE SURNAME OF FATHER IN FAVOR OF ${childFullCaps || childFull}`

  return (
    <div className="ausf-doc print-doc print-doc-transmittal print-doc-transmittal-elderly bg-white text-black max-w-[210mm] mx-auto px-6 py-4 leading-normal flex flex-col min-h-[297mm] text-base">
      <div className="print-doc-header">
        <PrintHeaderRow />
        {!hideLineBelowDate && <hr className="border-black my-2" />}
        {showLineAboveDate && <hr className="border-black my-2" />}
      </div>

      <div className="print-doc-body flex flex-col flex-1 min-h-0">
        <p className="font-bold text-sm mb-8">{transmittalDate}</p>

        {isPsaLetter ? (
          <div className="mb-6 space-y-0.5">
            <p className="font-bold">{recipientName || ' '}</p>
            {recipientTitle && <p>{recipientTitle}</p>}
            {recipientOffice && <p>{recipientOffice}</p>}
            {recipientAgency && <p>{recipientAgency}</p>}
          </div>
        ) : (
          <div className="mb-6 space-y-1">
            <p className="font-bold uppercase">{recipientName || ' '}</p>
            <p className="uppercase">{recipientTitle || ' '}</p>
            <p className="uppercase">{recipientOffice || ' '}</p>
          </div>
        )}

        <p className="font-bold uppercase text-sm mb-8">
          {subject}
        </p>

        <p className="mb-6">{salutation}</p>

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
                      <input
                        type="text"
                        className="flex-1 min-w-[12rem] border border-gray-300 px-2 py-1 text-sm uppercase rounded"
                        value={item.label}
                        onChange={(e) => onChecklistLabelChange(item.id, e.target.value)}
                      />
                      <label className="flex items-center gap-1 shrink-0 cursor-pointer">
                        <input type="checkbox" checked={!!item.completed} onChange={() => onChecklistToggle(item.id)} className="w-4 h-4" />
                        <span className="text-xs text-gray-600">Include in print (uncheck to remove)</span>
                      </label>
                    </li>
                  ))}
                </ol>
              </div>
              <ol className="print-only list-decimal list-inside space-y-1 text-left w-[28rem]">
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
        <div className="space-y-4 text-left mb-6">
          <p>For appropriate action.</p>
          <p>Respectfully yours,</p>
          <p className="font-bold uppercase">{displaySignatory}</p>
          <p className="text-sm">{signatoryTitle}</p>
        </div>
        <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
      </footer>
    </div>
  )
}
