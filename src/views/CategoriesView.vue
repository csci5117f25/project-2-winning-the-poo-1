<script setup>
import { ref, computed } from 'vue';

import MoviesCategory from '../components/categories/MoviesCategory.vue';
import ShowsCategory from '../components/categories/ShowsCategory.vue';
import BooksCategory from '../components/categories/BooksCategory.vue';
import GamesCategory from '../components/categories/GamesCategory.vue';

const activeTab = ref('MOVIES');
const searchQuery = ref('');
const categories = ['MOVIES', 'TV SHOWS', 'BOOKS', 'GAMES', 'OTHER'];

const setCategory = (cat) => {
  activeTab.value = cat;
};

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

        <div class="columns is-centered mb-5">
          <div class="column is-half">
            <input class="input is-rounded is-medium has-text-centered has-text-weight-bold" type="text"
              placeholder="SEARCH FOR TITLE" v-model="searchQuery" style="text-transform: uppercase;">
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
            <component v-if="activeComponent" :is="activeComponent" :key="activeTab" :query="searchQuery" />
          </KeepAlive>
        </div>

      </div>
    </section>
  </div>
</template>