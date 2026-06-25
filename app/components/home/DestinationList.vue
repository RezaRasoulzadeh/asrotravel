// components/home/DestinationList.vue
<script setup lang="ts">
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-vue-next'

interface Destination {
  id: number
  name: string
  url: string
  media: { image_url: string } | null
}

interface ApiResponse {
  data: Destination[]
  title: string
  sub_title: string
}

const carouselRef = ref<HTMLElement | null>(null)

const { data, status, error, refresh } = await useFetch<ApiResponse>('/api/destinations/best-on-season', {
  lazy: true
})

const destinations = computed(() => {
  return (data.value?.data ?? []).filter((d) => d && d.media !== null)
})

const title = computed(() => data.value?.title ?? '')
const subTitle = computed(() => data.value?.sub_title ?? '')

function scrollCarousel(direction: 'prev' | 'next') {
  const el = carouselRef.value
  if (!el) return
  const amount = el.clientWidth * 0.75
  const multiplier = direction === 'next' ? -1 : 1
  el.scrollBy({ left: amount * multiplier, behavior: 'smooth' })
}
</script>

<template>
  <section class="py-6 mt-4 px-4 lg:px-16 overflow-hidden relative" dir="rtl">
    <div class="absolute inset-0 bg-base-100" />
    <div 
      class="absolute inset-0 opacity-[0.03]"
      style="background-image: repeating-linear-gradient(0deg, currentColor, currentColor 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, currentColor, currentColor 1px, transparent 1px, transparent 40px);" 
    />
    
    <div class="flex flex-col gap-6 relative z-10">
      <div class="text-center px-4 md:px-0">
        <p class="text-xs font-bold tracking-widest text-primary uppercase mb-2">مقصدها</p>
        <h2 class="text-2xl md:text-3xl font-black text-base-content leading-snug">
          {{ title || 'بهترین مقصد برای سفر' }}
        </h2>
        <p v-if="subTitle" class="text-sm text-base-content/50 mt-2">{{ subTitle }}</p>
      </div>

      <div v-if="status === 'pending'" class="flex justify-center gap-4 overflow-hidden -mx-4 px-4 md:mx-0 md:px-0 pt-3 pb-4">
        <div
          v-for="i in 6"
          :key="i"
          class="rounded-3xl bg-base-200 animate-pulse shrink-0 card-width aspect-3/4"
        />
      </div>

      <div 
        v-else-if="error || !destinations.length"
        class="pt-3 pb-4 w-full flex items-center justify-center min-h-62.5"
      >
        <div class="flex flex-col items-center justify-center text-center p-6 max-w-sm rounded-3xl border border-base-200 bg-base-100/50 backdrop-blur-xs shadow-xs">
          <div class="p-3 bg-error/10 text-error rounded-full mb-3">
            <AlertCircle class="size-6" />
          </div>
          <h3 class="text-sm font-black text-base-content mb-1">خطا در دریافت اطلاعات</h3>
          <p class="text-xxs text-base-content/60 leading-relaxed mb-4">
            مشکلی در بارگذاری لیست مقاصد سفر به وجود آمده است.
          </p>
          <button @click="() => refresh()" class="btn btn-primary btn-sm rounded-2xl font-bold flex items-center gap-2">
            <RefreshCw class="size-3.5" />
            تلاش مجدد
          </button>
        </div>
      </div>

      <div v-else class="relative group/carousel">
        <button
          class="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10
                 btn btn-circle btn-sm bg-base-100 shadow-md border border-base-200
                 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
          aria-label="قبلی"
          @click="scrollCarousel('prev')"
        >
          <ChevronRight class="size-5" />
        </button>

        <button
          class="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10
                 btn btn-circle btn-sm bg-base-100 shadow-md border border-base-200
                 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
          aria-label="بعدی"
          @click="scrollCarousel('next')"
        >
          <ChevronLeft class="size-5" />
        </button>

        <div
          ref="carouselRef"
          class="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 pt-3 pb-4 scrollbar-none"
        >
          <NuxtLink
            v-for="dest in destinations"
            :key="dest.id"
            :to="dest.url"
            class="group relative shrink-0 snap-start card-width aspect-3/4 rounded-3xl overflow-hidden shadow-sm border border-base-200/50"
          >
            <img
              v-if="dest.media?.image_url"
              :src="dest.media.image_url"
              :alt="dest.name"
              class="absolute inset-0 w-full h-full object-cover will-change-transform transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-linear-to-t from-black/95 via-black/30 to-transparent" />
            <div class="absolute bottom-0 inset-x-0 p-4 text-right">
              <p class="text-white font-black text-sm md:text-base leading-tight mb-1">{{ dest.name }}</p>
              <span class="text-white/60 text-xxs font-bold">راهنمای سفر</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.text-xxs {
  font-size: 0.7rem;
}
.card-width {
  width: 42vw;
}
@media (min-width: 640px) {
  .card-width { width: 28vw; }
}
@media (min-width: 768px) {
  .card-width { width: 11rem; }
}
@media (min-width: 1024px) {
  .card-width { width: 12rem; }
}
.scrollbar-none {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>