<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'
import { db } from './firebase_conf'
import { getDoc, doc, setDoc } from 'firebase/firestore'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <NavBar/>
  <main>
    <RouterView/>
  </main>
</template>

<style scoped>
main {
  padding: 10px;
  margin-top: 60px;
  background: white;
}

</style>
