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
    // When we have defaultLabels, merge saved rows: defaults + any user-added rows beyond the template.
    if (defaultList && defaultList.length > 0) {
      // Migration: old saved data had all items unchecked. Treat "all false" as legacy and default to checked.
      const isLegacyAllUnchecked = parsed && parsed.length > 0 && parsed.every((item) => item.completed === false)
      // User removed default rows: saved list is shorter than template — use it as-is.
      if (parsed && parsed.length > 0 && parsed.length < defaultList.length) {
        return parsed.map((item, i) => ({
          id: item.id || `t-${i}-${String(item.label).slice(0, 12).replace(/\s/g, '-')}`,
          label: typeof item.label === 'string' ? item.label : '',
          completed: isLegacyAllUnchecked ? true : !!item.completed,
          notes: typeof item.notes === 'string' ? item.notes : '',
        }))
      }
      const base = defaultList.map((label, i) => {
        const saved = parsed && parsed[i]
        const useCompleted = isLegacyAllUnchecked ? true : (saved != null ? !!saved.completed : true)
        const savedLabel = saved && typeof saved.label === 'string' ? saved.label.trim() : ''
        return {
          id: saved?.id || `t-${i}-${String(label).slice(0, 12).replace(/\s/g, '-')}`,
          label: savedLabel || label,
          completed: useCompleted,
          notes: saved && typeof saved.notes === 'string' ? saved.notes : '',
        }
      })
      const extras =
        parsed && parsed.length > defaultList.length
          ? parsed.slice(defaultList.length).map((item, j) => ({
              id: item.id || `t-extra-${defaultList.length + j}`,
              label: typeof item.label === 'string' ? item.label : '',
              completed: isLegacyAllUnchecked ? true : !!item.completed,
              notes: typeof item.notes === 'string' ? item.notes : '',
            }))
          : []
      return [...base, ...extras]
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

export function createEmptyChecklistItem(index = 0) {
  return {
    id: `t-custom-${Date.now()}-${index}`,
    label: '',
    completed: true,
    notes: '',
  }
}
