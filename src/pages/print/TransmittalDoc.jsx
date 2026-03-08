import React from 'react'
import { formatDateCert, fullName } from '../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter, TRANSMITTAL_ATTACHMENTS_LOCAL, TRANSMITTAL_ATTACHMENTS_PSA } from '../../components/print'

/**
 * Shared transmittal letter content. Use Transmittal.jsx (isOutOfTown=false) or OutOfTownTransmittal.jsx (isOutOfTown=true).
 * Pass optional attachments (e.g. COURT_DECREE_TRANSMITTAL_LIST) so the list is printed on the letter.
 */
export default function TransmittalDoc({ data, isOutOfTown, attachments: attachmentsProp, subjectLine }) {
  const isPsaLetter = !isOutOfTown
  const childFull = fullName(data.childFirst, data.childMiddle, data.fatherLast) || fullName(data.childFirst, data.childMiddle, data.childLast) || '—'
  const childFullCaps = (childFull !== '—' ? childFull : '').toUpperCase()
  const transmittalDate = formatDateCert(data.transmittalDate) || formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const recipientName = (data.recipientName || '').toUpperCase()
  const recipientTitle = (data.recipientTitle || '').toUpperCase()
  const recipientOffice = (data.recipientOffice || '').toUpperCase()
  const recipientAgency = (data.recipientAgency || '').toUpperCase()
  const salutation = data.transmittalSalutation || (isPsaLetter ? "Ma'am:" : "Sir/Ma'am:")
  const attachments = Array.isArray(attachmentsProp) && attachmentsProp.length > 0
    ? attachmentsProp
    : (isPsaLetter ? TRANSMITTAL_ATTACHMENTS_PSA : TRANSMITTAL_ATTACHMENTS_LOCAL)
  const defaultSignatoryName = 'LORELIE L. CANTO'
  const defaultSignatoryTitle = 'Registration Officer IV'
  const displaySignatory = (data.transmittalSignatoryName || defaultSignatoryName).toUpperCase()
  const signatoryTitle = data.transmittalSignatoryTitle || defaultSignatoryTitle
  const subject = subjectLine != null && subjectLine !== '' ? subjectLine : `SUBJECT: ENDORSEMENT OF AFFIDAVIT TO USE SURNAME OF FATHER IN FAVOR OF ${childFullCaps || childFull}`

  return (
    <div className="ausf-doc print-doc bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-4 leading-normal">
      <PrintHeaderRow />
      <hr className="border-black my-2" />

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
          <p className="fill-blank inline-block min-w-[18rem] !text-left font-bold uppercase">{recipientName || ' '}</p>
          <p className="fill-blank inline-block min-w-[18rem] !text-left uppercase">{recipientTitle || ' '}</p>
          <p className="fill-blank inline-block min-w-[18rem] !text-left uppercase">{recipientOffice || ' '}</p>
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
        <ol className="list-decimal list-inside space-y-1 text-left w-[28rem]">
          {attachments.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      </div>

      <p className="mb-8">For appropriate action.</p>

      <p className="mb-6">Respectfully yours,</p>

      <div className="mb-6">
        <p className="font-bold uppercase">{displaySignatory}</p>
        <p className="text-sm">{signatoryTitle}</p>
      </div>
      <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
    </div>
  )
}
