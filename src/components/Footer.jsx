function Footer({ onNavigate }) {
  return (
    <footer className="bg-gray-950 border-t border-gray-800/80 mt-20 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-sm">
                CB
              </div>
              <span className="text-xl font-black text-white tracking-wider">
                CINE<span className="text-red-500">BOOK</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Your next-generation cinema experience. Interactive real-time seat reservations, instant digital passes, and the best films now playing.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Render API Live
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950/60 border border-blue-800 text-blue-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                MongoDB Atlas Active
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Explore
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
                  Browse Catalog
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
                  User Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Technology Stack */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Stack & Deployment
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>&bull; React 19 & Tailwind CSS v4</li>
              <li>&bull; Express.js 5 & Node.js</li>
              <li>&bull; MongoDB Atlas & Mongoose</li>
              <li>&bull; JWT Token Authentication</li>
              <li>&bull; Deployed on Vercel & Render</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} CineBook Inc. All rights reserved.</p>
          <p>Engineered for high performance and cinema enthusiasts.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
