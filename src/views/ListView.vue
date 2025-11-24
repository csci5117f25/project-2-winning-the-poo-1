<script setup>
import { useCurrentUser } from 'vuefire';
import { db } from '../firebase_conf';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

const user = useCurrentUser();

async function getQueue(user) { // should return a reference to the user's queue
  const userRef = doc(db, 'users', user.uid)

  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    alert('function getQueue() found no user exists.')
    return null
  } else {
    const queueRef = collection(userRef, "queue")
    //DEBUG: attempts to add Inception to user backlog when this page is loaded.
    const debugRef = doc(queueRef, "Inception")
    await setDoc(debugRef, {
      name: "Inception",
      category: "movie",
      time: 2.5,
      added: new Date()
    })
    return queueRef
  }
}

getQueue(user)
</script>

<template>
    <h1>List</h1>
</template>

<style scope>
</style>
