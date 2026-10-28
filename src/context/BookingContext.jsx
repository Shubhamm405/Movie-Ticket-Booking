import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { AuthContext } from './AuthContext'

export const BookingContext = createContext(null)

const API_URL =
  import.meta.env.VITE_API_URL || 'https://cinebook-backend-92ez.onrender.com'

export function BookingProvider({ children }) {
  const auth = useContext(AuthContext)
  const user = auth?.user
  const token = auth?.token

  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('cinebook_cached_bookings')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch bookings for the current user (or all bookings)
  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      let endpoint = `${API_URL}/api/bookings`
      if (user?.email) {
        endpoint += `?email=${encodeURIComponent(user.email)}`
      }

      const headers = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(endpoint, { headers })

      if (!response.ok) {
        throw new Error('Failed to load bookings from server.')
      }

      const data = await response.json()
      if (Array.isArray(data)) {
        setBookings(data)
        localStorage.setItem('cinebook_cached_bookings', JSON.stringify(data))
      }
    } catch (err) {
      console.warn('Booking fetch warning:', err.message)
      setError(err.message || 'Could not fetch bookings.')
    } finally {
      setLoading(false)
    }
  }, [user?.email, token])

  // Automatically fetch bookings whenever the logged-in user changes
  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // Create a new booking
  const addBooking = async (bookingData) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const payload = {
        movie: bookingData.movie,
        date: bookingData.date,
        time: bookingData.time,
        seats: Number(bookingData.seats) || (bookingData.selectedSeats?.length || 1),
        selectedSeats: bookingData.selectedSeats || [],
        totalPrice: bookingData.totalPrice || (bookingData.seats || 1) * 12,
        userId: user?.id,
        userEmail: user?.email || bookingData.userEmail,
        userName: user?.name || bookingData.userName || 'Guest User',
      }

      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete booking.')
      }

      const createdBooking = data.booking || {
        _id: 'local-' + Date.now(),
        ...payload,
        createdAt: new Date().toISOString(),
      }

      setBookings((prev) => [createdBooking, ...prev])
      return { success: true, booking: createdBooking }
    } catch (err) {
      console.error('Create booking error:', err)
      return {
        success: false,
        message: err.message || 'Unable to save booking to backend.',
      }
    }
  }

  // Cancel / Delete a booking from MongoDB
  const removeBooking = async (bookingIdOrIndex) => {
    let bookingToDelete = null

    if (typeof bookingIdOrIndex === 'number') {
      bookingToDelete = bookings[bookingIdOrIndex]
    } else {
      bookingToDelete = bookings.find((b) => (b._id || b.id) === bookingIdOrIndex)
    }

    if (!bookingToDelete) {
      return { success: false, message: 'Booking not found.' }
    }

    const id = bookingToDelete._id || bookingToDelete.id

    try {
      // If it's a real MongoDB ID, send DELETE request
      if (id && !String(id).startsWith('local-')) {
        const headers = {}
        if (token) headers.Authorization = `Bearer ${token}`

        const response = await fetch(`${API_URL}/api/bookings/${id}`, {
          method: 'DELETE',
          headers,
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          console.warn('Backend deletion warning:', errData.message)
        }
      }

      // Update local state
      setBookings((prev) =>
        prev.filter((b) => (b._id || b.id) !== id)
      )

      return { success: true }
    } catch (err) {
      console.error('Delete booking error:', err)
      // Even if network fails, allow optimistic removal from UI
      setBookings((prev) =>
        prev.filter((b) => (b._id || b.id) !== id)
      )
      return { success: true }
    }
  }

  // Fetch occupied seats for a movie showtime
  const getOccupiedSeats = async (movieTitle, date, time) => {
    try {
      const response = await fetch(
        `${API_URL}/api/bookings/occupied?movie=${encodeURIComponent(
          movieTitle
        )}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`
      )

      if (!response.ok) return []

      const data = await response.json()
      return data.occupiedSeats || []
    } catch {
      return []
    }
  }

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        error,
        fetchBookings,
        addBooking,
        removeBooking,
        getOccupiedSeats,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBookings() {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider')
  }
  return context
}

export default BookingContext
