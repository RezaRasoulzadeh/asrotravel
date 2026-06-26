// ~/components/hotel/HotelCard.vue
<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

const props = defineProps({
  hotel: {
    type: Object,
    required: true,
  },
})

function formatScore(score: string | number | null | undefined) {
  const s = parseFloat(String(score))
  return isNaN(s) || s === 0 ? null : s.toFixed(1)
}

const score = formatScore(props.hotel?.review_score)
const offerPercent = Math.ceil(props.hotel?.max_offer_percent ?? 0)
const hasOffer = offerPercent > 0 && props.hotel?.sale_price != null
const isFeatured = props.hotel?.is_featured
const hasPrice = props.hotel?.price != null && parseFloat(props.hotel?.price) > 0

function onImgError(e: Event) {
  const target = e.target as HTMLImageElement | null
  if (target) {
    target.src = '/placeholder.png'
  }
}
</script>

<template>
  <NuxtLink :to="hotel?.url ?? '/'" class="card card-lift bg-base-100 overflow-hidden block group">
    <figure class="relative aspect-video overflow-hidden">
      <img :src="hotel?.banner?.image_url || '/placeholder.png'" :alt="hotel?.title ?? ''"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy"
        @error="onImgError" />

      <div class="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

      <div class="absolute top-3 inset-s-3 flex gap-2">
        <span v-if="hasOffer" class="badge badge-error text-white text-xs font-bold px-2 py-1">
          {{ offerPercent }}٪ تخفیف
        </span>
        <span v-else-if="isFeatured" class="badge badge-primary text-white text-xs font-bold px-2 py-1">
          ویژه
        </span>
      </div>

      <div v-if="score"
        class="absolute top-3 inset-e-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mb-1 text-yellow-400 fill-yellow-400"
          viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
        <span class="text-white text-xs font-semibold">{{ score }}</span>
      </div>
    </figure>

    <div class="p-4 flex flex-col gap-2">
      <h3 class="font-bold text-base-content text-sm leading-snug line-clamp-1">
        {{ hotel?.title ?? '—' }}
      </h3>
      <div class="flex flex-row justify-between items-center">
        <div v-if="hotel?.star_rate" class="flex items-center gap-0.5">
          <svg v-for="n in hotel.star_rate" :key="n" xmlns="http://www.w3.org/2000/svg"
            class="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </div>
        <p v-if="hotel?.location?.title" class="text-base-content/50 text-xs flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{{ hotel.location.title }}</span>
        </p>
      </div>
      <div class="flex items-center justify-between pt-1 border-t border-base-200">
        <div class="flex flex-col items-start gap-0.5">
          <span v-if="!hasPrice" class="text-base-content/40 text-xs">
            قیمت متغیر
          </span>
          <template v-else>
            <span v-if="hasOffer" class="text-base-content/40 line-through text-xs">
              {{ hotel?.price_display }}
            </span>
            <span v-else class="text-xs invisible select-none">_</span>
            <span class="text-primary font-bold text-sm">
              {{ hotel?.min_price_display }}
            </span>
          </template>
        </div>
        <button class="btn btn-sm btn-ghost">
          مشاهده و رزرو
          <ArrowLeft class="size-4" />
        </button>
      </div>
    </div>
  </NuxtLink>
</template>