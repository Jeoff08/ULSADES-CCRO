import React, { useState, useCallback, useEffect } from 'react'
import {
  loadTransmittalChecklist,
  saveTransmittalChecklist,
  labelsToChecklistItems,
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
      const checked = nextItems.filter((i) => i.completed).map((i) => i.label)
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
    const checked = items.filter((i) => i.completed).map((i) => i.label)
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

  return (
    <div className="transmittal-checklist-editor no-print mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-sm font-medium text-gray-700 mb-2">
        Attachments: all items are included by default. Uncheck the items you want to remove from the printed letter.
      </p>
      <ol className="list-decimal list-inside space-y-2 text-left max-w-2xl">
        {items.map((item, i) => (
          <li key={item.id} className="flex flex-wrap items-center gap-2">
            <span className="w-5 shrink-0 text-left">{i + 1}.</span>
            <input
              type="text"
              className="flex-1 min-w-[12rem] border border-gray-300 px-2 py-1 text-sm uppercase rounded"
              value={item.label}
              onChange={(e) => onLabelChange(item.id, e.target.value)}
            />
            <label className="flex items-center gap-1 shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={!!item.completed}
                onChange={() => onToggle(item.id)}
                className="w-4 h-4"
              />
              <span className="text-xs text-gray-600">Include in print (uncheck to remove)</span>
            </label>
          </li>
        ))}
      </ol>
    </div>
  )
}
