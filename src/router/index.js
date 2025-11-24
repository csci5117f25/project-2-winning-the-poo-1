import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase_conf'
import AddView from '@/views/AddView.vue'
import HomeView from '@/views/HomeView.vue'
import CategoriesView from '@/views/CategoriesView.vue'
import ListView from '@/views/ListView.vue'
import ProfileView from '@/views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
    path: '/', 
    component:  HomeView
  },
  { 
    path: '/add', 
    component: AddView, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/categories', 
    component: CategoriesView, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/list', 
    component: ListView, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/profile', 
    component: ProfileView, 
    meta: { requiresAuth: true } 
  }
  ],
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !auth.currentUser) {
    alert("Please login")
    next({
      path: '/',
      query: { redirect: to.fullPath },
    })
  } else {
    next()
  }
})

export default router
