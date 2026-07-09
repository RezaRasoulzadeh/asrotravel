// components/pool/PoolSearchCard.vue
<script setup lang="ts">
import { Heart, MapPin, Clock, Star, ExternalLink } from 'lucide-vue-next'
import type { PoolItem } from '~/types/pool.types'

const props = defineProps<{ pool: PoolItem }>()

const poolId = computed(() => props.pool.id ?? null)
const poolWishList = computed(() => props.pool.wish_list)
const { isWish, toggleWish } = useWish('Pool', poolId, poolWishList)

function formatScore(score: string | undefined): string | null {
  const s = parseFloat(score ?? '')
  if (Number.isNaN(s) || s === 0) return null
  return s.toLocaleString('fa-IR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

const score = formatScore(props.pool.review_score)
const isActive = props.pool.service_active === 1
const offerPercent = Math.ceil(props.pool.max_offer_percent ?? 0)

const hasDiscount = (() => {
  const offer = parseFloat(String(props.pool.price_with_offer ?? ''))
  const minPrice = parseFloat(props.pool.min_price ?? '')
  return !Number.isNaN(offer) && !Number.isNaN(minPrice) && offer > 0 && offer < minPrice
})()

const visibleTerms = computed(() => (props.pool.terms ?? []).slice(0, 4))
const extraTerms = computed(() => Math.max(0, (props.pool.terms ?? []).length - 4))
const reviewsLength = computed(() => props.pool.reviewsLength ?? 0)

function onImgError(e: Event) {
  const target = e.target as HTMLImageElement | null
  if (target) target.src = '/placeholder.png'
}

function openInMap() {
  const lat = props.pool.location?.map_lat ?? props.pool.map_lat
  const lng = props.pool.location?.map_lng ?? props.pool.map_lng
  if (lat && lng) {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
  }
}

const canOpenMap = computed(() => {
  const lat = props.pool.location?.map_lat ?? props.pool.map_lat
  const lng = props.pool.location?.map_lng ?? props.pool.map_lng
  return Boolean(lat && lng)
})
</script>

<template>
  <div
    class="bg-base-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-base-200 flex flex-col h-110 group relative"
    :class="{ 'opacity-65 grayscale-30': !isActive }"
  >

    <!-- Image -->
    <NuxtLink
      :to="pool.url ?? '/'"
      class="w-full h-48 shrink-0 relative overflow-hidden bg-base-200"
    >
      <img
        :src="pool.banner?.image_url || '/placeholder.png'"
        :alt="pool.title ?? ''"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        @error="onImgError"
      />

      <span
        v-if="offerPercent > 0 && isActive"
        class="absolute top-3 right-3 badge badge-error text-white text-xs font-bold px-2 py-1 z-10 rounded-lg shadow-sm"
      >
        {{ offerPercent.toLocaleString('fa-IR') }}٪ تخفیف
      </span>

      <div
        v-if="!isActive"
        class="absolute inset-0 bg-base-300/80 flex items-center justify-center z-10"
      >
        <span class="badge bg-base-100 text-error font-bold border-error/20 text-xs px-3 py-1.5 shadow-sm">غیرفعال</span>
      </div>
    </NuxtLink>

    <!-- Favorite -->
    <button
      class="absolute top-3 left-3 btn btn-circle btn-sm bg-base-100/80 border-none backdrop-blur-md hover:bg-base-100 z-10 shadow-sm"
      :class="isWish ? 'text-error' : 'text-base-content/60 hover:text-error'"
      aria-label="افزودن به علاقه‌مندی‌ها"
      @click.prevent="toggleWish"
    >
      <Heart class="size-4" :class="{ 'fill-error': isWish }" />
    </button>

    <div class="flex flex-col flex-1 p-4 gap-2.5 min-w-0">

      <!-- Title -->
      <NuxtLink :to="pool.url ?? '/'" class="min-w-0">
        <h3 class="font-bold text-base-content text-base leading-snug line-clamp-1 transition-colors group-hover:text-primary">
          {{ pool.title ?? '—' }}
        </h3>
      </NuxtLink>

      <!-- Score + Location -->
      <div class="flex items-center gap-3 text-xs text-base-content/60">
        <div v-if="score" class="flex items-center gap-1 font-medium bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded-md">
          <Star class="size-3.5 fill-amber-500 text-amber-500" />
          <span>{{ score }}</span>
          <span v-if="reviewsLength > 0" class="text-xs opacity-70">({{ reviewsLength.toLocaleString('fa-IR') }})</span>
        </div>
        <div v-if="pool.location?.name" class="flex items-center gap-1">
          <MapPin class="size-3.5 shrink-0 text-base-content/40" />
          <span>{{ pool.location.name }}</span>
        </div>
      </div>

      <!-- Address -->
      <p v-if="pool.address" class="text-xs text-base-content/40 line-clamp-1 -mt-1">
        {{ pool.address }}
      </p>

      <!-- Terms -->
      <div v-if="visibleTerms.length" class="flex items-center gap-1 flex-wrap content-start min-h-6">
        <span
          v-for="term in visibleTerms"
          :key="term.id"
          class="bg-base-200/60 text-base-content/70 text-[11px] px-2 py-0.5 rounded-md font-medium"
        >
          {{ term.name }}
        </span>
        <span v-if="extraTerms > 0" class="text-[10px] text-base-content/40 font-bold bg-base-200/40 px-1.5 py-0.5 rounded-md">
          +{{ extraTerms.toLocaleString('fa-IR') }}
        </span>
      </div>

      <!-- Sans + Map -->
      <div class="mt-auto pt-2.5 border-t border-base-200/60 flex items-center justify-between gap-2">
        <div class="flex items-center gap-1 text-xs text-base-content/50 min-w-0 flex-1">
          <Clock class="size-3.5 opacity-70 shrink-0" />
          <span class="truncate">{{ pool.sans_text || 'سانس‌های امروز' }}</span>
        </div>
        <button
          v-if="canOpenMap"
          @click.prevent="openInMap"
          class="link link-primary no-underline hover:underline flex items-center gap-1 text-[11px] font-semibold shrink-0"
        >
          <span>موقعیت روی نقشه</span>
          <ExternalLink class="size-3" />
        </button>
      </div>

      <!-- Price + CTA -->
      <div class="flex items-center justify-between gap-4 mt-1">
        <div class="flex flex-col">
          <span
            v-if="(hasDiscount || pool.price_with_offer_display) && isActive"
            class="text-base-content/40 line-through text-[11px]"
          >
            {{ pool.min_price_display || pool.min_price_view }}
          </span>
          <span class="font-black text-base" :class="isActive ? 'text-primary' : 'text-base-content/40'">
            {{ isActive ? (pool.price_with_offer_display || pool.min_price_display || pool.min_price_view || '—') : 'غیرقابل رزرو' }}
          </span>
        </div>

        <NuxtLink
          :to="pool.url ?? '/'"
          class="btn btn-sm rounded-xl px-4 text-xs font-bold shadow-sm"
          :class="isActive ? 'btn-primary' : 'bg-base-200 text-base-content/60 border-base-200 hover:bg-base-300 hover:text-base-content/80'"
        >
          {{ isActive ? 'خرید بلیط' : 'مشاهده مجموعه' }}
        </NuxtLink>
      </div>

    </div>
  </div>
</template>