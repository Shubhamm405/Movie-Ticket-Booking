import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBookings } from '../context/BookingContext'
import TicketModal from './TicketModal'

function Dashboard({ onBrowseMovies }) {
  const { user, isAuthenticated, openAuthModal } = useAuth()
  const { bookings, loading, removeBooking, fetchBookings } = useBookings()

  const [selectedTicket, setSelectedTicket] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [actionMessage, setActionMessage] = useState('')

  const handleCancel = async (booking) => {
    const id = booking._id || booking.id
    if (!window.confirm(`Are you sure you want to cancel your booking for "${booking.movie}"?`)) {
      return
    }

    setCancellingId(id)
    setActionMessage('')

    const res = await removeBooking(id)
    setCancellingId(null)

    if (res.success) {
      setActionMessage(`Booking for "${booking.movie}" was cancelled successfully.`)
      setTimeout(() => setActionMessage(''), 4000)
    } else {
      setActionMessage('Failed to cancel booking. Please try again.')
    }
  }

  const totalSpent = bookings.reduce(
    (sum, b) => sum + (b.totalPrice ? Number(b.totalPrice) : (b.seats || 1) * 250),
    0
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* User Profile Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-900 to-gray-950 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-red-600/30">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {user?.name || 'Guest User'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30">
                  {user?.role === 'admin' ? 'Admin' : isAuthenticated ? 'Member' : 'Guest'}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {user?.email || 'Sign in to access and manage your bookings.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-lg shadow-red-600/30 transition hover:scale-105"
              >
                Sign In / Register
              </button>
            ) : (
              <button
                type="button"
                onClick={fetchBookings}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold border border-gray-700 transition flex items-center gap-2"
              >
                <svg
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            )}
          </div>
        </div>

        {/* User Stats Grid (Cleaned up, no developer/backend badges) */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-800/80">
          <div className="bg-gray-950/50 p-4 rounded-2xl border border-gray-800">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold block">
              Total Bookings
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
              {bookings.length}
            </span>
          </div>

          <div className="bg-gray-950/50 p-4 rounded-2xl border border-gray-800">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold block">
              Total Amount
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">
              ₹{totalSpent.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Action status toast */}
      {actionMessage && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-2xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage('')} className="text-gray-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Bookings List Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              My Bookings
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              View and manage your movie tickets.
            </p>
          </div>

          <button
            type="button"
            onClick={onBrowseMovies}
            className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>+ Book More Tickets</span>
          </button>
        </div>

        {/* Loading */}
        {loading && bookings.length === 0 && (
          <div className="text-center py-12 bg-gray-900/40 rounded-3xl border border-gray-800 animate-pulse text-gray-400">
            Loading your bookings...
          </div>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <div className="text-center py-16 bg-gray-900/40 border border-gray-800 rounded-3xl p-8">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center text-3xl mx-auto mb-4">
              🎟️
            </div>
            <h3 className="text-xl font-bold text-white">No Bookings Yet</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto mt-1 mb-6">
              You haven't booked any movie tickets yet. Browse available movies and book your tickets!
            </p>
            <button
              type="button"
              onClick={onBrowseMovies}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/30 transition hover:scale-105"
            >
              Browse Movies
            </button>
          </div>
        )}

        {/* Bookings Grid */}
        {bookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((b, idx) => {
              const id = b._id || b.id || idx
              const seatsLabel = `${b.seats || 1} Ticket${(b.seats || 1) > 1 ? 's' : ''}`
              const price = b.totalPrice ? Number(b.totalPrice) : (b.seats || 1) * 250
              const isCancelling = cancellingId === id

              return (
                <div
                  key={id}
                  className="bg-gray-900/80 border border-gray-800 hover:border-gray-700 rounded-3xl p-5 shadow-lg flex flex-col justify-between transition-all hover:shadow-xl"
                >
                  <div>
                    {/* Top ticket strip */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-red-500">
                        CONFIRMED
                      </span>
                      <span className="text-xs font-mono text-gray-400">
                        {b.date}
                      </span>
                    </div>

                    {/* Movie Title */}
                    <h3 className="text-xl font-black text-white mt-3 line-clamp-1">
                      {b.movie}
                    </h3>

                    {/* Show details */}
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between text-gray-400">
                        <span>Showtime:</span>
                        <span className="text-gray-200 font-semibold">{b.time}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Tickets:</span>
                        <span className="text-red-400 font-bold">{seatsLabel}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Total Paid:</span>
                        <span className="text-emerald-400 font-bold">
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-gray-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(b)}
                      className="flex-1 py-2 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold border border-gray-700 transition flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>View Ticket</span>
                    </button>

                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={() => handleCancel(b)}
                      className="py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs font-semibold border border-red-900/50 transition flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {isCancelling ? 'Cancelling...' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Digital Ticket Modal */}
      {selectedTicket && (
        <TicketModal
          booking={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onViewBookings={() => setSelectedTicket(null)}
        />
      )}
    </div>
  )
}

export default Dashboard
