<script setup>
import { ref } from 'vue';

import TrendingMedia from '../components/TrendingMedia.vue';
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
          <MoviesCategory v-if="activeTab === 'MOVIES'" :query="searchQuery" />
          <ShowsCategory v-if="activeTab === 'TV SHOWS'" :query="searchQuery" />
          <BooksCategory v-if="activeTab === 'BOOKS'" :query="searchQuery" />
          <GamesCategory v-if="activeTab === 'GAMES'" :query="searchQuery" />

        </div>

      </div>
    </section>
  </div>
</template>