import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { afterUnsavedAcknowledge, useWarnIfUnsaved } from '../../hooks/useWarnIfUnsaved'
import SupplementalTransmittalFieldsEditor from './SupplementalTransmittalFieldsEditor'
import PrintHeaderRow from '../../components/print/PrintHeaderRow'
import {
  getDefaultSupplementalTransmittalFields,
  pickTransmittalStateFromDraft,
} from './lib/supplementalTransmittalDefaults'
import {
  clearWronglyRegisterActive,
  getActiveWronglyRegisterId,
  getWronglyRegisterDraft,
  saveOrUpdateWronglyRegister,
  saveWronglyRegisterDraft,
} from './lib/wronglyRegisterSavedStorage'
import { mergeBirthRegisterPageBookFields, pickBirthRegisterPageBook } from './lib/registerBirthBookPagePick'
import { getSavedAUSFList } from '../ausf/lib/ausfStorage'
import { getSavedCourtDecreeList } from '../courtDecree/lib/courtDecreeStorage'
import { getSavedLegitimationList } from '../legitimation/lib/legitimationStorage'

const defaultWronglyRegisterDraft = {
  ...getDefaultSupplementalTransmittalFields(),
  lcrForm: '1A',
  lcrPage: '',
  lcrBook: '',
  lcrRegistryNo: '',
  lcrDateRegistration: '',
  lcrChildName: '',
  lcrSex: '',
  lcrBirthDate: '',
  lcrPlaceBirth: '',
  lcrMotherName: '',
  lcrMotherCitizenship: '',
  lcrFatherName: '',
  lcrFatherCitizenship: '',
  lcrDateMarriage: '',
  lcrPlaceMarriage: '',
  ocrRequestorName: '',
  ocrVerifiedBy: '',
  ocrVerifiedByTitle: 'Bookbinder II',
  ocrMunicipalRegistrar: '',
  ocrAmountPaid: '',
  ocrORNumber: '',
  ocrDatePaid: '',
  ocrRemarks: '',
  ocrMcrProvince: '',
  ocrMcrMunicipality: '',
  forwardingDate: '',
  forwardingMcrProvince: '',
  forwardingMcrMunicipality: '',
  forwardingRecipientName: '',
  forwardingRecipientTitle: '',
  forwardingRecipientOffice1: '',
  forwardingRecipientOffice2: '',
  forwardingSalutation: 'Dear Sir:',
  forwardingGreeting: 'Greetings!',
  forwardingClosing: 'Very Truly Yours,',
  forwardingSignerName: '',
  forwardingSignerTitle: 'Municipal Civil Registrar',
}

function hasCourtLcrDataForType(data, lcrForm) {
  const d = data || {}
  if (lcrForm === '1A') {
    return Boolean(
      d.lcr1aNameOfChild ||
      d.lcr1aRegistryNumber ||
      d.colbRegistryNo
    )
  }
  if (lcrForm === '2A') {
    return Boolean(
      d.lcr2aNameDeceased ||
      d.lcr2aRegistryNumber ||
      d.lcr2aDateDeath
    )
  }
  if (lcrForm === '3A') {
    return Boolean(
      d.lcr3aHusbandName ||
      d.lcr3aWifeName ||
      d.lcr3aRegistryNumber ||
      d.marriageRegistryNo
    )
  }
  return false
}

export default function WronglyRegisterForm() {
  const navigate = useNavigate()
  const activeSavedId = getActiveWronglyRegisterId()
  const [form, setForm] = useState(() => {
    const loaded = getWronglyRegisterDraft(defaultWronglyRegisterDraft)
    const withTransmittal = { ...loaded, ...pickTransmittalStateFromDraft(loaded) }
    return mergeBirthRegisterPageBookFields(withTransmittal)
  })
  const [activeSection, setActiveSection] = useState('transmittal')
  const [selectedSourceType, setSelectedSourceType] = useState('')
  const [showRecordList, setShowRecordList] = useState(false)

  const [dirtyBaselineTick, setDirtyBaselineTick] = useState(0)
  useEffect(() => {
    const id = setTimeout(() => setDirtyBaselineTick((x) => x + 1), 120)
    return () => clearTimeout(id)
  }, [location.key, activeSavedId])

  const acknowledgeSaved = useWarnIfUnsaved(form, [location.key, activeSavedId, dirtyBaselineTick])

  const allSources = React.useMemo(() => {
    const ausfRows = getSavedAUSFList().map((item) => ({
      sourceId: `ausf_${item.id}`,
      sourceType: 'AUSF',
      formType: 'lcr-form-1a',
      label: item.label || 'AUSF',
      childName: item?.data?.lcr1aNameOfChild || item.label || '',
      data: item.data || {},
    }))

    const courtRows = getSavedCourtDecreeList()
      .map((item) => ({
        sourceId: `court_${item.id}`,
        sourceType: 'Court Decree',
        formType: item.formType || '',
        label: item.label || 'Court Decree',
        childName:
          item?.data?.lcr1aNameOfChild ||
          item?.data?.lcr2aNameDeceased ||
          item?.data?.lcr3aHusbandName ||
          item?.data?.documentOwnerName ||
          item.label ||
          '',
        data: item.data || {},
      }))

    const legitRows = getSavedLegitimationList().map((item) => ({
      sourceId: `legitimation_${item.id}`,
      sourceType: 'Legitimation',
      formType: 'lcr-form-1a',
      label: item.label || 'Legitimation',
      childName:
        item?.data?.lcr1aNameOfChild ||
        [item?.data?.childFirst, item?.data?.childMiddle, item?.data?.childLast].filter(Boolean).join(' ') ||
        item.label ||
        '',
      data: item.data || {},
    }))

    return [...ausfRows, ...courtRows, ...legitRows]
  }, [])

  const filteredSources = React.useMemo(() => {
    if (!selectedSourceType) return []
    const targetLcrType = `lcr-form-${(form.lcrForm || '1A').toLowerCase()}`
    const targetAnnotType = `annotation-form-${(form.lcrForm || '1A').toLowerCase()}`
    return allSources.filter((s) => {
      const typeMatch = s.sourceType === selectedSourceType
      const formMatch =
        s.formType === targetLcrType ||
        s.formType === targetAnnotType ||
        (s.sourceType === 'Court Decree' && hasCourtLcrDataForType(s.data, form.lcrForm)) ||
        // AUSF + Legitimation are treated as LCR 1A source set.
        ((s.sourceType === 'AUSF' || s.sourceType === 'Legitimation') && form.lcrForm === '1A')
      return typeMatch && formMatch
    })
  }, [selectedSourceType, allSources, form.lcrForm])

  const handleSelectClient = (client) => {
    const d = client.data || {}
    const selectedLcr = String(form.lcrForm || '1A')
    const is2A = selectedLcr === '2A' || client.formType === 'lcr-form-2a' || client.formType === 'annotation-form-2a'
    const is3A = selectedLcr === '3A' || client.formType === 'lcr-form-3a' || client.formType === 'annotation-form-3a'

    if (is2A) {
      const { page, book } = pickBirthRegisterPageBook(d)
      onPatch({
        lcrChildName: d.lcr2aNameDeceased || '',
        lcrRegistryNo: d.lcr2aRegistryNumber || '',
        lcrSex: d.lcr2aSex || '',
        lcrBirthDate: d.lcr2aDateDeath || '',
        lcrPlaceBirth: d.lcr2aPlaceDeath || '',
        lcrDateRegistration: d.lcr2aDateRegistration || '',
        lcrMotherName: '',
        lcrFatherName: '',
        lcrPage: page,
        lcrBook: book,
        colbPageNumber: page,
        colbBookNumber: book,
        colbPageNo: page,
        colbBookNo: book,
      })
    } else if (is3A) {
      const { page, book } = pickBirthRegisterPageBook(d)
      const h = (d.lcr3aHusbandName || '').trim()
      const w = (d.lcr3aWifeName || '').trim()
      onPatch({
        lcrChildName: h && w ? `${h} & ${w}` : h || w || '',
        lcrRegistryNo: d.lcr3aRegistryNumber || '',
        lcrDateRegistration: d.lcr3aDateRegistration || '',
        lcrBirthDate: d.lcr3aDateMarriage || '',
        lcrPlaceBirth: d.lcr3aPlaceMarriage || '',
        lcrMotherName: h,
        lcrFatherName: w,
        lcrSex: '',
        lcrPage: page,
        lcrBook: book,
        colbPageNumber: page,
        colbBookNumber: book,
        colbPageNo: page,
        colbBookNo: book,
      })
    } else {
      const { page, book } = pickBirthRegisterPageBook(d)
      onPatch({
        lcrChildName: client.childName || '',
        lcrRegistryNo: d.lcr1aRegistryNumber || d.colbRegistryNo || '',
        lcrPage: page,
        lcrBook: book,
        colbPageNumber: page,
        colbBookNumber: book,
        colbPageNo: page,
        colbBookNo: book,
        lcrSex: d.sex || d.lcr1aSex || '',
        lcrBirthDate: d.dateOfBirth || d.lcr1aDateOfBirth || '',
        lcrPlaceBirth: d.placeOfBirth || d.lcr1aPlaceOfBirth || '',
        lcrMotherName: d.motherName || d.lcr1aNameOfMother || '',
        lcrMotherCitizenship: d.motherCitizenship || d.lcr1aMotherCitizenship || '',
        lcrFatherName: d.fatherName || d.lcr1aNameOfFather || '',
        lcrFatherCitizenship: d.fatherCitizenship || d.lcr1aFatherCitizenship || '',
        lcrDateRegistration: d.lcr1aDateRegistration || '',
        lcrDateMarriage: d.dateOfMarriage || d.lcr1aDateMarriageParents || '',
        lcrPlaceMarriage: d.placeOfMarriage || d.lcr1aPlaceMarriageParents || '',
      })
    }
    setShowRecordList(false)
  }

  const onPatch = (patch) => {
    setForm((prev) => {
      const next = { ...prev, ...patch }
      saveWronglyRegisterDraft(next)
      return next
    })
  }

  const handleSave = () => {
    saveWronglyRegisterDraft(form)
    saveOrUpdateWronglyRegister(form)
    afterUnsavedAcknowledge(acknowledgeSaved, () => navigate('/legal-instrument/wrongly-register/print'))
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset this form to a new blank entry? All unsaved typing will be cleared.')) {
      clearWronglyRegisterActive()
      setForm(defaultWronglyRegisterDraft)
      saveWronglyRegisterDraft(defaultWronglyRegisterDraft)
    }
  }

  return (
    <div className="supplemental-form-page no-print">
      <div className="legitimation-form-page__card">
        <header className="legitimation-form-page__header no-print">
          <h1>Wrongly Register Automated Data Entry</h1>
          <p>Unified Legal Status Automated Data Entry System — Iligan City</p>
        </header>

        <div className="legitimation-form-page__body supplemental-form-page-content">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <p className="text-sm text-gray-600">
                Fill out the transmittal letter for the wrongly registered document.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                The layout below matches the Supplemental transmittal editor for consistency.
              </p>
            </div>
            {activeSavedId ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm font-bold shadow-sm animate-in fade-in zoom-in duration-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Editing Saved File
              </span>
            ) : null}
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-6 flex flex-col gap-3">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 px-1">Form Sections</p>

              <button
                type="button"
                onClick={() => setActiveSection('transmittal')}
                className={`w-full text-left rounded-xl border-2 px-4 py-4 shadow-sm transition-all duration-200 ${activeSection === 'transmittal'
                  ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500/20'
                  : 'border-transparent bg-white hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeSection === 'transmittal' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  <div>
                    <span className={`block text-sm font-bold ${activeSection === 'transmittal' ? 'text-amber-800' : 'text-gray-900'}`}>
                      Transmittal Letter
                    </span>
                    <span className="block text-xs text-gray-600 mt-0.5 leading-snug">
                      CCR / Transmittal details
                    </span>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('ocr-form-1a')}
                className={`w-full text-left rounded-xl border-2 px-4 py-4 shadow-sm transition-all duration-200 ${activeSection === 'ocr-form-1a'
                  ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500/20'
                  : 'border-transparent bg-white hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeSection === 'ocr-form-1a' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                  </div>
                  <div>
                    <span className={`block text-sm font-bold ${activeSection === 'ocr-form-1a' ? 'text-indigo-800' : 'text-gray-900'}`}>
                      OCR Form No. 1A
                    </span>
                    <span className="block text-xs text-gray-600 mt-0.5 leading-snug">
                      Birth available certificate
                    </span>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('forwarding-letter')}
                className={`w-full text-left rounded-xl border-2 px-4 py-4 shadow-sm transition-all duration-200 ${activeSection === 'forwarding-letter'
                  ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/20'
                  : 'border-transparent bg-white hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeSection === 'forwarding-letter' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>
                  </div>
                  <div>
                    <span className={`block text-sm font-bold ${activeSection === 'forwarding-letter' ? 'text-emerald-800' : 'text-gray-900'}`}>
                      Forwarding Letter
                    </span>
                    <span className="block text-xs text-gray-600 mt-0.5 leading-snug">
                      Official letter output
                    </span>
                  </div>
                </div>
              </button>
            </aside>

            <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-1">
                  <div className="space-y-6">
                    {activeSection === 'transmittal' ? (
                      <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 shadow-sm">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                              1. Select Module
                            </h3>
                            <div className="flex gap-2">
                              {['AUSF', 'Court Decree', 'Legitimation'].map(m => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => {
                                    setSelectedSourceType(m)
                                    if (m === 'AUSF' || m === 'Legitimation') onPatch({ lcrForm: '1A' })
                                    setShowRecordList(false)
                                  }}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedSourceType === m
                                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-500/20'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>

                          {selectedSourceType && (
                            <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
                              <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                2. Choose LCR Form
                              </h3>
                              <div className="flex gap-2">
                                {['1A', '2A', '3A'].map(f => {
                                  const isHidden = (selectedSourceType === 'AUSF' || selectedSourceType === 'Legitimation') && f !== '1A'
                                  if (isHidden) return null
                                  return (
                                    <button
                                      key={f}
                                      type="button"
                                      onClick={() => {
                                        onPatch({ lcrForm: f })
                                        setShowRecordList(true)
                                      }}
                                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${form.lcrForm === f
                                        ? 'bg-amber-500 text-white shadow-md'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                      LCR {f} {f === '1A' ? '(Birth)' : f === '2A' ? '(Death)' : '(Marriage)'}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {selectedSourceType && form.lcrForm && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="space-y-2">
                                <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                  3. Pick {selectedSourceType} Record
                                </h3>
                                <div className="relative">
                                  <div className="relative flex items-center">
                                    <input
                                      type="text"
                                      className="w-full border border-blue-200 rounded-xl px-4 py-3 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold uppercase text-gray-800 pr-10"
                                      placeholder={`Type name or select ${selectedSourceType} Record...`}
                                      value={form.lcrChildName || ''}
                                      onChange={(e) => onPatch({ lcrChildName: e.target.value })}
                                      onFocus={() => setShowRecordList(true)}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowRecordList(!showRecordList)}
                                      className="absolute right-3 p-1 hover:bg-blue-50 rounded-lg transition-colors text-blue-400"
                                    >
                                      <svg className={`w-5 h-5 transition-transform ${showRecordList ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </button>
                                  </div>

                                  {showRecordList && (
                                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                                      <div className="max-h-60 overflow-y-auto p-1">
                                        {filteredSources.length > 0 ? (
                                          filteredSources.map((result) => (
                                            <button
                                              key={result.sourceId}
                                              type="button"
                                              className="w-full px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-none transition-colors text-left flex flex-col gap-0.5"
                                              onClick={() => handleSelectClient(result)}
                                            >
                                              <div className="font-bold text-gray-900 text-sm">{result.childName || result.label}</div>
                                              <div className="text-[10px] text-gray-500">
                                                Registry: {result.data?.lcr1aRegistryNumber || result.data?.colbRegistryNo || 'N/A'}
                                              </div>
                                            </button>
                                          ))
                                        ) : (
                                          <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                            No saved records found for {selectedSourceType}.
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-xl border border-blue-100 shadow-sm">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                                  Page Number
                                  <input
                                    type="text"
                                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800"
                                    value={form.lcrPage || ''}
                                    onChange={(e) => {
                                      const v = e.target.value
                                      onPatch({ lcrPage: v, colbPageNumber: v, colbPageNo: v })
                                    }}
                                    placeholder="e.g. 61"
                                  />
                                </label>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                                  Book Number
                                  <input
                                    type="text"
                                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800"
                                    value={form.lcrBook || ''}
                                    onChange={(e) => {
                                      const v = e.target.value
                                      onPatch({ lcrBook: v, colbBookNumber: v, colbBookNo: v })
                                    }}
                                    placeholder="e.g. 25"
                                  />
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {activeSection === 'transmittal' ? (
                      <SupplementalTransmittalFieldsEditor
                        data={form}
                        onPatch={onPatch}
                        inputClass="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        showRecipientCity={false}
                      />
                    ) : null}

                    {activeSection === 'ocr-form-1a' ? (
                      <section className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-indigo-900">OCR Form No. 1A (Birth Available)</h3>
                          <span className="text-[11px] text-indigo-700 font-semibold uppercase tracking-wide">Based on provided layout</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="text-xs font-semibold text-gray-700">Date
                            <input className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm" type="date" value={form.transmittalDate || ''} onChange={(e) => onPatch({ transmittalDate: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">LCR Registry Number
                            <input className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm uppercase" value={form.lcrRegistryNo || ''} onChange={(e) => onPatch({ lcrRegistryNo: e.target.value })} placeholder="e.g. 461" />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Date of Registration
                            <input className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm uppercase" value={form.lcrDateRegistration || ''} onChange={(e) => onPatch({ lcrDateRegistration: e.target.value })} placeholder="e.g. OCTOBER 10, 1964" />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Name of Child
                            <input className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm uppercase" value={form.lcrChildName || ''} onChange={(e) => onPatch({ lcrChildName: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Sex
                            <input className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm uppercase" value={form.lcrSex || ''} onChange={(e) => onPatch({ lcrSex: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Date of Birth
                            <input className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm uppercase" value={form.lcrBirthDate || ''} onChange={(e) => onPatch({ lcrBirthDate: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700 md:col-span-2">Place of Birth
                            <input className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm uppercase" value={form.lcrPlaceBirth || ''} onChange={(e) => onPatch({ lcrPlaceBirth: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Name of Mother
                            <input className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm uppercase" value={form.lcrMotherName || ''} onChange={(e) => onPatch({ lcrMotherName: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Citizenship of Mother
                            <input className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm uppercase" value={form.lcrMotherCitizenship || ''} onChange={(e) => onPatch({ lcrMotherCitizenship: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Name of Father
                            <input className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm uppercase" value={form.lcrFatherName || ''} onChange={(e) => onPatch({ lcrFatherName: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Citizenship of Father
                            <input className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm uppercase" value={form.lcrFatherCitizenship || ''} onChange={(e) => onPatch({ lcrFatherCitizenship: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Date of Marriage of Parents
                            <input className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm uppercase" value={form.lcrDateMarriage || ''} onChange={(e) => onPatch({ lcrDateMarriage: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Place of Marriage of Parents
                            <input className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm uppercase" value={form.lcrPlaceMarriage || ''} onChange={(e) => onPatch({ lcrPlaceMarriage: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Register of Births — Page
                            <input
                              className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm uppercase"
                              value={form.lcrPage || ''}
                              onChange={(e) => {
                                const v = String(e.target.value ?? '').trim()
                                onPatch({ lcrPage: v, colbPageNumber: v, colbPageNo: v })
                              }}
                              placeholder="from pulled COLB"
                            />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Register of Births — Book number
                            <input
                              className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm uppercase"
                              value={form.lcrBook || ''}
                              onChange={(e) => {
                                const v = String(e.target.value ?? '').trim()
                                onPatch({ lcrBook: v, colbBookNumber: v, colbBookNo: v })
                              }}
                              placeholder="from pulled COLB"
                            />
                          </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="text-xs font-semibold text-gray-700">Requestor / Office
                            <input className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm uppercase" value={form.ocrRequestorName || ''} onChange={(e) => onPatch({ ocrRequestorName: e.target.value })} placeholder="e.g. CITY CIVIL REGISTRAR OFFICE" />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Verified By
                            <input className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm uppercase" value={form.ocrVerifiedBy || ''} onChange={(e) => onPatch({ ocrVerifiedBy: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Verified By Title
                            <input className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm" value={form.ocrVerifiedByTitle || ''} onChange={(e) => onPatch({ ocrVerifiedByTitle: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Municipal Civil Registrar
                            <input className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm uppercase" value={form.ocrMunicipalRegistrar || ''} onChange={(e) => onPatch({ ocrMunicipalRegistrar: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Amount Paid
                            <input className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm" value={form.ocrAmountPaid || ''} onChange={(e) => onPatch({ ocrAmountPaid: e.target.value })} placeholder="e.g. Php 175.00" />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">O.R Number
                            <input className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm" value={form.ocrORNumber || ''} onChange={(e) => onPatch({ ocrORNumber: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Date Paid
                            <input className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm" value={form.ocrDatePaid || ''} onChange={(e) => onPatch({ ocrDatePaid: e.target.value })} placeholder="MM/DD/YYYY" />
                          </label>
                          <label className="text-xs font-semibold text-gray-700 md:col-span-2">Remarks
                            <textarea className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm min-h-24" value={form.ocrRemarks || ''} onChange={(e) => onPatch({ ocrRemarks: e.target.value })} placeholder="Enter remarks..." />
                          </label>
                        </div>
                      </section>
                    ) : null}

                    {activeSection === 'forwarding-letter' ? (
                      <section className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-emerald-900">Forwarding Letter</h3>
                          <span className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wide">Based on provided layout</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="text-xs font-semibold text-gray-700">Date
                            <input className="mt-1 w-full border border-emerald-200 rounded-lg px-3 py-2 text-sm" type="date" value={form.forwardingDate || ''} onChange={(e) => onPatch({ forwardingDate: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Recipient Name
                            <input className="mt-1 w-full border border-emerald-200 rounded-lg px-3 py-2 text-sm uppercase" value={form.forwardingRecipientName || ''} onChange={(e) => onPatch({ forwardingRecipientName: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Recipient Title
                            <input className="mt-1 w-full border border-emerald-200 rounded-lg px-3 py-2 text-sm" value={form.forwardingRecipientTitle || ''} onChange={(e) => onPatch({ forwardingRecipientTitle: e.target.value })} placeholder="e.g. City Civil Registrar" />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Office Line 1
                            <input className="mt-1 w-full border border-emerald-200 rounded-lg px-3 py-2 text-sm" value={form.forwardingRecipientOffice1 || ''} onChange={(e) => onPatch({ forwardingRecipientOffice1: e.target.value })} placeholder="e.g. Office of the City Civil Registrar" />
                          </label>
                          <label className="text-xs font-semibold text-gray-700 md:col-span-2">Office Line 2
                            <input className="mt-1 w-full border border-emerald-200 rounded-lg px-3 py-2 text-sm" value={form.forwardingRecipientOffice2 || ''} onChange={(e) => onPatch({ forwardingRecipientOffice2: e.target.value })} placeholder="e.g. Iligan City, Lanao del Norte" />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Salutation
                            <input className="mt-1 w-full border border-emerald-200 rounded-lg px-3 py-2 text-sm" value={form.forwardingSalutation || ''} onChange={(e) => onPatch({ forwardingSalutation: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Greeting
                            <input className="mt-1 w-full border border-emerald-200 rounded-lg px-3 py-2 text-sm" value={form.forwardingGreeting || ''} onChange={(e) => onPatch({ forwardingGreeting: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Closing
                            <input className="mt-1 w-full border border-emerald-200 rounded-lg px-3 py-2 text-sm" value={form.forwardingClosing || ''} onChange={(e) => onPatch({ forwardingClosing: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Signer Name
                            <input className="mt-1 w-full border border-emerald-200 rounded-lg px-3 py-2 text-sm uppercase" value={form.forwardingSignerName || ''} onChange={(e) => onPatch({ forwardingSignerName: e.target.value })} />
                          </label>
                          <label className="text-xs font-semibold text-gray-700">Signer Title
                            <input className="mt-1 w-full border border-emerald-200 rounded-lg px-3 py-2 text-sm" value={form.forwardingSignerTitle || ''} onChange={(e) => onPatch({ forwardingSignerTitle: e.target.value })} />
                          </label>
                        </div>
                      </section>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="ausf-form-page__actions mt-10 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                className="ausf-form-page__btn ausf-form-page__btn--primary flex items-center gap-2 px-6 py-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Save & View Output
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="ausf-form-page__btn ausf-form-page__btn--secondary px-6 py-3"
              >
                Reset to new
              </button>
            </div>

            <p className="text-[11px] text-gray-400 italic">
              * Ensure all mandatory fields are filled for correct PDF output.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
