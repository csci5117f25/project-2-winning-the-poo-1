<script setup>
import { computed, ref, watch } from 'vue'
import { useDocument, useCollection, useCurrentUser } from 'vuefire'
import { doc, updateDoc, deleteDoc, collection, addDoc } from 'firebase/firestore'
import {db } from '../firebase_conf'
import { useRoute, useRouter } from 'vue-router'

const user = useCurrentUser()
const router = useRouter()
const route = useRoute()

const MediaDoc = computed(() => {
    if (!user.value) return null
    return doc(db, 'users', user.value.uid, 'queue', route.params.id)
})
const MediaItem = useDocument(MediaDoc)

watch(MediaItem, (newVal) => {
  if (newVal === null) {
    router.push("/list")
  }
})
</script>

<template>
    <h1>{{ MediaItem.name }}</h1>
    <img v-if="MediaItem.image_url" :src="MediaItem.image_url" alt="Cover Image" class="card-img"/>
    <p>Release Date: {{ MediaItem.release_date }}</p>
    <p>Runtime: {{ MediaItem.time }} minutes</p>
    <p>Overview:</p>
    <p>{{ MediaItem.overview }}</p>
    <p>Average Rating: {{ MediaItem.rating }}</p>
</template>

<style scoped>
</style>
