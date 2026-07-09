// component/hotel/HotelSingleHeader.vue
<script setup lang="ts">
import {
  MapPin, Heart, Bell, Share2, Compass,
  Star, Maximize2, ChevronRight, ChevronLeft,
  Clock, CalendarDays, RefreshCw, BedDouble,
  LayoutGrid, ChevronDown
} from 'lucide-vue-next'
import type { HotelDetail, HotelSingleImage } from '~/types/hotelSingle.types'
import FullscreenImageViewer from '~/components/ui/FullscreenImageViewer.vue'
import ShareModal from '~/components/ui/ShareModal.vue'

const props = defineProps<{
  hotel: HotelDetail
  gallery: HotelSingleImage[]
}>()

const hotelId = computed(() => props.hotel.id ?? null)
const hotelWishList = computed(() => props.hotel.wish_list)
const { isWish, toggleWish } = useWish('Hotel', hotelId, hotelWishList)
const { isSubscribed, subscribe } = useNotifySubscription('Hotel', hotelId)
const isShareOpen = ref(false)

const PLACEHOLDER = '/placeholder.png'

const handleImgError = (e: Event) => {
  const el = e.target as HTMLImageElement | null
  if (el && !el.src.endsWith(PLACEHOLDER)) {
    el.src = PLACEHOLDER
  }
}

const allImages = computed(() => {
  const list: string[] = []
  props.gallery?.forEach(img => {
    if (img?.image_url && !list.includes(img.image_url)) list.push(img.image_url)
  })
  if (!list.length) list.push(PLACEHOLDER)
  return list
})

const activeImageIdx = ref(0)
const isViewerOpen = ref(false)
const activeImageUrl = computed(() => allImages.value[activeImageIdx.value] || PLACEHOLDER)

const nextImage = () => {
  if (!allImages.value.length) return
  activeImageIdx.value = (activeImageIdx.value + 1) % allImages.value.length
}

const prevImage = () => {
  if (!allImages.value.length) return
  activeImageIdx.value = (activeImageIdx.value - 1 + allImages.value.length) % allImages.value.length
}

const thumbsContainer = ref<HTMLElement | null>(null)
const canScrollStart = ref(false)
const canScrollEnd = ref(false)

const onThumbsScroll = () => {
  const el = thumbsContainer.value
  if (!el) return
  const sl = el.scrollLeft
  canScrollStart.value = sl < -4
  canScrollEnd.value = sl > -(el.scrollWidth - el.clientWidth - 4)
}

const scrollThumbs = (dir: 'start' | 'end') => {
  thumbsContainer.value?.scrollBy({ left: dir === 'start' ? 200 : -200, behavior: 'smooth' })
}

onMounted(() => nextTick(() => {
  const el = thumbsContainer.value
  if (!el) return
  onThumbsScroll()
  canScrollEnd.value = el.scrollWidth > el.clientWidth
}))

watch(allImages, () => nextTick(onThumbsScroll))

const ceiledOfferPercent = computed(() =>
  props.hotel?.max_offer_percent ? Math.ceil(props.hotel.max_offer_percent) : 0
)

const ratingStars = computed(() => {
  const score = props.hotel?.review_score ? Math.round(Number(props.hotel.review_score)) : 0
  return Math.min(Math.max(score, 0), 5)
})

const starRate = computed(() => props.hotel?.star_rate ?? 0)

const openGoogleMap = () => {
  const { map_lat, map_lng } = props.hotel ?? {}
  if (!map_lat || !map_lng) return
  window.open(`https://www.google.com/maps/search/?api=1&query=${map_lat},${map_lng}`, '_blank')
}

const scrollToRooms = () => {
  document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' })
}

const amenities = computed(() => props.hotel?.terms?.map(t => t?.term?.name).filter(Boolean) ?? [])

const isAmenitiesExpanded = ref(false)
const amenitiesContainer = ref<HTMLElement | null>(null)
const amenitiesHasOverflow = ref(false)

onMounted(() => {
  if (!amenitiesContainer.value) return
  const observer = new ResizeObserver(() => {
    const el = amenitiesContainer.value
    if (el) amenitiesHasOverflow.value = el.scrollHeight > el.clientHeight
  })
  observer.observe(amenitiesContainer.value)
})
</script>

<template>
  <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full select-none">
    <div class="lg:col-span-7 flex flex-col gap-4">
      <div @click="isViewerOpen = true"
        class="w-full aspect-video rounded-3xl overflow-hidden bg-base-200 shadow-xs relative group cursor-zoom-in">
        <img :src="activeImageUrl" :alt="hotel?.title || 'Hotel Image'" @error="handleImgError"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />

        <div
          class="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div class="p-3 bg-base-100/20 backdrop-blur-md rounded-full text-white border border-white/20">
            <Maximize2 class="size-6" />
          </div>
        </div>

        <template v-if="allImages.length > 1">
          <button @click.stop="prevImage"
            class="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-base-100/70 backdrop-blur-md text-base-content border border-base-200/40 hover:bg-base-100 shadow-sm transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer">
            <ChevronRight class="size-5" />
          </button>
          <button @click.stop="nextImage"
            class="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-base-100/70 backdrop-blur-md text-base-content border border-base-200/40 hover:bg-base-100 shadow-sm transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer">
            <ChevronLeft class="size-5" />
          </button>
        </template>
      </div>

      <div v-if="allImages.length > 1" class="relative group/thumbs">
        <button v-if="canScrollStart" @click="scrollThumbs('start')"
          class="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-xl bg-base-100/90 backdrop-blur-sm border border-base-200 shadow-sm hover:bg-base-100 transition-all opacity-0 group-hover/thumbs:opacity-100 cursor-pointer">
          <ChevronRight class="size-4" />
        </button>
        <button v-if="canScrollEnd" @click="scrollThumbs('end')"
          class="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-xl bg-base-100/90 backdrop-blur-sm border border-base-200 shadow-sm hover:bg-base-100 transition-all opacity-0 group-hover/thumbs:opacity-100 cursor-pointer">
          <ChevronLeft class="size-4" />
        </button>
        <div ref="thumbsContainer" @scroll="onThumbsScroll"
          class="w-full overflow-x-auto overflow-y-hidden py-2 -my-2 scrollbar-none">
          <div class="flex items-center gap-2 px-1">
            <button v-for="(imgUrl, index) in allImages" :key="index" @click="activeImageIdx = index"
              class="w-28 aspect-4/3 rounded-xl overflow-hidden shrink-0 border transition-all duration-300 bg-base-200 origin-center hover:scale-105 cursor-pointer"
              :class="activeImageIdx === index
                ? 'border-primary ring-4 ring-primary/10 shadow-md scale-95 opacity-100'
                : 'border-base-300 opacity-70 hover:opacity-100'">
              <img :src="imgUrl" :alt="hotel?.title || 'Thumbnail'" @error="handleImgError" class="w-full h-full object-cover pointer-events-none" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      class="lg:col-span-5 bg-base-100 text-base-content rounded-3xl p-6 lg:p-8 pe-10 flex flex-col gap-4 relative border border-base-200 shadow-sm">
      <div
        class="hidden lg:flex flex-col gap-3 absolute -left-14 top-6 bg-base-100/80 backdrop-blur-md p-2 rounded-xl border border-base-200 shadow-xs z-20">
        <button @click="toggleWish" class="p-2 hover:text-primary transition-colors bg-base-200 rounded-lg cursor-pointer"
          :class="{ 'text-error hover:text-error': isWish }" title="افزودن به علاقه‌مندی‌ها">
          <Heart class="w-4 h-4" :class="{ 'fill-error': isWish }" />
        </button>
        <button @click="subscribe" class="p-2 hover:text-primary transition-colors bg-base-200 rounded-lg cursor-pointer"
          :class="{ 'text-primary': isSubscribed }" :title="isSubscribed ? 'اطلاع‌رسانی فعال است' : 'اطلاع‌رسانی'">
          <Bell class="w-4 h-4" :class="{ 'fill-primary': isSubscribed }" />
        </button>
        <button @click="isShareOpen = true" class="p-2 hover:text-primary transition-colors bg-base-200 rounded-lg cursor-pointer" title="اشتراک‌گذاری">
          <Share2 class="w-4 h-4" />
        </button>
        <button v-if="hotel?.map_lat && hotel?.map_lng" @click="openGoogleMap"
          class="p-2 hover:text-primary transition-colors bg-base-200 rounded-lg cursor-pointer" title="مسیریابی روی نقشه گوگل">
          <Compass class="w-4 h-4" />
        </button>
      </div>

      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1.5 min-w-0">
          <div v-if="hotel?.location?.name"
            class="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            <MapPin class="size-3 shrink-0" />
            {{ hotel.location.name }}
          </div>
          <h1 class="text-xl lg:text-2xl font-bold leading-tight">{{ hotel?.title || 'نام هتل مشخص نیست' }}</h1>
          <div class="flex items-center gap-1.5">
            <div class="flex items-center gap-0.5" title="ستاره هتل">
              <Star v-for="n in starRate" :key="`hs-${n}`" class="size-3 fill-amber-400 text-amber-400" />
              <Star v-for="n in (5 - starRate)" :key="`he-${n}`" class="size-3 text-base-content/15" />
            </div>
            <span class="text-[11px] text-base-content/40 mx-1">·</span>
            <div v-if="hotel?.review_score" class="flex items-center gap-0.5">
              <Star v-for="n in ratingStars" :key="`rf-${n}`" class="size-3 fill-primary text-primary" />
              <span class="text-[11px] font-semibold text-primary mr-1">{{ hotel.review_score }}</span>
            </div>
            <span class="text-[11px] text-base-content/40">·</span>
            <span class="text-[11px] text-base-content/50">
              {{ (hotel?.reviewsLength ?? 0).toLocaleString('fa-IR') }} نظر
            </span>
          </div>
        </div>

        <div v-if="ceiledOfferPercent > 0" class="relative w-14 h-14 shrink-0">
          <div
            class="w-14 h-14 rounded-2xl bg-error text-primary-content flex flex-col items-center justify-center font-black shadow-md rotate-3 hover:rotate-0 transition-transform duration-300">
            <span class="text-lg leading-none">{{ ceiledOfferPercent.toLocaleString('fa-IR') }}٪</span>
            <span class="text-[9px] font-bold opacity-80 mt-0.5">تخفیف</span>
          </div>
        </div>
      </div>

      <button v-if="hotel?.address" @click="openGoogleMap"
        class="flex items-start gap-1.5 text-xs text-right w-full transition-colors"
        :class="hotel?.map_lat && hotel?.map_lng
          ? 'text-base-content/70 hover:text-primary cursor-pointer group/addr'
          : 'text-base-content/50 cursor-default'">
        <MapPin class="w-4 h-4 shrink-0 mt-0.5 transition-colors"
          :class="hotel?.map_lat && hotel?.map_lng ? 'text-primary group-hover/addr:text-primary/70' : 'text-base-content/40'" />
        <p class="leading-relaxed">{{ hotel.address }}</p>
      </button>

      <div v-if="hotel?.check_in_time || hotel?.check_out_time"
        class="flex items-center gap-4 flex-wrap text-[11px] text-base-content/60">
        <span v-if="hotel?.check_in_time" class="flex items-center gap-1">
          <CalendarDays class="size-3.5 text-primary" />
          ورود: ساعت {{ hotel.check_in_time }}:۰۰
        </span>
        <span v-if="hotel?.check_out_time" class="flex items-center gap-1">
          <Clock class="size-3.5 text-primary" />
          خروج: ساعت {{ hotel.check_out_time }}:۰۰
        </span>
        <span v-if="hotel?.min_day_stays && hotel.min_day_stays > 1" class="flex items-center gap-1">
          <BedDouble class="size-3.5 text-primary" />
          حداقل {{ hotel.min_day_stays.toLocaleString('fa-IR') }} شب
        </span>
      </div>

      <div v-if="amenities.length" class="space-y-2">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-base-content/50 flex items-center gap-1">
            <LayoutGrid class="size-3" />
            ویژگی‌ها و امکانات:
          </h3>
          <button 
            @click="isAmenitiesExpanded = !isAmenitiesExpanded"
            class="text-[11px] font-bold text-primary hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <span>{{ isAmenitiesExpanded ? 'بستن' : 'مشاهده همه' }}</span>
            <ChevronDown 
              class="size-3 transition-transform duration-200" 
              :class="{ 'rotate-180': isAmenitiesExpanded }" 
            />
          </button>
        </div>

        <div 
          ref="amenitiesContainer"
          class="transition-all duration-300 ease-in-out overflow-hidden"
          :class="isAmenitiesExpanded ? 'max-h-200' : 'max-h-18'"
        >
          <div class="flex flex-wrap gap-2 text-justify">
            <div v-for="name in amenities" :key="name"
              class="bg-base-200 hover:bg-base-300 transition-colors px-3 py-1.5 rounded-xl text-[11px] font-medium text-base-content/90 text-center grow basis-auto">
              {{ name }}
            </div>
            <div v-for="n in 4" :key="`spacer-${n}`" class="grow basis-auto h-0 py-0 my-0 opacity-0 pointer-events-none"></div>
          </div>
        </div>
      </div>

      <div class="mt-auto pt-4 border-t border-base-200 space-y-4">
        <div class="space-y-1 text-center lg:text-right">
          <div v-if="ceiledOfferPercent > 0 && hotel?.price_display"
            class="text-xs text-base-content/50 font-medium">
            قیمت اصلی: <span class="line-through mr-1">{{ hotel.price_display }}</span>
          </div>
          <div class="text-sm font-bold">
            شروع قیمت از:
            <span class="text-xl lg:text-2xl font-black text-primary mx-1">
              {{ hotel?.min_price_display || hotel?.price_display || 'نامشخص' }}
            </span>
          </div>
        </div>

        <button @click="scrollToRooms"
          class="btn btn-primary w-full rounded-xl h-11 font-bold shadow-xs cursor-pointer">
          مشاهده اتاق‌ها و رزرو
        </button>

        <div class="grid grid-cols-4 gap-2 text-center">
          <div class="flex flex-col items-center gap-1.5 text-base-content/60">
            <RefreshCw class="w-5 h-5 text-primary" />
            <span class="text-[11px] font-medium leading-tight">امکان کنسلی</span>
          </div>
          <div class="flex flex-col items-center gap-1.5 text-base-content/60">
            <CalendarDays class="w-5 h-5 text-primary" />
            <span class="text-[11px] font-medium leading-tight">رزرو فوری</span>
          </div>
          <div class="flex flex-col items-center gap-1.5 text-base-content/60">
            <BedDouble class="w-5 h-5 text-primary" />
            <span class="text-[11px] font-medium leading-tight">تنوع اتاق‌ها</span>
          </div>
          <div class="flex flex-col items-center gap-1.5 text-base-content/60">
            <div class="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
              <span class="text-[11px] font-black text-primary leading-none">✓</span>
            </div>
            <span class="text-[11px] font-medium leading-tight">پشتیبانی ۲۴ ساعته</span>
          </div>
        </div>
      </div>
    </div>

    <FullscreenImageViewer
      :is-open="isViewerOpen"
      :images="allImages"
      :initial-index="activeImageIdx"
      @close="isViewerOpen = false"
    />

    <ShareModal :is-open="isShareOpen" :title="hotel?.title" @close="isShareOpen = false" />
  </section>
</template>