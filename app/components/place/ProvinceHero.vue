// components/place/ProvinceHero.vue
<script setup lang="ts">
import { Images, MapPin, ChevronLeft, ChevronRight, BookOpen, Map } from 'lucide-vue-next'
import type { Province } from '~/types/province.types'

defineProps<{
  province: Province
  locations?: any[]
  categories?: any[]
  currentSlug: string
  emptyStates?: { itinerary: boolean; entertainment: boolean }
}>()

defineEmits<{
  (e: 'select-location', slug: string): void
}>()

const locationsRef = ref<HTMLElement | null>(null)

function scrollLocations(direction: 'left' | 'right') {
  if (!locationsRef.value) return
  const offset = direction === 'left' ? -350 : 350
  locationsRef.value.scrollBy({ left: offset, behavior: 'smooth' })
}

function scrollCategories(direction: 'left' | 'right') {
  const el = document.getElementById('hero-category-scroll')
  if (!el) return
  const offset = direction === 'left' ? -350 : 350
  el.scrollBy({ left: offset, behavior: 'smooth' })
}
</script>

<template>
  <section class="hero-section mt-16 px-4 lg:px-16" dir="rtl">
    <div class="grid grid-cols-1 items-start w-full">

      <div class="col-start-1 row-start-1 w-full h-[40vh] lg:h-[58vh] rounded-3xl lg:rounded-4xl overflow-hidden z-0 bg-base-200">
        <img
          :src="province.banner?.image_url || '/tour-hero.jpg'"
          alt=""
          class="hero-img w-full h-full object-cover object-center"
        />
      </div>

      <div class="col-start-1 row-start-1 z-10 w-full max-w-6xl mx-auto px-2 sm:px-4 mt-[28vh] lg:mt-[44vh] 2xl:mt-[50vh]">
        <div class="search-card w-full bg-base-100 rounded-3xl lg:rounded-4xl shadow-2xl shadow-base-300/80 p-4 lg:px-8 lg:py-6 flex flex-col gap-4">

          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div class="flex flex-col gap-1 min-w-0 flex-1">
              <div class="flex items-center gap-1.5 text-base-content/50 text-xs font-medium">
                <MapPin class="w-3.5 h-3.5" />
                <span>راهنمای سفر</span>
              </div>
              <h1 class="text-2xl lg:text-3xl font-black text-base-content leading-snug truncate">
                {{ province.title || province.name }}
              </h1>
            </div>

            <div class="flex flex-1 flex-col md:flex-row gap-2 shrink-0">
              <NuxtLink
                :to="`/place/travel-guide/${province.slug}/search`"
                class="btn btn-primary min-h-10 rounded-xl gap-2 px-5 flex-1 font-bold shadow-sm field-animate"
                :class="{ 'btn-disabled opacity-50': emptyStates?.itinerary }"
                style="--fi:0"
              >
                <Map class="w-4 h-4" />
                جاذبه‌‌های استان
              </NuxtLink>

              <NuxtLink
                :to="`/blog?location=${province.slug}`"
                class="btn btn-soft btn-primary min-h-10 rounded-xl gap-2 px-5 flex-1 font-bold field-animate"
                :class="{ 'btn-disabled opacity-50': emptyStates?.entertainment }"
                style="--fi:1"
              >
                <BookOpen class="w-4 h-4" />
                قبل سفر بخون
              </NuxtLink>

              <NuxtLink
                :to="`/place/momeries?location=${province.slug}`"
                class="btn btn-soft btn-primary btn-disabled min-h-10 rounded-xl gap-2 px-5 flex-1 font-bold field-animate"
                style="--fi:2"
              >
                <Images class="w-4 h-4" />
                آلبوم خاطرات
              </NuxtLink>
            </div>
          </div>

          <div v-if="locations?.length" class="relative border-t border-base-200/60 pt-3 group">
            <button
              class="absolute -right-2 top-[58%] -translate-y-1/2 z-20 btn btn-circle btn-xs btn-neutral opacity-0 group-hover:opacity-100 transition-opacity"
              @click="scrollLocations('right')"
            >
              <ChevronRight class="w-4 h-4" />
            </button>

            <div
              ref="locationsRef"
              class="flex gap-2 overflow-x-auto whitespace-nowrap pb-2 pt-1 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-1 scroll-smooth"
            >
              <button
                v-for="loc in locations"
                :key="loc.id"
                class="btn btn-sm shrink-0 rounded-xl"
                :class="loc.slug === currentSlug ? 'btn-primary' : 'btn-soft btn-primary'"
                @click="$emit('select-location', loc.slug)"
              >
                {{ loc.title || loc.name }}
              </button>
            </div>

            <button
              class="absolute -left-2 top-[58%] -translate-y-1/2 z-20 btn btn-circle btn-xs btn-neutral opacity-0 group-hover:opacity-100 transition-opacity"
              @click="scrollLocations('left')"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
          </div>

          <div v-if="!emptyStates?.itinerary && categories?.length" class="relative border-t border-base-200/60 pt-2 group">
            <button
              class="absolute -right-2 top-[55%] -translate-y-1/2 z-20 btn btn-circle btn-xs btn-neutral opacity-0 group-hover:opacity-100 transition-opacity"
              @click="scrollCategories('right')"
            >
              <ChevronRight class="w-4 h-4" />
            </button>

            <div class="-mx-4 lg:mx-0">
              <slot name="categories" />
            </div>

            <button
              class="absolute -left-2 top-[55%] -translate-y-1/2 z-20 btn btn-circle btn-xs btn-neutral opacity-0 group-hover:opacity-100 transition-opacity"
              @click="scrollCategories('left')"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hero-img {
  animation: hero-reveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes hero-reveal {
  from { opacity: 0; transform: scale(1.015); }
  to   { opacity: 1; transform: scale(1); }
}

.search-card {
  animation: card-rise 0.7s 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes card-rise {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.field-animate {
  animation: field-in 0.25s calc(0.05s * var(--fi, 0)) cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes field-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>