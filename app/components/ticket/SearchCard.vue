// components/ticket/SearchCard.vue
<script setup lang="ts">
import { Heart, MapPin, Star } from 'lucide-vue-next'
import type { TicketItem } from '~/types/ticket.types'

const props = defineProps<{ ticket: TicketItem }>()

function formatScore(score?: string | number | null) {
  const s = typeof score === 'number' ? score : parseFloat(score ?? '')
  return isNaN(s) || s === 0 ? null : s.toFixed(1)
}

const score = formatScore(props.ticket?.review_score)
const offerPercent = Math.ceil(props.ticket?.max_offer_percent ?? 0)

const hasDiscount = offerPercent > 0 && props.ticket?.price_with_offer_display !== props.ticket?.min_price_display

function onImgError(e: Event) {
  const target = e.target as HTMLImageElement | null
  if (target) target.src = '/placeholder.png'
}

const priceDisplay = props.ticket?.price_with_offer_display || props.ticket?.min_price_display || 'قیمت متغیر'
const originalDisplay = hasDiscount ? (props.ticket?.min_price_display ?? null) : null
</script>

<template>
  <div
    class="bg-base-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-base-200 flex flex-col h-110 group relative"
  >
    <!-- Image + badges -->
    <NuxtLink
      :to="ticket?.url ?? '/'"
      class="w-full h-48 shrink-0 relative overflow-hidden bg-base-200"
    >
      <img
        :src="ticket?.banner?.image_url || '/placeholder.png'"
        :alt="ticket?.title ?? ''"
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

      <NuxtLink :to="ticket?.url ?? '/'" class="min-w-0">
        <h3 class="font-bold text-base-content text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
          {{ ticket?.title ?? '—' }}
        </h3>
      </NuxtLink>

      <div class="flex items-center gap-3 text-xs text-base-content/60">
        <div
          v-if="score"
          class="flex items-center gap-1 font-medium bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded-md"
        >
          <Star class="size-3.5 fill-amber-500 text-amber-500" />
          <span>{{ score }}</span>
          <span v-if="ticket?.reviewsLength" class="text-xs opacity-70">({{ ticket.reviewsLength.toLocaleString('fa-IR') }})</span>
        </div>

        <div v-if="ticket?.location?.name" class="flex items-center gap-1">
          <MapPin class="size-3.5 shrink-0 text-base-content/40" />
          <span>{{ ticket.location.name }}</span>
        </div>
      </div>

      <p v-if="ticket?.address" class="text-xs text-base-content/40 line-clamp-1 -mt-1">
        {{ ticket.address }}
      </p>

      <div class="mt-auto pt-2.5 border-t border-base-200/60 flex items-center justify-between gap-2">
        <div class="flex items-center gap-1 text-xs text-base-content/40"></div>
      </div>

      <div class="flex items-center justify-between gap-4 mt-1">
        <div class="flex flex-col">
          <span v-if="originalDisplay" class="text-base-content/40 line-through text-[11px]">
            {{ originalDisplay }}
          </span>
          <span class="text-primary font-black text-base">
            {{ priceDisplay }}
          </span>
        </div>

        <NuxtLink
          :to="ticket?.url ?? '/'"
          class="btn btn-primary btn-sm rounded-xl px-4 text-xs font-bold shadow-sm"
        >
          خرید بلیط
        </NuxtLink>
      </div>

    </div>
  </div>
</template>