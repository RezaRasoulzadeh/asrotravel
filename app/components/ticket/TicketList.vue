// components/ticket/TicketList.vue
<script setup lang="ts">
import { ArrowLeft, ChevronLeft, ChevronRight, TicketIcon, RefreshCw, SearchX, WifiOff } from 'lucide-vue-next'
import TicketCard from './TicketCard.vue'
import type { Ticket, GroupTicketResponse } from '~/types/ticket.types.js'

const props = withDefaults(defineProps<{
  tickets?: Ticket[] | null
  title?: string | null
  tab_active?: boolean
}>(), {
  tab_active: true,
})

const isPropMode = computed(() => props.tickets != null)
const active_tab = computed(() => props.tab_active)

const tabs = [
  { rel: 'popular',   label: 'محبوب‌ترین‌ها' },
  { rel: 'featured',  label: 'پیشنهاد ویژه'  },
  { rel: 'low_price', label: 'ارزان‌ترین‌ها' },
  { rel: 'new',       label: 'جدیدترین‌ها'   },
]

const activeRel = ref('popular')
const carouselRef = ref<HTMLElement | null>(null)

const { data, status, error, refresh } = await useFetch<GroupTicketResponse>('/api/ticket/group-ticket', {
  query: { rel: activeRel },
  watch: [activeRel],
  immediate: !isPropMode.value,
  lazy: true
})

const tickets = computed<Ticket[]>(() => isPropMode.value ? (props.tickets ?? []) : (data.value?.data ?? []))
const title = computed(() => props.title ?? data.value?.title ?? '')

async function selectTab(rel: string) {
  activeRel.value = rel
}

function scrollCarousel(direction: 'prev' | 'next') {
  const el = carouselRef.value
  if (!el) return
  const amount = el.clientWidth * 0.75
  el.scrollBy({ left: direction === 'next' ? -amount : amount, behavior: 'smooth' })
}
</script>

<template>
  <section class="py-4 mt-4 px-4 lg:px-16">
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between flex-wrap gap-3 px-4 md:px-0">
        <h2 class="text-xl font-bold text-base-content">{{ title || 'مجتمع‌های تفریحی' }}</h2>
      </div>

      <div v-if="active_tab" class="hidden md:flex items-center justify-between flex-wrap gap-3 px-4 md:px-0">
        <div class="hidden md:flex items-center gap-2 flex-wrap px-4 md:px-0">
          <button
            v-for="tab in tabs" :key="tab.rel"
            class="btn btn-sm transition-all duration-200"
            :class="activeRel === tab.rel ? 'btn-primary shadow-sm' : 'btn-ghost text-base-content/60 hover:text-base-content'"
            @click="selectTab(tab.rel)">
            {{ tab.label }}
          </button>
        </div>
        <NuxtLink to="/ticket/search" class="btn btn-dash btn-sm text-primary hover:btn-primary hover:text-primary-content gap-1">
          مشاهده همه
          <ArrowLeft class="size-5" />
        </NuxtLink>
      </div>

      <div v-if="active_tab" class="md:hidden px-4">
        <select v-model="activeRel" class="select-custom" @change="selectTab(activeRel)">
          <option v-for="tab in tabs" :key="tab.rel" :value="tab.rel">{{ tab.label }}</option>
        </select>
      </div>

      <div v-if="status === 'pending'" class="flex gap-4 overflow-hidden px-4 md:px-0">
        <div v-for="i in 5" :key="i" class="card bg-base-200 overflow-hidden animate-pulse shrink-0 w-[84vw] sm:w-[44vw] md:w-84">
          <div class="aspect-video bg-base-300" />
          <div class="p-4 flex flex-col gap-3">
            <div class="h-4 bg-base-300 rounded-lg w-3/4" />
            <div class="h-3 bg-base-300 rounded-lg w-1/2" />
          </div>
        </div>
      </div>

      <div v-else-if="error" class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
        <div class="size-14 rounded-full bg-error/10 flex items-center justify-center">
          <WifiOff class="size-6 text-error" />
        </div>
        <p class="font-medium text-base-content">خطا در دریافت اطلاعات</p>
        <button class="btn btn-sm btn-error btn-soft gap-2 mt-1 cursor-pointer" @click="refresh()">
          <RefreshCw class="size-4" /> تلاش مجدد
        </button>
      </div>

      <div v-else-if="tickets.length === 0" class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
        <div class="size-14 rounded-full bg-base-200 flex items-center justify-center">
          <SearchX class="size-6 text-base-content/40" />
        </div>
        <p class="font-medium text-base-content">نتیجه‌ای یافت نشد</p>
      </div>

      <div v-else class="relative group/carousel">
        <button class="hidden md:flex absolute inset-s-0 top-[45%] -translate-y-1/2 translate-x-1/2 z-10 btn btn-circle btn-sm bg-base-100 shadow-md border border-base-200 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200" aria-label="قبلی" @click="scrollCarousel('prev')">
          <ChevronRight class="size-5" />
        </button>
        <button class="hidden md:flex absolute inset-e-0 top-[45%] -translate-y-1/2 -translate-x-1/2 z-10 btn btn-circle btn-sm bg-base-100 shadow-md border border-base-200 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200" aria-label="بعدی" @click="scrollCarousel('next')">
          <ChevronLeft class="size-5" />
        </button>

        <div ref="carouselRef" class="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pt-3 pb-10 px-4 md:px-0" style="scrollbar-width: none; -ms-overflow-style: none;">
          <div v-for="ticket in tickets" :key="ticket.id" class="shrink-0 snap-start w-[72vw] sm:w-[44vw] md:w-72 lg:w-80">
            <TicketCard :ticket="ticket" />
          </div>
          <div class="shrink-0 snap-start w-[52vw] sm:w-[30vw] md:w-52 self-stretch">
            <NuxtLink to="/ticket/search" class="h-full w-full rounded-3xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-3 text-primary/60 hover:text-primary hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 p-6">
              <TicketIcon class="size-9" />
              <span class="text-sm font-medium text-center leading-snug">مشاهده همه</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>