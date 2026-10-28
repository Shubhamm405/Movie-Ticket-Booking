function Footer({ onNavigate }) {
  return (
    <footer className="bg-gray-950 border-t border-gray-800/80 mt-20 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-sm">
                CB
              </div>
              <span className="text-xl font-black text-white tracking-wider">
                CINE<span className="text-red-500">BOOK</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Book movie tickets online quickly and easily. Choose your show, select your tickets, and enjoy your movie.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-red-400 transition"
                >
                  Featured Movies
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('movies')}
                  className="hover:text-red-400 transition"
                >
                  Browse Movies
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('bookings')}
                  className="hover:text-red-400 transition"
                >
                  My Bookings
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-red-400 transition"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('chat')}
                  className="hover:text-red-400 transition"
                >
                  Live Chat
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Help & Support
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>Instant Ticket Confirmation</li>
              <li>Easy Booking Cancellation</li>
              <li>support@cinebook.com</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} CineBook. All rights reserved.</p>
          <p>Movie Ticket Booking Made Simple.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
