import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBookings } from '../context/BookingContext'

const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E', 'F']
const SEATS_PER_ROW = [1, 2, 3, 4, 5, 6, 7, 8]

function getFormattedDate(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0] // 'YYYY-MM-DD'
}

function getDisplayDate(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' })
  const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return { weekday, monthDay, iso: d.toISOString().split('T')[0] }
}

const SHOWTIMES = [
  { time: '1:15 PM', tag: 'Dolby 2D' },
  { time: '4:30 PM', tag: 'IMAX 3D' },
  { time: '7:45 PM', tag: 'Dolby Atmos' },
  { time: '10:15 PM', tag: 'Late Night' },
]

function BookingModal({ movie, onClose, onBookingSuccess }) {
  const { user, isAuthenticated, openAuthModal } = useAuth()
  const { addBooking, getOccupiedSeats } = useBookings()

  const availableDates = useMemo(() => [
    getDisplayDate(0),
    getDisplayDate(1),
    getDisplayDate(2),
    getDisplayDate(3),
  ], [])

  const [selectedDate, setSelectedDate] = useState(availableDates[0].iso)
  const [selectedTime, setSelectedTime] = useState(SHOWTIMES[1].time)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [occupiedSeats, setOccupiedSeats] = useState([])
  const [loadingOccupied, setLoadingOccupied] = useState(true)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Fetch occupied seats whenever movie, date, or time changes
  useEffect(() => {
    let active = true

    async function checkOccupied() {
      if (!movie) return
      setLoadingOccupied(true)
      const movieTitle = movie.title || movie.name
      const occupied = await getOccupiedSeats(movieTitle, selectedDate, selectedTime)
      if (active) {
        setOccupiedSeats(occupied)
        // Remove any currently selected seats that are occupied in this show
        setSelectedSeats((prev) => prev.filter((s) => !occupied.includes(s)))
        setLoadingOccupied(false)
      }
    }

    checkOccupied()

    return () => {
      active = false
    }
  }, [movie, selectedDate, selectedTime, getOccupiedSeats])

  if (!movie) return null

  // Pricing based on tier: Rows A-B: $12, C-E: $15, F: $18
  const getSeatPrice = (seatCode) => {
    const row = seatCode.charAt(0)
    if (row === 'F') return 18
    if (row === 'C' || row === 'D' || row === 'E') return 15
    return 12
  }

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0)

  const handleSeatClick = (seatCode) => {
    if (occupiedSeats.includes(seatCode)) return

    if (selectedSeats.includes(seatCode)) {
      setSelectedSeats((prev) => prev.filter((s) => s !== seatCode))
    } else {
      if (selectedSeats.length >= 8) {
        setErrorMsg('Maximum 8 seats per booking.')
        return
      }
      setErrorMsg('')
      setSelectedSeats((prev) => [...prev, seatCode])
    }
  }

  const handleConfirmBooking = async () => {
    setErrorMsg('')

    if (selectedSeats.length === 0) {
      setErrorMsg('Please select at least one seat.')
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
      seats: selectedSeats.length,
      selectedSeats,
      totalPrice: totalPrice || selectedSeats.length * 12,
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
      <div className="relative w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl z-10 overflow-hidden my-auto">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-950/80 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <img
              src={posterUrl}
              alt={movieTitle}
              className="w-10 h-14 object-cover rounded-lg shadow-md border border-gray-700"
            />
            <div>
              <h3 className="text-lg font-bold text-white line-clamp-1">
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

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Step 1: Select Date */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              1. Choose Date
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {availableDates.map((item, idx) => (
                <button
                  key={item.iso}
                  type="button"
                  onClick={() => setSelectedDate(item.iso)}
                  className={`py-2.5 px-3 rounded-xl border text-center transition ${
                    selectedDate === item.iso
                      ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30'
                      : 'bg-gray-950/60 border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-gray-800/50'
                  }`}
                >
                  <span className="block text-xs font-medium opacity-80">
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
              2. Select Showtime
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SHOWTIMES.map((st) => (
                <button
                  key={st.time}
                  type="button"
                  onClick={() => setSelectedTime(st.time)}
                  className={`py-2.5 px-3 rounded-xl border text-center transition ${
                    selectedTime === st.time
                      ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30'
                      : 'bg-gray-950/60 border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-gray-800/50'
                  }`}
                >
                  <span className="block text-sm font-bold">{st.time}</span>
                  <span className="block text-[10px] uppercase font-semibold text-gray-400 mt-0.5">
                    {st.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Interactive Cinema Theater Grid */}
          <div className="bg-gray-950/70 border border-gray-800 rounded-2xl p-4 sm:p-6 text-center">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                3. Choose Your Seats
              </span>
              <span className="text-xs text-gray-400">
                {selectedSeats.length > 0 ? (
                  <span className="text-red-400 font-semibold">
                    {selectedSeats.length} seat(s) selected ({selectedSeats.join(', ')})
                  </span>
                ) : (
                  'Click seats to select'
                )}
              </span>
            </div>

            {/* Screen Projection Indicator */}
            <div className="relative mb-8 max-w-md mx-auto">
              <div className="h-2 w-full bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full shadow-[0_10px_25px_rgba(239,68,68,0.5)]" />
              <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold mt-2">
                CINEMA SCREEN THIS WAY
              </p>
            </div>

            {/* Seat Grid */}
            <div className="space-y-2 max-w-lg mx-auto overflow-x-auto pb-2">
              {SEAT_ROWS.map((row) => (
                <div key={row} className="flex items-center justify-center gap-2">
                  <span className="w-5 text-xs font-bold text-gray-400">{row}</span>
                  <div className="flex gap-2">
                    {SEATS_PER_ROW.map((num) => {
                      const seatCode = `${row}${num}`
                      const isOccupied = occupiedSeats.includes(seatCode)
                      const isSelected = selectedSeats.includes(seatCode)

                      return (
                        <button
                          key={seatCode}
                          type="button"
                          disabled={isOccupied || loadingOccupied}
                          onClick={() => handleSeatClick(seatCode)}
                          title={`${seatCode} - $${getSeatPrice(seatCode)} ${
                            isOccupied ? '(Occupied)' : ''
                          }`}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                            isOccupied
                              ? 'bg-gray-800/40 text-gray-600 border border-gray-800 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-red-600 border-2 border-white text-white shadow-md shadow-red-600/50 scale-105'
                              : 'bg-gray-800 text-gray-300 border border-gray-700/80 hover:border-red-500 hover:text-white hover:scale-105'
                          }`}
                        >
                          {num}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-800/80 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-gray-800 border border-gray-700" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-red-600 border border-white" />
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-gray-800/40 border border-gray-800 text-gray-600" />
                <span>Occupied</span>
              </div>
            </div>
          </div>

          {/* User info if guest */}
          {!isAuthenticated && (
            <div className="bg-gray-950/60 border border-gray-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Contact Information
                </span>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold underline underline-offset-2"
                >
                  Already have an account? Sign in
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
        <div className="px-6 py-4 bg-gray-950 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400">Total Price ({selectedSeats.length} seats):</p>
            <p className="text-2xl font-black text-white">
              ${totalPrice.toFixed(2)}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting || selectedSeats.length === 0}
              onClick={handleConfirmBooking}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-red-600/30 transition hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Securing Tickets...</span>
                </>
              ) : (
                <span>Confirm & Book Tickets</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingModal
