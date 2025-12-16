import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase_conf'

export default {
  async searchMovies(query) {
    const searchMoviesFunction = httpsCallable(functions, 'searchMovies')
    const result = await searchMoviesFunction({ query })
    return result.data
  },

  async getMovieDetails(id) {
    const getMovieDetailsFunction = httpsCallable(functions, 'getMovieDetails')
    const result = await getMovieDetailsFunction({ id })
    return result.data
  },

  async getTrendingMovies() {
    const getTrendingMoviesFunction = httpsCallable(functions, 'getTrendingMovies')
    const result = await getTrendingMoviesFunction()
    return result.data
  },

  async getPopularMovies(page = 1) {
    const getPopularMoviesFunction = httpsCallable(functions, 'getPopularMovies')
    const result = await getPopularMoviesFunction({ page })
    return result.data
  },

  async searchShow(query) {
    const searchShowFunction = httpsCallable(functions, 'searchShow')
    const result = await searchShowFunction({ query })
    return result.data
  },

  async getShowDetails(id) {
    const getShowDetailsFunction = httpsCallable(functions, 'getShowDetails')
    const result = await getShowDetailsFunction({ id })
    return result.data
  },

  async getPopularShows(page = 1) {
    const getPopularShowsFunction = httpsCallable(functions, 'getPopularShows')
    const result = await getPopularShowsFunction({ page })
    return result.data
  },
}
