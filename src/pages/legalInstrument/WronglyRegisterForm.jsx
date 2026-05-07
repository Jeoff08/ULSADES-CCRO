import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SupplementalTransmittalFieldsEditor from './SupplementalTransmittalFieldsEditor'
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

const defaultWronglyRegisterDraft = {
  ...getDefaultSupplementalTransmittalFields(),
}

export default function WronglyRegisterForm() {
  const navigate = useNavigate()
  const activeSavedId = getActiveWronglyRegisterId()
  const [form, setForm] = useState(() => {
    const loaded = getWronglyRegisterDraft(defaultWronglyRegisterDraft)
    return { ...loaded, ...pickTransmittalStateFromDraft(loaded) }
  })

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
    navigate('/legal-instrument/wrongly-register/print')
  }

  return (
    <div className="supplemental-form-page no-print">
      <div className="legitimation-form-page__card">
        <header className="legitimation-form-page__header no-print">
          <h1>Wrongly Register</h1>
          <p>Transmittal (CCR letter)</p>
        </header>
        <div className="legitimation-form-page__body supplemental-form-page-content">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <p className="text-sm text-gray-600">
              Fill out the transmittal, then save. Layout matches the Supplemental transmittal editor.
            </p>
            {activeSavedId ? (
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm font-semibold">
                Editing saved file
              </span>
            ) : null}
          </div>

          <SupplementalTransmittalFieldsEditor
            data={form}
            onPatch={onPatch}
            inputClass="legitimation-form-page__input"
            showRecipientCity
          />

          <div className="flex flex-wrap gap-2 pt-2">
            <button type="button" onClick={handleSave} className="ausf-form-page__btn">
              Save &amp; View Output
            </button>
            <button
              type="button"
              onClick={() => {
                clearWronglyRegisterActive()
                setForm(defaultWronglyRegisterDraft)
                saveWronglyRegisterDraft(defaultWronglyRegisterDraft)
              }}
              className="ausf-form-page__btn ausf-form-page__btn--secondary"
            >
              Reset to new
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

