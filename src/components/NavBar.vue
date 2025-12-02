<script setup>
import { RouterLink } from 'vue-router'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'
import { db, provider } from '@/firebase_conf'
import { getDoc, doc, setDoc, collection } from 'firebase/firestore'
import { signInWithPopup, signOut } from 'firebase/auth'

const user = useCurrentUser()
const auth = useFirebaseAuth()

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
  } catch {
    alert("oh no");
  }
}

async function logout() {
  try {
    await signOut(auth)
  } catch {
    alert("oh no");
  }
}
</script>

<template>
  <nav class="menu">
    <div class="links">
      <RouterLink to="/" class="home">MEDIAQ</RouterLink>
      <RouterLink to="/add" class="nav">ADD</RouterLink>
      <RouterLink to="/categories" class="nav">CATEGORIES</RouterLink>
      <RouterLink to="/list" class="nav">LIST</RouterLink>
    </div>
    <div class="loginout">
      <button @click="login()" class="logMenu" v-if="!user">Login/Signup</button>
      <button @click="logout()" class="logMenu" v-else>Logout</button>
      <RouterLink to="/profile" class="nav">Profile</RouterLink>
    </div>
  </nav>

  <nav class="bottom-nav">
    <RouterLink to="/" class="tab">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-width="2" d="M3 9.5l9-7 9 7V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"/>
      </svg>
    </RouterLink>

    <RouterLink to="/add" class="tab">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-width="2" d="M12 5v14m7-7H5"/>
      </svg>
    </RouterLink>

    <RouterLink to="/categories" class="tab">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </RouterLink>

    <RouterLink to="/list" class="tab">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-width="2" d="M9 5h12M9 12h12M9 19h12M4 5h.01M4 12h.01M4 19h.01"/>
      </svg>
    </RouterLink>

    <RouterLink to="/profile" class="tab">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="8" r="4" stroke-width="2" />
        <path stroke-width="2" d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
      </svg>
    </RouterLink>
  </nav>

</template>

<style scoped>

.menu{
  padding-left: 1rem;
  width: 100%;
  height: 60px;
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  background-color: black;
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: space-between;
}
.links{
  display: flex;
  gap: .5em;
  align-items: center;
  justify-content: flex-start;
  width: 40vw;
}
.nav{
  color: white;
  text-decoration: none;
  font-size: large;
  margin: 10px;
}
.loginout{
  margin: 10px;
  float: right;
}
.logMenu{
  text-transform: uppercase;
  background-color: transparent;
  border: none;
  color: white;
  font-size: medium;
  margin: 10px;
  cursor: pointer;
}

.home{
  font-size: 30px;
  color: white;
  text-decoration: none;
  margin: 5px;
  font-weight: bold;
}

a.nav {
  transition: 0.2s;
}

a.nav:hover {
  background-color: rgb(131, 131, 131);
  border-radius: 5px;
  padding: 0.5rem;
}

/* no bottom nav on desktop */
.bottom-nav {
  display: none;
}

@media (max-width: 640px) {
  /* hide the desktop nav on mobile */
  .menu {
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
