import React, { useEffect, useState } from 'react'
import {
  formatDateCert,
  fullName,
  formatLcrFormShortDate,
  lcroStaffTitleForPrint,
  parseBirthToDate,
} from '../../../lib/printUtils'
import { lcrRemarksBodyStyle, withLcrRemarksPrintClass } from '../../../lib/lcrRemarksFontSize'
import { courtDecreeColbInputStyle } from '../../courtDecree/lib/courtDecreeColbPrintStyle'
import LcrCertificationRequestLine from '../../../components/lcr/LcrCertificationRequestLine'
import LcrRemarksEditor from '../../../components/lcr/LcrRemarksEditor'
import { PrintHeaderRow, DocumentFooter } from '../../../components/print'
import { legitimationAffidavitCcrDisplayRow } from './legitimationAffidavitCcr'
import LcroStaffVerifiedByFields from '../../../components/lcr/LcroStaffVerifiedByFields'

/** Long bond only — not laid out for A4 or short (8.5" × 11"). */
export const LEGITIMATION_LCR_1A_EXCLUDED_PAPER_SIZE_IDS = new Set(['a4', 'short'])

const LEGITIMATION_LCR_1A_PRINT_STYLES = `
.legitimation-lcr1a-doc.court-decree-lcr-form p.legitimation-lcr1a-cert-request,
.legitimation-lcr1a-doc.court-decree-lcr-form .legitimation-lcr1a-cert-request,
.legitimation-lcr1a-doc.court-decree-lcr-form .legitimation-lcr1a-cert-request * {
  font-size: 16px !important;
  line-height: 1.3 !important;
}
.legitimation-lcr1a-doc .legitimation-lcr1a-cert-request input.no-print {
  display: inline !important;
  width: auto !important;
  min-width: 0 !important;
  max-width: none !important;
  vertical-align: baseline !important;
}
.legitimation-lcr1a-doc .legitimation-lcr1a-cert-request span:not(.hidden) {
  display: inline !important;
  vertical-align: baseline !important;
}
@media print {
  .legitimation-lcr1a-doc.court-decree-lcr-form p.legitimation-lcr1a-cert-request,
  .legitimation-lcr1a-doc.court-decree-lcr-form .legitimation-lcr1a-cert-request,
  .legitimation-lcr1a-doc.court-decree-lcr-form .legitimation-lcr1a-cert-request * {
    font-size: 12pt !important;
    line-height: 1.3 !important;
    text-align: left !important;
    text-justify: none !important;
    word-spacing: normal !important;
    letter-spacing: normal !important;
    hyphens: none !important;
  }
  .legitimation-lcr1a-doc .legitimation-lcr1a-cert-request input.no-print {
    display: none !important;
  }
  .legitimation-lcr1a-doc .legitimation-lcr1a-cert-request span.hidden {
    display: inline !important;
  }
  html[data-paper-size="long"] .legitimation-lcr1a-doc .legitimation-lcr1a-verified-left,
  .legitimation-lcr1a-doc .legitimation-lcr1a-verified-left {
    position: relative !important;
    top: -0.28in !important;
  }
}
body.pdf-capture .legitimation-lcr1a-doc.court-decree-lcr-form p.legitimation-lcr1a-cert-request,
body.pdf-capture .legitimation-lcr1a-doc.court-decree-lcr-form .legitimation-lcr1a-cert-request,
body.pdf-capture .legitimation-lcr1a-doc.court-decree-lcr-form .legitimation-lcr1a-cert-request * {
  font-size: 12pt !important;
  line-height: 1.3 !important;
  text-align: left !important;
  text-justify: none !important;
  word-spacing: normal !important;
  letter-spacing: normal !important;
  hyphens: none !important;
}
body.pdf-capture .legitimation-lcr1a-doc .legitimation-lcr1a-cert-request input.no-print {
  display: none !important;
}
body.pdf-capture .legitimation-lcr1a-doc .legitimation-lcr1a-cert-request span.hidden {
  display: inline !important;
}
html[data-paper-size="long"] body.pdf-capture .legitimation-lcr1a-doc .legitimation-lcr1a-verified-left,
body.pdf-capture .legitimation-lcr1a-doc .legitimation-lcr1a-verified-left {
  position: relative !important;
  top: -0.28in !important;
}
@media print {
  .legitimation-lcr1a-doc .legitimation-lcr1a-signatures-row,
  .legitimation-lcr1a-doc .legitimation-lcr1a-verified-left,
  .legitimation-lcr1a-doc .legitimation-lcr1a-ccr-right {
    gap: 0 !important;
    row-gap: 0 !important;
  }
  .legitimation-lcr1a-doc .legitimation-lcr1a-signatory-name,
  .legitimation-lcr1a-doc .legitimation-lcr1a-signatory-title {
    margin: 0 !important;
    padding: 0 !important;
    line-height: 1.15 !important;
  }
}
body.pdf-capture .legitimation-lcr1a-doc .legitimation-lcr1a-signatures-row,
body.pdf-capture .legitimation-lcr1a-doc .legitimation-lcr1a-verified-left,
body.pdf-capture .legitimation-lcr1a-doc .legitimation-lcr1a-ccr-right {
  gap: 0 !important;
  row-gap: 0 !important;
}
body.pdf-capture .legitimation-lcr1a-doc .legitimation-lcr1a-signatory-name,
body.pdf-capture .legitimation-lcr1a-doc .legitimation-lcr1a-signatory-title {
  margin: 0 !important;
  padding: 0 !important;
  line-height: 1.15 !important;
}
@media print {
  .legitimation-lcr1a-doc.court-decree-lcr-form .court-decree-lcr-footer {
    display: flex !important;
    flex-direction: column !important;
  }
  .legitimation-lcr1a-doc .legitimation-lcr1a-note-hr-block {
    margin-top: auto !important;
    width: 100% !important;
  }
  .legitimation-lcr1a-doc .legitimation-lcr1a-note-hr-block .lcr1a-note-line {
    width: 100% !important;
    text-align: center !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  .legitimation-lcr1a-doc .legitimation-lcr1a-note-hr-block > .print-doc-footer {
    margin-top: 0 !important;
    padding-top: 0 !important;
  }
  .legitimation-lcr1a-doc .legitimation-lcr1a-note-hr-block > .print-doc-footer > hr {
    margin-top: 0 !important;
  }
}
body.pdf-capture .legitimation-lcr1a-doc.court-decree-lcr-form .court-decree-lcr-footer {
  display: flex !important;
  flex-direction: column !important;
}
body.pdf-capture .legitimation-lcr1a-doc .legitimation-lcr1a-note-hr-block {
  margin-top: auto !important;
  width: 100% !important;
}
body.pdf-capture .legitimation-lcr1a-doc .legitimation-lcr1a-note-hr-block .lcr1a-note-line {
  width: 100% !important;
  text-align: center !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}
body.pdf-capture .legitimation-lcr1a-doc .legitimation-lcr1a-note-hr-block > .print-doc-footer {
  margin-top: 0 !important;
  padding-top: 0 !important;
}
body.pdf-capture .legitimation-lcr1a-doc .legitimation-lcr1a-note-hr-block > .print-doc-footer > hr {
  margin-top: 0 !important;
}
`

function cellEditText(displayed) {
  const s = String(displayed ?? '').trim()
  if (!s || s === '—') return ''
  return s
}

/** Table row defs: display key + patch for manual edit. */
const LCR_1A_EDITABLE_ROWS = [
  { k: 'registry', label: 'LCR Registry Number', patch: (v) => ({ colbRegistryNo: v, lcr1aRegistryNumber: v }) },
  { k: 'dateReg', label: 'Date of Registration', patch: (v) => ({ colbRegDate: v, lcr1aDateRegistration: v }) },
  { k: 'nameChild', label: 'Name of Child', patch: (v) => ({ lcr1aNameOfChild: v }) },
  { k: 'sex', label: 'Sex', patch: (v) => ({ lcr1aSex: v, sex: v }) },
  { k: 'dob', label: 'Date of Birth', patch: (v) => ({ lcr1aDateOfBirth: v, dateOfBirth: v }) },
  { k: 'pob', label: 'Place of Birth', patch: (v) => ({ lcr1aPlaceOfBirth: v }) },
  { k: 'mother', label: 'Name of Mother', patch: (v) => ({ lcr1aNameOfMother: v }) },
  { k: 'motherCit', label: 'Citizenship of Mother', patch: (v) => ({ lcr1aMotherCitizenship: v, motherCitizenship: v }) },
  { k: 'father', label: 'Name of Father', patch: (v) => ({ lcr1aNameOfFather: v }) },
  { k: 'fatherCit', label: 'Citizenship of Father', patch: (v) => ({ lcr1aFatherCitizenship: v, fatherCitizenship: v }) },
  { k: 'dom', label: 'Date of Marriage of Parents', patch: (v) => ({ lcr1aDateMarriageParents: v, dateOfMarriage: v }) },
  { k: 'pom', label: 'Place of Marriage of Parents', patch: (v) => ({ lcr1aPlaceMarriageParents: v, placeOfMarriageOfParents: v }) },
]

/** LCR Form No. 1A (Birth-Available) – Legitimation version.
 *  Mirroring the layout and features of the Court Decree LCR Form 1A.
 */
export default function LcrForm1A({ data, editableTable = false, onDataChange }) {
  const childFull = fullName(data.childFirst, data.childMiddle, data.childLast)
  const motherFull = fullName(data.motherFirst, data.motherMiddle, data.motherLast)
  const fatherFull = fullName(data.fatherFirst, data.fatherMiddle, data.fatherLast)
  const formDate = formatDateCert(data.certificateIssuanceDate) || formatDateCert(new Date())
  const ccrVariant = data.bothParentsAlive === 'NO' ? 'sole' : 'joint'
  const ccrRow = legitimationAffidavitCcrDisplayRow(data, ccrVariant)
  const ccrName = (ccrRow?.name || 'ATTY. YUSSIF DON JUSTIN F. MARTIL, REB').toUpperCase()
  const ccrTitle = ccrRow?.title || 'City Civil Registrar'
  const verifiedByName = (
    data.certificateSignatoryName ||
    data.verifiedByName ||
    data.lcrStaffName ||
    'SHIRLY L. DEMECILLO'
  ).toUpperCase()
  const regOfficerTitle = data.certificateSignatoryTitle
    ? lcroStaffTitleForPrint(data.certificateSignatoryTitle)
    : data.verifiedByTitle || data.lcrStaffTitle || 'Registration Officer II'

  const [editableRemarks, setEditableRemarks] = useState(data?.remarks || '')

  useEffect(() => {
    if (data?.remarks) {
      setEditableRemarks(data.remarks)
    } else {
      // Default remark generation logic for Legitimation
      const placeOfMarriage = [
        data.solemnizingOfficer,
        data.placeOfMarriageCity,
        data.placeOfMarriageProvince,
        data.placeOfMarriageCountry,
      ].filter(Boolean).join(', ').trim()
      const atPlaceRemark = placeOfMarriage ? ` at ${placeOfMarriage}` : ''

      const dateOfMarriageUppercase = (() => {
        if (!data.dateOfMarriage) return ''
        const d = parseBirthToDate(String(data.dateOfMarriage).trim())
        if (!d || isNaN(d.getTime())) return ''
        const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
      })()

      const marriageReg = String(data.marriageRegistryNo || '').trim()
      const remarkBase = `Legitimated by the subsequent marriage of parents ${fatherFull || '—'} and ${motherFull || '—'} on ${dateOfMarriageUppercase || '—'}${atPlaceRemark}`
      const defaultRemark = marriageReg ? `${remarkBase} under Registry No. ${marriageReg}` : remarkBase
      setEditableRemarks(defaultRemark)
    }
  }, [data, fatherFull, motherFull])

  const patchData = (partial) => {
    onDataChange?.({ ...data, ...partial })
  }

  const table = {
    registry: data.lcr1aRegistryNumber || data.colbRegistryNo || '—',
    dateReg: formatLcrFormShortDate(data.lcr1aDateRegistration || data.colbRegDate) || '—',
    nameChild: data.lcr1aNameOfChild || childFull || '—',
    sex: data.lcr1aSex || data.sex || '—',
    dob: formatLcrFormShortDate(data.lcr1aDateOfBirth || data.dateOfBirth) || '—',
    pob: data.lcr1aPlaceOfBirth || [data.placeOfBirthStreet, data.placeOfBirthCity, data.placeOfBirthProvince].filter(Boolean).join(', ').trim() || '—',
    mother: data.lcr1aNameOfMother || motherFull || '—',
    motherCit: data.lcr1aMotherCitizenship || data.motherCitizenship || '—',
    father: data.lcr1aNameOfFather || fatherFull || '—',
    fatherCit: data.lcr1aFatherCitizenship || data.fatherCitizenship || '—',
    dom: formatLcrFormShortDate(data.lcr1aDateMarriageParents || data.dateOfMarriage) || '—',
    pom: data.lcr1aPlaceMarriageParents || [data.placeOfMarriageCity, data.placeOfMarriageProvince, data.placeOfMarriageCountry].filter(Boolean).join(', ').trim() || '—',
  }

  const colbPage = data.colbPageNo ?? data.colbPageNumber ?? '0'
  const colbBook = data.colbBookNo ?? data.colbBookNumber ?? '0'
  useEffect(() => {
    const root = document.documentElement
    const prev = root.dataset.paperSize
    const applyLong = () => {
      root.dataset.paperSize = 'long'
    }
    applyLong()
    const obs = new MutationObserver(() => {
      if (root.dataset.paperSize !== 'long') applyLong()
    })
    obs.observe(root, { attributes: true, attributeFilter: ['data-paper-size'] })
    return () => {
      obs.disconnect()
      if (prev !== undefined) root.dataset.paperSize = prev
      else delete root.dataset.paperSize
    }
  }, [])

  return (
    <div className="legitimation-lcr1a-doc ausf-doc print-doc print-doc-lcr-1a court-decree-lcr-form bg-white text-black text-sm max-w-[8.5in] mx-auto px-6 py-2 flex flex-col">
      <style>{LEGITIMATION_LCR_1A_PRINT_STYLES}</style>
      <div className="court-decree-lcr-header shrink-0">
        <header className="print-doc-header">
          <PrintHeaderRow />
          <hr className="border-black my-3" />
        </header>
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="font-bold text-base">LCR Form No. 1A</p>
            <p className="text-sm">(Birth-Available)</p>
          </div>
          <p className="text-sm font-medium">{formDate}</p>
        </div>
      </div>

      <div className="court-decree-lcr-body-wrap flex-1 min-h-0 flex flex-col">
        <div className="court-decree-lcr-body-scaled flex flex-col h-full">
          <div>
            <p className="font-bold mb-1 pl-0">TO WHOM IT MAY CONCERN:</p>
            <p className="mb-2 text-left court-decree-lcr-body">
              <span className="font-bold">WE CERTIFY</span> that, among others, the following facts of birth appear in our Register of Births on Page{' '}
              {editableTable && onDataChange ? (
                <input
                  type="text"
                  className="court-decree-lcr-colb-input font-bold bg-white"
                  style={courtDecreeColbInputStyle(colbPage)}
                  value={String(colbPage ?? '')}
                  onChange={(e) => patchData({ colbPageNo: e.target.value, colbPageNumber: e.target.value })}
                />
              ) : (
                <span className="court-decree-lcr-colb-val font-bold">{colbPage || ''}</span>
              )}
              {' '}of Book number{' '}
              {editableTable && onDataChange ? (
                <input
                  type="text"
                  className="court-decree-lcr-colb-input font-bold bg-white"
                  style={courtDecreeColbInputStyle(colbBook)}
                  value={String(colbBook ?? '')}
                  onChange={(e) => patchData({ colbBookNo: e.target.value, colbBookNumber: e.target.value })}
                />
              ) : (
                <span className="court-decree-lcr-colb-val font-bold">{colbBook || ''}</span>
              )}
              .
            </p>

            <table className="w-full border-collapse text-sm mt-6 mb-2 border border-black court-decree-lcr-table">
              <tbody>
                {editableTable && onDataChange
                  ? LCR_1A_EDITABLE_ROWS.map((row) => (
                    <tr key={row.k}>
                      <td className="py-1 px-2 border border-black font-medium align-top w-48">{row.label}</td>
                      <td className="py-1 px-2 border border-black font-bold text-left align-top">
                        <input
                          type="text"
                          className="no-print w-full min-w-0 text-left font-bold border-0 border-b border-dashed border-gray-400 bg-transparent focus:outline-none focus:border-[var(--primary-blue)] px-1"
                          value={cellEditText(table[row.k])}
                          onChange={(e) => patchData(row.patch(e.target.value))}
                        />
                        <span className="hidden print:inline">{table[row.k]}</span>
                      </td>
                    </tr>
                  ))
                  : Object.entries({
                    'LCR Registry Number': table.registry,
                    'Date of Registration': table.dateReg,
                    'Name of Child': table.nameChild,
                    'Sex': table.sex,
                    'Date of Birth': table.dob,
                    'Place of Birth': table.pob,
                    'Name of Mother': table.mother,
                    'Citizenship of Mother': table.motherCit,
                    'Name of Father': table.father,
                    'Citizenship of Father': table.fatherCit,
                    'Date of Marriage of Parents': table.dom,
                    'Place of Marriage of Parents': table.pom,
                  })
                    .filter(([label, val]) => {
                      if (label !== 'LCR Registry Number') return true
                      const s = String(val ?? '').trim()
                      return s !== '' && s !== '—'
                    })
                    .map(([label, val]) => (
                      <tr key={label}>
                        <td className="py-1 px-2 border border-black font-medium align-top w-48">{label}</td>
                        <td className="py-1 px-2 border border-black font-bold text-left align-top">{val}</td>
                      </tr>
                    ))}
              </tbody>
            </table>

            <LcrCertificationRequestLine
              data={data}
              variant="1a"
              copyKind={data?.lcrCertificationCopy}
              onPartyChange={onDataChange ? patchData : undefined}
              className="mb-2 text-left court-decree-lcr-body legitimation-lcr1a-cert-request court-decree-lcr-cert-after-table"
              style={{ fontSize: '16px', lineHeight: 1.3, textAlign: 'left' }}
            />

            <LcrRemarksEditor
              data={data}
              value={data?.remarks ?? editableRemarks}
              onSave={
                onDataChange
                  ? (v) => {
                      setEditableRemarks(v)
                      patchData({ remarks: v })
                    }
                  : undefined
              }
              blockClassName="mt-10 mb-2 court-decree-lcr-body legitimation-lcr1a-remarks-block"
              printClassName="text-justify whitespace-pre-wrap break-words [overflow-wrap:anywhere] font-bold italic"
              printContent={(draft) => <>&quot;{draft}&quot;</>}
            />
          </div>
        </div>
      </div>

      <div className="court-decree-lcr-footer mt-auto shrink-0 flex flex-col">
        <div className="court-decree-lcr-body mb-1">
          <div className="mb-1 flex flex-col-reverse items-stretch gap-0 legitimation-lcr1a-signatures-row">
            <div className="legitimation-lcr1a-verified-left flex flex-col items-center text-center self-start gap-0">
              <p className="font-bold text-sm mb-0.5 self-start">Verified by:</p>
              {onDataChange ? (
                <div className="no-print self-start w-full max-w-[14rem] mb-1 text-left">
                  <LcroStaffVerifiedByFields
                    storageScope="legitimation"
                    name={data.certificateSignatoryName || data.verifiedByName || data.lcrStaffName || ''}
                    title={
                      data.certificateSignatoryTitle || data.verifiedByTitle || data.lcrStaffTitle || ''
                    }
                    showHelperText={false}
                    nameLabel="Name"
                    titleLabel="Title"
                    inputClass="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                    nameInputClassName="font-bold uppercase"
                    titleInputClassName="text-xs"
                    onChange={(patch) => onDataChange({ ...data, ...patch })}
                  />
                </div>
              ) : null}
              <p className="legitimation-lcr1a-signatory-name font-bold text-sm inline-block m-0 p-0 leading-[1.15]">{verifiedByName}</p>
              <p className="legitimation-lcr1a-signatory-title text-xs m-0 p-0 leading-[1.15]">{regOfficerTitle}</p>
            </div>
            <div className="legitimation-lcr1a-ccr-right flex flex-col items-center text-center self-end gap-0">
              <p className="legitimation-lcr1a-signatory-name font-bold text-sm inline-block m-0 p-0 leading-[1.15]">{ccrName}</p>
              <p className="legitimation-lcr1a-signatory-title text-xs m-0 p-0 leading-[1.15]">{ccrTitle}</p>
            </div>
          </div>
        </div>
        <div className="legitimation-lcr1a-note-hr-block court-decree-lcr-note-hr-block mt-auto flex w-full flex-col">
          <p className="lcr1a-note-line font-bold text-sm mb-0">Note: This certification is not valid if it has mark, erasure or alteration of any entry.</p>
          <DocumentFooter
            contactPhone={data.contactPhone || '228-1311'}
            contactEmail={data.contactEmail || 'civilregistrar.iligan@gmail.com'}
            sloganBlue
          />
        </div>
      </div>
    </div>
  )
}
