<script setup>
import { useCurrentUser, useCollection } from 'vuefire'
import { db } from '../firebase_conf'
import { collection, query, where, doc, updateDoc } from 'firebase/firestore'
import { computed } from 'vue'

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

const timeLeftProg = computed(() => //I thought this needed curly brackets? idk man
  inProgress?.value.reduce((accumulator, item) => accumulator + item.time, 0)
)

const timeLeftQueue = computed(() => //I thought this needed curly brackets? idk man
  queue?.value.reduce((accumulator, item) => accumulator + item.time, 0)
)

const startMedia = async (itemId) => {
  const itemRef = doc(db, 'users', user.value.uid, 'queue', itemId);

  await updateDoc(itemRef, {
    status: 'in-progress'
  })
};

const requeueMedia = async (itemId) => {
  const itemRef = doc(db, 'users', user.value.uid, 'queue', itemId);

  await updateDoc(itemRef, {
    status: 'queued'
  })
}

</script>

<template>
  <h1>List</h1>

  <p>IN-PROGRESS</p>
  <div class="in-progress">
    <div v-for="item in inProgress" :key="item.name" class="card">
        <RouterLink :to="{ name: 'media_w_id', params: { id: item.id } }">{{ item.name}}</RouterLink>
        <img v-if="item.image_url" :src="item.image_url" alt="Cover Image" class="card-img"/>
        <p>{{ item.time }} minutes</p>
        <button class="card-btn" @click="requeueMedia(item.id)">Stop</button>
    </div>
  </div>
  <div>
    <p>Your in-progress items will take you about {{ timeLeftProg }} minutes to complete.</p>
  </div>

  <p>QUEUE</p>
  <div class="queue">
    <div v-for="item in queue" :key="item.name" class="card">
        <RouterLink :to="{ name: 'media_w_id', params: { id: item.id } }">{{ item.name}}</RouterLink>
        <img v-if="item.image_url" :src="item.image_url" alt="Cover Image" class="card-img"/>
        <p>{{ item.time }} minutes</p>
        <button class="card-btn" @click="startMedia(item.id)">Start</button>
    </div>
  </div>
  <div>
    <p>Your queued items will take you about {{ timeLeftQueue }} minutes to complete.</p>
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
    height: auto;
    margin: 1rem;
    box-shadow: 0px 8px 28px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.card-img {
  padding-top: 1em;
  height: 200px;
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
.queue {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    padding: 10px 0;
}
.in-progress::-webkit-scrollbar, .queue::-webkit-scrollbar {
  height: 6px;
}
.in-progress::-webkit-scrollbar-thumb, .queue::-webkit-scrollbar-thumb {
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
