<script setup>
import { useCurrentUser, useCollection } from 'vuefire'
import { collection, query, where, doc, updateDoc } from 'firebase/firestore'
import { ref, computed } from 'vue'
import { db } from '../firebase_conf'
import CategoriesView from './AddView.vue'
import StatsLineChart from '@/components/StatsLineChart.vue'
import Select from 'primevue/select'

const periodOptions = [
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'All Time', value: 'all' },
]

const categoryOptions = [
  { label: 'All Categories', value: 'all' },
  { label: 'Movies', value: 'movie' },
  { label: 'TV Shows', value: 'tv' },
  { label: 'Books', value: 'book' },
  { label: 'Video Games', value: 'game' },
  { label: 'Other', value: 'other' },
]

const user = useCurrentUser()
const queueRef = collection(db, 'users', user.value.uid, 'queue');
const queueItems = useCollection(queueRef);
const completedQuery = query(queueRef, where("status", "==", "complete"))
let complete = useCollection(completedQuery)
const period = ref('month')
const selectedCategory = ref('all')

const totalFilteredMinutes = computed(() => {
  return filteredCompleted.value.reduce(
    (sum, item) => sum + getEffectiveMinutes(item),
    0
  )
})

const totalFilteredPages = computed(() => {
  return filteredCompleted.value.filter(item => item.media_type === 'book' || (item.media_type === 'other' && item.unit_type === 'pages')).reduce(
    (sum, item) => sum + item.time,
    0
  )
})

const totalDays = computed(() => {
  return Math.floor(totalFilteredMinutes.value / 1440)
})

const remainderHours = computed(() => {
  return Math.floor((totalFilteredMinutes.value % 1440)/60)
})

const remainderMinutes = computed(() => {
  return (Math.floor(totalFilteredMinutes.value % 60))
})

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
      item.media_type === selectedCategory.value

    return matchesPeriod && matchesCategory
  })
})

const chartLabel = computed(() => {
  if (selectedCategory.value === 'book') {
    return 'Pages Read'
  } else if (selectedCategory.value === 'game') {
    return 'Minutes Played'
  }
  return 'Minutes Consumed'
})

const otherMinutesData = computed(() => {
  if (selectedCategory.value !== 'other') {
    return []
  }

  const map = {}
  filteredCompleted.value.filter(item => item.unit_type !== 'pages').forEach(item => {
    const date = item.completedAt?.toDate()
    if (!date) {
      return
    }

    let key
    if (period.value === 'month') {
      key = date.getDate()
    } else if (period.value === 'year') {
      key = date.getMonth()
    } else {
      key = date.toISOString().slice(0, 10)
    }

    map[key] = (map[key] || 0) + item.time
  })
  return Object.keys(map).sort((a, b) => a - b).map(key => ({ label: key, value: map[key] }))
})

const otherPagesData = computed(() => {
  if (selectedCategory.value !== 'other') {
    return []
  }

  const map = {}
  filteredCompleted.value.filter(item => item.unit_type !== 'minutes').forEach(item => {
    const date = item.completedAt?.toDate()
    if (!date) {
      return
    }

    let key
    if (period.value === 'month') {
      key = date.getDate()
    } else if (period.value === 'year') {
      key = date.getMonth()
    } else {
      key = date.toISOString().slice(0, 10)
    }

    map[key] = (map[key] || 0) + item.time
  })
  return Object.keys(map).sort((a, b) => a - b).map(key => ({ label: key, value: map[key] }))
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

    let value = 0
    if (item.media_type === 'book') {
      value = item.time
    } else if (item.media_type === 'tv') {
      const episodes = item.episodes
      const runtime = item.time
      value = episodes * runtime
    } else {
      value = item.time
    }

    map[key] = (map[key] || 0) + value
  })

  return Object.keys(map)
    .sort((a, b) => a - b)
    .map(key => ({
      label: key,
      value: map[key],
    }))
})

function getEffectiveMinutes(item) {
  if (item.media_type === 'book' || (item.media_type === 'other' && item.unit_type === 'pages')) {
    return 0
  }
  if (item.media_type === 'tv') {
    const episodes = item.episodes || 1
    const runtime = item.time || 0
    return episodes * runtime
  }
  return item.time || 0
}

const inProgressTime = computed(() => //I thought this needed curly brackets? idk man
  queueItems.value.filter(item => item.status === 'in-progress').reduce((accumulator, item) => accumulator + getEffectiveMinutes(item), 0)
)

const queueTime = computed(() => //I thought this needed curly brackets? idk man
  queueItems.value.filter(item => item.status === 'queued').reduce((accumulator, item) => accumulator + getEffectiveMinutes(item), 0)
)

const completedTime = computed(() => //I thought this needed curly brackets? idk man
  queueItems.value.filter(item => item.status === 'complete').reduce((accumulator, item) => accumulator + getEffectiveMinutes(item), 0)
)

const inProgressPages = computed(() =>
  queueItems.value.filter(item => item.status === 'in-progress' && (item.media_type === 'book' || (item.media_type === 'other' && item.unit_type === 'pages'))).reduce((accumulator, item) => accumulator + item.time, 0)
)

const queuedPages = computed(() => //I thought this needed curly brackets? idk man
  queueItems.value.filter(item => item.status === 'queued' && (item.media_type === 'book' || (item.media_type === 'other' && item.unit_type === 'pages'))).reduce((accumulator, item) => accumulator + item.time, 0)
)

const completedPages = computed(() => //I thought this needed curly brackets? idk man
  queueItems.value.filter(item => item.status === 'complete' && (item.media_type === 'book' || (item.media_type === 'other' && item.unit_type === 'pages'))).reduce((accumulator, item) => accumulator + item.time, 0)
)

const completedMessage = computed(() => {
  if (completedTime.value >= 1440) return "More than a day- wow, keep it up!"
  if (completedTime.value >= 1000) return "Amazing!"
  if (completedTime.value >= 660) return "That's longer than it would take to watch the enture extended Lord of the Rings trilogy!"
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


function formatMediaTime(item) {
  if (!item) {
    return ''
  }

  switch (item.media_type) {
    case 'book': {
      return `${item.time?.toLocaleString()} pages`
    }
    case 'tv': {
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
    }
    case 'game': {
      if (item.time >= 60) {
        const h = Math.floor(item.time / 60)
        return `${h} hour${h !== 1 ? 's' : ''}`
      }
    }
    case 'other': {
      if (item.unit_type === 'pages') {
        return `${item.time?.toLocaleString()} pages`
      }
      const mins = item.time || 0
      if (mins >= 60) {
        const h = Math.floor(mins / 60)
        const m = mins % 60
        return m > 0 ? `${h}h ${m}m` : `${h} hour${h !== 1 ? 's' : ''}`
      }
      return `${mins} minutes`
    }
    default: {
      const mins = item.time || 0
      if (mins >= 60) {
        const h = Math.floor(mins / 60)
        const m = mins % 60
        return m > 0 ? `${h}h ${m}m` : `${h} hour${h !== 1 ? 's' : ''}`
      }
      return `${mins} minutes`
    }
  }
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
                <p v-if="inProgressTime >= 1440" class="title">
                  {{ Math.floor(inProgressTime/1440) }} {{ Math.floor(inProgressTime/1440) <= 1 ? 'day' : 'days' }}, {{ Math.floor((inProgressTime%1440)/60) }} {{ Math.floor((inProgressTime%1440)/60) <= 1 ? 'hour' : 'hours' }}, {{ inProgressTime%60 }} {{ inProgressTime%60 <= 1 ? 'min' : 'mins' }}
                </p>
                <p v-else-if="inProgressTime >= 60" class="title">
                  {{ Math.floor(inProgressTime/60) }} {{ Math.floor(inProgressTime/60) <= 1 ? 'hour' : 'hours' }}, {{ inProgressTime%60 }} {{ inProgressTime%60 <= 1 ? 'min' : 'mins' }}
                </p>
                <p v-else-if="inProgressTime > 0" class="title">
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
                <p v-if="queueTime >= 1440" class="title">
                  {{ Math.floor(queueTime/1440) }} {{ Math.floor(queueTime/1440) <= 1 ? 'day' : 'days' }}, {{ Math.floor((queueTime%1440)/60) }} {{ Math.floor((queueTime%1440)/60) <= 1 ? 'hour' : 'hours' }}, {{ queueTime%60 }} {{ queueTime%60 <= 1 ? 'min' : 'mins' }}
                </p>
                <p v-else-if="queueTime >= 60" class="title">
                  {{ Math.floor(queueTime/60) }} {{ Math.floor(queueTime/60) <= 1 ? 'hour' : 'hours' }}, {{ queueTime%60 }} {{ queueTime%60 <= 1 ? 'min' : 'mins' }}
                </p>
                <p v-else-if="queueTime > 0" class="title">
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
                <p v-if="completedTime >= 1440" class="title">
                  {{ Math.floor(completedTime/1440) }} {{ Math.floor(completedTime/1440) <= 1 ? 'day' : 'days' }}, {{ Math.floor((completedTime%1440)/60) }} {{ Math.floor((completedTime%1440)/60) <= 1 ? 'hour' : 'hours' }}, {{ completedTime%60 }} {{ completedTime%60 <= 1 ? 'min' : 'mins' }}
                </p>
                <p v-else-if="completedTime >= 60" class="title">
                  {{ Math.floor(completedTime/60) }} {{ Math.floor(completedTime/60) <= 1 ? 'hour' : 'hours' }}, {{ completedTime%60 }} {{ completedTime%60 <= 1 ? 'min' : 'mins' }}
                </p>
                <p v-else-if="completedTime > 0" class="title">
                  {{ completedTime }} {{ completedTime <= 1 ? 'min' : 'mins' }}
                </p>
                <p v-else>
                  ---
                </p>
              </div>
            </div>

          </div>

          <div class="columns is-multiline has-text-centered mt-4" v-if="inProgressPages > 0 || queuedPages > 0 || completedPages > 0">
            <div class="column is-third">
              <div class="box">
                <p class="heading">In Progress</p>
                <p v-if="inProgressPages > 0" class="title">{{  inProgressPages.toLocaleString() }} pages</p>
                <p v-else>---</p>
              </div>
            </div>

            <div class="column is-third">
              <div class="box">
                <p class="heading">Queued</p>
                <p v-if="queuedPages > 0" class="title">{{  queuedPages.toLocaleString() }} pages</p>
                <p v-else>---</p>
              </div>
            </div>

            <div class="column is-third">
              <div class="box">
                <p class="heading">Completed</p>
                <p v-if="completedPages > 0" class="title">{{  completedPages.toLocaleString() }} pages</p>
                <p v-else>---</p>
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

    <div class="mb-2">
        <div class="scroll-row mt-3">
          <div v-for="item in complete" :key="item.id" class="card scroll-card">
            <div class="card-image" v-if="item.image_url">
              <figure class="image is-3by4">
                <img :src="item.image_url" alt="Cover Image" class="cover-img" />
              </figure>
            </div>

            <div class="card-content">
              <p class="title is-6 mb-2">

                <template v-if="item.media_type === 'other'">
                  <span class="has-text-dark">{{  item.name }}</span>
                </template>
                <RouterLink v-else :to="{ name: 'media_w_id', params: { id: item.media_type === 'book' ? item.gbooks_id : item.media_type === 'game' ? item.rawg_id : item.tmdb_id }, query: { type: item.media_type } }" class="has-text-dark">
                  {{ item.name }}
                </RouterLink>
              </p>
              <p class="is-size-7 has-text-grey mb-3">{{ formatMediaTime(item) }} <br></br> {{ dateCompletedAt(item.completedAt) }}</p>


              <div class="buttons are-small is-flex is-flex-direction-column">
                <button class="button is-danger is-light is-fullwidth" @click="unfinishMedia(item.id)">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>
  <div class="filters">
    <Select v-model="period" :options="periodOptions" optionLabel="label" optionValue="value" size="small" placeholder="Select Period" />
    <Select v-model="selectedCategory" :options="categoryOptions" optionLabel="label" optionValue="value" size="small" placeholder="Select Category" />
  </div>

<div class="chart" v-if="selectedCategory !== 'other'">
  <StatsLineChart :data="chartData" :label="chartLabel" />
  <h4 class="title is-4 has-text-centered">
    Total completion time of filtered media: {{ totalDays > 0 ? totalDays + (totalDays === 1 ? ' day' : ' days') + ', ' : '' }}{{ remainderHours > 0 ? remainderHours + (remainderHours === 1 ? ' hour' : ' hours') + ', ' : '' }}{{ remainderMinutes > 0 ? remainderMinutes + (remainderMinutes === 1 ? ' minute' : ' minutes') : '0 minutes' }}
    <p v-if="totalFilteredPages > 0">{{ totalFilteredPages.toLocaleString() }} pages read</p>
  </h4>
</div>

<template v-if="selectedCategory === 'other'">
  <div class="columns">
    <div class="column">
      <h5 class="title is-6 has-text-centered">Minutes</h5>
      <div class="chart-small">
        <StatsLineChart :data="otherMinutesData" label="Minutes Consumed" />
      </div>
    </div>
    <div class="column">
      <h5 class="title is-6 has-text-centered">Pages</h5>
      <div class="chart-small">
        <StatsLineChart :data="otherPagesData" label="Pages Read" />
      </div>
    </div>
  </div>
</template>
</template>


<style scoped>
.chart{
  max-width: 50vw;
  height: 50vh;
  margin: 0 auto 3rem auto;
}
@media (max-width: 768px) {
  .chart {
    max-width: 100%;
    width: 100%;
    height: 40vh;
    min-height: 250px;
  }
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

h4{
  margin-bottom: 20px;
}

.data {
  margin-bottom: 5rem;
}

.filters {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.chart-small {
  max-width: 100%;
  height: 35vh;
  margin: 0 auto;
}

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



.buttons {
  margin-top: auto;
}
</style>
