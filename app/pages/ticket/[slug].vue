// pages/ticket/[slug].vue

<script setup lang="ts">
import { RefreshCw, ScrollText, SearchX, ShieldX, WifiOff } from 'lucide-vue-next'
import PoolPolicySection from '~/components/pool/PoolPolicySection.vue'
import TicketList from '~/components/ticket/TicketList.vue'
import TicketSingleHeader from '~/components/ticket/TicketSingleHeader.vue'
import FAQ from '~/components/ui/FAQ.vue'
import ReviewSecion from '~/components/ui/review/ReviewSecion.vue'
import type { TicketCartItem } from '~/types/ticketSingle.types'
import { parseBlogHtml } from '~/utils/blog/parser'

const route = useRoute()
const router = useRouter()

const slug = computed(() => (route.params?.slug as string) ?? '')

const {
  ticket,
  gallery,
  seo,
  related,
  breadcrumb,
  loading: ticketLoading,
  error: ticketError,
  refresh: refreshTicket,
} = useTicketSingle(slug)

const ticketId = computed(() => ticket.value?.id ?? null)

const { sanse, loading: sanseLoading } = useTicketSanse(ticketId)

const isLoading = computed(() => {
  return !!ticketLoading.value || (!!ticket.value?.id && !!sanseLoading.value)
})

const isError = computed(() => !!ticketError.value)


const blocks = computed(() =>
  ticket.value?.content ? parseBlogHtml(ticket.value.content) : [],
)

const terms_information = computed(() =>
  ticket.value?.terms_information
    ? parseBlogHtml(ticket.value.terms_information)
    : [],
)

const cancel_policy = computed(() =>
  ticket.value?.cancel_policy
    ? parseBlogHtml(ticket.value.cancel_policy)
    : [],
)

const aggregatedData = computed(() => {
  const t = ticket.value
  const s = sanse.value

  if (!t) return null

  return {
    ...t,
    min_price_display: s?.min_price_display ?? t.min_price ?? null,
    price_with_offer_display:
      s?.price_with_offer_display ?? t.min_price ?? null,
  }
})


const breadcrumbItems = computed(() => {
  if (breadcrumb.value?.length) return breadcrumb.value

  const items = [
    { title: 'صفحه اصلی', link: '/' },
    { title: 'تفریحی و خدماتی', link: '/ticket' },
  ]

  const loc = ticket.value?.location

  if (loc?.name && loc?.slug) {
    items.push({
      title: loc.name,
      link: `/ticket/search?location=${encodeURIComponent(loc.slug)}`,
    })
  }

  if (ticket.value?.title) {
    items.push({
      title: ticket.value.title,
      link: '',
    })
  }

  return items
})

function handleAddToCart(item: TicketCartItem) {
  console.log('add to cart', item)
}

/* -------------------------
   SEO
-------------------------- */

const seoTitle = computed(() => seo.value?.title ?? ticket.value?.title ?? 'جزئیات')
const seoDescription = computed(() => seo.value?.description ?? '')
const seoKeywords = computed(() => seo.value?.keywords ?? '')
const seoImage = computed(() => seo.value?.og_image?.image_url ?? '')
const seoCanonical = computed(() => seo.value?.canonical ?? '')

useHead({
  title: seoTitle,
  meta: [
    { name: 'description', content: seoDescription },
    { name: 'keywords', content: seoKeywords },
    { property: 'og:title', content: seoTitle },
    { property: 'og:description', content: seoDescription },
    { property: 'og:image', content: seoImage },
  ],
  link: [{ rel: 'canonical', href: seoCanonical }],
})
</script>

<template>
  <div class="sticky top-16 z-30 bg-base-100/80 backdrop-blur-md border-b border-base-300/50 px-4 lg:px-16">
    <div class="max-w-960 mx-auto py-2.5">
      <div class="breadcrumbs text-xs text-base-content/60">
        <ul>
          <li v-for="(crumb, i) in breadcrumbItems" :key="i">
            <RouterLink v-if="crumb.link" :to="crumb.link">
              {{ crumb.title }}
            </RouterLink>
            <span v-else class="text-base-content font-medium truncate max-w-40 lg:max-w-xs">
              {{ crumb.title }}
            </span>
          </li>

          <li v-if="isLoading && !ticket?.title">
            <span class="inline-block h-3.5 w-24 bg-base-300 rounded animate-pulse"></span>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div v-if="isLoading" class="mt-20 pb-12 px-4 lg:px-16 max-w-960 mx-auto">
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
          <div class="h-14 bg-base-300 rounded-2xl w-full"></div>
        </div>

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
      ارتباط با سرور برقرار نشد.
    </p>

    <button class="btn btn-sm btn-error btn-soft gap-2 mt-1" @click="refreshTicket()">
      <RefreshCw class="size-4" />
      تلاش مجدد
    </button>
  </div>

  <div v-else-if="!aggregatedData" class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4 min-h-[60vh]">
    <div class="size-14 rounded-full bg-base-200 flex items-center justify-center">
      <SearchX class="size-6 text-base-content/40" />
    </div>

    <p class="font-medium text-base-content">نتیجه‌ای یافت نشد</p>
  </div>

  <div v-else class="mt-20 px-4 lg:px-16 max-w-960 mx-auto">
    <TicketSingleHeader
      class="lg:pe-14"
      :ticket="aggregatedData"
      :gallery="gallery"
      :sanse="sanse"
      :sanse-loading="sanseLoading"
      @add-to-cart="handleAddToCart"
    />

    <div v-if="blocks.length" class="w-full max-w-960 mx-auto px-4 lg:px-10 bg-base-100 rounded-3xl py-4 lg:py-10 mt-6">
      <BlogRenderer :blocks="blocks" />
    </div>

    <PoolPolicySection
      v-if="terms_information.length"
      title="قوانین و مقررات"
      subtitle="استفاده از خدمات به منزله پذیرش این قوانین است."
      :icon="ScrollText"
      :blocks="terms_information"
    />

    <PoolPolicySection
      v-if="cancel_policy.length"
      title="قوانین لغو رزرو"
      subtitle="لطفاً پیش از رزرو، شرایط لغو را مطالعه کنید."
      :icon="ShieldX"
      :blocks="cancel_policy"
    />

    <ReviewSecion
      :params="{
        object_id: ticket?.id ?? 0,
        object_model: 'Ticket',
        object_name: ticket?.slug ?? '',
      }"
      :is-logged-in="false"
      @login-click="router.push('/auth/login')"
    />
  </div>

  <FAQ v-if="ticket?.faqs?.length" :items="ticket.faqs" title="سوالات متداول" />

  <TicketList v-if="related.length" :tickets="related" title="جاذبه‌های مشابه" :tab_active="false" />
</template>