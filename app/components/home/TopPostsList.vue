// components/home/TopPostsList.vue
<script setup lang="ts">
import { ChevronLeft, ChevronRight, List, BadgeAlert, Eye, Heart, Star, MapPin } from 'lucide-vue-next'
import { useHomeData } from '~/composables/useHomeData'

const props = defineProps<{
  posts?: any[]
  title?: string
}>()

const router = useRouter()
const carouselRef = ref<HTMLElement | null>(null)

const { data, loading: homeLoading } = props.posts === undefined
  ? useHomeData()
  : { data: ref(null), loading: ref(false) }

const posts = computed(() =>
  props.posts !== undefined
    ? props.posts
    : data.value?.topPosts || []
)

const loading = computed(() =>
  props.posts !== undefined ? false : homeLoading.value
)

function formatScore(score: any) {
  const s = parseFloat(score)
  return isNaN(s) || s === 0 ? null : s.toFixed(1)
}

function scrollCarousel(direction: 'prev' | 'next') {
  const el = carouselRef.value
  if (!el) return
  const amount = el.clientWidth * 0.75
  el.scrollBy({ left: direction === 'next' ? -amount : amount, behavior: 'smooth' })
}
</script>

<template>
  <section class="mt-4 overflow-hidden">
    <div class="flex flex-col gap-6 px-4 lg:px-16 max-w-960 mx-auto">
      <div class="flex items-center justify-between flex-wrap gap-3 px-4 md:px-0">
        <div>
          <h2 class="text-xl md:text-2xl font-black text-base-content leading-snug">
            {{ title || 'برترین‌های گردشگری' }}
          </h2>
          <p class="text-xs text-base-content/50 mt-1">تفریح و سرگرمی</p>
        </div>
        <button
          class="btn btn-dash btn-sm text-primary hover:btn-primary hover:text-primary-content gap-1"
          @click="router.push('/place/travel-guide/ardebil/search')"
        >
          مشاهده همه
          <ChevronLeft class="size-4" />
        </button>
      </div>

      <div v-if="loading" class="flex gap-4 overflow-hidden -mx-4 px-4 md:mx-0 md:px-0 pt-3 pb-12">
        <div
          v-for="i in 4"
          :key="i"
          class="card bg-base-100 overflow-hidden shrink-0 w-[75vw] sm:w-[50vw] md:w-64 lg:w-72 border border-base-200 rounded-2xl"
        >
          <div class="aspect-video bg-base-200 animate-pulse" />
          <div class="p-4 flex flex-col gap-3">
            <div class="h-4 bg-base-200 animate-pulse rounded-md w-3/4" />
            <div class="h-3 bg-base-200 animate-pulse rounded-md w-1/2" />
            <div class="h-3 bg-base-200 animate-pulse rounded-md w-1/3 mt-1" />
          </div>
        </div>
      </div>

      <div
        v-else-if="!posts.length"
        class="flex flex-col items-center justify-center py-12 gap-4 text-base-content/50"
      >
        <BadgeAlert class="size-10" />
        <p class="text-sm">داده‌ای یافت نشد</p>
      </div>

      <div v-else class="relative group/carousel">
        <button
          class="hidden md:flex absolute inset-s-0 top-[45%] -translate-y-1/2 translate-x-1/2 z-10
                 btn btn-circle btn-sm bg-base-100 shadow-md border border-base-200
                 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
          aria-label="قبلی"
          @click="scrollCarousel('prev')"
        >
          <ChevronRight class="size-5" />
        </button>

        <button
          class="hidden md:flex absolute inset-e-0 top-[45%] -translate-y-1/2 -translate-x-1/2 z-10
                 btn btn-circle btn-sm bg-base-100 shadow-md border border-base-200
                 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
          aria-label="بعدی"
          @click="scrollCarousel('next')"
        >
          <ChevronLeft class="size-5" />
        </button>

        <div
          ref="carouselRef"
          class="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 pt-3 pb-12"
          style="scrollbar-width: none; -ms-overflow-style: none;"
        >
          <NuxtLink
            v-for="post in posts"
            :key="post.id"
            :to="post.url"
            class="card card-lift bg-base-100 overflow-hidden block group shrink-0 snap-start
                   w-[75vw] sm:w-[50vw] md:w-64 lg:w-72 shadow-sm hover:shadow-md border border-base-200 rounded-2xl transition-all"
          >
            <figure class="relative aspect-video overflow-hidden">
              <img
                :src="post.imageUrl || post.image_url"
                :alt="post.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

              <div
                v-if="formatScore(post.reviewScore ?? post.review_score)"
                class="absolute top-3 inset-e-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1"
              >
                <Star class="size-3.5 text-yellow-400 fill-yellow-400" />
                <span class="text-white text-xs font-semibold">
                  {{ formatScore(post.reviewScore ?? post.review_score) }}
                </span>
              </div>
            </figure>

            <div class="p-4 flex flex-col gap-2">
              <h3 class="font-bold text-base-content text-sm leading-snug line-clamp-1">
                {{ post.title || post.translate?.title }}
              </h3>

              <p
                v-if="post.locationName || post.location?.title || post.location?.name"
                class="text-base-content/50 text-xs flex items-center gap-1"
              >
                <MapPin class="size-3.5 shrink-0" />
                <span>{{ post.locationName || post.location?.title || post.location?.name }}</span>
              </p>

              <div class="flex items-center gap-4 pt-2 border-t border-base-200 text-base-content/60 text-xs">
                <span v-if="(post.viewCount ?? post.view_count) > 0" class="flex items-center gap-1">
                  <Eye class="size-3.5" />
                  {{ (post.viewCount ?? post.view_count).toLocaleString('fa-IR') }}
                </span>
                <span v-if="(post.likeCount ?? post.like_count) > 0" class="flex items-center gap-1 text-error">
                  <Heart class="size-3.5 fill-current" />
                  {{ (post.likeCount ?? post.like_count).toLocaleString('fa-IR') }}
                </span>
              </div>
            </div>
          </NuxtLink>

          <div class="shrink-0 snap-start w-[45vw] sm:w-[30vw] md:w-44 self-stretch">
            <button
              class="h-full w-full rounded-2xl border-2 border-dashed border-primary/30
                     flex flex-col items-center justify-center gap-3
                     text-primary/60 hover:text-primary hover:border-primary/60 cursor-pointer
                     hover:bg-primary/5 transition-all duration-200 p-4"
              @click="router.push('/place/search')"
            >
              <List class="size-8" />
              <span class="text-xs font-medium text-center leading-snug">مشاهده بیشتر</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
div::-webkit-scrollbar { display: none; }
</style>