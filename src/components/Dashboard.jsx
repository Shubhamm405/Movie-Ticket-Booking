
import { useEffect, useState, useContext } from 'react'
import useUser from '../hooks/useUser'
import { BookingContext } from '../context/BookingContext'
import BookingList from './BookingList'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://cinebook-backend-92ez.onrender.com'

function Dashboard() {
  const user = useUser()
  const { bookings, addBooking } = useContext(BookingContext)

  const [movies, setMovies] = useState([])
  const [movie, setMovie] = useState('')
  const [seats, setSeats] = useState(1)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = `Bookings (${bookings.length}) - CineBook`
  }, [bookings.length])

  useEffect(() => {
    let cancelled = false

    async function loadMovies() {
      try {
        const response = await fetch(`${API_URL}/api/movies`)

        if (!response.ok) {
          throw new Error('Unable to load movies from the server.')
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error('Unexpected movie data received.')
        }

        if (!cancelled) {
          setMovies(data)
          setMovie(data.length ? (data[0].title || data[0].name || '') : '')
          setError('')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not connect to the backend.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadMovies()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!message) return

    const timer = setTimeout(() => setMessage(''), 3000)
    return () => clearTimeout(timer)
  }, [message])

  const addNewBooking = () => {
    if (!movie) {
      setMessage('Please select a movie first.')
      return
    }

    const seatCount = Number(seats)

    if (!Number.isInteger(seatCount) || seatCount < 1 || seatCount > 10) {
      setMessage('Please select between 1 and 10 seats.')
      return
    }

    const newBooking = {
      movie,
      date: '2026-09-10',
      time: '7:00 PM',
      seats: seatCount
    }

    addBooking(newBooking)
    setMessage('Ticket saved in this browser!')
  }

  return (
    <div className="max-w-md mx-auto mt-6 bg-gray-900 border border-gray-700 rounded-lg p-4">
      <p className="text-white">
        Welcome, {user?.name || 'Guest'}
      </p>

      <p className="text-gray-400">
        Role: {user?.role || 'User'}
      </p>

      <p className="text-gray-400 mt-2">
        Bookings: {bookings.length}
      </p>

      {message && (
        <div
          role="status"
          className="mt-3 p-3 bg-green-600 text-white rounded-lg"
        >
          {message}
        </div>
      )}

      <div className="mt-4 space-y-3">
        <label className="block text-gray-300">
          Select movie
          <select
            value={movie}
            onChange={(e) => setMovie(e.target.value)}
            disabled={loading || movies.length === 0}
            className="mt-1 w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
          >
            {loading && <option value="">Loading movies...</option>}

            {!loading && movies.length === 0 && (
              <option value="">No movies available</option>
            )}

            {movies.map((item) => {
              const title = item.title || item.name

              return title ? (
                <option key={item._id} value={title}>
                  {title}
                </option>
              ) : null
            })}
          </select>
        </label>

        {error && (
          <p role="alert" className="text-red-400 text-sm">
            {error}
          </p>
        )}

        {!loading && !error && movies.length === 0 && (
          <p className="text-yellow-400 text-sm">
            No movies found. Add movie records to your MongoDB database.
          </p>
        )}

        <label className="block text-gray-300">
          Number of seats
          <input
            type="number"
            min="1"
            max="10"
            value={seats}
            onChange={(e) => setSeats(Number(e.target.value))}
            className="mt-1 w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
          />
        </label>
      </div>

      <BookingList />

      <button
        onClick={addNewBooking}
        disabled={loading || !movie}
        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-white"
      >
        Book Tickets
      </button>

      <p className="mt-3 text-xs text-gray-400">
        Note: bookings are currently saved in this browser, not in the backend database.
      </p>
    </div>
  )
}

export default Dashboard
