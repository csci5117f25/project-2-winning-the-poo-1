<script setup>
import { ref, onMounted } from 'vue'
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore'
import { db, auth } from '../../firebase_conf'

const items = ref([])
const newItemName = ref('')

async function loadOther() {
  const user = auth.currentUser
  if (!user) {
    return
  }

  const query = query(collection(db, 'users', user.uid, 'queue'), where('media_type', '==', 'other'))
  const snapshot = await getDocs(query)
  items.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

async function addOther() {
  if (!newItemName.value)
}
</script>
