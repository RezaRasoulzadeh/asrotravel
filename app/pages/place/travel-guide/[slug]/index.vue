// pages/place/travel-guide/[slug]/index.vue
<script setup lang="ts">
import { WifiOff, SearchX } from 'lucide-vue-next'
import NewPostsList from '~/components/home/NewPostsList.vue'
import TopPostsList from '~/components/home/TopPostsList.vue'
import HotelList from '~/components/hotel/HotelList.vue'
import CategoryGrid from '~/components/place/CategoryGrid.vue'
import ProvinceHero from '~/components/place/ProvinceHero.vue'
import PoolList from '~/components/pool/PoolList.vue'
import TicketList from '~/components/ticket/TicketList.vue'

const route = useRoute()
const router = useRouter()

const slug = computed<string>(() => {
  if (route.params && 'slug' in route.params) {
    const s = route.params.slug
    return (Array.isArray(s) ? s[0] : s) || 'ardebil'
  }
  return 'ardebil'
})
const { data, loading, error, refresh } = useProvinceGuide(slug)

const hasHotels = computed(() => !!data.value?.reservation_data?.hotel?.data?.length)
const hasPools = computed(() => !!data.value?.reservation_data?.Pool?.data?.length)
const hasTickets = computed(() => !!data.value?.reservation_data?.Ticket?.data?.length)
const hasTopPosts = computed(() => !!data.value?.top_posts?.data?.length)
const hasNewBlogs = computed(() => !!data.value?.random_new_blog?.data?.length)

const isAllListsEmpty = computed(() => {
  return !hasHotels.value && !hasPools.value && !hasTickets.value && !hasTopPosts.value && !hasNewBlogs.value
})

const emptyStates = computed(() => ({
  itinerary: !hasTopPosts.value && !hasNewBlogs.value,
  entertainment: !hasPools.value && !hasTickets.value,
}))

const seoTitle = computed(() => data.value?.seo?.title ?? data.value?.province?.title ?? data.value?.province?.name ?? 'آسرو')
const seoDescription = computed(() => data.value?.seo?.description ?? '')
const seoKeywords = computed(() => data.value?.seo?.keywords ?? '')
const seoImage = computed(() => data.value?.seo?.og_image ?? data.value?.seo?.seo_image ?? data.value?.province?.banner?.image_url ?? '')

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  keywords: () => seoKeywords.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogImage: () => seoImage.value,
  twitterTitle: () => seoTitle.value,
  twitterDescription: () => seoDescription.value,
  twitterImage: () => seoImage.value,
})

useHead({
  link: [
    { rel: 'canonical', href: () => `https://asrotravel.com${route.fullPath}` },
  ],
})

function selectLocation(locationSlug: string) {
  router.push(`/place/travel-guide/${locationSlug}`)
}
</script>

<template>
  <main class="min-h-screen mt-16 mb-16">

    <template v-if="loading">
      <div class="px-4 lg:px-16 w-full grid grid-cols-1 items-start">
        <div class="col-start-1 row-start-1 skeleton w-full h-[40vh] lg:h-[58vh] rounded-3xl lg:rounded-4xl" />
        <div class="col-start-1 row-start-1 w-full max-w-6xl mx-auto px-2 sm:px-4 mt-[28vh] lg:mt-[44vh] 2xl:mt-[50vh] z-10">
          <div class="bg-base-100 rounded-3xl lg:rounded-4xl shadow-2xl p-4 lg:px-8 lg:py-6 flex flex-col gap-4">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div class="flex flex-col gap-2 min-w-0 flex-1">
                <div class="skeleton h-3 w-20 rounded" />
                <div class="skeleton h-8 w-48 rounded-xl" />
              </div>
              <div class="flex flex-1 flex-col md:flex-row gap-2 shrink-0">
                <div class="skeleton h-10 flex-1 rounded-xl" />
                <div class="skeleton h-10 flex-1 rounded-xl" />
                <div class="skeleton h-10 flex-1 rounded-xl" />
              </div>
            </div>
            <div class="border-t border-base-200/60 pt-3 flex gap-2 overflow-hidden">
              <div v-for="i in 5" :key="'loc-'+i" class="skeleton h-8 w-20 rounded-xl shrink-0" />
            </div>
            <div class="border-t border-base-200/60 pt-3 flex gap-2 overflow-hidden">
              <div v-for="i in 6" :key="'cat-'+i" class="skeleton h-8 w-24 rounded-xl shrink-0" />
            </div>
          </div>
        </div>
      </div>
      <div class="px-4 lg:px-16 max-w-6xl mx-auto mt-24 lg:mt-16 flex flex-col gap-6">
        <div class="skeleton h-48 w-full rounded-2xl" />
        <div class="skeleton h-48 w-full rounded-2xl" />
      </div>
    </template>

    <template v-else-if="error">
      <div class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
        <div class="bg-error/10 rounded-full p-5">
          <WifiOff class="w-8 h-8 text-error" />
        </div>
        <p class="text-base-content/70">خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید.</p>
        <button class="btn btn-sm btn-error btn-soft" @click="() => refresh()">تلاش مجدد</button>
      </div>
    </template>

    <template v-else-if="!data">
      <div class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
        <div class="bg-base-200 rounded-full p-5">
          <SearchX class="w-8 h-8 text-base-content/40" />
        </div>
        <p class="text-base-content/60">اطلاعاتی برای این مقصد یافت نشد.</p>
      </div>
    </template>

    <template v-else>

      <ProvinceHero
        :province="data.province"
        :locations="data.locations"
        :categories="data.categories"
        :current-slug="slug"
        :empty-states="emptyStates"
        @select-location="selectLocation"
      >
        <template #categories>
          <CategoryGrid :categories="data.categories" />
        </template>
      </ProvinceHero>

      <div v-if="!isAllListsEmpty" class="py-8 flex flex-col gap-0">

        <Suspense v-if="data.reservation_data?.hotel?.data?.length">
          <HotelList :hotels="data.reservation_data.hotel.data" :title="data.reservation_data.hotel.title" />
          <template #fallback><div class="skeleton h-48 w-full rounded-2xl mb-8" /></template>
        </Suspense>

        <Suspense v-if="data.reservation_data?.Pool?.data?.length">
          <PoolList :pools="data.reservation_data.Pool.data" :title="data.reservation_data.Pool.title" />
          <template #fallback><div class="skeleton h-48 w-full rounded-2xl mb-8" /></template>
        </Suspense>

        <Suspense v-if="data.reservation_data?.Ticket?.data?.length">
          <TicketList :tickets="data.reservation_data.Ticket.data" :title="data.reservation_data.Ticket.title" />
          <template #fallback><div class="skeleton h-48 w-full rounded-2xl mb-8" /></template>
        </Suspense>

        <Suspense v-if="data.top_posts?.data?.length">
          <TopPostsList :posts="data.top_posts.data" :title="data.top_posts.title" />
          <template #fallback><div class="skeleton h-64 w-full rounded-2xl mb-8" /></template>
        </Suspense>

        <Suspense v-if="data.random_new_blog?.data?.length">
          <NewPostsList :posts="data.random_new_blog.data" :title="data.random_new_blog.title" />
          <template #fallback><div class="skeleton h-64 w-full rounded-2xl mb-8" /></template>
        </Suspense>

      </div>

      <div v-else class="flex flex-col items-center justify-center py-20 gap-3 text-center px-4 max-w-6xl mx-auto">
        <div class="bg-base-200 rounded-full p-5">
          <SearchX class="w-8 h-8 text-base-content/40" />
        </div>
        <p class="text-base-content/60 font-medium">هیچ جزییات یا سفرنامه‌ای برای این مسیر ثبت نشده است.</p>
      </div>

    </template>

  </main>
</template>