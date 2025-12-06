<script setup>
import { useCurrentUser, useCollection } from 'vuefire'
import { collection, query, where } from 'firebase/firestore'
import { computed } from 'vue'
import { db } from '../firebase_conf'

const user = useCurrentUser()

const queueRef = collection(db, 'users', user.value.uid, 'queue');

const queueItems = useCollection(queueRef);

const completedQuery = query(queueRef, where("status", "==", "complete"))
let complete = useCollection(completedQuery)

const inProgressTime = computed(() => //I thought this needed curly brackets? idk man
  queueItems.value.filter(item => item.status === 'in-progress').reduce((accumulator, item) => accumulator + item.time, 0)
)

const queueTime = computed(() => //I thought this needed curly brackets? idk man
  queueItems.value.filter(item => item.status === 'queued').reduce((accumulator, item) => accumulator + item.time, 0)
)

const completedTime = computed(() => //I thought this needed curly brackets? idk man
  queueItems.value.filter(item => item.status === 'complete').reduce((accumulator, item) => accumulator + item.time, 0)
)
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="card">
        <div class="card-content has-text-centered">

          <figure class="image is-128x128 is-inline-block mb-4">
            <img
              class="is-rounded"
              :src="user?.photoURL || 'https://via.placeholder.com/150'"
              alt="Profile Picture"
            />
          </figure>

          <h1 class="title">Profile</h1>
          <h2 class="subtitle">Hi, {{ user?.displayName }}!</h2>

          <hr/>

          <h2 class="title">Stats</h2>

          <div class="columns is-multiline has-text-centered">

            <div class="column is-half">
              <div class="box">
                <p class="heading">In Progress</p>
                <p class="title">{{ inProgressTime }} min</p>
              </div>
            </div>

            <div class="column is-half">
              <div class="box">
                <p class="heading">Queued</p>
                <p class="title">{{ queueTime }} min</p>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  </section>
  <div>
    <!-- new: see complete items (largely reusing code from ListView)
     TODO: make this look pretty -->
    <div>
      <h3>Completed Items</h3>
      <p v-if="complete.length > 0">You've finished <strong>{{ completedTime }}</strong> minutes of content.</p>
      <!-- could put some responsive statement here (that's more than a week!, etc.) -->
    </div>
    <div class="completed">
      <div v-for="item in complete" :key="item.name" class="card">
          <RouterLink :to="{ name: 'media_w_id', params: { id: item.id } }">{{ item.name}}</RouterLink>
          <img v-if="item.image_url" :src="item.image_url" alt="Cover Image" class="card-img"/>
          <p>{{ item.time }} minutes</p>
      </div>
      <div v-if="complete.length === 0">
        <p>You haven't finished anything on your list? Get out there, then!</p>
      </div>
    </div>
  </div>
</template>


<style scoped>
img {
  width: 6rem;
  height: 6rem;
  border-radius: 9999px;
  object-fit: cover;
}
div {
  padding: 1rem;
}
</style>
