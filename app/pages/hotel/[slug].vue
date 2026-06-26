<script setup lang="ts">
import { WifiOff, RefreshCw, SearchX, ScrollText } from 'lucide-vue-next'
import { parseBlogHtml } from '~/utils/blog/parser'
import type { HotelCardItem, HotelMedia } from '~/types/hotel.types'
import HotelList from '~/components/hotel/HotelList.vue'
import FAQ from '~/components/ui/FAQ.vue'
import ReviewSecion from '~/components/ui/review/ReviewSecion.vue'
import HotelPolicySection from '~/components/hotel/HotelPolicySection.vue'
import BlogRenderer from '~/components/blog/BlogRenderer.vue'
import HotelRoomsSection from '~/components/hotel/HotelRoomsSection.vue'
import HotelSingleHeader from '~/components/hotel/HotelSingleHeader.vue'

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

const {
    hotel, gallery, similar, seo,
    loading: hotelLoading,
    error: hotelError,
    refresh: refreshHotel
} = useHotelSingle(slug)

const {
    rooms,
    params: roomParams,
    loading: roomsLoading,
    error: roomsError,
    search: searchRooms
} = useHotelRooms(computed(() => hotel.value?.id ?? null))

const blocks = computed(() => hotel.value?.content ? parseBlogHtml(hotel.value.content) : [])
const isError = computed(() => !!hotelError.value)

const roomsErrorBool = computed(() => !!roomsError.value)
const locationLink = computed(() => hotel.value?.location?.slug
    ? `/hotel/search?location=${hotel.value.location.slug}`
    : '/hotel'
)

useHead({
    title: computed(() => seo.value?.title ?? hotel.value?.title ?? 'جزئیات هتل'),
    meta: [
        { name: 'description', content: computed(() => seo.value?.description ?? '') },
        { property: 'og:title', content: computed(() => seo.value?.title ?? '') },
        { property: 'og:image', content: computed(() => seo.value?.og_image?.image_url ?? '') },
    ],
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
                        <NuxtLink to="/hotel">هتل‌ها</NuxtLink>
                    </li>
                    <li v-if="hotel?.location?.name">
                        <NuxtLink :to="locationLink">
                            {{ hotel.location.name }}
                        </NuxtLink>
                    </li>
                    <li v-if="hotel?.title" class="text-base-content font-medium truncate max-w-40 lg:max-w-xs">
                        {{ hotel.title }}
                    </li>
                    <li v-else-if="hotelLoading">
                        <span class="inline-block h-3.5 w-24 bg-base-300 rounded animate-pulse" />
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <main class="mt-20 px-4 lg:px-16 max-w-960 mx-auto">
        <template v-if="hotelLoading">
            <div class="animate-pulse space-y-6">...</div>
        </template>

        <template v-else-if="isError">
            <div class="flex flex-col items-center py-16 gap-3 min-h-[60vh]">
                <WifiOff class="size-10 text-error" />
                <button class="btn btn-sm btn-error" @click="refreshHotel()">تلاش مجدد</button>
            </div>
        </template>

        <template v-else-if="!hotel">
            <div class="flex flex-col items-center py-16 gap-3 min-h-[60vh]">
                <SearchX class="size-10 text-base-content/40" />
            </div>
        </template>

        <template v-else>
            <HotelSingleHeader :hotel="hotel" :gallery="gallery" />

            <HotelRoomsSection :rooms="rooms" :loading="roomsLoading" :error="roomsErrorBool"
                v-model:params="roomParams" @search="searchRooms" />

            <BlogRenderer v-if="blocks.length" :blocks="blocks" />

            <HotelPolicySection
                v-if="hotel.policy?.length"
                title="قوانین هتل"
                subtitle="استفاده از خدمات به منزله پذیرش این قوانین است."
                :icon="ScrollText"
                :policies="hotel.policy"
            />

            <ReviewSecion :params="{ object_id: hotel.id, object_model: 'hotel', object_name: hotel.slug }"
                @login-click="router.push('/auth/login')" />

            <FAQ v-if="hotel?.faqs" :items="hotel.faqs" />

            <HotelList :hotels="similar.map((s): HotelCardItem => ({
                ...s,
                media: {
                    id: 0,
                    image_url: '',
                    file_name: '',
                    file_path: '',
                } as unknown as HotelMedia,
                terms: [],
                review_score: s.review_score ? Number(s.review_score) : null
            }))" title="هتل‌های مشابه" />
        </template>
    </main>
</template>
