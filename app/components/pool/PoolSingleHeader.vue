// components/pool/PoolSingleHeader.vue
<script setup lang="ts">
import {
  MapPin, Calendar, RefreshCw, Clock,
  Heart, Bell, Share2, Compass,
  Star, Maximize2, Info, ChevronRight, ChevronLeft,
  Users, AlertTriangle,
  ChevronDown,
  LayoutGrid
} from 'lucide-vue-next'
import type { GalleryImage, PoolSingleWithSanse } from '~/types/poolSingle.types'
import FullscreenImageViewer from '../ui/FullscreenImageViewer.vue';
import ShareModal from '../ui/ShareModal.vue';

const props = defineProps<{
  pool: PoolSingleWithSanse
  gallery: GalleryImage[]
  is_vip?: boolean
}>()

const poolId = computed(() => props.pool.id ?? null)
const poolWishList = computed(() => props.pool.wish_list)
const { isWish, toggleWish } = useWish('Pool', poolId, poolWishList)
const { isSubscribed, subscribe } = useNotifySubscription('Pool', poolId)
const isShareOpen = ref(false)

const serviceCategories = computed(() => {
  const cats: string[] = []
  const services = props.pool.services?.ticket
  if (!services) return cats
  for (const category of Object.values(services)) {
    for (const genderGroup of category) {
      for (const gender of Object.keys(genderGroup)) {
        if (!cats.includes(gender)) cats.push(gender)
      }
    }
  }
  return cats
})

const allImages = computed(() => {
  const list: string[] = []
  props.gallery?.forEach(img => {
    if (img?.image_url && !list.includes(img.image_url)) list.push(img.image_url)
  })
  if (!list.length) list.push('/placeholder.png')
  return list
})

const activeImageIdx = ref(0)
const isViewerOpen = ref(false)

const activeImageUrl = computed(() => {
  return allImages.value[activeImageIdx.value] || '/images/pool-placeholder.jpg'
})

const nextImage = () => {
  if (!allImages.value.length) return
  activeImageIdx.value = (activeImageIdx.value + 1) % allImages.value.length
}

const prevImage = () => {
  if (!allImages.value.length) return
  activeImageIdx.value = (activeImageIdx.value - 1 + allImages.value.length) % allImages.value.length
}

const scrollToSans = () => {
  const element = document.getElementById('sans-section')
  if (element) {
    const headerOffset = 100
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.scrollY - headerOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}
const ceiledOfferPercent = computed(() => {
  return props.pool.max_offer_percent ? Math.ceil(props.pool.max_offer_percent) : 0
})

const ratingStars = computed(() => {
  const score = props.pool.review_score ? Math.round(Number(props.pool.review_score)) : 5
  return Math.min(Math.max(score, 1), 5)
})

const openGoogleMap = () => {
  if (!props.pool.map_lat || !props.pool.map_lng) return
  const url = `https://www.google.com/maps/search/?api=1&query=${props.pool.map_lat},${props.pool.map_lng}`
  window.open(url, '_blank')
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
  const el = thumbsContainer.value
  if (!el) return
  el.scrollBy({ left: dir === 'start' ? 200 : -200, behavior: 'smooth' })
}
const isTermsExpanded = ref(false)
const termsContainer = ref<HTMLElement | null>(null)
const termsHasOverflow = ref(false)

onMounted(() => {
  if (!termsContainer.value) return
  const observer = new ResizeObserver(() => {
    const el = termsContainer.value
    if (el) termsHasOverflow.value = el.scrollHeight > el.clientHeight
  })
  observer.observe(termsContainer.value)
})

onMounted(() => {
  nextTick(() => {
    const el = thumbsContainer.value
    if (!el) return
    onThumbsScroll()
    canScrollEnd.value = el.scrollWidth > el.clientWidth
  })
})
watch(allImages, () => nextTick(onThumbsScroll))
</script>

<template>
  <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full select-none">

    <div class="lg:col-span-7 flex flex-col gap-4">

      <div @click="isViewerOpen = true"
        class="w-full aspect-video rounded-3xl overflow-hidden bg-base-200 shadow-xs relative group cursor-zoom-in">
        <img :src="activeImageUrl" :alt="pool.title"
          class="w-full h-full object-cover hero-img transition-transform duration-500 group-hover:scale-103" />

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
              <img :src="imgUrl" :alt="pool.title" class="w-full h-full object-cover pointer-events-none" />
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
          :class="{ 'text-error hover:text-error': isWish }"
          title="افزودن به علاقه‌مندی‌ها">
          <Heart class="w-4 h-4" :class="{ 'fill-error': isWish }" />
        </button>
        <button @click="subscribe" class="p-2 hover:text-primary transition-colors bg-base-200 rounded-lg cursor-pointer"
          :class="{ 'text-primary': isSubscribed }"
          :title="isSubscribed ? 'اطلاع‌رسانی فعال است' : 'اطلاع‌رسانی'">
          <Bell class="w-4 h-4" :class="{ 'fill-primary': isSubscribed }" />
        </button>
        <button @click="isShareOpen = true" class="p-2 hover:text-primary transition-colors bg-base-200 rounded-lg cursor-pointer"
          title="اشتراک‌گذاری">
          <Share2 class="w-4 h-4" />
        </button>
        <button v-if="pool.map_lat && pool.map_lng" @click="openGoogleMap"
          class="p-2 hover:text-primary transition-colors bg-base-200 rounded-lg cursor-pointer"
          title="مسیریابی روی نقشه گوگل">
          <Compass class="w-4 h-4" />
        </button>
      </div>

      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1.5 min-w-0">
          <div v-if="pool.location?.name"
            class="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            <MapPin class="size-3 shrink-0" />
            {{ pool.location.name }}
          </div>
          <h1 class="text-xl lg:text-2xl font-bold leading-tight">{{ pool.title }}</h1>
          <div class="flex items-center gap-1.5">
            <div class="flex items-center gap-0.5">
              <Star v-for="n in ratingStars" :key="`sf-${n}`" class="size-3.5 fill-amber-500 text-amber-500" />
              <Star v-for="n in (5 - ratingStars)" :key="`se-${n}`" class="size-3.5 text-base-content/20" />
            </div>
            <span class="text-[11px] font-semibold text-amber-500">{{ pool.review_score }}</span>
            <span class="text-[11px] text-base-content/40">·</span>
            <span class="text-[11px] text-base-content/50">{{ pool.reviewsLength || 0 }} نظر</span>
          </div>
        </div>

        <div v-if="ceiledOfferPercent > 0" class="relative w-14 h-14 shrink-0">
          <div
            class="w-14 h-14 rounded-2xl bg-error text-primary-content flex flex-col items-center justify-center font-black shadow-md rotate-3 hover:rotate-0 transition-transform duration-300">
            <span class="text-lg leading-none">{{ ceiledOfferPercent }}٪</span>
            <span class="text-[9px] font-bold opacity-80 mt-0.5">تخفیف</span>
          </div>
        </div>
      </div>

      <button v-if="pool.address" @click="openGoogleMap"
        class="flex items-start gap-1.5 text-xs text-right w-full transition-colors"
        :class="pool.map_lat && pool.map_lng ? 'text-base-content/70 hover:text-primary cursor-pointer group/addr' : 'text-base-content/50 cursor-default'">
        <MapPin class="w-4 h-4 shrink-0 mt-0.5 transition-colors"
          :class="pool.map_lat && pool.map_lng ? 'text-primary group-hover/addr:text-primary/70' : 'text-base-content/40'" />
        <p class="leading-relaxed">{{ pool.address }}</p>
      </button>

      <div v-if="pool.for_season" class="flex items-center gap-2 flex-wrap">
        <span class="text-xs font-bold text-base-content/50">فصل مناسب:</span>
        <span v-if="pool.for_season.includes('summer')"
          class="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full">☀️
          تابستان</span>
        <span v-if="pool.for_season.includes('fall')"
          class="inline-flex items-center gap-1 text-[11px] font-medium bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full">🍂
          پاییز</span>
        <span v-if="pool.for_season.includes('spring')"
          class="inline-flex items-center gap-1 text-[11px] font-medium bg-green-500/10 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-full">🌸
          بهار</span>
        <span v-if="pool.for_season.includes('winter')"
          class="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full">❄️
          زمستان</span>
      </div>

      <div v-if="serviceCategories.length" class="space-y-2">
        <h3 class="text-xs font-bold text-base-content/50">نوع سرویس:</h3>
        <div class="flex flex-wrap gap-2">
          <div v-for="cat in serviceCategories" :key="cat"
            class="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-[11px] font-medium">
            <Users class="size-3" />
            {{ cat }}
          </div>
        </div>
      </div>

<div v-if="pool.terms?.length" class="space-y-2">
  <div class="flex items-center justify-between">
    <h3 class="text-xs font-bold text-base-content/50 flex items-center gap-1">
      <LayoutGrid class="size-3" />
      ویژگی‌ها و امکانات:
    </h3>
    <button
    v-if="termsHasOverflow"
      @click="isTermsExpanded = !isTermsExpanded"
      class="text-[11px] font-bold text-primary hover:underline cursor-pointer flex items-center gap-0.5"
    >
      <span>{{ isTermsExpanded ? 'بستن' : 'مشاهده همه' }}</span>
      <ChevronDown
        class="size-3 transition-transform duration-200"
        :class="{ 'rotate-180': isTermsExpanded }"
      />
    </button>
  </div>

  <div
    ref="termsContainer"
    class="transition-all duration-300 ease-in-out overflow-hidden"
    :class="isTermsExpanded ? 'max-h-125' : 'max-h-20'"
  >
    <div class="flex flex-wrap gap-2">
      <div v-for="item in pool.terms" :key="item.id"
        class="bg-base-200 hover:bg-base-300 transition-colors px-3 py-1.5 rounded-xl text-[11px] font-medium text-base-content/90 text-center grow basis-auto">
        {{ item.name }}
      </div>
      <div v-for="n in 4" :key="`spacer-${n}`" class="grow basis-auto h-0 py-0 my-0 opacity-0 pointer-events-none"></div>
    </div>
  </div>
</div>

<div v-else class="flex items-center gap-1.5 text-[11px] text-base-content/40">
  <Info class="size-3.5 shrink-0" />
  <span>اطلاعات ویژگی‌ها ثبت نشده است</span>
</div>

      <div v-if="pool.cancel_policy"
        class="flex items-start gap-2 bg-warning/10 border border-warning/20 rounded-2xl px-3 py-2.5">
        <AlertTriangle class="size-3.5 text-warning shrink-0 mt-0.5" />
        <p class="text-[11px] text-base-content/70 leading-relaxed">کنسلی فقط قبل از پذیرش بلیط در استخر امکان‌پذیر است.
        </p>
      </div>

      <div class="mt-auto pt-4 border-t border-base-200 space-y-4">
        <div class="space-y-1 text-center lg:text-right">
          <div v-if="pool.min_price_display && ceiledOfferPercent > 0" class="text-xs text-base-content/50 font-medium">
            ارزش واقعی: <span class="line-through mr-1">{{ pool.min_price_display }}</span>
          </div>
          <div class="text-sm font-bold">
            پرداختی شما:
            <span class="text-xl lg:text-2xl font-black text-primary mx-1">
              {{ pool.price_with_offer_display || pool.min_price_display || formatPrice(pool.min_price) || 'غیر قابل رزرو' }}
            </span>
          </div>
        </div>

        <button @click="scrollToSans" :disabled="pool.service_active === 0"
          class="btn btn-primary w-full rounded-xl h-11 font-bold shadow-xs cursor-pointer disabled:bg-base-300 disabled:text-base-content/40 disabled:border-transparent disabled:cursor-not-allowed">
          {{ pool.service_active === 0 ? 'غیر قابل رزرو/خرید' : is_vip ? 'خرید بلیط' : 'انتخاب و رزرو' }}
        </button>

        <div class="grid grid-cols-4 gap-2 text-center">
          <div class="flex flex-col items-center gap-1.5 text-base-content/60">
            <RefreshCw class="w-5 h-5 text-primary" />
            <span class="text-[11px] font-medium leading-tight">امکان کنسول آنی</span>
          </div>
          <div class="flex flex-col items-center gap-1.5 text-base-content/60">
            <Calendar class="w-5 h-5 text-primary" />
            <span class="text-[11px] font-medium leading-tight">اعتبار تا پایان سال</span>
          </div>
          <div class="flex flex-col items-center gap-1.5 text-base-content/60">
            <Clock class="w-5 h-5 text-primary" />
            <span class="text-[11px] font-medium leading-tight">صدور و استفاده آنی</span>
          </div>
          <div class="flex flex-col items-center gap-1.5 text-base-content/60">
            <div class="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
              <span class="text-[11px] font-black text-primary leading-none">✓</span>
            </div>
            <span class="text-[11px] font-medium leading-tight">بدون نیاز به چاپ</span>
          </div>
        </div>
      </div>

    </div>

    <FullscreenImageViewer :is-open="isViewerOpen" :images="allImages" :initial-index="activeImageIdx"
      @close="isViewerOpen = false" />

    <ShareModal :is-open="isShareOpen" :title="pool.title" @close="isShareOpen = false" />

  </section>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}

.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.dir-ltr {
  direction: ltr;
  text-align: right;
}
</style>