// app/pages/pool/search.vue
<script setup lang="ts">
import { SlidersHorizontal, X, Search, ChevronLeft, ChevronRight, ChevronDown, SearchX, RefreshCw, WifiOff } from 'lucide-vue-next'
import PoolSearchCard from '~/components/pool/PoolSearchCard.vue'
import FAQ from '~/components/ui/FAQ.vue'
import type { PoolSearchAttribute } from '~/types/pool.types'

const PRICE_FALLBACK_MAX = 20_000_000
const CATEGORY_SLUG_TO_ID: Record<string, number> = {
    'استخر': 1,
    'ماساژ': 2,
    'پارک-آبی': 3,
    'vip': 4,
}

const { options } = useSearchOptions()
const { seo, faqs, loading: mainLoading } = usePoolMain()
const {
    pools, loading, error,
    total, totalPages, currentPage,
    filters, fetchPools, applyFilters, goToPage, resetFilters,
} = usePoolSearch()

useSeoMeta({
    title: () => seo.value?.title ?? 'رزرو استخر آنلاین',
    description: () => seo.value?.description ?? '',
    keywords: () => seo.value?.keywords ?? '',
    ogTitle: () => seo.value?.title ?? '',
    ogDescription: () => seo.value?.description ?? '',
    ogImage: () => seo.value?.og_image?.image_url ?? '',
})

useHead({
    link: [
        { rel: 'canonical', href: computed(() => seo.value?.canonical ?? '') },
    ],
})

// ── Local filter state (committed on Apply) ────────────────
const localDestination = ref(filters.value.location ?? '')
const localCategory = ref(filters.value.category_id?.toString() ?? '')
const localName = ref(filters.value.name ?? '')
const localMinPrice = ref(filters.value.min_price ?? 0)
const localMaxPrice = ref(filters.value.max_price ?? PRICE_FALLBACK_MAX)
const localTerms = ref<number[]>([...(filters.value.terms ?? [])])

const expandedAttributes = ref<Record<number, boolean>>({})

const {
    attributes: searchAttributesList,
    categories: apiCategories,
    minMaxRange,
    loading: attributesLoading,
} = usePoolSearchAttributes(localDestination)

const categories = computed(() => {
    if (apiCategories.value.length) return apiCategories.value

    return options.value.poolCategories
        .map((category) => ({
            id: CATEGORY_SLUG_TO_ID[category.slug],
            name: category.name,
            slug: category.slug,
            parent_id: null,
            children: [],
        }))
        .filter((category) => category.id)
})
const filterAttributes = computed(() =>
    searchAttributesList.value.filter((attr) => !attr.hide_in_filter_search && attr.terms?.length)
)
const priceMax = computed(() => {
    const raw = minMaxRange.value?.max_price
    return raw ? Math.ceil(raw / 10) : PRICE_FALLBACK_MAX
})

// ── Mobile sidebar ─────────────────────────────────────────
const sidebarOpen = ref(false)
const resultHeaderVisible = ref(true)

// ── Active filter count for badge ─────────────────────────
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

function visibleTerms(attr: PoolSearchAttribute) {
    return expandedAttributes.value[attr.id] ? attr.terms : []
}

function toggleAttribute(attrId: number) {
    expandedAttributes.value = {
        ...expandedAttributes.value,
        [attrId]: !expandedAttributes.value[attrId],
    }
}

function applyAndClose() {
    const hasMinPrice = localMinPrice.value > 0
    const hasMaxPrice = localMaxPrice.value < priceMax.value
    applyFilters({
        location: localDestination.value || undefined,
        category_id: localCategory.value ? Number(localCategory.value) : null,
        name: localName.value || undefined,
        min_price: (hasMinPrice || hasMaxPrice) ? localMinPrice.value : null,
        max_price: (hasMinPrice || hasMaxPrice) ? localMaxPrice.value : null,
        terms: localTerms.value.length ? localTerms.value : undefined,
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

watch([minMaxRange, apiCategories], () => {
    const nextMax = minMaxRange.value?.max_price
        ? Math.ceil(minMaxRange.value.max_price / 10)
        : PRICE_FALLBACK_MAX

    if (!filters.value.max_price) localMaxPrice.value = nextMax
    if (localMaxPrice.value > nextMax) localMaxPrice.value = nextMax

    if (
        localCategory.value
        && !apiCategories.value.some((category) => String(category.id) === localCategory.value)
    ) {
        localCategory.value = ''
    }
})

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
                        <NuxtLink to="/pool">استخرها</NuxtLink>
                    </li>
                    <li class="text-base-content">جستجو</li>
                </ul>
            </div>
        </div>

        <div class="px-4 lg:px-16 max-w-960 mx-auto pb-16 flex gap-6 items-start">

            <aside
                class="hidden lg:flex flex-col gap-4 w-72 shrink-0 bg-base-100 rounded-2xl p-5 shadow-sm border border-base-200 sticky top-35">
                <div class="flex items-center justify-between">
                    <span class="font-bold text-base-content text-base">فیلترها</span>
                    <button v-if="activeFilterCount > 0" class="btn btn-ghost btn-xs text-error gap-1"
                        @click="clearAndClose">
                        <X class="size-3.5" />
                        پاک کردن
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
                    <legend class="fieldset-legend">نوع استخر</legend>
                    <select v-model="localCategory" class="select-custom">
                        <option value="">همه</option>
                        <option v-for="c in categories" :key="c.id" :value="String(c.id)">
                            {{ c.name }}
                        </option>
                    </select>
                </fieldset>
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">جستجو در نام</legend>
                    <input v-model="localName" type="text" class="input w-full" placeholder="نام استخر..." />
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
                                    :step="100_000" class="range range-primary range-xs flex-1" />
                            </div>
                            <div class="flex items-center gap-2 text-xs text-base-content/50">
                                <span class="shrink-0 w-8">تا</span>
                                <input v-model.number="localMaxPrice" type="range" :min="0" :max="priceMax"
                                    :step="100_000" class="range range-primary range-xs flex-1" />
                            </div>
                        </div>
                    </div>
                </fieldset>

                <div v-if="attributesLoading" class="flex justify-center py-2">
                    <span class="loading loading-dots loading-sm text-primary"></span>
                </div>
                <template v-else>
                    <fieldset v-for="attr in filterAttributes" :key="attr.id" class="fieldset gap-2">
                        <legend class="fieldset-legend w-full">
                            <button type="button"
                                class="flex w-full items-center justify-between gap-2 text-start cursor-pointer"
                                :aria-expanded="expandedAttributes[attr.id] ? 'true' : 'false'"
                                @click="toggleAttribute(attr.id)">
                                <span class="flex items-center gap-1.5">
                                    <ChevronDown class="size-3.5 text-primary transition-transform duration-200"
                                        :class="expandedAttributes[attr.id] ? 'rotate-180' : ''" />
                                    <span>{{ attr.name }}</span>
                                </span>
                                <span class="text-xs font-normal text-base-content/40">
                                    {{ attr.terms.length.toLocaleString('fa-IR') }}
                                </span>
                            </button>
                        </legend>
                        <Transition name="terms-expand">
                            <div v-if="expandedAttributes[attr.id]"
                                class="flex flex-col gap-2 max-h-44 overflow-y-auto pe-1">
                                <label v-for="term in visibleTerms(attr)" :key="term.id"
                                    class="flex items-center gap-2 text-sm text-base-content/70 cursor-pointer">
                                    <input v-model="localTerms" type="checkbox"
                                        class="checkbox checkbox-primary checkbox-sm" :value="term.id" />
                                    <span>{{ term.name }}</span>
                                </label>
                            </div>
                        </Transition>
                    </fieldset>
                </template>

                <button class="btn btn-primary w-full gap-2" @click="applyAndClose">
                    <Search class="size-4" />
                    اعمال فیلتر
                </button>
            </aside>

            <div class="lg:hidden fixed bottom-6 inset-x-4 z-40 flex justify-start">
                <button class="btn btn-primary shadow-lg gap-2 rounded-full px-6" @click="sidebarOpen = true">
                    <SlidersHorizontal class="size-4" />
                    فیلترها
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
                        <legend class="fieldset-legend">نوع استخر</legend>
                        <select v-model="localCategory" class="select-custom">
                            <option value="">همه</option>
                            <option v-for="c in categories" :key="c.id" :value="String(c.id)">
                                {{ c.name }}
                            </option>
                        </select>
                    </fieldset>

                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">جستجو در نام</legend>
                        <input v-model="localName" type="text" class="input w-full" placeholder="نام استخر..." />
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
                                    :step="100_000" class="range range-primary range-xs flex-1" />
                            </div>
                            <div class="flex items-center gap-2 text-xs text-base-content/50">
                                <span class="shrink-0 w-8">تا</span>
                                <input v-model.number="localMaxPrice" type="range" :min="0" :max="priceMax"
                                    :step="100_000" class="range range-primary range-xs flex-1" />
                            </div>
                        </div>
                    </fieldset>
                    <div v-if="attributesLoading" class="flex justify-center py-2">
                        <span class="loading loading-dots loading-sm text-primary"></span>
                    </div>

                    <template v-else>
                        <fieldset v-for="attr in filterAttributes" :key="attr.id" class="fieldset gap-2 cursor">
                            <legend class="fieldset-legend w-full curso">
                                <button type="button"
                                    class="btn flex w-full items-center justify-between gap-2 text-start"
                                    :aria-expanded="expandedAttributes[attr.id] ? 'true' : 'false'"
                                    @click="toggleAttribute(attr.id)">
                                    <span class="flex items-center gap-1.5">
                                        <ChevronDown class="size-3.5 text-primary transition-transform duration-200"
                                            :class="expandedAttributes[attr.id] ? 'rotate-180' : ''" />
                                        <span>{{ attr.name }}</span>
                                    </span>
                                    <span class="text-xs font-normal text-base-content/40">
                                        {{ attr.terms.length.toLocaleString('fa-IR') }}
                                    </span>
                                </button>
                            </legend>
                            <Transition name="terms-expand">
                                <div v-if="expandedAttributes[attr.id]" class="grid grid-cols-2 gap-2">
                                    <label v-for="term in visibleTerms(attr)" :key="term.id"
                                        class="flex items-center gap-2 text-sm text-base-content/70 cursor-pointer">
                                        <input v-model="localTerms" type="checkbox"
                                            class="checkbox checkbox-primary checkbox-sm" :value="term.id" />
                                        <span>{{ term.name }}</span>
                                    </label>
                                </div>
                            </Transition>
                        </fieldset>
                    </template>

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

            <div class="flex-1 min-w-0 flex flex-col gap-4">

                <div class="sticky top-35 z-20 flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-base-100 p-4 rounded-2xl border border-base-200/60 shadow-sm transition-all duration-200"
                    :class="resultHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0 pointer-events-none'">
                    <p class="text-sm text-base-content/60 shrink-0">
                        <template v-if="!loading">
                            <span class="font-semibold text-base-content">{{ total.toLocaleString('fa-IR') }}</span>
                            استخر یافت شد
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
                            :class="filters.sort === 'min-price' ? 'btn-primary' : 'btn-ghost text-base-content/70'"
                            @click="applyFilters({ sort: 'min-price' })">
                            کمترین قیمت
                        </button>

                        <button class="btn btn-xs rounded-lg font-medium transition-all"
                            :class="filters.sort === 'max-price' ? 'btn-primary' : 'btn-ghost text-base-content/70'"
                            @click="applyFilters({ sort: 'max-price' })">
                            بیشترین قیمت
                        </button>

                        <button class="btn btn-xs rounded-lg font-medium transition-all"
                            :class="filters.sort === 'max-rate' ? 'btn-primary' : 'btn-ghost text-base-content/70'"
                            @click="applyFilters({ sort: 'max-rate' })">
                            بیشترین امتیاز
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
                                    <div class="h-4 w-20 rounded-md bg-base-300/60" />
                                </div>

                                <div class="h-4 w-full rounded-md bg-base-300/50" />

                                <div class="flex flex-wrap gap-1 min-h-6">
                                    <div class="h-5 w-14 rounded-md bg-base-300/50" />
                                    <div class="h-5 w-16 rounded-md bg-base-300/50" />
                                    <div class="h-5 w-12 rounded-md bg-base-300/50" />
                                </div>

                                <div
                                    class="mt-auto pt-3 border-t border-base-200/70 flex items-center justify-between gap-3">
                                    <div class="h-4 flex-1 rounded-md bg-base-300/50" />
                                    <div class="h-4 w-20 rounded-md bg-base-300/50" />
                                </div>

                                <div class="flex items-center justify-between gap-4">
                                    <div class="flex flex-col gap-1.5">
                                        <div class="h-3 w-20 rounded-md bg-base-300/50" />
                                        <div class="h-5 w-28 rounded-md bg-base-300/70" />
                                    </div>
                                    <div class="h-8 w-20 rounded-xl bg-base-300/70" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Error -->
                    <div v-else-if="error"
                        class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
                        <div class="size-14 rounded-full bg-error/10 flex items-center justify-center">
                            <WifiOff class="size-6 text-error" />
                        </div>
                        <p class="font-medium text-base-content">خطا در دریافت اطلاعات</p>
                        <p class="text-sm text-base-content/50 max-w-xs leading-relaxed">
                            ارتباط با سرور برقرار نشد. اینترنت خود را بررسی کرده و دوباره تلاش کنید.
                        </p>
                        <button class="btn btn-sm btn-error btn-soft gap-2 mt-1" @click="fetchPools()">
                            <RefreshCw class="size-4" />
                            تلاش مجدد
                        </button>
                    </div>

                    <!-- Empty -->
                    <div v-else-if="pools.length === 0"
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
                        <PoolSearchCard v-for="pool in pools" :key="pool.id" :pool="pool" />
                    </div>

                    <div v-if="!error && pools.length > 0 && totalPages > 1"
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

        <FAQ title="سوالات متداول رزرو استخر" :items="faqs" :loading="mainLoading" />
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

.terms-expand-enter-active,
.terms-expand-leave-active {
    overflow: hidden;
    transition:
        max-height 0.22s ease,
        opacity 0.18s ease,
        transform 0.22s ease;
}

.terms-expand-enter-from,
.terms-expand-leave-to {
    max-height: 0;
    opacity: 0;
    transform: translateY(-0.25rem);
}

.terms-expand-enter-to,
.terms-expand-leave-from {
    max-height: 11rem;
    opacity: 1;
    transform: translateY(0);
}
</style>