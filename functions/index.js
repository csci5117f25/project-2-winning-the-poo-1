/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions"
import { onCall } from "firebase-functions/v2/https"
import { defineSecret } from "firebase-functions/params"
import { initializeApp } from "firebase-admin/app"

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

initializeApp()

const TMDB_API_KEY = defineSecret("TMDB_API_KEY")
const RAWG_API_KEY = defineSecret("RAWG_API_KEY")
const GBOOKS_API_KEY = defineSecret("GBOOKS_API_KEY")

const TMDB_API_URL = 'https://api.themoviedb.org/3'
const RAWG_API_URL = 'https://api.rawg.io/api'
const GBOOKS_API_URL = 'https://www.googleapis.com/books/v1'

export const searchMovies = onCall({ secrets: [TMDB_API_KEY] }, async (request) => {
  const query = request.data.query
  const API_KEY = TMDB_API_KEY.value()
  const url = `${TMDB_API_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('TMDB Search Movies Error')
  }

  return await response.json()
})

export const getMovieDetails = onCall({ secrets: [TMDB_API_KEY] }, async (request) => {
  const id = request.data.id
  const API_KEY = TMDB_API_KEY.value()
  const url = `${TMDB_API_URL}/movie/${id}?api_key=${API_KEY}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('TMDB Get Movie Details Error')
  }

  return await response.json()
})

export const getTrendingMovies = onCall({ secrets: [TMDB_API_KEY] }, async () => {
  const API_KEY = TMDB_API_KEY.value()
  const url = `${TMDB_API_URL}/trending/movie/week?api_key=${API_KEY}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('TMDB Get Trending Movies Error')
  }

  return await response.json()
})

export const getPopularMovies = onCall({ secrets: [TMDB_API_KEY] }, async (request) => {
  const page = request.data.page
  const API_KEY = TMDB_API_KEY.value()
  const url = `${TMDB_API_URL}/movie/popular?api_key=${API_KEY}&page=${encodeURIComponent(page)}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('TMDB Get Popular Movies Error')
  }

  return await response.json()
})

export const searchShow = onCall({ secrets: [TMDB_API_KEY] }, async (request) => {
  const query = request.data.query
  const API_KEY = TMDB_API_KEY.value()
  const url = `${TMDB_API_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('TMDB Search TV Error')
  }

  return await response.json()
})

export const getShowDetails = onCall({ secrets: [TMDB_API_KEY] }, async (request) => {
  const id = request.data.id
  const API_KEY = TMDB_API_KEY.value()
  const url = `${TMDB_API_URL}/tv/${id}?api_key=${API_KEY}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('TMDB Get TV Details Error')
  }

  return await response.json()
})

export const getPopularShows = onCall({ secrets: [TMDB_API_KEY] }, async (request) => {
  const page = request.data.page
  const API_KEY = TMDB_API_KEY.value()
  const url = `${TMDB_API_URL}/tv/popular?api_key=${API_KEY}&page=${encodeURIComponent(page)}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('TMDB Get Popular TV Error')
  }

  return await response.json()
})

export const searchBooks = onCall({ secrets: [GBOOKS_API_KEY] }, async (request) => {
  const query = request.data.query
  const startIndex = request.data.startIndex || 0
  const maxResults = request.data.maxResults || 20
  const API_KEY = GBOOKS_API_KEY.value()
  const url = `${GBOOKS_API_URL}/volumes?key=${API_KEY}&q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${maxResults}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Google Books Search Books Error')
  }

  return await response.json()
})

export const getTrendingBooks = onCall({ secrets: [GBOOKS_API_KEY] }, async (request) => {
  const startIndex = request.data.startIndex || 0
  const maxResults = request.data.maxResults || 20
  const API_KEY = GBOOKS_API_KEY.value()
  const url = `${GBOOKS_API_URL}/volumes?key=${API_KEY}&q=subject:fiction&orderBy=relevance&startIndex=${startIndex}&maxResults=${maxResults}&printType=books&langRestrict=en`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Google Books Get Trending Books Error')
  }

  return await response.json()
})

export const getBookDetails = onCall({ secrets: [GBOOKS_API_KEY] }, async (request) => {
  const id = request.data.id
  const API_KEY = GBOOKS_API_KEY.value()
  const url = `${GBOOKS_API_URL}/volumes/${id}?key=${API_KEY}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Google Books Get Book Details Error')
  }

  return await response.json()
})

export const searchGames = onCall({ secrets: [RAWG_API_KEY] }, async (request) => {
  const query = request.data.query
  const API_KEY = RAWG_API_KEY.value()
  const url = `${RAWG_API_URL}/games?key=${API_KEY}&search=${encodeURIComponent(query)}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('RAWG Search Games Error')
  }

  return await response.json()
})

export const getTrendingGames = onCall({ secrets: [RAWG_API_KEY] }, async (request) => {
  const API_KEY = RAWG_API_KEY.value()
  const maxResults = request.data.pageSize || 20
  const url = `${RAWG_API_URL}/games?key=${API_KEY}&page_size=${maxResults}&ordering=-metacritic`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('RAWG Get Trending Games Error')
  }

  return await response.json()
})

export const getGameDetails = onCall({ secrets: [RAWG_API_KEY] }, async (request) => {
  const id = request.data.id
  const API_KEY = RAWG_API_KEY.value()
  const url = `${RAWG_API_URL}/games/${id}?key=${API_KEY}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('RAWG Get Game Details Error')
  }

  return await response.json()
})


