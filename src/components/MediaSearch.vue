<script setup>
import { ref } from 'vue';
import tmdbService from '../api/tmdb';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase_conf'

const query = ref('');
const results = ref([]);

const search = async () => {
  if (!search.value) {
    return;
  }

  try {
    const data = await tmdbService.searchMovies(search.value);
    results.value = data.results;
  } catch (error) {
    console.error("Search error");
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
      tmdb_id: details.id,
      title: details.title,
      image_url: `https://image.tmdb.org/t/p/w500${details.poster_path}`,
      media_type: 'movie',
      status: 'in progress',
      time_to_finish: details.runtime,
    }

    // const userItems = collection(db, 'users', user.uid, 'items');
    // await addDoc(userItems, backlogItem);

    alert(`${details.title} added to list!`);
  } catch(error) {
    alert("Failed to add movie");
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
        <button @click="addtoBacklog(movie)">Add to Backlog</button>
      </div>
    </div>
  </div>
</div>
</template>
