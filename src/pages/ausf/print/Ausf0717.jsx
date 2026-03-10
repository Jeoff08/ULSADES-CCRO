import React from 'react'
import { formatDateLong, fullName } from '../../../lib/printUtils'
import { DocumentHeader, DocumentFooter, FILL } from '../../../components/print'

export default function Ausf0717({ data }) {
  const affiantName = data.applicantName || fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
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

  return (
    <div className="ausf-doc print-doc ausf-07-17-doc bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-2 leading-snug">
      <DocumentHeader registryNo={data.ausfRegistryNo} />
      <h2 className="text-center font-bold text-base uppercase mb-2 mt-1">AFFIDAVIT TO USE THE SURNAME OF THE FATHER (AUSF)</h2>
      <p className="mb-2 leading-snug text-justify">
        I, <span className={`${FILL} affiant-name-blank affiant-name-bold-underline uppercase mx-0.5`}><span className="affiant-name-inner">{affiantName}</span></span>, of legal age, single/married, Filipino, and a resident of Iligan City, Philippines, after having been duly sworn to in accordance with law, do hereby declare THAT:
      </p>

      <ol className="list-decimal list-inside space-y-1.5 mb-2 mt-2 ml-6 text-justify">
        <li className="text-justify">I am seeking to use the surname of <span className="fill-blank inline-block font-bold px-1 min-w-[4rem] text-center uppercase">{surnameSought}</span> in the Certificate of Live Birth/Report of Birth of pursuant to R.A No. 9255.</li>
        <li className="ausf-place-of-birth-line text-justify">He/She was born on <span className={`${FILL} px-0.5 align-baseline`}>{dobFormatted}</span> at <span className={`${FILL} px-0.5 align-baseline`}>{data.placeOfBirthAddress}</span> <span className={`${FILL} px-0.5 align-baseline uppercase ml-0.5`}>{placeCityProvince}</span></li>
        <li className="text-justify">The Birth was recorded under Registry Number <span className="fill-blank inline-block px-1 min-w-[5rem] text-center">{colbReg}</span> on <span className="fill-blank inline-block px-1 min-w-[8rem] text-center">{colbDate}</span>.</li>
        <li className="text-justify">The Public Documents or the Private Handwritten Instrument was recorded under Registry Number <span className="fill-blank inline-block px-1 min-w-[5rem] text-center">{publicReg || ' '}</span> on <span className="fill-blank inline-block px-1 min-w-[8rem] text-center">{publicDate || ' '}</span> at the Local Civil Registry Office (LCRO)/Philippine Foreign Service Post (PFSP) of <span className="fill-blank inline-block px-1 min-w-[8rem] text-center">{publicOffice || ' '}</span>.</li>
        <li className="text-justify">I am filing this AUSF at LCRO/PFSP of <span className="fill-blank inline-block px-1 min-w-[8rem] text-center uppercase">{filingAt}</span> in accordance with R.A No. 9255 and its Revised Implementing Rules and Regulations.</li>
        <li className="text-justify">I hereby certify that the statements made herein are true and correct to the best of my knowledge and belief.</li>
      </ol>
      <p className="mb-0.5 text-justify">IN WITNESS WHEREOF, I have hereunto set my hand this <span className="fill-blank inline-block min-w-[8rem] text-center ml-1">{witnessDate}</span> at Iligan City, Philippines.</p>
      <div className="text-center mt-2 mb-3">
        <p className="fill-blank uppercase inline-block pb-0.5">{attestationName}</p>
        <p className="text-xs mt-0.5">Affiant</p>
      </div>

      <h2 className="text-center font-bold text-sm uppercase my-3">SWORN ATTESTATION</h2>
      <p className="mb-2 text-justify">
        I, <span className="fill-blank inline-block min-w-[12rem] text-center mx-1">{affiantName}</span>, of legal age, single/married, Filipino, and a resident of Iligan City, Philippines, after having been duly sworn to in accordance with law, do hereby declare THAT:
      </p>
      <ol className="list-decimal list-inside space-y-1 mb-2 ml-6 text-justify">
        <li className="text-justify">That I am the <span className="fill-blank inline-block px-1 min-w-[3rem]">{attestationRelationship}</span> of the affiant in the above affidavit;</li>
        <li className="text-justify">That my above-named child/ward is fully aware of the consequences of the Affidavit to use the surname of his/her father.</li>
      </ol>
      <p className="mb-0.5 text-justify">IN WITNESS WHEREOF, I have hereunto set my hand this <span className="fill-blank inline-block min-w-[8rem] text-center ml-1">{witnessDate}</span> at Iligan City, Philippines.</p>
      <div className="text-center mt-2 mb-2">
        <p className="fill-blank uppercase inline-block pb-0.5">{affiantName}</p>
        <p className="text-xs mt-0.5">Affiant</p>
      </div>
      <p className="ausf-subscribed-sworn mt-4 mb-0.5 text-justify leading-snug">SUBSCRIBED AND SWORN to before me this <span className="fill-blank inline-block min-w-[8rem] text-center ml-1">{witnessDate}</span> in the City of Iligan. I certify that I personally examined the affiant and that he/she voluntarily executed the foregoing affidavit and understood the contents thereof.</p>
      <div className="registrar-signature-zone flex-1 flex min-h-[2rem] flex-col justify-center items-end">
        <div className="text-right city-registrar-signature">
          <p className="font-bold text-sm">{data.cityCivilRegistrarName}</p>
          <p className="text-xs">City Civil Registrar</p>
        </div>
      </div>
      <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
    </div>
  )
}
