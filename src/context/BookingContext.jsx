import { createContext } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

export const BookingContext = createContext()

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useLocalStorage(
    'cinebook-bookings',
    []
  )

  const addBooking = (booking) => {
    setBookings((currentBookings) => [
      ...currentBookings,
      booking
    ])
  }

  const removeBooking = (index) => {
    setBookings((currentBookings) =>
      currentBookings.filter((_, i) => i !== index)
    )
  }

  return (
    <BookingContext.Provider
      value={{
        bookings,
        addBooking,
        removeBooking
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}