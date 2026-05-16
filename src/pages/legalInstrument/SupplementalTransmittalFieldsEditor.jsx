import React from 'react'
import FlexibleFormDateInput from '../../components/forms/FlexibleFormDateInput'
import {
  SUPPLEMENTAL_TRANSMITTAL_ATTACHMENT_OPTIONS,
  SUPPLEMENTAL_TRANSMITTAL_DOC_TYPE_OPTIONS,
  SUPPLEMENTAL_TRANSMITTAL_ENDORSEMENT_OPTIONS,
  SUPPLEMENTAL_TRANSMITTAL_SALUTATION_PRESETS,
  RECEIVED_BY_OPTIONS,
  clampTransmittalSignatoryIndex,
} from './lib/supplementalTransmittalDefaults'

const tableCls = 'w-full border-collapse border border-black text-[13px]'
const tdBoxCls = 'border border-black w-9 text-center align-middle'
const tdLblCls = 'border border-black px-2 py-0.5'

/**
 * Transmittal (CCR letter) inputs for the Supplemental form. Values are stored on the same draft as the affidavit.
 * @param {'letter' | 'endorsementColumn'} [signatoryDropdownPlacement] — where to show "Prepared / signed by" (MC2010 uses endorsementColumn = right column with Request for Endorsement).
 */
export default function SupplementalTransmittalFieldsEditor({
  data,
  onPatch,
  inputClass,
  showRecipientCity = true,
  signatoryDropdownPlacement = 'letter',
}) {
  const docType = data.transmittalDocType || ''
  const endorsementIds = Array.isArray(data.transmittalEndorsementIds) ? data.transmittalEndorsementIds : []
  const attachmentIds = Array.isArray(data.transmittalAttachmentIds) ? data.transmittalAttachmentIds : []

  const toggleId = (key, id) => {
    const cur = Array.isArray(data[key]) ? data[key] : []
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    onPatch({ [key]: next })
  }

  const fieldClass = inputClass || 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white'
  const selectClass = fieldClass.replace('bg-white', 'bg-white cursor-pointer')

  const salutationTrim = (data.transmittalSalutation ?? 'Sir:').trim()
  const salutationSelectValue = SUPPLEMENTAL_TRANSMITTAL_SALUTATION_PRESETS.includes(salutationTrim)
    ? salutationTrim
    : '__custom__'

  return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 md:p-5 space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">Transmittal (CCR letter)</h2>
        <p className="text-xs text-gray-600 mt-1 leading-snug">
          Each line of the letter uses its own field (date, dropdown salutation, separate lines for To / Thru, then subject details). On screen you can review the full checklist tables; the printed PDF includes only the checked / selected rows.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-4 text-sm">
        <fieldset className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-gray-700 px-1">Letter</legend>
          <label className="block">
            <span className="text-xs font-medium text-gray-700">Letter date</span>
            <FlexibleFormDateInput
              className="max-w-xs mt-0.5"
              inputClassName={fieldClass}
              value={data.transmittalDate || ''}
              onChange={(v) => onPatch({ transmittalDate: v })}
              placeholder="May 15 2026 or dd/mm/yyyy"
            />
          </label>
          <div className="space-y-2">
            <label className="block">
              <span className="text-xs font-medium text-gray-700">Salutation</span>
              <select
                className={`mt-0.5 ${selectClass}`}
                value={salutationSelectValue}
                onChange={(e) => {
                  const v = e.target.value
                  if (v === '__custom__') onPatch({ transmittalSalutation: '' })
                  else onPatch({ transmittalSalutation: v })
                }}
              >
                {SUPPLEMENTAL_TRANSMITTAL_SALUTATION_PRESETS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="__custom__">Custom…</option>
              </select>
            </label>
            {salutationSelectValue === '__custom__' ? (
              <label className="block">
                <span className="text-xs font-medium text-gray-700">Custom salutation</span>
                <input
                  type="text"
                  className={`mt-0.5 ${fieldClass}`}
                  placeholder="e.g. Dear Sir or Madam:"
                  value={salutationTrim}
                  onChange={(e) => onPatch({ transmittalSalutation: e.target.value })}
                />
              </label>
            ) : null}
          </div>
        </fieldset>

        <fieldset className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-gray-700 px-1">To</legend>
          <label className="block">
            <span className="text-xs font-medium text-gray-700">Addressee name</span>
            <input
              type="text"
              className={`mt-0.5 ${fieldClass} uppercase`}
              value={data.transmittalRecipient || ''}
              onChange={(e) => onPatch({ transmittalRecipient: e.target.value })}
            />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-gray-700">Position / title — line 1</span>
              <input
                type="text"
                className={`mt-0.5 ${fieldClass} uppercase`}
                value={data.transmittalToPosition1 || ''}
                onChange={(e) => onPatch({ transmittalToPosition1: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700">Position / title — line 2</span>
              <input
                type="text"
                className={`mt-0.5 ${fieldClass} uppercase`}
                value={data.transmittalToPosition2 || ''}
                onChange={(e) => onPatch({ transmittalToPosition2: e.target.value })}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-medium text-gray-700">Office / agency</span>
            <input
              type="text"
              className={`mt-0.5 ${fieldClass} uppercase`}
              value={data.transmittalToOffice1 || ''}
              onChange={(e) => onPatch({ transmittalToOffice1: e.target.value })}
            />
          </label>
          {showRecipientCity ? (
            <label className="block">
              <span className="text-xs font-medium text-gray-700">City</span>
              <input
                type="text"
                className={`mt-0.5 ${fieldClass} uppercase`}
                value={data.transmittalToOffice2 || ''}
                onChange={(e) => onPatch({ transmittalToOffice2: e.target.value })}
              />
            </label>
          ) : null}
        </fieldset>

        <fieldset className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-gray-700 px-1">Attn</legend>
          <label className="block">
            <span className="text-xs font-medium text-gray-700">Attn (name)</span>
            <input
              type="text"
              className={`mt-0.5 ${fieldClass} uppercase`}
              value={data.transmittalThru || ''}
              onChange={(e) => onPatch({ transmittalThru: e.target.value })}
            />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-gray-700">Attn title — line 1</span>
              <input
                type="text"
                className={`mt-0.5 ${fieldClass} uppercase`}
                value={data.transmittalThruPosition1 || ''}
                onChange={(e) => onPatch({ transmittalThruPosition1: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700">Attn title — line 2</span>
              <input
                type="text"
                className={`mt-0.5 ${fieldClass} uppercase`}
                value={data.transmittalThruPosition2 || ''}
                onChange={(e) => onPatch({ transmittalThruPosition2: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700">Attn title — line 3</span>
              <input
                type="text"
                className={`mt-0.5 ${fieldClass} uppercase`}
                value={data.transmittalThruPosition3 || ''}
                onChange={(e) => onPatch({ transmittalThruPosition3: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700">Attn title — line 4</span>
              <input
                type="text"
                className={`mt-0.5 ${fieldClass} uppercase`}
                value={data.transmittalThruPosition4 || ''}
                onChange={(e) => onPatch({ transmittalThruPosition4: e.target.value })}
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-gray-700 px-1">Civil registry (subject)</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-gray-700">Name on civil registry document</span>
              <input
                type="text"
                className={`mt-0.5 ${fieldClass} uppercase`}
                value={data.transmittalColbName || ''}
                onChange={(e) => onPatch({ transmittalColbName: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700">Registry No.</span>
              <input
                type="text"
                inputMode="text"
                autoComplete="off"
                className={`mt-0.5 ${fieldClass}`}
                value={data.transmittalRegistryNo || ''}
                onChange={(e) => onPatch({ transmittalRegistryNo: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700">Date of birth</span>
              <FlexibleFormDateInput
                className="mt-0.5"
                inputClassName={fieldClass}
                value={data.transmittalDob || ''}
                onChange={(v) => onPatch({ transmittalDob: v })}
                placeholder="May 15 2026 or dd/mm/yyyy"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-gray-700">Name of father</span>
              <input
                type="text"
                className={`mt-0.5 ${fieldClass} uppercase`}
                value={data.transmittalFather || ''}
                onChange={(e) => onPatch({ transmittalFather: e.target.value })}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-gray-700">Name of mother</span>
              <input
                type="text"
                className={`mt-0.5 ${fieldClass} uppercase`}
                value={data.transmittalMother || ''}
                onChange={(e) => onPatch({ transmittalMother: e.target.value })}
              />
            </label>
          </div>
        </fieldset>

        {signatoryDropdownPlacement === 'letter' ? (
        <fieldset className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-gray-700 px-1">Signatory (closing)</legend>
          <label className="block">
            <span className="text-xs font-medium text-gray-700">Prepared / signed by</span>
            <select
              className={`mt-0.5 ${selectClass}`}
              value={clampTransmittalSignatoryIndex(data.transmittalSignatoryOptionIndex)}
              onChange={(e) => onPatch({ transmittalSignatoryOptionIndex: Number(e.target.value) })}
            >
              {RECEIVED_BY_OPTIONS.map((row, i) => (
                <option key={row.name} value={i}>
                  {row.name} — {row.title}
                </option>
              ))}
            </select>
          </label>
        </fieldset>
        ) : null}
      </div>

      <p className="text-xs text-gray-600">
        Layout matches the printed transmittal: type and attachments on the left, request for endorsement on the right. Every row appears on the PDF; checkboxes control the blue boxes on the letter.
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-4 lg:items-start">
        <div className="lg:col-start-1 lg:row-start-1 min-w-0">
          <p className="font-bold text-sm mb-1 text-gray-900 uppercase tracking-tight">Type of Document</p>
          <table className={tableCls}>
            <tbody>
              {SUPPLEMENTAL_TRANSMITTAL_DOC_TYPE_OPTIONS.map((row) => (
                <tr key={row.id}>
                  <td className={tdBoxCls}>
                    <input
                      type="radio"
                      name="supp-transmittal-doc-type-form"
                      className="h-4 w-4"
                      checked={docType === row.id}
                      onChange={() => onPatch({ transmittalDocType: row.id })}
                    />
                  </td>
                  <td className={tdLblCls}>{row.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start min-w-0 space-y-3">
          {signatoryDropdownPlacement === 'endorsementColumn' ? (
            <fieldset className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-gray-700 px-1">Signatory (closing)</legend>
              <label className="block">
                <span className="text-xs font-medium text-gray-700">Prepared / signed by</span>
                <select
                  className={`mt-0.5 ${selectClass}`}
                  value={clampTransmittalSignatoryIndex(data.transmittalSignatoryOptionIndex)}
                  onChange={(e) => onPatch({ transmittalSignatoryOptionIndex: Number(e.target.value) })}
                >
                  {RECEIVED_BY_OPTIONS.map((row, i) => (
                    <option key={row.name} value={i}>
                      {row.name} — {row.title}
                    </option>
                  ))}
                </select>
              </label>
            </fieldset>
          ) : null}
          <p className="font-bold text-sm mb-1 text-gray-900 uppercase tracking-tight">Request for Endorsement</p>
          <table className={tableCls}>
            <tbody>
              {SUPPLEMENTAL_TRANSMITTAL_ENDORSEMENT_OPTIONS.map((row, i) => (
                <tr key={row.id}>
                  <td className={tdBoxCls}>
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={endorsementIds.includes(row.id)}
                      onChange={() => toggleId('transmittalEndorsementIds', row.id)}
                    />
                  </td>
                  <td className={tdLblCls}>
                    {i + 1}. {row.label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="lg:col-start-1 lg:row-start-2 min-w-0">
          <p className="font-bold text-sm mb-1 text-gray-900 uppercase tracking-tight">Attachments</p>
          <table className={tableCls}>
            <tbody>
              {SUPPLEMENTAL_TRANSMITTAL_ATTACHMENT_OPTIONS.map((row, i) => (
                <tr key={row.id}>
                  <td className={tdBoxCls}>
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={attachmentIds.includes(row.id)}
                      onChange={() => toggleId('transmittalAttachmentIds', row.id)}
                    />
                  </td>
                  <td className={tdLblCls}>
                    {i + 1}. {row.label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
