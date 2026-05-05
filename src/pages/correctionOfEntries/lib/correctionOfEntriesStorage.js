import { defaultCorrectionOfEntries, mergeCorrectionDefaults } from './correctionOfEntriesDefaults'

const KEY = 'ulsades_correction_of_entries_draft'

export function getCorrectionOfEntriesDraft() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return mergeCorrectionDefaults(null)
    const parsed = JSON.parse(raw)
    return mergeCorrectionDefaults(parsed)
  } catch {
    return mergeCorrectionDefaults(null)
  }
}

export function saveCorrectionOfEntriesDraft(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

export function clearCorrectionOfEntriesDraft() {
  try {
    localStorage.removeItem(KEY)
  } catch {}
}

export { defaultCorrectionOfEntries }
