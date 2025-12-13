const API_KEY = import.meta.env.VITE_GBOOKS_API_KEY
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
  searchBooks(query, startIndex = 0, maxResults = 20) {
    return requestBooks('/volumes', {
      q: query,
      startIndex,
      maxResults,
    })
  },

  getTrendingBooks(startIndex = 0, maxResults = 20) {
    return requestBooks('/volumes', {
      q: 'subject:fiction',
      orderBy: 'relevance',
      startIndex,
      maxResults,
      printType: 'books',
      langRestrict: 'en',
    })
  },

  getBookDetails(id) {
    return requestBooks(`/volumes/${id}`)
  },
}
