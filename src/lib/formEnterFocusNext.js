/** Selectors for elements that participate in Tab order (subset relevant to data-entry forms). */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function isFocusableField(el) {
  if (!(el instanceof HTMLElement)) return false
  if (el.disabled) return false
  if (el.getAttribute('tabindex') === '-1') return false
  if (el.getAttribute('aria-hidden') === 'true') return false
  if (el.closest('[aria-modal="true"]')) return false

  const tag = el.tagName
  if (tag === 'INPUT') {
    const type = (el.getAttribute('type') || 'text').toLowerCase()
    if (type === 'hidden') return false
  }

  const style = window.getComputedStyle(el)
  if (style.visibility === 'hidden' || style.display === 'none') return false
  return true
}

function listFocusableFields(container) {
  if (!(container instanceof HTMLElement)) return []
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isFocusableField)
}

function focusNextField(container, current) {
  const fields = listFocusableFields(container)
  const i = fields.indexOf(current)
  if (i < 0 || i >= fields.length - 1) return false
  fields[i + 1].focus()
  return true
}

/**
 * On text-like inputs and selects, Enter moves focus to the next focusable field (Tab-like).
 * Skips buttons/links (Enter keeps default), textareas (newlines), and IME composition.
 *
 * @param {React.KeyboardEvent<HTMLElement>} e
 */
export function handleEnterFocusNextField(e) {
  if (e.key !== 'Enter') return
  const ne = e.nativeEvent
  if (ne && (ne.isComposing || ne.keyCode === 229)) return
  if (e.ctrlKey || e.altKey || e.metaKey) return

  const container = e.currentTarget
  if (!(container instanceof HTMLElement)) return

  const t = e.target
  if (!(t instanceof HTMLElement)) return
  if (t.isContentEditable) return

  const tag = t.tagName
  if (tag === 'TEXTAREA') return
  if (tag === 'BUTTON') return
  if (tag === 'A') return

  if (tag !== 'INPUT' && tag !== 'SELECT') return

  if (tag === 'INPUT') {
    const type = (t.getAttribute('type') || 'text').toLowerCase()
    if (type === 'submit' || type === 'button' || type === 'reset' || type === 'image') return
  }

  e.preventDefault()
  focusNextField(container, t)
}
