<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
import { collection, addDoc, getDocs, query as fsQuery, where } from 'firebase/firestore'
import { db, auth } from '../../firebase_conf'
import gbooksService from '../../api/gbooks'
import placeholder from '../../assets/no_image.jpg'
import checkmarkJson from '../../assets/checkmark.json'

const props = defineProps(['query'])
const items = ref([])
const route = useRoute()

// Track added book IDs
const addedBookIds = ref(new Set())

const isLoading = ref(false);

// UI state per card
const uiState = ref({})

function ensureState(id) {
  if (!uiState.value[id]) uiState.value[id] = { justAdded: false }
  return uiState.value[id]
}

async function loadPopularBooks(pages = 3) {
  const results = []
  const pageSize = 20

  for (let p = 0; p < pages; p++) {
    const startIndex = p * pageSize
    const data = await gbooksService.getTrendingBooks(startIndex, pageSize)
    results.push(...(data.items || []))
  }

  return { items: results }
}

function normalizeBook(b) {
  const info = b.volumeInfo || {}
  const thumb =
    info.imageLinks?.thumbnail ||
    info.imageLinks?.smallThumbnail ||
    null

  return {
    id: b.id,
    title: info.title || 'Untitled',
    image: thumb,
    authors: info.authors || [],
  }
}

async function loadBooks(search) {
  isLoading.value = true;
  try {
    let data

    if (search && search.trim()) {
      data = await gbooksService.searchBooks(search.trim())
    } else {
      data = await loadPopularBooks(3)
    }

    items.value = (data.items || []).map(b => {
      ensureState(b.id)
      return normalizeBook(b)
    })
  } catch (e) {
    console.error('Error loading books:', e)
  } finally {
    isLoading.value = false;
  }
}

// Get user’s already-added BOOK ids
async function getUserBookIds() {
  const user = auth.currentUser
  if (!user) return

  const userItemsRef = collection(db, 'users', user.uid, 'queue')
  const snapshot = await getDocs(userItemsRef)
  const ids = new Set()

  snapshot.forEach(doc => {
    const data = doc.data()
    if (data?.media_type === 'book' && data?.gbooks_id) {
      ids.add(data.gbooks_id)
    }
  })

  addedBookIds.value = ids
}

const addtoBacklog = async (bookData) => {
  const user = auth.currentUser
  if (!user) {
    alert('You need to be logged in to add media to your backlog!')
    return
  }

  try {
    const userItems = collection(db, 'users', user.uid, 'queue')

    // Check if already exists
    const q = fsQuery(
      userItems,
      where('media_type', '==', 'book'),
      where('gbooks_id', '==', bookData.id)
    )

    const checkExisting = await getDocs(q)
    if (!checkExisting.empty) {
      addedBookIds.value.add(bookData.id)
      alert('This book is already in your backlog')
      return
    }

    const details = await gbooksService.getBookDetails(bookData.id)
    const info = details.volumeInfo || {}

    const backlogItem = {
      gbooks_id: details.id,
      name: info.title || 'Untitled',
      time: info.pageCount || null,
      status: 'queued',
      overview: info.description || '',
      release_date: info.publishedDate || '',
      rating: info.averageRating || null,
      image_url:
        info.imageLinks?.thumbnail ||
        info.imageLinks?.smallThumbnail ||
        '',
      media_type: 'book',
      authors: info.authors || [],
    }

    await addDoc(userItems, backlogItem)

    const state = ensureState(bookData.id)
    state.justAdded = true
    setTimeout(() => (state.justAdded = false), 775)

    addedBookIds.value.add(bookData.id)
  } catch (error) {
    alert('Failed to add book: ' + (error?.message || error))
  }
}

watch(() => props.query, (newVal) => {
  items.value = []
  loadBooks(newVal)
})

onMounted(async () => {
  await getUserBookIds()
  loadBooks(props.query)
})
</script>

<template>
  <div>
    <div v-if="isLoading" class="loader-wrapper">
        <div class="loader"></div>
      </div>
    <div class="columns is-multiline is-mobile">
      <div v-for="item in items" :key="item.id" class="column is-6-mobile is-4-tablet is-2-desktop">
        <div class="media-card-wrapper">
          <RouterLink :to="{ name: 'media_w_id', params: { id: item.id }, query: { ...route.query, type: 'book' } }">
            <figure class="image is-2by3">
              <img :src="item.image || placeholder" class="poster-image" alt="Book Cover" />
            </figure>
          </RouterLink>

          <button class="button is-dark is-rounded is-small floating-btn"
            :class="{ 'is-animating': uiState[item.id]?.justAdded }" @click="addtoBacklog(item)"
            :disabled="addedBookIds.has(item.id)">
            <template v-if="uiState[item.id]?.justAdded">
              <DotLottieVue :data="checkmarkJson" autoplay :loop="false" :speed="0.7"
                style="width: 100%; height: 100%; display: block;" />
            </template>

            <template v-else>
              <span class="icon is-small icon-box">
                <template v-if="addedBookIds.has(item.id)">
                  <svg class="static-check" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </template>
                <template v-else>+</template>
              </span>
            </template>
          </button>
        </div>

        <p class="has-text-centered has-text-weight-bold mt-2 is-size-7">
          {{ item.title }}
        </p>
        <p v-if="item.authors?.length" class="has-text-centered is-size-7 has-text-grey">
          {{ item.authors.join(', ') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.media-card-wrapper {
  position: relative;
}

.poster-image {
  border-radius: 25px;
}

.floating-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  z-index: 10;
  border: 2px solid white;
  cursor: pointer;
  transition: transform 0.2s;
  height: 35px;
  width: 35px;
  background-color: jet;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: hidden;
}

.floating-btn.is-animating {
  background-color: transparent;
}

.floating-btn:hover {
  transform: scale(1.1);
}


/* stole this from https://www.w3schools.com/howto/howto_css_loader.asp */
.loader-wrapper {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: lightgray;
}

.loader {
  border: 12px solid #e0e0e0;
  border-top: 12px solid #9e9e9e;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
