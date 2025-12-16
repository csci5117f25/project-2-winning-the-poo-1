import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase_conf'
import { onAuthStateChanged } from 'firebase/auth'
import AddView from '@/views/AddView.vue'
import HomeView from '@/views/HomeView.vue'
import CategoriesView from '@/views/CategoriesView.vue'
import ListView from '@/views/ListView.vue'
import ProfileView from '@/views/ProfileView.vue'
import MediaId from '@/views/MediaId.vue'
import SplashView from '@/views/SplashView.vue'

let authDone = false

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    // ... You can now access user data and manage UI specific to signed-in users
    console.log("User signed in:", uid);
  } else {
    // User is signed out
    // ... You can now manage UI specific to signed-out users
    console.log("User signed out");
  }
  authDone = true;
});


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
//test
//credit for waitFor: stackexchange (https://stackoverflow.com/questions/7193238/wait-until-a-condition-is-true)
function waitFor(conditionFunction) {

  const poll = resolve => {
    if(conditionFunction()) resolve();
    else setTimeout(() => poll(resolve), 400);
  }

  return new Promise(poll);
}

router.beforeEach(async (to, from, next) => {
  if (!authDone){
    await waitFor(() => authDone === true);
  }
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
