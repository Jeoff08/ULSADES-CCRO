import React from 'react'
import { supplementalAffidavitRegisterSubtitle } from '../../legalInstrument/lib/supplementalAffidavitRegisterSubtitle'

export default function SupplementalReportAffidavit({
  data,
  onItem3CustomChange,
  onItem5CustomChange,
  paperWidth = '210mm',
  paperHeight = '297mm',
}) {
  const republicLine = 'Republic of the Philippines'
  const cityOfLabel = 'City of'
  const regNo = (data.regNo || '2380-67').trim()
  const cityLine = (data.cityLine || '').replace(/GENERAL\s+SANTOS\s+CITY/gi, '').trim()
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
  const supTypeRaw = String(data.supplementType || 'geographical').toLowerCase()
  const supplementType =
    supTypeRaw === 'sex' || supTypeRaw === 'middlename' || supTypeRaw === 'middle_name' ? (supTypeRaw === 'sex' ? 'sex' : 'middleName') : 'geographical'

  const fill = 'inline-block border-b border-black text-center font-semibold align-baseline px-1 min-h-[1.1rem]'
  /** Item 1 filled values: bold, underline, uppercase (sample forms). */
  const colbEmph = (value, emptyMinW = 'min-w-[12ch]') => {
    const t = (value || '').trim().toUpperCase()
    if (!t) {
      return <span className={`inline-block border-b border-black align-baseline min-h-[1.15em] ${emptyMinW}`} />
    }
    return <span className="font-bold underline uppercase align-baseline decoration-black">{t}</span>
  }
  const item1Box = (checked) => (
    <span
      className="inline-flex shrink-0 items-center justify-center w-[0.95em] h-[0.95em] border border-black align-baseline mt-[0.2em] text-[11px] leading-none"
      aria-hidden
    >
      {checked ? '⁄' : ''}
    </span>
  )
  const cityUpper = (cityLine || '').toUpperCase()
  const iliganIdx = cityUpper.indexOf('ILIGAN')
  const defaultItem3Text =
    supplementType === 'geographical'
      ? `${missingGeo || ''}`.trimEnd()
      : supplementType === 'sex'
        ? `${missingGeo || 'NOT STATED'}`.trimEnd()
        : `${missingGeo || ''}`.trimEnd()
  const defaultItem5Text =
    supplementType === 'geographical'
      ? `${correctedGeo || ''}`.trimEnd()
      : supplementType === 'sex'
        ? `${correctedGeo || ''}`.trimEnd()
        : `${correctedGeo || ''}`.trimEnd()
  const item3Text = item3Custom || defaultItem3Text
  const item5Text = item5Custom || defaultItem5Text
  const item3GeoValue = item3Text.replace(/^GEOGRAPHICAL LOCATION:\s*PROVINCE:\s*/i, '').replace(/^PROVINCE:\s*/i, '')
  const item5GeoValue = item5Text.replace(/^GEOGRAPHICAL LOCATION:\s*PROVINCE:\s*/i, '').replace(/^PROVINCE:\s*/i, '')
  const item3MiddleNameValue = item3Text.replace(/^CHILD'?S MIDDLE NAME:\s*/i, '')
  const item5MiddleNameValue = item5Text.replace(/^CHILD'?S MIDDLE NAME:\s*/i, '')
  const item3SexValue = item3Text.replace(/^CHILD'?S SEX:\s*/i, '')
  const item5SexValue = item5Text.replace(/^CHILD'?S SEX:\s*/i, '')
  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ]
  const regMonthNum = Number.parseInt(regMonthRaw, 10)
  const regDayNum = Number.parseInt(regDayRaw, 10)
  const regMonthText = regMonthNum >= 1 && regMonthNum <= 12 ? monthNames[regMonthNum - 1] : ''
  const regDayText = regDayNum >= 1 && regDayNum <= 31 ? String(regDayNum) : ''
  const regYearText = /^\d{4}$/.test(regYearRaw) ? regYearRaw : ''
  const formattedRegisteredOn = (regMonthText && regDayText && regYearText)
    ? `${regMonthText} ${regDayText}, ${regYearText}`
    : registeredOn
  const registerSubtitle = supplementalAffidavitRegisterSubtitle(data.lcrType)

  return (
    <div
      className="ausf-doc print-doc supplemental-report-doc bg-white text-black mx-auto px-7 py-5 leading-relaxed flex flex-col"
      style={{ fontFamily: 'Arial, sans-serif', width: paperWidth, minHeight: paperHeight }}
    >
      {supplementType === 'middleName' ? (
        <div className="supplemental-report-print-header mb-4">
          <div className="grid grid-cols-[110px_1fr_110px] items-center gap-3">
            <img
              src="/iligan%20official%20seal.jpg"
              alt="City of Iligan Official Seal"
              className="w-[125px] h-[125px] object-contain mx-auto"
            />
            <div className="supplemental-header-main text-center leading-none">
              <p className="text-[20px] font-semibold leading-none m-0">Republic of the Philippines</p>
              <p className="text-[20px] font-bold uppercase leading-none m-0">City Civil Registrar&apos;s Office</p>
              <p className="text-[20px] font-bold leading-none m-0">City of Iligan</p>
              <p className="supplemental-header-address text-[16px] leading-none m-0">Ground Flr., Pedro Generalao Bldg., Buhanginan</p>
              <p className="supplemental-header-address text-[16px] leading-none m-0">Hill, Pala-o, Iligan City</p>
            </div>
            <img
              src="/logo-shortcut.png"
              alt="City Civil Registrar's Office Logo"
              className="w-[125px] h-[125px] object-contain mx-auto"
            />
          </div>
          <div className="border-b border-black mt-3" />
        </div>
      ) : (
        <div className="supplemental-report-print-header flex justify-between items-start mb-4 text-[16px]">
          <div className="leading-tight">
            <p>{republicLine}</p>
            <p>
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
          <p className="font-semibold">REG. NO. {regNo || ' '}</p>
        </div>
      )}

      <h2 className="text-center font-bold text-[16px] uppercase mb-4 leading-tight">
        AFFIDAVIT FOR SUPPLEMENTAL REPORT
        <span className="block normal-case font-normal">{registerSubtitle}</span>
      </h2>

      <div className="supplemental-report-content text-justify text-[15px] leading-[1.5] space-y-2.5">
        <p className="text-justify">
          I, <span className={`${fill} uppercase ${affiantName ? '' : 'min-w-[22ch]'}`}>{affiantName || ' '}</span>, of legal age, <span className="underline decoration-black font-bold uppercase">{civilStatus}</span>,
          with residence and postal address at <span className={`${fill} uppercase ${residenceAddress ? '' : 'min-w-[28ch]'}`}>{residenceAddress || ' '}</span>,
          after having been duly sworn in accordance with law, hereby depose and say THAT:
        </p>
        <ol className="supplemental-numbered-items list-decimal ml-6 space-y-3 text-justify">
          <li className="text-justify">
            {supplementType === 'geographical' ? (
              <>
                I am the applicant for the processing of the Supplemental Report of my Certificate of LIVE BIRTH
                registered in{' '}
                <span className={`${fill} uppercase ${registeredAt ? '' : 'min-w-[14ch]'}`}>{registeredAt || ' '}</span> on{' '}
                <span className={`${fill} ${formattedRegisteredOn ? '' : 'min-w-[16ch]'}`}>{formattedRegisteredOn || ' '}</span>.
              </>
            ) : supplementType === 'middleName' ? (
              <>
                I am the applicant for the processing of the Supplemental Report of my Certificate of LIVE BIRTH
                {' '}registered in <span className={`${fill} uppercase ${registeredAt ? '' : 'min-w-[14ch]'}`}>{registeredAt || ' '}</span> on{' '}
                <span className={`${fill} ${formattedRegisteredOn ? '' : 'min-w-[16ch]'}`}>{formattedRegisteredOn || ' '}</span>.
              </>
            ) : (
              <>
                <span className="block">I am the applicant for the processing of the Supplemental Report of:</span>
                <div className="mt-2 space-y-2.5">
                  <div className="flex gap-2 items-start">
                    {item1Box(isSelf)}
                    <span>
                      my Certificate of Live Birth registered in{' '}
                      {colbEmph(isSelf ? registeredAt : '', 'min-w-[14ch]')}
                      {' '}on{' '}
                      {colbEmph(isSelf ? formattedRegisteredOn : '', 'min-w-[16ch]')};
                    </span>
                  </div>
                  <div className="flex gap-2 items-start">
                    {item1Box(!isSelf)}
                    <span>
                      the Certificate of Live Birth of{' '}
                      {colbEmph(!isSelf ? subjectColbName : '', 'min-w-[22ch]')}, registered in{' '}
                      {colbEmph(!isSelf ? registeredAt : '', 'min-w-[14ch]')}
                      {' '}on{' '}
                      {colbEmph(!isSelf ? formattedRegisteredOn : '', 'min-w-[16ch]')}.
                    </span>
                  </div>
                </div>
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
            {supplementType !== 'sex' && supplementType !== 'geographical' ? (
              <>
                <br />
                <br />
              </>
            ) : null}
            {supplementType === 'geographical' ? (
              <div className="my-1.5 leading-tight">
                <div className="font-bold">GEOGRAPHICAL LOCATION:</div>
                <div>
                  <span className="font-bold">PROVINCE:</span>{' '}
                  <span
                    className="inline-block min-w-[14ch] outline-none print:outline-none underline decoration-black font-bold uppercase"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onItem3CustomChange?.((e.currentTarget.textContent || '').trim().toUpperCase())}
                  >
                    {item3GeoValue}
                  </span>
                </div>
              </div>
            ) : supplementType === 'middleName' ? (
              <>
                <span className="font-bold uppercase">CHILD&apos;S MIDDLE NAME:</span>{' '}
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
            ) : (
              <div
                className="whitespace-pre-line outline-none print:outline-none underline decoration-black"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onItem3CustomChange?.(e.currentTarget.textContent || '')}
              >
                {item3Text}
              </div>
            )}
          </li>
          <li className="text-justify">
            There was a failure to supply the said {supplementType === 'geographical' ? 'item/s' : 'items'} due to inadvertence or excusable negligence.
          </li>
          <li className="text-justify">
            The entries to be indicated therein should be the following:
            {supplementType !== 'sex' && supplementType !== 'geographical' ? (
              <>
                <br />
                <br />
              </>
            ) : null}
            {supplementType === 'geographical' ? (
              <div className="my-1.5 leading-tight">
                <div className="font-bold">GEOGRAPHICAL LOCATION:</div>
                <div>
                  <span className="font-bold">PROVINCE:</span>{' '}
                  <span
                    className="inline-block min-w-[14ch] outline-none print:outline-none underline decoration-black font-bold uppercase"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onItem5CustomChange?.((e.currentTarget.textContent || '').trim().toUpperCase())}
                  >
                    {item5GeoValue}
                  </span>
                </div>
              </div>
            ) : supplementType === 'middleName' ? (
              <>
                <span className="font-bold uppercase">CHILD&apos;S MIDDLE NAME:</span>{' '}
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
            ) : (
              <div
                className="whitespace-pre-line outline-none print:outline-none underline decoration-black"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onItem5CustomChange?.(e.currentTarget.textContent || '')}
              >
                {item5Text}
              </div>
            )}
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
          IN WITNESS WHEREOF, I am affixing my signature this <span className={`${fill} min-w-[6ch]`} /> day of{' '}
          <span className={`${fill} min-w-[10ch]`} /> in Iligan City, Philippines.
        </p>
      </div>

      <div className="text-center mt-1 mb-1">
        <p className="inline-block border-b border-black px-10 font-semibold uppercase text-[18px] leading-none">{affiantName || ' '}</p>
        <p className="text-[15px] leading-none -mt-[3px]">Affiant</p>
      </div>

      <p className="text-justify text-[16px] leading-[1.3] mt-0">
        SUBSCRIBED AND SWORN TO BEFORE ME, this <span className={`${fill} min-w-[8ch]`} /> day of{' '}
        <span className={`${fill} min-w-[10ch]`} />, Philippines. I certify that I personally examined the affiant and that he/she voluntarily
        executed the foregoing affidavit and understood the contents thereof.
      </p>
    </div>
  )
}

