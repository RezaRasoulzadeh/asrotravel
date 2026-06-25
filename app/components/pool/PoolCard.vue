// components/pool/PoolCard.vue
<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import type { PoolItem } from '@/types/pool'

const props = defineProps<{ pool: PoolItem }>()

function formatScore(score: any) {
  const s = parseFloat(score)
  return isNaN(s) || s === 0 ? null : s.toFixed(1)
}

const score = computed(() => formatScore(props.pool?.review_score))
const isActive = computed(() => props.pool?.service_active === 1)
const offerPercent = computed(() => Math.ceil(props.pool?.max_offer_percent ?? 0))

const hasDiscount = computed(() => {
  const offer = parseFloat(String(props.pool?.price_with_offer ?? '0'))
  const minPrice = parseFloat(String(props.pool?.min_price ?? '0'))
  return !isNaN(offer) && !isNaN(minPrice) && offer > 0 && offer < minPrice
})

const priceDisplay = computed(() => props.pool?.min_price_display ?? props.pool?.min_price_view ?? '')
const offerPriceDisplay = computed(() => props.pool?.price_with_offer_display ?? props.pool?.price_with_offer ?? '')
</script>

<template>
  <RouterLink :to="pool?.url ?? '/'" class="card card-lift bg-base-100 overflow-hidden block group">
    <figure class="relative aspect-video overflow-hidden">
      <img :src="pool?.banner?.image_url || '/placeholder.png'" :alt="pool?.title ?? ''" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
      <div class="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
      <div class="absolute top-3 inset-s-3 flex gap-2">
        <span v-if="offerPercent > 0" class="badge badge-error text-white text-xs font-bold px-2 py-1">{{ offerPercent }}٪ تخفیف</span>
        <span v-if="!isActive" class="badge bg-base-300 text-base-content/60 text-xs px-2 py-1">غیرفعال</span>
      </div>
      <div v-if="score" class="absolute top-3 inset-e-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mb-1 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        <span class="text-white text-xs font-semibold">{{ score }}</span>
      </div>
    </figure>

    <div class="p-4 flex flex-col gap-2">
      <h3 class="font-bold text-base-content text-sm leading-snug line-clamp-1">{{ pool?.title ?? '—' }}</h3>
      <p v-if="pool?.address" class="text-base-content/50 text-xs flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>{{ pool.location?.name ?? pool.location?.title }}</span>
      </p>
      <div class="flex items-center justify-between pt-1 border-t border-base-200">
        <div class="flex flex-col items-start gap-0.5">
          <span v-if="hasDiscount" class="text-base-content/40 line-through text-xs">{{ priceDisplay }}</span>
          <span v-else class="text-xs invisible select-none">_</span>
          <span class="text-primary font-bold text-sm">{{ offerPriceDisplay }}</span>
        </div>
        <button class="btn btn-sm btn-ghost">مشاهده و رزرو <ArrowLeft class="size-4" /></button>
      </div>
    </div>
  </RouterLink>
</template>