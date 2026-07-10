<!-- app/pages/dashboard/my-favorites.vue -->
<script setup lang="ts">
import { ChevronLeft, ChevronRight, Copy, Check } from 'lucide-vue-next'
import LoadingState from '~/components/ui/LoadingState.vue'
import { WISHLIST_TABS, WISHLIST_TAB_LABELS, WISHLIST_TAB_TO_SERVICE_PARAM } from '~/types/wishlist.types'
import type { WishlistTab, WishListRawResponse } from '~/types/wishlist.types'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'علاقه‌مندی‌ها | آسروتراول' })

const tab = ref<WishlistTab>('pool')
const page = ref(1)
const loading = ref(false)
const rawResponse = ref<WishListRawResponse>(null)
const copied = ref(false)

async function fetchWishList() {
  loading.value = true
  const result = await safeApiFetch<WishListRawResponse>('/api/users/get-wish-list', {
    query: { service: WISHLIST_TAB_TO_SERVICE_PARAM[tab.value], page: page.value },
  })
  rawResponse.value = result.data
  loading.value = false
}

watch([tab, page], fetchWishList, { immediate: true })

function changeTab(next: WishlistTab) {
  tab.value = next
  page.value = 1
}

const prettyJson = computed(() => JSON.stringify(rawResponse.value, null, 2))

async function copyJson() {
  try {
    await navigator.clipboard.writeText(prettyJson.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // clipboard unavailable — nothing to do here, it's a dev-only probe page
  }
}
</script>

<template>
  <div class="px-4 lg:px-16 max-w-960 mx-auto py-8">
    <h1 class="text-xl font-semibold mb-1">علاقه‌مندی‌ها</h1>
    <p class="text-xs text-base-content/50 mb-6">
      نسخه آزمایشی — پاسخ خام سرور برای بررسی ساختار داده نمایش داده می‌شود.
    </p>

    <div role="tablist" class="tabs tabs-boxed w-full sm:w-fit mb-6">
      <button
        v-for="item in WISHLIST_TABS"
        :key="item"
        role="tab"
        type="button"
        class="tab"
        :class="{ 'tab-active': tab === item }"
        @click="changeTab(item)"
      >
        {{ WISHLIST_TAB_LABELS[item] }}
      </button>
    </div>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body p-6 gap-4">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-base-content/70">
            پاسخ سرور — service={{ WISHLIST_TAB_TO_SERVICE_PARAM[tab] }}، page={{ page }}
          </p>
          <button
            type="button"
            class="btn btn-sm btn-outline rounded-xl gap-1.5"
            :disabled="!rawResponse"
            @click="copyJson"
          >
            <component :is="copied ? Check : Copy" class="size-3.5" />
            {{ copied ? 'کپی شد' : 'کپی JSON' }}
          </button>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
          <LoadingState label="در حال دریافت اطلاعات..." />
        </div>

        <pre
          v-else
          class="bg-base-200 rounded-xl p-4 text-xs overflow-x-auto max-h-[60vh] overflow-y-auto"
          dir="ltr"
        >{{ prettyJson }}</pre>

        <div class="flex items-center justify-center gap-2">
          <button
            type="button"
            class="btn btn-sm btn-outline rounded-xl"
            :disabled="page <= 1"
            @click="page = Math.max(1, page - 1)"
          >
            <ChevronRight class="size-4" />
          </button>
          <span class="text-xs text-base-content/50 px-2">صفحه {{ page.toLocaleString('fa-IR', { useGrouping: false }) }}</span>
          <button
            type="button"
            class="btn btn-sm btn-outline rounded-xl"
            @click="page += 1"
          >
            <ChevronLeft class="size-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>