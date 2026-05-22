import React from 'react'
import '../../legalInstrument/print/supplementalAffidavitPrintLayout.css'
import { DocumentFooter } from '../../../components/print'
import { formatDateCert, tryIsoFromDmyStrings } from '../../../lib/printUtils'
import {
  buildSupplementalAffidavitItemDefault,
  resolveSupplementalAffidavitType,
  supplementalCustomItemValue,
} from '../../legalInstrument/lib/supplementalAffidavitType'
import { RECEIVED_BY_OPTIONS } from '../../legalInstrument/lib/supplementalTransmittalDefaults'

/** Affidavit footer always uses City Civil Registrar (first preset), not the transmittal “Prepared / signed by” choice. */
const SUPPLEMENTAL_AFFIDAVIT_CCR_LINES = RECEIVED_BY_OPTIONS[0]

function SupplementalGeographicalItemBlock({ provinceValue, onProvinceBlur }) {
  return (
    <div className="my-1.5 leading-tight supplemental-geographical-item-block">
      <div className="font-bold">GEOGRAPHICAL LOCATION:</div>
      <div>
        <span className="font-bold">PROVINCE:</span>{' '}
        <span
          className="inline-block min-w-[14ch] outline-none print:outline-none underline decoration-black font-bold uppercase"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onProvinceBlur?.((e.currentTarget.textContent || '').trim().toUpperCase())}
        >
          {provinceValue}
        </span>
      </div>
    </div>
  )
}

export default function SupplementalReportAffidavit({
  data,
  showCcrSignatory = true,
  onItem3CustomChange,
  onItem5CustomChange,
  paperWidth = '210mm',
  paperHeight = '297mm',
}) {
  const republicLine = 'Republic of the Philippines'
  const cityOfLabel = 'City of'
  const regNo = (data.regNo || '2380-67').trim()
  const cityLine = (data.cityLine || '').replace(/GENERAL\s+SANTOS\s+CITY/gi, '').trim()
  const cityUpper = (cityLine || '').toUpperCase()
  const iliganIdx = cityUpper.indexOf('ILIGAN')
  const possessiveRaw = String(data.possessive || 'my').trim().toLowerCase()
  const possessive = (possessiveRaw === 'his' || possessiveRaw === 'her' || possessiveRaw === 'my') ? possessiveRaw : 'my'
  const civilStatusRaw = String(data.civilStatus || 'single').trim().toLowerCase()
  const civilStatus =
    civilStatusRaw === 'married' || civilStatusRaw === 'single' || civilStatusRaw === 'widower' || civilStatusRaw === 'widow' || civilStatusRaw === 'divorced'
      ? civilStatusRaw
      : 'single'
  const affiantName = (data.affiantName || '').trim()
  const residenceAddress = (data.residenceAddress || '').trim()
  const registeredAt = (data.registeredAt || '').trim()
  const regMonthRaw = String(data.regMonth || '').trim()
  const regDayRaw = String(data.regDay || '').trim()
  const regYearRaw = String(data.regYear || '').trim()
  const registeredOn = (data.registeredOn || '').trim()
  const colbSubject = String(data.colbSubject || 'self').toLowerCase() === 'other' ? 'other' : 'self'
  const isSelf = colbSubject === 'self'
  const subjectColbName = (data.subjectColbName || '').trim()
  const missingGeo = (data.missingGeo || '').trim()
  const correctedGeo = (data.correctedGeo || '').trim()
  const item3Custom = (data.item3Custom || '').trim()
  const item5Custom = (data.item5Custom || '').trim()
  const supplementTypeInfo = resolveSupplementalAffidavitType(data.supplementType || 'geographical')
  const supplementType = supplementTypeInfo.kind
  const ccrSignatory = SUPPLEMENTAL_AFFIDAVIT_CCR_LINES

  /**
   * COLB border-bottom blanks: empty = wide centered box + min-height for writing;
   * filled = inline + tight line-height so the rule sits under the text (no float) and punctuation stays flush.
   */
  const fillFieldClass = (hasValue, emptyMinW, uppercase = false) => {
    const up = uppercase ? 'uppercase' : ''
    if (hasValue) {
      return `inline border-b border-black font-semibold align-baseline px-0.5 leading-none ${up}`.trim()
    }
    return `inline-block border-b border-black text-center font-semibold align-baseline px-1 min-h-[1.1rem] ${emptyMinW} ${up}`.trim()
  }
  /** Item 1 filled values: bold, underline, uppercase (sample forms). */
  const colbEmph = (value, emptyMinW = 'min-w-[12ch]') => {
    const t = (value || '').trim().toUpperCase()
    if (!t) {
      return <span className={`inline-block border-b border-black align-baseline min-h-[1.15em] ${emptyMinW}`} />
    }
    return <span className="font-bold underline uppercase align-baseline decoration-black leading-none">{t}</span>
  }
  const fieldBundle = {
    missingGeo,
    correctedGeo,
    displayLabel: supplementTypeInfo.displayLabel,
  }
  const defaultItem3Text = buildSupplementalAffidavitItemDefault(supplementType, 'missing', fieldBundle)
  const defaultItem5Text = buildSupplementalAffidavitItemDefault(supplementType, 'corrected', fieldBundle)
  /** Item 3: blank form field → empty output; print/PDF field stays editable via item3Custom. */
  const item3FromForm =
    missingGeo || supplementType === 'geographical' || supplementType === 'middleName'
      ? defaultItem3Text
      : ''
  const item3Text = item3Custom || item3FromForm
  const item5Text = item5Custom || defaultItem5Text
  const item3CustomValue = supplementalCustomItemValue(item3Text, supplementTypeInfo)
  const item5CustomValue = supplementalCustomItemValue(item5Text, supplementTypeInfo)
  const item3GeoValue = item3Text.replace(/^GEOGRAPHICAL LOCATION:\s*PROVINCE:\s*/i, '').replace(/^PROVINCE:\s*/i, '')
  const item5GeoValue = item5Text.replace(/^GEOGRAPHICAL LOCATION:\s*PROVINCE:\s*/i, '').replace(/^PROVINCE:\s*/i, '')
  const item3MiddleNameValue = item3Text.replace(/^CHILD'?S MIDDLE NAME:\s*/i, '')
  const item5MiddleNameValue = item5Text.replace(/^CHILD'?S MIDDLE NAME:\s*/i, '')
  const item3SexValue = item3Text.replace(/^CHILD'?S SEX:\s*/i, '')
  const item5SexValue = item5Text.replace(/^CHILD'?S SEX:\s*/i, '')
  const isoRegistered = tryIsoFromDmyStrings(regDayRaw, regMonthRaw, regYearRaw)
  const formattedRegisteredOn =
    (isoRegistered && formatDateCert(isoRegistered)) ||
    formatDateCert(registeredOn) ||
    registeredOn

  return (
    <div
      lang="en"
      className="ausf-doc print-doc supplemental-report-doc supplemental-affidavit-print-layout bg-white text-black mx-auto px-[0.3in] py-5 print:mx-0 print:px-0 print:py-0 print:w-full box-border leading-relaxed flex flex-col"
      style={{
        fontFamily: 'Arial, sans-serif',
        width: paperWidth,
        minHeight: paperHeight,
        boxSizing: 'border-box',
      }}
    >
      <header className="supplemental-affidavit-header-zone print-doc-header supplemental-report-top-header mb-4 print:mb-0">
        <div className="grid grid-cols-[100px_1fr_100px] items-center gap-3">
          <img
            src="/iligan%20official%20seal.jpg"
            alt="City of Iligan Official Seal"
            className="w-[100px] h-[100px] object-contain mx-auto"
          />
          <div className="supplemental-header-main text-center leading-none">
            <p className="text-[20px] font-semibold leading-none m-0">Republic of the Philippines</p>
            <p className="text-[20px] font-bold uppercase leading-none m-0">City Civil Registrar&apos;s Office</p>
            <p className="text-[20px] font-bold leading-none m-0">City of Iligan</p>
            <p className="supplemental-header-address text-[16px] leading-none m-0">
              Ground Flr., Pedro Generalao Bldg., Buhanginan Hill, Pala-o, Iligan City
            </p>
          </div>
          <img
            src="/logo-shortcut.png"
            alt="City Civil Registrar's Office Logo"
            className="w-[100px] h-[100px] object-contain mx-auto"
          />
        </div>
        <div className="border-b border-black mt-3" />
        <div className="flex justify-between items-start gap-4 text-[16px] mt-1 mb-0 leading-tight">
          <div className="supplemental-header-jurisdiction text-left">
            <p className="m-0">{republicLine}</p>
            <p className="m-0">
              <span>{cityOfLabel}</span>{' '}
              {iliganIdx >= 0 ? (
                <span className="uppercase font-bold">
                  {cityUpper.slice(0, iliganIdx)}
                  <span>ILIGAN</span>
                  {cityUpper.slice(iliganIdx + 'ILIGAN'.length) || ' '}
                </span>
              ) : (
                <span className="uppercase font-bold">{cityLine || ' '}</span>
              )}
            </p>
          </div>
          <p className="font-bold text-right shrink-0 m-0">REG. NO. {regNo || ' '}</p>
        </div>
      </header>

      <div className="supplemental-affidavit-body-zone print-doc-body flex-1 flex flex-col min-h-0 w-full supplemental-affidavit-body">
        <h2 className="text-center font-bold text-[16px] uppercase mb-4 leading-tight">
          AFFIDAVIT FOR SUPPLEMENTAL REPORT
          <span className="block normal-case font-normal">(for COLB)</span>
        </h2>

        <div className="supplemental-report-content text-justify text-[15px] leading-[1.5] space-y-2.5">
          <p className="text-justify">
            I,{' '}
            <span className={fillFieldClass(!!affiantName.trim(), 'min-w-[22ch]', true)}>{affiantName || ' '}</span>, of legal age,{' '}
            <span className="underline decoration-black font-bold uppercase leading-none">{civilStatus}</span>, with residence and postal address at{' '}
            <span className={fillFieldClass(!!residenceAddress.trim(), 'min-w-[28ch]', true)}>{residenceAddress || ' '}</span>,
            after having been duly sworn in accordance with law, hereby depose and say THAT:
          </p>
          <ol className="supplemental-numbered-items list-decimal ml-8 print:ml-0 space-y-3 text-justify">
            <li className="text-justify">
              {supplementType === 'geographical' ? (
                <>
                  I am the applicant for the processing of the Supplemental Report of my Certificate of LIVE BIRTH
                  registered in{' '}
                  <span className={fillFieldClass(!!registeredAt.trim(), 'min-w-[14ch]', true)}>{registeredAt || ' '}</span> on{' '}
                  <span className={fillFieldClass(!!String(formattedRegisteredOn).trim(), 'min-w-[16ch]', false)}>
                    {formattedRegisteredOn || ' '}
                  </span>
                  .
                </>
              ) : supplementType === 'middleName' ? (
                <>
                  I am the applicant for the processing of the Supplemental Report of my Certificate of LIVE BIRTH
                  {' '}registered in <span className={fillFieldClass(!!registeredAt.trim(), 'min-w-[14ch]', true)}>{registeredAt || ' '}</span> on{' '}
                  <span className={fillFieldClass(!!String(formattedRegisteredOn).trim(), 'min-w-[16ch]', false)}>
                    {formattedRegisteredOn || ' '}
                  </span>
                  .
                </>
              ) : (
                <>
                  <span className="block">I am the applicant for the processing of the Supplemental Report of:</span>
                  {isSelf ? (
                    <span className="block mt-2">
                      my Certificate of Live Birth registered in{' '}
                      {colbEmph(registeredAt, 'min-w-[14ch]')}
                      {' '}on{' '}
                      {colbEmph(formattedRegisteredOn, 'min-w-[16ch]')};
                    </span>
                  ) : (
                    <span className="block mt-2">
                      the Certificate of Live Birth of{' '}
                      {colbEmph(subjectColbName, 'min-w-[22ch]')}, registered in{' '}
                      {colbEmph(registeredAt, 'min-w-[14ch]')}
                      {' '}on{' '}
                      {colbEmph(formattedRegisteredOn, 'min-w-[16ch]')}.
                    </span>
                  )}
                </>
              )}
            </li>
            <li className="text-justify">
              The original copy of{' '}
              <span className={possessive === 'my' ? 'font-bold' : undefined}>my</span>/
              <span className={possessive === 'his' ? 'font-bold' : undefined}>his</span>/
              <span className={possessive === 'her' ? 'font-bold' : undefined}>her</span> Certificate of Live Birth was forwarded to Philippine Statistics Authority (PSA);
            </li>
            <li className="text-justify">
              When a copy of{' '}
              <span className={possessive === 'my' ? 'font-bold' : undefined}>my</span>/
              <span className={possessive === 'his' ? 'font-bold' : undefined}>his</span>/
              <span className={possessive === 'her' ? 'font-bold' : undefined}>her</span> Certificate of Live Birth was secured from PSA/Local Civil Registry Office of{' '}
              <span className="font-bold underline decoration-black">ILIGAN CITY</span> it was discovered that there is no entry under the following items:
              {supplementType === 'geographical' ? (
                <SupplementalGeographicalItemBlock
                  provinceValue={item3GeoValue}
                  onProvinceBlur={onItem3CustomChange}
                />
              ) : supplementType === 'middleName' ? (
                <>
                  <br />
                  <span className="font-bold uppercase supplemental-child-middle-name-label">CHILD&apos;S MIDDLE NAME:</span>{' '}
                  <span
                    className="inline-block min-w-[14ch] outline-none print:outline-none underline decoration-black"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onItem3CustomChange?.((e.currentTarget.textContent || '').trim())}
                  >
                    {item3MiddleNameValue}
                  </span>
                </>
              ) : supplementType === 'sex' ? (
                <div className="my-1.5">
                  <span className="font-bold uppercase">Child&apos;s Sex:</span>{' '}
                  <span
                    className="inline-block min-w-[14ch] outline-none print:outline-none uppercase underline decoration-black font-bold"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onItem3CustomChange?.((e.currentTarget.textContent || '').trim().toUpperCase())}
                  >
                    {item3SexValue}
                  </span>
                </div>
              ) : supplementType === 'custom' ? (
                <>
                  <br />
                  <span className="font-bold uppercase">{supplementTypeInfo.displayLabel}:</span>{' '}
                  <span
                    className="inline min-w-[14ch] outline-none print:outline-none underline decoration-black font-bold uppercase"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onItem3CustomChange?.((e.currentTarget.textContent || '').trim())}
                  >
                    {item3CustomValue}
                  </span>
                </>
              ) : null}
            </li>
            <li className="text-justify">
              There was a failure to supply the said {supplementType === 'geographical' ? 'item/s' : 'items'} due to inadvertence or excusable negligence.
            </li>
            <li className="text-justify">
              The entries to be indicated therein should be the following:
              {supplementType === 'geographical' ? (
                <SupplementalGeographicalItemBlock
                  provinceValue={item5GeoValue}
                  onProvinceBlur={onItem5CustomChange}
                />
              ) : supplementType === 'middleName' ? (
                <>
                  <br />
                  <span className="font-bold uppercase supplemental-child-middle-name-label">CHILD&apos;S MIDDLE NAME:</span>{' '}
                  <span
                    className="inline-block min-w-[14ch] outline-none print:outline-none underline decoration-black"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onItem5CustomChange?.((e.currentTarget.textContent || '').trim())}
                  >
                    {item5MiddleNameValue}
                  </span>
                </>
              ) : supplementType === 'sex' ? (
                <div className="my-1.5">
                  <span className="font-bold uppercase">Child&apos;s Sex:</span>{' '}
                  <span
                    className="inline-block min-w-[14ch] outline-none print:outline-none uppercase underline decoration-black font-bold"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onItem5CustomChange?.((e.currentTarget.textContent || '').trim().toUpperCase())}
                  >
                    {item5SexValue}
                  </span>
                </div>
              ) : supplementType === 'custom' ? (
                <>
                  <br />
                  <span className="font-bold uppercase">{supplementTypeInfo.displayLabel}:</span>{' '}
                  <span
                    className="inline min-w-[14ch] outline-none print:outline-none underline decoration-black font-bold uppercase"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onItem5CustomChange?.((e.currentTarget.textContent || '').trim())}
                  >
                    {item5CustomValue}
                  </span>
                </>
              ) : null}
            </li>
            <li className="text-justify">
              I am requesting the concerned authorities to supply the omitted information in
              <br />
              <span className={possessive === 'my' ? 'font-bold' : undefined}>my</span>/
              <span className={possessive === 'his' ? 'font-bold' : undefined}>his</span>/
              <span className={possessive === 'her' ? 'font-bold' : undefined}>her</span> Certificate of Live Birth; and
            </li>
            <li className="text-justify">
              This Affidavit for Supplemental Report is voluntarily executed in order to attest to the truthfulness of the foregoing statements for all legal intents and purposes.
            </li>
          </ol>

          <p className="mt-1 text-justify leading-[1.35]">
            IN WITNESS WHEREOF, I am affixing my signature this <span className={fillFieldClass(false, 'min-w-[6ch]', false)} /> day of{' '}
            <span className={fillFieldClass(false, 'min-w-[10ch]', false)} /> in Iligan City, Philippines.
          </p>
        </div>

        <div className="text-center mt-1 mb-1">
          <p
            className={`border-b border-black font-semibold uppercase text-[18px] leading-none ${affiantName.trim() ? 'inline px-2' : 'inline-block px-10'
              }`}
          >
            {affiantName || ' '}
          </p>
          <p className="text-[15px] leading-none -mt-[3px]">Affiant</p>
        </div>

        <p className="text-justify text-[16px] leading-[1.3] mt-0 supplemental-affidavit-subscribed">
          SUBSCRIBED AND SWORN TO BEFORE ME, this <span className={fillFieldClass(false, 'min-w-[8ch]', false)} /> day of{' '}
          <span className={fillFieldClass(false, 'min-w-[10ch]', false)} />, Philippines. I certify that I personally examined the affiant and that he/she voluntarily
          executed the foregoing affidavit and understood the contents thereof.
        </p>
        {showCcrSignatory ? (
          <div className="supplemental-affidavit-registrar-signatory mt-14 print:mt-0 mb-1 shrink-0 w-full flex justify-end pr-2">
            <div className="inline-block text-center">
              <p className="font-bold uppercase text-[13px] leading-tight m-0 tracking-tight supplemental-affidavit-ccr-name">
                {ccrSignatory.name}
              </p>
              <p className="uppercase text-[12px] leading-tight m-0 font-normal supplemental-affidavit-ccr-title">
                {ccrSignatory.title}
              </p>
            </div>
          </div>
        ) : null}
      </div>
      <footer className="supplemental-affidavit-footer-zone print-doc-footer-wrap supplemental-bottom-wrap shrink-0 w-full mt-auto mb-[1em] print:mb-0">
        <DocumentFooter
          sloganBlue
          contactPhone="(063) 227 - 2806"
          contactEmail="civilregistrar.iligan@gmail.com"
          contentClassName="text-[14px] leading-snug"
        />
      </footer>
    </div>
  )
}
