// pages/ticket/search.vue
<script setup lang="ts">
import { SlidersHorizontal, X, Search, ChevronLeft, ChevronRight, RefreshCw, WifiOff, SearchX } from 'lucide-vue-next'
import SearchCard from '~/components/ticket/SearchCard.vue'
import FAQ from '~/components/ui/FAQ.vue'

const PRICE_FALLBACK_MAX = 40_000_000

const { options } = useSearchOptions()
const { seo, faqs, loading: mainLoading } = useTicketMain()

const {
  tickets, loading, error,
  total, totalPages, currentPage,
  filters, fetchTickets, applyFilters, goToPage, resetFilters,
} = useTicketSearch()

const {
  categories, priceRange,
  fetchAttributes
} = useTicketSearchAttributes()

useSeoMeta({
  title: () => seo.value?.title ?? 'رزرو آنلاین بلیط تفریحات',
  description: () => seo.value?.description ?? '',
  keywords: () => seo.value?.keywords ?? '',
  ogTitle: () => seo.value?.title ?? '',
  ogDescription: () => seo.value?.description ?? '',
  ogImage: () => seo.value?.og_image?.image_url ?? '',
})

useHead({
  link: [
    { rel: 'canonical', href: () => seo.value?.canonical ?? '' },
  ],
})

const localDestination = ref(filters.value.location ?? '')
const localCategory = ref('')
const localName = ref(filters.value.name ?? '')
const localMinPrice = ref(filters.value.min_price ?? 0)
const localMaxPrice = ref(filters.value.max_price ?? PRICE_FALLBACK_MAX)
const localTerms = ref<number[]>([...(filters.value.terms ?? [])])

const sidebarOpen = ref(false)
const resultHeaderVisible = ref(true)

const priceMax = computed(() => priceRange.value?.max ?? PRICE_FALLBACK_MAX)

const activeFilterCount = computed(() => {
  let n = 0
  if (localDestination.value) n++
  if (localCategory.value) n++
  if (localName.value) n++
  n += localTerms.value.length
  if (localMinPrice.value > 0) n++
  if (localMaxPrice.value < priceMax.value) n++
  return n
})

function formatToman(val: number) {
  return val.toLocaleString('fa-IR') + ' تومان'
}

function applyAndClose() {
  const selectedTerms = [...localTerms.value]
  if (localCategory.value) {
    selectedTerms.push(Number(localCategory.value))
  }
  const hasMinPrice = localMinPrice.value > 0
  const hasMaxPrice = localMaxPrice.value < priceMax.value
  applyFilters({
    location: localDestination.value || undefined,
    name: localName.value || undefined,
    min_price: (hasMinPrice || hasMaxPrice) ? localMinPrice.value : null,
    max_price: (hasMinPrice || hasMaxPrice) ? localMaxPrice.value : null,
    terms: selectedTerms.length ? [...new Set(selectedTerms)] : undefined,
  })
  sidebarOpen.value = false
}

function clearAndClose() {
  localDestination.value = ''
  localCategory.value = ''
  localName.value = ''
  localTerms.value = []
  localMinPrice.value = 0
  localMaxPrice.value = priceMax.value
  resetFilters()
  sidebarOpen.value = false
}

watch(localMinPrice, (v) => { if (v > localMaxPrice.value) localMaxPrice.value = v })
watch(localMaxPrice, (v) => { if (v < localMinPrice.value) localMinPrice.value = v })

watch(localDestination, (location) => {
  fetchAttributes(location)
})

fetchAttributes(localDestination.value)

function handleWindowScroll() {
  resultHeaderVisible.value = window.scrollY < 80
}

onMounted(() => {
  handleWindowScroll()
  window.addEventListener('scroll', handleWindowScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleWindowScroll)
})

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
          <li>
            <NuxtLink to="/">صفحه اصلی</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/ticket">بلیط تفریحات</NuxtLink>
          </li>
          <li class="text-base-content">جستجو</li>
        </ul>
      </div>
    </div>

    <div class="px-4 lg:px-16 max-w-960 mx-auto pb-16 flex gap-6 items-start">

      <!-- Desktop Sidebar -->
      <aside
        class="hidden lg:flex flex-col gap-4 w-72 shrink-0 bg-base-100 rounded-2xl p-5 shadow-sm border border-base-200 sticky top-35">
        <div class="flex items-center justify-between">
          <span class="font-bold text-base-content text-base">فیلترها</span>
          <button v-if="activeFilterCount > 0" class="btn btn-ghost btn-xs text-error gap-1"
            @click="clearAndClose">
            <X class="size-3.5" /> پاک کردن
          </button>
        </div>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">شهر</legend>
          <select v-model="localDestination" class="select-custom">
            <option value="">همه شهرها</option>
            <option v-for="d in options.destinations" :key="d.slug" :value="d.slug">
              {{ d.name }}
            </option>
          </select>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">دسته‌بندی</legend>
          <select v-model="localCategory" class="select-custom">
            <option value="">همه مجموعه‌ها</option>
            <template v-for="c in categories" :key="c.id">
              <option :value="String(c.id)">{{ c.name }}</option>
              <option v-for="child in c.children" :key="child.id" :value="String(child.id)">
                &nbsp;&nbsp;— {{ child.name }}
              </option>
            </template>
          </select>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">جستجو در نام</legend>
          <input v-model="localName" type="text" class="input w-full" placeholder="نام تفریح، مجموعه..." />
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
                <input v-model.number="localMinPrice" type="range" :min="0" :max="priceMax"
                  :step="50000" class="range range-primary range-xs flex-1" />
              </div>
              <div class="flex items-center gap-2 text-xs text-base-content/50">
                <span class="shrink-0 w-8">تا</span>
                <input v-model.number="localMaxPrice" type="range" :min="0" :max="priceMax"
                  :step="50000" class="range range-primary range-xs flex-1" />
              </div>
            </div>
          </div>
        </fieldset>

        <button class="btn btn-primary w-full gap-2 mt-2" @click="applyAndClose">
          <Search class="size-4" /> اعمال فیلتر
        </button>
      </aside>

      <!-- Mobile Sticky Filter Trigger Button -->
      <div class="lg:hidden fixed bottom-6 inset-x-4 z-40 flex justify-start">
        <button class="btn btn-primary shadow-lg gap-2 rounded-full px-6" @click="sidebarOpen = true">
          <SlidersHorizontal class="size-4" /> فیلترها
          <span v-if="activeFilterCount > 0" class="badge badge-error badge-sm">
            {{ activeFilterCount }}
          </span>
        </button>
      </div>

      <Transition name="fade">
        <div v-if="sidebarOpen" class="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          @click="sidebarOpen = false" />
      </Transition>

      <Transition name="slide-up">
        <div v-if="sidebarOpen"
          class="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-base-100 rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto flex flex-col gap-4">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-base-content text-base">فیلترها</span>
            <button class="btn btn-ghost btn-sm btn-circle" @click="sidebarOpen = false">
              <X class="size-4" />
            </button>
          </div>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">شهر</legend>
            <select v-model="localDestination" class="select-custom">
              <option value="">همه شهرها</option>
              <option v-for="d in options.destinations" :key="d.slug" :value="d.slug">
                {{ d.name }}
              </option>
            </select>
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">دسته‌بندی</legend>
            <select v-model="localCategory" class="select-custom">
              <option value="">همه مجموعه‌ها</option>
              <template v-for="c in categories" :key="c.id">
                <option :value="String(c.id)">{{ c.name }}</option>
                <option v-for="child in c.children" :key="child.id" :value="String(child.id)">
                  &nbsp;&nbsp;— {{ child.name }}
                </option>
              </template>
            </select>
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">جستجو در نام</legend>
            <input v-model="localName" type="text" class="input w-full" placeholder="نام تفریح..." />
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
                <input v-model.number="localMinPrice" type="range" :min="0" :max="priceMax"
                  :step="50000" class="range range-primary range-xs flex-1" />
              </div>
              <div class="flex items-center gap-2 text-xs text-base-content/50">
                <span class="shrink-0 w-8">تا</span>
                <input v-model.number="localMaxPrice" type="range" :min="0" :max="priceMax"
                  :step="50000" class="range range-primary range-xs flex-1" />
              </div>
            </div>
          </fieldset>

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

      <!-- Result Grid Area -->
      <div class="flex-1 min-w-0 flex flex-col gap-4">

        <div class="sticky top-35 z-20 flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-base-100 p-4 rounded-2xl border border-base-200/60 shadow-sm transition-all duration-200"
          :class="resultHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0 pointer-events-none'">
          <p class="text-sm text-base-content/60 shrink-0">
            <template v-if="!loading">
              <span class="font-semibold text-base-content">{{ total.toLocaleString('fa-IR') }}</span>
              بلیط یافت شد
            </template>
            <template v-else>
              <span class="loading loading-dots loading-xs align-middle"></span>
            </template>
          </p>

          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span class="text-xs text-base-content/50 ml-1 whitespace-nowrap">مرتب‌سازی:</span>

            <button class="btn btn-xs rounded-lg font-medium transition-all"
              :class="(!filters.sort || filters.sort === 'default') ? 'btn-primary' : 'btn-ghost text-base-content/70'"
              @click="applyFilters({ sort: 'default' })">
              پیش‌فرض
            </button>

            <button class="btn btn-xs rounded-lg font-medium transition-all"
              :class="filters.sort === 'price_low' ? 'btn-primary' : 'btn-ghost text-base-content/70'"
              @click="applyFilters({ sort: 'price_low' })">
              کمترین قیمت
            </button>

            <button class="btn btn-xs rounded-lg font-medium transition-all"
              :class="filters.sort === 'price_high' ? 'btn-primary' : 'btn-ghost text-base-content/70'"
              @click="applyFilters({ sort: 'price_high' })">
              بیشترین قیمت
            </button>
          </div>
        </div>

        <div>
          <div v-if="loading"
            class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pt-6">
            <div v-for="n in 6" :key="n"
              class="bg-base-100 rounded-2xl overflow-hidden border border-base-200 shadow-sm flex flex-col h-110 animate-pulse">
              <div class="h-48 shrink-0 bg-base-300/70" />
              <div class="flex flex-col flex-1 p-4 gap-3">
                <div class="h-5 w-4/5 rounded-md bg-base-300/70" />
                <div class="flex items-center gap-2">
                  <div class="h-5 w-14 rounded-md bg-base-300/60" />
                </div>
                <div class="h-4 w-full rounded-md bg-base-300/50" />
                <div
                  class="mt-auto pt-3 border-t border-base-200/70 flex items-center justify-between gap-3">
                  <div class="h-4 flex-1 rounded-md bg-base-300/50" />
                </div>
                <div class="flex items-center justify-between gap-4">
                  <div class="flex flex-col gap-1.5">
                    <div class="h-5 w-28 rounded-md bg-base-300/70" />
                  </div>
                  <div class="h-8 w-20 rounded-xl bg-base-300/70" />
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="error"
            class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
            <div class="size-14 rounded-full bg-error/10 flex items-center justify-center">
              <WifiOff class="size-6 text-error" />
            </div>
            <p class="font-medium text-base-content">خطا در دریافت اطلاعات</p>
            <p class="text-sm text-base-content/50 max-w-xs leading-relaxed">
              ارتباط با سرور برقرار نشد. اینترنت خود را بررسی کرده و دوباره تلاش کنید.
            </p>
            <button class="btn btn-sm btn-error btn-soft gap-2 mt-1" @click="fetchTickets()">
              <RefreshCw class="size-4" />
              تلاش مجدد
            </button>
          </div>

          <div v-else-if="tickets.length === 0"
            class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
            <div class="size-14 rounded-full bg-base-200 flex items-center justify-center">
              <SearchX class="size-6 text-base-content/40" />
            </div>
            <p class="font-medium text-base-content">نتیجه‌ای یافت نشد</p>
            <p class="text-sm text-base-content/50 max-w-xs leading-relaxed">
              هیچ موردی با فیلترهای انتخابی شما مطابقت ندارد.
            </p>
          </div>

          <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pt-6">
            <SearchCard v-for="ticket in tickets" :key="ticket.id" :ticket="ticket" />
          </div>

          <div v-if="!error && tickets.length > 0 && totalPages > 1"
            class="flex justify-center items-center gap-1 mt-4 flex-wrap">
            <button class="btn btn-ghost btn-sm btn-circle" :disabled="currentPage <= 1"
              @click="goToPage(currentPage - 1)">
              <ChevronRight class="size-4" />
            </button>

            <template v-for="p in pages" :key="p">
              <span v-if="p === '...'" class="px-2 text-base-content/40 text-sm">…</span>
              <button v-else class="btn btn-sm btn-circle"
                :class="p === currentPage ? 'btn-primary' : 'btn-ghost'" @click="goToPage(p)">
                {{ p.toLocaleString('fa-IR') }}
              </button>
            </template>

            <button class="btn btn-ghost btn-sm btn-circle" :disabled="currentPage >= totalPages"
              @click="goToPage(currentPage + 1)">
              <ChevronLeft class="size-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
    <FAQ title="سوالات متداول رزرو تفریحات" :items="faqs" :loading="mainLoading" />
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
</style>