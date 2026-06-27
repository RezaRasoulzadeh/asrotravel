// app/pages/pool/[slug].vue
<script setup lang="ts">
import { WifiOff, RefreshCw, SearchX, ScrollText, ShieldX } from 'lucide-vue-next'
import type { OpenHour, PoolSingleWithSanse } from '~/types/poolSingle.types'
import { parseBlogHtml } from '~/utils/blog/parser'
import PoolSingleHeader from '~/components/pool/PoolSingleHeader.vue'
import BlogRenderer from '~/components/blog/BlogRenderer.vue'
import ReviewSecion from '~/components/ui/review/ReviewSecion.vue'
import FAQ from '~/components/ui/FAQ.vue'
import PoolList from '~/components/pool/PoolList.vue'

const route = useRoute()
const router = useRouter()
const slug = computed(() => (route.params as { slug: string }).slug ?? '')

const { pool, gallery, seo, related, loading: poolLoading, error: poolError, refresh: refreshPool } = usePoolSingle(slug)
const poolId = computed(() => pool.value?.id ?? null)
const { sanse, loading: sanseLoading } = usePoolSanse(poolId)
const blocks = computed(() =>
  pool.value?.content ? parseBlogHtml(pool.value.content) : []
)
const terms_information = computed(() => {
  return pool.value?.terms_information ? parseBlogHtml(pool.value.terms_information) : []
})

const cancel_policy = computed(() => {
  return pool.value?.cancel_policy ? parseBlogHtml(pool.value.cancel_policy) : []
})
const isLoading = computed(() => {
  if (poolLoading.value) return true
  if (pool.value?.id && sanseLoading.value) return true
  return false
})
const isError = computed(() => poolError.value)

const aggregatedData = computed<PoolSingleWithSanse | null>(() => {
  if (!pool.value) return null
  return {
    ...pool.value,
    min_price_display: sanse.value?.min_price_display ?? pool.value.min_price_display,
    price_with_offer_display: sanse.value?.price_with_offer_display ?? pool.value.price_with_offer_display,
    services: sanse.value?.services ?? null,
  }
})

const is_vip = computed(() => {
  const ticket = Object.keys(aggregatedData.value?.services?.ticket ?? {}).length
  const vip    = Object.keys(aggregatedData.value?.services?.vip    ?? {}).length
  return ticket === 0 && vip > 0
})

const selectedSlotUuid = ref<string | null>(null)

function handleAddToCart(slot: OpenHour & { gender: 'men' | 'women'; serviceName: string }) {
  console.log('add to cart', slot)
}

useSeoMeta({
  title: () => seo.value?.title ?? pool.value?.title ?? 'جزئیات مجموعه آبی',
  description: () => seo.value?.description ?? '',
  keywords: () => seo.value?.keywords ?? '',
  ogTitle: () => seo.value?.title ?? '',
  ogDescription: () => seo.value?.description ?? '',
  ogImage: () => seo.value?.og_image?.image_url ?? '',
})

useHead({
  link: [{ rel: 'canonical', href: computed(() => seo.value?.canonical ?? '') }],
})
</script>

<template>
  <div class="sticky top-16 z-30 bg-base-100/80 backdrop-blur-md border-b border-base-300/50 px-4 lg:px-16">
    <div class="max-w-960 mx-auto py-2.5">
      <div class="breadcrumbs text-xs text-base-content/60">
        <ul>
          <li>
            <NuxtLink to="/">صفحه اصلی</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/pool">استخرها</NuxtLink>
          </li>
          <li v-if="pool?.location?.name">
            <NuxtLink :to="`/pool/search?location=${pool.location.slug}`">
              {{ pool.location.name }}
            </NuxtLink>
          </li>
          <li v-if="pool?.title" class="text-base-content font-medium truncate max-w-40 lg:max-w-xs">
            {{ pool.title }}
          </li>
          <li v-else-if="isLoading">
            <span class="inline-block h-3.5 w-24 bg-base-300 rounded animate-pulse"></span>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div v-if="isLoading" class="pool-single-container mt-20 pb-12 px-4 lg:px-16 max-w-960 mx-auto">
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full animate-pulse">
      <div class="lg:col-span-7 flex flex-col gap-4">
        <div class="w-full aspect-video rounded-3xl bg-base-300"></div>
        <div class="flex items-center gap-2 py-2 w-full overflow-x-hidden">
          <div class="w-28 aspect-4/3 rounded-xl bg-base-300 shrink-0"></div>
          <div class="w-28 aspect-4/3 rounded-xl bg-base-300 shrink-0"></div>
          <div class="w-28 aspect-4/3 rounded-xl bg-base-300 shrink-0"></div>
          <div class="w-28 aspect-4/3 rounded-xl bg-base-300 shrink-0 opacity-50"></div>
        </div>
      </div>
      <div class="lg:col-span-5 bg-base-200/60 rounded-3xl p-6 lg:p-8 flex flex-col gap-4 border border-base-200">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-2 flex-1">
            <div class="h-5 bg-base-300 rounded-full w-20"></div>
            <div class="h-7 bg-base-300 rounded-xl w-3/4"></div>
            <div class="h-4 bg-base-300 rounded-lg w-1/3"></div>
          </div>
          <div class="w-14 h-14 rounded-2xl bg-base-300 shrink-0"></div>
        </div>
        <div class="h-4 bg-base-300 rounded-lg w-4/5"></div>
        <div class="flex gap-2">
          <div class="h-6 w-14 bg-base-300 rounded-full"></div>
          <div class="h-6 w-16 bg-base-300 rounded-full"></div>
        </div>
        <div class="space-y-2">
          <div class="h-3 bg-base-300 rounded w-20"></div>
          <div class="flex flex-wrap gap-2">
            <div class="h-8 w-16 bg-base-300 rounded-xl"></div>
            <div class="h-8 w-20 bg-base-300 rounded-xl"></div>
            <div class="h-8 w-14 bg-base-300 rounded-xl"></div>
            <div class="h-8 w-18 bg-base-300 rounded-xl"></div>
          </div>
        </div>
        <div class="h-10 bg-base-300/60 rounded-2xl w-full"></div>
        <div class="mt-auto pt-4 border-t border-base-300/50 space-y-4">
          <div class="space-y-1.5">
            <div class="h-3 bg-base-300 rounded w-1/3"></div>
            <div class="h-7 bg-base-300 rounded-lg w-1/2"></div>
          </div>
          <div class="h-11 bg-base-300 rounded-xl w-full"></div>
          <div class="grid grid-cols-4 gap-2">
            <div class="h-12 bg-base-300 rounded-xl"></div>
            <div class="h-12 bg-base-300 rounded-xl"></div>
            <div class="h-12 bg-base-300 rounded-xl"></div>
            <div class="h-12 bg-base-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <div v-else-if="isError" class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4 min-h-[60vh]">
    <div class="size-14 rounded-full bg-error/10 flex items-center justify-center">
      <WifiOff class="size-6 text-error" />
    </div>
    <p class="font-medium text-base-content">خطا در دریافت اطلاعات</p>
    <p class="text-sm text-base-content/50 max-w-xs leading-relaxed">
      ارتباط با سرور برقرار نشد. اینترنت خود را بررسی کرده و دوباره تلاش کنید.
    </p>
    <button class="btn btn-sm btn-error btn-soft gap-2 mt-1 cursor-pointer" @click="refreshPool()">
      <RefreshCw class="size-4" />
      تلاش مجدد
    </button>
  </div>

  <div v-else-if="!aggregatedData"
    class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4 min-h-[60vh]">
    <div class="size-14 rounded-full bg-base-200 flex items-center justify-center">
      <SearchX class="size-6 text-base-content/40" />
    </div>
    <p class="font-medium text-base-content">نتیجه‌ای یافت نشد</p>
    <p class="text-sm text-base-content/50 max-w-xs leading-relaxed">
      هیچ موردی با فیلترهای انتخابی شما مطابقت ندارد.
    </p>
  </div>

  <div v-else class="pool-single-container mt-20 px-4 lg:px-16 max-w-960 mx-auto">
    <PoolSingleHeader class="lg:pe-14" :pool="aggregatedData" :gallery="gallery" :is_vip="is_vip" />
<!-- Calendar / Sanse Section -->
<div id="sans-section" class="scroll-mt-20">
  <PoolSanseCalendar
    v-if="!is_vip && aggregatedData.services"
    :services="aggregatedData.services"
    :service-active="pool?.service_active == 1"
    v-model="selectedSlotUuid"
    @add-to-cart="handleAddToCart"
  />
  <VipSanseSecion
    v-else-if="is_vip && aggregatedData.services?.vip"
    :vip-services="aggregatedData.services.vip"
  />
</div>
    <div v-if="blocks.length > 0"
      class="w-full max-w-960 mx-auto px-4 lg:px-10 bg-base-100 rounded-3xl py-4 lg:py-10 mt-6">
      <BlogRenderer :blocks="blocks" />
    </div>
    <PoolPolicySection title="قوانین و مقررات" subtitle="استفاده از خدمات به منزله پذیرش این قوانین است."
      :icon="ScrollText" :blocks="terms_information" />
    <PoolPolicySection title="قوانین لغو رزرو" subtitle="لطفاً پیش از رزرو، شرایط لغو را به دقت مطالعه کنید."
      :icon="ShieldX" :blocks="cancel_policy" />
    <ReviewSecion :params="{ object_id: pool?.id ?? 0, object_model: 'Pool', object_name: pool?.slug ?? '' }"
      :is-logged-in="false" @login-click="router.push('/auth/login')" />
  </div>
      <FAQ v-if="pool?.faqs && pool.faqs.length > 0" :items="pool?.faqs || []" :title="'سوالات متداول'" />
    <!-- Related Pools -->
    <PoolList :pools="related" title="مجموعه‌های نزدیک" :tab_active="false" />
</template>