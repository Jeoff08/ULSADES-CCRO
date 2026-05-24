import React from 'react'
import { formatDateCert, computeAgeFullYears, formatSignatoryTitleForDisplay, lcroStaffTitleForPrint, parseDdMmYyyyToDate } from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'
import LcrCertificationRequestLine from '../../../components/lcr/LcrCertificationRequestLine'
import LcrRemarksEditor from '../../../components/lcr/LcrRemarksEditor'
import LcrVerifiedByEditor from '../../../components/lcr/LcrVerifiedByEditor'
import { buildLcr3aTableDisplay } from '../lib/lcr3aTable'
import { resolveCourtDecreeLcrPrintCcr } from '../lib/courtDecreePrintCcr'
import { courtDecreeColbPage, courtDecreeColbBook } from '../lib/courtDecreeColbPrintStyle'
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

/** Print/PDF only: nudge CCR up; Verified-by up ~2 line spaces. */
const LCR_3A_SIGNATURE_PRINT_STYLES = `
@media print {
  html[data-paper-size="long"] .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-3a-signatures > .court-decree-lcr-3a-verified-left,
  html[data-paper-size="legal"] .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-3a-signatures > .court-decree-lcr-3a-verified-left {
    position: relative !important;
    top: -0.20in !important;
  }
  html[data-paper-size="long"] .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-3a-signatures > .court-decree-lcr-3a-ccr-right,
  html[data-paper-size="legal"] .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-3a-signatures > .court-decree-lcr-3a-ccr-right {
    position: relative !important;
    top: -0.25in !important;
  }
}
body.pdf-capture .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-3a-signatures > .court-decree-lcr-3a-verified-left {
  position: relative !important;
  top: -0.20in !important;
}
body.pdf-capture .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-3a-signatures > .court-decree-lcr-3a-ccr-right {
  position: relative !important;
  top: -0.25in !important;
}
@media print {
  .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-3a-signatures,
  .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-3a-verified-left,
  .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-3a-ccr-right {
    gap: 0 !important;
    row-gap: 0 !important;
  }
  html[data-paper-size="a4"] .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-signatory-name,
  html[data-paper-size="short"] .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-signatory-name,
  html[data-paper-size="long"] .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-signatory-name,
  html[data-paper-size="legal"] .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-signatory-name,
  html[data-paper-size="a4"] .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-signatory-title,
  html[data-paper-size="short"] .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-signatory-title,
  html[data-paper-size="long"] .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-signatory-title,
  html[data-paper-size="legal"] .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-signatory-title {
    margin: 0 !important;
    padding: 0 !important;
    line-height: 1.15 !important;
  }
}
body.pdf-capture .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-3a-signatures,
body.pdf-capture .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-3a-verified-left,
body.pdf-capture .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-3a-ccr-right {
  gap: 0 !important;
  row-gap: 0 !important;
}
html[data-paper-size="a4"] body.pdf-capture .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-signatory-name,
html[data-paper-size="short"] body.pdf-capture .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-signatory-name,
html[data-paper-size="long"] body.pdf-capture .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-signatory-name,
html[data-paper-size="legal"] body.pdf-capture .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-signatory-name,
html[data-paper-size="a4"] body.pdf-capture .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-signatory-title,
html[data-paper-size="short"] body.pdf-capture .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-signatory-title,
html[data-paper-size="long"] body.pdf-capture .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-signatory-title,
html[data-paper-size="legal"] body.pdf-capture .court-decree-lcr-form.print-doc-lcr-3a .court-decree-lcr-signatory-title {
  margin: 0 !important;
  padding: 0 !important;
  line-height: 1.15 !important;
}
`

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

  const patchData = (partial) => {
    onDataChange?.({ ...data, ...partial })
  }

  const colbPage = courtDecreeColbPage(data, '3a')
  const colbBook = courtDecreeColbBook(data, '3a')
  const formDate = (() => {
    const raw = data.certificateIssuanceDate
    const p = parseDdMmYyyyToDate(raw)
    if (p) return formatDateCert(p.toISOString().slice(0, 10))
    return formatDateCert(raw) || formatDateCert(new Date())
  })()
  const regOfficer = data.certificateSignatoryName || 'SHIRLY L. DEMECILLO'
  const regOfficerTitle = lcroStaffTitleForPrint(data.certificateSignatoryTitle)
  const { row: ccrRow } = resolveCourtDecreeLcrPrintCcr(data, 'lcr-form-3a')
  const ccrName = ccrRow.name
  const ccrTitle = formatSignatoryTitleForDisplay(ccrRow.title)
  const cell = 'py-1 px-2 border border-black text-center font-bold text-sm align-top'

  return (
    <div className="ausf-doc print-doc print-doc-lcr-3a court-decree-lcr-form bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-2 flex flex-col w-full">
      <style dangerouslySetInnerHTML={{ __html: LCR_3A_SIGNATURE_PRINT_STYLES }} />
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
          <p className="font-bold mb-1 pl-0">TO WHOM IT MAY CONCERN:</p>
          <p className="mb-2 text-left court-decree-lcr-body">
            <span className="font-bold">WE CERTIFY</span> that, among others, the following facts of marriage appear in our Register of Marriages on Page{' '}
            <span className="court-decree-lcr-colb-val font-bold">{colbPage ?? ''}</span>{' '}
            of Book number{' '}
            <span className="court-decree-lcr-colb-val font-bold">{colbBook ?? ''}</span>.
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
          <LcrCertificationRequestLine
            data={data}
            variant="2a3a"
            copyKind={data?.lcrCertificationCopy}
            onPartyChange={onDataChange && !editableTable ? patchData : undefined}
            className="mb-2 text-sm court-decree-lcr-body court-decree-lcr-cert-after-table"
          />
          <LcrRemarksEditor
            data={data}
            value={data?.remarks ?? ''}
            onSave={onDataChange ? (v) => onDataChange({ ...data, remarks: v }) : undefined}
            blockClassName="mb-2 court-decree-lcr-body court-decree-lcr-3a-remarks-block"
            printClassName="text-justify whitespace-pre-wrap break-words [overflow-wrap:anywhere] min-h-[1.5rem]"
          />
        </div>
      </div>
      <div className="court-decree-lcr-footer mt-auto shrink-0 flex flex-col">
        <div className="court-decree-lcr-body mb-1">
          <div className="mb-1 flex flex-col-reverse items-stretch gap-0 court-decree-lcr-3a-signatures">
            <LcrVerifiedByEditor
              name={data.certificateSignatoryName}
              title={data.certificateSignatoryTitle}
              defaultName={regOfficer}
              onSave={
                onDataChange
                  ? (patch) => onDataChange({ ...data, ...patch })
                  : undefined
              }
              blockClassName="court-decree-lcr-3a-verified-left flex flex-col items-center text-center gap-0"
              labelClassName="text-sm mb-0.5 self-start"
              printNameClassName="court-decree-lcr-signatory-name font-bold text-sm inline-block uppercase m-0 p-0 leading-[1.15]"
            />
            <div className="court-decree-lcr-3a-ccr-right flex flex-col items-center text-center self-end gap-0">
              <p className="court-decree-lcr-signatory-name font-bold text-sm inline-block uppercase m-0 p-0 leading-[1.15]">{ccrName}</p>
              <p className="court-decree-lcr-signatory-title text-xs italic m-0 p-0 leading-[1.15]">{ccrTitle}</p>
            </div>
          </div>
        </div>
        <div className="court-decree-lcr-note-hr-block mt-auto flex w-full flex-col">
          <p className="lcr1a-note-line font-bold text-sm mb-0">
            Note: This certification is not valid if it has mark, erasure or alteration of any entry.
          </p>
          <DocumentFooter contactPhone={data?.contactPhone} contactEmail={data?.contactEmail} sloganBlue />
        </div>
      </div>
    </div>
  )
}
