import React, { useState, useMemo } from 'react'
import ConfirmRemoveRowModal from '../../components/ConfirmRemoveRowModal'
import FlexibleFormDateInput from '../../components/forms/FlexibleFormDateInput'
import {
  SUPPLEMENTAL_TRANSMITTAL_DOC_TYPE_OPTIONS,
  SUPPLEMENTAL_TRANSMITTAL_SALUTATION_PRESETS,
  RECEIVED_BY_OPTIONS,
  clampTransmittalSignatoryIndex,
  createTransmittalCustomChecklistRow,
  getVisibleTransmittalAttachmentRows,
  getVisibleTransmittalEndorsementRows,
  isTransmittalCustomChecklistRow,
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
  const visibleEndorsementRows = getVisibleTransmittalEndorsementRows(data)
  const visibleAttachmentRows = getVisibleTransmittalAttachmentRows(data)
  const extraEndorsements = Array.isArray(data.transmittalExtraEndorsements) ? data.transmittalExtraEndorsements : []
  const extraAttachments = Array.isArray(data.transmittalExtraAttachments) ? data.transmittalExtraAttachments : []

  const toggleId = (key, id) => {
    const cur = Array.isArray(data[key]) ? data[key] : []
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    onPatch({ [key]: next })
  }

  const fieldClass = inputClass || 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white'
  const selectClass = fieldClass.replace('bg-white', 'bg-white cursor-pointer')
  const listAddBtnCls =
    'mt-2 inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg border border-[var(--primary-blue)] bg-white px-3 py-2 text-sm font-medium text-[var(--primary-blue)] hover:bg-[var(--primary-blue)]/10 transition-colors'
  const listRemoveBtnCls =
    'inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50'

  const addEndorsementRow = () => {
    const row = createTransmittalCustomChecklistRow('endorsement')
    onPatch({
      transmittalExtraEndorsements: [...extraEndorsements, row],
      transmittalEndorsementIds: [...endorsementIds, row.id],
    })
  }

  const addAttachmentRow = () => {
    const row = createTransmittalCustomChecklistRow('attachment')
    onPatch({
      transmittalExtraAttachments: [...extraAttachments, row],
      transmittalAttachmentIds: [...attachmentIds, row.id],
    })
  }

  const removeEndorsementRow = (rowId) => {
    if (isTransmittalCustomChecklistRow(rowId, extraEndorsements)) {
      onPatch({
        transmittalExtraEndorsements: extraEndorsements.filter((r) => r.id !== rowId),
        transmittalEndorsementIds: endorsementIds.filter((id) => id !== rowId),
      })
      return
    }
    const hidden = Array.isArray(data.transmittalHiddenEndorsementIds) ? data.transmittalHiddenEndorsementIds : []
    onPatch({
      transmittalHiddenEndorsementIds: hidden.includes(rowId) ? hidden : [...hidden, rowId],
      transmittalEndorsementIds: endorsementIds.filter((id) => id !== rowId),
    })
  }

  const removeAttachmentRow = (rowId) => {
    if (isTransmittalCustomChecklistRow(rowId, extraAttachments)) {
      onPatch({
        transmittalExtraAttachments: extraAttachments.filter((r) => r.id !== rowId),
        transmittalAttachmentIds: attachmentIds.filter((id) => id !== rowId),
      })
      return
    }
    const hidden = Array.isArray(data.transmittalHiddenAttachmentIds) ? data.transmittalHiddenAttachmentIds : []
    onPatch({
      transmittalHiddenAttachmentIds: hidden.includes(rowId) ? hidden : [...hidden, rowId],
      transmittalAttachmentIds: attachmentIds.filter((id) => id !== rowId),
    })
  }

  const updateCustomEndorsementLabel = (rowId, label) => {
    onPatch({
      transmittalExtraEndorsements: extraEndorsements.map((r) => (r.id === rowId ? { ...r, label } : r)),
    })
  }

  const updateCustomAttachmentLabel = (rowId, label) => {
    onPatch({
      transmittalExtraAttachments: extraAttachments.map((r) => (r.id === rowId ? { ...r, label } : r)),
    })
  }

  const [removeConfirm, setRemoveConfirm] = useState(null)

  const requestRemoveEndorsementRow = (rowId) => {
    setRemoveConfirm({ kind: 'endorsement', rowId })
  }

  const requestRemoveAttachmentRow = (rowId) => {
    setRemoveConfirm({ kind: 'attachment', rowId })
  }

  const confirmRemoveRow = () => {
    if (!removeConfirm) return
    if (removeConfirm.kind === 'endorsement') removeEndorsementRow(removeConfirm.rowId)
    else removeAttachmentRow(removeConfirm.rowId)
    setRemoveConfirm(null)
  }

  const removeConfirmLabel = useMemo(() => {
    if (!removeConfirm) return ''
    const rows =
      removeConfirm.kind === 'endorsement' ? visibleEndorsementRows : visibleAttachmentRows
    const row = rows.find((r) => r.id === removeConfirm.rowId)
    return String(row?.label || '').trim()
  }, [removeConfirm, visibleEndorsementRows, visibleAttachmentRows])

  const removeConfirmTitle =
    removeConfirm?.kind === 'endorsement' ? 'Remove endorsement row?' : 'Remove attachment row?'

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
              {visibleEndorsementRows.map((row, i) => {
                const isCustom = isTransmittalCustomChecklistRow(row.id, extraEndorsements)
                return (
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
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                        <span className="shrink-0">{i + 1}.</span>
                        {isCustom ? (
                          <input
                            type="text"
                            className="w-full min-w-0 border border-gray-300 rounded px-2 py-1 text-sm uppercase"
                            value={row.label || ''}
                            onChange={(e) => updateCustomEndorsementLabel(row.id, e.target.value)}
                            placeholder="Endorsement label"
                          />
                        ) : (
                          <span>{row.label}</span>
                        )}
                        <button
                          type="button"
                          onClick={() => requestRemoveEndorsementRow(row.id)}
                          className={listRemoveBtnCls}
                          aria-label={`Remove endorsement row ${i + 1}`}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <button type="button" onClick={addEndorsementRow} className={listAddBtnCls} aria-label="Add endorsement row">
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
            </svg>
            Add endorsement
          </button>
        </div>
        <div className="lg:col-start-1 lg:row-start-2 min-w-0">
          <p className="font-bold text-sm mb-1 text-gray-900 uppercase tracking-tight">Attachments</p>
          <table className={tableCls}>
            <tbody>
              {visibleAttachmentRows.map((row, i) => {
                const isCustom = isTransmittalCustomChecklistRow(row.id, extraAttachments)
                return (
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
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                        <span className="shrink-0">{i + 1}.</span>
                        {isCustom ? (
                          <input
                            type="text"
                            className="w-full min-w-0 border border-gray-300 rounded px-2 py-1 text-sm uppercase"
                            value={row.label || ''}
                            onChange={(e) => updateCustomAttachmentLabel(row.id, e.target.value)}
                            placeholder="Attachment label"
                          />
                        ) : (
                          <span>{row.label}</span>
                        )}
                        <button
                          type="button"
                          onClick={() => requestRemoveAttachmentRow(row.id)}
                          className={listRemoveBtnCls}
                          aria-label={`Remove attachment row ${i + 1}`}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <button type="button" onClick={addAttachmentRow} className={listAddBtnCls} aria-label="Add attachment row">
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
            </svg>
            Add attachment
          </button>
        </div>
      </div>
      {removeConfirm ? (
        <ConfirmRemoveRowModal
          title={removeConfirmTitle}
          message={
            removeConfirmLabel
              ? `Are you sure you want to remove "${removeConfirmLabel}"? This row will be removed from the transmittal checklist.`
              : 'Are you sure you want to remove this row from the transmittal checklist?'
          }
          onCancel={() => setRemoveConfirm(null)}
          onConfirm={confirmRemoveRow}
        />
      ) : null}
    </section>
  )
}
