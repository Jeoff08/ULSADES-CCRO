import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  if (isAuthenticated) {
    navigate(from, { replace: true })
    return null
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (login(username, password)) {
      navigate(from, { replace: true })
    } else {
      setError('Invalid username or password.')
    }
  }

  return (
    <div className="login-page min-h-screen flex items-center justify-center px-4 py-6 relative overflow-hidden">
      <div className="login-page__bg" aria-hidden />
      <div className="login-page__card relative w-full max-w-md rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="text-center mb-4">
          <p className="font-bold text-[#0f766e] text-xl md:text-2xl tracking-wide uppercase">ULSADES</p>
          <p className="text-gray-700 text-sm leading-snug mt-0.5">Unified Legal Status Automated Data Entry System</p>
        </div>
        <div className="flex items-center justify-center gap-6 mb-4">
          <img
            src="/iligan_seal_transparent.png"
            alt="City of Iligan Official Seal"
            className="w-20 h-20 md:w-20 md:h-20 object-contain shrink-0 border-2 border-white rounded-full"
          />
          <img
            src="/ChatGPT Image Feb 11, 2026, 03_26_31 PM.png"
            alt="City Civil Registrar's Office"
            className="w-20 h-20 md:w-20 md:h-20 object-contain shrink-0 border-2 border-white rounded-full"
          />
        </div>
        <h1 className="login-page__title text-center text-xl md:text-2xl font-bold tracking-wider uppercase mb-6">
          MEMBER LOGIN
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="login-page__error text-sm py-2.5 px-3 rounded-lg" role="alert">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="username" className="login-page__label block text-sm font-semibold mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78909C] pointer-events-none">
                <IconPerson className="w-5 h-5" />
              </span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="login-page__input w-full rounded-lg pl-11 pr-4 py-2.5 text-base min-h-[44px] placeholder-[#CFD8DC] focus:outline-none focus:ring-2 focus:ring-[#4DD0E1]/50"
                placeholder="Enter your username"
                autoComplete="username"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="login-page__label block text-sm font-semibold mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78909C] pointer-events-none">
                <IconLock className="w-5 h-5" />
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-page__input w-full rounded-lg pl-11 pr-4 py-2.5 text-base min-h-[44px] placeholder-[#CFD8DC] focus:outline-none focus:ring-2 focus:ring-[#4DD0E1]/50"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="login-page__btn w-full py-2.5 min-h-[44px] rounded-lg font-bold text-base tracking-wider uppercase mt-1"
          >
            Login
          </button>
        </form>

        <p className="login-page__hint mt-6 text-center text-sm">
          Demo: admin / admin123
        </p>
      </div>
    </div>
  )
}
