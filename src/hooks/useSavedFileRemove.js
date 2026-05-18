import { useEffect, useState } from 'react'

const TOAST_DURATION_MS = 8000

/** Delete confirm modal + undo toast for Files Saved pages. */
export function useSavedFileRemove({ list, onListChange, deleteItem, restoreItem }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastProgress, setToastProgress] = useState(100)
  const [lastDeletedItem, setLastDeletedItem] = useState(null)

  useEffect(() => {
    if (!toastVisible) return
    setToastProgress(100)
    const start = Date.now()
    const id = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / TOAST_DURATION_MS) * 100)
      setToastProgress(remaining)
      if (remaining <= 0) setToastVisible(false)
    }, 50)
    return () => clearInterval(id)
  }, [toastVisible])

  const openDeleteConfirm = (id) => setConfirmDeleteId(id)
  const closeDeleteConfirm = () => setConfirmDeleteId(null)

  const handleConfirmDelete = () => {
    if (!confirmDeleteId) return
    const item = list.find((x) => x.id === confirmDeleteId)
    if (item) setLastDeletedItem({ ...item, data: item.data ? { ...item.data } : undefined })
    deleteItem(confirmDeleteId)
    onListChange()
    setConfirmDeleteId(null)
    setToastVisible(true)
  }

  const handleUndo = () => {
    if (lastDeletedItem && restoreItem(lastDeletedItem)) {
      onListChange()
      setLastDeletedItem(null)
      setToastVisible(false)
    }
  }

  return {
    confirmDeleteId,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleConfirmDelete,
    toastVisible,
    toastProgress,
    handleUndo,
  }
}
