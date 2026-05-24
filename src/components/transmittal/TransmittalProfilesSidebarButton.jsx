import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  TRANSMITTAL_PROFILE_VARIANT,
  findTransmittalProfile,
  getSelectedTransmittalProfileFormPatch,
  getSelectedTransmittalProfileId,
  loadTransmittalProfiles,
} from '../../lib/transmittalProfileStorage'
import TransmittalProfilesModal from './TransmittalProfilesModal'

const TRANSMITTAL_PROFILE_APPLY_EVENT = 'ulsades-transmittal-profile-apply'

function str(v) {
  return String(v ?? '').trim()
}

export function resolveTransmittalContext(pathname) {
  if (pathname.startsWith('/legal-instrument/supplemental')) {
    return {
      moduleKey: 'supplemental',
      variant: TRANSMITTAL_PROFILE_VARIANT.CCR,
      showRecipientCity: true,
    }
  }
  if (pathname.startsWith('/legal-instrument/mc2010')) {
    return {
      moduleKey: 'mc2010',
      variant: TRANSMITTAL_PROFILE_VARIANT.CCR,
      showRecipientCity: false,
    }
  }
  if (pathname.startsWith('/court-decree')) {
    return {
      moduleKey: 'courtDecree',
      variant: TRANSMITTAL_PROFILE_VARIANT.STANDARD,
      showRecipientCity: true,
    }
  }
  if (pathname.startsWith('/legitimation')) {
    return {
      moduleKey: 'legitimation',
      variant: TRANSMITTAL_PROFILE_VARIANT.STANDARD,
      showRecipientCity: true,
    }
  }
  if (pathname.startsWith('/ausf')) {
    return {
      moduleKey: 'ausf',
      variant: TRANSMITTAL_PROFILE_VARIANT.STANDARD,
      showRecipientCity: true,
    }
  }
  return {
    moduleKey: 'ausf',
    variant: TRANSMITTAL_PROFILE_VARIANT.STANDARD,
    showRecipientCity: true,
  }
}

function IconTransmittalAddressee() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  )
}

/** Sync selected transmittal addressee preset into an open form. */
export function useTransmittalProfileAutoApply({ moduleKey, variant, form, onApply }) {
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

  useEffect(() => {
    const handler = (event) => {
      if (event.detail?.moduleKey !== moduleKey || !event.detail?.patch || !onApplyRef.current) return
      onApplyRef.current(event.detail.patch)
    }
    window.addEventListener(TRANSMITTAL_PROFILE_APPLY_EVENT, handler)
    return () => window.removeEventListener(TRANSMITTAL_PROFILE_APPLY_EVENT, handler)
  }, [moduleKey])
}

export function TransmittalAddresseeLayoutSidebarButton({ className = '' }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const { moduleKey, variant, showRecipientCity } = resolveTransmittalContext(location.pathname)

  const handleApply = (patch) => {
    window.dispatchEvent(
      new CustomEvent(TRANSMITTAL_PROFILE_APPLY_EVENT, {
        detail: { moduleKey, patch },
      }),
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${className} flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium w-full text-left transition relative ${
          open
            ? 'bg-white text-gray-800 border-l-4 border-[var(--primary-green)] border-t-0 border-r-0 border-b-0 pl-[11px] pr-3'
            : 'px-3 text-white/90 hover:bg-white/10 text-white'
        }`}
        aria-pressed={open}
      >
        <IconTransmittalAddressee />
        <span>Transmittal addressee</span>
      </button>
      <TransmittalProfilesModal
        isOpen={open}
        onClose={() => setOpen(false)}
        moduleKey={moduleKey}
        variant={variant}
        onApply={handleApply}
        showRecipientCity={showRecipientCity}
      />
    </>
  )
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

  useTransmittalProfileAutoApply({ moduleKey, variant, form, onApply })

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
