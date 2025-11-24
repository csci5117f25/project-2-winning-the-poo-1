<script>
  const provider = new GoogleAuthProvider();
</script>
<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'
import { db } from './firebase_conf'
import { getDoc, doc, setDoc } from 'firebase/firestore'
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

const user = useCurrentUser()
const auth = useFirebaseAuth()

async function createUserIfNotExists(user) {
  const userRef = doc(db, 'users', user.uid)

  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      id: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      createdAt: new Date()
    })
    console.log('User added')
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
  <div class="menu">
    <div class="links">
      <RouterLink to="/" class="home">MEDIAQ</RouterLink>
      <RouterLink to="/add" class="nav">ADD</RouterLink>
      <RouterLink to="/categories" class="nav">CATEGORIES</RouterLink>
      <RouterLink to="/list" class="nav">LIST</RouterLink>
    </div>
    <div class="loginout">
      <button @click="login()" class="logMenu" v-if="!user">Login/Signup</button>
      <button @click="logout()" class="logMenu" v-else>Logout</button>
    </div>
  </div>
  <main>
    <p>Content should show here</p>
    <RouterView/>
  </main>
</template>

<style scoped>
.menu{
  width: 100dvw;
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  background-color: gray;
}
.links{
  float: left;
  width: 40vw;
  display: flex;
  justify-content: space-evenly;
  margin: 10px;
}
.nav{
  color: white;
  text-decoration: none;
  font-size: large;
  margin: 10px;
}
.home{
  font-size: 30px;
  color: white;
  text-decoration: none;
  margin: 5px;
}
.loginout{
  margin: 10px;
  float: right;
}
.logMenu{
  background-color: transparent;
  border-color: transparent;
  color: white;
  font-size: medium;
  margin: 10px;
  font-family:'Times New Roman', Times, serif
}
</style>
