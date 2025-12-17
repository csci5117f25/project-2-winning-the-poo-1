<script setup>
import { RouterView } from 'vue-router'
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
  margin-top: 60px;
  background: white;
}

@media (max-width: 640px) {
  body {
    padding-bottom: 70px;
  }
}
</style>
