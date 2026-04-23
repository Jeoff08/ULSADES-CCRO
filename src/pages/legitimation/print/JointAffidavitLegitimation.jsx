import React from 'react'
import { fullName, formatDateLong } from '../../../lib/printUtils'
import { DocumentHeader, DocumentFooter, FILL_BOLD } from '../../../components/print'

/** JOINT AFFIDAVIT OF LEGITIMATION – matching the specific JOINT layout from the user provided image. */
export default function JointAffidavitLegitimation({ data }) {
  const childFull = fullName(data.childFirst, data.childMiddle, data.childLast)
  const motherFull = fullName(data.motherFirst, data.motherMiddle, data.motherLast)
  const fatherFull = fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const marriageDate = formatDateLong(data.dateOfMarriage) || '—'
  const marriagePlace = [data.placeOfMarriageCity, data.placeOfMarriageProvince, data.placeOfMarriageCountry].filter(Boolean).join(', ')
  const solemnizingOfficer = data.solemnizingOfficer || '—'
  const marriageRegistryNo = data.marriageRegistryNo || '—'
  const marriageLcr = data.placeOfMarriageCity || '—'

  const childDob = formatDateLong(data.dateOfBirth) || '—'
  const childPob = [data.placeOfBirthStreet, data.placeOfBirthCity, data.placeOfBirthProvince].filter(Boolean).join(', ')

  const currentDayMonthYear = formatDateLong(new Date())
  const witnessDate = formatDateLong(data.affidavitExecutionDate) || currentDayMonthYear
  const registryNo = data.affidavitLegitRegistryNo || '—'

  return (
    <div className="ausf-doc print-doc legitimation-affidavit-doc bg-white text-black text-[17px] max-w-[210mm] mx-auto px-6 py-4 leading-snug flex flex-col min-h-0">
      <DocumentHeader
        registryNo={registryNo}
        headerTextSize="20px"
        juratBlock={(
          <div className="m-0 leading-none">
            Republic of the Philippines)
            <br />
            City of Iligan) S.S
            <br />
            x----------------------------------/
          </div>
        )}
      />

      <h2 className="legitimation-affidavit-title -mt-16">JOINT AFFIDAVIT OF LEGITIMATION</h2>

      <div className="legitimation-affidavit-body flex-1 flex flex-col min-h-0">

        <p className="mb-4 leading-normal text-justify">
          We, <span className={`${FILL_BOLD} px-0.5 align-baseline uppercase`}>{motherFull || '—'}</span> and{' '}
          <span className={`${FILL_BOLD} px-0.5 align-baseline uppercase`}>{fatherFull || '—'}</span>, both of legal age,
          Filipino, and residents of Iligan City, Philippines, after having been duly sworn to in accordance with law, do hereby
          declare THAT:
        </p>

        <ol className="list-decimal list-outside ml-8 mr-0 pl-1 space-y-3 mb-3 mt-4 text-justify leading-normal">
          <li>
            We are the biological parents of <span className={`${FILL_BOLD} px-0.5 align-baseline uppercase`}>{childFull || '—'}</span>{' '}
            who was born on <span className={`${FILL_BOLD} px-0.5 align-baseline`}>{childDob}</span> in{' '}
            <span className={`${FILL_BOLD} px-0.5 align-baseline uppercase`}>{childPob || '—'}</span>.
          </li>
          <li>
            At the time of conception and birth of the child, we were not disqualified by any legal impediments to marry each
            other{data.parentsMinorAtBirth === 'YES' ? ' EXCEPT AGE.' : '.'}
          </li>
          <li>
            We subsequently got married on <span className={`${FILL_BOLD} px-0.5 align-baseline`}>{marriageDate}</span> at{' '}
            <span className={`${FILL_BOLD} px-0.5 align-baseline uppercase`}>{marriagePlace || '—'}</span> which was solemnized by{' '}
            <span className={`${FILL_BOLD} px-0.5 align-baseline uppercase`}>{solemnizingOfficer}</span>.
          </li>
          <li>
            Our marriage was duly registered at the Local Civil Registrar of{' '}
            <span className={`${FILL_BOLD} px-0.5 align-baseline uppercase`}>{marriageLcr}</span> under Registry No.{' '}
            <span className={`${FILL_BOLD} px-0.5 align-baseline`}>{marriageRegistryNo}</span>.
          </li>
          <li>
            We are executing this Affidavit to attest to the truthfulness of the foregoing facts, for purposes of complying with the
            requirements in applying for the legitimation by subsequent marriage of our child and for proper recording, to enable
            him/her to bear the surname of his/her father and be entitled to all rights of a legitimate child, and for all legal
            intents and purposes.
          </li>
        </ol>

        <p className="mb-2 leading-normal mt-4 text-justify">
          IN WITNESS WHEREOF, we have hereunto set our hand this{' '}
          <span className={`${FILL_BOLD} ml-1 align-baseline`}>{witnessDate}</span> at Iligan City, Philippines.
        </p>

        <div className="flex justify-between gap-12 mt-4 mb-4 leading-none">
          <div className="text-center flex-1">
            <div className="fill-blank font-bold uppercase inline-block pb-0 border-b border-black min-w-[12rem]">
              {motherFull || '—'}
            </div>
            <div className="text-xs mt-0">Affiant</div>
          </div>
          <div className="text-center flex-1">
            <div className="fill-blank font-bold uppercase inline-block pb-0 border-b border-black min-w-[12rem]">
              {fatherFull || '—'}
            </div>
            <div className="text-xs mt-0">Affiant</div>
          </div>
        </div>

        <p className="mb-1 leading-normal text-justify">
          SUBSCRIBED AND SWORN to before me this <span className={`${FILL_BOLD} ml-1 align-baseline`}>{witnessDate}</span> in the
          City of Iligan. I certify that I personally examined the affiants and that they voluntarily executed the foregoing
          affidavit and understood the contents thereof.
        </p>

        <div className="registrar-signature-zone mt-auto pt-4 flex min-h-[4rem] flex-col justify-end items-end">
          <div className="text-right city-registrar-signature">
            <p className="font-bold text-right">{data.cityCivilRegistrarName || 'Atty. Yussif Don Justin F. Martil'}</p>
            <p className="text-sm text-right">City Civil Registrar</p>
          </div>
        </div>
      </div>

      <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
    </div>
  )
}
