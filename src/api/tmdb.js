const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const API_URL = 'https://api.themoviedb.org/3'

async function requestTMDB(endpoint, params = {}) {
  params.api_key = API_KEY
  const query = new URLSearchParams(params).toString()

  const response = await fetch(`${API_URL}${endpoint}?${query}`)

  if (!response.ok) {
    throw new Error('TMDB API Error')
  }

  return await response.json()
}

async function getPopularMovie(page = 1) {
  const url = `${API_URL}/movie/popular?api_key=${API_KEY}&page=${page}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('TMDB API Error')
  }

  return await response.json()
}

async function getPopularTV(page = 1) {
  const url = `${API_URL}/tv/popular?api_key=${API_KEY}&page=${page}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('TMDB API Error')
  return await response.json()
}

export default {
  searchMovies(query) {
    return requestTMDB('/search/movie', { query })
  },
  getMovieDetails(id) {
    return requestTMDB(`/movie/${id}`)
  },
  getTrendingMovies() {
    return requestTMDB(`/trending/movie/week`)
  },
  getPopularMovies(page = 1) {
    return getPopularMovie(page)
  },
  searchShow(query) {
    return requestTMDB('/search/tv', { query })
  },
  getShowDetails(id) {
    return requestTMDB(`/tv/${id}`)
  },
  getPopularShows(page = 1) {
    return getPopularTV(page)
  },
}
