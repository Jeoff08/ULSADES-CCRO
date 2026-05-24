import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import ConfirmRemoveRowModal from '../ConfirmRemoveRowModal'
import ToastHost from '../toast/ToastHost'
import { useToasts } from '../toast/useToasts'
import {
  TRANSMITTAL_PROFILE_VARIANT,
  createEmptyCcrProfile,
  createEmptyStandardProfile,
  findTransmittalProfile,
  getSelectedTransmittalProfileId,
  listProfilesForVariant,
  loadTransmittalProfiles,
  profileToFormPatchFromProfile,
  restoreMissingPsaDefaultTransmittalProfiles,
  saveTransmittalProfiles,
  setSelectedTransmittalProfileId,
  syncStandardProfilePsaToRecipient,
} from '../../lib/transmittalProfileStorage'
import { LOCAL_TRANSMITTAL_TO_PSA_LINES } from '../../lib/transmittalLocalAddressee'

const fieldClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:border-[var(--primary-blue)] focus:ring-1 focus:ring-[var(--primary-blue)]/30 outline-none'

function StandardProfileFields({ draft, onChange }) {
  const setLine = (key, value) => onChange({ ...draft, [key]: value })
  return (
    <div className="space-y-3 text-sm">
      <p className="text-xs text-gray-600">To (six lines)</p>
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <label key={n} className="block">
          <span className="text-xs font-medium text-gray-600">Line {n}</span>
          <input
            type="text"
            className={`${fieldClass} mt-0.5`}
            value={draft[`transmittalToPsaLine${n}`] ?? ''}
            onChange={(e) => setLine(`transmittalToPsaLine${n}`, e.target.value)}
          />
        </label>
      ))}
      <p className="text-xs text-gray-600 pt-1">ATTN</p>
      <label className="block">
        <span className="text-xs font-medium text-gray-600">Prefix</span>
        <input
          type="text"
          className={`${fieldClass} mt-0.5 max-w-[8rem]`}
          value={draft.transmittalAttnPrefix ?? ''}
          onChange={(e) => setLine('transmittalAttnPrefix', e.target.value)}
        />
      </label>
      {[1, 2, 3].map((n) => (
        <label key={`attn-${n}`} className="block">
          <span className="text-xs font-medium text-gray-600">ATTN line {n}</span>
          <input
            type="text"
            className={`${fieldClass} mt-0.5`}
            value={draft[`transmittalAttnLine${n}`] ?? ''}
            onChange={(e) => setLine(`transmittalAttnLine${n}`, e.target.value)}
          />
        </label>
      ))}
    </div>
  )
}

function CcrProfileFields({ draft, onChange, showRecipientCity }) {
  const set = (key, value) => onChange({ ...draft, [key]: value })
  return (
    <div className="space-y-3 text-sm">
      <label className="block">
        <span className="text-xs font-medium text-gray-600">Addressee name</span>
        <input
          type="text"
          className={`${fieldClass} mt-0.5 uppercase`}
          value={draft.transmittalRecipient ?? ''}
          onChange={(e) => set('transmittalRecipient', e.target.value)}
        />
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-medium text-gray-600">Position — line 1</span>
          <input
            type="text"
            className={`${fieldClass} mt-0.5 uppercase`}
            value={draft.transmittalToPosition1 ?? ''}
            onChange={(e) => set('transmittalToPosition1', e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-gray-600">Position — line 2</span>
          <input
            type="text"
            className={`${fieldClass} mt-0.5 uppercase`}
            value={draft.transmittalToPosition2 ?? ''}
            onChange={(e) => set('transmittalToPosition2', e.target.value)}
          />
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-medium text-gray-600">Office / agency</span>
        <input
          type="text"
          className={`${fieldClass} mt-0.5 uppercase`}
          value={draft.transmittalToOffice1 ?? ''}
          onChange={(e) => set('transmittalToOffice1', e.target.value)}
        />
      </label>
      {showRecipientCity ? (
        <label className="block">
          <span className="text-xs font-medium text-gray-600">City</span>
          <input
            type="text"
            className={`${fieldClass} mt-0.5 uppercase`}
            value={draft.transmittalToOffice2 ?? ''}
            onChange={(e) => set('transmittalToOffice2', e.target.value)}
          />
        </label>
      ) : null}
      <label className="block">
        <span className="text-xs font-medium text-gray-600">Attn (name)</span>
        <input
          type="text"
          className={`${fieldClass} mt-0.5 uppercase`}
          value={draft.transmittalThru ?? ''}
          onChange={(e) => set('transmittalThru', e.target.value)}
        />
      </label>
      {[1, 2, 3, 4].map((n) => (
        <label key={n} className="block">
          <span className="text-xs font-medium text-gray-600">Attn title — line {n}</span>
          <input
            type="text"
            className={`${fieldClass} mt-0.5 uppercase`}
            value={draft[`transmittalThruPosition${n}`] ?? ''}
            onChange={(e) => set(`transmittalThruPosition${n}`, e.target.value)}
          />
        </label>
      ))}
    </div>
  )
}

export default function TransmittalProfilesModal({
  isOpen,
  onClose,
  moduleKey,
  variant,
  onApply,
  showRecipientCity = true,
}) {
  const [profiles, setProfiles] = useState(() => loadTransmittalProfiles())
  const [selectedId, setSelectedId] = useState(() => getSelectedTransmittalProfileId(moduleKey))
  const [draft, setDraft] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const undoDeleteRef = useRef(null)
  const { toasts, show, dismiss } = useToasts()

  const variantProfiles = useMemo(() => listProfilesForVariant(profiles, variant), [profiles, variant])

  const refresh = useCallback(() => {
    setProfiles(loadTransmittalProfiles())
  }, [])

  useEffect(() => {
    if (!isOpen) return
    refresh()
    const id = getSelectedTransmittalProfileId(moduleKey)
    setSelectedId(id)
    const list = listProfilesForVariant(loadTransmittalProfiles(), variant)
    const found = findTransmittalProfile(list, id) || list[0]
    setDraft(found ? { ...found } : null)
  }, [isOpen, moduleKey, variant, refresh])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const persistProfiles = (next) => {
    saveTransmittalProfiles(next)
    setProfiles(next)
  }

  const applyProfileToForm = useCallback(
    (profile) => {
      const patch = profileToFormPatchFromProfile(profile)
      if (patch && onApply) onApply(patch)
    },
    [onApply],
  )

  const selectProfile = useCallback(
    (id, profilesOverride = null) => {
      setSelectedId(id)
      setSelectedTransmittalProfileId(moduleKey, id)
      const list = listProfilesForVariant(profilesOverride ?? loadTransmittalProfiles(), variant)
      const p = findTransmittalProfile(list, id)
      if (p) {
        setDraft({ ...p })
        applyProfileToForm(p)
      }
    },
    [variant, moduleKey, applyProfileToForm],
  )

  const handleSaveDraft = () => {
    if (!draft?.id) return
    const synced =
      draft.variant === TRANSMITTAL_PROFILE_VARIANT.STANDARD
        ? syncStandardProfilePsaToRecipient(draft)
        : draft
    const saved = { ...synced, name: String(synced.name || '').trim() || 'Untitled' }
    setProfiles((prev) => {
      const next = prev.map((p) => (p.id === saved.id ? saved : p))
      saveTransmittalProfiles(next)
      return next
    })
    setDraft(saved)
    applyProfileToForm(saved)
    show({
      type: 'success',
      title: 'Changes saved',
      message: `"${saved.name}" was saved on this computer.`,
      durationMs: 4000,
    })
  }

  const handleRestorePsaDefault = () => {
    const { profiles: next, restored } = restoreMissingPsaDefaultTransmittalProfiles(profiles)
    setProfiles(next)
    const list = listProfilesForVariant(next, variant)
    const psaKey = String(LOCAL_TRANSMITTAL_TO_PSA_LINES[0] ?? '').trim()
    const psaDefault = list.find(
      (p) => String(p.transmittalToPsaLine1 ?? p.transmittalRecipient ?? '').trim() === psaKey,
    )
    if (psaDefault) selectProfile(psaDefault.id, next)
    else if (list[0]) selectProfile(list[0].id, next)
    show({
      type: restored ? 'success' : 'info',
      title: restored ? 'PSA default restored' : 'PSA default already saved',
      message: restored
        ? 'Minerva Eloisa P. Esquivas and ATTN Marizza B. Grande are back in your saved list.'
        : 'Your saved list already includes the PSA national statistician addressee.',
      durationMs: 5000,
    })
  }

  const handleAdd = () => {
    const created =
      variant === TRANSMITTAL_PROFILE_VARIANT.CCR
        ? createEmptyCcrProfile('New addressee')
        : createEmptyStandardProfile('New addressee')
    const next = [...profiles, created]
    persistProfiles(next)
    selectProfile(created.id, next)
  }

  const handleUndoDelete = useCallback(() => {
    const snap = undoDeleteRef.current
    if (!snap) return
    saveTransmittalProfiles(snap.profiles)
    setProfiles(snap.profiles)
    if (snap.moduleSelectedId === snap.deletedProfile.id) {
      setSelectedTransmittalProfileId(moduleKey, snap.deletedProfile.id)
    }
    setSelectedId(snap.deletedProfile.id)
    setDraft({ ...snap.deletedProfile })
    undoDeleteRef.current = null
  }, [moduleKey])

  const requestDelete = () => {
    if (!draft?.id) return
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (!draft?.id) return
    const deletedProfile = profiles.find((p) => p.id === draft.id)
    if (!deletedProfile) {
      setDeleteConfirmOpen(false)
      return
    }

    const snapshot = {
      profiles: profiles.map((p) => ({ ...p })),
      deletedProfile: { ...deletedProfile },
      selectedId,
      moduleSelectedId: getSelectedTransmittalProfileId(moduleKey),
    }

    const next = profiles.filter((p) => p.id !== draft.id)
    persistProfiles(next)

    undoDeleteRef.current = snapshot

    const remaining = listProfilesForVariant(next, variant)
    const nextId = remaining[0]?.id || ''
    selectProfile(nextId, next)
    if (!nextId) setDraft(null)

    setDeleteConfirmOpen(false)

    show({
      type: 'info',
      title: 'Addressee removed',
      message: `"${deletedProfile.name || 'Untitled'}" was removed. You can undo within 8 seconds.`,
      actionLabel: 'Undo',
      durationMs: 8000,
      onAction: handleUndoDelete,
    })
  }

  const handleApply = () => {
    if (!draft) return
    const synced =
      draft.variant === TRANSMITTAL_PROFILE_VARIANT.STANDARD
        ? syncStandardProfilePsaToRecipient(draft)
        : draft
    const saved = { ...synced, name: String(synced.name || '').trim() || 'Untitled' }
    setProfiles((prev) => {
      const next = prev.map((p) => (p.id === saved.id ? saved : p))
      saveTransmittalProfiles(next)
      return next
    })
    setDraft(saved)
    applyProfileToForm(saved)
    onClose()
  }

  if (!isOpen) return null

  return createPortal(
    <>
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        className="relative flex flex-col w-full max-w-2xl max-h-[min(90vh,820px)] bg-white rounded-2xl shadow-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transmittal-profiles-title"
      >
        <div className="shrink-0 px-5 py-4 border-b border-gray-200">
          <h2 id="transmittal-profiles-title" className="text-lg font-bold text-gray-900">
            Transmittal addressee (optional)
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Save addressee blocks on this computer. Pick one to use on this form; you can still edit fields on the form or here.
          </p>
        </div>

        <div className="flex flex-1 min-h-0 flex-col sm:flex-row">
          <div className="sm:w-52 shrink-0 border-b sm:border-b-0 sm:border-r border-gray-200 p-3 overflow-y-auto flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 px-1">Saved</p>
            {variantProfiles.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => selectProfile(p.id)}
                className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                  selectedId === p.id
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-[var(--primary-blue)]/15'
                    : 'border-gray-200 bg-white hover:bg-emerald-50/40 hover:border-emerald-300 text-gray-800'
                }`}
              >
                <span className="font-semibold block truncate">{p.name || 'Untitled'}</span>
                <span className="text-xs text-gray-500 block truncate mt-0.5">
                  {variant === TRANSMITTAL_PROFILE_VARIANT.CCR
                    ? (p.transmittalRecipient || '—')
                    : (p.transmittalToPsaLine1 || '—')}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={handleRestorePsaDefault}
              className="w-full rounded-lg border border-emerald-400 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
            >
              Restore PSA default (Minerva / Marizza)
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="w-full rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-[var(--primary-blue)] hover:bg-blue-50/60"
            >
              + Add addressee
            </button>
          </div>

          <div className="flex-1 min-w-0 p-4 overflow-y-auto">
            {draft ? (
              <>
                <label className="block mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Label</span>
                  <input
                    type="text"
                    className={`${fieldClass} mt-1 font-semibold`}
                    value={draft.name ?? ''}
                    onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. PSA Quezon City"
                  />
                </label>
                {draft.variant === TRANSMITTAL_PROFILE_VARIANT.CCR ? (
                  <CcrProfileFields
                    draft={draft}
                    onChange={setDraft}
                    showRecipientCity={showRecipientCity}
                  />
                ) : (
                  <StandardProfileFields draft={draft} onChange={setDraft} />
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">Add a saved addressee to get started.</p>
            )}
          </div>
        </div>

        <div className="shrink-0 flex flex-wrap gap-2 px-5 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
          >
            Close
          </button>
          {draft ? (
            <>
              <button
                type="button"
                onClick={requestDelete}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-red-700 bg-white border border-red-200 hover:bg-red-50"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-emerald-800 bg-white border border-emerald-400 hover:bg-emerald-50 transition-colors"
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="ml-auto px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--primary-blue)] hover:bg-[var(--primary-blue-light)] transition-colors"
              >
                Use on this form
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>

    {deleteConfirmOpen && draft ? (
      <ConfirmRemoveRowModal
        overlayClassName="z-[20010]"
        title="Remove this addressee?"
        message={`"${draft.name || 'Untitled'}" will be removed from your saved list on this computer. You can undo for 8 seconds after you confirm.`}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        confirmLabel="Remove addressee"
      />
    ) : null}

    <ToastHost toasts={toasts} onDismiss={dismiss} className="z-[20010]" />
    </>,
    document.body,
  )
}
