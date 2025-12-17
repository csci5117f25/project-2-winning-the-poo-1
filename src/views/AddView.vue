<script setup>
import { ref, computed, watch } from 'vue';
import { useSpeechRecognition } from '@vueuse/core';

import MoviesCategory from '../components/categories/MoviesCategory.vue';
import ShowsCategory from '../components/categories/ShowsCategory.vue';
import BooksCategory from '../components/categories/BooksCategory.vue';
import GamesCategory from '../components/categories/GamesCategory.vue';

const activeTab = ref('MOVIES');
const searchQuery = ref('');
const committedQuery = ref('');
const categories = ['MOVIES', 'TV SHOWS', 'BOOKS', 'GAMES', 'OTHER'];

const { isListening, result, start, stop } = useSpeechRecognition();

watch(result, (val) => {
  if(val){
    searchQuery.value = val;
    handleSearch();
  }
});

const setCategory = (cat) => {
  activeTab.value = cat;
};

const handleSearch = () => {
  committedQuery.value = searchQuery.value
}

const componentMap = {
  'MOVIES': MoviesCategory,
  'TV SHOWS': ShowsCategory,
  'BOOKS': BooksCategory,
  'GAMES': GamesCategory,
}

const activeComponent = computed(() => componentMap[activeTab.value])
</script>

<template>
  <div class="has-background-light" style="min-height: 100vh;">
    <section class="section">
      <div class="container">

        <div class="search-container">
            <div class="search-bar">
              <div class="search-input-wrapper">
                <input class="search-input" type="text"
                placeholder="Search for title..." v-model="searchQuery" @keyup.enter="handleSearch">
              </div>
              <div class="control">
                <button class="search-btn" @click="handleSearch">SEARCH</button>
              </div>
              <div class="control">
                <button class="mic-btn" @click="isListening ? stop() : start()">
                  {{ isListening ? 'Stop Voice Search' : 'Try Voice Search' }}
                </button>
              </div>
          </div>
        </div>

        <div class="tabs is-centered is-medium">
          <ul>
            <li v-for="cat in categories" :key="cat" :class="{ 'is-active': activeTab === cat }"
              @click="setCategory(cat)">
              <a class="has-text-weight-bold">{{ cat }}</a>
            </li>
          </ul>
        </div>

        <div class="content-wrapper">
          <KeepAlive>
            <component v-if="activeComponent" :is="activeComponent" :key="activeTab" :query="committedQuery" />
          </KeepAlive>
        </div>

      </div>
    </section>
  </div>
</template>

<style scoped>
.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1 rem;
  padding: 0.4rem 0.2rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  width: 25vw;
  height: 48px;
}

@media (max-width: 640px) {
  .search-input {
    width: 60vw;
  }
}

.search-container {
  display: flex;
  justify-content: center;
  margin: 10px;
}
.search-input-wrapper {
  width: 100%;
  justify-content: center;
  flex-grow: 1;
  display: flex
}
.search-bar {
  width: 50vw;
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
}

.search-btn, .mic-btn {
  border: none;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  font-size: .8rem;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  background-color: #15254e;
  color: white;
  transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease;
  height: 48px;
  display: flex;
  align-items: center;
}

.search-btn:hover, .mic-btn:hover {
  background-color: #00d1b2;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
}
</style>
