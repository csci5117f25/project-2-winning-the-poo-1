<script setup>
import { useCurrentUser, useCollection } from 'vuefire'
import { collection, query, where, deleteField, doc, updateDoc } from 'firebase/firestore'
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

const completedMessage = computed(() => {
  if (completedTime.value >= 1000) return "Amazing!"
  if (completedTime.value >= 300) return "Wow, That's a lot of content!"
  if (completedTime.value >= 60) return "Nice progress!"
  if (completedTime.value > 0) return "Just getting started!"
  return "You haven't finished anything on your list? Get out there, then!"
})


const readableTime = computed(() => {
  const mins = completedTime

  if (mins.value < 60) {
    return `${mins.value} minutes${mins.value === 1 ? '' : 's'}`
  }

  const hours = mins.value / 60
  if (hours < 24) {
    return `${hours.toFixed(1)} hours`
  }

  const days = hours / 24
  return `${days.toFixed(1)} days`
})

async function removeFromCompleted(item) {
  const ref = doc(
    db,
    'users',
    user.value.uid,
    'queue',
    item.id
  )

  await updateDoc(ref, {
    status: deleteField()
  })
}

</script>

<template>
  <section class="section">
    <div class="container">
      <div class="card">
        <div class="card-content has-text-centered">
          <figure class="image is-128x128 profile-avatar mb-4">
            <img
              class="is-rounded"
              :src="user?.photoURL || 'https://via.placeholder.com/150'"
              alt="Profile Picture"
            />
          </figure>

          <h1 class="title">Profile</h1>
          <h2 class="subtitle">Hi, {{ user?.displayName }}!</h2>

          <hr/>

          <h2 class="title">Your Stats</h2>

          <div class="columns is-multiline has-text-centered">

            <div class="column is-third">
              <div class="box">
                <p class="heading">In Progress</p>
                <p class="title">{{ inProgressTime }} min</p>
              </div>
            </div>

            <div class="column is-third">
              <div class="box">
                <p class="heading">Queued</p>
                <p class="title">{{ queueTime }} min</p>
              </div>
            </div>

            <div class="column is-third">
              <div class="box">
                <p class="heading">Completed</p>
                <p class="title">
                  {{ completedTime }} {{ completedTime === 1 ? 'min' : 'mins' }}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  </section>
  <div class="bot-container">
    <div class="desc">
      <h3 class="title is-3 m-1">Your Completed Media</h3>
      <p v-if="complete.length > 0">You've finished <strong>{{ completedTime }}</strong> minutes of content.</p>
      <p v-if="complete.length > 0">That's <strong>{{ readableTime }}!</strong> {{ completedMessage }}</p>
    </div>
    <div class="columns is-multiline">
      <div v-for="item in complete" :key="item.id" class="column is-6-mobile is-4-tablet is-3-desktop">
        <div class="card">
            <RouterLink :to="{ name: 'media_w_id', params: { id: item.id } }" class="card-header-title py-1 px-2 is-centered">
              <span class="is-clipped">
              {{ item.name }}
              <p class="has-text-centered has-text-grey">{{ item.time }} mins</p>
              </span>
            </RouterLink>
          <div class="card-image">
            <figure class="image is-3by4">
              <img v-if="item.image_url" :src="item.image_url" alt="Cover Image"/>
            </figure>
          </div>
          <div class="is-flex is-justify-content-center is-align-items-center py-0">

            <button class="button is-small is-centered is-danger is-light" @click="removeFromCompleted(item)">Remove</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
img {
  width: 6rem;
  height: 6rem;
  object-fit: cover;
}
div {
  padding: 1rem;
}

.profile-avatar {
  margin-left: auto;
  margin-right: auto;
}

figure {
  display: flex;
  justify-content: center;
  align-items: center;
}

h3, p {
  text-align: center;
}


</style>
