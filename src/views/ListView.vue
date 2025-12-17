<script setup>
import { useCurrentUser, useCollection } from 'vuefire'
import { db } from '../firebase_conf'
import { collection, query, where, doc, updateDoc, deleteDoc, serverTimestamp, deleteField } from 'firebase/firestore'
import { computed } from 'vue'

const user = useCurrentUser()

let inProgress = null
let queue = null


if (user.value) {
  const queueRef = collection(db, 'users', user.value.uid, 'queue')

  const inProgressQuery = query(queueRef, where("status", "==", "in-progress"))
  inProgress = useCollection(inProgressQuery)

  const queueQuery = query(queueRef, where("status", "==", "queued"))
  queue = useCollection(queueQuery)

}

const timeLeftProg = computed(() => //I thought this needed curly brackets? idk man
  inProgress?.value.reduce((accumulator, item) => accumulator + item.time, 0)
)

const timeLeftQueue = computed(() => //I thought this needed curly brackets? idk man
  queue?.value.reduce((accumulator, item) => accumulator + item.time, 0)
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
                <RouterLink :to="{ name: 'media_w_id', params: { id: item.id, type: item.media_type }, query: {type: item.media_type} }" class="has-text-dark">
                  {{ item.name }}
                </RouterLink>
              </p>

              <p class="is-size-7 has-text-grey mb-3">{{ item.time }} minutes</p>

              <div class="buttons are-small is-flex is-flex-direction-column">
                <button class="button is-danger is-light is-fullwidth" @click="requeueMedia(item.id)">
                  Remove
                </button>
                <!-- add edit progress? -->
                <button class="button is-success is-fullwidth" @click="finishMedia(item.id)">
                  Mark Complete
                </button>
              </div>
            </div>
          </div>

          <div v-if="inProgress && inProgress.length === 0" class="notification is-light scroll-empty">
            <p class="mb-0">Nothing in progress yet. Start something from your queue!</p>
          </div>
        </div>
      </div>

      <div class="mb-2">
        <div class="is-flex is-align-items-center" style="gap: 1rem;">
          <h2 class="title is-5 mb-0">Queue</h2>

          <p v-if="queue && queue.length !== 0" class="has-text-grey is-size-8 mb-0" >
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
              <div class="is-flex is-justify-content-space-between">
              <p class="title is-6 mb-2">
                <RouterLink :to="{ name: 'media_w_id', params: { id: item.id}, query: {type: item.media_type} }" class="has-text-dark">
                  {{ item.name }}
                </RouterLink>
              </p>

              <p class="is-size-7 has-text-grey mb-3">{{ item.time }} minutes</p>
              </div>

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
  scroll-snap-align: start;
  flex: 0 0 220px;
  border-radius: 14px;
  overflow: hidden;
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

@media (max-width: 600px) {
  .scroll-card {
    flex-basis: 180px;
  }
}
</style>
