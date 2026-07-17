<!-- app/components/dashboard/SupportTicketsList.vue -->
<script setup lang="ts">
import { Inbox, Loader2, MessageCircleQuestion, WifiOff, XCircle } from 'lucide-vue-next'
import SupportTicketCard from '~/components/dashboard/SupportTicketCard.vue'
import { SUPPORT_SORT_LABELS } from '~/types/support.types'
import type { SupportSort } from '~/types/support.types'
import type { SegmentedTabItem } from '~/components/ui/SegmentedTabs.vue'

const { sort, items, loading, error, total, hasMore, isEmpty, fetchPage, loadMore, setSort } = useSupportTickets('all')

const sortIcons: Record<SupportSort, typeof Inbox> = {
  all: Inbox,
  opening: MessageCircleQuestion,
  closed: XCircle,
}
const sortTabs: SegmentedTabItem<SupportSort>[] = (Object.keys(SUPPORT_SORT_LABELS) as SupportSort[])
  .map(key => ({ value: key, label: SUPPORT_SORT_LABELS[key], icon: sortIcons[key] }))

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
</script>

<template>
  <div class="grid gap-4">
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <UiSegmentedTabs :model-value="sort" :items="sortTabs" @update:model-value="setSort" />

      <NuxtLink to="/dashboard/support/new" class="btn btn-primary btn-soft w-full lg:w-auto rounded-xl gap-1">
        <MessageCircleQuestion :size="16" />
        تیکت جدید
      </NuxtLink>
    </div>

    <span v-if="!loading && !error && items.length" class="text-xs text-base-content/50 -mt-2">
      {{ total.toLocaleString('fa-IR') }} تیکت
    </span>

    <div v-if="error && items.length === 0" class="flex-col items-center justify-center py-16 gap-3 text-center px-4 flex">
      <div class="bg-error/10 rounded-full p-4">
        <WifiOff :size="32" class="text-error" />
      </div>
      <p class="font-medium">{{ error }}</p>
      <button type="button" class="btn btn-sm btn-error btn-soft" @click="handleRetry">تلاش دوباره</button>
    </div>

    <div v-else-if="isEmpty" class="flex-col items-center justify-center py-16 gap-3 text-center px-4 flex">
      <div class="bg-base-200 rounded-full p-4">
        <MessageCircleQuestion :size="32" class="text-base-content/40" />
      </div>
      <p class="font-medium">پیامی ثبت نشده است</p>
      <p class="text-base-content/50 text-sm">در این بخش هنوز تیکتی ثبت نشده است</p>
      <NuxtLink to="/dashboard/support/new" class="btn btn-sm btn-primary rounded-xl">ثبت تیکت جدید</NuxtLink>
    </div>

    <template v-else>
      <SupportTicketCard v-for="item in items" :key="item.id" :ticket="item" />
    </template>

    <div v-if="hasMore && items.length" ref="sentinel" class="h-4" />
    <div v-if="loading" class="flex justify-center py-4">
      <UiLoadingState label="در حال دریافت تیکت‌ها..." size="sm" />
    </div>
  </div>
</template>