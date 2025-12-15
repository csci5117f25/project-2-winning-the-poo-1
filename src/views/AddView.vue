<script setup>
import MediaSearch from '../components/MediaSearch.vue'
</script>

<template>
    <!-- search bar -->
  <div class="search-field">
    <div class="header">
      <h1>Search Media</h1>
      <p>Find something new to watch or play.</p>
    </div>

    <MediaSearch/>
  </div>
</template>

<style scoped>
.search-field {
  padding: 1rem;
  text-align: center;
  margin: 10px;
}
</style>
