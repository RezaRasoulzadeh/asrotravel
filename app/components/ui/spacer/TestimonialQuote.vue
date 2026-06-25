// components/ui/spacer/TestimonialQuote.vue
<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  quotes?: Array<{
    text: string
    author: string
    location: string
    service: string
    rating: number
  }>
  quoteIndex?: number | null
  autoplayInterval?: number
}>(), {
  quotes: () => [
    {
      text: 'با آسرو سفر به سرعین رو خیلی راحت‌تر برنامه‌ریزی کردیم. هتل رویال پارک رو رزرو کردیم و بلیط آبدرمانی‌شم از همون سایت گرفتیم. همه چیز دقیقاً همون چیزی بود که توی سایت دیدیم.',
      author: 'سارا محمدی',
      location: 'تهران',
      service: 'هتل + آبدرمانی',
      rating: 5,
    },
    {
      text: 'اولین باری بود از یه سایت ایرانی رزرو هتل می‌کردم و واقعاً خوشم اومد. قیمت‌ها شفاف بود، تخفیف واقعی داشت و پشتیبانی سریع مشکلم رو حل کرد.',
      author: 'علی رضایی',
      location: 'اصفهان',
      service: 'هتل',
      rating: 5,
    },
    {
      text: 'با بچه‌ها رفتیم پارک آبی ایستان‌لند. بلیط رو از آسرو گرفتیم با تخفیف خوب. مجموعه عالی بود، بچه‌ها کلی حال کردن. حتماً دوباره میریم.',
      author: 'مریم حسینی',
      location: 'تبریز',
      service: 'مجتمع تفریحی',
      rating: 5,
    },
    {
      text: 'قیمت‌ها شفافه، تخفیف‌ها واقعیه و تصاویر دقیقاً با واقعیت تطابق داره. هم هتل رزرو کردم هم بلیط استخر گرفتم. دیگه هیچ جای دیگه‌ای رزرو نمی‌کنم.',
      author: 'نیلوفر کریمی',
      location: 'تبریز',
      service: 'هتل + استخر',
      rating: 5,
    },
    {
      text: 'آسرو رو به همه دوستام معرفی کردم. یه پلتفرم که هم هتل داره، هم استخر، هم جاهای تفریحی. دیگه نیازی نیست چند سایت مختلف بگردی.',
      author: 'رضا کاظمی',
      location: 'مشهد',
      service: 'استخر',
      rating: 5,
    }
  ],
  quoteIndex: null,
  autoplayInterval: 5000
})

const activeIndex = ref(props.quoteIndex !== null ? props.quoteIndex : 0)
const activeQuote = computed(() => props.quotes?.[activeIndex.value])
let timer: ReturnType<typeof setInterval> | null = null

function prev() {
  if (!props.quotes?.length) return
  activeIndex.value = (activeIndex.value - 1 + props.quotes.length) % props.quotes.length
  resetAutoplay()
}

function next() {
  if (!props.quotes?.length) return
  activeIndex.value = (activeIndex.value + 1) % props.quotes.length
}

function handleDotClick(index: number) {
  activeIndex.value = index
  resetAutoplay()
}

function startAutoplay() {
  stopAutoplay()
  timer = setInterval(next, props.autoplayInterval)
}

function stopAutoplay() {
  if (timer) clearInterval(timer)
}

function resetAutoplay() {
  startAutoplay()
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<template>
  <section 
    class="relative py-20 overflow-hidden bg-base-200"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
  >
    <div class="absolute top-6 inset-s-1/2 -translate-x-1/2 text-[12rem] leading-none
                font-serif text-primary/6 select-none pointer-events-none">
      "
    </div>

    <div class="relative max-w-4xl mx-auto px-4">
      <div class="text-center mb-2">
        <p class="text-xs font-bold tracking-widest text-primary uppercase">نظرات کاربران</p>
      </div>

      <div v-if="activeQuote" class="mt-10 flex flex-col items-center gap-8 text-center">
        <p class="text-lg md:text-xl text-base-content/80 leading-loose font-medium max-w-3xl min-h-22">
          {{ activeQuote.text }}
        </p>

        <div class="flex gap-1">
          <svg
            v-for="n in activeQuote.rating"
            :key="n"
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 fill-yellow-400"
            viewBox="0 0 24 24"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center
                      text-white font-black text-lg shadow-lg shadow-primary/30">
            {{ activeQuote.author.charAt(0) }}
          </div>
          <div class="text-start">
            <p class="font-bold text-base-content">{{ activeQuote.author }}</p>
            <div class="flex items-center gap-2 mt-0.5 flex-wrap">
              <span class="text-xs text-base-content/50">{{ activeQuote.location }}</span>
              <span class="text-xs bg-primary/10 text-primary rounded-lg px-2 py-0.5 font-medium">
                {{ activeQuote.service }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4 mt-2">
          <button
            class="btn btn-ghost btn-sm btn-circle border border-base-300 hover:border-primary hover:text-primary"
            @click="prev"
            aria-label="قبلی"
          >
            <ChevronRight class="size-4" />
          </button>

          <div class="flex gap-2">
            <button
              v-for="(_, i) in quotes"
              :key="i"
              class="rounded-full transition-all duration-300"
              :class="i === activeIndex
                ? 'w-6 h-2 bg-primary'
                : 'w-2 h-2 bg-base-300 hover:bg-primary/40'"
              @click="handleDotClick(i)"
              :aria-label="`نظر ${i + 1}`"
            />
          </div>

          <button
            class="btn btn-ghost btn-sm btn-circle border border-base-300 hover:border-primary hover:text-primary"
            @click="next"
            aria-label="بعدی"
          >
            <ChevronLeft class="size-4" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>