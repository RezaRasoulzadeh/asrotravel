// pages/place/travel-guide/[slug]/search.vue
<script setup lang="ts">
import { X, ChevronLeft, ChevronRight, ChevronDown, SearchX, RefreshCw, WifiOff, SlidersHorizontal } from 'lucide-vue-next'
import PlaceSearchCard from '~/components/place/PlaceSearchCard.vue'

const route = useRoute()
const router = useRouter()
const { places, loading, error, total, totalPages, currentPage, filters, fetchPlaces, applyFilters, goToPage } = usePlaceSearch()
const { categories, loading: attrLoading, fetchAttributes } = usePlaceSearchAttributes()

useHead({ title: 'جستجوی جاذبه‌های گردشگری', meta: [{ name: 'description', content: 'جستجو و کشف جاذبه‌های گردشگری ایران' }] })

const sidebarOpen = ref(false)
const resultHeaderVisible = ref(true)
const expandedCategories = ref<Record<number, boolean>>({})
const locationSlug = computed(() => (Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug) ?? '')
const localCat = ref((route.query.cat as string) ?? '')

function isCatSelected(slug: string) { return localCat.value === slug }
function isChildSelected(parent: any) { return parent.childrens?.some((c: any) => c.slug && localCat.value === c.slug) ?? false }
function isParentOrChildSelected(parent: any) { return (parent.slug && isCatSelected(parent.slug)) || isChildSelected(parent) }
const validCategories = computed(() => categories.value?.filter(p => p.slug) ?? [])
function getValidChildren(parent: any) { return parent.childrens?.filter((c: any) => c.slug) ?? [] }
function toggleCategory(parent: any) { expandedCategories.value = { ...expandedCategories.value, [parent.id]: !expandedCategories.value[parent.id] } }

function commitCategoryFilter(slug: string) {
    localCat.value = slug
    router.replace({ query: { ...route.query, cat: slug || undefined } })
    applyFilters({ location: locationSlug.value || undefined, cat: slug || undefined })
    sidebarOpen.value = false
}

function selectParent(parent: any) {
    if (isParentOrChildSelected(parent)) commitCategoryFilter('')
    else {
        expandedCategories.value = { ...expandedCategories.value, [parent.id]: true }
        commitCategoryFilter(parent.slug || '')
    }
}

function clearFilters() {
    localCat.value = ''
    const nextQuery = { ...route.query }
    delete nextQuery.cat
    router.replace({ query: nextQuery })
    applyFilters({ location: locationSlug.value || undefined, cat: undefined })
    sidebarOpen.value = false
}

const activeFilterCount = computed(() => localCat.value ? 1 : 0)
const pages = computed(() => {
    const arr: (number | '...')[] = []
    const tp = totalPages.value, cp = currentPage.value
    if (tp <= 7) for (let i = 1; i <= tp; i++) arr.push(i)
    else {
        arr.push(1)
        if (cp > 3) arr.push('...')
        for (let i = Math.max(2, cp - 1); i <= Math.min(tp - 1, cp + 1); i++) arr.push(i)
        if (cp < tp - 2) arr.push('...')
        arr.push(tp)
    }
    return arr
})

onMounted(() => {
    window.addEventListener('scroll', () => { resultHeaderVisible.value = window.scrollY < 80 }, { passive: true })
    fetchAttributes(localCat.value)
    fetchPlaces({ location: locationSlug.value || undefined, cat: localCat.value || undefined, page: 1 })
})
</script>

<template>
    <div class="min-h-screen bg-base-200/40 mt-16">
        <div class="sticky top-16 z-30 bg-base-100/80 backdrop-blur-md border-b border-base-300/50 px-4 lg:px-16">
            <div class="max-w-960 mx-auto py-2.5">
                <div class="breadcrumbs text-xs text-base-content/60">
                    <ul>
                        <li>
                            <RouterLink to="/">صفحه اصلی</RouterLink>
                        </li>
                        <li>
                            <RouterLink :to="`/place/travel-guide/${locationSlug}`">{{ locationSlug }}</RouterLink>
                        </li>
                        <li class="text-base-content">جستجو</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="px-4 lg:px-16 max-w-960 mx-auto pb-16 flex gap-6 items-start">
            <aside
                class="hidden lg:flex flex-col gap-4 w-72 shrink-0 bg-base-100 rounded-2xl p-5 shadow-sm border border-base-200 sticky top-35">
                <div class="flex items-center justify-between">
                    <span class="font-bold text-base-content text-base">فیلترها</span>
                    <button v-if="activeFilterCount > 0" class="btn btn-ghost btn-xs text-error gap-1"
                        @click="clearFilters">
                        <X class="size-3.5" /> پاک کردن
                    </button>
                </div>
                <fieldset class="fieldset gap-2">
                    <legend class="fieldset-legend">دسته‌بندی</legend>
                    <div v-if="attrLoading" class="flex justify-center py-3"><span
                            class="loading loading-dots loading-sm text-primary"></span></div>
                    <div v-else class="flex flex-col gap-1">
                        <button type="button"
                            class="flex items-center gap-2 px-2 py-1.5 rounded-xl text-sm transition-colors"
                            :class="!localCat ? 'bg-primary/10 text-primary font-semibold' : 'text-base-content/70 hover:bg-base-200/70'"
                            @click="commitCategoryFilter('')">همه دسته‌ها</button>
                        <div v-for="parent in validCategories" :key="parent.id">
                            <button type="button"
                                class="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl text-sm transition-colors"
                                :class="isParentOrChildSelected(parent) ? 'bg-primary/10 text-primary font-semibold' : 'text-base-content/70 hover:bg-base-200/70'"
                                @click="getValidChildren(parent).length ? toggleCategory(parent) : selectParent(parent)">
                                <span class="text-start line-clamp-1">{{ parent.translate?.title }}</span>
                                <ChevronDown v-if="getValidChildren(parent).length"
                                    class="size-3.5 shrink-0 transition-transform duration-200 text-base-content/40"
                                    :class="expandedCategories[parent.id] || isParentOrChildSelected(parent) ? 'rotate-180' : ''" />
                            </button>
                            <Transition name="terms-expand">
                                <div v-if="(expandedCategories[parent.id] || isParentOrChildSelected(parent)) && getValidChildren(parent).length"
                                    class="flex flex-col gap-0.5 pr-3 mt-0.5">
                                    <button type="button"
                                        class="flex items-center gap-2 px-2 py-1 rounded-lg text-xs transition-colors"
                                        :class="isCatSelected(parent.slug) ? 'bg-primary/10 text-primary font-semibold' : 'text-base-content/50 hover:bg-base-200/60'"
                                        @click="commitCategoryFilter(parent.slug)">همه {{ parent.translate?.title
                                        }}</button>
                                    <button v-for="child in getValidChildren(parent)" :key="child.id" type="button"
                                        class="flex items-center gap-2 px-2 py-1 rounded-lg text-xs transition-colors"
                                        :class="isCatSelected(child.slug) ? 'bg-primary/10 text-primary font-semibold' : 'text-base-content/50 hover:bg-base-200/60'"
                                        @click="commitCategoryFilter(child.slug)">{{ child.translate?.title }}</button>
                                </div>
                            </Transition>
                        </div>
                    </div>
                </fieldset>
            </aside>
            <div class="lg:hidden fixed bottom-6 inset-x-4 z-40 flex justify-start"><button
                    class="btn btn-primary shadow-lg gap-2 rounded-full px-6" @click="sidebarOpen = true">
                    <SlidersHorizontal class="size-4" /> دسته‌بندی‌ها <span v-if="activeFilterCount > 0"
                        class="badge badge-error badge-sm">{{ activeFilterCount }}</span>
                </button></div>
            <Transition name="fade">
                <div v-if="sidebarOpen" class="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
                    @click="sidebarOpen = false" />
            </Transition>
            <Transition name="slide-up">
                <div v-if="sidebarOpen"
                    class="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-base-100 rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto flex flex-col gap-4">
                    <div class="flex items-center justify-between mb-1"><span
                            class="font-bold text-base-content text-base">دسته‌بندی‌ها</span><button
                            class="btn btn-ghost btn-sm btn-circle" @click="sidebarOpen = false">
                            <X class="size-4" />
                        </button></div>
                    <fieldset class="fieldset gap-2">
                        <div v-if="attrLoading" class="flex justify-center py-3"><span
                                class="loading loading-dots loading-sm text-primary"></span></div>
                        <div v-else class="flex flex-col gap-1">
                            <button type="button"
                                class="flex items-center gap-2 px-2 py-1.5 rounded-xl text-sm transition-colors"
                                :class="!localCat ? 'bg-primary/10 text-primary font-semibold' : 'text-base-content/70 hover:bg-base-200/70'"
                                @click="commitCategoryFilter('')">همه دسته‌ها</button>
                            <div v-for="parent in validCategories" :key="parent.id">
                                <button type="button"
                                    class="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl text-sm transition-colors"
                                    :class="isParentOrChildSelected(parent) ? 'bg-primary/10 text-primary font-semibold' : 'text-base-content/70 hover:bg-base-200/70'"
                                    @click="getValidChildren(parent).length ? toggleCategory(parent) : selectParent(parent)">
                                    <span class="text-start line-clamp-1">{{ parent.translate?.title }}</span>
                                    <ChevronDown v-if="getValidChildren(parent).length"
                                        class="size-3.5 shrink-0 transition-transform duration-200 text-base-content/40"
                                        :class="expandedCategories[parent.id] || isParentOrChildSelected(parent) ? 'rotate-180' : ''" />
                                </button>
                                <Transition name="terms-expand">
                                    <div v-if="(expandedCategories[parent.id] || isParentOrChildSelected(parent)) && getValidChildren(parent).length"
                                        class="grid grid-cols-2 gap-1 pr-3 mt-0.5">
                                        <button type="button"
                                            class="flex items-center gap-2 px-2 py-1 rounded-lg text-xs transition-colors col-span-2"
                                            :class="isCatSelected(parent.slug) ? 'bg-primary/10 text-primary font-semibold' : 'text-base-content/50 hover:bg-base-200/60'"
                                            @click="commitCategoryFilter(parent.slug)">همه {{ parent.translate?.title
                                            }}</button>
                                        <button v-for="child in getValidChildren(parent)" :key="child.id" type="button"
                                            class="flex items-center gap-2 px-2 py-1 rounded-lg text-xs transition-colors"
                                            :class="isCatSelected(child.slug) ? 'bg-primary/10 text-primary font-semibold' : 'text-base-content/50 hover:bg-base-200/60'"
                                            @click="commitCategoryFilter(child.slug)">{{ child.translate?.title
                                            }}</button>
                                    </div>
                                </Transition>
                            </div>
                        </div>
                    </fieldset>
                </div>
            </Transition>
            <div class="flex-1 min-w-0 flex flex-col gap-4">
                <div class="sticky top-35 z-20 flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-base-100 p-4 rounded-2xl border border-base-200/60 shadow-sm transition-all duration-200"
                    :class="resultHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0 pointer-events-none'">
                    <p class="text-sm text-base-content/60 shrink-0">
                        <template v-if="!loading"><span class="font-semibold text-base-content">{{
                                total.toLocaleString('fa-IR') }}</span> مکان یافت شد</template>
                        <template v-else><span class="loading loading-dots loading-xs align-middle"></span></template>
                    </p>
                    <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                        <span class="text-xs text-base-content/50 ml-1 whitespace-nowrap">مرتب‌سازی:</span>
                        <button class="btn btn-xs rounded-lg font-medium transition-all"
                            :class="(!filters.sort || filters.sort === 'default') ? 'btn-primary' : 'btn-ghost text-base-content/70'"
                            @click="applyFilters({ sort: 'default' })">پیش‌فرض</button>
                        <button class="btn btn-xs rounded-lg font-medium transition-all"
                            :class="filters.sort === 'most-viewed' ? 'btn-primary' : 'btn-ghost text-base-content/70'"
                            @click="applyFilters({ sort: 'most-viewed' })">بیشترین بازدید</button>
                        <button class="btn btn-xs rounded-lg font-medium transition-all"
                            :class="filters.sort === 'most-liked' ? 'btn-primary' : 'btn-ghost text-base-content/70'"
                            @click="applyFilters({ sort: 'most-liked' })">محبوب‌ترین</button>
                        <button class="btn btn-xs rounded-lg font-medium transition-all"
                            :class="filters.sort === 'max-rate' ? 'btn-primary' : 'btn-ghost text-base-content/70'"
                            @click="applyFilters({ sort: 'max-rate' })">بیشترین امتیاز</button>
                    </div>
                </div>
                <div>
                    <div v-if="loading"
                        class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pt-6">
                        <div v-for="n in 6" :key="n"
                            class="bg-base-100 rounded-2xl overflow-hidden border border-base-200 shadow-sm flex flex-col h-104 animate-pulse">
                            <div class="h-44 shrink-0 bg-base-300/70" />
                            <div class="flex flex-col flex-1 p-4 gap-3">
                                <div class="h-5 w-4/5 rounded-md bg-base-300/70" />
                                <div class="flex items-center gap-2">
                                    <div class="h-5 w-14 rounded-md bg-base-300/60" />
                                    <div class="h-4 w-28 rounded-md bg-base-300/60" />
                                </div>
                                <div class="h-4 w-full rounded-md bg-base-300/50" />
                                <div
                                    class="mt-auto pt-3 border-t border-base-200/70 flex items-center justify-between gap-3">
                                    <div class="h-4 flex-1 rounded-md bg-base-300/50" />
                                    <div class="h-4 w-24 rounded-md bg-base-300/50" />
                                </div>
                                <div class="flex items-center justify-between gap-4">
                                    <div class="h-5 w-24 rounded-md bg-base-300/70" />
                                    <div class="h-8 w-24 rounded-xl bg-base-300/70" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="error"
                        class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
                        <div class="size-14 rounded-full bg-error/10 flex items-center justify-center">
                            <WifiOff class="size-6 text-error" />
                        </div>
                        <p class="font-medium text-base-content">خطا در دریافت اطلاعات</p>
                        <button class="btn btn-sm btn-error btn-soft gap-2 mt-1" @click="fetchPlaces()">
                            <RefreshCw class="size-4" /> تلاش مجدد
                        </button>
                    </div>
                    <div v-else-if="places.length === 0"
                        class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
                        <div class="size-14 rounded-full bg-base-200 flex items-center justify-center">
                            <SearchX class="size-6 text-base-content/40" />
                        </div>
                        <p class="font-medium text-base-content">نتیجه‌ای یافت نشد</p>
                    </div>
                    <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pt-6">
                        <PlaceSearchCard v-for="place in places" :key="place.id" :place="place" />
                    </div>
                    <div v-if="!error && places.length > 0 && totalPages > 1"
                        class="flex justify-center items-center gap-1 mt-6 flex-wrap">
                        <button class="btn btn-ghost btn-sm btn-circle" :disabled="currentPage <= 1"
                            @click="goToPage(currentPage - 1)">
                            <ChevronRight class="size-4" />
                        </button>
                        <template v-for="p in pages" :key="p">
                            <span v-if="p === '...'" class="px-2 text-base-content/40 text-sm">…</span>
                            <button v-else class="btn btn-sm btn-circle"
                                :class="p === currentPage ? 'btn-primary' : 'btn-ghost'"
                                @click="goToPage(p as number)">{{ (p as number).toLocaleString('fa-IR') }}</button>
                        </template>
                        <button class="btn btn-ghost btn-sm btn-circle" :disabled="currentPage >= totalPages"
                            @click="goToPage(currentPage + 1)">
                            <ChevronLeft class="size-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>