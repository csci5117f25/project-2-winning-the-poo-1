<script setup>
import { ref, computed } from 'vue';

import MoviesCategory from '../components/categories/MoviesCategory.vue';
import ShowsCategory from '../components/categories/ShowsCategory.vue';
import BooksCategory from '../components/categories/BooksCategory.vue';
import GamesCategory from '../components/categories/GamesCategory.vue';

const activeTab = ref('MOVIES');
const searchQuery = ref('');
const committedQuery = ref('');
const categories = ['MOVIES', 'TV SHOWS', 'BOOKS', 'GAMES', 'OTHER'];

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

        <div class="columns is-centered mb-5">
          <div class="column is-half">
            <div class="field hass-addons">
              <div class="control is-expanded">
                <input class="input is-rounded is-medium has-text-centered has-text-weight-bold" type="text"
                placeholder="SEARCH FOR TITLE" v-model="searchQuery" style="text-transform: uppercase;" @keyup.enter="handleSearch">
              </div>
              <div class="control">
                <button class="button is-primary -isrounded -ismedium" @click="handleSearch">SEARCH</button>
              </div>
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
