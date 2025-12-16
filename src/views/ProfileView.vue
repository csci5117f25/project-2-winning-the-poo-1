<script setup>
import { useCurrentUser, useCollection } from 'vuefire'
import { collection, query, where, doc, updateDoc } from 'firebase/firestore'
import { ref, computed } from 'vue'
import { db } from '../firebase_conf'
import CategoriesView from './CategoriesView.vue'
import StatsLineChart from '@/components/StatsLineChart.vue'


const user = useCurrentUser()
const queueRef = collection(db, 'users', user.value.uid, 'queue');
const queueItems = useCollection(queueRef);
const completedQuery = query(queueRef, where("status", "==", "complete"))
let complete = useCollection(completedQuery)
const period = ref('month')
const selectedCategory = ref('all')

function isWithinPeriod(timestamp, period) {
  if (!timestamp) return false

  const date = timestamp.toDate()
  const now = new Date()

  if (period === 'month') {
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    )
  }

  if (period === 'year') {
    return date.getFullYear() === now.getFullYear()
  }

  return true
}

const filteredCompleted = computed(() => {
  return complete.value.filter(item => {
    const matchesPeriod = isWithinPeriod(item.completedAt, period.value)
    const matchesCategory =
      selectedCategory.value === 'all' ||
      item.category === selectedCategory.value

    return matchesPeriod && matchesCategory
  })
})

const chartData = computed(() => {
  const map = {}

  filteredCompleted.value.forEach(item => {
    const date = item.completedAt.toDate()

    let key
    if (period.value === 'month') {
      key = date.getDate() // 1–31
    } else if (period.value === 'year') {
      key = date.getMonth() // 0–11
    } else {
      key = date.toISOString().slice(0, 10) // YYYY-MM-DD
    }

    map[key] = (map[key] || 0) + item.time
  })

  return Object.keys(map)
    .sort((a, b) => a - b)
    .map(key => ({
      label: key,
      value: map[key],
    }))
})


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

  if (mins.value === 0) {
    return `0 mins`
  }
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

const unfinishMedia = async (itemId) => {
  const itemRef = doc(db, 'users', user.value.uid, 'queue', itemId);

  await updateDoc(itemRef, {
    status: 'queued'
  })
};

function dateCompletedAt(timestamp) {
  if (!timestamp) return '—'
  const date = timestamp.toDate()
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
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
          <p v-if="inProgressTime === 0 & queueTime === 0 & completedTime === 0">
            You don't have anything added yet. Go add some media <RouterLink :to="CategoriesView">here</RouterLink>!
          </p>

          <div class="columns is-multiline has-text-centered">

            <div class="column is-third">
              <div class="box">
                <p class="heading">In Progress</p>
                <p v-if="inProgressTime > 0" class="title">
                  {{ inProgressTime }} {{ inProgressTime <= 1 ? 'min' : 'mins' }}
                </p>
                <p v-else>
                  ---
                </p>
              </div>
            </div>

            <div class="column is-third">
              <div class="box">
                <p class="heading">Queued</p>
                <p v-if="queueTime > 0" class="title">
                  {{ queueTime }} {{ queueTime <= 1 ? 'min' : 'mins' }}
                </p>
                <p v-else>
                  ---
                </p>
              </div>
            </div>

            <div class="column is-third">
              <div class="box">
                <p class="heading">Completed</p>
                <p v-if="completedTime > 0" class="title">
                  {{ completedTime }} {{ completedTime <= 1 ? 'min' : 'mins' }}
                </p>
                <p v-else>
                  ---
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
      <p v-if="complete.length >= 0">That's <strong>{{ readableTime }}!</strong> {{ completedMessage }}</p>
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
          <!-- Completed Date -->
          <p class="is-size-7 has-text-grey">
            Completed: <strong>{{ dateCompletedAt(item.completedAt) }}</strong>
          </p>
          <div class="is-flex is-justify-content-center is-align-items-center py-0">
            <button class="button is-small is-centered is-danger is-light" @click="unfinishMedia(item.id)">Mark Incomplete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="filters">
  <select v-model="period">
    <option value="month">This Month</option>
    <option value="year">This Year</option>
    <option value="all">All Time</option>
  </select>

  <select v-model="selectedCategory">
    <option value="all">All Categories</option>
    <option value="Movie">Movies</option>
    <option value="TV">TV</option>
    <option value="Podcast">Podcasts</option>
  </select>
</div>

<div class="chart">
  <StatsLineChart :data="chartData" />
</div>
</template>


<style scoped>
.chart{
  max-width: 50vw;
  height: 50vh;
  margin: 0 auto;
}
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
