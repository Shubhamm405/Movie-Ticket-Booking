import { useEffect, useState, useContext } from 'react'
import useUser from '../hooks/useUser'
import { BookingContext } from '../context/BookingContext'
import BookingList from './BookingList'

function Dashboard() {
  const user = useUser()

  const { bookings, addBooking } = useContext(BookingContext)

  const [movie, setMovie] = useState('The Odyssey')
  const [seats, setSeats] = useState(1)
  const [message, setMessage] = useState('')

  useEffect(() => {
    document.title = `Bookings (${bookings.length}) - CineBook`
  }, [bookings])

  useEffect(() => {
    if (!message) return

    const timer = setTimeout(() => {
      setMessage('')
    }, 3000)

    return () => clearTimeout(timer)
  }, [message])

  const addNewBooking = () => {
    const newBooking = {
      movie: movie,
      date: '2026-09-10',
      time: '7:00 PM',
      seats: seats
    }

    addBooking(newBooking)
    setMessage('Ticket booked successfully!')
  }

  return (
    <div className="max-w-md mx-auto mt-6 bg-gray-900 border border-gray-700 rounded-lg p-4">

      <p className="text-white">
        Welcome, {user.name}
      </p>

      <p className="text-gray-400">
        Role: {user.role}
      </p>

      <p className="text-gray-400 mt-2">
        Bookings: {bookings.length}
      </p>

      {message && (
        <div className="mt-3 p-3 bg-green-600 text-white rounded-lg">
          {message}
        </div>
      )}

      <div className="mt-4 space-y-3">

        <select
          value={movie}
          onChange={(e) => setMovie(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
        >
          <option value="The Odyssey">
            The Odyssey
          </option>

          <option value="Spiderman Brand New Day">
            Spiderman Brand New Day
          </option>

          <option value="Obsession">
            Obsession
          </option>
        </select>

        <input
          type="number"
          min="1"
          max="10"
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
          placeholder="Number of seats"
        />

      </div>

      <BookingList />

      <button
        onClick={addNewBooking}
        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
      >
        Book Tickets
      </button>

    </div>
  )
}

export default Dashboard