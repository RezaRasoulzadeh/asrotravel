<!-- app/components/hotel/SearchCard.vue -->
<script setup lang="ts">
import { Heart, MapPin, Star, ExternalLink, Building2 } from 'lucide-vue-next'

const props = defineProps<{
  hotel: any
}>()

function formatScore(score: any) {
  const s = parseFloat(score)
  return isNaN(s) || s === 0 ? null : s.toLocaleString('fa-IR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

const score = formatScore(props.hotel?.review_score)
const offerPercent = Math.ceil(props.hotel?.max_offer_percent ?? 0)
const starRate = props.hotel?.star_rate ?? 0

const hasDiscount = (() => {
  const sale = parseFloat(props.hotel?.sale_price)
  const regular = parseFloat(props.hotel?.price)
  return !isNaN(sale) && !isNaN(regular) && sale > 0 && sale < regular
})()

const visibleTerms = (props.hotel?.terms ?? []).slice(0, 4)
const extraTerms = Math.max(0, (props.hotel?.terms ?? []).length - 4)

const propertyTypeTerm = (props.hotel?.terms ?? []).find(
  (t: any) => t?.term?.id >= 32 && t?.term?.id <= 41
)

function onImgError(e: Event) {
  const target = e.target as HTMLImageElement
  if (target != null) target.src = '/placeholder.png'
}

function openInMap() {
  const lat = props.hotel?.latitude
  const lng = props.hotel?.longitude
  if (lat != null && lng != null) {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat)},${encodeURIComponent(lng)}`, '_blank')
  }
}

const priceDisplay = props.hotel?.price_display ?? props.hotel?.min_price_display ?? '—'
const originalDisplay = hasDiscount ? (props.hotel?.min_price_display ?? null) : null
</script>

<template>
  <div class="bg-base-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-base-200 flex flex-col h-110 group relative">
    <NuxtLink
      :to="hotel?.url ?? '/'"
      class="w-full h-48 shrink-0 relative overflow-hidden bg-base-200"
    >
      <img
        :src="hotel?.media?.image_url ?? '/placeholder.png'"
        :alt="hotel?.title ?? ''"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        @error="onImgError"
      />

      <span
        v-if="offerPercent > 0"
        class="absolute top-3 right-3 badge badge-error text-white text-xs font-bold px-2 py-1 z-10 rounded-lg shadow-sm"
      >
        {{ offerPercent.toLocaleString('fa-IR') }}٪ تخفیف
      </span>
    </NuxtLink>

    <button
      class="absolute top-3 left-3 btn btn-circle btn-sm bg-base-100/80 border-none backdrop-blur-md text-base-content/60 hover:text-error hover:bg-base-100 z-10 shadow-sm"
      aria-label="افزودن به علاقه‌مندی‌ها"
      @click.prevent="() => {}"
    >
      <Heart class="size-4" />
    </button>

    <div class="flex flex-col flex-1 p-4 gap-2.5 min-w-0">
      <NuxtLink :to="hotel?.url ?? '/'" class="min-w-0">
        <h3 class="font-bold text-base-content text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
          {{ hotel?.title ?? '—' }}
        </h3>
      </NuxtLink>

      <div class="flex items-center gap-3 text-xs text-base-content/60">
        <div v-if="starRate > 0" class="flex items-center gap-0.5">
          <Star
            v-for="n in Math.min(5, Math.max(0, Math.round(starRate)))"
            :key="n"
            class="size-3 fill-amber-400 text-amber-400"
          />
        </div>

        <div
          v-if="score != null"
          class="flex items-center gap-1 font-medium bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded-md"
        >
          <Star class="size-3.5 fill-amber-500 text-amber-500" />
          <span>{{ score }}</span>
          <span v-if="hotel?.reviewsLength != null" class="text-xs opacity-70">({{ hotel.reviewsLength.toLocaleString('fa-IR') }})</span>
        </div>

        <div v-if="hotel?.location?.name != null" class="flex items-center gap-1">
          <MapPin class="size-3.5 shrink-0 text-base-content/40" />
          <span>{{ hotel.location.name }}</span>
        </div>
      </div>

      <p v-if="hotel?.address != null" class="text-xs text-base-content/40 line-clamp-1 -mt-1">
        {{ hotel.address }}
      </p>

      <div v-if="visibleTerms.length > 0" class="flex items-center gap-1 flex-wrap content-start min-h-6">
        <span
          v-for="term in visibleTerms"
          :key="term?.id"
          class="bg-base-200/60 text-base-content/70 text-[11px] px-2 py-0.5 rounded-md font-medium"
        >
          {{ term?.term?.name ?? '' }}
        </span>
        <span
          v-if="extraTerms > 0"
          class="text-[10px] text-base-content/40 font-bold bg-base-200/40 px-1.5 py-0.5 rounded-md"
        >
          +{{ extraTerms.toLocaleString('fa-IR') }}
        </span>
      </div>

      <div class="mt-auto pt-2.5 border-t border-base-200/60 flex items-center justify-between gap-2">
        <button
          v-if="hotel?.latitude != null && hotel?.longitude != null"
          @click.prevent="openInMap"
          class="link link-primary no-underline hover:underline flex items-center gap-1 text-[11px] font-semibold shrink-0"
        >
          <span>موقعیت روی نقشه</span>
          <ExternalLink class="size-3" />
        </button>

        <div v-else class="flex items-center gap-1 text-xs text-base-content/40">
          <Building2 class="size-3.5 opacity-60 shrink-0" />
          <span class="truncate">{{ propertyTypeTerm?.term?.name ?? 'هتل' }}</span>
        </div>
      </div>

      <div class="flex items-center justify-between gap-4 mt-1">
        <div class="flex flex-col">
          <span
            v-if="originalDisplay != null"
            class="text-base-content/40 line-through text-[11px]"
          >
            {{ originalDisplay }}
          </span>
          <span class="text-primary font-black text-base">
            {{ priceDisplay }}
          </span>
        </div>

        <NuxtLink
          :to="hotel?.url ?? '/'"
          class="btn btn-primary btn-sm rounded-xl px-4 text-xs font-bold shadow-sm"
        >
          رزرو هتل
        </NuxtLink>
      </div>
    </div>
  </div>
</template>