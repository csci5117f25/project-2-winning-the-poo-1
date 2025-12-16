const API_KEY = import.meta.env.VITE_RAWG_API_KEY
const API_URL = 'https://api.rawg.io/api'

async function requestRAWG(endpoint, params = {}) {
  params.key = API_KEY
  const query = new URLSearchParams(params).toString()

  const response = await fetch(`${API_URL}${endpoint}?${query}`)

  if (!response.ok) {
    throw new Error('RAWG API Error')
  }

  return await response.json()
}

export default {
  searchGames(query) {
    return requestRAWG('/games', { search: query })
  },
  getGameDetails(id) {
    return requestRAWG(`/games/${id}`)
  },
  getTrendingGames() {
    return requestRAWG(`/games?ordering=rating`)
  }
}
