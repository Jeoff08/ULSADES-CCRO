import React from 'react'
import { formatDateLong, formatTransmittalDateLong } from '../../../lib/printUtils'
import {
  CORRECTION_PRINT_ALL_IDS,
  CORRECTION_COMPLETE_PACKET_ID,
  formatPetitionNumberDisplay,
  formatTypeOfDocumentForPrint,
} from '../lib/correctionOfEntriesDefaults'
import LcroRaHeader, { SignatoryBlock } from './LcroRaHeader'

function u(s) {
  return String(s || '').trim() || '—'
}

function RowKV({ label, value }) {
  return (
    <div className="flex gap-2 text-[11px] leading-snug py-0.5">
      <span className="shrink-0 font-semibold min-w-[10rem]">{label}</span>
      <span className="font-bold uppercase flex-1">{u(value)}</span>
    </div>
  )
}

/** --- Petition: Certification --- */
export function CertificationPrint({ data }) {
  const signatory = data.cityCivilRegistrarName
  const issued = formatDateLong(data.certificationIssuedDate || data.dateOfReceipt || new Date().toISOString().slice(0, 10))
  const petitionNo = formatPetitionNumberDisplay(data)

  return (
    <div className="correction-print-doc bg-white text-black max-w-[210mm] mx-auto px-8 py-6 text-[12px] leading-relaxed">
      <LcroRaHeader />
      <h1 className="text-center font-bold text-[18px] uppercase mt-2 mb-1">Certification</h1>
      <p className="text-center font-bold text-[11px] mb-4 underline leading-tight">
        PETITION FOR CORRECTION OF CLERICAL ERROR IN THE CERTIFICATE OF LIVE BIRTH
      </p>
      <p className="font-bold text-[11px] mb-2">TO WHOM IT MAY CONCERN:</p>
      <p className="text-justify text-[11px] mb-4">
        This is to certify that a petition for Correction of Clerical Error pursuant to RA 9048 has been filed in this
        office for OCRG approval;
      </p>
      <div className="space-y-1 border border-black p-3 mb-4">
        <RowKV label="Name of Petitioner:" value={data.petitionerName} />
        <RowKV label="Address:" value={data.petitionerAddress} />
        <RowKV label="Date of Filing:" value={formatDateLong(data.dateOfFiling)} />
        <RowKV label="Petition No.:" value={petitionNo} />
        <RowKV label="Name of Document Owner:" value={data.documentOwnerName} />
        <RowKV label="Registry Number:" value={data.registryNumber} />
      </div>
      <p className="font-semibold text-[11px] mb-1">Correction applied:</p>
      <table className="w-full border-collapse border border-black text-[10px] mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-1 w-10">#</th>
            <th className="border border-black p-1">Description</th>
            <th className="border border-black p-1">From</th>
            <th className="border border-black p-1">To</th>
          </tr>
        </thead>
        <tbody>
          {(data.corrections || []).map((row, i) => (
            <tr key={row.id || i}>
              <td className="border border-black p-1 text-center">{i + 1}</td>
              <td className="border border-black p-1">{u(row.description)}</td>
              <td className="border border-black p-1 font-bold">{u(row.from)}</td>
              <td className="border border-black p-1 font-bold">{u(row.to)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[11px] mb-6">
        Issued this <span className="font-bold underline">{issued}</span> for whatever purpose it may serve.
      </p>
      <SignatoryBlock name={signatory} />
      <div className="mt-8 text-[10px] border-t border-dotted border-gray-400 pt-2">
        <p className="font-semibold m-0">OR Number (Certification): {u(data.orCertificationNumber)}</p>
        <p className="m-0">Amount: {u(data.amountCertification)}</p>
        <p className="m-0">Date: {formatDateLong(data.dateOfReceiptCertification)}</p>
      </div>
    </div>
  )
}

/** --- Petition: RA 9048 Form 1.1 --- */
export function PetitionForm904811Print({ data }) {
  const petitionNo = formatPetitionNumberDisplay(data)
  const signatory = data.cityCivilRegistrarName
  const dob = u(data.dateOfBirth).toUpperCase()
  const pob = u(data.placeOfBirth).toUpperCase()

  return (
    <div className="correction-print-doc bg-white text-black max-w-[210mm] mx-auto px-8 py-6 text-[11px]">
      <p className="text-[10px] font-bold mb-2">RA 9048 Form No. 1.1 (LCRO)</p>
      <LcroRaHeader />
      <div className="flex justify-between items-start gap-2 text-[10px] mt-2 mb-2">
        <p className="m-0">Republic of the Philippines, Iligan, Lanao del Norte )S.S.</p>
        <p className="m-0 font-bold whitespace-nowrap">Petition No.: {petitionNo}</p>
      </div>
      <h2 className="text-center font-bold text-[12px] uppercase mb-3 leading-tight">
        Petition for Correction of Clerical Error in the Certificate of Live Birth
      </h2>
      <p className="text-justify indent-4 mb-3">
        I, <span className="font-bold underline">{u(data.petitionerName)}</span>, of legal age,{' '}
        <span className="font-bold underline">{u(data.nationality) || '___________'}</span>, and a resident of{' '}
        {u(data.petitionerAddress)}, after having been duly sworn in accordance with law, hereby declare that:
      </p>
      <ol className="list-decimal pl-6 space-y-2 text-justify">
        <li>
          I am the petitioner seeking correction of the clerical error in my{' '}
          <span className="font-bold">{u(formatTypeOfDocumentForPrint(data))}</span>.
        </li>
        <li>
          I/He/She was born on <span className="font-bold underline">{dob}</span> at{' '}
          <span className="font-bold underline">{pob}</span>.
        </li>
        <li>
          The birth was recorded under Registry No. <span className="font-bold underline">{u(data.registryNumber)}</span>.
        </li>
        <li>
          <div className="mb-1 font-semibold">The clerical error/s to be corrected is/are:</div>
          <table className="w-full border-collapse border border-black text-[10px]">
            <thead>
              <tr>
                <th className="border border-black p-1 w-8">Item</th>
                <th className="border border-black p-1">Description</th>
                <th className="border border-black p-1">From</th>
                <th className="border border-black p-1">To</th>
              </tr>
            </thead>
            <tbody>
              {(data.corrections || []).map((row, i) => (
                <tr key={row.id || i}>
                  <td className="border border-black p-1 text-center">{i + 1}</td>
                  <td className="border border-black p-1">{u(row.description)}</td>
                  <td className="border border-black p-1 font-bold">{u(row.from)}</td>
                  <td className="border border-black p-1 font-bold">{u(row.to)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </li>
        <li>To correct the above-stated clerical error/s pursuant to RA 9048.</li>
        <li>
          Supporting documents (certified true copies): Certificate of Live Birth (PSA/LCRO), Valid ID/s, and others as
          applicable.
        </li>
        <li>
          I certify that no similar petition is pending and that this petition complies with RA 9048 / RA 10172.
        </li>
      </ol>
      <div className="mt-8">
        <div className="inline-block min-w-[60%]">
          <div className="border-b border-black min-h-[2rem]" />
          <p className="text-center text-[10px] mt-1">{u(data.petitionerName)}</p>
          <p className="text-center text-[9px]">Signature over Printed Name of Petitioner</p>
        </div>
      </div>
      <p className="font-bold mt-6 mb-2">VERIFICATION</p>
      <p className="text-justify indent-4 mb-4">
        I certify that the foregoing statements are true and correct to the best of my knowledge.
      </p>
      <p className="text-justify text-[10px] mb-6">
        SUBSCRIBED AND SWORN to before me this {u(data.swornDay)} day of {u(data.swornMonth)}, {u(data.swornYear)} in{' '}
        {u(data.swornPlace)}, petitioner exhibiting her/his <span className="font-bold">{u(data.idTypeForSworn)}</span>.
      </p>
      <div className="border-t border-dashed border-gray-500 pt-3 mt-6 text-[10px]">
        <p className="font-bold m-0 mb-1">Payment of filing fee (attached copy of the official receipt)</p>
        <p className="m-0">O.R. Number: {u(data.paymentOrFiling || data.orFilingFeeNumber)}</p>
        <p className="m-0">Amount: Php {u(data.paymentAmountFiling || data.amountPaidFiling)}</p>
        <p className="m-0">Date: {formatDateLong(data.paymentDateFiling || data.dateOfReceiptFiling)}</p>
      </div>
      <div className="mt-6 border border-black p-2 text-[9px]">
        <p className="font-bold m-0 mb-1">Received</p>
        <p className="m-0">{u(data.receivedAtOfficeLine)}</p>
        <p className="m-0">Received: {formatDateLong(data.receivedDate)}</p>
        <div className="mt-4 border-b border-black min-h-[1.5rem] w-2/3" />
        <p className="m-0 mt-1">{u(data.receivedOfficerName)}</p>
        <p className="m-0">Registration Officer</p>
      </div>
      <SignatoryBlock name={signatory} />
    </div>
  )
}

/** --- Petition: Certificate of Posting --- */
export function CertificateOfPostingPrint({ data }) {
  const signatory = data.cityCivilRegistrarName
  const petitionNo = formatPetitionNumberDisplay(data)
  const periodFrom = formatDateLong(data.postingPeriodFrom)
  const periodTo = formatDateLong(data.postingPeriodTo)
  const issued = formatDateLong(data.certificatePostingIssuedAt || data.decisionCmcrDate)

  return (
    <div className="correction-print-doc bg-white text-black max-w-[210mm] mx-auto px-8 py-6 text-[11px]">
      <p className="text-[10px] font-bold mb-1">RA Form No. 9.1 (LCRO) — Certificate of Posting</p>
      <LcroRaHeader />
      <h2 className="text-center font-bold text-[14px] uppercase mt-3 mb-4">Certificate of Posting</h2>
      <div className="space-y-1 mb-4">
        <RowKV label="Petition No.:" value={petitionNo} />
        <RowKV label="Date:" value={formatDateLong(data.dateOfFiling)} />
        <RowKV label="Name of Petitioner:" value={data.petitionerName} />
        <RowKV label="Type / Nature of Petition:" value="Correction of Clerical Error" />
        <RowKV label="Type of Document:" value={formatTypeOfDocumentForPrint(data)} />
        <RowKV label="Name of Document Owner:" value={data.documentOwnerName} />
        <RowKV label="Registry No.:" value={data.registryNumber} />
        <RowKV label="Posting Period:" value={`${periodFrom} to ${periodTo}`} />
        <RowKV label="Place of Posting:" value={data.placeOfPosting} />
      </div>
      <p className="text-justify mb-4">
        has been posted for ten (10) consecutive days in compliance with Section 6 of RA 9048.
      </p>
      <p className="text-justify mb-6">
        Issued at the LCRO of Iligan, Lanao del Norte this <span className="font-bold">{issued}</span>.
      </p>
      <SignatoryBlock name={signatory} />
    </div>
  )
}

/** --- First transmittal: Record Sheet --- */
export function RecordSheetPrint({ data }) {
  const signatory = data.cityCivilRegistrarName
  const petitionNo = formatPetitionNumberDisplay(data)

  return (
    <div className="correction-print-doc bg-white text-black max-w-[210mm] mx-auto px-8 py-6 text-[11px]">
      <div className="flex justify-between items-start">
        <p className="text-[10px] font-bold m-0">RA Form No. 12</p>
      </div>
      <LcroRaHeader />
      <h2 className="text-center font-bold text-[16px] uppercase tracking-wide my-2">Record Sheet</h2>
      <div className="grid grid-cols-1 gap-1 mb-3 text-[10px]">
        <RowKV label="Petition No.:" value={petitionNo} />
        <RowKV
          label="Posting Period:"
          value={
            data.postingPeriodFrom && data.postingPeriodTo
              ? `${formatDateLong(data.postingPeriodFrom)} to ${formatDateLong(data.postingPeriodTo)}`
              : ''
          }
        />
        <RowKV label="Petitioner's Name:" value={data.petitionerName} />
        <RowKV label="Document Owner's Name:" value={data.documentOwnerName} />
        <RowKV label="Type of Document:" value={formatTypeOfDocumentForPrint(data)} />
        <RowKV label="Date of Receipt:" value={formatDateLong(data.dateOfReceipt)} />
        <RowKV label="Registry No.:" value={data.registryNumber} />
        <RowKV label="Type of Petition:" value="Correction of Clerical Error" />
      </div>
      <p className="font-semibold text-[10px] mb-1">Clerical error to be corrected/to be changed:</p>
      <table className="w-full border-collapse border border-black text-[10px] mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-1">Item No.</th>
            <th className="border border-black p-1">Description</th>
            <th className="border border-black p-1">From</th>
            <th className="border border-black p-1">To</th>
          </tr>
        </thead>
        <tbody>
          {(data.corrections || []).map((row, i) => (
            <tr key={row.id || i}>
              <td className="border border-black p-1 text-center">{i + 1}</td>
              <td className="border border-black p-1">{u(row.description)}</td>
              <td className="border border-black p-1 font-bold">{u(row.from)}</td>
              <td className="border border-black p-1 font-bold">{u(row.to)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className="text-center font-bold text-[11px] uppercase mb-2">Decision on Petition</h3>
      <div className="border border-black text-[9px] mb-4">
        <div className="grid grid-cols-[1fr_auto_auto] gap-1 border-b border-black p-2 items-center">
          <span>By C/MCR, CG or D/CR:</span>
          <span>Granted {data.decisionCmcrGranted ? '☒' : '☐'} Denied {data.decisionCmcrDenied ? '☒' : '☐'}</span>
          <span>Date: {formatDateLong(data.decisionCmcrDate)}</span>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto] gap-1 border-b border-black p-2 items-center">
          <span>By CRG:</span>
          <span>Affirmed {data.decisionCrgAffirmed ? '☒' : '☐'} Impugned {data.decisionCrgImpugned ? '☒' : '☐'}</span>
          <span>Date: {formatDateLong(data.decisionCrgDate)}</span>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto] gap-1 border-b border-black p-2 items-center">
          <span>By CRG on Appeal (if any):</span>
          <span>Affirmed {data.decisionAppealAffirmed ? '☒' : '☐'} Reversed {data.decisionAppealReversed ? '☒' : '☐'}</span>
          <span>Date: {formatDateLong(data.decisionAppealDate)}</span>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto] gap-1 p-2 items-center">
          <span>By CRG on Reconsideration (if any):</span>
          <span>Granted {data.decisionReconGranted ? '☒' : '☐'} Denied {data.decisionReconDenied ? '☒' : '☐'}</span>
          <span>Date: {formatDateLong(data.decisionReconDate)}</span>
        </div>
      </div>
      <p className="text-[10px] mb-2">
        Certificate of Finality issued on: {formatDateLong(data.certificateOfFinalityIssuedOn)}
      </p>
      <p className="text-[10px] font-semibold mb-1">Remarks:</p>
      <p className="text-[10px] border border-gray-400 min-h-[4rem] p-2 whitespace-pre-wrap">{u(data.remarksRecordSheet)}</p>
      <SignatoryBlock name={signatory} />
    </div>
  )
}

/** --- First transmittal: Notice for Posting --- */
export function NoticeForPostingPrint({ data }) {
  const signatory = data.cityCivilRegistrarName

  return (
    <div className="correction-print-doc bg-white text-black max-w-[210mm] mx-auto px-8 py-6 text-[11px]">
      <p className="text-[10px] font-bold mb-1">RA Form No. 8.1 (LCRO)</p>
      <LcroRaHeader />
      <h2 className="text-center font-bold text-[14px] uppercase mt-3 mb-4">Notice for Posting</h2>
      <p className="text-justify mb-4">
        The public is hereby notified that a petition was filed with this Office by:
      </p>
      <div className="space-y-1 mb-4">
        <RowKV label="Name of Petitioner:" value={data.petitionerName} />
        <RowKV label="Type of Document:" value={formatTypeOfDocumentForPrint(data)} />
        <RowKV label="Type / Nature of Petition:" value="Correction of Clerical Error" />
        <RowKV label="Name of Document Owner:" value={data.documentOwnerName} />
        <RowKV label="Date of Filing:" value={formatDateLong(data.dateOfFiling)} />
      </div>
      <p className="text-justify mb-6">
        Any person claiming interest or may be adversely affected by said petition may within ten (10) calendar days
        file his/her written opposition with this office.
      </p>
      <SignatoryBlock name={signatory} />
    </div>
  )
}

/** --- First transmittal: Certificate of Finality --- */
export function CertificateOfFinalityPrint({ data }) {
  const signatory = data.cityCivilRegistrarName
  const decision = formatDateLong(data.cofDecisionDate || data.decisionCmcrDate)
  const issued = formatDateLong(data.cofIssuanceDate)

  const firstTo = (data.corrections && data.corrections[0]?.to) || ''
  const ann =
    data.cofAnnotationBody ||
    `Pursuant to the decision rendered by CCR ${u(signatory)}, dated ${decision}, and affirmed by the CRG under OCRG No. ${u(data.cofOcrgNo)}, the correction is hereby reflected — corrected to ${u(firstTo)}.`

  return (
    <div className="correction-print-doc bg-white text-black max-w-[210mm] mx-auto px-8 py-6 text-[11px]">
      <LcroRaHeader />
      <h2 className="text-center font-bold text-[14px] uppercase mt-3 mb-4">Certificate of Finality</h2>
      <p className="font-bold mb-2">TO WHOM IT MAY CONCERN:</p>
      <p className="text-justify mb-4">
        This is to certify that the decision of this office dated <span className="font-bold underline">{decision}</span>{' '}
        in the above-named petitioner for <span className="font-bold">Correction of Clerical Error</span> of{' '}
        <span className="font-bold underline">{u(data.petitionerName)}</span> as per recorded in the attached Record Sheet
        has become Final and Executory.
      </p>
      <p className="text-justify mb-6">
        Issued this <span className="font-bold underline">{issued}</span> at the Office of the Local Civil Registrar,
        Iligan, Lanao del Norte.
      </p>
      <SignatoryBlock name={signatory} />
      <p className="text-[10px] mt-6 mb-2">Copy Furnished: Civil Registrar General</p>
      <div className="border border-black p-2 mt-4">
        <p className="font-bold text-[10px] m-0 mb-1">ANNOTATIONS</p>
        <p className="text-[10px] text-justify m-0 whitespace-pre-wrap">{ann}</p>
      </div>
    </div>
  )
}

/** --- Second transmittal: Letter --- */
export function SecondTransmittalLetterPrint({ data }) {
  const signatory = data.cityCivilRegistrarName
  const petitionNo = formatPetitionNumberDisplay(data)
  const letterDate = formatTransmittalDateLong(data.secondTransmittalDate || new Date().toISOString().slice(0, 10))
  const bullets = Array.isArray(data.secondTransmittalBullets) ? data.secondTransmittalBullets : []

  return (
    <div className="correction-print-doc bg-white text-black max-w-[210mm] mx-auto px-8 py-6 text-[11px]">
      <LcroRaHeader />
      <p className="text-right text-[11px] mb-6">{letterDate}</p>
      <div className="mb-4 text-[11px]">
        <p className="font-bold m-0">{u(data.psaAddressee)}</p>
        <p className="m-0">{u(data.psaAddresseeTitle)}</p>
        <p className="m-0">{u(data.psaOrgLine)}</p>
        <p className="m-0">{u(data.psaAddressLine)}</p>
      </div>
      <div className="mb-4 text-[11px]">
        <p className="font-bold m-0">THRU: {u(data.thruName)}</p>
        <p className="m-0">{u(data.thruTitle)}</p>
        <p className="m-0">{u(data.thruAddressLine)}</p>
      </div>
      <p className="font-bold mb-3">SIR/MADAM:</p>
      <p className="text-justify mb-3">
        This office is submitting herewith the following documents for your appropriate action on the petition for{' '}
        <span className="font-bold">Correction of Clerical Error</span> in the Certificate of Live Birth of{' '}
        <span className="font-bold underline">{u(data.documentOwnerName)}</span> under{' '}
        <span className="font-bold underline">{petitionNo}</span> to wit; (CERTIFIED TRUE XEROX COPIES)
      </p>
      <ul className="list-disc pl-8 mb-4 space-y-1">
        {bullets.filter(Boolean).map((line, i) => (
          <li key={i} className="text-justify">
            {line}
          </li>
        ))}
      </ul>
      <p className="text-justify mb-8">
        It is hereby recommended that favorable consideration be given to the above-mentioned petition.
      </p>
      <p className="mb-1">Thank you very much.</p>
      <p className="mb-8">Very respectfully yours,</p>
      <div className="flex flex-col items-start">
        <p className="font-bold underline text-[11px] m-0">{u(signatory)}</p>
        <p className="text-[10px] m-0">City Civil Registrar</p>
      </div>
    </div>
  )
}

/** --- Second transmittal: Enclosures checklist --- */
export function SecondTransmittalEnclosuresPrint({ data }) {
  const petitionNo = formatPetitionNumberDisplay(data)
  const bullets = Array.isArray(data.secondTransmittalBullets) ? data.secondTransmittalBullets : []

  return (
    <div className="correction-print-doc bg-white text-black max-w-[210mm] mx-auto px-8 py-6 text-[11px]">
      <LcroRaHeader />
      <h2 className="text-center font-bold text-[13px] uppercase mt-4 mb-4">Enclosed Documents (Second Transmittal)</h2>
      <div className="space-y-1 mb-6 text-[11px]">
        <RowKV label="Petition No.:" value={petitionNo} />
        <RowKV label="Petitioner:" value={data.petitionerName} />
        <RowKV label="Document Owner:" value={data.documentOwnerName} />
      </div>
      <p className="font-semibold text-[11px] mb-2">Checklist:</p>
      <ol className="list-decimal pl-6 space-y-2">
        {bullets.filter(Boolean).map((line, i) => (
          <li key={i} className="text-justify">
            {line}
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Stacks every document in order — same draft data as individual views; print/save = one long PDF. */
export function AllOutputsCombinedPrint({ data }) {
  const byId = {
    certification: CertificationPrint,
    'petition-form': PetitionForm904811Print,
    'certificate-of-posting': CertificateOfPostingPrint,
    'record-sheet': RecordSheetPrint,
    'notice-for-posting': NoticeForPostingPrint,
    'certificate-of-finality': CertificateOfFinalityPrint,
    'second-transmittal-letter': SecondTransmittalLetterPrint,
    'second-transmittal-enclosures': SecondTransmittalEnclosuresPrint,
  }

  return (
    <div className="correction-print-all-packet" aria-label="Complete correction of entries packet">
      <div className="no-print mb-4 rounded-lg border border-[#0d9488]/40 bg-[#ecfdf5] px-4 py-3 text-xs text-gray-800">
        <p className="font-semibold text-[#0f766e] m-0 mb-1">Complete packet</p>
        <p className="m-0 leading-relaxed">
          All sections below use this session&apos;s form data only. Use <strong>Print / Save as PDF</strong> for one file
          containing every document in order.
        </p>
      </div>
      {CORRECTION_PRINT_ALL_IDS.map((id) => {
        const Comp = byId[id]
        if (!Comp) return null
        return (
          <div key={id} className="correction-print-all-chunk">
            <Comp data={data} />
          </div>
        )
      })}
    </div>
  )
}

export const CORRECTION_PRINT_RENDERERS = {
  [CORRECTION_COMPLETE_PACKET_ID]: AllOutputsCombinedPrint,
  certification: CertificationPrint,
  'petition-form': PetitionForm904811Print,
  'certificate-of-posting': CertificateOfPostingPrint,
  'record-sheet': RecordSheetPrint,
  'notice-for-posting': NoticeForPostingPrint,
  'certificate-of-finality': CertificateOfFinalityPrint,
  'second-transmittal-letter': SecondTransmittalLetterPrint,
  'second-transmittal-enclosures': SecondTransmittalEnclosuresPrint,
}
