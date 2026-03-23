import { useCallback, useRef, useState } from 'react'

export function useToasts() {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const dismiss = useCallback((id) => {
    const t = timersRef.current.get(id)
    if (t) window.clearTimeout(t)
    timersRef.current.delete(id)
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const show = useCallback((toast) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const next = {
      id,
      type: toast?.type || 'info',
      title: toast?.title || 'Notice',
      message: toast?.message || '',
      actionLabel: toast?.actionLabel || '',
      onAction: typeof toast?.onAction === 'function' ? toast.onAction : null,
    }
    setToasts((prev) => [next, ...prev].slice(0, 4))
    const timer = window.setTimeout(() => dismiss(id), 5000)
    timersRef.current.set(id, timer)
    return id
  }, [dismiss])

  return { toasts, show, dismiss }
}

