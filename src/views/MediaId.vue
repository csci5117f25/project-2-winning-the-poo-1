<script setup>
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useCurrentUser, useCollection } from 'vuefire'
import { db } from '../firebase_conf'
import { collection, query, where, addDoc } from 'firebase/firestore'

import tmdbService from '../api/tmdb'
import gbooksService from '../api/gbooks'

const route = useRoute()
const user = useCurrentUser()

const id = computed(() => String(route.params.id ?? ''))
const type = computed(() => String(route.query.type ?? 'movie'))

// load API details
const media = ref(null)
const loading = ref(true)
const error = ref('')

watchEffect(async () => {
  if (!id.value) return
  loading.value = true
  error.value = ''
  media.value = null

  try {
    if (type.value === 'book') {
      const d = await gbooksService.getBookDetails(id.value)
      const info = d.volumeInfo || {}
      media.value = {
        external_id: d.id,
        media_type: 'book',
        name: info.title || 'Untitled',
        overview: info.description || '',
        release_date: info.publishedDate || '',
        time: info.pageCount || null,
        rating: info.averageRating || null,
        image_url: info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '',
      }
    } else if (type.value === 'show') {
      const d = await tmdbService.getShowDetails(Number(id.value))
      media.value = {
        external_id: d.id,
        media_type: 'tv',
        name: d.name,
        overview: d.overview,
        release_date: d.first_air_date,
        time: d.episode_run_time?.[0] || null,
        rating: d.vote_average,
        image_url: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : '',
      }
    } else {
      // default movie
      const d = await tmdbService.getMovieDetails(Number(id.value))
      media.value = {
        external_id: d.id,
        media_type: 'movie',
        name: d.title,
        overview: d.overview,
        release_date: d.release_date,
        time: d.runtime,
        rating: d.vote_average,
        image_url: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : '',
      }
    }
  } catch {
    error.value = 'Failed to load media'
  } finally {
    loading.value = false
  }
})

// Gets media in the queue
const queueQuery = computed(() => {
  if (!user.value || !id.value) {
    return null
  }
  const queueRef = collection(db, 'users', user.value.uid, 'queue')

  if (type.value === 'book') {
    return query(queueRef, where('media_type', '==', 'book'), where('gbooks_id', '==', id.value))
  } else {
    return query(queueRef, where('media_type', '==', type.value), where('tmdb_id', '==', Number(id.value)))
  }
})

// Check if already in queue
const matches = useCollection(queueQuery)
const inQueue = computed(() => (matches.value?.length || 0) > 0)

async function addToQueue() {
  if (!user.value || !media.value) {
    return
  }

  const queueRef = collection(db, 'users', user.value.uid, 'queue')

  const base = {
    name: media.value.name,
    overview: media.value.overview,
    release_date: media.value.release_date,
    rating: media.value.rating,
    image_url: media.value.image_url,
    time: media.value.time,
    status: 'queued',
    media_type: media.value.media_type,
  }

  let docData

  if (media.value.media_type === 'book') {
    docData = { ...base, gbooks_id: media.value.external_id }
  }
  else {
    docData = { ...base, tmdb_id: Number(media.value.external_id) } //route param is string
  }

  await addDoc(queueRef, docData)
}
</script>

<template>
    <div class="container move-down">
      <div class="card">
        <div class="card-content columns">
          <div class="column is-4 has-text-centered">
            <figure class="image is-2by3">
              <img v-if="media.image_url" :src="media.image_url" alt="Cover Image" class="poster-image" />
            </figure>

            <button v-if="user && !inQueue" class="button is-dark is-fullwidth mt-4" @click="addToQueue">
              + Add to Backlog
            </button>

            <p v-else-if="user && inQueue" class="has-text-success mt-4">
              Already in your backlog
            </p>
          </div>

          <div class="column is-8">
            <h1 class="title is-3">{{ media.name }}</h1>

            <div class="tags mb-4">
              <span v-if="media.release_date" class="tag">
                Release Date {{ media.release_date }}
              </span>

              <span v-if="media.time" class="tag">
                Time {{ media.time }}
                {{ media.media_type === 'book' ? 'pages' : 'minutes' }}
              </span>

              <span v-if="media.rating != null" class="tag is-warning is-light">
                Rating {{ media.rating.toFixed(1) }}
              </span>
            </div>

            <div v-if="media.overview">
              <h2 class="title is-5">Overview</h2>
              <p class="content">{{ media.overview }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped>
  .move-down {
  padding-top: 3em;
}
</style>