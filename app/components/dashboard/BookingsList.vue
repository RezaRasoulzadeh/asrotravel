<!-- app/components/dashboard/BookingsList.vue -->
<script setup lang="ts">
import { Loader2, SearchX, WifiOff } from 'lucide-vue-next'
import BookingsTabs from '~/components/dashboard/BookingsTabs.vue'
import BookingCard from '~/components/dashboard/BookingCard.vue'
import { BOOKING_SORT_LABELS, BOOKING_STATUS_LABELS } from '~/types/dashboardBookings.types'
import type { BookingSortOption, BookingStatus } from '~/types/dashboardBookings.types'

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
      <select
        class="select select-sm select-bordered w-40"
        :value="status ?? ''"
        @change="setStatus((($event.target as HTMLSelectElement).value || null) as BookingStatus | null)"
      >
        <option value="">همه وضعیت‌ها</option>
        <option v-for="(label, key) in BOOKING_STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>

      <select
        class="select select-sm select-bordered w-36"
        :value="sort"
        @change="setSort(($event.target as HTMLSelectElement).value as BookingSortOption)"
      >
        <option v-for="(label, key) in BOOKING_SORT_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>

      <input
        v-model="searchInput"
        type="text"
        placeholder="جستجو با کد رزرو، کد پیگیری، نام خدمت یا شماره موبایل..."
        class="input input-sm input-bordered flex-1 min-w-40"
      >

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

    <div v-if="error && items.length === 0" class="flex-col items-center justify-center py-16 gap-3 text-center px-4 flex">
      <div class="bg-error/10 rounded-full p-4"><WifiOff :size="32" class="text-error" /></div>
      <p class="font-medium">{{ error }}</p>
      <p class="text-base-content/50 text-sm">مشکلی در دریافت رزروها پیش آمد</p>
      <button type="button" class="btn btn-sm btn-error btn-soft" @click="handleRetry">تلاش دوباره</button>
    </div>

    <div v-else-if="isEmpty" class="flex-col items-center justify-center py-16 gap-3 text-center px-4 flex">
      <div class="bg-base-200 rounded-full p-4"><SearchX :size="32" class="text-base-content/40" /></div>
      <p class="font-medium">{{ isFiltered ? 'نتیجه‌ای یافت نشد' : 'رزروی یافت نشد' }}</p>
      <p class="text-base-content/50 text-sm">
        {{ isFiltered ? 'فیلترها یا جستجوی خود را تغییر دهید' : 'در این بخش هنوز رزروی ثبت نشده است' }}
      </p>
      <button v-if="isFiltered" type="button" class="btn btn-sm btn-soft" @click="clearFilters">پاک کردن فیلترها</button>
    </div>

    <template v-else>
      <BookingCard v-for="item in items" :key="item.id" :booking="item" @cancel="cancelBooking" />
    </template>

    <div v-if="hasMore" ref="sentinel" class="h-4" />
    <div v-if="loading && !loadingAll" class="flex justify-center py-4"><Loader2 :size="24" class="animate-spin text-primary" /></div>
  </div>
</template>