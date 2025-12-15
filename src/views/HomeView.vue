<script setup>
import { computed, onMounted } from 'vue'
import { useCurrentUser, useCollection } from 'vuefire'
import { collection } from 'firebase/firestore'
import { db } from '../firebase_conf'
import { gsap } from 'gsap'
import GsapCarousel from '../components/GsapCarousel.vue';


const user = useCurrentUser()

const queueRef = computed(() => {
  if (user.value) {
    return collection(db, "users", user.value.uid, "queue")
  }

  return null
})

const queueItems = useCollection(queueRef)

const items = computed(() => {
  if (queueItems.value) {
    return queueItems.value
  }

  return []
})

const totalTime = computed(() => {
  return items.value.reduce((sum, item) => {
    return sum + (item.time || 0)
  }, 0)
})

const inProgressCount = computed(() => {
  return items.value.filter(item => {
    return item.status === "in-progress"
  }).length
})

const queuedCount = computed(() => {
  return items.value.filter(item => {
    return item.status === "queued"
  }).length
})

const featuredInProg = computed(() => {
  const inProg = items.value.filter(item => item.status === 'in-progress')
  if (inProg.length > 0) {
    const randIndex = Math.floor(Math.random() * inProg.length)
    return inProg[randIndex]
  }
  return null
})

const featuredQueue = computed(() => {
  const queued = items.value.filter(item => item.status === 'queued')
  if (queued.length > 0) {
    const randIndex = Math.floor(Math.random() * queued.length)
    return queued[randIndex]
  }
  return null
})


onMounted(() => {
  gsap.from("#hero-title", {
    opacity: 0,
    y: -30,
    duration: 1
  })
  gsap.from("#hero-subtitle", {
    opacity: 0,
    y: -30,
    duration: 1,
    delay: 0.3
  })

  if (user.value) {
    gsap.from("#stats-box", {
      opacity: 0,
      y: 20,
      duration: 1,
      delay: 0.6 })
  }
})


</script>

<template>
  <section class="hero is-medium">
    <div class="hero-body has-text-centered">
      <p id="hero-title" class="title">MEDIAQ</p>
      <p id="hero-subtitle" class="subtitle">Never lose track of your own backlog again!</p>

      <div v-if="user" id="stats-box" class="container">
        <div class="box">
          <div class="columns">
            <div class="column has-text-centered">
              <p class="heading">Total Time Left</p>
              <p class="title has-text-primary">{{ totalTime }} min</p>
            </div>

            <div class="column has-text-centered">
              <p class="heading">In Progress</p>
              <p class="title">{{ inProgressCount }}</p>
            </div>

            <div class="column has-text-centered">
              <p class="heading">Queued</p>
              <p class="title">{{ queuedCount }}</p>
            </div>
          </div>
          <!-- display random item in progress -->
          <div v-if="featuredInProg" class="container">
            <p>Need a suggestion on what to finish first? Why don't you resume <b>{{ featuredInProg.name }}</b>?</p>
            <br>
          </div>
          <div v-else-if="featuredQueue" class="container">
            <p>Going to start on something new? Try <b>{{ featuredQueue.name }}</b>!</p>
            <br>
          </div>
          <div class="has-text-centered">
            <RouterLink to="/list" class="button is-black is-medium">Go to My List</RouterLink>
          </div>
        </div>
      </div>

      <div v-else class="container">
        <button class="button is-primary is-large">Login to Start Tracking</button>
      </div>
    </div>
  </section>
  <div>
    <GsapCarousel :items="items"/>
  </div>
</template>
