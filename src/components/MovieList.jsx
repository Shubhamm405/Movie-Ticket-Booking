import { useState, useEffect, useMemo } from 'react'

const API_URL =
  import.meta.env.VITE_API_URL || 'https://cinebook-backend-92ez.onrender.com'

const DEFAULT_MOVIES = [
  {
    _id: 'default-1',
    title: 'The Odyssey',
    genre: 'Adventure',
    duration: '2h 28m',
    description: 'An epic adventure film detailing the hero Odysseus’ perilous voyage across mythical realms.',
    poster: '/images/odyssey.jpg.jpg',
    rating: 8.9,
    seatsAvailable: 48,
  },
  {
    _id: 'default-2',
    title: 'Spider-Man: Brand New Day',
    genre: 'Action',
    duration: '2h 09m',
    description: 'Peter Parker embarks on a fresh chapter facing formidable new adversaries and high-stakes web-slinging adventures.',
    poster: '/images/spiderman.jpg',
    rating: 8.7,
    seatsAvailable: 45,
  },
  {
    _id: 'default-3',
    title: 'Obsession',
    genre: 'Drama / Thriller',
    duration: '2h 05m',
    description: 'A gripping psychological drama unraveling secrets, hidden desires, and unforeseen twists.',
    poster: '/images/obsession.webp',
    rating: 8.3,
    seatsAvailable: 40,
  },
]

function getMoviePoster(movie) {
  if (movie.poster && (movie.poster.startsWith('http') || movie.poster.startsWith('/'))) {
    return movie.poster
  }
  const title = (movie.title || movie.name || '').toLowerCase()
  if (title.includes('odyssey')) return '/images/odyssey.jpg.jpg'
  if (title.includes('spider')) return '/images/spiderman.jpg'
  if (title.includes('obsession')) return '/images/obsession.webp'
  return '/images/odyssey.jpg.jpg'
}

function MovieList({ onSelectMovie, searchQuery = '' }) {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')

  useEffect(() => {
    let active = true

    async function loadMovies() {
      try {
        const response = await fetch(`${API_URL}/api/movies`)

        if (!response.ok) {
          throw new Error('Backend returned status ' + response.status)
        }

        const data = await response.json()

        if (!Array.isArray(data) || data.length === 0) {
          // If backend returns empty, use default catalog
          if (active) setMovies(DEFAULT_MOVIES)
        } else {
          // Merge backend movies with matching posters
          const formatted = data.map((m) => ({
            ...m,
            poster: getMoviePoster(m),
            rating: m.rating || 8.6,
          }))
          if (active) setMovies(formatted)
        }
      } catch (err) {
        console.warn('Could not load remote movies, using defaults:', err.message)
        if (active) {
          setError('Connected in offline/fallback mode.')
          setMovies(DEFAULT_MOVIES)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadMovies()

    return () => {
      active = false
    }
  }, [])

  // Extract distinct genres
  const genres = useMemo(() => {
    const list = new Set(['All'])
    movies.forEach((m) => {
      if (m.genre) {
        m.genre.split(/[/,&]/).forEach((g) => {
          const trimmed = g.trim()
          if (trimmed) list.add(trimmed)
        })
      }
    })
    return Array.from(list)
  }, [movies])

  // Filtered movies based on search and genre
  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      const title = (m.title || m.name || '').toLowerCase()
      const genre = (m.genre || '').toLowerCase()
      const query = searchQuery.toLowerCase().trim()

      const matchesSearch =
        !query || title.includes(query) || genre.includes(query)

      const matchesGenre =
        selectedGenre === 'All' ||
        genre.toLowerCase().includes(selectedGenre.toLowerCase())

      return matchesSearch && matchesGenre
    })
  }, [movies, searchQuery, selectedGenre])

  return (
    <section id="movies-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-red-500 font-bold uppercase tracking-widest text-xs">
            NOW SHOWING IN THEATERS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Featured Movies
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Pick a film, select your seats, and enjoy the show.
          </p>
        </div>

        {/* Genre Filter Pills */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
          {genres.slice(0, 6).map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => setSelectedGenre(genre)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedGenre === genre
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-900/60 rounded-3xl p-5 border border-gray-800 animate-pulse space-y-4"
            >
              <div className="h-64 bg-gray-800 rounded-2xl" />
              <div className="h-6 bg-gray-800 rounded w-3/4" />
              <div className="h-4 bg-gray-800 rounded w-1/2" />
              <div className="h-10 bg-gray-800 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Movies Grid */}
      {!loading && filteredMovies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMovies.map((movie) => {
            const poster = getMoviePoster(movie)
            const title = movie.title || movie.name

            return (
              <div
                key={movie._id}
                className="group bg-gray-900/80 border border-gray-800 hover:border-red-500/40 rounded-3xl p-5 shadow-xl hover:shadow-2xl hover:shadow-red-950/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Poster Image Container */}
                  <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden mb-5 bg-gray-950 border border-gray-800">
                    <img
                      src={poster}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-80" />

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-amber-400 font-bold text-xs flex items-center gap-1 shadow">
                      <span>★</span>
                      <span>{movie.rating ? Number(movie.rating).toFixed(1) : '8.8'}</span>
                    </div>

                    {/* Genre tag */}
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-red-600/80 backdrop-blur-md text-white text-[11px] font-bold tracking-wide uppercase">
                      {movie.genre}
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition">
                    {title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 mb-3">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {movie.duration}
                    </span>
                    <span>&bull;</span>
                    <span className="text-emerald-400 font-medium">Dolby Atmos / 4K</span>
                  </div>

                  <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                    {movie.description || 'Experience this thrilling cinema presentation in stunning audio and visual fidelity.'}
                  </p>
                </div>

                {/* Booking Button */}
                <div className="mt-6 pt-4 border-t border-gray-800/80 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectMovie(movie)}
                    className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 group-hover:shadow-red-600/50 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
                    </svg>
                    <span>Book Tickets</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* No movies match search */}
      {!loading && filteredMovies.length === 0 && (
        <div className="text-center py-16 bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
          <p className="text-4xl mb-3">🎬</p>
          <h3 className="text-xl font-bold text-white">No Movies Found</h3>
          <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
            We couldn't find any movies matching "{searchQuery}". Try searching for another genre or title.
          </p>
        </div>
      )}
    </section>
  )
}

export default MovieList
