import { useContext } from 'react'
import { BookingContext } from '../context/BookingContext'

function BookingList() {
  const { bookings, removeBooking } = useContext(BookingContext)

  return (
    <div className="mt-4 space-y-2">
      {bookings.map((booking, index) => (
        <div
          key={index}
          className="p-3 bg-gray-800 rounded-lg"
        >
          <p className="text-white font-semibold">
            {booking.movie}
          </p>

          <p className="text-gray-400 text-sm">
            {booking.date} • {booking.time} • {booking.seats} seats
          </p>

          <button
            onClick={() => removeBooking(index)}
            className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
          >
            Cancel Booking
          </button>
        </div>
      ))}
    </div>
  )
}

export default BookingList