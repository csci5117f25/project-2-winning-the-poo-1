<script setup>
import MediaSearch from '../components/MediaSearch.vue'
</script>

<template>
  <div class="has-background-light" style="min-height: 100vh;">
    <section class="section">
      <div class="container">
        <div class="columns is-centered mb-5">
          <div class="column is-full">
            <MediaSearch/>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.search-field {
  padding: 1rem;
  text-align: center;
  margin: 10px;
}
</style>
