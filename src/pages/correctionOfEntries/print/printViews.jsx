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

function DetailTable({ children }) {
  return (
    <table className="w-full border-collapse border border-black mb-6 text-[12px]">
      <tbody>{children}</tbody>
    </table>
  )
}

function DetailRow({ label, value }) {
  return (
    <tr>
      <td className="border border-black p-2 font-semibold w-[40%] text-[12px]">{label}</td>
      <td className="border border-black p-2 font-bold uppercase text-[12px]">{u(value)}</td>
    </tr>
  )
}

function SubTitleBlock({ children }) {
  return (
    <div className="mb-8">
      <div className="border-t-[1px] border-gray-400 mb-2 w-[80%] mx-auto" />
      <h2 className="text-center font-bold text-[11px] uppercase px-12 leading-snug">
        {children}
      </h2>
      <div className="border-t-[1px] border-gray-400 mt-2 w-[80%] mx-auto" />
    </div>
  )
}

/** --- Petition: Certification --- */
export function CertificationPrint({ data }) {
  const signatory = data.cityCivilRegistrarName
  const issued = formatDateLong(data.certificationIssuedDate || new Date().toISOString().slice(0, 10))
  const petitionNo = formatPetitionNumberDisplay(data)
  const fillingDate = formatDateLong(data.dateOfFiling || data.dateOfReceiptFiling)

  return (
    <div className="correction-print-doc bg-white text-black max-w-[210mm] mx-auto px-8 py-6 text-[12px] leading-relaxed font-sans">
      <LcroRaHeader />

      <h1 className="text-center font-bold text-[24px] uppercase mb-4 tracking-wider">Certification</h1>
      
      <SubTitleBlock>
        PETITION FOR CORRECTION OF CLERICAL ERROR<br />IN THE CERTIFICATE OF LIVE BIRTH
      </SubTitleBlock>

      <p className="font-bold text-[12px] mb-6 uppercase">TO WHOM IT MAY CONCERN:</p>
      
      <p className="text-justify text-[12px] mb-6 indent-8">
        This is to certify that a petition for Correction of Clerical Error pursuant to RA 9048 
        has been filed in this office for OCRG approval;
      </p>
      
      <DetailTable>
        <DetailRow label="Name of Petitioner" value={data.petitionerName} />
        <DetailRow label="Address" value={data.petitionerAddress} />
        <DetailRow label="Date of Filing" value={fillingDate} />
        <DetailRow label="Petition No." value={petitionNo} />
        <DetailRow label="Name of Document Owner" value={data.documentOwnerName} />
        <DetailRow label="Registry Number" value={data.registryNumber} />
      </DetailTable>

      {/* Table 2: Corrections */}
      <table className="w-full border-collapse border border-black mb-8 text-[12px]">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-black p-2 w-1/3">Description</th>
            <th className="border border-black p-2 w-1/3">From</th>
            <th className="border border-black p-2 w-1/3">To</th>
          </tr>
        </thead>
        <tbody>
          {(data.corrections || []).map((row, i) => (
            <tr key={row.id || i}>
              <td className="border border-black p-2 text-center font-semibold">{u(row.description)}</td>
              <td className="border border-black p-2 text-center font-bold uppercase">{u(row.from)}</td>
              <td className="border border-black p-2 text-center font-bold uppercase">{u(row.to)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-[12px] mb-12">
        Issued this <span className="font-medium underline">{issued}</span> for what ever purpose it may serve.
      </p>

      {/* Signatory */}
      <div className="flex flex-col items-end mb-12">
        <div className="text-center w-[300px]">
          <div className="border-b border-black mb-1 w-full" />
          <p className="font-bold uppercase m-0 leading-tight text-[12px]">{u(signatory) || 'ATTY. YUSSIF DON JUSTIN F. MARTIL, REB'}</p>
          <p className="text-[11px] m-0">City Civil Registrar</p>
        </div>
      </div>
      
      {/* Payment Details (Bottom Left) */}
      <div className="mt-auto pt-4 border-t border-transparent text-[11px]">
        <div className="grid grid-cols-[100px_1fr] gap-x-1">
          <span className="font-medium">OR Number</span>
          <span>: {u(data.orCertificationNumber)}</span>
          
          <span className="font-medium">Amount</span>
          <span>: {u(data.amountCertification) || '1,000.00'}</span>
          
          <span className="font-medium">Date</span>
          <span>: {formatDateLong(data.dateOfReceiptFiling)}</span>
        </div>
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
  const currentYear = new Date().getFullYear()

  return (
    <div className="correction-print-doc bg-white text-black max-w-[210mm] mx-auto px-8 py-6 text-[12px] leading-relaxed font-sans relative">
      <LcroRaHeader />

      <h1 className="text-center font-bold text-[24px] uppercase mb-4 tracking-wider">Petition for Correction of Clerical Error</h1>
      
      <SubTitleBlock>
        IN THE CERTIFICATE OF LIVE BIRTH
      </SubTitleBlock>

      {/* Received Box (Positioned below sub-title) */}
      <div className="flex justify-end mb-6">
        <div className="w-[220px] border border-black p-2 text-[10px]">
          <p className="m-0 font-bold uppercase underline mb-2">Office of the City Civil Registrar</p>
          <p className="m-0">Iligan, Lanao del Norte</p>
          <p className="m-0 mt-2">Received: <span className="underline">{u(data.dateOfReceiptFiling) || '________________'}</span></p>
          <div className="mt-4 border-t border-black pt-1 text-center font-bold uppercase">
            {u(data.receivedByName) || 'LORELL E. CANTO'}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-start gap-2 text-[11px] mb-4">
        <p className="m-0">Republic of the Philippines)<br />Iligan, Lanao del Norte )S.S.</p>
        <p className="m-0 font-bold">Petition No.: <span className="underline">{petitionNo || `CCE-0141-${currentYear}`}</span></p>
      </div>

      <p className="text-justify indent-4 mb-4">
        I, <span className="font-bold uppercase underline">{u(data.petitionerName)}</span>, of legal age, {u(data.nationality) || 'Filipino'}, and a resident of {u(data.petitionerAddress) || 'Iligan City'}, after having been duly sworn in accordance with law, hereby declare that:
      </p>

      <ol className="list-decimal pl-8 space-y-3 text-justify">
        <li>
          I am the petitioner seeking correction of the clerical error in my <span className="font-bold underline">{u(formatTypeOfDocumentForPrint(data))}</span>.
        </li>
        <li>
          I/He/She was born on <span className="font-bold underline uppercase">{dob || '________________'}</span> at <span className="font-bold underline uppercase">{pob || '________________'}</span>.
        </li>
        <li>
          The birth was recorded under Registry No. <span className="font-bold underline">{u(data.registryNumber)}</span>.
        </li>
        <li>
          <div className="mb-2 font-bold">The clerical error/s to be corrected is/are:</div>
          <table className="w-full border-collapse border border-black text-[11px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-black p-1.5 w-16">Item No.</th>
                <th className="border border-black p-1.5">Description</th>
                <th className="border border-black p-1.5 min-w-[6rem]">From</th>
                <th className="border border-black p-1.5 min-w-[6rem]">To</th>
              </tr>
            </thead>
            <tbody>
              {(data.corrections || []).map((row, i) => (
                <tr key={row.id || i}>
                  <td className="border border-black p-1.5 text-center font-bold">{i + 1}</td>
                  <td className="border border-black p-1.5">{u(row.description)}</td>
                  <td className="border border-black p-1.5 font-bold uppercase">{u(row.from)}</td>
                  <td className="border border-black p-1.5 font-bold uppercase">{u(row.to)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </li>
        <li>
          <div className="mb-1 font-bold text-[11px]">The facts/reasons for filing this petition:</div>
          <p className="m-0 font-bold italic">To correct the above-stated clerical error/s pursuant to RA 9048.</p>
        </li>
        <li>
          <div className="mb-1 font-bold text-[11px]">I submit the following certified true copies of documents in support of this petition:</div>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Certificate of Live Birth (PSA/LCRO Copy)</li>
            <li>Valid ID/s</li>
            <li>Birth Certificate of Child/Children (if applicable)</li>
            {(data.supportingDocuments || []).filter(Boolean).map((doc, i) => (
              <li key={i}>{doc}</li>
            ))}
          </ul>
        </li>
        <li>
          <div className="mb-1 font-bold text-[11px]">I hereby certify that:</div>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>I have not filed any similar petition.</li>
            <li>No other petition is pending with any LCRO, Court, or Philippine Consulate.</li>
            <li>This petition is filed in accordance with RA 9048 / RA 10172 and its implementing rules and regulations.</li>
          </ul>
        </li>
      </ol>

      <div className="mt-10 mb-8 flex flex-col items-end">
        <div className="text-center w-[250px]">
          <div className="border-b border-black mb-1" />
          <p className="font-bold uppercase m-0 leading-tight">{u(data.petitionerName)}</p>
          <p className="text-[10px] m-0">Signature over Printed Name of Petitioner</p>
        </div>
      </div>

      <div className="mb-8 border-t border-black pt-4">
        <h3 className="text-center font-bold text-[13px] mb-3 uppercase tracking-widest underline">Verification</h3>
        <p className="text-justify indent-8 mb-6">
          I, <span className="font-bold uppercase underline">{u(data.petitionerName)}</span>, hereby certify that the allegations herein are true and correct to the best of my knowledge and belief.
        </p>
        <div className="flex flex-col items-end">
          <div className="text-center w-[250px]">
            <div className="border-b border-black mb-1" />
            <p className="font-bold uppercase m-0 leading-tight">{u(data.petitionerName)}</p>
            <p className="text-[10px] m-0">Signature over Printed Name of Petitioner</p>
          </div>
        </div>
      </div>

      <div className="mb-10 text-[11px] pt-4">
        <p className="text-justify m-0">
          <span className="font-bold">SUBSCRIBED AND SWORN</span> to before me this <span className="underline">{u(data.swornDay) || '____'}</span> day of <span className="underline">{u(data.swornMonth) || '____________'}</span>, <span className="underline">{u(data.swornYear) || currentYear}</span> in Iligan City, Lanao del Norte, petitioner exhibiting her <span className="font-bold underline">{u(data.idPresented) || 'NATIONAL ID'}</span>.
        </p>
        <div className="mt-12 flex flex-col items-end">
          <div className="text-center w-[250px]">
            <div className="border-b border-black mb-1" />
            <p className="text-[10px] font-bold m-0 mt-1 uppercase">Notary Public / Administering Officer</p>
          </div>
        </div>
      </div>

      {/* Payment Details Section at Bottom */}
      <div className="mt-10 pt-4 border-t border-dashed border-gray-500">
        <p className="font-bold text-[11px] mb-2">Payment of filing fee (Attached copy of the official receipt)</p>
        <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1 text-[11px]">
          <span className="font-bold">O.R. Number</span>
          <span>: <span className="font-medium">{u(data.orFilingFeeNumber) || '___________'}</span></span>
          
          <span className="font-bold">Amount</span>
          <span>: <span className="font-medium">Php {u(data.amountPaidFiling) || '1,000.00'}</span></span>
          
          <span className="font-bold">Date</span>
          <span>: <span className="font-medium">{formatDateLong(data.dateOfReceiptFiling)}</span></span>
        </div>
      </div>
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
      <div className="correction-print-doc bg-white text-black max-w-[210mm] mx-auto px-8 py-6 text-[12px] leading-relaxed font-sans">
      <LcroRaHeader />
      <h1 className="text-center font-bold text-[24px] uppercase mb-4 tracking-wider">Certificate of Posting</h1>
      
      <SubTitleBlock>
        PETITION FOR CORRECTION OF CLERICAL ERROR<br />IN THE {formatTypeOfDocumentForPrint(data).toUpperCase()}
      </SubTitleBlock>

      <DetailTable>
        <DetailRow label="Petition No." value={petitionNo} />
        <DetailRow label="Date" value={formatDateLong(data.dateOfFiling)} />
        <DetailRow label="Name of Petitioner" value={data.petitionerName} />
        <DetailRow label="Type / Nature of Petition" value="Correction of Clerical Error" />
        <DetailRow label="Type of Document" value={formatTypeOfDocumentForPrint(data)} />
        <DetailRow label="Name of Document Owner" value={data.documentOwnerName} />
        <DetailRow label="Registry No." value={data.registryNumber} />
        <DetailRow label="Posting Period" value={`${periodFrom} to ${periodTo}`} />
        <DetailRow label="Place of Posting" value={data.placeOfPosting} />
      </DetailTable>
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
    <div className="correction-print-doc bg-white text-black max-w-[210mm] mx-auto px-8 py-6 text-[12px] leading-relaxed font-sans">
      <LcroRaHeader />
      <h1 className="text-center font-bold text-[24px] uppercase mb-4 tracking-wider">Record Sheet</h1>
      
      <SubTitleBlock>
        PETITION FOR CORRECTION OF CLERICAL ERROR<br />IN THE {formatTypeOfDocumentForPrint(data).toUpperCase()}
      </SubTitleBlock>

      <DetailTable>
        <DetailRow label="Petition No." value={petitionNo} />
        <DetailRow label="Petitioner's Name" value={data.petitionerName} />
        <DetailRow label="Document Owner" value={data.documentOwnerName} />
        <DetailRow label="Registry No." value={data.registryNumber} />
      </DetailTable>

      <h2 className="text-center font-bold text-[16px] uppercase tracking-wide my-2">Official Record Details</h2>
      
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
              <td className="border border-black p-1 text-center font-bold">{i + 1}</td>
              <td className="border border-black p-1">{u(row.description)}</td>
              <td className="border border-black p-1 font-bold">{u(row.from)}</td>
              <td className="border border-black p-1 font-bold">{u(row.to)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-center font-bold text-[12px] uppercase mb-2">Decision on Petition</h3>
      <table className="w-full border-collapse border border-black text-[11px] mb-6">
        <tbody>
          <tr>
            <td className="border border-black p-2 font-bold bg-gray-50">By C/MCR, CG or D/CR:</td>
            <td className="border border-black p-2 text-center">
              Granted {data.decisionCmcrGranted ? '☒' : '☐'} Denied {data.decisionCmcrDenied ? '☒' : '☐'}
            </td>
            <td className="border border-black p-2 text-center underline">{formatDateLong(data.decisionCmcrDate)}</td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-bold bg-gray-50">By CRG:</td>
            <td className="border border-black p-2 text-center">
              Affirmed {data.decisionCrgAffirmed ? '☒' : '☐'} Impugned {data.decisionCrgImpugned ? '☒' : '☐'}
            </td>
            <td className="border border-black p-2 text-center underline">{formatDateLong(data.decisionCrgDate)}</td>
          </tr>
        </tbody>
      </table>

      <p className="text-[10px] mb-2 font-bold">
        Certificate of Finality issued on: <span className="underline">{formatDateLong(data.certificateOfFinalityIssuedOn)}</span>
      </p>
      <p className="text-[10px] font-semibold mb-1 uppercase text-[#1e3a8a]">Remarks:</p>
      <p className="text-[10px] border border-gray-300 bg-gray-50/50 min-h-[4rem] p-2 whitespace-pre-wrap rounded-md mb-6">{u(data.remarksRecordSheet)}</p>
      
      <SignatoryBlock name={signatory} />

      <div className="mt-8 pt-4 border-t border-gray-200 text-center">
         <p className="text-[10px] italic text-gray-500 font-medium">
            City Civil Registrar&apos;s Office - Iligan City | Always Ready and Happy to Serve You...
          </p>
      </div>
    </div>
  )
}

/** --- First transmittal: Notice for Posting --- */
export function NoticeForPostingPrint({ data }) {
  const signatory = data.cityCivilRegistrarName

  return (
    <div className="correction-print-doc bg-white text-black max-w-[210mm] mx-auto px-8 py-6 text-[12px] leading-relaxed font-sans">
      <LcroRaHeader />
      <h1 className="text-center font-bold text-[24px] uppercase mb-4 tracking-wider">Notice for Posting</h1>
      
      <SubTitleBlock>
        PETITION FOR CORRECTION OF CLERICAL ERROR<br />IN THE {formatTypeOfDocumentForPrint(data).toUpperCase()}
      </SubTitleBlock>

      <p className="text-justify mb-4 font-bold">
        TO WHOM IT MAY CONCERN:
      </p>
      <p className="text-justify mb-4">
        The public is hereby notified that a petition was filed with this Office by:
      </p>

      <DetailTable>
        <DetailRow label="Name of Petitioner" value={data.petitionerName} />
        <DetailRow label="Type of Document" value={formatTypeOfDocumentForPrint(data)} />
        <DetailRow label="Type / Nature of Petition" value="Correction of Clerical Error" />
        <DetailRow label="Name of Document Owner" value={data.documentOwnerName} />
        <DetailRow label="Date of Filing" value={formatDateLong(data.dateOfFiling)} />
      </DetailTable>
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
    <div className="correction-print-doc bg-white text-black max-w-[210mm] mx-auto px-8 py-6 text-[12px] leading-relaxed font-sans">
      <LcroRaHeader />
      <h1 className="text-center font-bold text-[24px] uppercase mb-4 tracking-wider">Certificate of Finality</h1>
      
      <SubTitleBlock>
        PETITION FOR CORRECTION OF CLERICAL ERROR<br />IN THE {formatTypeOfDocumentForPrint(data).toUpperCase()}
      </SubTitleBlock>

      <DetailTable>
        <DetailRow label="OCRG Affirmed Date" value={data.ocrgAffirmedDate} />
        <DetailRow label="Affirmed Number" value={data.affirmedNumber} />
        <DetailRow label="OCRG Impugned Date" value={data.ocrgImpugnedDate} />
        <DetailRow label="Impugned Number" value={data.impugnedNumber} />
        <DetailRow label="Finality Date" value={data.certificateOfFinalityDate} />
      </DetailTable>
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
    <div className="correction-print-doc bg-white text-black max-w-[210mm] mx-auto px-8 py-6 text-[12px] leading-relaxed font-sans">
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
    <div className="correction-print-doc bg-white text-black max-w-[210mm] mx-auto px-8 py-6 text-[12px] leading-relaxed font-sans">
      <LcroRaHeader />
      <h1 className="text-center font-bold text-[24px] uppercase mb-4 tracking-wider">Enclosed Documents</h1>
      <DetailTable>
        <DetailRow label="Petition No." value={petitionNo} />
        <DetailRow label="Petitioner" value={data.petitionerName} />
        <DetailRow label="Document Owner" value={data.documentOwnerName} />
      </DetailTable>
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
