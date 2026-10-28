import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import MovieList from './components/MovieList'
import Dashboard from './components/Dashboard'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import BookingModal from './components/BookingModal'
import TicketModal from './components/TicketModal'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookingMovie, setBookingMovie] = useState(null)
  const [recentBooking, setRecentBooking] = useState(null)

  const handleMovieSelect = (movie) => {
    setBookingMovie(movie)
  }

  const handleBookingSuccess = (newBooking) => {
    setRecentBooking(newBooking)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <Hero
              onExploreClick={() => setActiveTab('movies')}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            <MovieList
              onSelectMovie={handleMovieSelect}
              searchQuery={searchQuery}
            />
          </>
        )}

        {activeTab === 'movies' && (
          <div className="pt-4">
            <MovieList
              onSelectMovie={handleMovieSelect}
              searchQuery={searchQuery}
            />
          </div>
        )}

        {(activeTab === 'bookings' || activeTab === 'dashboard') && (
          <Dashboard onBrowseMovies={() => setActiveTab('movies')} />
        )}
      </main>

      {/* Global Modals */}
      <AuthModal />

      {bookingMovie && (
        <BookingModal
          movie={bookingMovie}
          onClose={() => setBookingMovie(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {recentBooking && (
        <TicketModal
          booking={recentBooking}
          onClose={() => setRecentBooking(null)}
          onViewBookings={() => {
            setRecentBooking(null)
            setActiveTab('dashboard')
          }}
        />
      )}

      {/* Footer */}
      <Footer onNavigate={setActiveTab} />
    </div>
  )
}

export default App
