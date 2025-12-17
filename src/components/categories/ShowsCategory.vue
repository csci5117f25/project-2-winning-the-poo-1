<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue';
import { collection, addDoc, getDocs, query as fsQuery, where } from 'firebase/firestore';
import { db, auth } from '../../firebase_conf';
import tmdbService from '../../api/tmdb';
import placeholder from '../../assets/no_image.jpg';
import checkmarkJson from '../../assets/checkmark.json';

const props = defineProps(['query']);
const items = ref([]);
const route = useRoute()

const addedIds = ref(new Set()); // tv ids already added
const uiState = ref({});
const isLoading = ref(false);

function ensureState(id) {
  if (!uiState.value[id]) uiState.value[id] = { justAdded: false };
  return uiState.value[id];
}

async function loadPopularShows(pages = 1) {
  const results = [];
  for (let page = 1; page <= pages; page++) {
    const data = await tmdbService.getPopularShows(page);
    results.push(...(data.results || []));
  }
  return { results };
}

async function loadShows(q) {
  isLoading.value = true
  try {
    let data;
    if (q) {
      data = await tmdbService.searchShow(q);
    } else {
      data = await loadPopularShows(7);
    }

    items.value = (data.results || []).map(s => {
      ensureState(s.id);
      return {
        id: s.id,
        title: s.name, // tv uses "name"
        image: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : null,
      };
    });
  } catch (e) {
    console.error("Error loading shows:", e);
  } finally {
    isLoading.value = false
  }
}

async function getUserTVIds() {
  const user = auth.currentUser;
  if (!user) return;

  const userItemsRef = collection(db, 'users', user.uid, 'queue');
  const snapshot = await getDocs(userItemsRef);

  const ids = new Set();
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data?.media_type === 'tv' && data?.tmdb_id) ids.add(data.tmdb_id);
  });

  addedIds.value = ids;
}

const addToBacklog = async (showData) => {
  const user = auth.currentUser;
  if (!user) {
    alert("You need to be logged in to add media to your backlog!");
    return;
  }

  try {
    const userItems = collection(db, 'users', user.uid, 'queue');

    const q = fsQuery(
      userItems,
      where('media_type', '==', 'tv'),
      where('tmdb_id', '==', showData.id)
    );

    const checkExisting = await getDocs(q);
    if (!checkExisting.empty) {
      addedIds.value.add(showData.id);
      alert("This show is already in your backlog");
      return;
    }

    const details = await tmdbService.getShowDetails(showData.id);

    const backlogItem = {
      tmdb_id: details.id,
      name: details.name,
      time: details.episode_run_time?.[0] ?? null, // tv has episode_run_time array
      status: 'queued',
      overview: details.overview,
      release_date: details.first_air_date,
      rating: details.vote_average,
      image_url: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
      media_type: 'tv',
      seasons: details.number_of_seasons,
      episodes: details.number_of_episodes,
    };

    await addDoc(userItems, backlogItem);

    const state = ensureState(showData.id);
    state.justAdded = true;
    setTimeout(() => (state.justAdded = false), 775);

    addedIds.value.add(showData.id);
  } catch (error) {
    alert("Failed to add show: " + error);
  }
};

watch(() => props.query, (newVal) => {
  items.value = []
  loadShows(newVal);
});

onMounted(async () => {
  await getUserTVIds();
  loadShows(props.query);
});
</script>

<template>
  <div>
    <div v-if="isLoading" class="loader-wrapper">
      <div class="loader"></div>
    </div>
    <div class="columns is-multiline is-mobile">
      <div v-for="item in items" :key="item.id" class="column is-6-mobile is-4-tablet is-2-desktop">
        <div class="media-card-wrapper">
          <RouterLink :to="{ name: 'media_w_id', params: { id: item.id }, query: { ...route.query, type: 'tv' } }">
            <figure class="image is-2by3">
              <img :src="item.image || placeholder" class="poster-image" alt="Show Poster" />
            </figure>
          </RouterLink>
          <button class="button is-dark is-rounded is-small floating-btn"
            :class="{ 'is-animating': uiState[item.id]?.justAdded }" @click="addToBacklog(item)"
            :disabled="addedIds.has(item.id)">
            <template v-if="uiState[item.id]?.justAdded">
              <DotLottieVue :data="checkmarkJson" autoplay :loop="false" :speed="0.7"
                style="width: 100%; height: 100%; display: block;" />
            </template>
            <template v-else>
              <span class="icon is-small icon-box">
                <template v-if="addedIds.has(item.id)">
                  <svg class="static-check" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"
                      stroke-linejoin="round" />
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
