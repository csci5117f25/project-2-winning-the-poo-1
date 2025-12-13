import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase_conf'
import AddView from '@/views/AddView.vue'
import HomeView from '@/views/HomeView.vue'
import CategoriesView from '@/views/CategoriesView.vue'
import ListView from '@/views/ListView.vue'
import ProfileView from '@/views/ProfileView.vue'
import MediaId from '@/views/MediaId.vue'
import SplashView from '@/views/SplashView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: SplashView,
    },
    {
      path: '/home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/add',
      component: AddView,
      meta: { requiresAuth: true },
    },
    {
      path: '/categories',
      component: CategoriesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/list',
      component: ListView,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/media/:id',
      name: 'media_w_id',
      component: MediaId,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!auth.currentUser

  if (to.meta.requiresAuth && !isLoggedIn) {
    //alert('Please login')
    next({
      path: '/',
      query: { redirect: to.fullPath },
    })
    return
  }

  if (to.path === '/' && isLoggedIn) {
    next({ path: '/home' })
    return
  }

  next()
})

export default router
