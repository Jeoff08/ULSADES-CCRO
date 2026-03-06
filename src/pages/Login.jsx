import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
      <div className="login-page__card relative w-full max-w-md rounded-2xl shadow-2xl p-8 md:p-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <img
            src="/iligan official seal.jpg"
            alt="City of Iligan Official Seal"
            className="w-14 h-14 object-contain shrink-0 rounded-full border-2 border-[var(--login-input-border)]"
          />
          <h1 className="login-page__title font-bold text-2xl md:text-3xl tracking-wide uppercase text-[var(--login-heading)]">
            ULSADES
          </h1>
          <img
            src="/logo-shortcut.png"
            alt="City Civil Registrar's Office"
            className="w-14 h-14 object-contain shrink-0 rounded-full border-2 border-[var(--login-input-border)]"
          />
        </div>
        <p className="login-page__subtitle text-lg md:text-xl mb-8 text-[var(--login-text)]">
          Log in to your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="login-page__error text-base py-3 px-4 rounded-xl" role="alert">
              {error}
            </div>
          )}
          <div className="text-left">
            <label htmlFor="username" className="login-page__label block text-base md:text-lg font-medium mb-2 text-[var(--login-text)]">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-page__input w-full rounded-xl border-2 px-4 py-3.5 text-base md:text-lg placeholder-[var(--login-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--login-focus)]"
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </div>
          <div className="text-left">
            <label htmlFor="password" className="login-page__label block text-base md:text-lg font-medium mb-2 text-[var(--login-text)]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-page__input w-full rounded-xl border-2 px-4 py-3.5 text-base md:text-lg placeholder-[var(--login-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--login-focus)]"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className="login-page__btn w-full py-4 rounded-xl text-white font-semibold text-lg md:text-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-[var(--login-focus)] focus:ring-offset-2 min-h-[52px]"
          >
            Login
          </button>
        </form>

        <div className="mt-8 space-y-3">
          <p>
            <a href="#" className="login-page__link text-base md:text-lg">
              Can&apos;t log in?
            </a>
          </p>
          <p className="flex items-center justify-center gap-2 flex-wrap text-base">
            <a href="#" className="login-page__link">Privacy policy</a>
            <span className="opacity-70">·</span>
            <a href="#" className="login-page__link">Terms of use</a>
          </p>
        </div>

        <p className="login-page__hint mt-6 text-base">
          Demo: admin / admin123
        </p>
      </div>
    </div>
  )
}
