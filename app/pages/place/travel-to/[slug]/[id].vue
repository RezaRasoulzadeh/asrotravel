// pages/place/travel-to/[slug]/[id].vue
<script setup lang="ts">
import {
  MapPin, Clock, Eye, Heart, Bookmark, MessageCircle, Star,
  ChevronRight, ChevronLeft, Maximize2, WifiOff, RefreshCw,
  Compass, Share2, StarIcon, Bell,
} from 'lucide-vue-next'
import { parseBlogHtml } from '~/utils/blog/parser'
import BlogRenderer from '~/components/blog/BlogRenderer.vue'
import FullscreenImageViewer from '~/components/ui/FullscreenImageViewer.vue'
import ReviewSection from '~/components/ui/review/ReviewSecion.vue'

const route = useRoute()
const router = useRouter()
const slug = computed(() => (Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug) ?? '')

const { place, loading, error, refresh: fetchPlace } = usePlace(slug)

useHead({
  title: computed(() => place.value?.translate?.title ?? 'راهنمای سفر'),
  meta: [
    { name: 'description', content: computed(() => place.value?.translate?.tozihat ?? '') },
    { name: 'keywords',    content: computed(() => place.value?.translate?.keywords ?? '') },
    { property: 'og:title',       content: computed(() => place.value?.translate?.title ?? '') },
    { property: 'og:description', content: computed(() => place.value?.translate?.tozihat ?? '') },
    { property: 'og:image',       content: computed(() => place.value?.imageUrl ?? '') },
  ],
})

const allImages = computed<string[]>(() => {
  if (!place.value) return []
  const primary = place.value.imageUrl
  const gallery = (place.value.gallery ?? []).map((g: any) => g.image_url)
  const rest = gallery.filter((u: string) => u !== primary)
  return primary ? [primary, ...rest] : rest
})

const activeImageIdx = ref(0)
const activeImageUrl = computed(() => allImages.value[activeImageIdx.value] ?? '')

watch(allImages, () => { activeImageIdx.value = 0 })

function prevImage() {
  if (!allImages.value?.length) return
  activeImageIdx.value = (activeImageIdx.value - 1 + allImages.value.length) % allImages.value.length
}
function nextImage() {
  if (!allImages.value?.length) return
  activeImageIdx.value = (activeImageIdx.value + 1) % allImages.value.length
}

const thumbsContainer = ref<HTMLElement | null>(null)
const canScrollStart = ref(false)
const canScrollEnd = ref(false)

function onThumbsScroll() {
  const el = thumbsContainer.value
  if (!el) return
  canScrollStart.value = el.scrollLeft > 0
  canScrollEnd.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}

function scrollThumbs(dir: 'start' | 'end') {
  const el = thumbsContainer.value
  if (!el) return
  el.scrollBy({ left: dir === 'end' ? -200 : 200, behavior: 'smooth' })
}

watch(allImages, () => { setTimeout(onThumbsScroll, 100) })

const isViewerOpen = ref(false)

const parsedDetails = computed(() => {
  if (!place.value?.translate?.details) return []
  return place.value.translate.details.map((d: any) => ({
    id: d.id,
    title: d.title,
    blocks: parseBlogHtml(d.description),
  }))
})

const parsedDescription = computed(() => {
  if (!place.value?.translate?.description) return []
  return parseBlogHtml(place.value.translate.description)
})

const reviewsRef = ref<HTMLElement | null>(null)

function openMap() {
  const lat = place.value?.latitude
  const lng = place.value?.longitude
  if (lat && lng && lat !== '0.0' && lng !== '0.0' && typeof window !== 'undefined') {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
  }
}

function scrollToReviews() {
  reviewsRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function sharePlace() {
  if (typeof window === 'undefined') return
  if (navigator.share) {
    navigator.share({ title: place.value?.translate?.title ?? '', url: window.location.href })
  } else {
    navigator.clipboard.writeText(window.location.href)
  }
}

const reviewParams = computed(() => {
  if (!place.value) return null
  return {
    object_id: place.value.id,
    object_model: 'place',
    object_name: slug.value,
  }
})

function fa(n: number | null | undefined) {
  if (n == null) return '۰'
  return n.toLocaleString('fa-IR')
}

function handleImgError(e: Event) {
  const img = e.target as HTMLImageElement
  img.src = '/placeholder.jpg'
}
</script>

<template>
  <div class="min-h-screen bg-base-200/40 mt-16">

    <div class="sticky top-16 z-30 bg-base-100/80 backdrop-blur-md border-b border-base-300/50 px-4 lg:px-16">
      <div class="max-w-960 mx-auto py-2.5">
        <div class="breadcrumbs text-xs text-base-content/60">
          <ul>
            <li><RouterLink to="/">صفحه اصلی</RouterLink></li>
            <li>
              <RouterLink to="/place/travel-guide/ardebil">سفرنامه</RouterLink>
            </li>
            <li v-if="place?.translate?.title" class="text-base-content font-medium truncate max-w-40 lg:max-w-xs">
              {{ place.translate.title }}
            </li>
            <li v-else-if="loading">
              <span class="inline-block h-3.5 w-24 bg-base-300 rounded animate-pulse" />
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="loading" class="px-4 lg:px-16 max-w-960 mx-auto py-8 flex flex-col gap-6 animate-pulse">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-7 flex flex-col gap-4">
          <div class="w-full aspect-video rounded-3xl bg-base-300/70" />
          <div class="flex gap-2">
            <div v-for="n in 4" :key="n" class="w-28 aspect-4/3 rounded-xl bg-base-300/50 shrink-0" />
          </div>
        </div>
        <div class="lg:col-span-5 flex flex-col gap-4">
          <div class="h-8 w-3/5 rounded-xl bg-base-300/70" />
          <div class="h-48 rounded-2xl bg-base-300/60" />
          <div class="h-28 rounded-2xl bg-base-300/50" />
        </div>
      </div>
      <div class="h-60 rounded-2xl bg-base-300/40" />
    </div>

    <div v-else-if="error" class="flex flex-col items-center justify-center py-24 gap-3 text-center px-4">
      <div class="size-14 rounded-full bg-error/10 flex items-center justify-center">
        <WifiOff class="size-6 text-error" />
      </div>
      <p class="font-medium text-base-content">خطا در دریافت اطلاعات</p>
      <p class="text-sm text-base-content/50 max-w-xs leading-relaxed">
        ارتباط با سرور برقرار نشد. اینترنت خود را بررسی کنید.
      </p>
      <button class="btn btn-sm btn-error btn-soft gap-2 mt-1" @click="fetchPlace()">
        <RefreshCw class="size-4" />
        تلاش مجدد
      </button>
    </div>

    <template v-else-if="place">
      <div class="px-4 lg:px-16 max-w-960 mx-auto py-6 flex flex-col gap-8">

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          <div class="lg:col-span-7 flex flex-col gap-4">

            <div
              @click="isViewerOpen = true"
              class="w-full aspect-video rounded-3xl overflow-hidden bg-base-200 shadow-xs relative group cursor-zoom-in"
            >
              <img
                :src="activeImageUrl"
                :alt="place?.translate?.title ?? ''"
                @error="handleImgError"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
              />

              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div class="p-3 bg-base-100/20 backdrop-blur-md rounded-full text-white border border-white/20">
                  <Maximize2 class="size-6" />
                </div>
              </div>

              <template v-if="allImages.length > 1">
                <button
                  @click.stop="prevImage"
                  class="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-base-100/70 backdrop-blur-md text-base-content border border-base-200/40 hover:bg-base-100 shadow-sm transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
                >
                  <ChevronRight class="size-5" />
                </button>
                <button
                  @click.stop="nextImage"
                  class="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-base-100/70 backdrop-blur-md text-base-content border border-base-200/40 hover:bg-base-100 shadow-sm transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
                >
                  <ChevronLeft class="size-5" />
                </button>
              </template>
            </div>

            <div v-if="allImages.length > 1" class="relative group/thumbs">
              <button
                v-if="canScrollStart"
                @click="scrollThumbs('start')"
                class="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-xl bg-base-100/90 backdrop-blur-sm border border-base-200 shadow-sm hover:bg-base-100 transition-all opacity-0 group-hover/thumbs:opacity-100 cursor-pointer"
              >
                <ChevronRight class="size-4" />
              </button>
              <button
                v-if="canScrollEnd"
                @click="scrollThumbs('end')"
                class="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-xl bg-base-100/90 backdrop-blur-sm border border-base-200 shadow-sm hover:bg-base-100 transition-all opacity-0 group-hover/thumbs:opacity-100 cursor-pointer"
              >
                <ChevronLeft class="size-4" />
              </button>

              <div
                ref="thumbsContainer"
                @scroll="onThumbsScroll"
                class="w-full overflow-x-auto overflow-y-hidden py-2 -my-2 scrollbar-none"
              >
                <div class="flex items-center gap-2 px-1">
                  <button
                    v-for="(imgUrl, index) in allImages"
                    :key="index"
                    @click="activeImageIdx = index"
                    class="w-28 aspect-4/3 rounded-xl overflow-hidden shrink-0 border transition-all duration-300 bg-base-200 origin-center hover:scale-105 cursor-pointer"
                    :class="activeImageIdx === index
                      ? 'border-primary ring-4 ring-primary/10 shadow-md scale-95 opacity-100'
                      : 'border-base-300 opacity-70 hover:opacity-100'"
                  >
                    <img
                      :src="imgUrl"
                      :alt="place?.translate?.title ?? ''"
                      @error="handleImgError"
                      class="w-full h-full object-cover pointer-events-none"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-5 flex flex-col gap-4">

            <div
              class="hidden lg:flex flex-col gap-3 absolute -left-14 top-6 bg-base-100/80 backdrop-blur-md p-2 rounded-xl border border-base-200 shadow-xs z-20">
              <button 
                class="p-2 hover:text-primary transition-colors bg-base-200 rounded-lg cursor-pointer" 
                title="Add to favorites"
                @click="() => {}"
              >
                <Heart class="w-4 h-4" />
              </button>
              <button 
                class="p-2 hover:text-primary transition-colors bg-base-200 rounded-lg cursor-pointer" 
                title="Notifications"
              >
                <Bell class="w-4 h-4" />
              </button>
              <button 
                class="p-2 hover:text-primary transition-colors bg-base-200 rounded-lg cursor-pointer" 
                title="Share"
                @click="sharePlace"
              >
                <Share2 class="w-4 h-4" />
              </button>
              <button 
                v-if="place?.latitude && place?.longitude && place.latitude !== '0.0' && place.longitude !== '0.0'"
                @click="openMap"
                class="p-2 hover:text-primary transition-colors bg-base-200 rounded-lg cursor-pointer" 
                title="Open in Google Maps"
              >
                <Compass class="w-4 h-4" />
              </button>
            </div>

            <div class="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-5 flex flex-col gap-4">

              <h1 class="text-xl lg:text-2xl font-bold text-base-content leading-snug">
                {{ place?.translate?.title }}
              </h1>

              <div class="flex items-center gap-2 text-sm text-base-content/70">
                <MapPin class="size-4 text-primary shrink-0" />
                <span>{{ place?.translate?.address }}</span>
              </div>

              <div class="flex flex-wrap gap-3">
                <div class="flex items-center gap-1.5 text-sm text-base-content/60">
                  <Eye class="size-4 text-base-content/40" />
                  <span>{{ fa(place?.view_count) }} بازدید</span>
                </div>
                <div class="flex items-center gap-1.5 text-sm text-base-content/60">
                  <Heart class="size-4 text-rose-400" />
                  <span>{{ fa(place?.like_count) }} پسند</span>
                </div>
                <div class="flex items-center gap-1.5 text-sm text-base-content/60">
                  <Bookmark class="size-4 text-amber-400" />
                  <span>{{ fa(place?.memorise_count) }} ذخیره</span>
                </div>
                <div class="flex items-center gap-1.5 text-sm text-base-content/60">
                  <MessageCircle class="size-4 text-primary/70" />
                  <span>{{ fa(place?.comment_count) }} نظر</span>
                </div>
              </div>

              <div v-if="place?.rate" class="flex items-center gap-2">
                <div class="flex items-center gap-1 text-amber-500 rounded-xl">
                  <Star class="size-4 fill-amber-400" />
                  <span class="font-bold pt-1">{{ fa(place.rate) }}</span>
                </div>
                <span class="text-xs text-base-content/40">از ۵</span>
              </div>

              <div v-if="place?.time" class="flex items-center gap-2 text-sm text-base-content/60">
                <Clock class="size-4 text-base-content/40 shrink-0" />
                <span>زمان بازدید: {{ fa(place.time) }} ساعت</span>
              </div>

              <div class="flex flex-row gap-2 pt-1 border-t border-base-200">

                <button
                  class="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-base-200 hover:text-primary hover:bg-base-300 transition-colors text-sm cursor-pointer"
                  title="Add to favorites"
                  @click="() => {}"
                >
                  <Heart class="size-4 shrink-0" />
                  <span class="hidden sm:inline">علاقه‌مندی</span>
                </button>

                <button
                  class="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-base-200 hover:text-primary hover:bg-base-300 transition-colors text-sm cursor-pointer"
                  title="Save for later"
                  @click="() => {}"
                >
                  <Bookmark class="size-4 shrink-0" />
                  <span class="hidden sm:inline">ذخیره</span>
                </button>

                <button
                  class="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-base-200 hover:text-primary hover:bg-base-300 transition-colors text-sm cursor-pointer"
                  title="Write a review"
                  @click="scrollToReviews"
                >
                  <StarIcon class="size-4 shrink-0" />
                  <span class="hidden sm:inline">نظر</span>
                </button>

                <button
                  v-if="place?.latitude && place?.longitude && place.latitude !== '0.0' && place.longitude !== '0.0'"
                  class="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-base-200 hover:text-primary hover:bg-base-300 transition-colors text-sm cursor-pointer"
                  title="Open in Maps"
                  @click="openMap"
                >
                  <Compass class="size-4 shrink-0" />
                  <span class="hidden sm:inline">نقشه</span>
                </button>

                <button
                  class="flex-1 flex items-center justify-center gap-2 px-2.5 py-2 rounded-xl bg-base-200 hover:text-primary hover:bg-base-300 transition-colors text-sm cursor-pointer"
                  title="Share"
                  @click="sharePlace"
                >
                  <Share2 class="size-4 shrink-0" />
                  <span class="hidden sm:inline">اشتراک</span>
                </button>

              </div>
            </div>

            <div v-if="place?.translate?.tozihat" class="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-5">
              <p class="text-sm text-base-content/70 leading-relaxed">
                {{ place.translate.tozihat }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="parsedDescription.length" class="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-6 lg:p-8">
          <BlogRenderer :blocks="parsedDescription" />
        </div>

        <div v-if="parsedDetails.length" class="flex flex-col gap-6">
          <div
            v-for="detail in parsedDetails"
            :key="detail.id"
            class="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-6 lg:p-8"
          >
            <h2 class="text-xl font-bold text-base-content mb-5 pb-4 border-b border-base-200">
              {{ detail.title }}
            </h2>
            <BlogRenderer :blocks="detail.blocks" />
          </div>
        </div>

        <div ref="reviewsRef">
          <ReviewSection
            v-if="reviewParams"
            :params="reviewParams"
            :is-logged-in="false"
            @login-click="router.push('/auth/login')"
          />
        </div>

      </div>
    </template>

  </div>

  <FullscreenImageViewer
    :is-open="isViewerOpen"
    :images="allImages"
    :initial-index="activeImageIdx"
    @close="isViewerOpen = false"
  />
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

:deep(.blog) { direction: rtl; }
:deep(.b-heading) {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 1.5rem 0 0.75rem;
  color: hsl(var(--bc));
  line-height: 1.5;
}
:deep(.b-p) {
  line-height: 2;
  margin-bottom: 1rem;
  text-align: justify;
  color: hsl(var(--bc) / 0.75);
  font-size: 0.9375rem;
}
:deep(.b-list) {
  padding-right: 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
:deep(.b-list li) {
  color: hsl(var(--bc) / 0.75);
  line-height: 1.8;
  font-size: 0.9375rem;
}
:deep(.b-img) {
  margin: 1.5rem 0;
  border-radius: 1rem;
  overflow: hidden;
}
:deep(.b-img img) {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
}
</style>