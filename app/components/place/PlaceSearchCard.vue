// components/place/PlaceSearchCard.vue
<script setup lang="ts">
import { Heart, MapPin, Clock, Star, Eye, ThumbsUp, MessageCircle, Ticket } from 'lucide-vue-next'
import type { PlaceSearchItem } from '@/types/place.types'

const props = defineProps<{ place: PlaceSearchItem }>()

const placeUrl = computed(() => props.place?.url ?? '/')
const IMAGE_BASE = 'https://panel.asrotravel.com/uploads/files/Places/'
const imgSrc = computed(() => props.place?.imageUrl || (props.place?.image_url ? `${IMAGE_BASE}${props.place.image_url}` : '/placeholder.png'))

const score = computed(() => {
  const s = parseFloat(String(props.place?.review_score))
  return isNaN(s) || s === 0 ? null : s.toFixed(1)
})

const hasCoords = computed(() => !!props.place?.latitude && !!props.place?.longitude && props.place.latitude !== '0.0' && props.place.longitude !== '0.0')

function openInMap() {
  if (hasCoords.value) {
    window.open(`https://www.google.com/maps/search/?api=1&query=${props.place.latitude},${props.place.longitude}`, '_blank')
  }
}

const visitPrice = computed(() => {
  const p = props.place?.view_price
  return !p || p === 0 ? 'رایگان' : `${p.toLocaleString('fa-IR')} تومان`
})

const isFree = computed(() => !props.place?.view_price || props.place.view_price === 0)
const visitTime = computed(() => props.place?.time ? `${props.place.time.toLocaleString('fa-IR')} ساعت` : null)

function onImgError(e: Event) {
  (e.target as HTMLImageElement).src = '/placeholder.png'
}
</script>

<template>
  <div class="bg-base-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-base-200 flex flex-col h-104 group relative">
    <RouterLink :to="placeUrl" class="w-full h-44 shrink-0 relative overflow-hidden bg-base-200">
      <img :src="imgSrc" :alt="place?.title ?? ''" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" @error="onImgError" />
      <div v-if="place?.is_special" class="absolute top-3 right-3 badge badge-warning text-white text-xs font-bold px-2 py-1 z-10 rounded-lg shadow-sm">ویژه</div>
    </RouterLink>

    <button class="absolute top-3 left-3 btn btn-circle btn-sm bg-base-100/80 border-none backdrop-blur-md text-base-content/60 hover:text-error hover:bg-base-100 z-10 shadow-sm" aria-label="افزودن به علاقه‌مندی‌ها">
      <Heart class="size-4" />
    </button>

    <div class="flex flex-col flex-1 p-4 gap-2 min-w-0">
      <RouterLink :to="placeUrl" class="min-w-0">
        <h3 class="font-bold text-base-content text-base leading-snug line-clamp-1 transition-colors group-hover:text-primary">
          {{ place?.title ?? '—' }}
        </h3>
      </RouterLink>

      <div class="flex items-center gap-3 text-xs text-base-content/60 flex-wrap">
        <div v-if="score" class="flex items-center gap-1 font-medium bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded-md">
          <Star class="size-3.5 fill-amber-500 text-amber-500" />
          <span>{{ score }}</span>
        </div>
        <div class="flex items-center gap-2.5">
          <span class="flex items-center gap-1"><Eye class="size-3.5 text-base-content/30" /> <span>{{ (place?.view_count ?? 0).toLocaleString('fa-IR') }}</span></span>
          <span class="flex items-center gap-1"><ThumbsUp class="size-3.5 text-base-content/30" /> <span>{{ (place?.like_count ?? 0).toLocaleString('fa-IR') }}</span></span>
          <span class="flex items-center gap-1"><MessageCircle class="size-3.5 text-base-content/30" /> <span>{{ (place?.comment_count ?? 0).toLocaleString('fa-IR') }}</span></span>
        </div>
      </div>

      <button v-if="place?.translate?.address" class="text-xs text-base-content/40 line-clamp-1 -mt-0.5 flex items-center gap-1 text-start hover:text-primary transition-colors" :class="hasCoords ? 'cursor-pointer' : 'cursor-default'" @click.prevent="openInMap">
        <MapPin class="size-3 shrink-0 text-base-content/30" />
        {{ place.translate.address }}
      </button>

      <div class="mt-auto pt-2.5 border-t border-base-200/60 flex items-center gap-2">
        <div v-if="visitTime" class="flex items-center gap-1 text-xs text-base-content/50">
          <Clock class="size-3.5 opacity-70 shrink-0" />
          <span>زمان بازدید: {{ visitTime }}</span>
        </div>
      </div>

      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-1.5">
          <Ticket class="size-3.5 text-base-content/30 shrink-0" />
          <span class="font-black text-sm" :class="isFree ? 'text-success' : 'text-primary'">{{ visitPrice }}</span>
        </div>
        <RouterLink :to="placeUrl" class="btn btn-primary btn-sm rounded-xl px-4 text-xs font-bold shadow-sm">مشاهده مکان</RouterLink>
      </div>
    </div>
  </div>
</template>