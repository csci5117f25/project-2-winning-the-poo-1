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
  padding: 10px;
  margin-top: 60px;
  background: white;
}

</style>
