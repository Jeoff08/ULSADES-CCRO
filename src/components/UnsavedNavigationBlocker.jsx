import React, { useEffect, useState } from 'react'
import { useBlocker } from 'react-router-dom'
import { useUnsavedChanges } from '../context/UnsavedChangesContext'
import ConfirmationModal from './ConfirmationModal'

const MESSAGE =
  "You haven't saved your changes yet. If you leave now, your progress will be lost."

export default function UnsavedNavigationBlocker() {
  const { dirty: isDirty } = useUnsavedChanges()
  const [showModal, setShowModal] = useState(false)

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (!isDirty) return false
    
    // Ignore internal navigation within the same form (e.g. switching LCR types via search params)
    const samePath = currentLocation.pathname === nextLocation.pathname
    const isFormPath =
      currentLocation.pathname === '/court-decree/form' ||
      currentLocation.pathname === '/legitimation/form' ||
      currentLocation.pathname === '/ausf'

    if (samePath && isFormPath) {
      return false
    }

    return (
      currentLocation.pathname !== nextLocation.pathname ||
      currentLocation.search !== nextLocation.search ||
      currentLocation.hash !== nextLocation.hash
    )
  })

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

