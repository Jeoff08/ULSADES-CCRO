import React, { useEffect, useState } from 'react'
import ToastHost from '../toast/ToastHost'
import { useToasts } from '../toast/useToasts'
import { lcroStaffTitleForPrint, normalizeLcroStaffTitle } from '../../lib/printUtils'
import {
  rememberLcroStaffName,
  saveLcroStaffProfile,
} from '../../lib/lcroStaffStorage'

/**
 * Editable LCR “Verified by” block (name + title) with green Save / Saved beside the fields (screen only).
 */
export default function LcrVerifiedByEditor({
  name = '',
  title = '',
  onSave,
  storageScope = 'courtDecree',
  defaultName = 'SHIRLY L. DEMECILLO',
  defaultTitle = 'LCRO Staff',
  label = 'Verified by:',
  labelClassName = 'font-bold text-sm mb-0.5 self-start',
  printNameClassName = 'court-decree-lcr-signatory-name font-bold text-sm inline-block m-0 p-0 leading-[1.15]',
  printTitleClassName = 'court-decree-lcr-signatory-title text-xs m-0 p-0 leading-[1.15]',
  blockClassName = '',
  namePlaceholder = 'Name',
  titlePlaceholder = 'Title (e.g. LCRO Staff)',
  uppercasePrintName = false,
  toastMessage = 'LCR verified by updated.',
}) {
  const { toasts, show, dismiss } = useToasts()
  const savedName = String(name ?? '').trim()
  const savedTitle = normalizeLcroStaffTitle(title)
  const [draftName, setDraftName] = useState(savedName || defaultName)
  const [draftTitle, setDraftTitle] = useState(savedTitle || defaultTitle)

  useEffect(() => {
    setDraftName(savedName || defaultName)
    setDraftTitle(savedTitle || defaultTitle)
  }, [savedName, savedTitle, defaultName, defaultTitle])

  const isDirty =
    draftName.trim() !== savedName || normalizeLcroStaffTitle(draftTitle) !== savedTitle

  const printNameRaw = savedName || defaultName
  const printName = uppercasePrintName ? printNameRaw.toUpperCase() : printNameRaw
  const printTitle = lcroStaffTitleForPrint(savedTitle || defaultTitle)

  const handleSave = () => {
    if (!isDirty || !onSave) return
    const nextName = draftName.trim()
    const nextTitle = normalizeLcroStaffTitle(draftTitle)
    onSave({
      certificateSignatoryName: nextName,
      certificateSignatoryTitle: nextTitle,
      verifiedByName: nextName,
      verifiedByTitle: nextTitle,
    })
    if (nextName) {
      rememberLcroStaffName(nextName, storageScope)
      saveLcroStaffProfile(nextName, nextTitle, storageScope)
    }
    show({ type: 'success', title: 'Saved', message: toastMessage })
  }

  return (
    <>
    <ToastHost toasts={toasts} onDismiss={dismiss} />
    <div className={`flex flex-col self-start gap-0 ${blockClassName}`.trim()}>
      <p className={labelClassName}>{label}</p>
      {onSave ? (
        <div className="no-print mb-1 flex gap-2 items-start self-start w-full max-w-[16rem]">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty}
            aria-label={isDirty ? 'Save verified by' : 'Verified by saved'}
            className={[
              'shrink-0 px-3 py-2 rounded-lg border-2 text-xs font-semibold transition-colors min-w-[4.75rem]',
              isDirty
                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                : 'border-emerald-600 bg-emerald-600 text-white cursor-default',
            ].join(' ')}
          >
            {isDirty ? 'Save' : 'Saved'}
          </button>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder={namePlaceholder}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-bold uppercase bg-white"
              autoComplete="off"
            />
            <input
              type="text"
              value={draftTitle}
              onChange={(e) =>
                setDraftTitle(String(e.target.value ?? '').replace(/\bLCRO\s*-\s*Staff\b/gi, 'LCRO Staff'))
              }
              placeholder={titlePlaceholder}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white"
              autoComplete="off"
            />
          </div>
        </div>
      ) : null}
      <p className={printNameClassName}>{printName}</p>
      <p className={printTitleClassName}>{printTitle}</p>
    </div>
    </>
  )
}
