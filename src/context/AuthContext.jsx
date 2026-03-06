import React, { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const DEMO_ADMIN = { username: 'admin', password: 'admin123' }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ulsades_admin')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = useCallback((username, password) => {
    if (username === DEMO_ADMIN.username && password === DEMO_ADMIN.password) {
      const u = { username, role: 'admin' }
      setUser(u)
      localStorage.setItem('ulsades_admin', JSON.stringify(u))
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('ulsades_admin')
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
