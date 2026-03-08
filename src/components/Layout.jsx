import React from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function IconDashboard() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function IconAUSF() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function IconFolder() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  )
}

function IconCourtDecree() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--main-bg)]">
      <aside className="no-print w-64 shrink-0 flex flex-col bg-[var(--sidebar-bg)] overflow-hidden">
        <div className="p-4 shrink-0">
          <div className="flex items-center gap-2">
            <img
              src="/iligan official seal.jpg"
              alt="City of Iligan Official Seal"
              className="w-11 h-11 object-contain shrink-0 rounded-full bg-white/10"
            />
            <div className="flex-1 min-w-0 text-center">
              <p className="font-semibold text-white text-sm leading-tight">ULSADES</p>
              <p className="text-white/70 text-xs leading-tight">Civil Registrar</p>
            </div>
            <img
              src="/logo-shortcut.png"
              alt="City Civil Registrar's Office"
              className="w-11 h-11 object-contain shrink-0 rounded-full bg-white/10"
            />
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition relative ${
                isActive
                  ? 'bg-white text-gray-800 border-l-4 border-[var(--primary-green)] border-t-0 border-r-0 border-b-0 pl-[11px]'
                  : 'text-white/90 hover:bg-white/10 text-white'
              }`
            }
          >
            <IconDashboard />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/ausf"
            end
            className={({ isActive }) => {
              const ausfActive = isActive || location.pathname === '/ausf'
              return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition relative ${
                ausfActive
                  ? 'bg-white text-gray-800 border-l-4 border-[var(--primary-green)] border-t-0 border-r-0 border-b-0 pl-[11px]'
                  : 'text-white/90 hover:bg-white/10 text-white'
              }`
            }}
          >
            <IconAUSF />
            <span>AUSF</span>
          </NavLink>
          <NavLink
            to="/court-decree"
            end={false}
            className={({ isActive }) => {
              const courtActive = isActive && location.pathname !== '/court-decree/saved'
              return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition relative ${
                courtActive
                  ? 'bg-white text-gray-800 border-l-4 border-[var(--primary-green)] border-t-0 border-r-0 border-b-0 pl-[11px]'
                  : 'text-white/90 hover:bg-white/10 text-white'
              }`
            }}
          >
            <IconCourtDecree />
            <span>Court Decree</span>
          </NavLink>
          <NavLink
            to="/ausf/saved"
            end
            className={({ isActive }) => {
              const filesSavedActive = isActive || location.pathname === '/court-decree/saved'
              return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition relative ${
                filesSavedActive
                  ? 'bg-white text-gray-800 border-l-4 border-[var(--primary-green)] border-t-0 border-r-0 border-b-0 pl-[11px]'
                  : 'text-white/90 hover:bg-white/10 text-white'
              }`
            }}
          >
            <IconFolder />
            <span>Files Saved</span>
          </NavLink>
        </nav>
        <div className="p-3 border-t border-white/10 shrink-0">
          <p className="text-xs text-white/70 mb-2 truncate" title={user?.username}>{user?.username}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-h-0 overflow-auto bg-[var(--main-bg)]">
        <Outlet />
      </main>
    </div>
  )
}
