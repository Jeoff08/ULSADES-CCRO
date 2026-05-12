import React, { useState, useMemo } from 'react'
import { useWarnIfUnsaved } from '../../hooks/useWarnIfUnsaved'
import { searchLegitimationForForm1a } from './lib/supplementalForm1a'
import PrintHeaderRow from '../../components/print/PrintHeaderRow'
import { supplementalAffidavitRegisterSubtitle } from './lib/supplementalAffidavitRegisterSubtitle'

export default function LcrSearchAndPrint({ title, type }) {
  const [lcrForm, setLcrForm] = useState('')
  const [clientName, setClientName] = useState('')
  const [selectedClient, setSelectedClient] = useState(null)
  const [searchFocused, setSearchFocused] = useState(false)

  // Fields for the Supplemental Report
  const [cityOf, setCityOf] = useState('')
  const [regNo, setRegNo] = useState('')
  const [civilStatus, setCivilStatus] = useState('SINGLE')
  const [address, setAddress] = useState('')
  const [registeredIn, setRegisteredIn] = useState('')
  const [registeredDate, setRegisteredDate] = useState('')
  const [provinceMissing, setProvinceMissing] = useState('')
  const [provinceCorrected, setProvinceCorrected] = useState('')
  const [affiantName, setAffiantName] = useState('')

  const [isOutputMode, setIsOutputMode] = useState(false)

  // Additional LCR fields
  const [lcrPage, setLcrPage] = useState('')
  const [lcrBook, setLcrBook] = useState('')
  const [lcrDateRegistration, setLcrDateRegistration] = useState('')
  const [lcrPlaceBirth, setLcrPlaceBirth] = useState('')
  const [lcrMotherName, setLcrMotherName] = useState('')
  const [lcrFatherName, setLcrFatherName] = useState('')
  const [lcrDateMarriage, setLcrDateMarriage] = useState('')
  const [lcrPlaceMarriage, setLcrPlaceMarriage] = useState('')
  const [lcrSex, setLcrSex] = useState('')
  const [lcrBirthDate, setLcrBirthDate] = useState('')
  const [lcrCitizenshipMother, setLcrCitizenshipMother] = useState('')
  const [lcrCitizenshipFather, setLcrCitizenshipFather] = useState('')
  const [lcrCitizenship, setLcrCitizenship] = useState('')
  const [lcrCauseDeath, setLcrCauseDeath] = useState('')
  const [lcrHusbandName, setLcrHusbandName] = useState('')
  const [lcrWifeName, setLcrWifeName] = useState('')
  const [lcrHusbandCitizenship, setLcrHusbandCitizenship] = useState('')
  const [lcrWifeCitizenship, setLcrWifeCitizenship] = useState('')
  const [lcrHusbandCivilStatus, setLcrHusbandCivilStatus] = useState('')
  const [lcrWifeCivilStatus, setLcrWifeCivilStatus] = useState('')
  const [lcrHusbandMother, setLcrHusbandMother] = useState('')
  const [lcrWifeMother, setLcrWifeMother] = useState('')
  const [lcrHusbandFather, setLcrHusbandFather] = useState('')
  const [lcrWifeFather, setLcrWifeFather] = useState('')
  const [lcrHusbandDobAge, setLcrHusbandDobAge] = useState('')
  const [lcrWifeDobAge, setLcrWifeDobAge] = useState('')

  const formStateForDirtyGuard = useMemo(
    () => ({
      lcrForm,
      clientName,
      selectedClient,
      cityOf,
      regNo,
      civilStatus,
      address,
      registeredIn,
      registeredDate,
      provinceMissing,
      provinceCorrected,
      affiantName,
      isOutputMode,
      lcrPage,
      lcrBook,
      lcrDateRegistration,
      lcrPlaceBirth,
      lcrMotherName,
      lcrFatherName,
      lcrDateMarriage,
      lcrPlaceMarriage,
      lcrSex,
      lcrBirthDate,
      lcrCitizenshipMother,
      lcrCitizenshipFather,
    }),
    [
      lcrForm,
      clientName,
      selectedClient,
      cityOf,
      regNo,
      civilStatus,
      address,
      registeredIn,
      registeredDate,
      provinceMissing,
      provinceCorrected,
      affiantName,
      isOutputMode,
      lcrPage,
      lcrBook,
      lcrDateRegistration,
      lcrPlaceBirth,
      lcrMotherName,
      lcrFatherName,
      lcrDateMarriage,
      lcrPlaceMarriage,
      lcrSex,
      lcrBirthDate,
      lcrCitizenshipMother,
      lcrCitizenshipFather,
    ]
  )

  const _acknowledgeSaved = useWarnIfUnsaved(formStateForDirtyGuard, [type])

  const searchResults = useMemo(() => {
    if (!clientName.trim()) return []
    return searchLegitimationForForm1a(clientName)
  }, [clientName])

  const handleSelectClient = (client) => {
    setSelectedClient(client)
    
    // Auto-detect form type from source if possible
    let detectedForm = lcrForm.toUpperCase() || '1A'
    if (client.formType === 'lcr-form-1a') detectedForm = '1A'
    else if (client.formType === 'lcr-form-2a') detectedForm = '2A'
    else if (client.formType === 'lcr-form-3a') detectedForm = '3A'
    
    setLcrForm(detectedForm)
    setClientName(client.childName || client.label || '')
    setAffiantName(client.childName || client.label || '')
    setSearchFocused(false)
    setIsOutputMode(true) // Auto-go to output
    
    // Auto-fill some fields if data exists
    if (client.data) {
      const d = client.data
      const f = detectedForm
      
      // Registry Number
      if (f === '1A') setRegNo(d.lcr1aRegistryNumber || d.colbRegistryNo || d.registryNumber || '')
      else if (f === '2A') setRegNo(d.lcr2aRegistryNumber || d.registryNumber || '')
      else if (f === '3A') setRegNo(d.lcr3aRegistryNumber || d.registryNumber || '')
      else setRegNo(d.lcr1aRegistryNumber || d.lcr2aRegistryNumber || d.lcr3aRegistryNumber || d.colbRegistryNo || d.registryNumber || '')

      setAddress(d.residenceAddress || '')
      setRegisteredIn(d.registeredAt || '')
      setCivilStatus(d.civilStatus?.toUpperCase() || 'SINGLE')
      
      // Fill LCR specific fields (Page and Book numbers)
      setLcrPage(d.colbPageNumber || d.colbPageNo || '')
      setLcrBook(d.colbBookNumber || d.colbBookNo || '')
      
      // Date of Registration
      if (f === '1A') setLcrDateRegistration(d.lcr1aDateRegistration || d.colbRegDate || d.dateRegistered || '')
      else if (f === '2A') setLcrDateRegistration(d.lcr2aDateRegistration || d.dateRegistered || '')
      else if (f === '3A') setLcrDateRegistration(d.lcr3aDateRegistration || d.dateRegistered || '')
      else setLcrDateRegistration(d.lcr1aDateRegistration || d.lcr2aDateRegistration || d.lcr3aDateRegistration || d.colbRegDate || d.dateRegistered || '')

      // Map other fields based on form type
      if (f === '1A') {
        setAffiantName(d.lcr1aNameOfChild || d.childName || client.childName || '')
        setLcrSex(d.lcr1aSex || d.sex || '')
        setLcrBirthDate(d.lcr1aDateOfBirth || d.dateOfBirth || '')
        setLcrPlaceBirth(d.lcr1aPlaceOfBirth || d.placeOfBirth || '')
        setLcrMotherName(d.lcr1aNameOfMother || d.motherName || '')
        setLcrFatherName(d.lcr1aNameOfFather || d.fatherName || '')
        setLcrCitizenshipMother(d.lcr1aMotherCitizenship || d.motherCitizenship || '')
        setLcrCitizenshipFather(d.lcr1aFatherCitizenship || d.fatherCitizenship || '')
        setLcrDateMarriage(d.lcr1aDateMarriageParents || d.dateOfMarriage || '')
        setLcrPlaceMarriage(d.lcr1aPlaceMarriageParents || d.placeOfMarriageOfParents || '')
      } else if (f === '2A') {
        setAffiantName(d.lcr2aNameDeceased || client.childName || '')
        setLcrSex(d.lcr2aSex || d.sex || '')
        setLcrBirthDate(d.lcr2aDateDeath || '') // Reuse birth date state for date of death in 2A table? No, better use a mapping
        setLcrPlaceBirth(d.lcr2aPlaceDeath || '')
        setLcrCitizenship(d.lcr2aCitizenship || '')
        setLcrCauseDeath(d.lcr2aCauseDeath || '')
        setCivilStatus(d.lcr2aCivilStatus || d.civilStatus || '')
        setLcrCitizenshipFather(d.lcr2aCitizenshipFather || '')
      } else if (f === '3A') {
        setLcrHusbandName(d.lcr3aHusbandName || '')
        setLcrWifeName(d.lcr3aWifeName || '')
        setLcrHusbandCitizenship(d.lcr3aHusbandCitizenship || '')
        setLcrWifeCitizenship(d.lcr3aWifeCitizenship || '')
        setLcrHusbandCivilStatus(d.lcr3aHusbandCivilStatus || '')
        setLcrWifeCivilStatus(d.lcr3aWifeCivilStatus || '')
        setLcrHusbandMother(d.lcr3aHusbandMother || '')
        setLcrWifeMother(d.lcr3aWifeMother || '')
        setLcrHusbandFather(d.lcr3aHusbandFather || '')
        setLcrWifeFather(d.lcr3aWifeFather || '')
        
        // DOB/Age retrieval logic similar to buildLcr3aTableDisplay
        const hDob = d.lcr3aHusbandDobAge || ''
        const wDob = d.lcr3aWifeDobAge || ''
        setLcrHusbandDobAge(hDob)
        setLcrWifeDobAge(wDob)
        
        setLcrDateMarriage(d.lcr3aDateMarriage || '')
        setLcrPlaceMarriage(d.lcr3aPlaceMarriage || '')
      }
    }
  }

  const renderLcrForm = () => {
    const formNum = lcrForm.toUpperCase() || '1A'
    const formTitle = formNum === '1A' ? '(Birth-Available)' : formNum === '2A' ? '(Death-Available)' : '(Marriage-Available)'
    
    return (
      <div className="bg-white p-12 shadow-2xl max-w-[816px] mx-auto min-h-[1056px] text-gray-900 font-serif print:shadow-none print:p-0 ring-1 ring-gray-200 print:ring-0 mb-12">
        <PrintHeaderRow />
        <hr className="border-black my-4" />
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="font-bold text-lg">LCR Form No. {formNum}</p>
            <p className="text-sm italic">{formTitle}</p>
          </div>
          <div className="text-right">
            <input type="text" className="border-b border-gray-400 focus:outline-none focus:border-blue-500 font-bold text-sm w-40 bg-transparent text-right" defaultValue={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
          </div>
        </div>

        <p className="font-bold mb-4">TO WHOM IT MAY CONCERN:</p>
        <p className="mb-6 leading-relaxed">
          <span className="font-bold">WE CERTIFY</span> that, among others, the following facts of {formNum === '1A' ? 'birth' : formNum === '2A' ? 'death' : 'marriage'} appear in our Register of {formNum === '1A' ? 'Births' : formNum === '2A' ? 'Deaths' : 'Marriages'} on Page 
          <input type="text" className="print:!hidden no-print border-b border-gray-400 focus:outline-none focus:border-blue-500 font-bold px-1 w-12 mx-1 bg-transparent text-center" value={lcrPage} onChange={(e) => setLcrPage(e.target.value)} />
          <span className="hidden print:inline-block border-b border-black px-1 min-w-[2rem] text-center font-bold mx-1">
            {lcrPage || '___'}
          </span>
          of Book number 
          <input type="text" className="print:!hidden no-print border-b border-gray-400 focus:outline-none focus:border-blue-500 font-bold px-1 w-16 mx-1 bg-transparent text-center" value={lcrBook} onChange={(e) => setLcrBook(e.target.value)} />
          <span className="hidden print:inline-block border-b border-black px-1 min-w-[2rem] text-center font-bold mx-1">
            {lcrBook || '___'}
          </span>.
        </p>

        {formNum === '3A' ? (
          <table className="w-full border-collapse text-sm mb-8 border border-black table-fixed">
            <colgroup>
              <col style={{ width: '28%' }} />
              <col style={{ width: '36%' }} />
              <col style={{ width: '36%' }} />
            </colgroup>
            <thead>
              <tr>
                <td className="py-2 px-2 border border-black font-bold align-top" />
                <td className="py-2 px-2 border border-black font-bold text-center uppercase tracking-wider">HUSBAND</td>
                <td className="py-2 px-2 border border-black font-bold text-center uppercase tracking-wider">WIFE</td>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Name:', h: lcrHusbandName, hs: setLcrHusbandName, w: lcrWifeName, ws: setLcrWifeName },
                { label: 'Date of Birth/Age:', h: lcrHusbandDobAge, hs: setLcrHusbandDobAge, w: lcrWifeDobAge, ws: setLcrWifeDobAge },
                { label: 'Citizenship:', h: lcrHusbandCitizenship, hs: setLcrHusbandCitizenship, w: lcrWifeCitizenship, ws: setLcrWifeCitizenship },
                { label: 'Civil Status:', h: lcrHusbandCivilStatus, hs: setLcrHusbandCivilStatus, w: lcrWifeCivilStatus, ws: setLcrWifeCivilStatus },
                { label: 'Mother:', h: lcrHusbandMother, hs: setLcrHusbandMother, w: lcrWifeMother, ws: setLcrWifeMother },
                { label: 'Father:', h: lcrHusbandFather, hs: setLcrHusbandFather, w: lcrWifeFather, ws: setLcrWifeFather },
              ].map((row, i) => (
                <tr key={i}>
                  <td className="py-2 px-2 border border-black font-bold align-top">{row.label}</td>
                  <td className="py-2 px-2 border border-black text-center uppercase font-bold">
                    <input type="text" className="w-full focus:outline-none focus:bg-blue-50 bg-transparent text-center font-bold" value={row.h} onChange={(e) => row.hs(e.target.value)} />
                  </td>
                  <td className="py-2 px-2 border border-black text-center uppercase font-bold">
                    <input type="text" className="w-full focus:outline-none focus:bg-blue-50 bg-transparent text-center font-bold" value={row.w} onChange={(e) => row.ws(e.target.value)} />
                  </td>
                </tr>
              ))}
              {[
                { label: 'Registry Number', value: regNo, setter: setRegNo },
                { label: 'Date of Registration', value: lcrDateRegistration, setter: setLcrDateRegistration },
                { label: 'Date of Marriage', value: lcrDateMarriage, setter: setLcrDateMarriage },
                { label: 'Place of Marriage', value: lcrPlaceMarriage, setter: setLcrPlaceMarriage },
              ].map((row, i) => (
                <tr key={i}>
                  <td className="py-2 px-2 border border-black font-bold align-top">{row.label}</td>
                  <td className="py-2 px-2 border border-black text-center uppercase font-bold" colSpan={2}>
                    <input type="text" className="w-full focus:outline-none focus:bg-blue-50 bg-transparent text-center font-bold" value={row.value} onChange={(e) => row.setter(e.target.value)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full border-collapse border border-black mb-8">
            <tbody>
              {(formNum === '2A' ? [
                { label: 'LCR Registry Number', value: regNo, setter: setRegNo },
                { label: 'Date of Registration', value: lcrDateRegistration, setter: setLcrDateRegistration },
                { label: 'Name of Deceased', value: affiantName, setter: setAffiantName },
                { label: 'Sex', value: lcrSex, setter: setLcrSex },
                { label: 'Civil Status', value: civilStatus, setter: setCivilStatus },
                { label: 'Citizenship', value: lcrCitizenship, setter: setLcrCitizenship },
                { label: 'Date of Death', value: lcrBirthDate, setter: setLcrBirthDate },
                { label: 'Citizenship of Father', value: lcrCitizenshipFather, setter: setLcrCitizenshipFather },
                { label: 'Place of Death', value: lcrPlaceBirth, setter: setLcrPlaceBirth },
                { label: 'Cause of Death', value: lcrCauseDeath, setter: setLcrCauseDeath },
              ] : [
                { label: 'LCR Registry Number', value: regNo, setter: setRegNo },
                { label: 'Date of Registration', value: lcrDateRegistration, setter: setLcrDateRegistration },
                { label: 'Name of Child', value: affiantName, setter: setAffiantName },
                { label: 'Sex', value: lcrSex, setter: setLcrSex },
                { label: 'Date of Birth', value: lcrBirthDate, setter: setLcrBirthDate },
                { label: 'Place of Birth', value: lcrPlaceBirth, setter: setLcrPlaceBirth },
                { label: 'Name of Mother', value: lcrMotherName, setter: setLcrMotherName },
                { label: 'Citizenship of Mother', value: lcrCitizenshipMother, setter: setLcrCitizenshipMother },
                { label: 'Name of Father', value: lcrFatherName, setter: setLcrFatherName },
                { label: 'Citizenship of Father', value: lcrCitizenshipFather, setter: setLcrCitizenshipFather },
                { label: 'Date of Marriage of Parents', value: lcrDateMarriage, setter: setLcrDateMarriage },
                { label: 'Place of Marriage of Parents', value: lcrPlaceMarriage, setter: setLcrPlaceMarriage },
              ]).map((row, i) => (
                <tr key={i}>
                  <td className="border border-black p-2 font-bold w-1/2">{row.label}</td>
                  <td className="border border-black p-2 text-center uppercase">
                    <input type="text" className="w-full focus:outline-none focus:bg-blue-50 font-bold bg-transparent text-center" value={row.value} onChange={(e) => row.setter(e.target.value)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="mb-12">This certification is issued upon the request of <span className="font-bold">OCRG/OWNER/PARENTS/GUARDIAN</span> for any legal purposes.</p>

        <div className="flex justify-between items-end mt-12">
          <div className="text-center w-64">
            <p className="text-sm mb-4 text-left">Verified by:</p>
            <input type="text" className="border-b border-gray-400 focus:outline-none focus:border-blue-500 font-bold uppercase text-center w-full bg-transparent mb-1" defaultValue="LORELIE L. CANTO" />
            <p className="text-xs">Registration Officer IV</p>
          </div>
          <div className="text-center w-64">
            <input type="text" className="border-b border-gray-400 focus:outline-none focus:border-blue-500 font-bold uppercase text-center w-full bg-transparent mb-1" defaultValue="YUSSIF DON JUSTIN F. MARTIL" />
            <p className="text-xs italic">City Civil Registrar</p>
          </div>
        </div>
      </div>
    )
  }

  const renderSupplementalAffidavit = () => {
    return (
      <div className="bg-white p-12 shadow-2xl max-w-[816px] mx-auto min-h-[1056px] text-gray-900 font-serif print:shadow-none print:p-0 ring-1 ring-gray-200 print:ring-0">
        <div className="flex justify-between items-start mb-8">
          <div className="text-left space-y-1">
            <p className="text-sm font-medium">Republic of the Philippines</p>
            <div className="flex items-baseline gap-1">
              <span className="text-sm">City of</span>
              <input
                type="text"
                className="border-b border-gray-400 focus:outline-none focus:border-blue-500 font-bold uppercase text-sm w-48 bg-transparent transition-colors"
                value={cityOf}
                onChange={(e) => setCityOf(e.target.value)}
                placeholder="CLICK TO TYPE CITY"
              />
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-sm">REG. NO.</span>
              <input
                type="text"
                className="border-b border-gray-400 focus:outline-none focus:border-blue-500 font-bold text-sm w-48 bg-transparent text-right transition-colors"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                placeholder="CLICK TO TYPE REG NO."
              />
            </div>
          </div>
        </div>

        <h2 className="text-center font-bold text-xl mb-1 mt-12 tracking-wide">AFFIDAVIT FOR SUPPLEMENTAL REPORT</h2>
        <p className="text-center text-sm mb-12 italic">{supplementalAffidavitRegisterSubtitle(lcrForm)}</p>

        <div className="text-justify leading-relaxed space-y-8">
          <p>
            I, <input type="text" className="border-b border-gray-400 focus:outline-none focus:border-blue-500 font-bold uppercase px-1 w-64 bg-transparent text-center" value={affiantName} onChange={(e) => setAffiantName(e.target.value)} /> ,
            of legal age, <input type="text" className="border-b border-gray-400 focus:outline-none focus:border-blue-500 font-bold uppercase px-1 w-24 bg-transparent text-center" value={civilStatus} onChange={(e) => setCivilStatus(e.target.value)} /> ,
            with residence and postal address at <input type="text" className="border-b border-gray-400 focus:outline-none focus:border-blue-500 font-bold uppercase px-1 w-full mt-2 bg-transparent text-center" value={address} onChange={(e) => setAddress(e.target.value)} /> ,
            after having been duly sworn in accordance with law, hereby depose and say THAT:
          </p>

          <ol className="list-decimal pl-8 space-y-6">
            <li>
              I am the applicant for the processing of the Supplemental Report of my Certificate of LIVE BIRTH registered in 
              <input type="text" className="border-b border-gray-400 focus:outline-none focus:border-blue-500 font-bold uppercase px-1 w-64 mx-1 bg-transparent text-center" value={registeredIn} onChange={(e) => setRegisteredIn(e.target.value)} /> on 
              <input type="text" className="border-b border-gray-400 focus:outline-none focus:border-blue-500 font-bold uppercase px-1 w-48 mx-1 bg-transparent text-center" value={registeredDate} onChange={(e) => setRegisteredDate(e.target.value)} />.
            </li>
            <li>
              The original copy of <strong className="font-bold underline">my</strong>/his/her Certificate of Live Birth was forwarded to Philippine Statistics Authority (PSA);
            </li>
            <li>
              When a copy of <strong className="font-bold underline">my</strong>/his/her Certificate of Live Birth was secured from PSA/Local Civil Registry Office of <u className="font-bold">ILIGAN CITY</u> it was discovered that there is no entry under the following items:
              <div className="mt-4 font-bold ml-6 space-y-1">
                <p>GEOGRAPHICAL LOCATION:</p>
                <div className="flex items-baseline gap-2">
                  <span>PROVINCE:</span>
                  <input type="text" className="border-b border-gray-400 focus:outline-none focus:border-blue-500 font-bold uppercase px-1 w-64 bg-transparent" value={provinceMissing} onChange={(e) => setProvinceMissing(e.target.value)} />
                </div>
              </div>
            </li>
            <li>
              There was a failure to supply the said item/s due to inadvertence or excusable negligence.
            </li>
            <li>
              The entries to be indicated therein should be the following:
              <div className="mt-4 font-bold ml-6 space-y-1">
                <p>GEOGRAPHICAL LOCATION:</p>
                <div className="flex items-baseline gap-2">
                  <span>PROVINCE:</span>
                  <input type="text" className="border-b border-gray-400 focus:outline-none focus:border-blue-500 font-bold uppercase px-1 w-64 bg-transparent" value={provinceCorrected} onChange={(e) => setProvinceCorrected(e.target.value)} />
                </div>
              </div>
            </li>
            <li>
              I am requesting the concerned authorities to supply the omitted information in <strong className="font-bold underline">my</strong>/his/her Certificate of Live Birth; and
            </li>
            <li>
              This Affidavit for Supplemental Report is voluntarily executed in order to attest to the truthfulness of the foregoing statements for all legal intents and purposes.
            </li>
          </ol>

          <div className="mt-16">
            <p>
              IN WITNESS WHEREOF, I am affixing my signature this <span className="inline-block w-16 border-b border-gray-400"></span> day of <span className="inline-block w-40 border-b border-gray-400"></span> in Iligan City, Philippines.
            </p>
          </div>

          <div className="mt-16 flex flex-col items-center ml-auto w-80">
            <input type="text" className="border-b border-gray-400 focus:outline-none focus:border-blue-500 font-bold uppercase text-center w-full bg-transparent mb-1" value={affiantName} onChange={(e) => setAffiantName(e.target.value)} />
            <span className="text-sm font-bold uppercase tracking-widest">Affiant</span>
          </div>

          <div className="mt-16 pt-8">
            <p className="leading-relaxed text-sm">
              SUBSCRIBED AND SWORN TO BEFORE ME, this <span className="inline-block w-16 border-b border-gray-400"></span> day of <span className="inline-block w-40 border-b border-gray-400"></span>,
              Philippines. I certify that I personally examined the affiant and that he/she voluntarily executed the foregoing affidavit and understood the contents thereof.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gray-50 flex flex-col">
      {!isOutputMode ? (
        <div className="no-print mb-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title} - LCR Form Selection</h1>
            <p className="text-gray-600 mt-1">Select LCR Form and search for client to generate the Supplemental Report.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">LCR Form</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g. 1A, 2A, 3A"
                value={lcrForm}
                onChange={(e) => setLcrForm(e.target.value)}
              />
            </div>

            <div className="space-y-1 relative">
              <label className="block text-sm font-semibold text-gray-700">Client Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Type client name..."
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              />
              {searchFocused && searchResults.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {searchResults.map((result) => (
                    <li
                      key={result.sourceId}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-none transition-colors"
                      onClick={() => handleSelectClient(result)}
                    >
                      <div className="font-medium text-gray-900">{result.childName || result.label}</div>
                      <div className="text-xs text-blue-600 font-semibold">{result.sourceType}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="no-print mb-8 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={() => setIsOutputMode(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Search
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print All Forms
            </button>
          </div>
        </div>
      )}

      <div className="flex-1">
        {selectedClient && isOutputMode ? (
          <div className="space-y-12 pb-12">
            {renderLcrForm()}
            {renderSupplementalAffidavit()}
          </div>
        ) : !isOutputMode ? (
          <div className="no-print bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No client selected</h3>
            <p className="text-gray-500 mt-1 max-w-sm mx-auto">
              Please enter the LCR form type and search for a client to begin filling out the reports.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

