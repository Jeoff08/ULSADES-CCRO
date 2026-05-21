import React, { useEffect, useRef, useState } from 'react'
import {
  findTransmittalProfile,
  getSelectedTransmittalProfileFormPatch,
  getSelectedTransmittalProfileId,
  loadTransmittalProfiles,
} from '../../lib/transmittalProfileStorage'
import TransmittalProfilesModal from './TransmittalProfilesModal'

function str(v) {
  return String(v ?? '').trim()
}

/**
 * Left-sidebar control: optional saved transmittal addressee presets (modal).
 * Applies the selected preset into the parent form transmittal fields when appropriate.
 */
export default function TransmittalProfilesSidebarButton({
  moduleKey,
  variant,
  onApply,
  form,
  showRecipientCity = true,
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const selectedId = getSelectedTransmittalProfileId(moduleKey)
  const selectedName = findTransmittalProfile(loadTransmittalProfiles(), selectedId)?.name
  const onApplyRef = useRef(onApply)
  onApplyRef.current = onApply

  useEffect(() => {
    if (!form || !onApplyRef.current) return undefined
    const selected = getSelectedTransmittalProfileId(moduleKey)
    if (!selected || str(form.transmittalProfileId) === selected) return undefined
    const patch = getSelectedTransmittalProfileFormPatch(moduleKey, variant)
    if (patch) onApplyRef.current(patch)
    return undefined
  }, [form, moduleKey, variant, form?.transmittalProfileId])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[
          'w-full text-left rounded-xl border-2 px-4 py-3.5 shadow-sm transition-all',
          'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-[var(--primary-blue)]/20',
          'hover:bg-emerald-100 hover:border-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-blue)]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="block text-sm font-bold">Manage transmittal addressee</span>
        <span className="block text-xs text-emerald-900/80 mt-1 leading-snug">
          Opens a window to add, edit, or pick saved To / ATTN text (optional)
          {selectedName ? (
            <>
              <br />
              <span className="font-semibold text-[var(--primary-blue)]">Selected: {selectedName}</span>
            </>
          ) : null}
        </span>
      </button>
      <TransmittalProfilesModal
        isOpen={open}
        onClose={() => setOpen(false)}
        moduleKey={moduleKey}
        variant={variant}
        onApply={onApply}
        showRecipientCity={showRecipientCity}
      />
    </>
  )
}
