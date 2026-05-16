import React, { useEffect, useState } from 'react'
import { formatDateCert, parseDdMmYyyyToDate } from '../../../lib/printUtils'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'
import { lcrRemarksBodyStyle } from '../../../lib/lcrRemarksFontSize'
import LcrCertificationRequestPartyInline from '../../../components/lcr/LcrCertificationRequestPartyInline'
import { buildLcr2aTableDisplay } from '../lib/lcr2aTable'
import { resolveCourtDecreeLcrPrintCcr } from '../lib/courtDecreePrintCcr'
import LcrRegistrationDateInputs from '../../../components/lcr/LcrRegistrationDateInputs'
import {
  LCR_REGISTRATION_DAY_UI,
  LCR_REGISTRATION_MONTH_UI,
  LCR_REGISTRATION_YEAR_UI,
  LCR_2A_DEATH_DAY_UI,
  LCR_2A_DEATH_MONTH_UI,
  LCR_2A_DEATH_YEAR_UI,
} from '../../../lib/lcrRegistrationUiKeys'

function cellEditText(displayed) {
  const s = String(displayed ?? '').trim()
  if (!s || s === '—') return ''
  return s
}

const LCR_2A_EDITABLE_ROWS = [
  { k: 'registry', label: 'LCR Registry Number', patch: (v) => ({ lcr2aRegistryNumber: v, colbRegistryNo: v }) },
  { k: 'dateRegistration', label: 'Date of Registration', patch: (v) => ({ lcr2aDateRegistration: v, colbRegDate: v }) },
  { k: 'nameDeceased', label: 'Name of Deceased', patch: (v) => ({ lcr2aNameDeceased: v }) },
  { k: 'sex', label: 'Sex', patch: (v) => ({ lcr2aSex: v, sex: v }) },
  { k: 'civilStatus', label: 'Civil Status', patch: (v) => ({ lcr2aCivilStatus: v }) },
  { k: 'citizenship', label: 'Citizenship', patch: (v) => ({ lcr2aCitizenship: v }) },
  { k: 'dateDeath', label: 'Date of Death', patch: (v) => ({ lcr2aDateDeath: v, dateOfDeath: v }) },
  { k: 'citizenshipFather', label: 'Citizenship of Father', patch: (v) => ({ lcr2aCitizenshipFather: v }) },
  { k: 'placeDeath', label: 'Place of Death', patch: (v) => ({ lcr2aPlaceDeath: v }) },
  { k: 'causeOfDeath', label: 'Cause of Death', patch: (v) => ({ lcr2aCauseDeath: v }) },
]

/** LCR Form No. 2A (Death-Available). Full print layout; table from buildLcr2aTableDisplay (court + legitimation). */
export default function LcrForm2ADeathAvailable({ data, editableTable = false, onDataChange }) {
  const t = buildLcr2aTableDisplay(data)
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
  const { row: ccrRow } = resolveCourtDecreeLcrPrintCcr(data, 'lcr-form-2a')
  const ccrName = ccrRow.name
  const ccrTitle = ccrRow.title
  const blankIfDash = (v) => (String(v || '').trim() === '—' ? '' : v)
  const causeText = blankIfDash(t.causeOfDeath)
  const labelCell = 'py-0.5 px-2 border border-black align-top leading-tight'
  const valueCell = 'py-0.5 px-2 border border-black text-left font-bold leading-tight align-top'

  return (
    <div className="ausf-doc print-doc print-doc-lcr-2a print-doc-lcr-3a court-decree-lcr-form bg-white text-black text-sm max-w-[210mm] mx-auto px-6 py-2 flex flex-col">
      <div className="court-decree-lcr-header shrink-0">
        <header className="print-doc-header">
          <PrintHeaderRow />
          <hr className="border-black my-3" />
        </header>
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="font-bold text-base">LCR Form No. 2A</p>
            <p className="text-sm">(Death-Available)</p>
          </div>
          <p className="text-sm font-bold min-w-[8rem] text-right">{formDate}</p>
        </div>
      </div>
      <div className="court-decree-lcr-body-wrap flex-1 min-h-0 flex flex-col">
        <div className="court-decree-lcr-body-scaled flex flex-col h-full">
          <p className="font-bold mb-1 pl-8">TO WHOM IT MAY CONCERN:</p>
          <p className="mb-2 text-left court-decree-lcr-body">
            <span className="font-bold">WE CERTIFY</span> that, among others, the following facts of death appear in our Register of Deaths on Page{' '}
            <span className="inline-block border-b border-black px-1 min-w-[2rem] text-center font-bold">{colbPage ?? ''}</span> of Book number{' '}
            <span className="inline-block border-b border-black px-1 min-w-[3rem] text-center font-bold">{colbBook ?? ''}</span>.
          </p>
          <table className="w-full border-collapse text-sm mt-4 mb-0 border border-black table-fixed court-decree-lcr-table">
            <colgroup>
              <col style={{ width: '38%' }} />
              <col style={{ width: '62%' }} />
            </colgroup>
            <tbody>
              {editableTable && onDataChange
                ? LCR_2A_EDITABLE_ROWS.flatMap((row) => {
                  if (row.k === 'dateRegistration') {
                    return [
                      <tr key="dateRegistration">
                        <td className={`${labelCell} w-48`}>{row.label}</td>
                        <td className={valueCell}>
                          <LcrRegistrationDateInputs
                            dateInputsJustify="start"
                            valueRaw={
                              data.lcr2aDateRegistration || data.colbRegDate || data.colbDateOfRegistration
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
                                patch.lcr2aDateRegistration = iso
                                patch.colbRegDate = iso
                                patch[LCR_REGISTRATION_DAY_UI] = ''
                                patch[LCR_REGISTRATION_MONTH_UI] = ''
                                patch[LCR_REGISTRATION_YEAR_UI] = ''
                              } else if (!d && !m && !y) {
                                patch.lcr2aDateRegistration = ''
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
                  if (row.k === 'dateDeath') {
                    return [
                      <tr key="dateDeath">
                        <td className={`${labelCell} w-48`}>{row.label}</td>
                        <td className={valueCell}>
                          <LcrRegistrationDateInputs
                            dateInputsJustify="start"
                            valueRaw={data.lcr2aDateDeath || data.dateOfDeath}
                            savedDayUi={data.lcr2aDeathDayUi}
                            savedMonthUi={data.lcr2aDeathMonthUi}
                            savedYearUi={data.lcr2aDeathYearUi}
                            dayUiKey={LCR_2A_DEATH_DAY_UI}
                            monthUiKey={LCR_2A_DEATH_MONTH_UI}
                            yearUiKey={LCR_2A_DEATH_YEAR_UI}
                            ariaLabelPrefix="Date of death"
                            onPersist={(payload) => {
                              const d = payload[LCR_2A_DEATH_DAY_UI]
                              const m = payload[LCR_2A_DEATH_MONTH_UI]
                              const y = payload[LCR_2A_DEATH_YEAR_UI]
                              const iso = payload.iso
                              const patch = {
                                [LCR_2A_DEATH_DAY_UI]: d,
                                [LCR_2A_DEATH_MONTH_UI]: m,
                                [LCR_2A_DEATH_YEAR_UI]: y,
                              }
                              if (iso) {
                                patch.lcr2aDateDeath = iso
                                patch.dateOfDeath = iso
                                patch[LCR_2A_DEATH_DAY_UI] = ''
                                patch[LCR_2A_DEATH_MONTH_UI] = ''
                                patch[LCR_2A_DEATH_YEAR_UI] = ''
                              } else if (!d && !m && !y) {
                                patch.lcr2aDateDeath = ''
                                patch.dateOfDeath = ''
                              }
                              patchData(patch)
                            }}
                            printDisplay={t.dateDeath}
                          />
                        </td>
                      </tr>,
                    ]
                  }
                  return [
                    <tr key={row.k}>
                      <td className={`${labelCell} w-48`}>{row.label}</td>
                      <td className={`${valueCell} uppercase`}>
                        <input
                          type="text"
                          className="no-print w-full min-w-0 text-left font-bold border-0 border-b border-dashed border-gray-400 bg-transparent focus:outline-none focus:border-[var(--primary-blue)] px-1"
                          value={cellEditText(t[row.k])}
                          onChange={(e) => patchData(row.patch(e.target.value))}
                        />
                        <span className="hidden print:inline">{t[row.k]}</span>
                      </td>
                    </tr>,
                  ]
                })
                : (
                  <>
                    <tr>
                      <td className={`${labelCell} w-48`}>LCR Registry Number</td>
                      <td className={`${valueCell} uppercase`}>{blankIfDash(t.registry)}</td>
                    </tr>
                    <tr>
                      <td className={labelCell}>Date of Registration</td>
                      <td className={valueCell}>{blankIfDash(t.dateRegistration)}</td>
                    </tr>
                    <tr>
                      <td className={labelCell}>Name of Deceased</td>
                      <td className={`${valueCell} uppercase`}>{blankIfDash(t.nameDeceased)}</td>
                    </tr>
                    <tr>
                      <td className={labelCell}>Sex</td>
                      <td className={`${valueCell} uppercase`}>{blankIfDash(t.sex)}</td>
                    </tr>
                    <tr>
                      <td className={labelCell}>Civil Status</td>
                      <td className={`${valueCell} uppercase`}>{blankIfDash(t.civilStatus)}</td>
                    </tr>
                    <tr>
                      <td className={labelCell}>Citizenship</td>
                      <td className={`${valueCell} uppercase`}>{blankIfDash(t.citizenship)}</td>
                    </tr>
                    <tr>
                      <td className={labelCell}>Date of Death</td>
                      <td className={valueCell}>{blankIfDash(t.dateDeath)}</td>
                    </tr>
                    <tr>
                      <td className={labelCell}>Citizenship of Father</td>
                      <td className={`${valueCell} uppercase`}>{blankIfDash(t.citizenshipFather)}</td>
                    </tr>
                    <tr>
                      <td className={labelCell}>Place of Death</td>
                      <td className={`${valueCell} uppercase whitespace-pre-wrap min-h-[2.2rem]`}>{blankIfDash(t.placeDeath)}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 px-2 border border-black align-top text-left leading-tight">
                        Cause of Death
                      </td>
                      <td className="py-0.5 px-2 border border-black text-left font-bold align-top whitespace-pre-wrap leading-tight">
                        {causeText}
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
                  This certification is issued upon the request of{' '}
                  <LcrCertificationRequestPartyInline
                    data={data}
                    variant="2a3a"
                    onPartyChange={onDataChange && !editableTable ? patchData : undefined}
                  />{' '}
                  for any legal purposes.
                </>
              )}
          </p>
          <div className="mb-2 court-decree-lcr-body court-decree-lcr-2a-remarks-block">
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
                className="w-full border border-gray-300 rounded px-2 py-1"
                style={lcrRemarksBodyStyle(data)}
                placeholder="Type or edit remarks here..."
              />
            </div>
            <p
              className="text-justify whitespace-pre-wrap break-words [overflow-wrap:anywhere] min-h-[1.5rem]"
              style={lcrRemarksBodyStyle(data)}
            >
              {editableRemarks}
            </p>
          </div>
        </div>
      </div>
      <div className="court-decree-lcr-footer mt-auto shrink-0">
        <div className="court-decree-lcr-body mb-1">
          <div className="mb-1 flex justify-between items-end gap-0 court-decree-lcr-2a-signatures">
            <div className="court-decree-lcr-2a-verified-left flex flex-col items-center text-center">
              <p className="text-sm mb-0.5 self-start">Verified by:</p>
              <p className="font-bold text-sm border-b border-black inline-block uppercase">{regOfficer}</p>
              <p className="text-xs mt-0">{regOfficerTitle}</p>
            </div>
            <div className="court-decree-lcr-2a-ccr-right flex flex-col items-center text-center">
              <p className="font-bold text-sm border-b border-black inline-block uppercase">{ccrName}</p>
              <p className="text-xs mt-0 italic">{ccrTitle}</p>
            </div>
          </div>
          <p className="font-bold text-sm mb-1">
            Note: This certification is not valid if it has mark, erasure or alteration of any entry.
          </p>
        </div>
        <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} sloganBlue />
      </div>
    </div>
  )
}
