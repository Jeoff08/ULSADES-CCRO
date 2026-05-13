import React, { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { afterUnsavedAcknowledge, useWarnIfUnsaved } from '../../hooks/useWarnIfUnsaved'
import {
  getActiveSupplementalId,
  getSupplementalDraft,
  saveOrUpdateSupplemental,
  saveSupplementalDraft,
} from './lib/supplementalSavedStorage'
import {
  getDefaultSupplementalTransmittalFields,
  pickTransmittalStateFromDraft,
} from './lib/supplementalTransmittalDefaults'
import { defaultLegitimation } from '../legitimation/lib/legitimationDefaults'
import { defaultCourtDecree } from '../courtDecree/lib/courtDecreeDefaults'
import { applyEnableLcrType } from './lib/supplementalEnableLcr'
import SupplementalLcrWorksheetPanel from './SupplementalLcrWorksheetPanel'

const defaultSupplementalDraft = {
  supplementType: 'geographical',
  colbSubject: 'self',
  subjectColbName: '',
  regNo: '',
  possessive: 'my',
  civilStatus: 'single',
  cityLine: '',
  affiantName: '',
  residenceAddress: '',
  registeredAt: '',
  regMonth: '',
  regDay: '',
  regYear: '',
  registeredOn: '',
  missingGeo: '',
  correctedGeo: '',
  includeForm1a: false,
  lcrType: '1A',
  lcrData: { ...defaultLegitimation },
  lcrSource: '',
  lcrSourceId: '',
  lcrPrefillLabel: '',
  ...getDefaultSupplementalTransmittalFields(),
}

const SUPPLEMENTAL_MAIN = '/legal-instrument/supplemental'

export default function SupplementalLcrWorksheetPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeSavedId = getActiveSupplementalId()
  const [form, setForm] = useState(() => {
    const loaded = getSupplementalDraft(defaultSupplementalDraft)
    return { ...loaded, ...pickTransmittalStateFromDraft(loaded) }
  })
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [dirtyBaselineTick, setDirtyBaselineTick] = useState(0)

  useEffect(() => {
    const id = setTimeout(() => setDirtyBaselineTick((x) => x + 1), 120)
    return () => clearTimeout(id)
  }, [location.key, activeSavedId])

  const acknowledgeSaved = useWarnIfUnsaved(form, [location.key, activeSavedId, dirtyBaselineTick])

  useEffect(() => {
    const loaded = getSupplementalDraft(defaultSupplementalDraft)
    const next = { ...loaded, ...pickTransmittalStateFromDraft(loaded) }
    saveSupplementalDraft(next)
    setForm(next)
  }, [location.key])

  const supType = String(form.supplementType || '').toLowerCase()
  const showForm1a =
    form.includeForm1a === true || (supType === 'sex' && form.includeForm1a === undefined)

  const onPatch = (patch) => {
    setForm((prev) => {
      const next = { ...prev, ...patch }
      saveSupplementalDraft(next)
      return next
    })
  }

  const handleEnableLcr = (type) => {
    setForm((prev) => {
      const next = applyEnableLcrType(prev, type)
      saveSupplementalDraft(next)
      return next
    })
  }

  const handleLcrSourceModuleChange = (v) => {
    setForm((prev) => {
      let next = { ...prev, lcrSource: v, lcrSourceId: '', lcrPrefillLabel: '' }
      if ((v === 'ausf' || v === 'legitimation') && next.lcrType !== '1A') {
        next = applyEnableLcrType(next, '1A')
      }
      saveSupplementalDraft(next)
      return next
    })
  }

  const handleRemoveLcr = () => {
    setForm((prev) => {
      const next = { ...prev, includeForm1a: false, lcrSourceId: '', lcrPrefillLabel: '', lcrSource: '' }
      saveSupplementalDraft(next)
      return next
    })
    navigate(SUPPLEMENTAL_MAIN)
  }

  const handleSave = () => {
    saveSupplementalDraft(form)
    saveOrUpdateSupplemental(form)
    acknowledgeSaved()
    setConfirmOpen(true)
  }

  if (!showForm1a) {
    return <Navigate to={SUPPLEMENTAL_MAIN} replace />
  }

  return (
    <div className="supplemental-form-page supplemental-lcr-page no-print min-h-[calc(100vh-6rem)]">
      <div className="legitimation-form-page__card max-w-5xl mx-auto">
        <header className="legitimation-form-page__header no-print border-b border-emerald-100">
          <h1>LCR worksheet — Supplemental Report</h1>
          <p className="text-sm text-gray-600 mt-1">
            Form {form.lcrType} only. Affidavit and transmittal stay on the{' '}
            <Link to={SUPPLEMENTAL_MAIN} className="text-[var(--primary-blue)] font-semibold hover:underline">
              Supplemental form
            </Link>
            .
          </p>
        </header>

        <div className="legitimation-form-page__body space-y-6 p-4 sm:p-6">
          {activeSavedId ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Editing saved supplemental file — LCR changes are kept in the same draft until you save.
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to={SUPPLEMENTAL_MAIN}
              className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-800 bg-white hover:bg-gray-50"
            >
              Back to Supplemental form
            </Link>
            <button
              type="button"
              onClick={handleRemoveLcr}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-700 bg-white hover:bg-red-50"
            >
              Remove LCR from file
            </button>
          </div>

          <SupplementalLcrWorksheetPanel
            form={form}
            onPatch={onPatch}
            onLcrTypeChange={handleEnableLcr}
            onLcrSourceModuleChange={handleLcrSourceModuleChange}
          />

          <div className="ausf-form-page__actions flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="ausf-form-page__btn ausf-form-page__btn--primary px-4 py-2.5 text-sm font-medium"
            >
              Save
            </button>
            {activeSavedId ? (
              <button
                type="button"
                onClick={() =>
                  afterUnsavedAcknowledge(acknowledgeSaved, () => navigate('/legal-instrument/supplemental/saved'))
                }
                className="ausf-form-page__btn ausf-form-page__btn--secondary px-4 py-2.5 text-sm font-medium"
              >
                Back to saved files
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-200">
            <div className="p-5">
              <h3 className="text-base font-semibold text-gray-900">Saved</h3>
              <p className="mt-1 text-sm text-gray-600">
                {activeSavedId
                  ? 'Your changes have been saved. Continue to print output?'
                  : 'Your Supplemental Report draft has been saved. Continue to print output?'}
              </p>
            </div>
            <div className="px-5 pb-5 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false)
                  afterUnsavedAcknowledge(acknowledgeSaved, () => navigate('/legal-instrument/supplemental/saved'))
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    afterUnsavedAcknowledge(acknowledgeSaved, () => navigate('/legal-instrument/supplemental/print'))
                  }
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-[var(--primary-blue)] text-white hover:bg-[var(--primary-blue-light)]"
                >
                  Continue to Print
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
