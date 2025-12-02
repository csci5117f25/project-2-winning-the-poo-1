<script setup>
import { ref, watch, onMounted } from 'vue';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase_conf'
import tmdbService from '../../api/tmdb';
import placeholder from '../../assets/no_image.jpg'

const props = defineProps(['query']);
const items = ref([]);

async function loadMovies(query) {
  try {
    let data;

    if (query) {
      data = await tmdbService.searchMovies(query);
    } else {
      data = await tmdbService.getTrendingMovies();
    }

    items.value = (data.results || []).map(m => {
      let imageUrl = null;

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
  }
}

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

watch(() => props.query, (newVal) => {
  loadMovies(newVal);
});

onMounted(() => {
  loadMovies(props.query);
});
</script>

<template>
  <div>
    <div class="columns is-multiline is-mobile">
      <div v-for="item in items" :key="item.id" class="column is-6-mobile is-4-tablet is-2-desktop">

        <div class="media-card-wrapper">

          <figure class="image is-2by3">
            <img :src="item.image || placeholder" class="poster-image" alt="Movie Poster" />
          </figure>

          <button class="button is-dark is-rounded is-small floating-btn" @click="addtoBacklog(item)">
            <span class="icon is-small">+</span>
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
}

.floating-btn:hover {
  transform: scale(1.1);
}
</style>