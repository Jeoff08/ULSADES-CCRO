import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LOGOUT_EXIT_MS = 450

function IconDashboard() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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

function IconLegalInstrument() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function IconLegalSub() {
  return (
    <svg className="w-4 h-4 shrink-0 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}

const navRowBase =
  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition relative'

const legalSubLinkBase =
  'flex items-center gap-2 pl-3 ml-6 border-l-2 border-white/20 py-2 pr-2 rounded-r-lg text-[13px] font-medium transition'

function legalSubLinkClass(isActive) {
  return `${legalSubLinkBase} ${
    isActive
      ? 'bg-white text-gray-800 border-[var(--primary-green)]'
      : 'text-white/85 hover:bg-white/10 text-white border-transparent hover:border-white/20'
  }`
}

const FILES_SAVED_PATHS = ['/ausf/saved', '/legitimation/saved', '/court-decree/saved']

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isExiting, setIsExiting] = useState(false)

  const isFilesSavedPage = FILES_SAVED_PATHS.includes(location.pathname)

  /** Saved lists are separate from Legal Instrument / Court Decree workflows — do not tie sidebar state to them */
  const legalInstrumentActive =
    !isFilesSavedPage &&
    (location.pathname.startsWith('/legitimation') ||
      (location.pathname.startsWith('/ausf') && location.pathname !== '/ausf/saved') ||
      location.pathname.startsWith('/legal-instrument'))
  /** Collapsed by default; stays collapsed on refresh (no auto-expand from route) */
  const [legalInstrumentOpen, setLegalInstrumentOpen] = useState(false)

  const courtDecreeMenuActive =
    location.pathname.startsWith('/court-decree') &&
    location.pathname !== '/court-decree/saved' &&
    !isFilesSavedPage
  const courtDecreeMainFormActive =
    !isFilesSavedPage &&
    (location.pathname.startsWith('/court-decree/form') ||
      location.pathname.startsWith('/court-decree/print') ||
      location.pathname.startsWith('/court-decree/instructions'))
  const [courtDecreeOpen, setCourtDecreeOpen] = useState(false)

  const legitimationFormActive =
    location.pathname.startsWith('/legitimation') && location.pathname !== '/legitimation/saved'
  const ausfFormActive = location.pathname.startsWith('/ausf') && location.pathname !== '/ausf/saved'

  const handleLogout = () => {
    if (isExiting) return
    setIsExiting(true)
    setTimeout(() => {
      logout()
      navigate('/login', { state: { fromLogout: true } })
    }, LOGOUT_EXIT_MS)
  }

  return (
    <div className={`layout-root h-screen flex overflow-hidden bg-[var(--main-bg)] ${isExiting ? 'layout-root--exiting' : ''}`}>
      {/* Logout loading overlay */}
      {isExiting && (
        <div className="logout-loading-overlay" role="status" aria-live="polite">
          <div className="logout-loading-spinner" aria-hidden />
          <p className="logout-loading-text">Logging out...</p>
        </div>
      )}
      <aside className="no-print w-64 shrink-0 flex flex-col bg-[var(--sidebar-bg)] overflow-hidden">
        <div className="p-3 shrink-0">
          <div className="flex items-center gap-2 px-2 py-3 rounded-lg">
            <img
              src="/iligan_seal_transparent.png"
              alt="City of Iligan Official Seal"
              className="w-16 h-16 object-contain shrink-0 rounded-full"
            />
            <div className="flex-1 min-w-0 text-center">
              <p className="font-bold text-white text-sm leading-tight">ULSADES</p>
              <p className="text-white/80 text-[10px] leading-tight mt-0.5">Unified Legal Status Automated Data Entry System</p>
            </div>
            <div className="shrink-0 w-16 h-16 rounded-lg p-0.5 flex items-center justify-center">
              <img
                src="/ChatGPT Image Feb 11, 2026, 03_26_31 PM.png"
                alt="City Civil Registrar's Office"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${navRowBase} ${
                isActive
                  ? 'bg-white text-gray-800 border-l-4 border-[var(--primary-green)] border-t-0 border-r-0 border-b-0 pl-[11px]'
                  : 'text-white/90 hover:bg-white/10 text-white'
              }`
            }
          >
            <IconDashboard />
            <span>Dashboard</span>
          </NavLink>

          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => setLegalInstrumentOpen((o) => !o)}
              className={`${navRowBase} w-full text-left text-white/90 hover:bg-white/10 text-white ${
                legalInstrumentActive && !legalInstrumentOpen
                  ? 'bg-white/15 border-l-4 border-[var(--primary-green)] pl-[11px]'
                  : ''
              }`}
              aria-expanded={legalInstrumentOpen}
            >
              <IconLegalInstrument />
              <span className="flex-1">Legal Instrument</span>
              <svg
                className={`w-4 h-4 shrink-0 transition-transform ${legalInstrumentOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {legalInstrumentOpen && (
              <div className="space-y-0.5 pb-0.5">
                <NavLink
                  to="/legitimation/form?type=joint-affidavit"
                  className={() => legalSubLinkClass(legitimationFormActive)}
                >
                  <IconLegalSub />
                  <span>Legitimation</span>
                </NavLink>
                <NavLink
                  to="/ausf"
                  className={() => legalSubLinkClass(ausfFormActive)}
                >
                  <IconLegalSub />
                  <span>AUSF</span>
                </NavLink>
                <NavLink
                  to="/legal-instrument/negative"
                  className={({ isActive }) => legalSubLinkClass(isActive)}
                >
                  <IconLegalSub />
                  <span>Negative</span>
                </NavLink>
                <NavLink
                  to="/legal-instrument/clear-copy-blurred"
                  className={({ isActive }) => legalSubLinkClass(isActive)}
                >
                  <IconLegalSub />
                  <span>Clear Copy / Blurred Copy</span>
                </NavLink>
                <NavLink
                  to="/legal-instrument/mc2010-04"
                  className={({ isActive }) => legalSubLinkClass(isActive)}
                >
                  <IconLegalSub />
                  <span>MC2010-04</span>
                </NavLink>
                <NavLink
                  to="/legal-instrument/supplemental"
                  className={({ isActive }) => legalSubLinkClass(isActive)}
                >
                  <IconLegalSub />
                  <span>Supplemental</span>
                </NavLink>
              </div>
            )}
          </div>

          <div className="space-y-0.5">
            <div
              className={`flex items-stretch rounded-lg overflow-hidden transition relative ${
                courtDecreeMainFormActive && !courtDecreeOpen
                  ? ''
                  : courtDecreeMenuActive && !courtDecreeOpen && !courtDecreeMainFormActive
                    ? 'ring-1 ring-inset ring-white/20'
                    : ''
              }`}
            >
              <NavLink
                to="/court-decree/form?type=cert-authenticity"
                className={`${navRowBase} flex-1 min-w-0 rounded-l-lg rounded-r-none border-0 ${
                  courtDecreeMainFormActive
                    ? 'bg-white text-gray-800 border-l-4 border-[var(--primary-green)] pl-[11px]'
                    : 'text-white/90 hover:bg-white/10 text-white'
                }`}
                title="Open Court Decree forms"
              >
                <IconCourtDecree />
                <span className="truncate">Court Decree</span>
              </NavLink>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setCourtDecreeOpen((o) => !o)
                }}
                className={`shrink-0 px-2 flex items-center justify-center text-white/90 hover:bg-white/15 border-l border-white/15 transition ${
                  courtDecreeOpen ? 'bg-white/5' : ''
                }`}
                aria-expanded={courtDecreeOpen}
                aria-label={courtDecreeOpen ? 'Collapse Court Decree menu' : 'Expand Court Decree menu'}
              >
                <svg
                  className={`w-4 h-4 transition-transform ${courtDecreeOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {courtDecreeOpen && (
              <div className="space-y-0.5 pb-0.5">
                <NavLink
                  to="/court-decree/workflow/correction-of-entries"
                  className={({ isActive }) => legalSubLinkClass(isActive)}
                >
                  <IconLegalSub />
                  <span>Correction of entries</span>
                </NavLink>
                <NavLink
                  to="/court-decree/workflow/adoption"
                  className={({ isActive }) => legalSubLinkClass(isActive)}
                >
                  <IconLegalSub />
                  <span>Adoption</span>
                </NavLink>
                <NavLink
                  to="/court-decree/workflow/nullity-of-marriage"
                  className={({ isActive }) => legalSubLinkClass(isActive)}
                >
                  <IconLegalSub />
                  <span>Nullity of marriage</span>
                </NavLink>
                <NavLink
                  to="/court-decree/workflow/divorce"
                  className={({ isActive }) => legalSubLinkClass(isActive)}
                >
                  <IconLegalSub />
                  <span>Divorce</span>
                </NavLink>
              </div>
            )}
          </div>
          <NavLink
            to="/ausf/saved"
            className={() =>
              `${navRowBase} ${
                isFilesSavedPage
                  ? 'bg-white text-gray-800 border-l-4 border-[var(--primary-green)] border-t-0 border-r-0 border-b-0 pl-[11px]'
                  : 'text-white/90 hover:bg-white/10 text-white'
              }`
            }
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
      <main className="layout-main flex-1 min-h-0 overflow-auto bg-[var(--main-bg)]">
        <Outlet />
      </main>
    </div>
  )
}
