/**
 * Persist transmittal attachment checklist (Transmittal vs Out-of-Town).
 * Each item: { id, label, completed, notes }. Only checked items are printed.
 * Optional listId (e.g. 'court-decree-local') uses a separate key for different flows.
 */

const KEY_LOCAL = 'transmittal-checklist-local'
const KEY_PSA = 'transmittal-checklist-psa'

export function getStorageKey(isOutOfTown, listId) {
  if (listId) return `transmittal-checklist-${listId}`
  return isOutOfTown ? KEY_PSA : KEY_LOCAL
}

export function loadTransmittalChecklist(isOutOfTown, defaultLabels, listId) {
  const key = getStorageKey(isOutOfTown, listId)
  try {
    const raw = localStorage.getItem(key)
    const defaultList = defaultLabels && defaultLabels.length > 0 ? defaultLabels : null
    let parsed = null
    if (raw) {
      const decoded = JSON.parse(raw)
      if (Array.isArray(decoded)) parsed = decoded
    }
    // When we have defaultLabels (e.g. AUSF local = 6 items, PSA = 8), use them as source of truth for labels and length
    if (defaultList && defaultList.length > 0) {
      // Migration: old saved data had all items unchecked. Treat "all false" as legacy and default to checked.
      const isLegacyAllUnchecked = parsed && parsed.length > 0 && parsed.every((item) => item.completed === false)
      return defaultList.map((label, i) => {
        const saved = parsed && parsed[i]
        const useCompleted = isLegacyAllUnchecked ? true : (saved != null ? !!saved.completed : true)
        return {
          id: saved?.id || `t-${i}-${String(label).slice(0, 12).replace(/\s/g, '-')}`,
          label: label,
          completed: useCompleted,
          notes: saved && typeof saved.notes === 'string' ? saved.notes : '',
        }
      })
    }
    if (parsed && parsed.length > 0) {
      const isLegacyAllUnchecked = parsed.every((item) => item.completed === false)
      return parsed.map((item, i) => ({
        id: item.id || `t-${i}-${String(item.label).slice(0, 12).replace(/\s/g, '-')}`,
        label: typeof item.label === 'string' ? item.label : '',
        completed: isLegacyAllUnchecked ? true : !!item.completed,
        notes: typeof item.notes === 'string' ? item.notes : '',
      }))
    }
    return null
  } catch {
    return null
  }
}

export function saveTransmittalChecklist(items, isOutOfTown, listId) {
  const key = getStorageKey(isOutOfTown, listId)
  try {
    localStorage.setItem(key, JSON.stringify(items))
    return true
  } catch {
    return false
  }
}

export function labelsToChecklistItems(labels) {
  return labels.map((label, i) => ({
    id: `t-${i}-${String(label).slice(0, 12).replace(/\s/g, '-')}`,
    label: label,
    completed: true,
    notes: '',
  }))
}
