<script setup>
import { ref, watch } from 'vue';
import tmdbService from '../api/tmdb';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase_conf'
import placeholder from '../assets/no_image.jpg'
//NEW: voice recognition
import { useSpeechRecognition } from '@vueuse/core';


const query = ref('');
const results = ref([]);


//NEW: voice recognition
const { isListening, result, start, stop } = useSpeechRecognition();

watch(result, (val) => {
  if(val){
    query.value = val;
    search();
  }
});


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
  } catch (error) {
    alert("Failed to add movie:", error);
  }
}
</script>

<template>
  <div class="search-container">
  <div class="search-bar">
    <div class="search-input-wrapper">
      <input class="search-input" v-model="query" @keyup.enter="search" placeholder="Search for a movie..." type="text" />
    </div>

    <button class="search-btn" @click="search">Search</button>
    <button class="mic-btn" @click="isListening ? stop() : start()">
      {{ isListening ? 'Stop Voice Search' : 'Try Voice Search' }}
    </button>
  </div>
</div>

  <div v-if="results.length" class="section">
    <div class="columns is-multiline">
      <div v-for="movie in results" :key="movie.id" class="column is-one-quarter-desktop is-half-mobile">
        <div class="card">
          <div class="card-image">
            <a :href="`https://www.themoviedb.org/movie/${movie.id}`" target="_blank" rel="noopener">
              <figure class="image is-3by4">
                <img :src="movie.poster_path
                  ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                  : placeholder" alt="Poster Image" />
              </figure>
            </a>
          </div>

          <div class="card-content has-text-centered">
            <p class="title">{{ movie.title }}</p>

            <button class="button is-primary is-small" @click="addtoBacklog(movie)">
              Add to Backlog
            </button>
          </div>
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

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1 rem;
  padding: 0.4rem 0.2rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  width: 25vw;
  height: 48px;
}
@media (max-width: 640px) {
  .search-input {
    width: 60vw;
  }
}

.search-container {
  display: flex;
  justify-content: center;
  margin: 10px;
}
.search-input-wrapper {
  width: 100%;
  margin-bottom: 10px;
  justify-content: center;
  display: flex
}
.search-bar {
  width: 50vw;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem 1rem;
}

.search-btn {
  border: none;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  font-size: .8rem;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  background-color: #15254e;
  color: white;
  transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease;
}

.mic-btn {
  border: none;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  font-size: .8rem;
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
