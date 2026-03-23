import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function IconPerson({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  )
}

function IconLock({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
  )
}

const MARQUEE_SEGMENTS = [
  'ULSADES - CCRO: Unified Legal Status Automated Data Entry System — streamlining civil registry documents for the City Civil Registrar’s Office, Iligan City.',
  'AUSF (Affidavit to Use the Surname of the Father): a legal document that allows a child to use the father’s surname when the parents are not married; it is filed with the Local Civil Registrar and covers AUSF 0-6, AUSF 07-17, registration of AUSF, acknowledgement, LCR forms, annotations, and transmittals.',
  'Court Decree: certificates and annotations for court-ordered civil registry documents, including adoption, rescission, annulment, and legal separation; the LCR issues certificates of authenticity and registration, transmittals, LCR forms, and annotations to reflect court decisions.',
  'Legitimation: the process by which a child born to unmarried parents becomes legitimate when the parents later marry; it involves an Affidavit of Legitimation (sole or joint), registration with the Local Civil Registrar, and annotation on the child’s Certificate of Live Birth, giving the child the same rights as those born to married parents.',
]

const LOGIN_LOADING_MS = 700
const LOGIN_SUCCESS_DELAY_MS = 500
const LOGIN_OVERLAY_EXIT_MS = 350

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isOverlayExiting, setIsOverlayExiting] = useState(false)
  const [showError, setShowError] = useState(false)
  const [marqueeIdx, setMarqueeIdx] = useState(0)
  const marqueeRef = useRef(null)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const fromLogout = location.state?.fromLogout === true

  // Cycle to next segment the instant the current one finishes scrolling
  useEffect(() => {
    const el = marqueeRef.current
    if (!el) return
    const handleEnd = () => {
      setMarqueeIdx((i) => (i + 1) % MARQUEE_SEGMENTS.length)
    }
    el.addEventListener('animationend', handleEnd)
    return () => el.removeEventListener('animationend', handleEnd)
  }, [marqueeIdx]) // re-attach after each remount caused by key change

  if (isAuthenticated && !isLoading && !isTransitioning) {
    navigate(from, { replace: true })
    return null
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setShowError(false)
    setIsLoading(true)
    setIsOverlayExiting(false)
    setTimeout(() => {
      if (login(username, password)) {
        setIsTransitioning(true)
        setTimeout(() => {
          navigate(from, { replace: true })
        }, LOGIN_SUCCESS_DELAY_MS)
      } else {
        setIsOverlayExiting(true)
        setTimeout(() => {
          setIsLoading(false)
          setIsOverlayExiting(false)
          setError('Invalid username or password.')
          setShowError(true)
        }, LOGIN_OVERLAY_EXIT_MS)
      }
    }, LOGIN_LOADING_MS)
  }

  return (
    <div className={`login-split login-page--enter min-h-screen flex flex-col ${isTransitioning ? 'login-page--exiting' : ''}`}>
      {/* Loading overlay (stays mounted during exit for fade-out) */}
      {(isLoading || isOverlayExiting) && (
        <div
          className={`login-loading-overlay ${isOverlayExiting ? 'login-loading-overlay--exiting' : ''}`}
          role="status"
          aria-live="polite"
        >
          <div className="login-loading-spinner" aria-hidden />
          <p className="login-loading-text">Logging in...</p>
        </div>
      )}
      {/* Panels row */}
      <div className="login-split__panels flex flex-1 min-h-0">
      {/* Left panel: branding */}
      <div className="login-brand flex flex-col px-8 py-10 text-white">
        <div className="login-brand__center flex-1 flex flex-col items-center justify-center">
          <div className="login-brand__logos flex items-center justify-center gap-6 mb-6">
            <img
              src="/iligan_seal_transparent.png"
              alt="City of Iligan Official Seal"
              className="w-32 h-32 md:w-40 md:h-40 object-contain shrink-0"
            />
            <img
              src="/ChatGPT Image Feb 11, 2026, 03_26_31 PM.png"
              alt="City Civil Registrar's Office"
              className="w-32 h-32 md:w-40 md:h-40 object-contain shrink-0"
            />
          </div>
          <p className="login-brand__acronym text-sm font-bold tracking-wide text-center">ULSADES - CCRO</p>
          <p className="login-brand__title text-xs md:text-sm text-center mt-1 text-white/95 max-w-xs">
            Unified Legal Status Automated Data Entry System
          </p>
        </div>
        <footer className="login-brand__footer pt-10 text-center w-full text-xs text-white/90 shrink-0">
          <p>© 2026 City Civil Registrar Office • Archive Locator System</p>
          <p>Developed by CS students, St. Peter&apos;s College</p>
        </footer>
      </div>

      {/* Right panel: login form */}
      <div className="login-form-panel flex flex-col items-center justify-center flex-1 bg-white px-6 py-10">
        <div className="w-full max-w-sm">
          <p className="login-form-panel__label text-xs font-semibold uppercase tracking-wider text-gray-700">
            Login
          </p>
          <h1 className="login-form-panel__welcome text-xl md:text-2xl font-bold text-[#1e3a5f] mt-1">
            Welcome back!
          </h1>
          <p className="text-gray-500 text-sm mt-1 mb-6">
            Use your assigned username and password.
          </p>

          <form
            onSubmit={handleSubmit}
            className={`login-form space-y-4 ${showError ? 'login-form--error' : ''}`}
          >
            {error && (
              <div className="login-page__error login-page__error--animate text-sm py-2.5 px-3 rounded-lg" role="alert">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="username" className="login-form-panel__label block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <IconPerson className="w-5 h-5" />
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="login-form-panel__input w-full rounded-lg pl-11 pr-4 py-2.5 text-base min-h-[44px] border placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="login-form-panel__label block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <IconLock className="w-5 h-5" />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-form-panel__input w-full rounded-lg pl-11 pr-4 py-2.5 text-base min-h-[44px] border placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="login-form-panel__btn w-full py-2.5 min-h-[44px] rounded-lg font-bold text-base text-white tracking-wider mt-1 disabled:opacity-70 disabled:cursor-not-allowed transition-opacity duration-200"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="login-form-panel__back mt-6 text-center">
          </p>
        </div>
      </div>
      </div>

      {/* Scrolling text — one segment at a time, 1 min each, cycles automatically */}
      <div className={`login-marquee-wrap${fromLogout ? ' login-marquee-wrap--from-logout' : ''}`} aria-hidden>
        <div className="login-marquee" key={marqueeIdx} ref={marqueeRef}>
          <span className="login-marquee__text">
            {MARQUEE_SEGMENTS[marqueeIdx]}
          </span>
        </div>
      </div>
    </div>
  )
}
