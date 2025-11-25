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
    <input v-model="query" @keyup.enter="search" placeholder="Search..." type="text"/>
    <button @click="search">Search</button>
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
</div>
</template>

<style scoped>
.movie-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

</style>
