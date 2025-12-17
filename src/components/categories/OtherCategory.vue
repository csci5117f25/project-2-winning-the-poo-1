<script setup>
import { ref, onMounted } from 'vue'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import { db, auth } from '../../firebase_conf'

const title = ref('')
const amount = ref('')
const unitType = ref('minutes')
const isSubmitting = ref(false)
const userOtherItems = ref([])

async function loadUserOtherItems() {
  const user = auth.currentUser
  if (!user) {
    return
  }

  const userItemsRef = collection(db, 'users', user.uid, 'queue')
  const q = query(userItemsRef, where('media_type', '==', 'other'))
  const snapshot = await getDocs(q)

  userOtherItems.value = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

const addToBacklog = async (showData) => {
  const user = auth.currentUser;
  if (!user) {
    alert("You need to be logged in to add media to your backlog!");
    return;
  }

  if (!title.value) {
    alert("Please enter a title")
    return
  }

  isSubmitting.value = true

  try {
    const userItems = collection(db, 'users', user.uid, 'queue');

    const backlogItem = {
      name: title.value.trim(),
      time: Number(amount.value),
      unit_type: unitType.value,
      status: 'queued',
      media_type: 'other'
    };

    await addDoc(userItems, backlogItem);

    title.value = ''
    amount.value = ''
    unitType.value = 'minutes'

    await loadUserOtherItems()
  } catch (error) {
    alert("Failed to add show: " + error);
  } finally {
    isSubmitting.value = false
  }
};

onMounted(() => {
  loadUserOtherItems()
});
</script>

<template>
  <div class="other-category">
    <div class="box">
      <h3 class="title is-4 has-text-centered">Add Custom Media</h3>
      <p class="subtitle is-6 has-text-centered has-text-grey">Track everything else!</p>

      <div class="field">
        <label class="label">Title</label>
        <div class="control">
          <input class="input" type="text" v-model="title" palceholder="e.g., Podcast EP, Playlist, Magazine, etc." />
        </div>
      </div>

      <div class="field">
        <label class="label">Unit Type</label>
        <div class="control">
          <div class="select is-fullwidth">
            <select v-model="unitType">
              <option value="minutes">Minutes</option>
              <option value="pages">Pages</option>
            </select>
          </div>
        </div>
      </div>

      <div class="field">
        <label class="label">{{  unitType === 'minutes' ? 'Duration (minutes)' : 'Page Count' }}</label>
        <div class="control">
          <input class="input" type="number" v-model="amount" min="1" />
        </div>
      </div>

      <div class="field">
        <div class="control">
          <button class="button is-black is-fullwidth" :class="{ 'is-loading': isSubmitting }" :disabled="isSubmitting" @click="addToBacklog">
            Add to Backlog
          </button>
        </div>
      </div>

      <div v-if="userOtherItems.length > 0" class="mt-5">
        <h4 class="title is-5">Your Other Media</h4>
        <div class="columns is-multiline">
          <div v-for="item in userOtherItems" :key="item.id" class="column is-6-tablet is-4-desktop">
            <div class="notification is-light">
              <p class="has-text-weight-bold">{{ item.name }}</p>
              <p class="is-size-7 has-text-grey"> {{ item.time }} {{ item.unit_type === 'minutes' ? 'minutes' : 'pages' }}, {{ item.status }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.box {
  border-radius: 12px;
}
</style>
