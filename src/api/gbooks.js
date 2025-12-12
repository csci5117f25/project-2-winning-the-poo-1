const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY
const API_URL = 'https://www.googleapis.com/books/v1'

async function requestBooks(endpoint, params = {}) {
  params.key = API_KEY
  const query = new URLSearchParams(params).toString()

  const response = await fetch(`${API_URL}${endpoint}?${query}`)

  if (!response.ok) {
    throw new Error('Google Books API Error')
  }

  return await response.json()
}

export default {
  searchBooks(query) {
    return requestBooks('/volumes', { q: query })
  },
  getBookDetails(id) {
    return requestBooks(`/volumes/${id}`)
  },
}
