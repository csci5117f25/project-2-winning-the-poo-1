<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

import { db, provider } from '@/firebase_conf'
import { getDoc, doc, setDoc } from 'firebase/firestore'
import { signInWithPopup } from 'firebase/auth'

const root = ref(null)
let ctx

const titleLetters = computed(() => 'MediaQ'.split(''))

const user = useCurrentUser()
const auth = useFirebaseAuth()
const router = useRouter()
const isLoggingIn = ref(false)

async function createUserIfNotExists(u) {
    const userRef = doc(db, 'users', u.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            id: u.uid,
            email: u.email,
            displayName: u.displayName || null,
            photoURL: u.photoURL || null,
            createdAt: new Date(),
        })
    }
}

async function login() {
    if (isLoggingIn.value) return
    isLoggingIn.value = true

    try {
        const result = await signInWithPopup(auth, provider)
        const u = result.user
        await createUserIfNotExists(u)
        router.push('/home')
    } catch {
        alert('oh no')
    } finally {
        isLoggingIn.value = false
    }
}

// Animations
onMounted(() => {
    ctx = gsap.context(() => {
        // HERO
        gsap.set('.hero-item', { opacity: 0, y: 18 })
        gsap.set('.mq-letter', { opacity: 0, y: 14 })

        gsap
            .timeline({ defaults: { ease: 'power3.out' } })
            .to('.hero-item', { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 })
            .to('.mq-letter', { opacity: 1, y: 0, duration: 0.5, stagger: 0.05 }, '-=0.55')

        // Scroll
        gsap.utils.toArray('.reveal-section').forEach((section) => {
            const items = section.querySelectorAll('.reveal')
            gsap.set(items, { opacity: 0, y: 18 })

            gsap.to(items, {
                opacity: 1,
                y: 0,
                duration: 0.75,
                ease: 'power3.out',
                stagger: 0.12,
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    end: 'bottom 40%',
                    toggleActions: 'play none none reverse',
                },
            })
        })
    }, root.value)
})

onBeforeUnmount(() => {
    ctx?.revert()
    ScrollTrigger.getAll().forEach((t) => t.kill())
})
</script>

<template>
    <div ref="root" class="mq-page">
        <section class="section mq-hero">
            <div class="container">
                <div class="columns is-centered">
                    <div class="column is-12-mobile is-10-tablet is-8-desktop has-text-centered">
                        <span class="tag is-info is-light is-medium hero-item">
                            Track • Queue • Insights
                        </span>

                        <h1 class="title is-1 mt-4 hero-item">
                            <span v-for="(ch, i) in titleLetters" :key="i" class="mq-letter"
                                style="display:inline-block;">
                                {{ ch }}
                            </span>
                        </h1>

                        <p class="subtitle is-4 mt-4 hero-item">
                            MediaQ helps you log consumption,
                            manage a watch/read/play queue, and view time-based usage summaries of your media.
                        </p>

                        <div class="buttons is-centered mt-5 hero-item">
                            <button class="button is-link is-medium is-rounded" :class="{ 'is-loading': isLoggingIn }"
                                :disabled="isLoggingIn" @click="user ? router.push('/home') : login()">
                                <span v-if="user">Continue to MediaQ</span>
                                <span v-else>Sign in to MediaQ</span>
                            </button>
                        </div>

                        <div class="mt-6 hero-item">
                            <p class="has-text-grey is-size-6">Scroll to learn more</p>
                            <div class="scroll-cue has-text-grey is-size-4">↓</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section reveal-section">
            <div class="container">
                <h2 class="title is-2 has-text-centered mb-6 reveal">How it works</h2>

                <div class="columns is-variable is-6 is-multiline is-centered">
                    <div class="column is-12-mobile is-6-tablet is-4-desktop reveal">
                        <div class="box mq-box has-text-centered">
                            <p class="heading">1) Discover</p>
                            <p class="title is-4">Media</p>
                            <p class="content">
                                Find media to put onto your queue
                            </p>
                        </div>
                    </div>

                    <div class="column is-12-mobile is-6-tablet is-4-desktop reveal">
                        <div class="box mq-box has-text-centered">
                            <p class="heading">2) Track usage</p>
                            <p class="title is-4">Minutes logged</p>
                            <p class="content">
                                Media is put onto your queue
                            </p>
                        </div>
                    </div>

                    <div class="column is-12-mobile is-6-tablet is-4-desktop reveal">
                        <div class="box mq-box has-text-centered">
                            <p class="heading">3) Analyze</p>
                            <p class="title is-4">Stats</p>
                            <p class="content">
                                Get insights on your media consumption habits
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section has-background-light reveal-section">
            <div class="container">
                <h2 class="title is-2 has-text-centered mb-6 reveal"> Why us? </h2>

                <div class="columns is-multiline is-variable is-4">
                    <div class="column is-12-mobile is-6-tablet reveal">
                        <div class="card mq-card">
                            <div class="card-content">
                                <p class="title is-5"> Track how degenerate you are </p>
                                <p class="content">
                                    Imagine you could see how much time you could've been studying
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="column is-12-mobile is-6-tablet reveal">
                        <div class="card mq-card">
                            <div class="card-content">
                                <p class="title is-5"> All in one solution </p>
                                <p class="content">
                                    You don't ever need to go anywhere else! Stay with us! Forever.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>

        <section class="section reveal-section">
            <div class="container">
                <div class="columns is-centered">
                    <div class="column is-12-mobile is-10-tablet is-8-desktop has-text-centered">
                        <h2 class="title is-2 mb-4 reveal">Why MediaQ</h2>
                        <p class="subtitle is-4 reveal">
                            <br>
                            We the best
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section class="section has-background-light reveal-section">
            <div class="container has-text-centered">
                <h2 class="title is-3 mb-4 reveal">Ready to start tracking?</h2>
                <br>
                <p class="subtitle is-5 reveal">Sign up to start</p>

                <div class="buttons is-centered mt-4">
                    <button class="button is-link is-large is-rounded reveal" :class="{ 'is-loading': isLoggingIn }"
                        :disabled="isLoggingIn" @click="user ? router.push('/home') : login()">
                        <span v-if="user">Continue to MediaQ</span>
                        <span v-else>Sign in to MediaQ</span>
                    </button>
                </div>
            </div>
        </section>

        <footer class="footer">
            <div class="content has-text-centered">
                <p class="is-size-6">
                    Not Copyrighted
                </p>
            </div>
        </footer>
    </div>
</template>

<style scoped>

.mq-hero {
    min-height: calc(100vh - 3.25rem);
    display: flex;
    align-items: center;
}

.mq-box,
.mq-card {
    border-radius: 16px;
}

.mq-card {
    height: 100%;
}

@media (max-width: 768px) {
    .mq-hero .title.is-1 {
        font-size: 2.5rem;
    }

    .mq-hero .subtitle.is-4 {
        font-size: 1.25rem;
    }
}
</style>
