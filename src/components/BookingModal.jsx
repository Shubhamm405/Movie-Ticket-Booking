import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBookings } from '../context/BookingContext'

const TICKET_PRICE = 250 // Price in Indian Rupees

function getDisplayDate(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' })
  const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return { weekday, monthDay, iso: d.toISOString().split('T')[0] }
}

const SHOWTIMES = [
  '1:15 PM',
  '4:30 PM',
  '7:45 PM',
  '10:15 PM',
]

function BookingModal({ movie, onClose, onBookingSuccess }) {
  const { user, isAuthenticated, openAuthModal } = useAuth()
  const { addBooking } = useBookings()

  const availableDates = useMemo(() => [
    getDisplayDate(0),
    getDisplayDate(1),
    getDisplayDate(2),
    getDisplayDate(3),
  ], [])

  const [selectedDate, setSelectedDate] = useState(availableDates[0].iso)
  const [selectedTime, setSelectedTime] = useState(SHOWTIMES[1])
  const [seatCount, setSeatCount] = useState(2)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!movie) return null

  const totalPrice = seatCount * TICKET_PRICE

  const handleSeatsChange = (delta) => {
    setSeatCount((prev) => {
      const next = prev + delta
      if (next < 1) return 1
      if (next > 10) return 10
      return next
    })
  }

  const handleConfirmBooking = async () => {
    setErrorMsg('')

    if (seatCount < 1 || seatCount > 10) {
      setErrorMsg('Please select between 1 and 10 seats.')
      return
    }

    const finalName = isAuthenticated ? user.name : guestName.trim()
    const finalEmail = isAuthenticated ? user.email : guestEmail.trim()

    if (!isAuthenticated && (!finalName || !finalEmail)) {
      setErrorMsg('Please enter your name and email or sign in to complete your booking.')
      return
    }

    setSubmitting(true)

    const payload = {
      movie: movie.title || movie.name,
      date: selectedDate,
      time: selectedTime,
      seats: seatCount,
      totalPrice: totalPrice,
      userEmail: finalEmail,
      userName: finalName,
      userId: user?.id,
    }

    const res = await addBooking(payload)
    setSubmitting(false)

    if (!res.success) {
      setErrorMsg(res.message || 'Could not save booking.')
    } else {
      onBookingSuccess(res.booking)
      onClose()
    }
  }

  const movieTitle = movie.title || movie.name
  const posterUrl =
    movie.poster ||
    (movieTitle.toLowerCase().includes('odyssey')
      ? '/images/odyssey.jpg.jpg'
      : movieTitle.toLowerCase().includes('spider')
      ? '/images/spiderman.jpg'
      : movieTitle.toLowerCase().includes('obsession')
      ? '/images/obsession.webp'
      : '/images/odyssey.jpg.jpg')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Container */}
      <div className="relative w-full max-w-xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl z-10 overflow-hidden my-auto">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-950/80 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <img
              src={posterUrl}
              alt={movieTitle}
              className="w-10 h-14 object-cover rounded-lg shadow border border-gray-700"
            />
            <div>
              <h3 className="text-base font-bold text-white line-clamp-1">
                {movieTitle}
              </h3>
              <p className="text-xs text-gray-400">
                {movie.genre || 'Action / Drama'} &bull; {movie.duration || '2h'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Select Date */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Select Date
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {availableDates.map((item, idx) => (
                <button
                  key={item.iso}
                  type="button"
                  onClick={() => setSelectedDate(item.iso)}
                  className={`py-2 px-3 rounded-xl border text-center transition ${
                    selectedDate === item.iso
                      ? 'bg-red-600 border-red-500 text-white shadow'
                      : 'bg-gray-950/60 border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-gray-800/50'
                  }`}
                >
                  <span className="block text-[11px] font-medium opacity-80">
                    {idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : item.weekday}
                  </span>
                  <span className="block text-sm font-bold mt-0.5">
                    {item.monthDay}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Showtime */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Select Showtime
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SHOWTIMES.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`py-2.5 px-3 rounded-xl border text-center transition ${
                    selectedTime === time
                      ? 'bg-red-600 border-red-500 text-white shadow'
                      : 'bg-gray-950/60 border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-gray-800/50'
                  }`}
                >
                  <span className="block text-sm font-bold">{time}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Select Number of Seats (Normal / Basic) */}
          <div className="bg-gray-950/70 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Number of Tickets
                </span>
                <span className="text-xs text-gray-400 mt-0.5 block">
                  ₹{TICKET_PRICE} per ticket
                </span>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-xl p-1.5">
                <button
                  type="button"
                  onClick={() => handleSeatsChange(-1)}
                  disabled={seatCount <= 1}
                  className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white font-bold text-lg flex items-center justify-center transition"
                >
                  -
                </button>
                <span className="w-8 text-center text-lg font-extrabold text-white">
                  {seatCount}
                </span>
                <button
                  type="button"
                  onClick={() => handleSeatsChange(1)}
                  disabled={seatCount >= 10}
                  className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white font-bold text-lg flex items-center justify-center transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick seat pills */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-800/80">
              <span className="text-xs text-gray-400 mr-1">Quick Select:</span>
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSeatCount(num)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    seatCount === num
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* User info if guest */}
          {!isAuthenticated && (
            <div className="bg-gray-950/60 border border-gray-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Contact Details
                </span>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold underline underline-offset-2"
                >
                  Sign in
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-950/70 border border-red-800 text-red-300 rounded-xl text-sm flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Checkout Bar */}
        <div className="px-6 py-4 bg-gray-950 border-t border-gray-800 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400">Total Price ({seatCount} {seatCount > 1 ? 'tickets' : 'ticket'}):</p>
            <p className="text-2xl font-black text-white">
              ₹{totalPrice.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirmBooking}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-red-600/30 transition hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Booking...</span>
                </>
              ) : (
                <span>Book Tickets</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingModal
