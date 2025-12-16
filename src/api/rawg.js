import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase_conf'

export default {
  async searchGames(query) {
    const searchGamesFunction = httpsCallable(functions, 'searchGames')
    const result = await searchGamesFunction({ query })
    return result.data
  },

  async getGameDetails(id) {
    const getGameDetailsFunction = httpsCallable(functions, 'getGameDetails')
    const result = await getGameDetailsFunction({ id })
    return result.data
  },

  async getTrendingGames(maxResults = 40) {
    const getTrendingGamesFunction = httpsCallable(functions, 'getTrendingGames')
    const result = await getTrendingGamesFunction({ maxResults })
    return result.data
  }
}
