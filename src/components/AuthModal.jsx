import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function AuthModal() {
  const { authModalOpen, authMode, setAuthMode, closeAuthModal, login, register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  if (!authModalOpen) return null

  const resetForm = () => {
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setSuccessMsg('')
  }

  const handleModeSwitch = (newMode) => {
    resetForm()
    setAuthMode(newMode)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!email || !password) {
      setError('Please fill in all required fields.')
      return
    }

    if (authMode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }

      setLoading(true)
      const res = await register(name.trim(), email.trim(), password)
      setLoading(false)

      if (!res.success) {
        setError(res.message || 'Registration failed.')
      } else {
        setSuccessMsg('Account created successfully! Welcome to CineBook.')
        setTimeout(() => {
          closeAuthModal()
          resetForm()
        }, 1200)
      }
    } else {
      setLoading(true)
      const res = await login(email.trim(), password)
      setLoading(false)

      if (!res.success) {
        setError(res.message || 'Login failed. Please verify your credentials.')
      } else {
        setSuccessMsg('Login successful!')
        setTimeout(() => {
          closeAuthModal()
          resetForm()
        }, 800)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click */}
      <div
        className="absolute inset-0"
        onClick={() => {
          closeAuthModal()
          resetForm()
        }}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 z-10 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-gradient-to-r from-red-600 to-rose-400 rounded-b-full shadow-lg shadow-red-500/50" />

        {/* Close Button */}
        <button
          onClick={() => {
            closeAuthModal()
            resetForm()
          }}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-600/15 border border-red-500/25 text-red-500 mb-3">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1h2v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">
            {authMode === 'login' ? 'Sign In to CineBook' : 'Create an Account'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {authMode === 'login'
              ? 'Access your tickets, bookings, and exclusive movie deals.'
              : 'Join CineBook to book tickets and manage your reservations.'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-gray-950/70 rounded-xl border border-gray-800 mb-6">
          <button
            type="button"
            onClick={() => handleModeSwitch('login')}
            className={`py-2 text-sm font-semibold rounded-lg transition ${
              authMode === 'login'
                ? 'bg-red-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('register')}
            className={`py-2 text-sm font-semibold rounded-lg transition ${
              authMode === 'register'
                ? 'bg-red-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-sm flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-sm flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shubham Lachhwani"
                className="w-full px-4 py-2.5 bg-gray-800/90 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 bg-gray-800/90 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-gray-800/90 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition"
              required
            />
          </div>

          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-gray-800/90 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-red-600/30 transition hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            <span>
              {loading
                ? 'Processing...'
                : authMode === 'login'
                ? 'Sign In'
                : 'Create Account'}
            </span>
          </button>
        </form>

        {/* Footer switch */}
        <div className="mt-6 text-center text-xs text-gray-400">
          {authMode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => handleModeSwitch('register')}
                className="text-red-400 hover:text-red-300 font-semibold underline underline-offset-2"
              >
                Register now
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className="text-red-400 hover:text-red-300 font-semibold underline underline-offset-2"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthModal
