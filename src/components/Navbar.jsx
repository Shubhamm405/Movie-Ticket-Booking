import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBookings } from '../context/BookingContext'

function Navbar({ activeTab, setActiveTab }) {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth()
  const { bookings } = useBookings()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavClick = (tabId) => {
    setActiveTab(tabId)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="sticky top-0 z-40 bg-gray-950/85 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
              <svg
                className="w-5 h-5 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 3v2h2V7H4zm14 0v2h2V7h-2zM4 11v2h2v-2H4zm14 0v2h2v-2h-2zM4 15v2h2v-2H4zm14 0v2h2v-2h-2zM8 7h8v10H8V7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-wider text-white">
                CINE<span className="text-red-500">BOOK</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold -mt-1">
                Premier Cinema
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'home'
                  ? 'bg-red-600/10 text-red-400 border border-red-500/20'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('movies')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'movies'
                  ? 'bg-red-600/10 text-red-400 border border-red-500/20'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              Browse Movies
            </button>
            <button
              onClick={() => handleNavClick('bookings')}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                activeTab === 'bookings'
                  ? 'bg-red-600/10 text-red-400 border border-red-500/20'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              My Bookings
              {bookings.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-red-600 text-white">
                  {bookings.length}
                </span>
              )}
            </button>
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-red-600/10 text-red-400 border border-red-500/20'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              Dashboard
            </button>
          </nav>

          {/* User Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div
                  onClick={() => handleNavClick('dashboard')}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 cursor-pointer hover:border-gray-700 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold text-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-white leading-tight">
                      {user?.name || 'CineBook User'}
                    </p>
                    <p className="text-gray-400 text-[10px]">
                      {user?.role === 'admin' ? 'Admin' : 'Member'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-3.5 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/25 transition hover:scale-[1.02]"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 pt-2 pb-4 space-y-2">
          <button
            onClick={() => handleNavClick('home')}
            className="w-full text-left px-3 py-2 rounded-lg text-gray-200 hover:bg-gray-800"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('movies')}
            className="w-full text-left px-3 py-2 rounded-lg text-gray-200 hover:bg-gray-800"
          >
            Browse Movies
          </button>
          <button
            onClick={() => handleNavClick('bookings')}
            className="w-full text-left px-3 py-2 rounded-lg text-gray-200 hover:bg-gray-800 flex justify-between items-center"
          >
            <span>My Bookings</span>
            {bookings.length > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-red-600 text-white">
                {bookings.length}
              </span>
            )}
          </button>
          <button
            onClick={() => handleNavClick('dashboard')}
            className="w-full text-left px-3 py-2 rounded-lg text-gray-200 hover:bg-gray-800"
          >
            Dashboard
          </button>

          <div className="pt-3 border-t border-gray-800">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-950/40 border border-red-900/50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    openAuthModal('login')
                  }}
                  className="w-full py-2 text-center rounded-lg bg-gray-800 text-sm font-medium text-white"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    openAuthModal('register')
                  }}
                  className="w-full py-2 text-center rounded-lg bg-red-600 text-sm font-medium text-white"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
