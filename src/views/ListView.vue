<script setup>
import { useCurrentUser, useCollection } from 'vuefire'
import { db } from '../firebase_conf'
import { collection, query, where } from 'firebase/firestore'

const user = useCurrentUser()

let inProgress = null
let queue = null

if (user.value) {
  const queueRef = collection(db, 'users', user.value.uid, 'queue')

  const inProgressQuery = query(queueRef, where("status", "==", "in-progress"))
  inProgress = useCollection(inProgressQuery)

  const queueQuery = query(queueRef, where("status", "==", "queued"))
  queue = useCollection(queueQuery)
}
</script>

<template>
  <h1>List</h1>

  <p>IN-PROGRESS</p>
  <div class="in-progress">
    <div v-for="item in inProgress" :key="item.name" class="card">
        <RouterLink :to="{ name: 'media_w_id', params: { id: item.id } }">{{ item.name}}</RouterLink>
        <p>{{ item.time }} hours</p>
    </div>
  </div>

  <p>QUEUE</p>
  <div class="queue">
    <div v-for="item in queue" :key="item.name" class="card">
        <RouterLink :to="{ name: 'media_w_id', params: { id: item.id } }">{{ item.name}}</RouterLink>
        <p>{{ item.time }} hours</p>
    </div>
  </div>
</template>

<style scoped>
.in-progress {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    padding: 10px 0;
}

.card {
    background: white;
    padding: 10px;
    border-radius: 10px;
    width: 10vw;
    height: 17vh;
    margin: 1rem;
    box-shadow: 0px 8px 28px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center; 
}
.card a {
    text-decoration: none; 
    color: black;          
}

.card:hover {
    cursor: pointer;
    background-color: gray;   
    transform: scale(1.1);
    transition: 0.2s ease;    
}
.queue{
    gap: 10rem;
}
.in-progress::-webkit-scrollbar {
  height: 6px;
}
.in-progress::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.3);
  border-radius: 3px;
}
@media (max-width: 600px) {
  .card {
    min-width: 120px;
    max-width: 160px;
    padding: 8px;
  }
  h1 {
    font-size: 1.5rem;
  }
  p {
    font-size: 0.8rem;
  }
}
</style>