<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'
import { db, provider } from '@/firebase_conf'
import { getDoc, doc, setDoc, collection } from 'firebase/firestore'
import { signInWithPopup, signOut } from 'firebase/auth'

const user = useCurrentUser()
const auth = useFirebaseAuth()

const router = useRouter()

async function createUserIfNotExists(user) {
  const userRef = doc(db, 'users', user.uid)

  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {

    // Create user document
    await setDoc(userRef, {
      id: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      createdAt: new Date()
    })

    console.log('User added')

    const queueRef = collection(userRef, "queue")
    const incepRef = doc(queueRef)
    const infWarRef = doc(queueRef)
    const tangledRef = doc(queueRef)
    const frozenRef = doc(queueRef)

    await setDoc(incepRef, {
      name: "Inception",
      category: "movie",
      time: 2.5,
      status: "in-progress",
      added: new Date()
    })

    await setDoc(infWarRef, {
      name: "Avengers: Infinity War",
      category: "movie",
      time: 2.4,
      status: "queued",
      added: new Date()
    })

    await setDoc(tangledRef, {
      name: "Tangled",
      category: "movie",
      time: 1.6,
      status: "queued",
      added: new Date()
    })

    await setDoc(frozenRef, {
      name: "Frozen",
      category: "movie",
      time: 1.5,
      status: "in-progress",
      added: new Date()
    })

    console.log("defaults added")

  } else {
    console.log('User already exists')
  }
}


async function login() {
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    await createUserIfNotExists(user)
    router.push('/home')
  } catch {
    alert("oh no");
  }
}

async function logout() {
  try {
    await signOut(auth)
    router.push('/')
  } catch {
    alert("oh no");
  }
}

</script>

<template>
<nav class="navbar is-black is-fixed-top desktop-nav" role="navigation">
  <div class="navbar-brand navbar-left">
    <RouterLink to="/" class="navbar-item brand ">
      MEDIAQ
    </RouterLink>

    <template v-if="user">
      <RouterLink to="/add" class="navbar-item" active-class="is-active">ADD</RouterLink>
      <RouterLink to="/categories" class="navbar-item" active-class="is-active">CATEGORIES</RouterLink>
      <RouterLink to="/list" class="navbar-item" active-class="is-active">LIST</RouterLink>
    </template>
  </div>

  <div class="navbar-end">
    <div class="navbar-item is-flex is-align-items-center" style="gap: 0.75rem">
      <button v-if="!user" class="button is-light is-small" @click="login">
        Login / Signup
      </button>

      <template v-else>
        <RouterLink to="/profile" class="navbar-item profile-link">
          <figure class="image is-40x40">
            <img class="is-rounded" :src="user?.photoURL || 'https://via.placeholder.com/48'" alt="Profile" />
          </figure>
        </RouterLink>

        <button class="button is-small is-light" @click="logout">
          Logout
        </button>
      </template>
    </div>
  </div>
</nav>


  <nav class="bottom-nav">
    <RouterLink to="/" class="tab">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-width="2" d="M3 9.5l9-7 9 7V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
      </svg>
    </RouterLink>

    <RouterLink to="/add" class="tab">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-width="2" d="M12 5v14m7-7H5" />
      </svg>
    </RouterLink>

    <RouterLink to="/categories" class="tab">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="11" cy="11" r="8" stroke-width="2" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2" />
      </svg>
    </RouterLink>

    <RouterLink to="/list" class="tab">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-width="2" d="M9 5h12M9 12h12M9 19h12M4 5h.01M4 12h.01M4 19h.01" />
      </svg>
    </RouterLink>

    <RouterLink to="/profile" class="tab">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="8" r="4" stroke-width="2" />
        <path stroke-width="2" d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      </svg>
    </RouterLink>
  </nav>

</template>

<style scoped>
.desktop-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.75rem;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.brand {
  font-weight: 800;
  font-size: 2rem;
  margin-right: 0.75rem;
}

.navbar-left .navbar-item {
  padding: 0.5rem 0.75rem;
}

.brand {
  font-weight: 800;
  font-size: 1.25rem;
  margin-right: 1rem;
}

.nav {
  color: white;
  text-decoration: none;
  font-size: large;
  margin: 10px;
}
/* no bottom nav on desktop */
.bottom-nav {
  display: none;
}



@media (max-width: 640px) {
  .desktop-nav {
    display: none;
  }

  /* mobile bottom nav */
  .bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: white;
    border-top: 1px solid #ddd;
    justify-content: space-around;
    align-items: center;
    z-index: 100;
  }

  .bottom-nav .tab {
    color: #333;
    text-decoration: none;
    display: flex;
    justify-content: center;
  }

  .icon {
    width: 28px;
    height: 28px;
    stroke-width: 2;
  }
}
</style>
