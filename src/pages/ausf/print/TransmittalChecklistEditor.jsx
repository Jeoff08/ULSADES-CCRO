import React, { useState, useCallback, useEffect, useMemo } from 'react'
import ConfirmRemoveRowModal from '../../../components/ConfirmRemoveRowModal'
import {
  loadTransmittalChecklist,
  saveTransmittalChecklist,
  labelsToChecklistItems,
  createEmptyChecklistItem,
} from '../lib/transmittalChecklistStorage'

/**
 * Editable checklist for transmittal attachments. Only checked items are included in the printed letter.
 * Persists per isOutOfTown (and optional listId for court decree, etc.).
 */
export default function TransmittalChecklistEditor({
  isOutOfTown,
  defaultLabels,
  onCheckedLabelsChange,
  listId,
}) {
  const [items, setItems] = useState(() => {
    const loaded = loadTransmittalChecklist(isOutOfTown, defaultLabels, listId)
    if (loaded && loaded.length > 0) return loaded
    return labelsToChecklistItems(defaultLabels || [])
  })

  const persist = useCallback(
    (nextItems) => {
      setItems(nextItems)
      saveTransmittalChecklist(nextItems, isOutOfTown, listId)
      const checked = nextItems
        .filter((i) => i.completed && String(i.label || '').trim())
        .map((i) => String(i.label).trim())
      onCheckedLabelsChange?.(checked)
    },
    [isOutOfTown, onCheckedLabelsChange, listId]
  )

  useEffect(() => {
    const loaded = loadTransmittalChecklist(isOutOfTown, defaultLabels, listId)
    if (loaded && loaded.length > 0) setItems(loaded)
    else if (defaultLabels && defaultLabels.length > 0)
      setItems(labelsToChecklistItems(defaultLabels))
  }, [isOutOfTown, defaultLabels, listId])

  useEffect(() => {
    const checked = items
      .filter((i) => i.completed && String(i.label || '').trim())
      .map((i) => String(i.label).trim())
    onCheckedLabelsChange?.(checked)
  }, [items, onCheckedLabelsChange])

  const onToggle = useCallback(
    (id) => {
      persist(
        items.map((it) =>
          it.id === id ? { ...it, completed: !it.completed } : it
        )
      )
    },
    [items, persist]
  )

  const onLabelChange = useCallback(
    (id, value) => {
      persist(
        items.map((it) => (it.id === id ? { ...it, label: value } : it))
      )
    },
    [items, persist]
  )

  const onAdd = useCallback(() => {
    persist([...items, createEmptyChecklistItem(items.length)])
  }, [items, persist])

  const [removeConfirmId, setRemoveConfirmId] = useState(null)

  const requestRemove = useCallback(
    (id) => {
      if (items.length <= 1) return
      setRemoveConfirmId(id)
    },
    [items.length]
  )

  const confirmRemove = useCallback(() => {
    if (!removeConfirmId) return
    persist(items.filter((it) => it.id !== removeConfirmId))
    setRemoveConfirmId(null)
  }, [removeConfirmId, items, persist])

  const removeConfirmLabel = useMemo(() => {
    const item = items.find((it) => it.id === removeConfirmId)
    return String(item?.label || '').trim()
  }, [items, removeConfirmId])

  return (
    <div className="transmittal-checklist-editor no-print mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-sm font-medium text-gray-700 mb-2">
        Attachments: all items are included by default. Uncheck the items you want to remove from the printed letter.
      </p>
      <ol className="list-none space-y-3 text-left max-w-2xl">
        {items.map((item, i) => (
          <li
            key={item.id}
            className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-1"
          >
            <span className="w-6 shrink-0 text-left text-sm font-medium text-gray-700 sm:pt-2">{i + 1}.</span>
            <input
              type="text"
              className="w-full sm:flex-1 sm:min-w-[12rem] border border-gray-300 px-2 py-1.5 text-sm uppercase rounded"
              value={item.label}
              onChange={(e) => onLabelChange(item.id, e.target.value)}
              placeholder="Attachment label"
            />
            <div className="flex flex-wrap items-center gap-2 sm:pt-1">
              <label className="flex items-center gap-1.5 shrink-0 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!item.completed}
                  onChange={() => onToggle(item.id)}
                  className="w-4 h-4 shrink-0"
                />
                <span className="text-xs text-gray-600">Include in print (uncheck to remove)</span>
              </label>
              <button
                type="button"
                onClick={() => requestRemove(item.id)}
                disabled={items.length <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label={`Remove attachment row ${i + 1}`}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg border border-[var(--primary-blue)] bg-white px-3 py-2 text-sm font-medium text-[var(--primary-blue)] hover:bg-[var(--primary-blue)]/10 transition-colors"
        aria-label="Add attachment row"
      >
        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
        </svg>
        Add attachment
      </button>
      {removeConfirmId ? (
        <ConfirmRemoveRowModal
          title="Remove attachment?"
          message={
            removeConfirmLabel
              ? `Are you sure you want to remove "${removeConfirmLabel}" from the attachment list? This row will be deleted from the checklist.`
              : 'Are you sure you want to remove this attachment row from the list?'
          }
          onCancel={() => setRemoveConfirmId(null)}
          onConfirm={confirmRemove}
        />
      ) : null}
    </div>
  )
}
