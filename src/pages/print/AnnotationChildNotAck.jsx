import React from 'react'
import { formatDateLong, formatDateCOLB, fullName } from '../../lib/printUtils'
import { DocumentFooter } from '../../components/print'

const COLB_BAND = 'bg-[#e8f5e9]'

export default function AnnotationChildNotAck({ data }) {
  const childFirst = data.childFirst || ''
  const childMiddle = data.childMiddle || ''
  const childLast = data.childLast || ''
  const dob = formatDateCOLB(data.dateOfBirth)
  const placeHospital = data.placeOfBirthAddress || ''
  const placeCity = data.placeOfBirthCity || 'ILIGAN CITY'
  const placeProvince = data.placeOfBirthProvince || 'LANAO DEL NORTE'
  const placeFull = [placeHospital, placeCity, placeProvince].filter(Boolean).join(', ') || '—'
  const regNo = (data.colbRegistryNoForm102 || data.colbRegistryNo || '—').toString()
  const regMatch = regNo.match(/^(\d{4})[\s,-]+([\d,]+)$/)
  const regYear = regMatch ? regMatch[1] : ''
  const regNum = regMatch ? regMatch[2] : regNo
  const attDate = data.attendantDate ? formatDateLong(data.attendantDate) : ''
  const infDate = data.informantDate ? formatDateLong(data.informantDate) : ''
  const prepDate = data.preparedByDate ? formatDateLong(data.preparedByDate) : ''
  const recvDate = data.receivedByDate ? formatDateLong(data.receivedByDate) : ''
  const regDate = data.registeredByDate ? formatDateLong(data.registeredByDate) : ''
  const B = ({ children }) => <span className="border-b border-black inline-block min-w-[3rem] px-1">{children}</span>

  return (
    <div className="ausf-doc print-doc colb-form bg-white text-black text-sm max-w-[210mm] mx-auto px-4 py-3">
      <div className="flex justify-between items-start mb-1 text-xs">
        <p className="font-medium">Municipal Form No. 102 (Revised January 2007)</p>
        <p className="text-right">(To be accomplished in quadruplicate using black ink)</p>
      </div>
      <div className={`text-center py-2 mb-2 ${COLB_BAND}`}>
        <p className="font-bold text-sm">Republic of the Philippines</p>
        <p className="font-bold text-sm uppercase">Office of the Civil Registrar General</p>
      </div>
      <div className="flex justify-between items-start gap-4 mb-2">
        <h2 className="font-bold text-lg uppercase flex-1 text-center">Certificate of Live Birth</h2>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs font-medium">Registry No.</span>
          <span className="border border-black px-2 py-0.5 text-center min-w-[3rem]">{regYear}</span>
          <span className="border-b border-black px-2 py-0.5 text-center min-w-[4rem]">{regNum}</span>
        </div>
      </div>
      <div className={`flex gap-8 py-2 px-3 mb-3 ${COLB_BAND} border-y border-gray-400`}>
        <p className="text-sm"><span className="font-medium">Province:</span> <B>{placeProvince}</B></p>
        <p className="text-sm flex-1"><span className="font-medium">City/Municipality:</span> <B>{placeCity}</B></p>
      </div>

      <div className={`flex border border-gray-400 mb-2 ${COLB_BAND}`}>
        <div className="flex flex-col justify-center px-1 py-2 text-xs font-bold uppercase tracking-widest text-center border-r border-gray-400">
          {['C','H','I','L','D'].map((c, i) => <span key={i}>{c}</span>)}
        </div>
        <div className="flex-1 py-2 px-3 space-y-1.5 text-sm">
          <p><span className="font-medium">1. NAME:</span> (First) <B>{childFirst}</B> (Middle) <B>{childMiddle}</B> (Last) <B>{childLast}</B></p>
          <p><span className="font-medium">2. SEX:</span> <B>{data.sex || '—'}</B></p>
          <p><span className="font-medium">3. DATE OF BIRTH:</span> (Day) <B>{dob.day}</B> (Month) <B>{dob.month}</B> (Year) <B>{dob.year}</B></p>
          <p><span className="font-medium">4. PLACE OF BIRTH:</span> <B>{placeFull}</B></p>
          <p><span className="font-medium">5a. TYPE OF BIRTH:</span> <B>{data.typeOfBirth || 'SINGLE'}</B> <span className="font-medium">5b.</span> IF MULTIPLE BIRTH, CHILD WAS: <B>N/A</B> <span className="font-medium">5c.</span> BIRTH ORDER: <B>{data.birthOrder || '—'}</B></p>
          <p><span className="font-medium">6. WEIGHT AT BIRTH:</span> <B>{data.birthWeight || '—'}</B> grams</p>
        </div>
      </div>

      <div className={`flex border border-gray-400 mb-2 ${COLB_BAND}`}>
        <div className="flex flex-col justify-center px-1 py-2 text-xs font-bold uppercase tracking-widest text-center border-r border-gray-400">
          {['M','O','T','H','E','R'].map((c, i) => <span key={i}>{c}</span>)}
        </div>
        <div className="flex-1 py-2 px-3 space-y-1.5 text-sm">
          <p><span className="font-medium">7. MAIDEN NAME:</span> (First) <B>{data.motherFirst}</B> (Middle) <B>{data.motherMiddle}</B> (Last) <B>{data.motherLast}</B></p>
          <p><span className="font-medium">8. CITIZENSHIP:</span> <B>{data.motherCitizenship || 'Filipino'}</B></p>
          <p><span className="font-medium">9. RELIGION/RELIGIOUS SECT:</span> <B>{data.motherReligion || '—'}</B></p>
          <p><span className="font-medium">10a.</span> Total number of children born alive: <B>{data.motherTotalChildrenAlive || '—'}</B> <span className="font-medium">10b.</span> No. of children born living including this birth: <B>{data.motherChildrenLiving || '—'}</B> <span className="font-medium">10c.</span> No. of children born alive but are now dead: <B>{data.motherChildrenDead || '0'}</B></p>
          <p><span className="font-medium">11. OCCUPATION:</span> <B>{data.motherOccupation || '—'}</B></p>
          <p><span className="font-medium">12. AGE</span> at the time of this birth (completed years): <B>{data.motherAge || '—'}</B></p>
          <p><span className="font-medium">13. RESIDENCE:</span> (House No., St., Barangay) <B>{data.motherResidence || '—'}</B></p>
          <p className="pl-4">(City/Municipality) <B>{placeCity}</B> (Province) <B>{placeProvince}</B> (Country) PHILIPPINES</p>
        </div>
      </div>

      <div className={`flex border border-gray-400 mb-2 ${COLB_BAND}`}>
        <div className="flex flex-col justify-center px-1 py-2 text-xs font-bold uppercase tracking-widest text-center border-r border-gray-400">
          {['F','A','T','H','E','R'].map((c, i) => <span key={i}>{c}</span>)}
        </div>
        <div className="flex-1 py-2 px-3 space-y-1.5 text-sm">
          <p><span className="font-medium">14. NAME:</span> (First) <B>{data.fatherFirst || '—'}</B> (Middle) <B>{data.fatherMiddle || '—'}</B> (Last) <B>{data.fatherLast || 'UNKNOWN'}</B></p>
          <p><span className="font-medium">15. CITIZENSHIP:</span> <B>{data.fatherCitizenship || 'NOT APPLICABLE'}</B></p>
          <p><span className="font-medium">16. RELIGION/RELIGIOUS SECT:</span> <B>{data.fatherReligion || 'NOT APPLICABLE'}</B></p>
          <p><span className="font-medium">17. OCCUPATION:</span> <B>{data.fatherOccupation || 'NOT APPLICABLE'}</B></p>
          <p><span className="font-medium">18. AGE</span> at the time of this birth: <B>{data.fatherAge || 'N/A'}</B></p>
          <p><span className="font-medium">19. RESIDENCE:</span> <B>{data.fatherResidence || 'NOT APPLICABLE'}</B></p>
        </div>
      </div>

      <div className={`border border-gray-400 mb-2 py-2 px-3 text-sm ${COLB_BAND}`}>
        <p className="text-xs mb-1">(If not married, accomplish Affidavit of Acknowledgement/Admission of Paternity at the back)</p>
        <p><span className="font-medium">20a. DATE:</span> <B>NOT APPLICABLE</B> <span className="font-medium">20b. PLACE:</span> <B>NOT APPLICABLE</B></p>
      </div>

      <div className={`border border-gray-400 mb-2 py-2 px-3 text-sm ${COLB_BAND}`}>
        <p className="font-bold mb-1">21. ATTENDANT</p>
        <p className="text-xs mb-1">21a. ATTENDANT: ( ) 1 Physician ( ) 2 Nurse ( ) 3 Midwife ( ) 4 Hilot (Traditional Birth Attendant) ( ) 5 Others (Specify)</p>
        <p className="text-xs mb-2">21b. CERTIFICATION OF ATTENDANT AT BIRTH: &quot;I hereby certify that I attended the birth of the child who was born alive at _____ am/pm on the date of birth specified above.&quot;</p>
        <p>Signature: <span className="border-b border-black inline-block min-w-[10rem] mx-1" /> Name in Print: <B>{data.attendantName || '—'}</B></p>
        <p>Title or Position: <B>{data.attendantTitle || '—'}</B> Address: <B>{data.attendantAddress || '—'}</B></p>
        <p>Date: <B>{attDate}</B></p>
      </div>

      <div className={`border border-gray-400 mb-2 py-2 px-3 text-sm ${COLB_BAND}`}>
        <p className="font-bold mb-1">22. CERTIFICATION OF INFORMANT</p>
        <p className="text-xs mb-2">&quot;I hereby certify that all information supplied are true and correct to my own knowledge and belief.&quot;</p>
        <p>Signature: <span className="border-b border-black inline-block min-w-[10rem] mx-1" /> Name in Print: <B>{data.informantName || fullName(data.motherFirst, data.motherMiddle, data.motherLast) || '—'}</B></p>
        <p>Relationship to the Child: <B>{data.informantRelationship || 'MOTHER'}</B></p>
        <p>Address: <B>{data.informantAddress || data.motherResidence || '—'}</B> Date: <B>{infDate}</B></p>
      </div>

      <div className={`border border-gray-400 mb-2 py-2 px-3 text-sm ${COLB_BAND}`}>
        <p className="font-bold mb-1">23. PREPARED BY</p>
        <p>Signature: <span className="border-b border-black inline-block min-w-[8rem] mx-1" /> Name In Print: <B>{data.preparedByName || '—'}</B></p>
        <p>Title or Position: <B>{data.preparedByTitle || '—'}</B> Date: <B>{prepDate}</B></p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-2">
        <div className={`border border-gray-400 py-2 px-3 text-sm ${COLB_BAND}`}>
          <p className="font-bold mb-1">24. RECEIVED BY</p>
          <p>Signature: <span className="border-b border-black inline-block min-w-[8rem]" /></p>
          <p>Name in Print: <B>{data.receivedByName || '—'}</B></p>
          <p>Title or Position: <B>{data.receivedByTitle || '—'}</B></p>
          <p>Date: <B>{recvDate}</B></p>
        </div>
        <div className={`border border-gray-400 py-2 px-3 text-sm ${COLB_BAND}`}>
          <p className="font-bold mb-1">25. REGISTERED BY THE CIVIL REGISTRAR</p>
          <p>Signature: <span className="border-b border-black inline-block min-w-[8rem]" /></p>
          <p>Name in Print: <B>{data.registeredByName || '—'}</B></p>
          <p>Title or Position: <B>{data.registeredByTitle || 'CITY CIVIL REGISTRAR ILIGAN CITY'}</B></p>
          <p>Date: <B>{regDate}</B></p>
        </div>
      </div>

      <div className="mb-2">
        <p className="font-medium text-sm mb-1">REMARKS/ANNOTATIONS (For LCRO/OCRG Use Only)</p>
        <div className="border border-gray-400 min-h-[2rem]" />
      </div>
      <p className="text-xs font-medium mb-1">TO BE FILLED-UP AT THE OFFICE OF THE CIVIL REGISTRAR</p>
      <div className="flex gap-0.5 flex-wrap mb-4" aria-hidden>
        {Array.from({ length: 19 }, (_, i) => (
          <span key={i} className="inline-block w-5 h-5 border border-gray-500" />
        ))}
      </div>
      <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
    </div>
  )
}
