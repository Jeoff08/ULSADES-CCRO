import React, { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'

function isTextLikeField(el) {
  if (!(el instanceof HTMLElement)) return false
  if (el.disabled || el.readOnly) return false
  if (el.closest('[aria-modal="true"]')) return false

  if (el instanceof HTMLTextAreaElement) return true
  if (el instanceof HTMLInputElement) {
    const raw = el.getAttribute('type')
    const type = raw == null || raw === '' ? 'text' : String(raw).toLowerCase()
    return type === 'text' || type === 'search'
  }
  return false
}

function setNativeValueAndSyncReact(input, nextValue) {
  const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  if (!setter) return
  setter.call(input, nextValue)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

function replaceCharAtCaretField(input, index, replacement) {
  const v = input.value
  if (index < 0 || index >= v.length) return
  const next = v.slice(0, index) + replacement + v.slice(index + 1)
  setNativeValueAndSyncReact(input, next)
  const pos = index + 1
  try {
    input.setSelectionRange(pos, pos)
  } catch (_) {}
}

/**
 * Wraps a long-form body: optional ñ/Ñ picker after typing n/N; no change unless the user clicks.
 * Children receive the wrapper div with forwarded props (e.g. onKeyDown for Enter → next field).
 */
export function FormBodyFieldShortcuts({ children, ...divProps }) {
  const rootRef = useRef(null)
  const hintRef = useRef(null)
  const [popover, setPopover] = useState(null)

  const clearPopover = useCallback(() => {
    hintRef.current = null
    setPopover(null)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const maybeClearFromInput = (e) => {
      const h = hintRef.current
      if (!h) return
      if (e.target !== h.input) return
      const v = h.input.value
      const ch = v[h.index]
      if (ch !== 'n' && ch !== 'N') clearPopover()
    }

    const onKeyUp = (e) => {
      if (!(e.target instanceof Node) || !root.contains(e.target)) return
      if (!isTextLikeField(e.target)) return
      const ne = e.nativeEvent
      if (ne && (ne.isComposing || ne.keyCode === 229)) return
      if (e.key !== 'n' && e.key !== 'N') return
      if (e.ctrlKey || e.altKey || e.metaKey) return

      const input = e.target
      const start = input.selectionStart
      if (start == null || start < 1) return
      const val = input.value
      const idx = start - 1
      const ch = val[idx]
      if (ch !== 'n' && ch !== 'N') return

      const rect = input.getBoundingClientRect()
      hintRef.current = { input, index: idx, isUpper: ch === 'N' }
      setPopover({
        top: rect.bottom + 6,
        left: rect.left,
        minWidth: Math.min(rect.width, 280),
        isUpper: ch === 'N',
      })
    }

    const onKeyDown = (e) => {
      if (e.key === 'Escape' && hintRef.current) {
        clearPopover()
      }
    }

    const onFocusOut = () => {
      window.requestAnimationFrame(() => {
        const h = hintRef.current
        if (!h) return
        const ae = document.activeElement
        if (ae === h.input) return
        if (ae instanceof HTMLElement && ae.closest?.('.form-body-ntilde-popover')) return
        clearPopover()
      })
    }

    root.addEventListener('input', maybeClearFromInput, true)
    root.addEventListener('keyup', onKeyUp, true)
    root.addEventListener('keydown', onKeyDown, true)
    root.addEventListener('focusout', onFocusOut, true)

    return () => {
      root.removeEventListener('input', maybeClearFromInput, true)
      root.removeEventListener('keyup', onKeyUp, true)
      root.removeEventListener('keydown', onKeyDown, true)
      root.removeEventListener('focusout', onFocusOut, true)
    }
  }, [clearPopover])

  useEffect(() => {
    if (!popover) return
    const onScroll = () => clearPopover()
    window.addEventListener('scroll', onScroll, true)
    return () => window.removeEventListener('scroll', onScroll, true)
  }, [popover, clearPopover])

  const onApplyNtilde = () => {
    const h = hintRef.current
    if (!h) return
    replaceCharAtCaretField(h.input, h.index, h.isUpper ? 'Ñ' : 'ñ')
    clearPopover()
    h.input.focus()
  }

  const overlay =
    popover &&
    createPortal(
      <div
        className="form-body-ntilde-popover z-[200] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left shadow-lg"
        style={{
          position: 'fixed',
          top: popover.top,
          left: popover.left,
          minWidth: popover.minWidth,
        }}
        role="dialog"
        aria-label="Optional Spanish letter"
        onMouseDown={(e) => e.preventDefault()}
      >
        <p className="text-xs text-slate-600 mb-2 leading-snug">
          The ñ, Ñ, will be included as well.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onApplyNtilde}
            className="rounded-md bg-[var(--primary-blue,#1e3a5f)] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Use {popover.isUpper ? 'Ñ' : 'ñ'}
          </button>
          <button type="button" onClick={clearPopover} className="text-xs font-medium text-slate-500 underline underline-offset-2 hover:text-slate-800">
            Keep {popover.isUpper ? 'N' : 'n'}
          </button>
        </div>
      </div>,
      document.body
    )

  return (
    <div ref={rootRef} {...divProps}>
      {children}
      {overlay}
    </div>
  )
}
