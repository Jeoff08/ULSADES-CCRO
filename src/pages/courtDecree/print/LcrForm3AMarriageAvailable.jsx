import React, { useEffect, useState } from 'react'
import { formatDateCert, parseDdMmYyyyToDate, computeAgeFullYears } from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'
import { buildLcr3aTableDisplay } from '../lib/lcr3aTable'
import { resolveCourtDecreeLcrPrintCcr } from '../lib/courtDecreePrintCcr'
import LcrRegistrationDateInputs from '../../../components/lcr/LcrRegistrationDateInputs'
import {
  LCR_REGISTRATION_DAY_UI,
  LCR_REGISTRATION_MONTH_UI,
  LCR_REGISTRATION_YEAR_UI,
  LCR_3A_HUSBAND_DOB_DAY_UI,
  LCR_3A_HUSBAND_DOB_MONTH_UI,
  LCR_3A_HUSBAND_DOB_YEAR_UI,
  LCR_3A_WIFE_DOB_DAY_UI,
  LCR_3A_WIFE_DOB_MONTH_UI,
  LCR_3A_WIFE_DOB_YEAR_UI,
  LCR_3A_MARRIAGE_DAY_UI,
  LCR_3A_MARRIAGE_MONTH_UI,
  LCR_3A_MARRIAGE_YEAR_UI,
} from '../../../lib/lcrRegistrationUiKeys'

function cellEditText(displayed) {
  const s = String(displayed ?? '').trim()
  if (!s || s === '—') return ''
  return s
}

const LCR_3A_EDITABLE_PAIRS = [
  { label: 'Name:', hk: 'husbandName', wk: 'wifeName', hp: (v) => ({ lcr3aHusbandName: v }), wp: (v) => ({ lcr3aWifeName: v }) },
  { label: 'Date of Birth/Age:', hk: 'husbandDobAge', wk: 'wifeDobAge', hp: (v) => ({ lcr3aHusbandDobAge: v }), wp: (v) => ({ lcr3aWifeDobAge: v }) },
  { label: 'Citizenship:', hk: 'husbandCitizenship', wk: 'wifeCitizenship', hp: (v) => ({ lcr3aHusbandCitizenship: v }), wp: (v) => ({ lcr3aWifeCitizenship: v }) },
  { label: 'Civil Status:', hk: 'husbandCivilStatus', wk: 'wifeCivilStatus', hp: (v) => ({ lcr3aHusbandCivilStatus: v }), wp: (v) => ({ lcr3aWifeCivilStatus: v }) },
  { label: 'Mother:', hk: 'husbandMother', wk: 'wifeMother', hp: (v) => ({ lcr3aHusbandMother: v }), wp: (v) => ({ lcr3aWifeMother: v }) },
  { label: 'Father:', hk: 'husbandFather', wk: 'wifeFather', hp: (v) => ({ lcr3aHusbandFather: v }), wp: (v) => ({ lcr3aWifeFather: v }) },
]

const LCR_3A_EDITABLE_FULL = [
  { k: 'registry', label: 'Registry Number', patch: (v) => ({ lcr3aRegistryNumber: v, marriageRegistryNo: v }) },
  { k: 'dateRegistration', label: 'Date of Registration', patch: (v) => ({ lcr3aDateRegistration: v }) },
  { k: 'dateMarriage', label: 'Date of Marriage', patch: (v) => ({ lcr3aDateMarriage: v, dateOfMarriage: v }) },
  { k: 'placeMarriage', label: 'Place of Marriage', patch: (v) => ({ lcr3aPlaceMarriage: v }) },
]

/** LCR Form No. 3A (Marriage-Available). Full print; table via buildLcr3aTableDisplay. */
export default function LcrForm3AMarriageAvailable({ data, editableTable = false, onDataChange }) {
  const t = buildLcr3aTableDisplay(data)
  const [editableRemarks, setEditableRemarks] = useState(data?.remarks || '')

  const patchData = (partial) => {
    onDataChange?.({ ...data, ...partial })
  }

  useEffect(() => {
    setEditableRemarks(data?.remarks || '')
  }, [data?.remarks])
  const colbPage = data.colbPageNumber ?? data.colbPageNo
  const colbBook = data.colbBookNumber ?? data.colbBookNo
  const formDate = (() => {
    const raw = data.certificateIssuanceDate
    const p = parseDdMmYyyyToDate(raw)
    if (p) return formatDateCert(p.toISOString().slice(0, 10))
    return formatDateCert(raw) || formatDateCert(new Date())
  })()
  const regOfficer = data.certificateSignatoryName || 'SHIRLY L. DEMECILLO'
  const regOfficerTitle = data.certificateSignatoryTitle || 'LCRO - Staff'
  const { row: ccrRow } = resolveCourtDecreeLcrPrintCcr(data, 'lcr-form-3a')
  const ccrName = ccrRow.name
  const ccrTitle = ccrRow.title
  const cell = 'py-1 px-2 border border-black text-center font-bold text-sm align-top'

  return (
    <div className="ausf-doc print-doc print-doc-lcr-3a court-decree-lcr-form bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-2 flex flex-col w-full">
      <div className="court-decree-lcr-header shrink-0">
        <header className="print-doc-header">
          <PrintHeaderRow />
          <hr className="border-black my-3" />
        </header>
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="font-bold text-base">LCR Form No. 3A</p>
            <p className="text-sm">(Marriage-Available)</p>
          </div>
          <p className="text-sm font-bold min-w-[8rem] text-right">{formDate}</p>
        </div>
      </div>
      <div className="court-decree-lcr-body-wrap flex-1 min-h-0 flex flex-col">
        <div className="court-decree-lcr-body-scaled flex flex-col h-full">
          <p className="font-bold mb-1 pl-8">TO WHOM IT MAY CONCERN:</p>
          <p className="mb-2 text-left court-decree-lcr-body">
            <span className="font-bold">WE CERTIFY</span> that, among others, the following facts of marriage appear in our Register of Marriages on Page{' '}
            <span className="inline-block border-b border-black px-1 min-w-[2rem] text-center font-bold">{colbPage ?? ''}</span> of Book number{' '}
            <span className="inline-block border-b border-black px-1 min-w-[3rem] text-center font-bold">{colbBook ?? ''}</span>.
          </p>
          <table className="w-full border-collapse text-sm mt-4 mb-0 border border-black table-fixed court-decree-lcr-table">
            <colgroup>
              <col style={{ width: '28%' }} />
              <col style={{ width: '36%' }} />
              <col style={{ width: '36%' }} />
            </colgroup>
            <thead>
              <tr>
                <td className="py-1 px-2 border border-black font-bold align-top" />
                <td className="py-1 px-2 border border-black font-bold text-center bg-gray-800 text-white">HUSBAND</td>
                <td className="py-1 px-2 border border-black font-bold text-center bg-gray-800 text-white">WIFE</td>
              </tr>
            </thead>
            <tbody>
              {editableTable && onDataChange ? (
                <>
                  {LCR_3A_EDITABLE_PAIRS.map((row, idx) => {
                    if (idx === 1) {
                      return (
                        <tr key="dob-age">
                          <td className="py-1 px-2 border border-black font-medium align-top">{row.label}</td>
                          <td className={cell}>
                            <LcrRegistrationDateInputs
                              valueRaw={data.husbandDateOfBirth}
                              savedDayUi={data.lcr3aHusbandDobDayUi}
                              savedMonthUi={data.lcr3aHusbandDobMonthUi}
                              savedYearUi={data.lcr3aHusbandDobYearUi}
                              dayUiKey={LCR_3A_HUSBAND_DOB_DAY_UI}
                              monthUiKey={LCR_3A_HUSBAND_DOB_MONTH_UI}
                              yearUiKey={LCR_3A_HUSBAND_DOB_YEAR_UI}
                              ariaLabelPrefix="Husband date of birth"
                              onPersist={(payload) => {
                                const d = payload[LCR_3A_HUSBAND_DOB_DAY_UI]
                                const m = payload[LCR_3A_HUSBAND_DOB_MONTH_UI]
                                const y = payload[LCR_3A_HUSBAND_DOB_YEAR_UI]
                                const iso = payload.iso
                                const patch = {
                                  [LCR_3A_HUSBAND_DOB_DAY_UI]: d,
                                  [LCR_3A_HUSBAND_DOB_MONTH_UI]: m,
                                  [LCR_3A_HUSBAND_DOB_YEAR_UI]: y,
                                }
                                if (iso) {
                                  patch.husbandDateOfBirth = iso
                                  const age = computeAgeFullYears(iso)
                                  if (age != null) patch.husbandAge = String(age)
                                  patch[LCR_3A_HUSBAND_DOB_DAY_UI] = ''
                                  patch[LCR_3A_HUSBAND_DOB_MONTH_UI] = ''
                                  patch[LCR_3A_HUSBAND_DOB_YEAR_UI] = ''
                                  patch.lcr3aHusbandDobAge = ''
                                } else if (!d && !m && !y) {
                                  patch.husbandDateOfBirth = ''
                                  patch.husbandAge = ''
                                }
                                patchData(patch)
                              }}
                              printDisplay={t.husbandDobAge}
                            />
                          </td>
                          <td className={cell}>
                            <LcrRegistrationDateInputs
                              valueRaw={data.wifeDateOfBirth}
                              savedDayUi={data.lcr3aWifeDobDayUi}
                              savedMonthUi={data.lcr3aWifeDobMonthUi}
                              savedYearUi={data.lcr3aWifeDobYearUi}
                              dayUiKey={LCR_3A_WIFE_DOB_DAY_UI}
                              monthUiKey={LCR_3A_WIFE_DOB_MONTH_UI}
                              yearUiKey={LCR_3A_WIFE_DOB_YEAR_UI}
                              ariaLabelPrefix="Wife date of birth"
                              onPersist={(payload) => {
                                const d = payload[LCR_3A_WIFE_DOB_DAY_UI]
                                const m = payload[LCR_3A_WIFE_DOB_MONTH_UI]
                                const y = payload[LCR_3A_WIFE_DOB_YEAR_UI]
                                const iso = payload.iso
                                const patch = {
                                  [LCR_3A_WIFE_DOB_DAY_UI]: d,
                                  [LCR_3A_WIFE_DOB_MONTH_UI]: m,
                                  [LCR_3A_WIFE_DOB_YEAR_UI]: y,
                                }
                                if (iso) {
                                  patch.wifeDateOfBirth = iso
                                  const age = computeAgeFullYears(iso)
                                  if (age != null) patch.wifeAge = String(age)
                                  patch[LCR_3A_WIFE_DOB_DAY_UI] = ''
                                  patch[LCR_3A_WIFE_DOB_MONTH_UI] = ''
                                  patch[LCR_3A_WIFE_DOB_YEAR_UI] = ''
                                  patch.lcr3aWifeDobAge = ''
                                } else if (!d && !m && !y) {
                                  patch.wifeDateOfBirth = ''
                                  patch.wifeAge = ''
                                }
                                patchData(patch)
                              }}
                              printDisplay={t.wifeDobAge}
                            />
                          </td>
                        </tr>
                      )
                    }
                    return (
                      <tr key={idx}>
                        <td className="py-1 px-2 border border-black font-medium align-top">{row.label}</td>
                        <td className={`${cell} uppercase`}>
                          <input
                            type="text"
                            className="no-print w-full min-w-0 text-center font-bold border-0 border-b border-dashed border-gray-400 bg-transparent focus:outline-none focus:border-[var(--primary-blue)] px-1"
                            value={cellEditText(t[row.hk])}
                            onChange={(e) => patchData(row.hp(e.target.value))}
                          />
                          <span className="hidden print:inline">{t[row.hk]}</span>
                        </td>
                        <td className={`${cell} uppercase`}>
                          <input
                            type="text"
                            className="no-print w-full min-w-0 text-center font-bold border-0 border-b border-dashed border-gray-400 bg-transparent focus:outline-none focus:border-[var(--primary-blue)] px-1"
                            value={cellEditText(t[row.wk])}
                            onChange={(e) => patchData(row.wp(e.target.value))}
                          />
                          <span className="hidden print:inline">{t[row.wk]}</span>
                        </td>
                      </tr>
                    )
                  })}
                  {LCR_3A_EDITABLE_FULL.flatMap((row) => {
                    if (row.k === 'dateRegistration') {
                      return [
                        <tr key="dateRegistration">
                          <td className="py-1 px-2 border border-black font-medium align-top">{row.label}</td>
                          <td className={cell} colSpan={2}>
                            <LcrRegistrationDateInputs
                              valueRaw={
                                data.lcr3aDateRegistration ||
                                data.marriageDateOfRegistration ||
                                data.colbRegDate
                              }
                              savedDayUi={data.lcrRegistrationDayUi}
                              savedMonthUi={data.lcrRegistrationMonthUi}
                              savedYearUi={data.lcrRegistrationYearUi}
                              onPersist={(payload) => {
                                const d = payload[LCR_REGISTRATION_DAY_UI]
                                const m = payload[LCR_REGISTRATION_MONTH_UI]
                                const y = payload[LCR_REGISTRATION_YEAR_UI]
                                const iso = payload.iso
                                const patch = {
                                  [LCR_REGISTRATION_DAY_UI]: d,
                                  [LCR_REGISTRATION_MONTH_UI]: m,
                                  [LCR_REGISTRATION_YEAR_UI]: y,
                                }
                                if (iso) {
                                  patch.lcr3aDateRegistration = iso
                                  patch.marriageDateOfRegistration = iso
                                  patch.colbRegDate = iso
                                  patch[LCR_REGISTRATION_DAY_UI] = ''
                                  patch[LCR_REGISTRATION_MONTH_UI] = ''
                                  patch[LCR_REGISTRATION_YEAR_UI] = ''
                                } else if (!d && !m && !y) {
                                  patch.lcr3aDateRegistration = ''
                                  patch.marriageDateOfRegistration = ''
                                  patch.colbRegDate = ''
                                }
                                patchData(patch)
                              }}
                              printDisplay={t.dateRegistration}
                            />
                          </td>
                        </tr>,
                      ]
                    }
                    if (row.k === 'dateMarriage') {
                      return [
                        <tr key="dateMarriage">
                          <td className="py-1 px-2 border border-black font-medium align-top">{row.label}</td>
                          <td className={cell} colSpan={2}>
                            <LcrRegistrationDateInputs
                              valueRaw={data.lcr3aDateMarriage || data.dateOfMarriage}
                              savedDayUi={data.lcr3aMarriageDayUi}
                              savedMonthUi={data.lcr3aMarriageMonthUi}
                              savedYearUi={data.lcr3aMarriageYearUi}
                              dayUiKey={LCR_3A_MARRIAGE_DAY_UI}
                              monthUiKey={LCR_3A_MARRIAGE_MONTH_UI}
                              yearUiKey={LCR_3A_MARRIAGE_YEAR_UI}
                              ariaLabelPrefix="Date of marriage"
                              onPersist={(payload) => {
                                const d = payload[LCR_3A_MARRIAGE_DAY_UI]
                                const m = payload[LCR_3A_MARRIAGE_MONTH_UI]
                                const y = payload[LCR_3A_MARRIAGE_YEAR_UI]
                                const iso = payload.iso
                                const patch = {
                                  [LCR_3A_MARRIAGE_DAY_UI]: d,
                                  [LCR_3A_MARRIAGE_MONTH_UI]: m,
                                  [LCR_3A_MARRIAGE_YEAR_UI]: y,
                                }
                                if (iso) {
                                  patch.lcr3aDateMarriage = iso
                                  patch.dateOfMarriage = iso
                                  patch[LCR_3A_MARRIAGE_DAY_UI] = ''
                                  patch[LCR_3A_MARRIAGE_MONTH_UI] = ''
                                  patch[LCR_3A_MARRIAGE_YEAR_UI] = ''
                                } else if (!d && !m && !y) {
                                  patch.lcr3aDateMarriage = ''
                                  patch.dateOfMarriage = ''
                                }
                                patchData(patch)
                              }}
                              printDisplay={t.dateMarriage}
                            />
                          </td>
                        </tr>,
                      ]
                    }
                    return [
                      <tr key={row.k}>
                        <td className="py-1 px-2 border border-black font-medium align-top">{row.label}</td>
                        <td className={`${cell} uppercase`} colSpan={2}>
                          <input
                            type="text"
                            className="no-print w-full min-w-0 text-center font-bold border-0 border-b border-dashed border-gray-400 bg-transparent focus:outline-none focus:border-[var(--primary-blue)] px-1"
                            value={cellEditText(t[row.k])}
                            onChange={(e) => patchData(row.patch(e.target.value))}
                          />
                          <span className="hidden print:inline">{t[row.k]}</span>
                        </td>
                      </tr>,
                    ]
                  })}
                </>
              ) : (
                <>
                  <tr>
                    <td className="py-1 px-2 border border-black font-medium align-top">Name:</td>
                    <td className={`${cell} uppercase`}>{t.husbandName}</td>
                    <td className={`${cell} uppercase`}>{t.wifeName}</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 border border-black font-medium align-top">Date of Birth/Age:</td>
                    <td className={cell}>{t.husbandDobAge}</td>
                    <td className={cell}>{t.wifeDobAge}</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 border border-black font-medium align-top">Citizenship:</td>
                    <td className={`${cell} uppercase`}>{t.husbandCitizenship}</td>
                    <td className={`${cell} uppercase`}>{t.wifeCitizenship}</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 border border-black font-medium align-top">Civil Status:</td>
                    <td className={`${cell} uppercase`}>{t.husbandCivilStatus}</td>
                    <td className={`${cell} uppercase`}>{t.wifeCivilStatus}</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 border border-black font-medium align-top">Mother:</td>
                    <td className={`${cell} uppercase`}>{t.husbandMother}</td>
                    <td className={`${cell} uppercase`}>{t.wifeMother}</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 border border-black font-medium align-top">Father:</td>
                    <td className={`${cell} uppercase`}>{t.husbandFather}</td>
                    <td className={`${cell} uppercase`}>{t.wifeFather}</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 border border-black font-medium align-top">Registry Number</td>
                    <td className={`${cell} uppercase`} colSpan={2}>
                      {t.registry}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 border border-black font-medium align-top leading-tight">
                      Date of
                      <br />
                      Registration
                    </td>
                    <td className={cell} colSpan={2}>
                      {t.dateRegistration}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 border border-black font-medium align-top">Date of Marriage</td>
                    <td className={cell} colSpan={2}>
                      {t.dateMarriage}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 border border-black font-medium align-top leading-tight">
                      Place of
                      <br />
                      Marriage
                    </td>
                    <td className={`${cell} uppercase text-left sm:text-center align-top min-h-[2.5rem] whitespace-pre-wrap`} colSpan={2}>
                      {t.placeMarriage}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
          <p className="mb-2 text-sm court-decree-lcr-body court-decree-lcr-cert-after-table">
            {editableTable
              ? (
                <span className="pl-8 inline-block">
                  This certification is issued to <span className="font-bold underline">CCR-FILE</span> for any legal purpose.
                </span>
              )
              : (
                <>
                  This certification is issued upon the request of <span className="font-bold">OCRG/DOCUMENT OWNER</span> for any legal purposes.
                </>
              )}
          </p>
          <div className="mb-2 court-decree-lcr-body court-decree-lcr-3a-remarks-block">
            <p className="font-bold text-sm mb-0.5">REMARKS:</p>
            <div className="no-print mb-1">
              <textarea
                value={editableRemarks}
                onChange={(e) => {
                  const v = e.target.value
                  setEditableRemarks(v)
                  onDataChange?.({ ...data, remarks: v })
                }}
                rows={3}
                className="w-full border border-gray-300 rounded px-2 py-1 text-[14px]"
                placeholder="Type or edit remarks here..."
              />
            </div>
            <p className="text-[14px] leading-[1.35] text-justify whitespace-pre-wrap break-words [overflow-wrap:anywhere] min-h-[1.5rem]">
              {editableRemarks}
            </p>
          </div>
        </div>
      </div>
      <div className="court-decree-lcr-footer mt-auto shrink-0">
        <div className="court-decree-lcr-body mb-1">
          <div className="mb-1 flex justify-between items-end gap-0 court-decree-lcr-3a-signatures">
            <div className="court-decree-lcr-3a-verified-left flex flex-col items-center text-center">
              <p className="text-sm mb-0.5 self-start">Verified by:</p>
              <p className="font-bold text-sm border-b border-black inline-block uppercase">{regOfficer}</p>
              <p className="text-xs mt-0">{regOfficerTitle}</p>
            </div>
            <div className="court-decree-lcr-3a-ccr-right flex flex-col items-center text-center">
              <p className="font-bold text-sm border-b border-black inline-block uppercase">{ccrName}</p>
              <p className="text-xs mt-0 italic">{ccrTitle}</p>
            </div>
          </div>
          <p className="font-bold text-sm mb-1">
            Note: This certification is not valid if it has mark, erasure or alteration of any entry.
          </p>
        </div>
        <DocumentFooter contactPhone={data?.contactPhone} contactEmail={data?.contactEmail} sloganBlue />
      </div>
    </div>
  )
}
