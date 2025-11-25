<script setup>
import { ref } from 'vue';
import tmdbService from '../api/tmdb';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase_conf'

const query = ref('');
const results = ref([]);

const search = async () => {
  if (!query.value) {
    return;
  }

  try {
    const data = await tmdbService.searchMovies(query.value);
    results.value = data.results;
  } catch (error) {
    console.error("Search error:", error);
  }
};

const addtoBacklog = async (movieData) => {
  const user = auth.currentUser;
  if (!user) {
    alert("You need to be logged in to add media to your backlog!");
    return;
  }
  try {
    const details = await tmdbService.getMovieDetails(movieData.id);

    const backlogItem = {
      name: details.title,
      time: details.runtime,
      status: 'queued',
      overview: details.overview,
      release_date: details.release_date,
      rating: details.vote_average,
      image_url: `https://image.tmdb.org/t/p/w500${details.poster_path}`,
      media_type: 'movie',
    }

    // figure out backlog data storage
    const userItems = collection(db, 'users', user.uid, 'queue');
    await addDoc(userItems, backlogItem);

    alert(`${details.title} added to list!`);
  } catch(error) {
    alert("Failed to add movie:", error);
  }
}
</script>

<template>
<div class="search-container">
  <div class="search-bar">
    <input class="search-input" v-model="query" @keyup.enter="search" placeholder="Search for a movie..." type="text"/>
    <button class="search-btn" @click="search">Search</button>
  </div>
</div>

  <div v-if="results.length" class="results-display">
    <div v-for="movie in results" :key="movie.id" class="movie-card">
      <div class="movie-info">
        <h2>{{  movie.title  }}</h2>
        <img :src="`https://image.tmdb.org/t/p/w200${movie.poster_path}`" alt="Poster Image"/>
        <button @click="addtoBacklog(movie)">Add to Backlog</button>
      </div>
    </div>
  </div>

</template>

<style scoped>
.movie-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.95rem;
  padding: 0.4rem 0.2rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  padding: 0.75rem 1rem;
  border-radius: 10px;


}

.search-container {
  display: flex;
  justify-content: center;
}

.search-bar {
  width: 50%;
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem 1rem;
}

.search-btn {
  border: none;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  background-color: #15254e;
  color: white;
  transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease;
}

.search-btn:hover {
  background-color: #4338ca;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
}

.results-display {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

</style>
