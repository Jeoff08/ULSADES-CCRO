import React from 'react'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'
import { buildLcr1aTableDisplay } from '../../courtDecree/lib/lcr1aTable'
import {
  SUPPLEMENTAL_TRANSMITTAL_ATTACHMENT_OPTIONS,
  SUPPLEMENTAL_TRANSMITTAL_DOC_TYPE_OPTIONS,
  SUPPLEMENTAL_TRANSMITTAL_ENDORSEMENT_OPTIONS,
  transmittalRecipientOfficeLinesForPrint,
  transmittalRecipientPositionLines,
  transmittalThruPositionLinesForPrint,
} from '../lib/supplementalTransmittalDefaults'
import { pickBirthRegisterPageBook } from '../lib/registerBirthBookPagePick'

function ocrLineDate(iso) {
  if (!iso) return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
  } catch {
    return String(iso)
  }
}

function MunicipalMcrHeader({ province, municipality }) {
  const p = String(province || '').trim() || 'Lanao del Norte'
  const m = String(municipality || '').trim() || 'Tubod'
  return (
    <header className="wrongly-wr-mcr-header text-center text-[1em] leading-snug mb-2">
      <p className="m-0">Republic of the Philippines</p>
      <p className="m-0">Province of {p}</p>
      <p className="m-0">Municipality of {m}</p>
      <p className="m-0 font-bold uppercase tracking-tight mt-1.5 text-[1.1em]">Office of the Municipal Civil Registrar</p>
    </header>
  )
}

function checklistRow(label, selected, keyHint) {
  return (
    <div
      key={keyHint ?? label}
      className={`wrongly-wr-check-row grid grid-cols-[22px_1fr] items-stretch border border-black min-h-[1.75rem] ${selected ? 'bg-sky-100 print:bg-sky-100' : 'bg-white'}`}
    >
      <div className="border-r border-black flex items-center justify-center">
        <span
          className={`wrongly-wr-check-box w-3.5 h-3.5 border border-black shrink-0 ${selected ? 'bg-[#0b61ff]' : 'bg-white'}`}
        />
      </div>
      <div className="px-2 py-1 text-[1em] leading-tight">{label}</div>
    </div>
  )
}

/** Image 1 — Iligan City Civil Registrar transmittal (wrongly register). */
export function WronglyRegisterTransmittalView({ data, displayDate }) {
  const endorsementIds = Array.isArray(data.transmittalEndorsementIds) ? data.transmittalEndorsementIds : []
  const attachmentIds = Array.isArray(data.transmittalAttachmentIds) ? data.transmittalAttachmentIds : []
  const docType = String(data.transmittalDocType || '').trim()

  const docRows = SUPPLEMENTAL_TRANSMITTAL_DOC_TYPE_OPTIONS.map((row) => ({
    label: row.label,
    selected: docType === row.id,
  }))
  const attachmentRows = SUPPLEMENTAL_TRANSMITTAL_ATTACHMENT_OPTIONS.map((row, idx) => ({
    label: `${idx + 1}. ${row.label}`,
    selected: attachmentIds.includes(row.id),
  }))
  const endorsementRows = SUPPLEMENTAL_TRANSMITTAL_ENDORSEMENT_OPTIONS.map((row, idx) => ({
    label: `${idx + 1}. ${row.label}`,
    selected: endorsementIds.includes(row.id),
  }))

  const docRowsPrint = SUPPLEMENTAL_TRANSMITTAL_DOC_TYPE_OPTIONS.filter((row) => docType === row.id).map((row) => ({
    label: row.label,
  }))
  const endorsementRowsPrint = SUPPLEMENTAL_TRANSMITTAL_ENDORSEMENT_OPTIONS.filter((row) =>
    endorsementIds.includes(row.id)
  ).map((row, i) => ({
    label: `${i + 1}. ${row.label}`,
  }))
  const attachmentRowsPrint = SUPPLEMENTAL_TRANSMITTAL_ATTACHMENT_OPTIONS.filter((row) =>
    attachmentIds.includes(row.id)
  ).map((row, i) => ({
    label: `${i + 1}. ${row.label}`,
  }))

  return (
    <div className="wrongly-wr-transmittal-root font-sans text-gray-900 flex flex-col flex-1 min-h-0 min-w-0">
      <header className="wrongly-wr-transmittal-print-header shrink-0">
        <PrintHeaderRow headerImageClassName="w-28 h-28" singleLineAddress />
        <hr className="border-black border-t my-3 print:my-2" />
      </header>

      <div className="wrongly-wr-transmittal-body-content flex flex-col flex-1 min-h-0 mx-[0.5in] print:mx-0">
        <p className="text-center font-bold uppercase tracking-[0.2em] m-0 text-[1.15em]">TRANSMITTAL</p>

        <div className="mt-4 w-fit max-w-full">
          <p className="m-0 font-semibold underline underline-offset-2">{displayDate(data.transmittalDate)}</p>
          <p className="m-0 text-[0.85em] text-center">Date</p>
        </div>

        <div className="mt-5 text-left">
          <p className="m-0 font-bold uppercase leading-snug">{data.transmittalRecipient}</p>
          {transmittalRecipientPositionLines(data).map((line) => (
            <p key={line} className="m-0 uppercase leading-snug text-[1em]">
              {line}
            </p>
          ))}
          {transmittalRecipientOfficeLinesForPrint(data).map((line) => (
            <p key={line} className="m-0 uppercase leading-snug text-[1em]">
              {line}
            </p>
          ))}
        </div>

        <div className="mt-4 pl-8 sm:pl-12">
          <p className="m-0 leading-snug text-[1em]">
            <span className="font-bold uppercase">ATTN: </span>
            <span className="font-bold uppercase">{data.transmittalThru}</span>
          </p>
          {transmittalThruPositionLinesForPrint(data).map((line) => (
            <p key={line} className="m-0 uppercase leading-snug text-[1em]">
              {line}
            </p>
          ))}
        </div>

        <p className="mt-5 mb-0 text-[1em]">{(data.transmittalSalutation || 'Sir:').trim()}</p>
        <p className="mt-2 mb-0 leading-relaxed text-[1em]">
          We are transmitting the Civil Registry Document of{' '}
          <span className="font-bold underline uppercase">{data.transmittalColbName}</span>
        </p>

        <ul className="list-disc ml-8 sm:ml-10 mt-2 mb-0 space-y-0.5 text-[1em] pl-1">
          <li>
            LCR NO. <span className="font-bold underline">{data.transmittalRegistryNo}</span>
          </li>
          <li>
            Date of birth: <span className="font-bold underline">{displayDate(data.transmittalDob)}</span>
          </li>
          <li>
            Name of Father: <span className="font-bold underline uppercase">{data.transmittalFather}</span>
          </li>
          <li>
            Name of Mother: <span className="font-bold underline uppercase">{data.transmittalMother}</span>
          </li>
          {data.lcrPage || data.lcrBook ? (
            <li>
              Page / Book No: <span className="font-bold underline uppercase">{data.lcrPage || '___'} / {data.lcrBook || '___'}</span>
            </li>
          ) : null}
        </ul>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-3 sm:items-start print:grid print:grid-cols-2 print:gap-x-6 print:gap-y-3 print:items-start">
          <div className="sm:col-start-1 sm:row-start-1 print:col-start-1 print:row-start-1 min-w-0">
            <p className="font-bold mb-1 uppercase text-[0.92em] tracking-wide">Type of Document</p>
            <div className="space-y-0 print:hidden">{docRows.map((row) => checklistRow(row.label, row.selected))}</div>
            <div className="space-y-0 hidden print:block">
              {docRowsPrint.map((row, i) => checklistRow(row.label, true, `wr-print-doctype-${i}`))}
            </div>
          </div>
          <div className="sm:col-start-2 sm:row-start-1 sm:row-span-2 sm:self-start print:col-start-2 print:row-start-1 print:row-span-2 print:self-start min-w-0">
            <p className="font-bold mb-1 uppercase text-[0.92em] tracking-wide">Request for Endorsement</p>
            <div className="space-y-0 print:hidden">
              {endorsementRows.map((row) => checklistRow(row.label, row.selected))}
            </div>
            <div className="space-y-0 hidden print:block">
              {endorsementRowsPrint.map((row, i) => checklistRow(row.label, true, `wr-print-endorse-${i}`))}
            </div>
          </div>
          <div className="sm:col-start-1 sm:row-start-2 print:col-start-1 print:row-start-2 min-w-0">
            <p className="font-bold mb-1 uppercase text-[0.92em] tracking-wide">Attachments</p>
            <div className="space-y-0 print:hidden">{attachmentRows.map((row) => checklistRow(row.label, row.selected))}</div>
            <div className="space-y-0 hidden print:block">
              {attachmentRowsPrint.map((row, i) => checklistRow(row.label, true, `wr-print-attach-${i}`))}
            </div>
          </div>
        </div>

        <div className="wrongly-wr-transmittal-spacer flex-1 min-h-4 print:min-h-0" aria-hidden />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6 shrink-0 print:mt-6">
          <div>
            <p className="m-0 text-[1em]">Respectfully yours,</p>
            <p className="m-0 mt-6 font-bold uppercase underline text-[1em] print:mt-4">
              {(data.transmittalSignerName || '').trim() || 'LORELIE L. CANTO'}
            </p>
            <p className="m-0 text-[0.92em] leading-tight">{(data.transmittalSignerTitle || '').trim() || 'Registration Officer IV'}</p>
          </div>
          {(data.transmittalDocOwner || '').trim() ? (
            <div className="text-right">
              <p className="m-0 mt-8 font-bold underline uppercase text-[1em] print:mt-6">{(data.transmittalDocOwner || '').trim()}</p>
            </div>
          ) : null}
        </div>
      </div>

      <footer className="wrongly-wr-transmittal-print-footer wrongly-wr-transmittal-footer mt-auto shrink-0 pt-3 print:pt-2 w-full" role="contentinfo">
        <DocumentFooter
          sloganBlue
          sloganLines={['Births, Marriages and Deaths matter,', 'Register them all!']}
          contactPhone="228-1311"
          contactEmail="civilregistrar.iligan@gmail.com"
          contentClassName="text-[0.92em] leading-snug"
        />
      </footer>
    </div>
  )
}

/** Image 2 — Civil Registry Form No. 1A (Birth-Available), Iligan City CRC. */
export function WronglyRegisterLcrCityForm1AView({ tableData, displayDate, issueDateIso, remarks, amountPaid, orNo, datePaid, colbPage: propPage, colbBook: propBook }) {
  const table = buildLcr1aTableDisplay(tableData)
  const pb = pickBirthRegisterPageBook(tableData)
  const colbPage = propPage || pb.page
  const colbBook = propBook || pb.book
  const formDate = displayDate(issueDateIso || tableData.certificateIssuanceDate || '')
  const remarksText = String(remarks || '').trim()
  const verifiedName = String(tableData.certificateSignatoryName || tableData.ocrVerifiedBy || 'LORELIE L. CANTO').trim() || 'LORELIE L. CANTO'
  const verifiedTitle = String(tableData.certificateSignatoryTitle || tableData.ocrVerifiedByTitle || 'Registration Officer IV').trim()

  return (
    <div className="wrongly-wr-lcr-city font-sans text-gray-900 text-[1em] leading-snug flex flex-col flex-1 min-h-0 mx-[0.5in]">
      <header className="shrink-0">
        <PrintHeaderRow headerImageClassName="w-28 h-28" singleLineAddress />
        <hr className="border-black my-3 print:my-2" />
      </header>

      <main className="flex-1">
        <div className="flex justify-between items-start gap-4 mb-2">
          <div>
            <p className="m-0 font-bold text-[1.15em]">Civil Registry Form No. 1A</p>
            <p className="m-0 text-[1em]">(Birth-Available)</p>
          </div>
          <div className="text-center w-44 shrink-0">
            <p className="m-0 font-semibold border-b border-black min-h-[1.35rem] px-1">{formDate}</p>
            <p className="m-0 text-[0.85em] mt-0.5">Date</p>
          </div>
        </div>

        <p className="font-bold mt-2 mb-1 pl-6 sm:pl-10">TO WHOM IT MAY CONCERN:</p>
        <p className="mb-3 text-justify pl-2 sm:pl-4">
          We certify that, among others, the following facts of birth appear in our Register of Births on Page{' '}
          <span className="inline-block min-w-[1.5rem] border-b border-black text-center font-bold px-1">{colbPage}</span>
          {' '}of Book number{' '}
          <span className="inline-block min-w-[1.5rem] border-b border-black text-center font-bold px-1">{colbBook}</span>.
        </p>

        <table className="w-full border-collapse border border-black text-[1em] mb-3">
          <tbody>
            {[
              ['LCR Registry Number', table.registry],
              ['Date of Registration', table.dateReg],
              ['Name of Child', table.nameChild],
              ['Sex', table.sex],
              ['Date of Birth', table.dob],
              ['Place of Birth', table.pob],
              ['Name of Mother', table.mother],
              ['Citizenship of Mother', table.motherCit],
              ['Name of Father', table.father],
              ['Citizenship of Father', table.fatherCit],
              ['Date of Marriage of Parents', table.dom],
              ['Place of Marriage of Parents', table.pom],
            ].map(([label, val]) => (
              <tr key={label}>
                <td className="py-1 px-2 border border-black font-medium align-top w-[44%]">{label}</td>
                <td className="py-1 px-2 border border-black font-bold text-center uppercase align-top">{val}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mb-3 text-justify">
          This certification is issued upon the request of <span className="font-bold">OCRG/OWNER/PARENTS/GUARDIAN</span> for any legal purposes.
        </p>

        <div className="mb-4">
          <p className="font-bold m-0 mb-1">REMARKS:</p>
          <p className="m-0 text-justify whitespace-pre-wrap min-h-[1.5rem]">{remarksText}</p>
        </div>

      </main>

      <footer className="mt-auto pt-0 wrongly-wr-footer-push-bottom">
        <div className="flex justify-between mb-4">
          <div className="w-[45%]">
            <p className="m-0">Verified by:</p>
            <p className="mt-10">
              <span className="border-b border-black font-bold uppercase inline-block px-1 min-w-[8rem]">{verifiedName}</span>
            </p>
            <p className="m-0 text-[0.92em]">{verifiedTitle}</p>
          </div>
        </div>

        <div className="text-[0.92em] mb-8 leading-tight">
          <p className="m-0">Amount : {amountPaid || 'Php ________'}</p>
          <p className="m-0">O.R. No : {orNo || '________'}</p>
          <p className="m-0">Date Paid : {datePaid || formDate}</p>
        </div>

        <p className="text-center font-bold italic text-[0.92em] mb-1">
          Note: A mark, erasure or alteration of any entry invalidates this certification
        </p>
        <DocumentFooter sloganBlue contactPhone="(063) 224 - 5038" contactEmail="civilregistrar.iligan@gmail.com" contentClassName="text-[0.85em]" />
      </footer>
    </div>
  )
}

/** Image 3 — LCR Form No. 1A (Birth Available), municipal MCR (OCR output). */
export function WronglyRegisterOcrMunicipalForm1AView({ data, colbPage: propPage, colbBook: propBook }) {
  const province = String(data.ocrMcrProvince || '').trim() || 'Lanao del Norte'
  const municipality = String(data.ocrMcrMunicipality || '').trim() || 'Tubod'
  const pb = pickBirthRegisterPageBook(data)
  const page = propPage || pb.page
  const book = propBook || pb.book

  const rows = [
    ['LCR Registry Number', data.lcrRegistryNo],
    ['Date of Registration', data.lcrDateRegistration],
    ['Name of Child', data.lcrChildName],
    ['Sex', data.lcrSex],
    ['Date of Birth', data.lcrBirthDate],
    ['Place of Birth', data.lcrPlaceBirth],
    ['Name of Mother', data.lcrMotherName],
    ['Citizenship of Mother', data.lcrMotherCitizenship],
    ['Name of Father', data.lcrFatherName],
    ['Citizenship of Father', data.lcrFatherCitizenship],
    ['Date of Marriage of Parents', data.lcrDateMarriage],
    ['Place of Marriage of Parents', data.lcrPlaceMarriage],
  ]

  return (
    <div className="wrongly-wr-ocr-muni font-sans text-gray-900 text-[1em] flex flex-col flex-1 min-h-0 mx-[0.5in]">
      <header className="shrink-0">
        <MunicipalMcrHeader province={province} municipality={municipality} />
        <hr className="border-black border-t my-2" />
      </header>

      <main className="flex-1">
        <div className="flex justify-between items-start gap-4 mb-2">
          <div>
            <p className="m-0 font-bold">LCR Form No. 1A</p>
            <p className="m-0">(Birth Available)</p>
          </div>
          <div className="text-center w-40 shrink-0">
            <p className="m-0 font-medium border-b border-black min-h-[1.25rem]">{ocrLineDate(data.transmittalDate)}</p>
            <p className="m-0 text-[0.85em]">Date</p>
          </div>
        </div>

        <p className="font-bold mt-2 mb-1">To Whom It May Concern:</p>
        <p className="mb-3 leading-relaxed">
          We certify that, among others, the following facts of birth appear in our Register of Births on page{' '}
          <span className="inline-block min-w-[2rem] border-b border-black text-center font-semibold mx-0.5">{page}</span>
          {' '}of book number{' '}
          <span className="inline-block min-w-[2rem] border-b border-black text-center font-semibold mx-0.5">{book}</span>:
        </p>

        <div className="space-y-1 mb-4">
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[minmax(0,46%)_12px_1fr] gap-1 items-end">
              <span>{label}</span>
              <span>:</span>
              <span className="border-b border-black min-h-[1.2rem] font-semibold uppercase px-1">{value || ''}</span>
            </div>
          ))}
        </div>

        <p className="mb-1">
          This Certification is issued to:{' '}
          <span className="inline-block min-w-[12rem] border-b border-black font-bold uppercase px-1">{data.ocrRequestorName || ''}</span>
        </p>
        <p className="mb-4">
          upon his/her request for{' '}
          <span className="inline-block min-w-[10rem] border-b border-black font-bold uppercase px-1">
            {data.transmittalEndorsementOther || 'TRANSFER OF REGISTRATION'}
          </span>
          .
        </p>

        <p className="font-bold m-0">REMARKS:</p>
        <p className="mt-1 mb-6 italic text-justify whitespace-pre-wrap min-h-[1.5rem]">
          {data.ocrRemarks || ''}
        </p>

      </main>

      <footer className="mt-auto pt-0 -mb-2 wrongly-wr-footer-push-bottom">
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div className="text-center">
            <p className="m-0 text-left">Verified by:</p>
            <p className="mt-8">
              <span className="border-b border-black font-bold uppercase inline-block px-1 min-w-[8rem]">{data.ocrVerifiedBy || ''}</span>
            </p>
            <p className="text-[0.92em]">{data.ocrVerifiedByTitle || 'Bookbinder III'}</p>
          </div>
          <div className="text-center">
            <p className="mt-8">
              <span className="border-b border-black font-bold uppercase inline-block px-1 min-w-[8rem]">{data.ocrMunicipalRegistrar || ''}</span>
            </p>
            <p className="text-[0.92em]">Municipal Civil Registrar</p>
          </div>
        </div>

        <div className="text-[0.92em] mb-8 leading-tight">
          <p className="m-0">Amount Paid : {data.ocrAmountPaid || ''}</p>
          <p className="m-0">O. R. Number : {data.ocrORNumber || ''}</p>
          <p className="m-0">Date Paid : {data.ocrDatePaid || ''}</p>
        </div>

        <p className="text-[0.85em] text-center mb-1 font-bold italic">
          Note: This certification is not valid if it has mark of erasure or alteration of any entry.
        </p>
        <DocumentFooter sloganBlue contactPhone="(063) 224 - 5038" contactEmail="civilregistrar.iligan@gmail.com" contentClassName="text-[0.85em]" />
      </footer>
    </div>
  )
}

/** Image 4 — Municipal forwarding letter. */
export function WronglyRegisterForwardingMunicipalView({ data, displayDate }) {
  const province = String(data.forwardingMcrProvince || '').trim() || 'Lanao del Norte'
  const municipality = String(data.forwardingMcrMunicipality || '').trim() || 'Tubod'
  const iso = data.forwardingDate || data.transmittalDate
  const pb = pickBirthRegisterPageBook(data)
  const page = data.lcrPage || pb.page
  const book = data.lcrBook || pb.book

  return (
    <div className="wrongly-wr-forward font-sans text-gray-900 text-[1.08em] leading-relaxed mx-[0.5in]">
      <MunicipalMcrHeader province={province} municipality={municipality} />
      <div className="border-t-[3px] border-amber-500 mb-0.5" aria-hidden />
      <hr className="border-t-2 border-black m-0 mb-4" />

      <p className="mt-2 mb-0">{displayDate(iso)}</p>

      <div className="mt-8 space-y-0">
        <p className="m-0 font-bold uppercase">{data.forwardingRecipientName || ''}</p>
        <p className="m-0">{data.forwardingRecipientTitle || ''}</p>
        <p className="m-0">{data.forwardingRecipientOffice1 || ''}</p>
        <p className="m-0">{data.forwardingRecipientOffice2 || ''}</p>
      </div>

      <p className="mt-10 mb-0">{(data.forwardingSalutation || 'Dear Sir:').trim()}</p>
      <p className="mt-4 mb-0">{(data.forwardingGreeting || 'Greetings!').trim()}</p>

      <p className="mt-6 text-justify">
        Respectfully forwarded the herein transfer of Birth Record of{' '}
        <span className="font-bold uppercase">{data.lcrChildName || '________________'}</span> born{' '}
        <span className="font-bold uppercase">{data.lcrBirthDate || '________________'}</span> at{' '}
        <span className="font-bold uppercase">{data.lcrPlaceBirth || '________________'}</span> which wrongly registered in our office under Page{' '}
        <span className="font-bold uppercase underline">{page || '____'}</span> and Book{' '}
        <span className="font-bold uppercase underline">{book || '____'}</span>.
      </p>

      <p className="mt-8">Please acknowledge receipt hereof.</p>

      <p className="mt-10 mb-0">{(data.forwardingClosing || 'Very Truly Yours,').trim()}</p>

      <div className="mt-14">
        <p className="m-0 font-bold uppercase">{data.forwardingSignerName || '________________________'}</p>
        <p className="m-0">{data.forwardingSignerTitle || 'Municipal Civil Registrar'}</p>
      </div>
    </div>
  )
}

