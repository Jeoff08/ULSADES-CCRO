import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  CLERICAL_DESCRIPTION_OPTIONS,
  CORRECTION_COMPLETE_PACKET_ID,
  DOCUMENT_TYPE_OPTIONS,
  NATIONALITY_OPTIONS,
  defaultCorrectionRow,
} from './lib/correctionOfEntriesDefaults'
import { getCorrectionOfEntriesDraft, saveCorrectionOfEntriesDraft } from './lib/correctionOfEntriesStorage'

function Field({ label, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-1 text-xs ${className}`}>
      <span className="font-medium text-gray-700">{label}</span>
      {children}
    </label>
  )
}

export default function CorrectionOfEntriesForm() {
  const [data, setData] = useState(getCorrectionOfEntriesDraft)

  useEffect(() => {
    setData(getCorrectionOfEntriesDraft())
  }, [])

  const persist = useCallback((patch) => {
    setData((prev) => {
      const next = { ...prev, ...patch }
      saveCorrectionOfEntriesDraft(next)
      return next
    })
  }, [])

  const setCorrection = (index, field, value) => {
    const list = [...(data.corrections || [])]
    if (!list[index]) return
    list[index] = { ...list[index], [field]: value }
    persist({ corrections: list })
  }

  const addCorrectionRow = () => {
    persist({ corrections: [...(data.corrections || []), defaultCorrectionRow()] })
  }

  const removeCorrectionRow = (index) => {
    const list = (data.corrections || []).filter((_, i) => i !== index)
    persist({ corrections: list.length ? list : [defaultCorrectionRow()] })
  }

  const inputCls =
    'border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-[#0d9488]/30 focus:border-[#0d9488]'

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 pb-16">
      <nav className="text-xs text-gray-500 mb-3">
        <Link to="/" className="text-[var(--primary-blue)] hover:underline">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Correction of entries</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Correction of entries</h1>
          <p className="text-sm text-gray-600 mt-1">
            RA 9048 / RA 10172 — petition for correction of clerical error (COLB).{' '}
            <strong className="font-semibold text-gray-800">Enter data only on this form.</strong> Every certificate,
            petition page, and transmittal is generated from these fields. Print opens the full packet (one PDF with all
            outputs), or you can open a single document from the list there.
          </p>
        </div>
        <Link
          to={`/correction-of-entries/print?view=${CORRECTION_COMPLETE_PACKET_ID}`}
          className="shrink-0 px-4 py-2.5 rounded-lg bg-[#0d9488] text-white text-sm font-semibold hover:bg-[#0f766e] transition"
        >
          Print / outputs
        </Link>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm mb-5">
        <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">General information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Type of petition">
            <select value={data.typeOfPetition} onChange={(e) => persist({ typeOfPetition: e.target.value })} className={inputCls}>
              <option value="RA 9048">RA 9048</option>
              <option value="RA 10172">RA 10172</option>
              <option value="RA 9048/RA 10172">RA 9048/RA 10172</option>
              <option value="RA 9048 CFN">RA 9048 CFN</option>
            </select>
          </Field>
          <Field label="Migrant petition?">
            <select value={data.migrantPetition} onChange={(e) => persist({ migrantPetition: e.target.value })} className={inputCls}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </Field>
          <Field label="Petition no. (series)">
            <input
              className={inputCls}
              value={data.petitionNumber}
              onChange={(e) => persist({ petitionNumber: e.target.value })}
              placeholder="e.g. 0141"
            />
          </Field>
          <Field label="Petition year">
            <input
              type="number"
              className={inputCls}
              value={data.petitionYear}
              onChange={(e) => persist({ petitionYear: Number(e.target.value) || new Date().getFullYear() })}
            />
          </Field>
          <Field label="Type of document" className="sm:col-span-2">
            <select
              className={inputCls}
              value={data.typeOfDocument}
              onChange={(e) => persist({ typeOfDocument: e.target.value })}
            >
              {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Registry number">
            <input
              className={inputCls}
              value={data.registryNumber}
              onChange={(e) => persist({ registryNumber: e.target.value })}
            />
          </Field>
          <Field label="Name of owner of document">
            <input
              className={inputCls}
              value={data.documentOwnerName}
              onChange={(e) => persist({ documentOwnerName: e.target.value })}
            />
          </Field>
          <Field label="Date of birth">
            <input
              type="date"
              className={inputCls}
              value={data.dateOfBirth}
              onChange={(e) => persist({ dateOfBirth: e.target.value })}
            />
          </Field>
          <Field label="Place of birth">
            <input
              className={inputCls}
              value={data.placeOfBirth}
              onChange={(e) => persist({ placeOfBirth: e.target.value })}
            />
          </Field>
          <Field label="Name of petitioner" className="sm:col-span-2">
            <input
              className={inputCls}
              value={data.petitionerName}
              onChange={(e) => persist({ petitionerName: e.target.value })}
            />
          </Field>
          <Field label="Petitioner owner of the document?">
            <select
              value={data.petitionerOwnerOfDocument}
              onChange={(e) => persist({ petitionerOwnerOfDocument: e.target.value })}
              className={inputCls}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </Field>
          <Field label="Nationality">
            <select
              className={inputCls}
              value={data.nationality || ''}
              onChange={(e) => persist({ nationality: e.target.value })}
            >
              <option value="">Select nationality</option>
              {NATIONALITY_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <input
              className={inputCls}
              value={data.petitionerAddress}
              onChange={(e) => persist({ petitionerAddress: e.target.value })}
            />
          </Field>
          <Field label="ID presented / Cedula" className="sm:col-span-2">
            <input
              className={inputCls}
              value={data.idPresented}
              onChange={(e) => persist({ idPresented: e.target.value })}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm mb-5">
        <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-2">Clerical error/s to be corrected</h2>
        <p className="text-xs text-gray-500 mb-3">Unused box must be blank; description uses the dropdown list.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-2 border border-gray-200 w-12">Item</th>
                <th className="p-2 border border-gray-200 min-w-[14rem]">Description</th>
                <th className="p-2 border border-gray-200 min-w-[8rem]">From</th>
                <th className="p-2 border border-gray-200 min-w-[8rem]">To</th>
                <th className="p-2 border border-gray-200 w-16" />
              </tr>
            </thead>
            <tbody>
              {(data.corrections || []).map((row, i) => (
                <tr key={row.id || i}>
                  <td className="p-2 border border-gray-200 align-top">{i + 1}</td>
                  <td className="p-2 border border-gray-200 align-top">
                    <select
                      className={`${inputCls} w-full max-w-xs`}
                      value={row.description}
                      onChange={(e) => setCorrection(i, 'description', e.target.value)}
                    >
                      {CLERICAL_DESCRIPTION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2 border border-gray-200 align-top">
                    <input
                      className={inputCls}
                      value={row.from}
                      onChange={(e) => setCorrection(i, 'from', e.target.value)}
                    />
                  </td>
                  <td className="p-2 border border-gray-200 align-top">
                    <input
                      className={inputCls}
                      value={row.to}
                      onChange={(e) => setCorrection(i, 'to', e.target.value)}
                    />
                  </td>
                  <td className="p-2 border border-gray-200 align-top">
                    <button
                      type="button"
                      onClick={() => removeCorrectionRow(i)}
                      className="text-red-600 text-xs font-medium hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={addCorrectionRow}
          className="mt-3 text-xs font-semibold text-[#0d9488] hover:underline"
        >
          + Add row
        </button>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm mb-5">
        <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">Payment &amp; filing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="OR number (filing fee)">
            <input
              className={inputCls}
              value={data.orFilingFeeNumber}
              onChange={(e) => persist({ orFilingFeeNumber: e.target.value })}
            />
          </Field>
          <Field label="Amount paid (filing)">
            <input
              className={inputCls}
              value={data.amountPaidFiling}
              onChange={(e) => persist({ amountPaidFiling: e.target.value })}
            />
          </Field>
          <Field label="Date of receipt (filing)">
            <input
              type="date"
              className={inputCls}
              value={data.dateOfReceiptFiling}
              onChange={(e) => persist({ dateOfReceiptFiling: e.target.value })}
            />
          </Field>
          <Field label="OR number (certification)">
            <input
              className={inputCls}
              value={data.orCertificationNumber}
              onChange={(e) => persist({ orCertificationNumber: e.target.value })}
            />
          </Field>
          <Field label="Amount (certification)">
            <input
              className={inputCls}
              value={data.amountCertification}
              onChange={(e) => persist({ amountCertification: e.target.value })}
            />
          </Field>
          <Field label="Date of receipt (certification)">
            <input
              type="date"
              className={inputCls}
              value={data.dateOfReceiptCertification}
              onChange={(e) => persist({ dateOfReceiptCertification: e.target.value })}
            />
          </Field>
          <Field label="Received by">
            <input
              className={inputCls}
              value={data.receivedByName}
              onChange={(e) => persist({ receivedByName: e.target.value })}
            />
          </Field>
          <Field label="Subscribe by CCR?">
            <select value={data.subscribeByCcr} onChange={(e) => persist({ subscribeByCcr: e.target.value })} className={inputCls}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </Field>
          <Field label="Suggested date of decision">
            <input
              type="date"
              className={inputCls}
              value={data.suggestedDateOfDecision}
              onChange={(e) => persist({ suggestedDateOfDecision: e.target.value })}
            />
          </Field>
          <Field label="Suggested decision date is a holiday?">
            <select
              value={data.suggestedDateHoliday}
              onChange={(e) => persist({ suggestedDateHoliday: e.target.value })}
              className={inputCls}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </Field>
          <Field label="Date of filing (petition)">
            <input
              type="date"
              className={inputCls}
              value={data.dateOfFiling}
              onChange={(e) => persist({ dateOfFiling: e.target.value })}
            />
          </Field>
          <Field label="Date of receipt (LCRO)">
            <input
              type="date"
              className={inputCls}
              value={data.dateOfReceipt}
              onChange={(e) => persist({ dateOfReceipt: e.target.value })}
            />
          </Field>
          <Field label="Posting period from">
            <input
              type="date"
              className={inputCls}
              value={data.postingPeriodFrom}
              onChange={(e) => persist({ postingPeriodFrom: e.target.value })}
            />
          </Field>
          <Field label="Posting period to">
            <input
              type="date"
              className={inputCls}
              value={data.postingPeriodTo}
              onChange={(e) => persist({ postingPeriodTo: e.target.value })}
            />
          </Field>
          <Field label="Certification issued date">
            <input
              type="date"
              className={inputCls}
              value={data.certificationIssuedDate}
              onChange={(e) => persist({ certificationIssuedDate: e.target.value })}
            />
          </Field>
          <Field label="Certificate of posting — issued at">
            <input
              type="date"
              className={inputCls}
              value={data.certificatePostingIssuedAt}
              onChange={(e) => persist({ certificatePostingIssuedAt: e.target.value })}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm mb-5">
        <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3">Supporting documents</h2>
        {(data.supportingDocuments || []).map((line, i) => (
          <input
            key={i}
            className={`${inputCls} mb-2 w-full`}
            value={line}
            placeholder={`Document ${i + 1}`}
            onChange={(e) => {
              const next = [...(data.supportingDocuments || [])]
              next[i] = e.target.value
              persist({ supportingDocuments: next })
            }}
          />
        ))}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm mb-5">
        <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">Petition form — sworn / received</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Received — office line" className="sm:col-span-2">
            <input
              className={inputCls}
              value={data.receivedAtOfficeLine}
              onChange={(e) => persist({ receivedAtOfficeLine: e.target.value })}
            />
          </Field>
          <Field label="Received date">
            <input
              type="date"
              className={inputCls}
              value={data.receivedDate}
              onChange={(e) => persist({ receivedDate: e.target.value })}
            />
          </Field>
          <Field label="Received by (officer)">
            <input
              className={inputCls}
              value={data.receivedOfficerName}
              onChange={(e) => persist({ receivedOfficerName: e.target.value })}
            />
          </Field>
          <Field label="Sworn — day">
            <input className={inputCls} value={data.swornDay} onChange={(e) => persist({ swornDay: e.target.value })} />
          </Field>
          <Field label="Sworn — month">
            <input className={inputCls} value={data.swornMonth} onChange={(e) => persist({ swornMonth: e.target.value })} />
          </Field>
          <Field label="Sworn — year">
            <input className={inputCls} value={data.swornYear} onChange={(e) => persist({ swornYear: e.target.value })} />
          </Field>
          <Field label="Sworn — place">
            <input className={inputCls} value={data.swornPlace} onChange={(e) => persist({ swornPlace: e.target.value })} />
          </Field>
          <Field label="ID exhibited (sworn)">
            <input
              className={inputCls}
              value={data.idTypeForSworn}
              onChange={(e) => persist({ idTypeForSworn: e.target.value })}
            />
          </Field>
          <Field label="Payment OR (filing) — duplicate">
            <input
              className={inputCls}
              value={data.paymentOrFiling}
              onChange={(e) => persist({ paymentOrFiling: e.target.value })}
            />
          </Field>
          <Field label="Payment amount">
            <input
              className={inputCls}
              value={data.paymentAmountFiling}
              onChange={(e) => persist({ paymentAmountFiling: e.target.value })}
            />
          </Field>
          <Field label="Payment date">
            <input
              type="date"
              className={inputCls}
              value={data.paymentDateFiling}
              onChange={(e) => persist({ paymentDateFiling: e.target.value })}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm mb-5">
        <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">Record sheet — decisions / finality</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <Field label="Decision C/MCR — date rendered">
            <input
              type="date"
              className={inputCls}
              value={data.decisionCmcrDate}
              onChange={(e) => persist({ decisionCmcrDate: e.target.value })}
            />
          </Field>
          <Field label="Decision CRG — date rendered">
            <input
              type="date"
              className={inputCls}
              value={data.decisionCrgDate}
              onChange={(e) => persist({ decisionCrgDate: e.target.value })}
            />
          </Field>
          <Field label="Certificate of Finality — issued on">
            <input
              type="date"
              className={inputCls}
              value={data.certificateOfFinalityIssuedOn}
              onChange={(e) => persist({ certificateOfFinalityIssuedOn: e.target.value })}
            />
          </Field>
          <Field label="COF — decision date">
            <input
              type="date"
              className={inputCls}
              value={data.cofDecisionDate}
              onChange={(e) => persist({ cofDecisionDate: e.target.value })}
            />
          </Field>
          <Field label="COF — issuance date">
            <input
              type="date"
              className={inputCls}
              value={data.cofIssuanceDate}
              onChange={(e) => persist({ cofIssuanceDate: e.target.value })}
            />
          </Field>
          <Field label="COF — OCRG number">
            <input className={inputCls} value={data.cofOcrgNo} onChange={(e) => persist({ cofOcrgNo: e.target.value })} />
          </Field>
          <Field label="Remarks (record sheet)" className="sm:col-span-2">
            <textarea
              className={`${inputCls} min-h-[5rem]`}
              value={data.remarksRecordSheet}
              onChange={(e) => persist({ remarksRecordSheet: e.target.value })}
            />
          </Field>
          <Field label="Certificate of Finality — custom annotation text" className="sm:col-span-2">
            <textarea
              className={`${inputCls} min-h-[4rem]`}
              value={data.cofAnnotationBody}
              onChange={(e) => persist({ cofAnnotationBody: e.target.value })}
              placeholder="Leave blank to generate from first correction row."
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm mb-5">
        <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">For Certificate of Finality (reference)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="OCRG affirmed date">
            <input type="date" className={inputCls} value={data.ocrgAffirmedDate} onChange={(e) => persist({ ocrgAffirmedDate: e.target.value })} />
          </Field>
          <Field label="Affirmed number">
            <input className={inputCls} value={data.affirmedNumber} onChange={(e) => persist({ affirmedNumber: e.target.value })} />
          </Field>
          <Field label="OCRG impugned date">
            <input type="date" className={inputCls} value={data.ocrgImpugnedDate} onChange={(e) => persist({ ocrgImpugnedDate: e.target.value })} />
          </Field>
          <Field label="Impugned number">
            <input className={inputCls} value={data.impugnedNumber} onChange={(e) => persist({ impugnedNumber: e.target.value })} />
          </Field>
          <Field label="Certificate of Finality date">
            <input
              type="date"
              className={inputCls}
              value={data.certificateOfFinalityDate}
              onChange={(e) => persist({ certificateOfFinalityDate: e.target.value })}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm mb-5">
        <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">Second transmittal (PSA)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Letter date">
            <input
              type="date"
              className={inputCls}
              value={data.secondTransmittalDate}
              onChange={(e) => persist({ secondTransmittalDate: e.target.value })}
            />
          </Field>
          <Field label="City Civil Registrar (signatory)">
            <input
              className={inputCls}
              value={data.cityCivilRegistrarName}
              onChange={(e) => persist({ cityCivilRegistrarName: e.target.value })}
            />
          </Field>
          <Field label="PSA addressee" className="sm:col-span-2">
            <input className={inputCls} value={data.psaAddressee} onChange={(e) => persist({ psaAddressee: e.target.value })} />
          </Field>
          <Field label="Thru name">
            <input className={inputCls} value={data.thruName} onChange={(e) => persist({ thruName: e.target.value })} />
          </Field>
        </div>
        <p className="text-xs font-semibold text-gray-700 mt-4 mb-2">Enclosed documents list (one per line)</p>
        {(data.secondTransmittalBullets || []).map((line, i) => (
          <input
            key={i}
            className={`${inputCls} mb-2 w-full`}
            value={line}
            onChange={(e) => {
              const next = [...(data.secondTransmittalBullets || [])]
              next[i] = e.target.value
              persist({ secondTransmittalBullets: next })
            }}
          />
        ))}
      </section>

      <div className="flex justify-end">
        <Link
          to={`/correction-of-entries/print?view=${CORRECTION_COMPLETE_PACKET_ID}`}
          className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-black transition"
        >
          Open print outputs
        </Link>
      </div>
    </div>
  )
}
