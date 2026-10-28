function Hero({ onExploreClick, searchQuery, setSearchQuery }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-14 sm:py-20 border-b border-gray-800">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Online Movie Ticket Booking
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Book Your Favorite <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-300 bg-clip-text text-transparent">
            Movie Tickets
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-sm sm:text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
          Select your movie, choose your showtime, pick the number of tickets, and book instantly.
        </p>

        {/* Search Bar */}
        <div className="mt-7 max-w-lg mx-auto">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies by title or genre..."
              className="w-full pl-11 pr-24 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 transition shadow"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 px-2.5 py-1 text-xs text-gray-400 hover:text-white bg-gray-800 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Feature Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800">
            <span className="text-red-500">⚡</span>
            <span>Instant Confirmation</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800">
            <span className="text-red-500">🎟️</span>
            <span>Digital Ticket Pass</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800">
            <span className="text-red-500">🍿</span>
            <span>Easy Online Booking</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
