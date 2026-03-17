import React from 'react'
import { formatDateLong, fullName } from '../../../lib/printUtils'
import { DocumentHeader, DocumentFooter, FILL, FILL_BOLD } from '../../../components/print'

export default function Ausf06({ data }) {
  const affiantName = data.applicantName || fullName(data.childFirst, data.childMiddle, data.fatherLast) || fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const surnameSought = data.fatherLast
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
    <div className="ausf-doc ausf-0-6-doc print-doc flex flex-col min-h-[297mm] bg-white text-black text-[17px] max-w-[210mm] mx-auto px-6 py-4 leading-snug">
      <DocumentHeader registryNo={data.ausfRegistryNo} />
      <h2 className="text-center font-bold text-lg uppercase mb-4 mt-0.5">AFFIDAVIT TO USE THE SURNAME OF THE FATHER (AUSF)</h2>
      <p className="mb-4 leading-normal text-justify">
        I, <span className={`${FILL} affiant-name-blank affiant-name-bold-underline uppercase mx-0.5 align-baseline`}><span className="affiant-name-inner">{affiantName}</span></span>, of legal age, single/married, Filipino, and a resident of Iligan City, Philippines, after having been duly sworn to in accordance with law, do hereby declare THAT:
      </p>

      <ol className="list-decimal list-outside ml-8 mr-0 pl-1 space-y-3 mb-3 mt-4 text-justify leading-normal">
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
      <div className="text-center mt-4 mb-4">
        <p className="fill-blank font-bold uppercase inline-block pb-0.5 border-b border-black min-w-[16rem]">{affiantName}</p>
        <p className="text-xs mt-1">Affiant</p>
      </div>
      <p className="ausf-subscribed-sworn mb-1 leading-normal text-justify">SUBSCRIBED AND SWORN to before me this <span className={`${FILL_BOLD} ml-1 align-baseline`}>{witnessDate}</span> in the City of Iligan. I certify that I personally examined the affiant and that he/she voluntarily executed the foregoing affidavit and understood the contents thereof.</p>
      <div className="registrar-signature-zone flex-1 flex min-h-[3rem] flex-col justify-center items-start">
        <div className="text-left city-registrar-signature">
          <p className="font-bold text-left">{data.cityCivilRegistrarName}</p>
          <p className="text-sm mt-1">City Civil Registrar</p>
        </div>
      </div>
      <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
    </div>
  )
}
