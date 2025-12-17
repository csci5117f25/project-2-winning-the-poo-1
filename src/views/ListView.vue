<script setup>
import { useCurrentUser, useCollection } from 'vuefire'
import { db } from '../firebase_conf'
import { collection, query, where, doc, updateDoc, deleteDoc, serverTimestamp, deleteField } from 'firebase/firestore'
import { computed } from 'vue'

const user = useCurrentUser()

let inProgress = null
let queue = null
let complete = null


if (user.value) {
  const queueRef = collection(db, 'users', user.value.uid, 'queue')

  const inProgressQuery = query(queueRef, where("status", "==", "in-progress"))
  inProgress = useCollection(inProgressQuery)

  const queueQuery = query(queueRef, where("status", "==", "queued"))
  queue = useCollection(queueQuery)

  const completeQuery = query(queueRef, where("status", "==", "complete"))
  complete = useCollection(completeQuery)
}

const timeLeftProg = computed(() => //I thought this needed curly brackets? idk man
  inProgress?.value.reduce((accumulator, item) => accumulator + item.time, 0)
)

const timeLeftQueue = computed(() => //I thought this needed curly brackets? idk man
  queue?.value.reduce((accumulator, item) => accumulator + item.time, 0)
)

const timeLeftComplete = computed(() => //I thought this needed curly brackets? idk man
  complete?.value.reduce((accumulator, item) => accumulator + item.time, 0)
)

const startMedia = async (itemId) => {
  const itemRef = doc(db, 'users', user.value.uid, 'queue', itemId);

  await updateDoc(itemRef, {
    status: 'in-progress'
  })
};

const finishMedia = async (itemId) => {
  const itemRef = doc(db, 'users', user.value.uid, 'queue', itemId);

  await updateDoc(itemRef, {
    status: 'complete',
    completedAt: serverTimestamp(),
  })
};

const requeueMedia = async (itemId) => {
  const itemRef = doc(db, 'users', user.value.uid, 'queue', itemId);

  await updateDoc(itemRef, {
    status: 'queued',
    completedAt: deleteField(),
  })
}

const deleteMedia = async (itemId) => {
  const itemRef = doc(db, 'users', user.value.uid, 'queue', itemId)

  await deleteDoc(itemRef)
}

function formatMediaTime(item) {
  if (!item) {
    return ''
  }

  switch (item.media_type) {
    case 'book':
      return `${item.time?.toLocaleString()} pages`

    case 'tv':
      const seasons = item.seasons
      const episodes = item.episodes
      let tvTime = []
      if (seasons > 0) {
        tvTime.push(`${seasons} season${seasons !== 1 ? 's': ''}`)
      }
      if (episodes > 0) {
        tvTime.push(`${episodes} episode${episodes !== 1 ? 's': ''}`)
      }
      return tvTime.join(', ')

    case 'game':
      if (item.time >= 60) {
        const h = Math.floor(item.time / 60)
        return `${h} hour${h !== 1 ? 's' : ''}`
      }

    default:
      const mins = item.time || 0
      if (mins >= 60) {
        const h = Math.floor(mins / 60)
        const m = mins % 60
        return m > 0 ? `${h}h ${m}m` : `${h} hour${h !== 1 ? 's' : ''}`
      }
      return `${mins} minutes`
  }
}
</script>

<template>
  <section class="section media-list">
    <div class="container">
      <div class="has-text-centered mb-5">
        <h1 class="title is-3">Your Media List</h1>
        <p class="subtitle is-6">Track what you're watching right now and what's up next!</p>
      </div>

      <div class="mb-4">
        <div class="is-flex is-align-items-center" style="gap: 1rem;">
          <h2 class="title is-5 mb-0">In Progress</h2>

          <p v-if="inProgress && inProgress.length !== 0" class="has-text-grey is-size-8">
            About <strong>{{ timeLeftProg }}</strong> minutes left
          </p>
        </div>

        <div class="scroll-row mt-3">
          <div v-for="item in inProgress" :key="item.id" class="card scroll-card">
            <div class="card-image" v-if="item.image_url">
              <figure class="image is-3by4">
                <img :src="item.image_url" alt="Cover Image" class="cover-img"/>
              </figure>
            </div>

            <div class="card-content">
              <p class="title is-6 mb-2">
                <RouterLink :to="{ name: 'media_w_id', params: { id: item.media_type === 'book' ? item.gbooks_id : item.media_type === 'game' ? item.rawg_id : item.tmdb_id }, query: { type: item.media_type } }" class="has-text-dark">
                  {{ item.name }}
                </RouterLink>
              </p>

              <p class="is-size-7 has-text-grey mb-3">{{ formatMediaTime(item) }}</p>

              <div class="buttons are-small is-flex is-flex-direction-column">
                <button class="button is-primary is-fullwidth" @click="finishMedia(item.id)">
                  Mark Complete
                </button>
                <button class="button is-danger is-light is-fullwidth" @click="requeueMedia(item.id)">
                  Remove
                </button>
              </div>
            </div>
          </div>

          <div v-if="inProgress && inProgress.length === 0" class="notification is-light scroll-empty">
            <p class="mb-0">Nothing in progress yet. Start something from your queue!</p>
          </div>
        </div>
      </div>


      <!-- Queue -->
      <div class="mb-2">
        <div class="is-flex is-align-items-center" style="gap: 1rem;">
          <h2 class="title is-5 mb-0">Queue</h2>

          <p v-if="Queue && Queue.length !== 0" class="has-text-grey is-size-8 mb-0" >
            About <strong>{{ timeLeftQueue }}</strong> minutes total
          </p>
        </div>

        <div class="scroll-row mt-3">
          <div v-for="item in queue" :key="item.id" class="card scroll-card">
            <div class="card-image" v-if="item.image_url">
              <figure class="image is-3by4">
                <img :src="item.image_url" alt="Cover Image" class="cover-img" />
              </figure>
            </div>

            <div class="card-content">
              <p class="title is-6 mb-2">
                <RouterLink :to="{ name: 'media_w_id', params: { id: item.media_type === 'book' ? item.gbooks_id : item.media_type === 'game' ? item.rawg_id : item.tmdb_id }, query: { type: item.media_type } }" class="has-text-dark">
                  {{ item.name }}
                </RouterLink>
              </p>

              <p class="is-size-7 has-text-grey mb-3">{{formatMediaTime(item) }}</p>

              <div class="buttons are-small is-flex is-flex-direction-column">
                <button class="button is-primary is-fullwidth" @click="startMedia(item.id)">
                  Start
                </button>
                <button class="button is-danger is-light is-fullwidth" @click="deleteMedia(item.id)">
                  Remove
                </button>
              </div>
            </div>
          </div>

          <div v-if="queue && queue.length === 0" class="notification is-light scroll-empty">
            <p class="mb-0">Your queue is empty. Add something!</p>
          </div>
        </div>
      </div>

      <!-- Completed Section -->
      <div class="mb-2">
        <div class="is-flex is-align-items-center" style="gap: 1rem;">
          <h2 class="title is-5 mb-0">Completed</h2>

          <p v-if="complete && complete.length !== 0" class="has-text-grey is-size-8 mb-0" >
            About <strong>{{ timeLeftComplete }}</strong> minutes total
          </p>
        </div>

        <div class="scroll-row mt-3">
          <div v-for="item in complete" :key="item.id" class="card scroll-card">
            <div class="card-image" v-if="item.image_url">
              <figure class="image is-3by4">
                <img :src="item.image_url" alt="Cover Image" class="cover-img" />
              </figure>
            </div>

            <div class="card-content">
              <p class="title is-6 mb-0">
                <RouterLink :to="{ name: 'media_w_id', params: { id: item.media_type === 'book' ? item.gbooks_id : item.media_type === 'game' ? item.rawg_id : item.tmdb_id }, query: { type: item.media_type } }" class="has-text-dark">
                  {{ item.name }}
                </RouterLink>
              </p>
              <p class="is-size-7 has-text-grey mb-3">{{ formatMediaTime(item) }}</p>


              <div class="buttons are-small is-flex is-flex-direction-column">
                <button class="button is-danger is-light is-fullwidth" @click="deleteMedia(item.id)">
                  Remove
                </button>
              </div>
            </div>
          </div>

          <div v-if="complete && complete.length === 0" class="notification is-light scroll-empty">
            <p class="mb-0">Nothing completed yet. Start something from your queue!</p>
          </div>
        </div>
      </div>

      </div>
  </section>
</template>

<style scoped>
.scroll-row {
  display: flex;
  overflow-x: auto;
  padding: 0.75rem 0.25rem;
  gap: 1rem;
  scroll-snap-type: x mandatory;
}

.scroll-card {
  display: flex;
  flex-direction: column;
  scroll-snap-align: start;
  flex: 0 0 220px;
  border-radius: 14px;
  overflow: hidden;
  height: 100%;
}

.scroll-card .card-content .title:not(:last-child) {
  margin-bottom: 0.25rem !important;
}

.scroll-card .card-content p.is-size-7 {
  margin-top: 0;
}



.cover-img {
  object-fit: cover;
}

.scroll-empty {
  flex: 0 0 320px;
  align-self: center;
}

.scroll-row::-webkit-scrollbar {
  height: 8px;
}
.scroll-row::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.2);
}

.title {
  padding: 0;
}

@media (max-width: 600px) {
  .scroll-card {
    flex-basis: 180px;
  }
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-content .title {
  padding: 0;
  margin: 0;
  display: -webkit-box;
  line-height: 1.2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: normal;
}

.buttons {
  margin-top: auto;
}
</style>
