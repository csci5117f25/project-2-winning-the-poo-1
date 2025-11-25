<script setup>
import { useCurrentUser, useCollection } from 'vuefire'
import { db } from '../firebase_conf'
import { collection, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore'
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

const deleteMedia = async (itemId) => {
  const itemRef = doc(db, 'users', user.value.uid, 'queue', itemId)

  await deleteDoc(itemRef)
}



</script>

<template>
  <section class="list-container">
    <h1>MEDIA LIST</h1>

    <div>
      <h3>IN-PROGRESS</h3>
      <p v-if="inProgress.length > 0">Your in-progress items will take you about <strong>{{ timeLeftProg }}</strong> minutes to complete.</p>
    </div>
    <div class="in-progress">
      <div v-for="item in inProgress" :key="item.name" class="card">
          <RouterLink :to="{ name: 'media_w_id', params: { id: item.id } }">{{ item.name}}</RouterLink>
          <img v-if="item.image_url" :src="item.image_url" alt="Cover Image" class="card-img"/>
          <p>{{ item.time }} minutes</p>
          <button class="remove-btn" @click="requeueMedia(item.id)">Stop</button>
      </div>
      <div v-if="inProgress.length === 0">
        <p>Start an item</p>
      </div>

    </div>

    <div>
      <h3>QUEUE</h3>
      <p v-if="queue.length > 0">Your queued items will take you about <strong>{{ timeLeftQueue }}</strong> minutes to complete.</p>
    </div>
    <div class="queue">
      <div v-for="item in queue" :key="item.name" class="card">
          <RouterLink :to="{ name: 'media_w_id', params: { id: item.id } }" class="card-title">{{ item.name}}</RouterLink>
          <img v-if="item.image_url" :src="item.image_url" alt="Cover Image" class="card-img"/>
          <p>{{ item.time }} minutes</p>
          <div class="buttons">
            <button class="card-btn" @click="startMedia(item.id)">Start</button>
            <button class="remove-btn" @click="deleteMedia(item.id)">Remove</button>
          </div>
      </div>
    </div>

  </section>

</template>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 0;
}
.list-container {
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  margin-top: 60px;
}
.in-progress {
    background-color: rgb(10, 10, 10);
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    padding: 10px 0;
}
.highlight {
  font-weight: 700;
  color: #111827;
}
.card {
    background: white;
    padding: 1rem;
    border-radius: 12px;
    width: 15vw;
    height: auto;
    margin: 1rem;
    box-shadow: 0px 8px 28px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    transition: transform 0.2s ease, background-color 0.2s ease;
}

.card-title {
  text-decoration: none;
  color: #111827;
  font-weight: 600;
  font-size: 0.95rem;
}


.card-img {
  width: 100%;
  height: 200px;
  margin-top: 1em;
  object-fit: cover;
  border-radius: 8px;
}

.card a {
    text-decoration: none;
    color: black;
}

.card:hover {
  transform: scale(1.05);
}

.buttons {
  display: flex;
  gap: 1em;
}

.card-btn, .remove-btn {
  cursor: pointer;
  border: none;
  padding: 1em;
  border-radius: 5px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  width: 80px;
}

.card-btn {
  background-color: #4caf50;
  color: white;
}

.card-btn:hover {
  background-color: #3b8d40;
  transform: scale(1.05);
}

.remove-btn {
  background-color: #e74c3c;
  color: white;
}

.remove-btn:hover {
  background-color: #c0392b;
  transform: scale(1.05);
}

.queue {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    padding: 1em;
    background-color: rgb(10, 10, 10);
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.2);
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
