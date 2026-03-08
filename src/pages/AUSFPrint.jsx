import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAUSFDraft } from '../lib/ausfStorage'
import { defaultAUSF } from '../lib/ausfDefaults'
import { formatDateLong, formatDateCert, fullName, formatDateCOLB } from '../lib/printUtils'

const VIEW_PRINT_OPTIONS = [
  { label: 'AUSF only', type: 'ausf-only' },
  { label: 'AUSF 0-6', type: 'ausf-0-6' },
  { label: 'AUSF 07-17', type: 'ausf-07-17' },
  { label: 'Registration of AUSF', type: 'reg-ausf' },
  { label: 'Registration of Acknowledgement', type: 'reg-ack' },
  { label: 'LCR Form 1A (Birth-Available)', type: 'child-ack-lcr', labelLine1: 'LCR Form 1A (Birth-', labelLine2: 'Available)' },
  { label: 'Annotation (Child Ack)', type: 'child-ack-annotation' },
  { label: 'LCR Form A1', type: 'child-not-ack-lcr', buttonRoundedLeft: true },
  { label: 'Annotation (Child Not Ack)', type: 'child-not-ack-annotation' },
  { label: 'Transmittal', type: 'child-not-ack-transmittal' },
  { label: 'Out-of-Town Transmittal', type: 'out-of-town' },
]

const SEAL_LEFT_SRC = '/iligan official seal.jpg'
const LOGO_RIGHT_SRC = '/logo-shortcut.png'

function PrintHeaderRow({ rightContent }) {
  return (
    <div className="flex justify-between items-center gap-4 mb-2">
      <img src={SEAL_LEFT_SRC} alt="City of Iligan Official Seal" className="w-20 h-20 object-contain shrink-0" />
      <div className="text-center flex-1 min-w-0 px-2">
        <p className="font-bold text-base leading-tight">Republic of the Philippines</p>
        <p className="font-bold text-base uppercase leading-tight">City Civil Registrar&apos;s Office</p>
        <p className="font-bold text-sm leading-tight">City of Iligan</p>
        <p className="text-sm leading-tight">Ground Flr., Pedro Generalao Bldg., Buhanginan Hill, Pala-o, Iligan City</p>
      </div>
      {rightContent ?? <img src={LOGO_RIGHT_SRC} alt="Office of the City Civil Registrar" className="w-20 h-20 object-contain shrink-0" />}
    </div>
  )
}

function DocumentHeader({ registryNo }) {
  return (
    <header className="mb-4">
      <PrintHeaderRow />
      <hr className="border-black border-t my-2" />
      <div className="flex justify-between items-baseline gap-4 text-sm leading-tight">
        <div>
          <p>Republic of the Philippines)</p>
          <p>City of Iligan)S.S</p>
        </div>
        <div className="flex items-baseline gap-1 shrink-0">
          <span>Registry Number:</span>
          <span className="fill-blank inline-block text-center min-w-[3rem]">{registryNo || '—'}</span>
        </div>
      </div>
    </header>
  )
}

function DocumentFooter({ contactPhone, contactEmail }) {
  return (
    <div className="print-doc-footer mt-6">
      <hr className="border-black border-t mb-3" />
      <div className="flex justify-between items-start text-xs">
        <div>
          <p className="font-bold">CONTACT DETAILS:</p>
          <p>Telephone No.: {contactPhone || '(063) 224-5038'}</p>
          <p>Email: {contactEmail || 'civilregistrar.iligan@gmail.com'}</p>
        </div>
        <div className="text-right italic font-semibold text-[var(--primary-blue)]">
          <p>Births, Marriages and Deaths matter,</p>
          <p>Register them all!</p>
        </div>
      </div>
    </div>
  )
}

const FILL = 'fill-blank inline-block'
const FILL_BOLD = 'fill-blank inline-block font-bold'

function PrintDocAUSFOnly({ data, viewType }) {
  const affiantName = data.applicantName || fullName(data.childFirst, data.childMiddle, data.fatherLast) || fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const surnameSought = data.fatherLast
  const affiantWithSurname = (affiantName && surnameSought)
    ? (affiantName.trim().toUpperCase().endsWith((surnameSought || '').trim().toUpperCase())
      ? affiantName
      : `${affiantName.trim()} ${surnameSought.trim()}`.trim())
    : affiantName
  const displayAffiantName = viewType === 'ausf-only' ? affiantWithSurname : affiantName
  const dobFormatted = formatDateLong(data.dateOfBirth)
  const colbReg = data.colbRegistryNo
  const colbDate = formatDateLong(data.colbDateOfRegistration)
  const publicReg = data.publicDocRegistryNo
  const publicDate = formatDateLong(data.publicDocDate)
  const publicOffice = data.publicDocOffice
  const filingAt = data.filingLocation || 'ILIGAN CITY'
  const witnessDate = formatDateLong(data.affidavitExecutionDate) || formatDateLong(data.colbDateOfRegistration)
  const placeOfBirthName = data.placeOfBirthAddress || ''
  const placeCityProvince = [data.placeOfBirthCity, data.placeOfBirthProvince].filter(Boolean).join(', ')

  return (
    <div className="ausf-doc ausf-0-6-doc print-doc bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-4 leading-snug">
      <DocumentHeader registryNo={data.ausfRegistryNo} />
      <h2 className="text-center font-bold text-lg uppercase mb-4 mt-2">AFFIDAVIT TO USE THE SURNAME OF THE FATHER (AUSF)</h2>
      <p className="mb-4 leading-normal text-justify">
        I, <span className={`${FILL} affiant-name-blank affiant-name-bold-underline uppercase mx-0.5 align-baseline`}><span className="affiant-name-inner">{displayAffiantName}</span></span>, of legal age, single/married, Filipino, and a resident of Iligan City, Philippines, after having been duly sworn to in accordance with law, do hereby declare THAT:
      </p>

      <ol className="list-decimal list-outside ml-8 mr-0 pl-1 space-y-3 mb-3 text-justify leading-normal">
        <li className="text-justify">
          I am seeking to use the surname of <span className={`${FILL_BOLD} px-0.5 align-baseline uppercase`}>{surnameSought}</span> in the Certificate of Live Birth/Report of Birth of pursuant to R.A No. 9255
        </li>
        <li className="ausf-place-of-birth-line text-justify">
          I was born on <span className={`${FILL_BOLD} px-0.5 align-baseline`}>{dobFormatted}</span> at <span className={`${FILL_BOLD} px-0.5 align-baseline`}>{placeOfBirthName}</span> <span className={`${FILL_BOLD} px-0.5 align-baseline uppercase ml-0.5`}>{placeCityProvince}</span>
        </li>
        <li>
          My Birth was recorded under Registry Number <span className={`${FILL_BOLD} px-0.5 align-baseline`}>{colbReg}</span> on <span className={`${FILL_BOLD} px-0.5 align-baseline`}>{colbDate}</span>
        </li>
        <li className="text-justify">
          The Public Documents or the Private Handwritten Instrument was recorded under Registry Number <span className={`${FILL} empty-blank px-0.5 align-baseline`}>{publicReg || ' '}</span> on <span className={`${FILL} empty-blank px-0.5 align-baseline`}>{publicDate || ' '}</span> at the Local Civil Registry Office (LCRO)/Philippine Foreign Service Post (PFSP) of <span className={`${FILL} empty-blank px-0.5 align-baseline`}>{publicOffice || ' '}</span>
        </li>
        <li>
          I am filing this AUSF at LCRO/PFSP of <span className={`${FILL_BOLD} px-0.5 align-baseline uppercase`}>{filingAt}</span> in accordance with R.A No. 9255 and its Revised Implementing Rules and Regulations.
        </li>
        <li>
          I hereby certify that the statements made herein are true and correct to the best of my knowledge and belief.
        </li>
      </ol>

      <p className="mb-1 leading-normal mt-4 text-justify">IN WITNESS WHEREOF, I have hereunto set my hand this <span className={`${FILL_BOLD} ml-1 align-baseline`}>{witnessDate}</span> at Iligan City, Philippines.</p>
      <div className="text-center mt-6 mb-4">
        <p className="fill-blank font-bold uppercase inline-block pb-0.5 border-b border-black min-w-[16rem]">{displayAffiantName}</p>
        <p className="text-xs mt-1">Affiant</p>
      </div>
      <p className="ausf-subscribed-sworn mb-1 leading-normal text-justify">SUBSCRIBED AND SWORN to before me this <span className={`${FILL_BOLD} ml-1 align-baseline`}>{witnessDate}</span> in the City of Iligan. I certify that I personally examined the affiant and that he/she voluntarily executed the foregoing affidavit and understood the contents thereof.</p>
      <div className="registrar-signature-zone flex-1 flex min-h-[3rem] flex-col justify-center items-end">
        <div className="text-right city-registrar-signature">
          <p className="font-bold text-right">{data.cityCivilRegistrarName}</p>
          <p className="text-sm mt-1">City Civil Registrar</p>
        </div>
      </div>
      <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
    </div>
  )
}

function PrintDocRegAUSF({ data }) {
  const affiantName = data.applicantName || fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const childFullWithSurname = fullName(data.childFirst, data.childMiddle, data.fatherLast)
  const surnameSought = data.fatherLast
  const dobFormatted = formatDateLong(data.dateOfBirth)
  const colbReg = data.colbRegistryNo
  const colbDate = formatDateLong(data.colbDateOfRegistration)
  const publicReg = data.publicDocRegistryNo
  const publicDate = formatDateLong(data.publicDocDate)
  const publicOffice = data.publicDocOffice
  const filingAt = data.filingLocation || 'ILIGAN CITY'
  const witnessDate = formatDateLong(data.affidavitExecutionDate) || colbDate
  const placeCityProvince = [data.placeOfBirthCity, data.placeOfBirthProvince].filter(Boolean).join(', ')
  const attestationName = fullName(data.childFirst, data.childMiddle, data.childLast) || data.applicantName
  const attestationRelationship = (data.relationshipToChild === 'FATHER' || data.relationshipToChild === 'MOTHER')
    ? (data.sex === 'MALE' ? 'SON' : 'DAUGHTER')
    : (data.relationshipToChild || 'SON')
  const affiantFirstName = (affiantName || '').trim().split(/\s+/)[0] || affiantName || ''
  const attestationFirstName = (attestationName || '').trim().split(/\s+/)[0] || attestationName || ''

  return (
    <div className="ausf-doc print-doc ausf-07-17-doc bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-4 leading-normal">
      <DocumentHeader registryNo={data.ausfRegistryNo} />
      <h2 className="text-center font-bold text-lg uppercase mb-5 mt-4">AFFIDAVIT TO USE THE SURNAME OF THE FATHER (AUSF)</h2>
      <p className="mb-4 leading-normal text-justify">
        I, <span className={`${FILL} affiant-name-blank affiant-name-bold-underline uppercase mx-0.5`}><span className="affiant-name-inner">{affiantName}</span></span>, of legal age, single/married, Filipino, and a resident of Iligan City, Philippines, after having been duly sworn to in accordance with law, do hereby declare THAT:
      </p>
      <ol className="list-decimal list-inside space-y-3 mb-4 ml-6 text-justify">
        <li className="text-justify">I am seeking to use the surname of <span className="fill-blank inline-block font-bold px-1 min-w-[4rem] text-center uppercase">{surnameSought}</span> in the Certificate of Live Birth/Report of Birth of pursuant to R.A No. 9255.</li>
        <li className="ausf-place-of-birth-line text-justify">He/She was born on <span className={`${FILL} px-0.5 align-baseline`}>{dobFormatted}</span> at <span className={`${FILL} px-0.5 align-baseline`}>{data.placeOfBirthAddress}</span> <span className={`${FILL} px-0.5 align-baseline uppercase ml-0.5`}>{placeCityProvince}</span></li>
        <li className="text-justify">The Birth was recorded under Registry Number <span className="fill-blank inline-block px-1 min-w-[5rem] text-center">{colbReg}</span> on <span className="fill-blank inline-block px-1 min-w-[8rem] text-center">{colbDate}</span>.</li>
        <li className="text-justify">The Public Documents or the Private Handwritten Instrument was recorded under Registry Number <span className="fill-blank inline-block px-1 min-w-[5rem] text-center">{publicReg || ' '}</span> on <span className="fill-blank inline-block px-1 min-w-[8rem] text-center">{publicDate || ' '}</span> at the Local Civil Registry Office (LCRO)/Philippine Foreign Service Post (PFSP) of <span className="fill-blank inline-block px-1 min-w-[8rem] text-center">{publicOffice || ' '}</span>.</li>
        <li className="text-justify">I am filing this AUSF at LCRO/PFSP of <span className="fill-blank inline-block px-1 min-w-[8rem] text-center uppercase">{filingAt}</span> in accordance with R.A No. 9255 and its Revised Implementing Rules and Regulations.</li>
        <li className="text-justify">I hereby certify that the statements made herein are true and correct to the best of my knowledge and belief.</li>
      </ol>
      <p className="mb-1 text-justify">IN WITNESS WHEREOF, I have hereunto set my hand this <span className="fill-blank inline-block min-w-[8rem] text-center ml-1">{witnessDate}</span> at Iligan City, Philippines.</p>
      <div className="text-center mt-6 mb-6">
        <p className="fill-blank uppercase inline-block pb-0.5">{attestationName}</p>
        <p className="text-xs mt-1">Affiant</p>
      </div>

      <h2 className="text-center font-bold text-base uppercase my-6">SWORN ATTESTATION</h2>
      <p className="mb-3 text-justify">
        I, <span className="fill-blank inline-block min-w-[12rem] text-center mx-1">{affiantName}</span>, of legal age, single/married, Filipino, and a resident of Iligan City, Philippines, after having been duly sworn to in accordance with law, do hereby declare THAT:
      </p>
      <ol className="list-decimal list-inside space-y-2 mb-4 ml-6 text-justify">
        <li className="text-justify">That I am the <span className="fill-blank inline-block px-1 min-w-[3rem]">{attestationRelationship}</span> of the affiant in the above affidavit;</li>
        <li className="text-justify">That my above-named child/ward is fully aware of the consequences of the Affidavit to use the surname of his/her father.</li>
      </ol>
      <p className="mb-1 text-justify">IN WITNESS WHEREOF, I have hereunto set my hand this <span className="fill-blank inline-block min-w-[8rem] text-center ml-1">{witnessDate}</span> at Iligan City, Philippines.</p>
      <div className="text-center mt-6 mb-4">
        <p className="fill-blank uppercase inline-block pb-0.5">{affiantName}</p>
        <p className="text-xs mt-1">Affiant</p>
      </div>
      <p className="ausf-subscribed-sworn mb-1 text-justify leading-normal">SUBSCRIBED AND SWORN to before me this <span className="fill-blank inline-block min-w-[8rem] text-center ml-1">{witnessDate}</span> in the City of Iligan. I certify that I personally examined the affiant and that he/she voluntarily executed the foregoing affidavit and understood the contents thereof.</p>
      <div className="registrar-signature-zone flex-1 flex min-h-[3rem] flex-col justify-center items-end">
        <div className="text-right city-registrar-signature">
          <p className="font-bold">{data.cityCivilRegistrarName}</p>
          <p className="text-sm">City Civil Registrar</p>
        </div>
      </div>
      <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
    </div>
  )
}

function PrintDocLCRForm1A({ data }) {
  const childFull = fullName(data.childFirst, data.childMiddle, data.fatherLast) || fullName(data.childFirst, data.childMiddle, data.childLast)
  const motherFull = fullName(data.motherFirst, data.motherMiddle, data.motherLast)
  const fatherFull = fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const placeOfBirthLine1 = [data.placeOfBirthAddress, data.placeOfBirthCity].filter(Boolean).join(' ') || '—'
  const placeOfBirthLine2 = data.placeOfBirthProvince || ''
  const formDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const regOfficerName = data.certificateSignatoryName || 'LORELIE L. CANTO'
  const ccrName = data.cityCivilRegistrarName || ''

  return (
    <div className="ausf-doc print-doc bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-bold text-base">LCR Form No. 1A</p>
          <p className="text-sm">(Birth-Available)</p>
        </div>
        <p className="text-sm font-medium">{formDate}</p>
      </div>
      <p className="font-bold mb-2">TO WHOM IT MAY CONCERN:</p>
      <p className="mb-4">
        WE CERTIFY that, among others, the following facts of birth appear in our Register of Births on Page <span className="fill-blank inline-block px-1 min-w-[2rem] text-center font-bold">{data.colbPageNumber || '—'}</span> of Book number <span className="fill-blank inline-block px-1 min-w-[3rem] text-center font-bold">{data.colbBookNumber || '—'}</span>
      </p>
      <table className="w-full border-collapse text-sm mb-4 border border-black">
        <tbody>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top w-48">LCR Registry Number</td><td className="py-1.5 px-2 border border-black font-bold text-center">{data.colbRegistryNo || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Date of Registration</td><td className="py-1.5 px-2 border border-black font-bold text-center">{formatDateLong(data.colbDateOfRegistration) || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Name of Child</td><td className="py-1.5 px-2 border border-black font-bold text-center">{childFull || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Sex</td><td className="py-1.5 px-2 border border-black font-bold text-center">{data.sex || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Date of Birth</td><td className="py-1.5 px-2 border border-black font-bold text-center">{formatDateLong(data.dateOfBirth) || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Place of Birth</td><td className="py-1.5 px-2 border border-black font-bold text-center"><span>{placeOfBirthLine1}</span>{placeOfBirthLine2 && <><br /><span>{placeOfBirthLine2}</span></>}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Name of Mother</td><td className="py-1.5 px-2 border border-black font-bold text-center">{motherFull || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Citizenship of Mother</td><td className="py-1.5 px-2 border border-black font-bold text-center">{data.motherCitizenship || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Name of Father</td><td className="py-1.5 px-2 border border-black font-bold text-center">{fatherFull || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Citizenship of Father</td><td className="py-1.5 px-2 border border-black font-bold text-center">{data.fatherCitizenship || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Date of Marriage of Parents</td><td className="py-1.5 px-2 border border-black font-bold text-center">NOT APPLICABLE</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Place of Marriage of Parents</td><td className="py-1.5 px-2 border border-black font-bold text-center">NOT APPLICABLE</td></tr>
        </tbody>
      </table>
      <p className="mb-4 text-sm">This certification is issued upon the request of OCRG/OWNER/PARENTS/GUARDIAN for any legal purposes.</p>
      <div className="mb-4">
        <p className="font-bold text-sm mb-1">REMARKS:</p>
        <p className="text-sm">
          &quot;The child shall be known as pursuant to RA 9255.&quot; <span className="fill-blank inline-block px-1 min-w-[12rem] align-bottom font-bold">{childFull || '—'}</span>
        </p>
      </div>
      <p className="font-medium mb-2">Verified by:</p>
      <div className="mb-6">
        <span className="inline-block border-b border-black w-full min-h-[2rem] mb-4" aria-hidden />
        <div className="flex justify-between items-start gap-8">
          <div className="text-left">
            <p className="font-bold text-sm">{regOfficerName}</p>
            <p className="text-xs">Registration Officer IV</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm">{ccrName}</p>
            <p className="text-xs italic">City Civil Registrar</p>
          </div>
        </div>
      </div>
      <p className="font-bold text-sm mb-4">Note: This certification is not valid if it has mark, erasure or alteration of any entry.</p>
      <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
    </div>
  )
}

/** LCR Form A1 (Child Not Acknowledged) — full header with seals, REMARKS with Acknoweledged by / on / under Registry / child shall be known as */
function PrintDocLCRFormA1({ data }) {
  const childFull = fullName(data.childFirst, data.childMiddle, data.fatherLast) || fullName(data.childFirst, data.childMiddle, data.childLast)
  const motherFull = fullName(data.motherFirst, data.motherMiddle, data.motherLast)
  const fatherFull = fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const placeOfBirthLine1 = [data.placeOfBirthAddress, data.placeOfBirthCity].filter(Boolean).join(' ') || '—'
  const placeOfBirthLine2 = data.placeOfBirthProvince || ''
  const formDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const ackName = data.applicantName || fatherFull || '—'
  const regOfficerName = data.certificateSignatoryName || 'LORELIE L. CANTO'
  const ccrName = data.cityCivilRegistrarName || ''

  return (
    <div className="ausf-doc print-doc bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-4">
      <PrintHeaderRow
        rightContent={
          <div className="flex flex-col items-end shrink-0">
            <img src={LOGO_RIGHT_SRC} alt="Office of the City Civil Registrar" className="w-20 h-20 object-contain shrink-0" />
            <p className="text-sm font-medium mt-1">{formDate}</p>
          </div>
        }
      />
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-bold text-base">LCR Form No. 1A</p>
          <p className="text-sm">(Birth-Available)</p>
        </div>
      </div>
      <p className="font-bold mb-2">TO WHOM IT MAY CONCERN:</p>
      <p className="mb-4">
        WE CERTIFY that, among others, the following facts of birth appear in our Register of Births on Page <span className="fill-blank inline-block px-1 min-w-[2rem] text-center font-bold">{data.colbPageNumber || '—'}</span> of Book number <span className="fill-blank inline-block px-1 min-w-[3rem] text-center font-bold">{data.colbBookNumber || '—'}</span>
      </p>
      <table className="w-full border-collapse text-sm mb-4 border border-black">
        <tbody>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top w-48">LCR Registry Number</td><td className="py-1.5 px-2 border border-black font-bold text-center">{data.colbRegistryNo || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Date of Registration</td><td className="py-1.5 px-2 border border-black font-bold text-center">{formatDateLong(data.colbDateOfRegistration) || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Name of Child</td><td className="py-1.5 px-2 border border-black font-bold text-center">{childFull || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Sex</td><td className="py-1.5 px-2 border border-black font-bold text-center">{data.sex || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Date of Birth</td><td className="py-1.5 px-2 border border-black font-bold text-center">{formatDateLong(data.dateOfBirth) || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Place of Birth</td><td className="py-1.5 px-2 border border-black font-bold text-center"><span>{placeOfBirthLine1}</span>{placeOfBirthLine2 && <><br /><span>{placeOfBirthLine2}</span></>}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Name of Mother</td><td className="py-1.5 px-2 border border-black font-bold text-center">{motherFull || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Citizenship of Mother</td><td className="py-1.5 px-2 border border-black font-bold text-center">{data.motherCitizenship || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Name of Father</td><td className="py-1.5 px-2 border border-black font-bold text-center">{fatherFull || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Citizenship of Father</td><td className="py-1.5 px-2 border border-black font-bold text-center">{data.fatherCitizenship || '—'}</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Date of Marriage of Parents</td><td className="py-1.5 px-2 border border-black font-bold text-center">NOT APPLICABLE</td></tr>
          <tr><td className="py-1.5 px-2 border border-black font-medium align-top">Place of Marriage of Parents</td><td className="py-1.5 px-2 border border-black font-bold text-center">NOT APPLICABLE</td></tr>
        </tbody>
      </table>
      <p className="mb-4 text-sm text-center">This certification is issued upon the request of OCRG/OWNER/PARENTS/GUARDIAN for any legal purposes.</p>
      <div className="mb-4">
        <p className="font-bold text-sm mb-1">REMARKS:</p>
        <p className="text-sm">
          Acknoweledged by <span className="fill-blank inline-block px-1 min-w-[12rem] align-bottom font-bold">{ackName}</span>
          {' '}on <span className="fill-blank inline-block px-1 min-w-[8rem] align-bottom font-bold">{formatDateLong(data.ackDateOfRegistration) || '—'}</span>
          {' '}under Registry Number <span className="fill-blank inline-block px-1 min-w-[6rem] align-bottom font-bold">{data.ackRegistryNo || '—'}</span>. The child
          {' '}shall be known as <span className="fill-blank inline-block px-1 min-w-[12rem] align-bottom font-bold">{childFull || '—'}</span>
        </p>
      </div>
      <p className="font-medium mb-2">Verified by:</p>
      <div className="mb-6">
        <span className="inline-block border-b border-black w-full min-h-[2rem] mb-4" aria-hidden />
        <div className="flex justify-between items-start gap-8">
          <div className="text-left">
            <p className="font-bold text-sm">{regOfficerName}</p>
            <p className="text-xs">Registration Officer IV</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm">{ccrName}</p>
            <p className="text-xs italic">City Civil Registrar</p>
          </div>
        </div>
      </div>
      <p className="font-bold text-sm mb-4">Note: This certification is not valid if it has mark, erasure or alteration of any entry.</p>
      <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
    </div>
  )
}

function PrintDocCertRegistration({ data, isRegAck }) {
  const affiantName = data.applicantName || fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const regDate = formatDateLong(data.ausfDateOfRegistration)
  const registryNo = data.ausfRegistryNo
  const issuedDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const affidavitLabel = isRegAck ? 'Affidavit of Acknowledgement' : 'Affidavit to Use Surname of the Father'
  const signatoryName = data.certificateSignatoryName || 'LORELIE L. CANTO'
  const signatoryTitle = 'Registration Officer IV'

  return (
    <div className="ausf-doc print-doc print-doc-cert-registration bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-4">
      <PrintHeaderRow />
      <hr className="border-black my-3" />
      <div className="cert-reg-body mt-12">
        <h2 className="text-center font-bold text-base uppercase mb-6">CERTIFICATE OF REGISTRATION</h2>
        <p className="font-bold mb-2">TO WHOM IT MAY CONCERN:</p>
        <p className="mb-3 text-justify cert-reg-justify">
          THIS IS TO CERTIFY that the {affidavitLabel} executed by <span className="fill-blank inline-block px-1 min-w-[8rem]">{affiantName}</span> had been registered in this office on <span className="fill-blank inline-block px-1 min-w-[8rem]">{regDate}</span> under Registry Number <span className="fill-blank inline-block px-1 min-w-[5rem]">{registryNo}</span>.
        </p>
        <p className="mb-3 text-justify cert-reg-justify">This certification is issued for whatever legal purposes it may serve.</p>
        <p className="mb-4 text-justify cert-reg-justify">Issued this <span className="fill-blank inline-block px-1 min-w-[8rem]">{issuedDate}</span> at Iligan City, Philippines.</p>
        <div className="mt-24">
          <p className="font-bold uppercase">{signatoryName}</p>
          <p className="text-sm text-gray-600">{signatoryTitle}</p>
        </div>
      </div>
      <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
    </div>
  )
}

const TRANSMITTAL_ATTACHMENTS_LOCAL = [
  'CERTIFICATE OF LIVE BIRTH OF CHILD',
  'AFFIDAVIT TO USE SURNAME OF THE FATHER',
  'CERTIFICATE OF LIVE BIRTH OF PARENTS',
  'AFFIDAVIT OF GUARDIANSHIP',
  'AFFIDAVIT OF ACKNOWLEDGEMENT',
  'SCHOOL RECORDS',
  'INSURANCE POLICY',
  'PICTURES',
]

const TRANSMITTAL_ATTACHMENTS_PSA = [
  'AFFIDAVIT TO USE SURNAME OF THE FATHER',
  'CERTIFICATE OF REGISTRATION OF AUSF',
  'UN-ANNOTATED BIRTH CERTIFICATE',
  'ANNOTATED BIRTH CERTIFICATE',
  'LCR FORM 1A',
  'AFFIDAVIT OF ACKNOWLEDGEMENT',
]

function PrintDocTransmittal({ data, isOutOfTown }) {
  const childFull = fullName(data.childFirst, data.childMiddle, data.fatherLast) || fullName(data.childFirst, data.childMiddle, data.childLast) || '—'
  const transmittalDate = formatDateCert(data.transmittalDate) || formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const recipientName = data.recipientName || ''
  const recipientTitle = data.recipientTitle || ''
  const recipientOffice = data.recipientOffice || ''
  const signatoryName = data.transmittalSignatoryName || data.cityCivilRegistrarName || 'ATTY. YUSSIF DON JUSTIN F. MARTIL'
  const signatoryTitle = isOutOfTown ? 'Registration Officer IV' : 'City Civil Registrar'
  const attachments = isOutOfTown ? TRANSMITTAL_ATTACHMENTS_PSA : TRANSMITTAL_ATTACHMENTS_LOCAL
  const displaySignatory = isOutOfTown ? (data.transmittalSignatoryName || data.certificateSignatoryName || 'LORELIE L. CANTO') : signatoryName

  return (
    <div className="ausf-doc print-doc bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-4">
      <PrintHeaderRow />
      <hr className="border-black my-2" />
      <p className="font-bold text-sm mb-4">{transmittalDate}</p>
      <div className="mb-4">
        <p className="fill-blank inline-block min-w-[14rem]">{recipientName || ' '}</p>
        <p className="fill-blank inline-block min-w-[14rem] mt-1">{recipientTitle || ' '}</p>
        <p className="fill-blank inline-block min-w-[14rem] mt-1">{recipientOffice || ' '}</p>
      </div>
      <p className="font-bold text-sm mb-1">SUBJECT:</p>
      <p className="font-bold text-sm mb-4">ENDORSEMENT OF AFFIDAVIT TO USE SURNAME OF FATHER IN FAVOR OF {childFull}</p>
      <p className="mb-2">Sir/Ma&apos;am:</p>
      <p className="mb-3">I am respectfully forwarding to your good office the attached documents in relation to the above-cited subject, to wit:</p>
      <ol className="list-decimal list-inside space-y-1 ml-2 mb-4">
        {attachments.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
      <p className="mb-4">For appropriate action.</p>
      <p className="mb-4">Respectfully yours,</p>
      <p className="font-bold">{displaySignatory}</p>
      <p className="text-sm">{signatoryTitle}</p>
      <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
    </div>
  )
}

function PrintDocCertLiveBirth({ data }) {
  const childFirst = data.childFirst || ''
  const childMiddle = data.childMiddle || ''
  const childLast = data.childLast || ''
  const motherFull = fullName(data.motherFirst, data.motherMiddle, data.motherLast)
  const fatherFull = fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast) || 'UNKNOWN'
  const dob = formatDateCOLB(data.dateOfBirth)
  const placeHospital = data.placeOfBirthAddress || ''
  const placeCity = data.placeOfBirthCity || 'ILIGAN CITY'
  const placeProvince = data.placeOfBirthProvince || 'LANAO DEL NORTE'
  const regNo = data.colbRegistryNoForm102 || data.colbRegistryNo || '—'
  const attDate = data.attendantDate ? formatDateLong(data.attendantDate) : ''
  const infDate = data.informantDate ? formatDateLong(data.informantDate) : ''
  const prepDate = data.preparedByDate ? formatDateLong(data.preparedByDate) : ''
  const recvDate = data.receivedByDate ? formatDateLong(data.receivedByDate) : ''
  const regDate = data.registeredByDate ? formatDateLong(data.registeredByDate) : ''

  return (
    <div className="ausf-doc print-doc bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-4">
      <div className="flex justify-between items-start mb-1">
        <p className="text-sm font-medium">Municipal Form No. 102 (Revised January 2007)</p>
        <p className="text-xs">(To be accomplished in quadruplicate using black ink)</p>
      </div>
      <div className="text-center mb-2">
        <p className="font-bold text-sm">Republic of the Philippines,</p>
        <p className="font-bold text-sm uppercase">Office of the Civil Registrar General</p>
      </div>
      <h2 className="text-center font-bold text-base uppercase mb-3">Certificate of Live Birth</h2>
      <div className="flex justify-between items-start mb-4">
        <div className="text-sm">
          <p><span className="font-medium">Province:</span> <span className="border-b border-black inline-block min-w-[8rem]">{placeProvince}</span></p>
          <p><span className="font-medium">City/Municipality:</span> <span className="border-b border-black inline-block min-w-[8rem]">{placeCity}</span></p>
        </div>
        <p className="text-sm"><span className="font-medium">Registry No.</span> <span className="border-b border-black inline-block min-w-[5rem] text-center">{regNo}</span></p>
      </div>

      <div className="border-2 border-green-700 rounded mb-4 p-3">
        <p className="font-bold text-sm uppercase mb-2">C H I L D</p>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">1. NAME:</span> (First) <span className="border-b border-black inline-block min-w-[6rem] mx-1">{childFirst}</span> (Middle) <span className="border-b border-black inline-block min-w-[6rem] mx-1">{childMiddle}</span> (Last) <span className="border-b border-black inline-block min-w-[8rem] mx-1">{childLast}</span></p>
          <p><span className="font-medium">2. SEX:</span> <span className="border-b border-black inline-block min-w-[4rem] mx-1">{data.sex || '—'}</span></p>
          <p><span className="font-medium">3. DATE OF BIRTH:</span> (Day) <span className="border-b border-black inline-block min-w-[2rem] text-center mx-1">{dob.day}</span> (Month) <span className="border-b border-black inline-block min-w-[4rem] mx-1">{dob.month}</span> (Year) <span className="border-b border-black inline-block min-w-[3rem] text-center mx-1">{dob.year}</span></p>
          <p><span className="font-medium">4. PLACE OF BIRTH:</span> (Name of Hospital/Clinic/Institution) <span className="border-b border-black inline-block min-w-[12rem] mx-1">{placeHospital}</span></p>
          <p className="pl-6">(House No., St., Barangay) <span className="border-b border-black inline-block min-w-[8rem] mx-1">{placeCity}</span></p>
          <p className="pl-6">(City/Municipality) <span className="border-b border-black inline-block min-w-[8rem] mx-1">{placeCity}</span> (Province) <span className="border-b border-black inline-block min-w-[8rem] mx-1">{placeProvince}</span></p>
          <p><span className="font-medium">5a. TYPE OF BIRTH:</span> <span className="border-b border-black inline-block min-w-[4rem] mx-1">{data.typeOfBirth || 'SINGLE'}</span> 5b. IF MULTIPLE BIRTH, CHILD WAS: <span className="border-b border-black inline-block min-w-[3rem] mx-1">N/A</span> 5c. BIRTH ORDER: <span className="border-b border-black inline-block min-w-[3rem] mx-1">{data.birthOrder || '—'}</span></p>
          <p><span className="font-medium">6. WEIGHT AT BIRTH:</span> <span className="border-b border-black inline-block min-w-[4rem] mx-1">{data.birthWeight || '—'}</span> grams</p>
        </div>
      </div>

      <div className="border-2 border-green-700 rounded mb-4 p-3">
        <p className="font-bold text-sm uppercase mb-2">M O T H E R</p>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">7. MAIDEN NAME:</span> (First) <span className="border-b border-black inline-block min-w-[5rem] mx-1">{data.motherFirst}</span> (Middle) <span className="border-b border-black inline-block min-w-[5rem] mx-1">{data.motherMiddle}</span> (Last) <span className="border-b border-black inline-block min-w-[6rem] mx-1">{data.motherLast}</span></p>
          <p><span className="font-medium">8. CITIZENSHIP:</span> <span className="border-b border-black inline-block min-w-[6rem] mx-1">{data.motherCitizenship || 'Filipino'}</span></p>
          <p><span className="font-medium">9. RELIGION/RELIGIOUS SECT:</span> <span className="border-b border-black inline-block min-w-[10rem] mx-1">{data.motherReligion || '—'}</span></p>
          <p><span className="font-medium">10a.</span> Total number of children born alive: <span className="border-b border-black inline-block min-w-[2rem] text-center mx-1">{data.motherTotalChildrenAlive || '—'}</span> <span className="font-medium">10b.</span> No. of children still living including this birth: <span className="border-b border-black inline-block min-w-[2rem] text-center mx-1">{data.motherChildrenLiving || '—'}</span> <span className="font-medium">10c.</span> No. of children born alive but are now dead: <span className="border-b border-black inline-block min-w-[2rem] text-center mx-1">{data.motherChildrenDead || '0'}</span></p>
          <p><span className="font-medium">11. OCCUPATION:</span> <span className="border-b border-black inline-block min-w-[10rem] mx-1">{data.motherOccupation || '—'}</span></p>
          <p><span className="font-medium">12. AGE</span> at the time of this birth (completed years): <span className="border-b border-black inline-block min-w-[3rem] text-center mx-1">{data.motherAge || '—'}</span></p>
          <p><span className="font-medium">13. RESIDENCE:</span> (House No., St., Barangay) <span className="border-b border-black inline-block min-w-[12rem] mx-1">{data.motherResidence || '—'}</span></p>
          <p className="pl-6">(City/Municipality) <span className="border-b border-black inline-block min-w-[8rem] mx-1">{placeCity}</span> (Province) <span className="border-b border-black inline-block min-w-[8rem] mx-1">{placeProvince}</span> (Country) PHILIPPINES</p>
        </div>
      </div>

      <div className="border-2 border-green-700 rounded mb-4 p-3">
        <p className="font-bold text-sm uppercase mb-2">F A T H E R</p>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">14. NAME:</span> (First) <span className="border-b border-black inline-block min-w-[5rem] mx-1">{data.fatherFirst || '—'}</span> (Middle) <span className="border-b border-black inline-block min-w-[5rem] mx-1">{data.fatherMiddle || '—'}</span> (Last) <span className="border-b border-black inline-block min-w-[6rem] mx-1">{data.fatherLast || 'UNKNOWN'}</span></p>
          <p><span className="font-medium">15. CITIZENSHIP:</span> <span className="border-b border-black inline-block min-w-[10rem] mx-1">{data.fatherCitizenship || 'NOT APPLICABLE'}</span></p>
          <p><span className="font-medium">16. RELIGION/RELIGIOUS SECT:</span> <span className="border-b border-black inline-block min-w-[10rem] mx-1">{data.fatherReligion || 'NOT APPLICABLE'}</span></p>
          <p><span className="font-medium">17. OCCUPATION:</span> <span className="border-b border-black inline-block min-w-[10rem] mx-1">{data.fatherOccupation || 'NOT APPLICABLE'}</span></p>
          <p><span className="font-medium">18. AGE</span> at the time of this birth (completed years): <span className="border-b border-black inline-block min-w-[3rem] mx-1">{data.fatherAge || 'N/A'}</span></p>
          <p><span className="font-medium">19. RESIDENCE:</span> <span className="border-b border-black inline-block min-w-[20rem] mx-1">{data.fatherResidence || 'NOT APPLICABLE'}</span></p>
        </div>
      </div>

      <div className="border-2 border-green-700 rounded mb-4 p-3">
        <p className="text-xs mb-1">(If not married, accomplish Affidavit of Acknowledgement/Admission of Paternity at the back)</p>
        <p><span className="font-medium">20a. DATE:</span> <span className="border-b border-black inline-block min-w-[8rem] mx-1">NOT APPLICABLE</span> <span className="font-medium">20b. PLACE:</span> <span className="border-b border-black inline-block min-w-[10rem] mx-1">NOT APPLICABLE</span></p>
      </div>

      <div className="border-2 border-green-700 rounded mb-4 p-3">
        <p className="font-bold text-sm mb-2">21. ATTENDANT</p>
        <p className="text-xs mb-1">21a. ATTENDANT: ( ) 1 Physician ( ) 2 Nurse ( ) 3 Midwife ( ) 4 Hilot ( ) 5 Others</p>
        <p className="text-xs mb-2">21b. CERTIFICATION OF ATTENDANT AT BIRTH: &quot;I hereby certify that I attended the birth of the child who was born alive at _____ am/pm on the date of birth specified above.&quot;</p>
        <p>Signature: <span className="border-b border-black inline-block min-w-[12rem] mx-1" /> Name in Print: <span className="border-b border-black inline-block min-w-[14rem] mx-1">{data.attendantName || '—'}</span></p>
        <p>Address: <span className="border-b border-black inline-block min-w-[20rem] mx-1">{data.attendantAddress || '—'}</span></p>
        <p>Title or Position: <span className="border-b border-black inline-block min-w-[12rem] mx-1">{data.attendantTitle || '—'}</span> Date: <span className="border-b border-black inline-block min-w-[8rem] mx-1">{attDate}</span></p>
      </div>

      <div className="border-2 border-green-700 rounded mb-4 p-3">
        <p className="font-bold text-sm mb-2">22. CERTIFICATION OF INFORMANT</p>
        <p className="text-xs mb-2">&quot;I hereby certify that all information supplied are true and correct to my own knowledge and belief.&quot;</p>
        <p>Signature: <span className="border-b border-black inline-block min-w-[12rem] mx-1" /> Name in Print: <span className="border-b border-black inline-block min-w-[12rem] mx-1">{data.informantName || data.motherFirst || '—'}</span></p>
        <p>Relationship to the Child: <span className="border-b border-black inline-block min-w-[8rem] mx-1">{data.informantRelationship || 'MOTHER'}</span></p>
        <p>Address: <span className="border-b border-black inline-block min-w-[16rem] mx-1">{data.informantAddress || data.motherResidence || '—'}</span> Date: <span className="border-b border-black inline-block min-w-[8rem] mx-1">{infDate}</span></p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <div>
          <p className="font-medium mb-1">23. PREPARED BY</p>
          <p>Signature: <span className="border-b border-black inline-block min-w-[8rem]" /></p>
          <p>Name In Print: <span className="border-b border-black inline-block min-w-[10rem]">{data.preparedByName || '—'}</span></p>
          <p>Title or Position: <span className="border-b border-black inline-block min-w-[10rem]">{data.preparedByTitle || '—'}</span></p>
          <p>Date: <span className="border-b border-black inline-block min-w-[6rem]">{prepDate}</span></p>
        </div>
        <div>
          <p className="font-medium mb-1">24. RECEIVED BY</p>
          <p>Signature: <span className="border-b border-black inline-block min-w-[8rem]" /></p>
          <p>Name in Print: <span className="border-b border-black inline-block min-w-[10rem]">{data.receivedByName || '—'}</span></p>
          <p>Title or Position: <span className="border-b border-black inline-block min-w-[10rem]">{data.receivedByTitle || '—'}</span></p>
          <p>Date: <span className="border-b border-black inline-block min-w-[6rem]">{recvDate}</span></p>
        </div>
        <div>
          <p className="font-medium mb-1">25. REGISTERED BY THE CIVIL REGISTRAR</p>
          <p>Signature: <span className="border-b border-black inline-block min-w-[8rem]" /></p>
          <p>Name in Print: <span className="border-b border-black inline-block min-w-[10rem]">{data.registeredByName || '—'}</span></p>
          <p>Title or Position: <span className="border-b border-black inline-block min-w-[10rem]">{data.registeredByTitle || 'CITY CIVIL REGISTRAR, ILIGAN CITY'}</span></p>
          <p>Date: <span className="border-b border-black inline-block min-w-[6rem]">{regDate}</span></p>
        </div>
      </div>

      <div className="mb-4">
        <p className="font-medium text-sm">REMARKS/ANNOTATIONS (For LCRO/OCRG Use Only)</p>
        <p className="border-b border-black min-h-[2rem]" />
      </div>
      <p className="text-xs font-medium mb-2">TO BE FILLED-UP AT THE OFFICE OF THE CIVIL REGISTRAR</p>
      <div className="flex gap-1 flex-wrap" aria-hidden>
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} className="inline-block w-6 h-6 border border-gray-400 text-center text-[10px]" />
        ))}
      </div>
      <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
    </div>
  )
}

function LegacyPrintSummary({ data }) {
  const formatDate = (str) => {
    if (!str) return ''
    const d = new Date(str)
    if (isNaN(d.getTime())) return str
    const day = String(d.getDate()).padStart(2, '0')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const year = String(d.getFullYear()).slice(-2)
    return `${day}-${months[d.getMonth()]}-${year}`
  }
  const showItems4to7 = data.childAlreadyAcknowledged === 'NO'
  return (
    <div className="max-w-4xl mx-auto bg-white border border-gray-300 rounded-lg shadow-sm p-6 print:shadow-none print:border-0">
      <div className="bg-[var(--primary-blue)] text-white text-center py-3 px-4 rounded-t-lg mb-4">
        <h1 className="font-bold text-base">RA 9255 AUTOMATED DATA ENTRY FORM</h1>
        <p className="text-sm text-white/80 mt-0.5">Unified Legal Status Automated Data Entry System — Iligan City Civil Registrar Office</p>
      </div>
      <div className="mb-4 pb-2 border-b border-gray-200"><strong>Form type:</strong> {data.formType}</div>
      <div className="mb-4"><strong>NAME</strong>: {data.applicantName || '—'}</div>
      <div className="mb-4"><strong>RELATIONSHIP TO THE CHILD</strong>: {data.relationshipToChild || '—'}</div>
      {showItems4to7 && (
        <>
          <div className="mb-2 font-medium text-gray-700">DETAILS OF THE CHILD</div>
          <div className="text-sm space-y-1 mb-4">
            <p>Child: {fullName(data.childFirst, data.childMiddle, data.childLast)}</p>
            <p>DOB: {formatDate(data.dateOfBirth)}</p>
            <p>Place: {[data.placeOfBirthAddress, data.placeOfBirthCity, data.placeOfBirthProvince].filter(Boolean).join(', ')}</p>
          </div>
        </>
      )}
      <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-200">created by: ATTY. YUSSIF DON JUSTINE F. MARTIL</p>
    </div>
  )
}

const PAPER_SIZES = [
  { id: 'a4', label: 'A4 (210 × 297 mm)', size: '210mm 297mm', widthMm: 210, heightMm: 297 },
  { id: 'short', label: 'Short bond (8.5" × 11")', size: '8.5in 11in', widthMm: 215.9, heightMm: 279.4 },
  { id: 'long', label: 'Long (8.5" × 13")', size: '8.5in 13in', widthMm: 215.9, heightMm: 330.2 },
]

const PRINT_SIZE_STYLE_ID = 'print-paper-size'

function usePrintPageSize(paperId) {
  useEffect(() => {
    const spec = PAPER_SIZES.find((p) => p.id === paperId) || PAPER_SIZES[0]
    document.documentElement.dataset.paperSize = paperId
    let el = document.getElementById(PRINT_SIZE_STYLE_ID)
    if (!el) {
      el = document.createElement('style')
      el.id = PRINT_SIZE_STYLE_ID
      document.head.appendChild(el)
    }
    el.textContent = `@media print { @page { size: ${spec.size}; } }`
    return () => {
      delete document.documentElement.dataset.paperSize
    }
  }, [paperId])
}

export default function AUSFPrint() {
  const [data, setData] = useState(null)
  const [displayType, setDisplayType] = useState(null)
  const [paperSize, setPaperSize] = useState('a4')
  const navigate = useNavigate()

  usePrintPageSize(paperSize)

  useEffect(() => {
    const draft = getAUSFDraft()
    if (draft) {
      const loaded = { ...defaultAUSF, ...draft }
      setData(loaded)
      setDisplayType((prev) => prev ?? loaded.formType)
    } else {
      setData(null)
    }
  }, [])

  const defaultTitle = 'ULSADES - Unified Legal Status Automated Data Entry System | Iligan City Civil Registrar'
  useEffect(() => {
    document.title = 'AUSF'
    return () => { document.title = defaultTitle }
  }, [])

  const handlePrint = () => window.print()
  const handleBack = () => navigate('/ausf')

  if (data === null) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-600 mb-4">No form data found. Fill out the form first, then click Done to view and print.</p>
        <button type="button" onClick={() => navigate('/')} className="px-4 py-2 bg-[var(--primary-blue)] text-white rounded-lg">Go to Dashboard</button>
      </div>
    )
  }

  const type = displayType || data.formType
  const isAUSFOnly = type === 'ausf-only'
  const isAUSF06 = type === 'ausf-0-6'
  const isAUSF0717 = type === 'ausf-07-17'
  const isRegAUSF = type === 'reg-ausf'
  const isRegAck = type === 'reg-ack'
  const isChildAckLcr = type === 'child-ack-lcr'
  const isChildAckAnnotation = type === 'child-ack-annotation'
  const isChildNotAckLcr = type === 'child-not-ack-lcr'
  const isChildNotAckAnnotation = type === 'child-not-ack-annotation'
  const isChildNotAckTransmittal = type === 'child-not-ack-transmittal'
  const isOutOfTown = type === 'out-of-town'

  let content
  if (isAUSFOnly || isAUSF06) content = <PrintDocAUSFOnly data={data} viewType={type} />
  else if (isAUSF0717) content = <PrintDocRegAUSF data={data} />
  else if (isRegAUSF) content = <PrintDocCertRegistration data={data} isRegAck={false} />
  else if (isRegAck) content = <PrintDocCertRegistration data={data} isRegAck={true} />
  else if (isChildAckLcr || isChildAckAnnotation) content = <PrintDocLCRForm1A data={data} />
  else if (isChildNotAckLcr) content = <PrintDocLCRFormA1 data={data} />
  else if (isChildNotAckAnnotation) content = <PrintDocCertLiveBirth data={data} />
  else if (isChildNotAckTransmittal) content = <PrintDocTransmittal data={data} isOutOfTown={false} />
  else if (isOutOfTown) content = <PrintDocTransmittal data={data} isOutOfTown={true} />
  else content = <LegacyPrintSummary data={data} />

  return (
    <div className="p-4 print:p-0">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold text-gray-800">AUSF – Print</h1>
          <button type="button" onClick={handleBack} className="px-3 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50">
            Back to Form
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="paper-size-select">Paper size (for print)</label>
          <select
            id="paper-size-select"
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            {PAPER_SIZES.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <button type="button" onClick={handlePrint} className="px-3 py-2.5 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
            Print
          </button>
        </div>
      </div>
      <div className="flex gap-6">
        <aside className="no-print w-56 shrink-0 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">View &amp; Print</h2>
          <div className="flex flex-col gap-2">
            {VIEW_PRINT_OPTIONS.map((opt) => {
              const isSelected = type === opt.type
              const isLcrButton = opt.type === 'child-not-ack-lcr' || opt.type === 'child-ack-lcr'
              const btnClass = [
                'text-left px-3 py-2.5 text-sm font-medium transition text-white rounded-lg',
                isLcrButton ? 'bg-[#283750] hover:bg-[#1e2d42]' : 'bg-[var(--primary-blue)]/80 hover:bg-[var(--primary-blue)]',
                isSelected ? 'ring-2 ring-offset-1 ring-[var(--primary-blue)]' : '',
              ].filter(Boolean).join(' ')
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setDisplayType(opt.type)}
                  className={btnClass}
                >
                  {opt.labelLine1 != null ? (
                    <>
                      <span className="block leading-tight">{opt.labelLine1}</span>
                      <span className="block leading-tight">{opt.labelLine2}</span>
                    </>
                  ) : (
                    opt.label
                  )}
                </button>
              )
            })}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 flex flex-col gap-2">
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">To remove date, title, and URL from the printed page, uncheck &quot;Headers and footers&quot; in the print dialog.</p>
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          {content}
        </div>
      </div>
    </div>
  )
}
