<script setup>
import { useCurrentUser } from 'vuefire'

const user = useCurrentUser()
</script>

<template>
  <h1>Profile</h1>
  <h2>Hi, {{ user?.displayName }}</h2>

  <img
    :src="user?.photoURL || 'https://via.placeholder.com/150'"
    alt="Profile Picture"
  />
</template>

<style scoped>
img {
  width: 6rem;
  height: 6rem;
  border-radius: 9999px;
  object-fit: cover;
}
</style>
