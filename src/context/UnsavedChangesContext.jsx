import React, { createContext, useContext, useLayoutEffect, useMemo, useState } from 'react'

const UnsavedChangesContext = createContext(null)

export function UnsavedChangesProvider({ children }) {
  const [dirty, setDirty] = useState(false)
  const value = useMemo(() => ({ dirty, setDirty }), [dirty])
  return <UnsavedChangesContext.Provider value={value}>{children}</UnsavedChangesContext.Provider>
}

export function useUnsavedChanges() {
  const ctx = useContext(UnsavedChangesContext)
  if (!ctx) {
    return { dirty: false, setDirty: () => {} }
  }
  return ctx
}

/** Registers “this screen has unsaved edits” with the layout navigation guard. */
export function useRegisterUnsavedChanges(isDirty) {
  const { setDirty } = useUnsavedChanges()
  useLayoutEffect(() => {
    setDirty(!!isDirty)
    return () => setDirty(false)
  }, [isDirty, setDirty])
}
