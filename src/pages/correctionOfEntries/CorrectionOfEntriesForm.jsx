import React, { useState, useEffect, useCallback } from 'react'
import { useWarnIfUnsaved } from '../../hooks/useWarnIfUnsaved'
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

function StyledSection({ title, children, footer = false }) {
  return (
    <section className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
      <div className="bg-[#1e3a8a] py-2.5 text-center text-sm font-bold uppercase text-white tracking-widest">
        {title}
      </div>
      <div className="divide-y divide-gray-100">
        {children}
      </div>
      {footer && (
        <div className="bg-[#1e3a8a] py-3 text-center">
          <p className="text-[10px] italic text-white leading-tight">
            City Civil Registrar&apos;s Office - Iligan City, Always Ready and Happy to Serve You...
          </p>
          <p className="text-[10px] italic text-white mt-0.5">
            We serve with Love, Care &amp; Respect
          </p>
        </div>
      )}
    </section>
  )
}

function StyledRow({ label, children, isEven = false, className = '' }) {
  const labelBg = isEven ? 'bg-[#3b82f6]/10' : 'bg-[#3b82f6]/20'
  return (
    <div className={`flex flex-col sm:flex-row sm:min-h-[2.5rem] ${className}`}>
      <div className={`${labelBg} px-4 py-2 flex items-center text-xs font-bold text-[#1e3a8a] sm:w-1/3 min-h-[2.5rem]`}>
        {label}
      </div>
      <div className="flex-1 px-2 py-1 flex items-center bg-white">
        {children}
      </div>
    </div>
  )
}

export default function CorrectionOfEntriesForm() {
  const [data, setData] = useState(getCorrectionOfEntriesDraft)

  useEffect(() => {
    setData(getCorrectionOfEntriesDraft())
  }, [])

  const [dirtyBaselineTick, setDirtyBaselineTick] = useState(0)
  useEffect(() => {
    const id = setTimeout(() => setDirtyBaselineTick((x) => x + 1), 120)
    return () => clearTimeout(id)
  }, [])

  const _acknowledgeSaved = useWarnIfUnsaved(data, [dirtyBaselineTick])

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

  const cleanInputCls =
    'w-full text-sm focus:outline-none bg-transparent text-gray-900 placeholder:text-gray-400 px-1'
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
            petition page, and transmittal is generated from these fields.
          </p>
        </div>
        <Link
          to={`/correction-of-entries/print?view=${CORRECTION_COMPLETE_PACKET_ID}`}
          className="shrink-0 px-4 py-2.5 rounded-lg bg-[#0d9488] text-white text-sm font-semibold hover:bg-[#0f766e] transition shadow-md"
        >
          Print / outputs
        </Link>
      </div>

      <StyledSection title="General information">
        <StyledRow label="Type of petition" isEven={false}>
          <select value={data.typeOfPetition} onChange={(e) => persist({ typeOfPetition: e.target.value })} className={cleanInputCls}>
            <option value="RA 9048">RA 9048</option>
            <option value="RA 10172">RA 10172</option>
            <option value="RA 9048/RA 10172">RA 9048/RA 10172</option>
            <option value="RA 9048 CFN">RA 9048 CFN</option>
          </select>
        </StyledRow>
        <StyledRow label="Migrant petition?" isEven={true}>
          <select value={data.migrantPetition} onChange={(e) => persist({ migrantPetition: e.target.value })} className={cleanInputCls}>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </StyledRow>
        <StyledRow label="Petition no. (series)" isEven={false}>
          <input className={cleanInputCls} value={data.petitionNumber} onChange={(e) => persist({ petitionNumber: e.target.value })} placeholder="e.g. 0141" />
        </StyledRow>
        <StyledRow label="Type of document" isEven={true}>
          <select className={cleanInputCls} value={data.typeOfDocument} onChange={(e) => persist({ typeOfDocument: e.target.value })}>
            {DOCUMENT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </StyledRow>
        <StyledRow label="Registry number" isEven={false}>
          <input className={cleanInputCls} value={data.registryNumber} onChange={(e) => persist({ registryNumber: e.target.value })} />
        </StyledRow>
        <StyledRow label="Name of owner of document" isEven={true}>
          <input className={cleanInputCls} value={data.documentOwnerName} onChange={(e) => persist({ documentOwnerName: e.target.value })} />
        </StyledRow>
        <StyledRow label="Date of birth" isEven={false}>
          <input type="date" className={cleanInputCls} value={data.dateOfBirth} onChange={(e) => persist({ dateOfBirth: e.target.value })} />
        </StyledRow>
        <StyledRow label="Place of birth" isEven={true}>
          <input className={cleanInputCls} value={data.placeOfBirth} onChange={(e) => persist({ placeOfBirth: e.target.value })} />
        </StyledRow>
        <StyledRow label="Name of petitioner" isEven={false}>
          <input className={cleanInputCls} value={data.petitionerName} onChange={(e) => persist({ petitionerName: e.target.value })} />
        </StyledRow>
        <StyledRow label="Petitioner owner of the document?" isEven={true}>
          <select value={data.petitionerOwnerOfDocument} onChange={(e) => persist({ petitionerOwnerOfDocument: e.target.value })} className={cleanInputCls}>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </StyledRow>
        <StyledRow label="Nationality" isEven={false}>
          <select className={cleanInputCls} value={data.nationality || ''} onChange={(e) => persist({ nationality: e.target.value })}>
            <option value="">Select nationality</option>
            {NATIONALITY_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </StyledRow>
        <StyledRow label="Address" isEven={true}>
          <input className={cleanInputCls} value={data.petitionerAddress} onChange={(e) => persist({ petitionerAddress: e.target.value })} />
        </StyledRow>
        <StyledRow label="ID presented / Cedula" isEven={false}>
          <input className={cleanInputCls} value={data.idPresented} onChange={(e) => persist({ idPresented: e.target.value })} />
        </StyledRow>
        <StyledRow label="Name of father" isEven={true}>
          <input className={cleanInputCls} value={data.fatherName} onChange={(e) => persist({ fatherName: e.target.value })} />
        </StyledRow>
        <StyledRow label="Name of mother" isEven={false}>
          <input className={cleanInputCls} value={data.motherName} onChange={(e) => persist({ motherName: e.target.value })} />
        </StyledRow>
      </StyledSection>

      <StyledSection title="Clerical error/s to be corrected">
        <div className="p-4 bg-white">
          <p className="text-xs text-gray-500 mb-3 italic">Unused box must be blank; description uses the dropdown list.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse border border-gray-200">
              <thead>
                <tr className="bg-[#1e3a8a] text-white">
                  <th className="p-2 border border-blue-900 w-12">Item</th>
                  <th className="p-2 border border-blue-900 min-w-[14rem]">Description</th>
                  <th className="p-2 border border-blue-900 min-w-[8rem]">From</th>
                  <th className="p-2 border border-blue-900 min-w-[8rem]">To</th>
                  <th className="p-2 border border-blue-900 w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data.corrections || []).map((row, i) => (
                  <tr key={row.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}>
                    <td className="p-2 border border-gray-100 text-center font-bold text-blue-900">{i + 1}</td>
                    <td className="p-1 border border-gray-100">
                      <select
                        className="w-full bg-transparent p-1 focus:outline-none"
                        value={row.description}
                        onChange={(e) => setCorrection(i, 'description', e.target.value)}
                      >
                        {CLERICAL_DESCRIPTION_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-1 border border-gray-100">
                      <input className="w-full bg-transparent p-1 focus:outline-none" value={row.from} onChange={(e) => setCorrection(i, 'from', e.target.value)} />
                    </td>
                    <td className="p-1 border border-gray-100">
                      <input className="w-full bg-transparent p-1 focus:outline-none" value={row.to} onChange={(e) => setCorrection(i, 'to', e.target.value)} />
                    </td>
                    <td className="p-1 border border-gray-100 text-center">
                      <button type="button" onClick={() => removeCorrectionRow(i)} className="text-red-600 hover:text-red-800 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={addCorrectionRow} className="mt-4 flex items-center gap-1 text-xs font-bold text-[#1e3a8a] hover:underline">
            <span className="text-lg">+</span> Add correction row
          </button>
        </div>
      </StyledSection>

      <StyledSection title="Payment & filing">
        <StyledRow label="OR number (filing fee)" isEven={false}>
          <input className={cleanInputCls} value={data.orFilingFeeNumber} onChange={(e) => persist({ orFilingFeeNumber: e.target.value })} />
        </StyledRow>
        <StyledRow label="Amount paid (filing)" isEven={true}>
          <input className={cleanInputCls} value={data.amountPaidFiling} onChange={(e) => persist({ amountPaidFiling: e.target.value })} />
        </StyledRow>
        <StyledRow label="Date of receipt (filing)" isEven={false}>
          <input type="date" className={cleanInputCls} value={data.dateOfReceiptFiling} onChange={(e) => persist({ dateOfReceiptFiling: e.target.value })} />
        </StyledRow>
        <StyledRow label="OR number (certification)" isEven={true}>
          <input className={cleanInputCls} value={data.orCertificationNumber} onChange={(e) => persist({ orCertificationNumber: e.target.value })} />
        </StyledRow>
        <StyledRow label="Received by" isEven={false}>
          <input className={cleanInputCls} value={data.receivedByName} onChange={(e) => persist({ receivedByName: e.target.value })} />
        </StyledRow>
        <StyledRow label="Subscribe by CCR?" isEven={true}>
          <select value={data.subscribeByCcr} onChange={(e) => persist({ subscribeByCcr: e.target.value })} className={cleanInputCls}>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </StyledRow>
        <StyledRow label="Suggested date of decision" isEven={false}>
          <input type="date" className={cleanInputCls} value={data.suggestedDateOfDecision} onChange={(e) => persist({ suggestedDateOfDecision: e.target.value })} />
        </StyledRow>
        <StyledRow label="Suggested decision date is a holiday?" isEven={true}>
          <select value={data.suggestedDateHoliday} onChange={(e) => persist({ suggestedDateHoliday: e.target.value })} className={cleanInputCls}>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </StyledRow>
      </StyledSection>

      <StyledSection title="Supporting documents">
        {(data.supportingDocuments || []).map((line, i) => (
          <StyledRow key={i} label={`Document ${i + 1}`} isEven={i % 2 !== 0}>
            <input
              className={cleanInputCls}
              value={line}
              placeholder={`Enter document description...`}
              onChange={(e) => {
                const next = [...(data.supportingDocuments || [])]
                next[i] = e.target.value
                persist({ supportingDocuments: next })
              }}
            />
          </StyledRow>
        ))}
      </StyledSection>

      <StyledSection title="FOR CERTIFICATE OF FINALITY" footer={true}>
        <StyledRow label="OCRG Affirmed Date" isEven={false}>
          <input type="date" className={cleanInputCls} value={data.ocrgAffirmedDate} onChange={(e) => persist({ ocrgAffirmedDate: e.target.value })} />
        </StyledRow>
        <StyledRow label="Affirmed Number" isEven={true}>
          <input className={cleanInputCls} value={data.affirmedNumber} onChange={(e) => persist({ affirmedNumber: e.target.value })} />
        </StyledRow>
        <StyledRow label="OCRG Impugned Date" isEven={false}>
          <input type="date" className={cleanInputCls} value={data.ocrgImpugnedDate} onChange={(e) => persist({ ocrgImpugnedDate: e.target.value })} />
        </StyledRow>
        <StyledRow label="Impugned Number" isEven={true}>
          <input className={cleanInputCls} value={data.impugnedNumber} onChange={(e) => persist({ impugnedNumber: e.target.value })} />
        </StyledRow>
        <StyledRow label="Certificate of Finality Date" isEven={false}>
          <input type="date" className={cleanInputCls} value={data.certificateOfFinalityDate} onChange={(e) => persist({ certificateOfFinalityDate: e.target.value })} />
        </StyledRow>
      </StyledSection>

      <div className="flex justify-end">
        <Link
          to={`/correction-of-entries/print?view=${CORRECTION_COMPLETE_PACKET_ID}`}
          className="px-6 py-3 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Open print outputs
        </Link>
      </div>
    </div>
  )
}
