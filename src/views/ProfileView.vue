<script setup>
import { useCurrentUser, useCollection } from 'vuefire'
import { collection } from 'firebase/firestore'
import { computed } from 'vue'
import { db } from '../firebase_conf'

const user = useCurrentUser()

const queueRef = collection(db, 'users', user.value.uid, 'queue');

const queueItems = useCollection(queueRef);

const inProgressTime = computed(() => //I thought this needed curly brackets? idk man
  queueItems.value.filter(item => item.status === 'in-progress').reduce((accumulator, item) => accumulator + item.time, 0)
)

const queueTime = computed(() => //I thought this needed curly brackets? idk man
  queueItems.value.filter(item => item.status === 'queued').reduce((accumulator, item) => accumulator + item.time, 0)
)
</script>

<template>
  <h1>Profile</h1>
  <h2>Hi, {{ user?.displayName }}</h2>

  <img
    :src="user?.photoURL || 'https://via.placeholder.com/150'"
    alt="Profile Picture"
  />

  <h2>STATS</h2>

  <h3>{{ inProgressTime }} minutes in-progress</h3>

  <h3>{{ queueTime }} minutes queued</h3>
</template>

<style scoped>
img {
  width: 6rem;
  height: 6rem;
  border-radius: 9999px;
  object-fit: cover;
}
</style>
