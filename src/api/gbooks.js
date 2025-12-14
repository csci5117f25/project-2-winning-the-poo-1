import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase_conf'

export default {
  async searchBooks(query, startIndex = 0, maxResults = 20) {
    const searchBooksFunction = httpsCallable(functions, 'searchBooks')
    const result = await searchBooksFunction({ query, startIndex, maxResults })
    return result.data
  },

  async getTrendingBooks(startIndex = 0, maxResults = 20) {
    const getTrendingBooksFunction = httpsCallable(functions, 'getTrendingBooks')
    const result = await getTrendingBooksFunction({ startIndex, maxResults })
    return result.data
  },

  async getBookDetails(id) {
    const getBookDetailsFunction = httpsCallable(functions, 'getBookDetails')
    const result = await getBookDetailsFunction({ id })
    return result.data
  },
}
