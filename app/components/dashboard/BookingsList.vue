<!-- app/components/dashboard/BookingsList.vue -->
<script setup lang="ts">
import { Loader2, SearchX, WifiOff } from 'lucide-vue-next'
import BookingsTabs from '~/components/dashboard/BookingsTabs.vue'
import BookingCard from '~/components/dashboard/BookingCard.vue'

const { tab, items, loading, error, hasMore, isEmpty, fetchPage, loadMore, switchTab, cancelBooking } = useDashboardBookings('pool')

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

async function handleRetry() {
  fetchPage(1)
}
</script>

<template>
  <div class="grid gap-4">
    <BookingsTabs :model-value="tab" @update:model-value="switchTab" />

    <div v-if="error && items.length === 0" class="flex-col items-center justify-center py-16 gap-3 text-center px-4 flex">
      <div class="bg-error/10 rounded-full p-4"><WifiOff :size="32" class="text-error" /></div>
      <p class="font-medium">{{ error }}</p>
      <p class="text-base-content/50 text-sm">مشکلی در دریافت رزروها پیش آمد</p>
      <button type="button" class="btn btn-sm btn-error btn-soft" @click="handleRetry">تلاش دوباره</button>
    </div>

    <div v-else-if="isEmpty" class="flex-col items-center justify-center py-16 gap-3 text-center px-4 flex">
      <div class="bg-base-200 rounded-full p-4"><SearchX :size="32" class="text-base-content/40" /></div>
      <p class="font-medium">رزروی یافت نشد</p>
      <p class="text-base-content/50 text-sm">در این بخش هنوز رزروی ثبت نشده است</p>
    </div>

    <template v-else>
      <BookingCard v-for="item in items" :key="item.id" :booking="item" @cancel="cancelBooking" />
    </template>

    <div v-if="hasMore" ref="sentinel" class="h-4" />
    <div v-if="loading" class="flex justify-center py-4"><Loader2 :size="24" class="animate-spin text-primary" /></div>
  </div>
</template>