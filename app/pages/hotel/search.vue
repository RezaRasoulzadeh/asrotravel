<!-- app/pages/hotel/index.vue -->
<script setup lang="ts">
import { SlidersHorizontal, X, Search, ChevronLeft, ChevronRight, ChevronDown, Star, SearchX, RefreshCw, WifiOff } from 'lucide-vue-next'
import { toGregorian, toJalali } from '~/utils/date'

const { seo, faqs, loading: mainLoading } = useHotelMain()

useHead({
  title: computed(() => seo.value?.title ?? 'رزرو هتل آنلاین | آسروتراول'),
  meta: [
    { name: 'description', content: computed(() => seo.value?.description ?? 'رزرو آنلاین هتل با بهترین قیمت‌ها در سراسر ایران') },
    { name: 'keywords', content: computed(() => seo.value?.keywords ?? '') },
    { property: 'og:title', content: computed(() => seo.value?.title ?? '') },
    { property: 'og:description', content: computed(() => seo.value?.description ?? '') },
    { property: 'og:image', content: computed(() => seo.value?.og_image?.image_url ?? '') },
  ],
  link: [
    { rel: 'canonical', href: computed(() => seo.value?.canonical ?? '') },
  ],
})

const PRICE_FALLBACK_MAX = 40_000_000

const {
  hotels, loading, error,
  total, totalPages, currentPage,
  filters, fetchHotels, applyFilters, goToPage, resetFilters,
} = useHotelSearch()

const {
  locations,
  propertyTypes,
  facilities,
  services,
  priceRange,
  loading: attributesLoading,
} = useHotelSearchAttributes()

const localLocation = ref(filters.value?.location ?? '')
const localName = ref(filters.value?.name ?? '')
const localStarRate = ref<number | null>(filters.value?.star_rate ?? null)
const localMinPrice = ref(filters.value?.min_price ?? 0)
const localMaxPrice = ref(filters.value?.max_price ?? PRICE_FALLBACK_MAX)
const localTerms = ref<number[]>([...(filters.value?.terms ?? [])])

const localEnterDate = ref(gregorianToJalali(filters.value?.date_from))
const localExitDate = ref(gregorianToJalali(filters.value?.date_to))

const expandedAttributes = ref<Record<string, boolean>>({})

const parseDigits = (s: string) => String(s ?? '').replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776))

watch(localEnterDate, (val) => {
  if (val != null && val !== '' && localExitDate.value != null && localExitDate.value !== '') {
    const a = parseInt(parseDigits(val).replace(/\//g, ''))
    const b = parseInt(parseDigits(localExitDate.value).replace(/\//g, ''))
    if (b < a) localExitDate.value = ''
  }
})

function gregorianToJalali(gDate: string | undefined): string {
  if (gDate == null || gDate === '') return ''
  const parts = gDate.split('-')
  if (parts.length !== 3) return ''

  const gy = parseInt(parts[0] ?? '')
  const gm = parseInt(parts[1] ?? '')
  const gd = parseInt(parts[2] ?? '')

  if (isNaN(gy) || isNaN(gm) || isNaN(gd)) return ''

  const res = toJalali(gy, gm, gd)
  return `${res.jy}/${String(res.jm).padStart(2, '0')}/${String(res.jd).padStart(2, '0')}`
}

function jalaliToGregorian(jDate: string): string {
  const normalized = parseDigits(jDate)
  const parts = normalized.split('/')
  if (parts.length !== 3) return ''

  const jy = parseInt(parts[0] ?? '')
  const jm = parseInt(parts[1] ?? '')
  const jd = parseInt(parts[2] ?? '')

  if (isNaN(jy) || isNaN(jm) || isNaN(jd)) return ''

  return toGregorian(jy, jm, jd)
}

watch(priceRange, (range) => {
  if (filters.value?.max_price == null) localMaxPrice.value = range?.max ?? PRICE_FALLBACK_MAX
  if (localMaxPrice.value > (range?.max ?? PRICE_FALLBACK_MAX)) localMaxPrice.value = range?.max ?? PRICE_FALLBACK_MAX
}, { immediate: true })

const priceMax = computed(() => priceRange.value?.max ?? PRICE_FALLBACK_MAX)

const sidebarOpen = ref(false)
const { resultHeaderVisible } = useResultHeaderScroll()

const activeFilterCount = computed(() => {
  let n = 0
  if (localLocation.value !== '') n++
  if (localName.value !== '') n++
  if (localStarRate.value != null) n++
  if (localEnterDate.value !== '') n++
  if (localExitDate.value !== '') n++
  n += localTerms.value.length
  if (localMinPrice.value > 0) n++
  if (localMaxPrice.value < priceMax.value) n++
  return n
})

function formatToman(val: number) {
  return val.toLocaleString('fa-IR') + ' تومان'
}

function toggleAttribute(key: string) {
  expandedAttributes.value = {
    ...expandedAttributes.value,
    [key]: !(expandedAttributes.value[key] ?? false),
  }
}

function applyAndClose() {
  const gDate = localEnterDate.value !== '' ? jalaliToGregorian(localEnterDate.value) : undefined
  const eDate = localExitDate.value !== '' ? jalaliToGregorian(localExitDate.value) : undefined
  const hasMinPrice = localMinPrice.value > 0
  const hasMaxPrice = localMaxPrice.value < priceMax.value
  applyFilters({
    location: localLocation.value !== '' ? localLocation.value : undefined,
    name: localName.value !== '' ? localName.value : undefined,
    star_rate: localStarRate.value,
    min_price: (hasMinPrice || hasMaxPrice) ? localMinPrice.value : null,
    max_price: (hasMinPrice || hasMaxPrice) ? localMaxPrice.value : null,
    terms: localTerms.value.length > 0 ? localTerms.value : undefined,
    date_from: gDate,
    date_to: eDate,
  })
  sidebarOpen.value = false
}

function clearAndClose() {
  localLocation.value = ''
  localName.value = ''
  localStarRate.value = null
  localTerms.value = []
  localMinPrice.value = 0
  localMaxPrice.value = priceMax.value
  localEnterDate.value = ''
  localExitDate.value = ''
  resetFilters()
  sidebarOpen.value = false
}

watch(localMinPrice, (v) => { if (v > localMaxPrice.value) localMaxPrice.value = v })
watch(localMaxPrice, (v) => { if (v < localMinPrice.value) localMinPrice.value = v })

const pages = computed(() => {
  const arr: (number | '...')[] = []
  const tp = totalPages.value
  const cp = currentPage.value
  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) arr.push(i)
  } else {
    arr.push(1)
    if (cp > 3) arr.push('...')
    for (let i = Math.max(2, cp - 1); i <= Math.min(tp - 1, cp + 1); i++) arr.push(i)
    if (cp < tp - 2) arr.push('...')
    arr.push(tp)
  }
  return arr
})
</script>

<template>
  <div class="min-h-screen bg-base-200/40 mt-16">
    <div class="sticky top-16 z-30 bg-base-200/95 backdrop-blur pt-3 pb-2 px-4 lg:px-16 max-w-960 mx-auto">
      <div class="breadcrumbs text-sm text-base-content/60">
        <ul>
          <li><NuxtLink to="/">صفحه اصلی</NuxtLink></li>
          <li><NuxtLink to="/hotel">هتل‌ها</NuxtLink></li>
          <li class="text-base-content">جستجو</li>
        </ul>
      </div>
    </div>

    <div class="px-4 lg:px-16 max-w-960 mx-auto pb-16 flex gap-6 items-start">
      <aside class="hidden lg:flex flex-col gap-4 w-72 shrink-0 bg-base-100 rounded-2xl p-5 shadow-sm border border-base-200 sticky top-35">
        <div class="flex items-center justify-between">
          <span class="font-bold text-base-content text-base">فیلترها</span>
          <button v-if="activeFilterCount > 0" class="btn btn-ghost btn-xs text-error gap-1" @click="clearAndClose">
            <X class="size-3.5" />
            پاک کردن
          </button>
        </div>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">شهر</legend>
          <select v-model="localLocation" class="select-custom">
            <option value="">همه شهرها</option>
            <option v-for="loc in locations" :key="loc?.id" :value="loc?.slug">
              {{ loc?.name }}
            </option>
          </select>
        </fieldset>

        <div class="w-full">
          <UiPersianDateRangePicker v-model:startValue="localEnterDate" v-model:endValue="localExitDate" />
        </div>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">جستجو در نام</legend>
          <input v-model="localName" type="text" class="input w-full" placeholder="نام هتل..." />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">ستاره هتل</legend>
          <div class="flex items-center gap-1.5 flex-wrap">
            <button v-for="star in [1, 2, 3, 4, 5]" :key="star" type="button"
              class="btn btn-xs gap-1 rounded-lg transition-all"
              :class="localStarRate === star ? 'btn-primary' : 'btn-ghost text-base-content/60'"
              @click="localStarRate = localStarRate === star ? null : star">
              <Star class="size-3" :class="localStarRate === star ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'" />
              {{ star.toLocaleString('fa-IR') }}
            </button>
          </div>
        </fieldset>

        <fieldset class="fieldset gap-3">
          <legend class="fieldset-legend">محدوده قیمت</legend>
          <div class="flex flex-col gap-2">
            <div class="flex justify-between text-xs text-base-content/60">
              <span>{{ formatToman(localMinPrice) }}</span>
              <span>{{ formatToman(localMaxPrice) }}</span>
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 text-xs text-base-content/50">
                <span class="shrink-0 w-8">از</span>
                <input v-model.number="localMinPrice" type="range" :min="0" :max="priceMax" :step="100_000" class="range range-primary range-xs flex-1" />
              </div>
              <div class="flex items-center gap-2 text-xs text-base-content/50">
                <span class="shrink-0 w-8">تا</span>
                <input v-model.number="localMaxPrice" type="range" :min="0" :max="priceMax" :step="100_000" class="range range-primary range-xs flex-1" />
              </div>
            </div>
          </div>
        </fieldset>

        <div v-if="attributesLoading" class="flex justify-center py-2">
          <span class="loading loading-dots loading-sm text-primary"></span>
        </div>
        <template v-else>
          <fieldset v-if="propertyTypes.length > 0" class="fieldset gap-2">
            <legend class="fieldset-legend w-full">
              <button type="button" class="flex w-full items-center justify-between gap-2 text-start cursor-pointer"
                :aria-expanded="expandedAttributes['propertyTypes'] ? 'true' : 'false'"
                @click="toggleAttribute('propertyTypes')">
                <span class="flex items-center gap-1.5">
                  <ChevronDown class="size-3.5 text-primary transition-transform duration-200" :class="expandedAttributes['propertyTypes'] ? 'rotate-180' : ''" />
                  <span>نوع اقامتگاه</span>
                </span>
                <span class="text-xs font-normal text-base-content/40">
                  {{ propertyTypes.length.toLocaleString('fa-IR') }}
                </span>
              </button>
            </legend>
            <Transition name="terms-expand">
              <div v-if="expandedAttributes['propertyTypes']" class="flex flex-col gap-2 max-h-44 overflow-y-auto pe-1">
                <label v-for="term in propertyTypes" :key="term?.id" class="flex items-center gap-2 text-sm text-base-content/70 cursor-pointer">
                  <input v-model="localTerms" type="checkbox" class="checkbox checkbox-primary checkbox-sm" :value="term?.id" />
                  <span>{{ term?.name }}</span>
                </label>
              </div>
            </Transition>
          </fieldset>

          <fieldset v-if="facilities.length > 0" class="fieldset gap-2">
            <legend class="fieldset-legend w-full">
              <button type="button" class="flex w-full items-center justify-between gap-2 text-start cursor-pointer"
                :aria-expanded="expandedAttributes['facilities'] ? 'true' : 'false'"
                @click="toggleAttribute('facilities')">
                <span class="flex items-center gap-1.5">
                  <ChevronDown class="size-3.5 text-primary transition-transform duration-200" :class="expandedAttributes['facilities'] ? 'rotate-180' : ''" />
                  <span>امکانات هتل</span>
                </span>
                <span class="text-xs font-normal text-base-content/40">
                  {{ facilities.length.toLocaleString('fa-IR') }}
                </span>
              </button>
            </legend>
            <Transition name="terms-expand">
              <div v-if="expandedAttributes['facilities']" class="flex flex-col gap-2 max-h-44 overflow-y-auto pe-1">
                <label v-for="term in facilities" :key="term?.id" class="flex items-center gap-2 text-sm text-base-content/70 cursor-pointer">
                  <input v-model="localTerms" type="checkbox" class="checkbox checkbox-primary checkbox-sm" :value="term?.id" />
                  <span>{{ term?.name }}</span>
                </label>
              </div>
            </Transition>
          </fieldset>

          <fieldset v-if="services.length > 0" class="fieldset gap-2">
            <legend class="fieldset-legend w-full">
              <button type="button" class="flex w-full items-center justify-between gap-2 text-start cursor-pointer"
                :aria-expanded="expandedAttributes['services'] ? 'true' : 'false'" @click="toggleAttribute('services')">
                <span class="flex items-center gap-1.5">
                  <ChevronDown class="size-3.5 text-primary transition-transform duration-200" :class="expandedAttributes['services'] ? 'rotate-180' : ''" />
                  <span>خدمات هتل</span>
                </span>
                <span class="text-xs font-normal text-base-content/40">
                  {{ services.length.toLocaleString('fa-IR') }}
                </span>
              </button>
            </legend>
            <Transition name="terms-expand">
              <div v-if="expandedAttributes['services']" class="flex flex-col gap-2 max-h-44 overflow-y-auto pe-1">
                <label v-for="term in services" :key="term?.id" class="flex items-center gap-2 text-sm text-base-content/70 cursor-pointer">
                  <input v-model="localTerms" type="checkbox" class="checkbox checkbox-primary checkbox-sm" :value="term?.id" />
                  <span>{{ term?.name }}</span>
                </label>
              </div>
            </Transition>
          </fieldset>
        </template>

        <button class="btn btn-primary w-full gap-2" @click="applyAndClose">
          <Search class="size-4" />
          اعمال فیلتر
        </button>
      </aside>

      <div class="lg:hidden fixed bottom-6 inset-x-4 z-40 flex justify-start">
        <button class="btn btn-primary shadow-lg gap-2 rounded-full px-6" @click="sidebarOpen = true">
          <SlidersHorizontal class="size-4" />
          فیلترها
          <span v-if="activeFilterCount > 0" class="badge badge-error badge-sm">
            {{ activeFilterCount.toLocaleString('fa-IR') }}
          </span>
        </button>
      </div>

      <Transition name="fade">
        <div v-if="sidebarOpen" class="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" @click="sidebarOpen = false" />
      </Transition>

      <Transition name="slide-up">
        <div v-if="sidebarOpen" class="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-base-100 rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto flex flex-col gap-4">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-base-content text-base">فیلترها</span>
            <button class="btn btn-ghost btn-sm btn-circle" @click="sidebarOpen = false">
              <X class="size-4" />
            </button>
          </div>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">شهر</legend>
            <select v-model="localLocation" class="select-custom">
              <option value="">همه شهرها</option>
              <option v-for="loc in locations" :key="loc?.id" :value="loc?.slug">{{ loc?.name }}</option>
            </select>
          </fieldset>

          <div class="w-full">
            <UiPersianDateRangePicker v-model:startValue="localEnterDate" v-model:endValue="localExitDate" />
          </div>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">جستجو در نام</legend>
            <input v-model="localName" type="text" class="input w-full" placeholder="نام هتل..." />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">ستاره هتل</legend>
            <div class="flex items-center gap-1.5 flex-wrap">
              <button v-for="star in [1, 2, 3, 4, 5]" :key="star" type="button"
                class="btn btn-xs gap-1 rounded-lg transition-all"
                :class="localStarRate === star ? 'btn-primary' : 'btn-ghost text-base-content/60'"
                @click="localStarRate = localStarRate === star ? null : star">
                <Star class="size-3" :class="localStarRate === star ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'" />
                {{ star.toLocaleString('fa-IR') }}
              </button>
            </div>
          </fieldset>

          <fieldset class="fieldset gap-3">
            <legend class="fieldset-legend">محدوده قیمت</legend>
            <div class="flex justify-between text-xs text-base-content/60">
              <span>{{ formatToman(localMinPrice) }}</span>
              <span>{{ formatToman(localMaxPrice) }}</span>
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 text-xs text-base-content/50">
                <span class="shrink-0 w-8">از</span>
                <input v-model.number="localMinPrice" type="range" :min="0" :max="priceMax" :step="100_000" class="range range-primary range-xs flex-1" />
              </div>
              <div class="flex items-center gap-2 text-xs text-base-content/50">
                <span class="shrink-0 w-8">تا</span>
                <input v-model.number="localMaxPrice" type="range" :min="0" :max="priceMax" :step="100_000" class="range range-primary range-xs flex-1" />
              </div>
            </div>
          </fieldset>

          <div v-if="attributesLoading" class="flex justify-center py-2">
            <span class="loading loading-dots loading-sm text-primary"></span>
          </div>
          <template v-else>
            <fieldset v-if="propertyTypes.length > 0" class="fieldset gap-2">
              <legend class="fieldset-legend w-full">
                <button type="button" class="btn flex w-full items-center justify-between gap-2 text-start" @click="toggleAttribute('propertyTypes')">
                  <span class="flex items-center gap-1.5">
                    <ChevronDown class="size-3.5 text-primary transition-transform duration-200" :class="expandedAttributes['propertyTypes'] ? 'rotate-180' : ''" />
                    <span>نوع اقامتگاه</span>
                  </span>
                  <span class="text-xs font-normal text-base-content/40">{{ propertyTypes.length.toLocaleString('fa-IR') }}</span>
                </button>
              </legend>
              <Transition name="terms-expand">
                <div v-if="expandedAttributes['propertyTypes']" class="grid grid-cols-2 gap-2">
                  <label v-for="term in propertyTypes" :key="term?.id" class="flex items-center gap-2 text-sm text-base-content/70 cursor-pointer">
                    <input v-model="localTerms" type="checkbox" class="checkbox checkbox-primary checkbox-sm" :value="term?.id" />
                    <span>{{ term?.name }}</span>
                  </label>
                </div>
              </Transition>
            </fieldset>

            <fieldset v-if="facilities.length > 0" class="fieldset gap-2">
              <legend class="fieldset-legend w-full">
                <button type="button" class="btn flex w-full items-center justify-between gap-2 text-start" @click="toggleAttribute('facilities')">
                  <span class="flex items-center gap-1.5">
                    <ChevronDown class="size-3.5 text-primary transition-transform duration-200" :class="expandedAttributes['facilities'] ? 'rotate-180' : ''" />
                    <span>امکانات هتل</span>
                  </span>
                  <span class="text-xs font-normal text-base-content/40">{{ facilities.length.toLocaleString('fa-IR') }}</span>
                </button>
              </legend>
              <Transition name="terms-expand">
                <div v-if="expandedAttributes['facilities']" class="grid grid-cols-2 gap-2">
                  <label v-for="term in facilities" :key="term?.id" class="flex items-center gap-2 text-sm text-base-content/70 cursor-pointer">
                    <input v-model="localTerms" type="checkbox" class="checkbox checkbox-primary checkbox-sm" :value="term?.id" />
                    <span>{{ term?.name }}</span>
                  </label>
                </div>
              </Transition>
            </fieldset>

            <fieldset v-if="services.length > 0" class="fieldset gap-2">
              <legend class="fieldset-legend w-full">
                <button type="button" class="btn flex w-full items-center justify-between gap-2 text-start" @click="toggleAttribute('services')">
                  <span class="flex items-center gap-1.5">
                    <ChevronDown class="size-3.5 text-primary transition-transform duration-200" :class="expandedAttributes['services'] ? 'rotate-180' : ''" />
                    <span>خدمات هتل</span>
                  </span>
                  <span class="text-xs font-normal text-base-content/40">{{ services.length.toLocaleString('fa-IR') }}</span>
                </button>
              </legend>
              <Transition name="terms-expand">
                <div v-if="expandedAttributes['services']" class="grid grid-cols-2 gap-2">
                  <label v-for="term in services" :key="term?.id" class="flex items-center gap-2 text-sm text-base-content/70 cursor-pointer">
                    <input v-model="localTerms" type="checkbox" class="checkbox checkbox-primary checkbox-sm" :value="term?.id" />
                    <span>{{ term?.name }}</span>
                  </label>
                </div>
              </Transition>
            </fieldset>
          </template>

          <div class="flex gap-2 mt-2">
            <button class="btn btn-ghost flex-1 gap-1 text-error" @click="clearAndClose">
              <X class="size-4" /> پاک کردن
            </button>
            <button class="btn btn-primary flex-1 gap-2" @click="applyAndClose">
              <Search class="size-4" /> اعمال فیلتر
            </button>
          </div>
        </div>
      </Transition>

      <div class="flex-1 min-w-0 flex flex-col gap-4">
        <div
          class="sticky top-35 z-20 flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-base-100 p-4 rounded-2xl border border-base-200/60 shadow-sm transition-all duration-200"
          :class="resultHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0 pointer-events-none'">
          <p class="text-sm text-base-content/60 shrink-0">
            <template v-if="!loading">
              <span class="font-semibold text-base-content">{{ total.toLocaleString('fa-IR') }}</span>
              هتل یافت شد
            </template>
            <template v-else>
              <span class="loading loading-dots loading-xs align-middle"></span>
            </template>
          </p>

          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span class="text-xs text-base-content/50 ml-1 whitespace-nowrap">مرتب‌سازی:</span>

            <button class="btn btn-xs rounded-lg font-medium transition-all"
              :class="(filters.sort == null || filters.sort === 'default') ? 'btn-primary' : 'btn-ghost text-base-content/70'"
              @click="applyFilters({ sort: 'default' })">
              پیش‌فرض
            </button>
            <button class="btn btn-xs rounded-lg font-medium transition-all"
              :class="filters.sort === 'min-price' ? 'btn-primary' : 'btn-ghost text-base-content/70'"
              @click="applyFilters({ sort: 'min-price' })">
              کمترین قیمت
            </button>
            <button class="btn btn-xs rounded-lg font-medium transition-all"
              :class="filters.sort === 'max-price' ? 'btn-primary' : 'btn-ghost text-base-content/70'"
              @click="applyFilters({ sort: 'max-price' })">
              بیشترین قیمت
            </button>
            <button class="btn btn-xs rounded-lg font-medium transition-all"
              :class="filters.sort === 'max-rate' ? 'btn-primary' : 'btn-ghost text-base-content/70'"
              @click="applyFilters({ sort: 'max-rate' })">
              بیشترین امتیاز
            </button>
            <button class="btn btn-xs rounded-lg font-medium transition-all"
              :class="filters.sort === 'star_desc' ? 'btn-primary' : 'btn-ghost text-base-content/70'"
              @click="applyFilters({ sort: 'star_desc' })">
              بیشترین ستاره
            </button>
          </div>
        </div>

        <div>
          <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pt-6">
            <div v-for="n in 6" :key="n" class="bg-base-100 rounded-2xl overflow-hidden border border-base-200 shadow-sm flex flex-col h-110 animate-pulse">
              <div class="h-48 shrink-0 bg-base-300/70" />
              <div class="flex flex-col flex-1 p-4 gap-3">
                <div class="h-5 w-4/5 rounded-md bg-base-300/70" />
                <div class="flex items-center gap-2">
                  <div class="h-4 w-24 rounded-md bg-base-300/60" />
                  <div class="h-4 w-20 rounded-md bg-base-300/60" />
                </div>
                <div class="h-4 w-full rounded-md bg-base-300/50" />
                <div class="flex flex-wrap gap-1 min-h-6">
                  <div class="h-5 w-14 rounded-md bg-base-300/50" />
                  <div class="h-5 w-16 rounded-md bg-base-300/50" />
                  <div class="h-5 w-12 rounded-md bg-base-300/50" />
                </div>
                <div class="mt-auto pt-3 border-t border-base-200/70 flex items-center justify-between gap-3">
                  <div class="h-4 flex-1 rounded-md bg-base-300/50" />
                  <div class="h-4 w-20 rounded-md bg-base-300/50" />
                </div>
                <div class="flex items-center justify-between gap-4">
                  <div class="flex flex-col gap-1.5">
                    <div class="h-3 w-20 rounded-md bg-base-300/50" />
                    <div class="h-5 w-28 rounded-md bg-base-300/70" />
                  </div>
                  <div class="h-8 w-20 rounded-xl bg-base-300/70" />
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="error != null" class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
            <div class="size-14 rounded-full bg-error/10 flex items-center justify-center">
              <WifiOff class="size-6 text-error" />
            </div>
            <p class="font-medium text-base-content">خطا در دریافت اطلاعات</p>
            <p class="text-sm text-base-content/50 max-w-xs leading-relaxed">ارتباط با سرور برقرار نشد. اینترنت خود را بررسی کرده و دوباره تلاش کنید.</p>
            <button class="btn btn-sm btn-error btn-soft gap-2 mt-1" @click="fetchHotels()">
              <RefreshCw class="size-4" />
              تلاش مجدد
            </button>
          </div>

          <div v-else-if="hotels.length === 0" class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
            <div class="size-14 rounded-full bg-base-200 flex items-center justify-center">
              <SearchX class="size-6 text-base-content/40" />
            </div>
            <p class="font-medium text-base-content">نتیجه‌ای یافت نشد</p>
            <p class="text-sm text-base-content/50 max-w-xs leading-relaxed">هیچ موردی با فیلترهای انتخابی شما مطابقت ندارد.</p>
          </div>

          <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pt-6">
            <HotelSearchCard v-for="hotel in hotels" :key="hotel?.id" :hotel="hotel" />
          </div>

          <div v-if="error == null && hotels.length > 0 && totalPages > 1" class="flex justify-center items-center gap-1 mt-4 flex-wrap">
            <button class="btn btn-ghost btn-sm btn-circle" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
              <ChevronRight class="size-4" />
            </button>

            <template v-for="p in pages" :key="p">
              <span v-if="p === '...'" class="px-2 text-base-content/40 text-sm">…</span>
              <button v-else class="btn btn-sm btn-circle" :class="p === currentPage ? 'btn-primary' : 'btn-ghost'" @click="goToPage(p as number)">
                {{ (p as number).toLocaleString('fa-IR') }}
              </button>
            </template>

            <button class="btn btn-ghost btn-sm btn-circle" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">
              <ChevronLeft class="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <UiFAQ title="سوالات متداول رزرو هتل" :items="faqs" :loading="mainLoading" />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.terms-expand-enter-active,
.terms-expand-leave-active {
  overflow: hidden;
  transition:
    max-height 0.22s ease,
    opacity 0.18s ease,
    transform 0.22s ease;
}

.terms-expand-enter-from,
.terms-expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-0.25rem);
}

.terms-expand-enter-to,
.terms-expand-leave-from {
  max-height: 11rem;
  opacity: 1;
  transform: translateY(0);
}
</style>