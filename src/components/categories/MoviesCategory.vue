<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
import { collection, addDoc, getDocs, query as fsQuery, where } from 'firebase/firestore';
import { db, auth } from '../../firebase_conf'
import tmdbService from '../../api/tmdb';
import placeholder from '../../assets/no_image.jpg'
import checkmarkJson from '../../assets/checkmark';

const route = useRoute()

const props = defineProps(['query']);
const items = ref([]);

// Tracking added movie Ids to disable add button
const addedMovieIds = ref(new Set());

const isLoading = ref(false);

// UI state for each movie item
const uiState = ref({});

// Check UI state exists for a movie card
function ensureState(id) { // Id here is the movie id
  if (!uiState.value[id]) {
    uiState.value[id] = { justAdded: false };
  }
  return uiState.value[id];
}

async function loadPopularMovies(pages = 1) {
  const results = [];

  for (let page = 1; page <= pages; page++) {
    const data = await tmdbService.getPopularMovies(page);
    results.push(...(data.results || []));
  }

  return { results };
}

// Load movies based on query or trending
async function loadMovies(query) {
  isLoading.value = true;
  try {
    let data;

    if (query) {
      data = await tmdbService.searchMovies(query);
    } else {
      //data = await tmdbService.getTrendingMovies();
      data = await loadPopularMovies(7); // prolly want to adjust this number. or we make it so that user loads?
    }

    items.value = (data.results || []).map(m => { // m is for each movie
      ensureState(m.id);
      let imageUrl = null; // Later if image is null then we use the placeholder

      if (m.poster_path) {
        imageUrl = `https://image.tmdb.org/t/p/w500${m.poster_path}`;
      }

      return {
        id: m.id,
        title: m.title,
        image: imageUrl
      };
    });


  } catch (e) {
    console.error("Error loading movies:", e);
  } finally {
    isLoading.value = false;
  }
}

// Get user's added movie IDs to disable add button
async function getUserMovieIds() {
  const user = auth.currentUser;
  if (!user) {
    return;
  }

  const userItemsRef = collection(db, 'users', user.uid, 'queue');
  const snapshot = await getDocs(userItemsRef);
  const ids = new Set();

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data?.media_type === 'movie' && data?.tmdb_id) {
      ids.add(data.tmdb_id);
    }
  });

  addedMovieIds.value = ids;
}

// Add movie to backlog
const addtoBacklog = async (movieData) => {
  // Check if user is logged in before adding
  const user = auth.currentUser;
  if (!user) {
    alert("You need to be logged in to add media to your backlog!");
    return;
  }

  try {
    const userItems = collection(db, 'users', user.uid, 'queue');

    // Checking is movie already in backlog
    const q = fsQuery(
      userItems,
      where('media_type', '==', 'movie'),
      where('tmdb_id', '==', movieData.id));

    const checkExisting = await getDocs(q);

    if (!checkExisting.empty) {
      addedMovieIds.value.add(movieData.id); // In case user added after load
      alert("This movie is already in your backlog");
      return;
    }

    const details = await tmdbService.getMovieDetails(movieData.id);

    const backlogItem = {
      tmdb_id: details.id,
      name: details.title,
      time: details.runtime,
      status: 'queued',
      overview: details.overview,
      release_date: details.release_date,
      rating: details.vote_average,
      image_url: `https://image.tmdb.org/t/p/w500${details.poster_path}`,
      media_type: 'movie',
    }

    await addDoc(userItems, backlogItem);

    // Update local state to disable button
    const state = ensureState(movieData.id);
    state.justAdded = true; // trigger animation
    setTimeout(() => {
      state.justAdded = false;
    }, 775); // Hide the animation

    // To hide right away
    addedMovieIds.value.add(movieData.id);
    //alert(`${details.title} added to list!`);
  } catch (error) {
    alert("Failed to add movie:", error);
  }
}

watch(() => props.query, (newVal) => {
  items.value = []
  loadMovies(newVal);
});

onMounted(async () => {
  await getUserMovieIds();
  loadMovies(props.query);
});
</script>

<template>
  <div>
    <div>
      <div v-if="isLoading" class="loader-wrapper">
        <div class="loader"></div>
      </div>
      <div class="columns is-multiline is-mobile">
        <div v-for="item in items" :key="item.id" class="column is-6-mobile is-4-tablet is-2-desktop">

          <div class="media-card-wrapper">
            <RouterLink :to="{ name: 'media_w_id', params: { id: item.id }, query: { ...route.query, type: 'movie' } }">
              <figure class="image is-2by3">
                <img :src="item.image || placeholder" class="poster-image" alt="Movie Poster" />
              </figure>
            </RouterLink>
            <button class="button is-dark is-rounded is-small floating-btn"
              :class="{ 'is-animating': uiState[item.id]?.justAdded }" @click.stop="addtoBacklog(item)"
              :disabled="addedMovieIds.has(item.id)">

              <template v-if="uiState[item.id]?.justAdded">
                <DotLottieVue :data="checkmarkJson" autoplay :loop="false" :speed="0.7"
                  style="width: 100%; height: 100%; display: block;" />
              </template>
              <template v-else>
                <span class="icon is-small icon-box">
                  <template v-if="addedMovieIds.has(item.id)">
                    <svg class="static-check" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="3"
                        stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </template>
                  <template v-else>+</template>
                </span>
              </template>

            </button>
          </div>
          <p class="has-text-centered has-text-weight-bold mt-2 is-size-7">{{ item.title }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.media-card-wrapper {
  position: relative;
}

.poster-image {
  border-radius: 25px;
}

.floating-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  z-index: 10;
  border: 2px solid white;
  cursor: pointer;
  transition: transform 0.2s;
  height: 35px;
  width: 35px;
  background-color: jet;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: hidden;
}

.floating-btn.is-animating {
  background-color: transparent;
}

.floating-btn:hover {
  transform: scale(1.1);
}

/* stole this from https://www.w3schools.com/howto/howto_css_loader.asp */
.loader-wrapper {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: lightgray;
}

.loader {
  border: 12px solid #e0e0e0;
  border-top: 12px solid #9e9e9e;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
