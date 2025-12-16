<script setup>
import { ref, watch } from 'vue';
import tmdbService from '../api/tmdb';
import gbooksService from '../api/gbooks';
import rawgService from '../api/rawg';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase_conf'
import placeholder from '../assets/no_image.jpg'
//NEW: voice recognition
import { useSpeechRecognition } from '@vueuse/core';
import Select from 'primevue/select';


const query = ref('');
const results = ref([]);
const selectedCategory = ref({ name: 'Movies', cat: 'movie' })
const categories = ref([
  { name: 'Movies', cat: 'movie' },
  { name: 'TV Shows', cat: 'tv' },
  { name: 'Books', cat: 'book' },
  { name: 'Video Games', cat: 'game' },
])


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
    let data;
    switch (selectedCategory.value.cat) {
      case 'movie':
        data = await tmdbService.searchMovies(query.value);
        results.value = data.results.map(item => ({
          id: item.id,
          title: item.title,
          image: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : placeholder,
        }))
        break
      case 'tv':
        data = await tmdbService.searchShow(query.value);
        results.value = data.results.map(item => ({
          id: item.id,
          title: item.title,
          image: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : placeholder,
        }))
        break
      case 'book':
        data = await gbooksService.searchBooks(query.value);
        results.value = data.items.map(item => ({
          id: item.id,
          title: item.volumeInfo.title,
          image: item.volumeInfo.imageLinks?.thumbnail || placeholder,
        }))
        break
      case 'game':
        data = await rawgService.searchGames(query.value);
        results.value = data.results.map(item => ({
          id: item.id,
          title: item.name,
          image: item.background_image || placeholder,
        }))
        break
    }
  } catch (error) {
    console.error("Search error:", error);
  }
};

const addtoBacklog = async (data) => {
  const user = auth.currentUser;
  if (!user) {
    alert("You need to be logged in to add media to your backlog!");
    return;
  }
  try {
    let details;

    let backlogItem = {
      name: data.title,
      status: 'queued',
      media_type: selectedCategory.value.cat,
      image_url: data.image,
    }

    // figure out how to store time/pages left

    if (selectedCategory.value.cat === 'movie') {
      details = await tmdbService.getMovieDetails(data.id)
      backlogItem.time = details.runtime
      backlogItem.overview = details.overview
      backlogItem.release_date = details.release_date
      backlogItem.rating = details.vote_average
      backlogItem.image_url = details.poster_path ? `https://image.tmdb.org/t/p/w200${details.poster_path}` : placeholder
    } else if (selectedCategory.value.cat === 'tv') {
      details = await tmdbService.getShowDetails(data.id)
      // figure out how to change to days/mins/hours
      backlogItem.time = details.episode_run_time[0]
      backlogItem.overview = details.overview
      backlogItem.release_date = details.first_air_date
      backlogItem.rating = details.vote_average
      backlogItem.image_url = details.poster_path ? `https://image.tmdb.org/t/p/w200${details.poster_path}` : placeholder
    } else if (selectedCategory.value.cat === 'book') {
      details = await gbooksService.getBookDetails(data.id)
      backlogItem.time = details.volumeInfo.pageCount
      backlogItem.overview = details.volumeInfo.description
      backlogItem.release_date = details.volumeInfo.publishedDate
      backlogItem.rating = details.volumeInfo.averageRating
      backlogItem.image_url = details.volumeInfo.imageLinks?.medium || details.volumeInfo.imageLinks?.thumbnail || placeholder
    } else if (selectedCategory.value.cat === 'game') {
      details = await rawgService.getGameDetails(data.id)
      backlogItem.time = details.playtime
      backlogItem.overview = details.description_raw || details.description
      backlogItem.release_date = details.released
      backlogItem.rating = details.rating
      backlogItem.image_url = details.background_image || placeholder
    }

    // figure out backlog data storage
    const userItems = collection(db, 'users', user.uid, 'queue');
    await addDoc(userItems, backlogItem);

    alert(`${data.title} added to list!`);
  } catch (error) {
    alert("Failed to add movie:", error);
  }
}
</script>

<template>
  <div class="search-container">
  <div class="search-bar">
    <Select v-model="selectedCategory" :options="categories" optionLabel="name" placeholder="Category" class="md:w-56 category-select" />
    <div class="search-input-wrapper">
      <input class="search-input" v-model="query" @keyup.enter="search" :placeholder="`Search for ${selectedCategory.name}...`" type="text" />
    </div>

    <button class="search-btn" @click="search">Search</button>
    <button class="mic-btn" @click="isListening ? stop() : start()">
      {{ isListening ? 'Stop Voice Search' : 'Try Voice Search' }}
    </button>
  </div>
</div>

  <div v-if="results.length" class="section">
    <div class="columns is-multiline">
      <div v-for="item in results" :key="item.id" class="column is-one-quarter-desktop is-half-mobile">
        <div class="card">
          <div class="card-image">
            <!-- make media ID call route to correct API -->
              <figure class="image is-3by4">
                <img :src="item.image" alt="Cover Image" />
              </figure>
          </div>

          <div class="card-content has-text-centered">
            <p class="title">{{ item.title }}</p>

            <button class="button is-primary is-small" @click="addtoBacklog(item)">
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
  width: 100%;
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
  flex: 1;
  justify-content: center;
  display: flex
}
.search-bar {
  width: 100vw;
  display: flex;
  flex-wrap: nowrap;
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
  height: 48px;
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
  height: 48px;
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

:deep(.category-select), :deep(.category-select .p-select-label) {
  height: 48px;
  display: flex;
  align-items: center;
}

</style>
