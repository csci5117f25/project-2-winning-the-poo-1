
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_URL = "https://api.themoviedb.org/3";

async function requestTMDB(endpoint, params = {}) {
  params.api_key = API_KEY;
  const query = new URLSearchParams(params).toString();

  const response = await fetch (`${API_URL}${endpoint}?${query}`);

  if (!response.ok) {
    throw new Error("TMDB API Error");
  }

  return await response.json();
}

export default {
  searchMovies(query) {
    return requestTMDB('/search/movie', { query });
  },
  getMovieDetails(id) {
    return requestTMDB(`/movie/${id}`)
  }
}
