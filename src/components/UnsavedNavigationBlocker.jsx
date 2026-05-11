import React, { useEffect, useState } from 'react'
import { useBlocker } from 'react-router-dom'
import { useUnsavedChanges } from '../context/UnsavedChangesContext'
import ConfirmationModal from './ConfirmationModal'

const MESSAGE =
  "You haven't saved your changes yet. If you leave now, your progress will be lost."

export default function UnsavedNavigationBlocker() {
  const { dirty: isDirty } = useUnsavedChanges()
  const [showModal, setShowModal] = useState(false)

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty &&
      (currentLocation.pathname !== nextLocation.pathname ||
        currentLocation.search !== nextLocation.search ||
        currentLocation.hash !== nextLocation.hash)
  )

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowModal(true)
    } else {
      setShowModal(false)
    }
  }, [blocker.state])

  const handleConfirm = () => {
    setShowModal(false)
    blocker.proceed()
  }

  const handleCancel = () => {
    setShowModal(false)
    blocker.reset()
  }

  useEffect(() => {
    if (!isDirty) return
    const onBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  return (
    <ConfirmationModal
      isOpen={showModal}
      title="Unsaved Changes"
      message={MESSAGE}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      confirmText="Leave Page"
      cancelText="Stay Here"
    />
  )
}

