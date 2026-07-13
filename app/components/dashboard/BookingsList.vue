<!-- app/components/dashboard/BookingsList.vue -->
<script setup lang="ts">
import { ArrowUpDown, Check, ChevronDown, Loader2, SearchX, SlidersHorizontal, WifiOff } from 'lucide-vue-next'
import BookingsTabs from '~/components/dashboard/BookingsTabs.vue'
import BookingCard from '~/components/dashboard/BookingCard.vue'
import { BOOKING_SORT_LABELS, BOOKING_STATUS_LABELS } from '~/types/dashboardBookings.types'
import type { BookingSortOption, BookingStatus } from '~/types/dashboardBookings.types'
import LoadingState from '../ui/LoadingState.vue'

const {
  tab, status, sort, search, items, loading, loadingAll, error, total,
  hasMore, isEmpty, isFiltered,
  fetchPage, loadMore, switchTab, setStatus, setSort, setSearch, cancelBooking,
} = useDashboardBookings('pool')

const searchInput = ref(search.value)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(searchInput, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => setSearch(val), 400)
})

const isFilterOpen = ref(false)
const isSortOpen = ref(false)
const filterRef = ref<HTMLElement | null>(null)
const sortRef = ref<HTMLElement | null>(null)
onClickOutside(filterRef, () => { isFilterOpen.value = false })
onClickOutside(sortRef, () => { isSortOpen.value = false })

function selectStatus(key: BookingStatus | null) {
  setStatus(key)
  isFilterOpen.value = false
}
function selectSort(key: BookingSortOption) {
  setSort(key)
  isSortOpen.value = false
}

const statusLabel = computed(() => status.value ? BOOKING_STATUS_LABELS[status.value] : 'همه وضعیت‌ها')
const sortLabel = computed(() => BOOKING_SORT_LABELS[sort.value])

const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  fetchPage(1)
  observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) loadMore()
  })
  if (sentinel.value) observer.observe(sentinel.value)
})

onUnmounted(() => observer?.disconnect())

function handleRetry() {
  fetchPage(1)
}

function clearFilters() {
  searchInput.value = ''
  setStatus(null)
  setSort('newest')
}
</script>

<template>
  <div class="grid gap-4">
    <BookingsTabs :model-value="tab" @update:model-value="switchTab" />

    <div class="flex flex-wrap gap-2 items-center">
      <div ref="filterRef" class="relative">
        <button
          type="button"
          class="btn btn-sm btn-ghost gap-1.5"
          :class="{ 'text-primary': status }"
          aria-label="فیلتر وضعیت"
          @click="isFilterOpen = !isFilterOpen"
        >
          <SlidersHorizontal :size="15" />
          <span class="hidden sm:inline">{{ statusLabel }}</span>
          <ChevronDown :size="13" class="opacity-50" />
        </button>
        <Transition name="menu-fade">
          <ul
            v-if="isFilterOpen"
            class="absolute right-0 menu bg-base-100 rounded-2xl shadow-lg border border-base-300 w-48 mt-2 z-30 p-2 origin-top-right"
          >
            <li>
              <button type="button" class="flex items-center justify-between" @click="selectStatus(null)">
                همه وضعیت‌ها
                <Check v-if="!status" :size="14" class="text-primary" />
              </button>
            </li>
            <li v-for="(label, key) in BOOKING_STATUS_LABELS" :key="key">
              <button type="button" class="flex items-center justify-between" @click="selectStatus(key as BookingStatus)">
                {{ label }}
                <Check v-if="status === key" :size="14" class="text-primary" />
              </button>
            </li>
          </ul>
        </Transition>
      </div>

      <div ref="sortRef" class="relative">
        <button
          type="button"
          class="btn btn-sm btn-ghost gap-1.5"
          aria-label="مرتب‌سازی"
          @click="isSortOpen = !isSortOpen"
        >
          <ArrowUpDown :size="15" />
          <span class="hidden sm:inline">{{ sortLabel }}</span>
          <ChevronDown :size="13" class="opacity-50" />
        </button>
        <Transition name="menu-fade">
          <ul
            v-if="isSortOpen"
            class="absolute right-0 menu bg-base-100 rounded-2xl shadow-lg border border-base-300 w-44 mt-2 z-30 p-2 origin-top-right"
          >
            <li v-for="(label, key) in BOOKING_SORT_LABELS" :key="key">
              <button type="button" class="flex items-center justify-between" @click="selectSort(key as BookingSortOption)">
                {{ label }}
                <Check v-if="sort === key" :size="14" class="text-primary" />
              </button>
            </li>
          </ul>
        </Transition>
      </div>

      <input v-model="searchInput" type="text" placeholder="جستجو با کد رزرو، نام خدمت یا مکان..."
        class="input input-sm input-bordered flex-1 min-w-40">

      <button v-if="isFiltered" type="button" class="btn btn-sm btn-ghost" @click="clearFilters">
        پاک کردن فیلترها
      </button>

      <span v-if="!loading && !error" class="text-xs text-base-content/50 ms-auto whitespace-nowrap">
        {{ total.toLocaleString('fa-IR') }} رزرو
      </span>
    </div>

    <div v-if="loadingAll" class="flex items-center gap-2 text-xs text-base-content/50 -mt-2">
      <Loader2 :size="14" class="animate-spin" />در حال بارگذاری همه رزروها برای جستجو/مرتب‌سازی...
    </div>

    <div v-if="error && items.length === 0"
      class="flex-col items-center justify-center py-16 gap-3 text-center px-4 flex">
      <div class="bg-error/10 rounded-full p-4">
        <WifiOff :size="32" class="text-error" />
      </div>
      <p class="font-medium">{{ error }}</p>
      <p class="text-base-content/50 text-sm">مشکلی در دریافت رزروها پیش آمد</p>
      <button type="button" class="btn btn-sm btn-error btn-soft" @click="handleRetry">تلاش دوباره</button>
    </div>

    <div v-else-if="isEmpty" class="flex-col items-center justify-center py-16 gap-3 text-center px-4 flex">
      <div class="bg-base-200 rounded-full p-4">
        <SearchX :size="32" class="text-base-content/40" />
      </div>
      <p class="font-medium">{{ isFiltered ? 'نتیجه‌ای یافت نشد' : 'رزروی یافت نشد' }}</p>
      <p class="text-base-content/50 text-sm">
        {{ isFiltered ? 'فیلترها یا جستجوی خود را تغییر دهید' : 'در این بخش هنوز رزروی ثبت نشده است' }}
      </p>
      <button v-if="isFiltered" type="button" class="btn btn-sm btn-soft" @click="clearFilters">پاک کردن
        فیلترها</button>
    </div>

    <template v-else>
      <BookingCard v-for="item in items" :key="item.code" :booking="item" @cancel="cancelBooking" />
    </template>

    <div v-if="hasMore" ref="sentinel" class="h-4" />
    <div v-if="loading && !loadingAll" class="flex justify-center py-4">
      <LoadingState label="در حال دریافت لیست رزروها..."/>
    </div>
  </div>
</template>

<style scoped>
.menu-fade-enter-active {
  animation: menu-reveal 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.menu-fade-leave-active {
  animation: menu-reveal 0.2s cubic-bezier(0.22, 1, 0.36, 1) reverse both;
}
@keyframes menu-reveal {
  from { opacity: 0; transform: scale(0.92) translateY(-6px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>