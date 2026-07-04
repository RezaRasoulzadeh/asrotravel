// components/pool/VipSanseCalendar.vue
<script setup lang="ts">
import { CalendarDays, Clock, WifiOff, SearchX, RefreshCw, Tag, CheckCircle2, Ban, Loader, ChevronRight, ChevronLeft } from 'lucide-vue-next'
import type { VipSanseService, VipChangeDateSlot } from '~/types/poolSingle.types'

type SansSlot = VipChangeDateSlot

interface DayTab {
  isoDate: string
  label: string
  dateLabel: string
  slots: SansSlot[]
}

const props = defineProps<{
  service: VipSanseService
  poolId: number
  poolTitle: string
  poolSlug: string
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const allSlots = ref<SansSlot[]>([])
const selectedDay = ref<string>('')
const weekOffset = ref(0)

let abortController: AbortController | null = null

function toIranISO(date: Date): string {
  const local = new Date(date.getTime() + 3.5 * 60 * 60000)
  return local.toISOString().replace('Z', '+03:30')
}

function isoDateKey(isoString: string): string {
  return isoString.slice(0, 10)
}

function iranTodayStart(): Date {
  const iranNow = new Date(Date.now() + 3.5 * 60 * 60000)
  iranNow.setUTCHours(0, 0, 0, 0)
  return new Date(iranNow.getTime() - 3.5 * 60 * 60000)
}

const weekWindow = computed(() => {
  const weekMs = 7 * 24 * 60 * 60 * 1000
  const start = new Date(iranTodayStart().getTime() + weekOffset.value * weekMs)
  const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000)
  const fmt = (d: Date) => d.toLocaleDateString('fa-IR', { month: '2-digit', day: '2-digit' })
  return { start: fmt(start), end: fmt(end) }
})

const canGoPrev = computed(() => weekOffset.value > 0)

function prevWeek() {
  if (!canGoPrev.value) return
  weekOffset.value--
  selectedDay.value = ''
  fetchSlots()
}

function nextWeek() {
  weekOffset.value++
  selectedDay.value = ''
  fetchSlots()
}

async function fetchSlots() {
  abortController?.abort()
  abortController = new AbortController()
  const signal = abortController.signal

  loading.value = true
  error.value = null
  allSlots.value = []

  try {
    const weekMs = 7 * 24 * 60 * 60 * 1000
    const windowStart = new Date(iranTodayStart().getTime() + weekOffset.value * weekMs)
    const windowEnd = new Date(windowStart.getTime() + weekMs)

    const result = await safeApiFetch<SansSlot[]>(
      `/api/pool/${props.service.id}/vip-change-date`,
      {
        query: {
          start: toIranISO(windowStart),
          end: toIranISO(windowEnd),
        },
        signal,
      },
    )

    if (signal.aborted) return
    if (result.error) throw new Error(result.error)

    allSlots.value = Array.isArray(result.data) ? result.data : []

    const firstDay = groupDays(allSlots.value)[0]?.isoDate ?? ''
    if (firstDay) selectedDay.value = firstDay
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === 'AbortError') return
    error.value = e instanceof Error ? e.message : 'خطا در دریافت اطلاعات'
  } finally {
    if (!signal.aborted) loading.value = false
  }
}

function groupDays(slots: SansSlot[]): DayTab[] {
  const map = new Map<string, DayTab>()
  for (const slot of slots) {
    if (slot?.start == null) continue
    const key = isoDateKey(slot.start)
    if (!map.has(key)) {
      map.set(key, { isoDate: key, label: slot.day?.day_name ?? '', dateLabel: slot.day?.day_date ?? '', slots: [] })
    }
    map.get(key)!.slots.push(slot)
  }
  return Array.from(map.values())
}

const days = computed<DayTab[]>(() => groupDays(allSlots.value))

const selectedSlots = computed<SansSlot[]>(() =>
  days.value.find(d => d.isoDate === selectedDay.value)?.slots ?? []
)

type SlotStatus = 'available' | 'processing' | 'full'

function slotStatus(slot: SansSlot): SlotStatus {
  const classes = [...(slot.classNames ?? []), ...(slot.eventClassNames ?? [])]
  if (classes.includes('full-book-event')) return 'full'
  if (slot.active === 0) return 'processing'
  return 'available'
}

function formatPrice(value: string | number | null | undefined) {
  if (value == null) return '0'
  return Number(value).toLocaleString('fa-IR')
}

function displayPrice(slot: SansSlot): string {
  const price = Number(slot.price_per_sans ?? 0)
  const offer = Number(slot.offer ?? 0)
  return formatPrice((price - offer) / 10)
}

function hasOffer(slot: SansSlot): boolean {
  return Number(slot.offer ?? 0) > 0
}

function basePrice(slot: SansSlot): string {
  return formatPrice(Number(slot.price_per_sans ?? 0) / 10)
}

function handleBuy(slot: SansSlot) {
  if (slotStatus(slot) !== 'available') return
  navigateTo({
    path: '/cart/vip-detail',
    state: {
      selectedSlot: JSON.parse(JSON.stringify(slot)),
      serviceId: Number(slot.service_id),

      serviceName: props.service.service_features?.name ?? '',
      genderCode: props.service.service_features?.gender ?? 'any',
      guestCapacity: Number(
        props.service.service_features?.max_guest_capacity ??
        props.service.service_features?.guest_capacity ??
        6,
      ),
      parent: {
        title: props.poolTitle,
        slug: props.poolSlug,
      },
    },
  })
}

onMounted(fetchSlots)
onUnmounted(() => abortController?.abort())
</script>

<template>
  <div class="mt-4 border-t border-base-200 pt-4 space-y-4" dir="rtl">

    <div class="flex items-center gap-2">
      <CalendarDays :size="16" class="text-primary shrink-0" />
      <span class="text-sm font-semibold text-base-content">انتخاب سانس</span>

      <div class="flex items-center gap-1 me-auto">
        <button
          @click="prevWeek"
          :disabled="!canGoPrev || loading"
          class="btn btn-xs btn-ghost disabled:opacity-30">
          <ChevronRight :size="14" />
        </button>

        <span class="text-[11px] text-base-content/50 tabular-nums text-center min-w-24 leading-tight">
          <template v-if="weekOffset === 0">این هفته</template>
          <template v-else>هفته {{ weekOffset.toLocaleString('fa-IR') }}+</template>
          <br />
          <span class="text-base-content/35">{{ weekWindow.start }} – {{ weekWindow.end }}</span>
        </span>

        <button
          @click="nextWeek"
          :disabled="loading"
          class="btn btn-xs btn-ghost">
          <ChevronLeft :size="14" />
        </button>
      </div>

      <button v-if="!loading" @click="fetchSlots"
        class="btn btn-xs btn-ghost text-base-content/40 hover:text-primary">
        <RefreshCw :size="13" />
      </button>
      <Loader v-else :size="13" class="animate-spin text-primary me-1 shrink-0" />
    </div>

    <div v-if="loading && !allSlots.length"
      class="flex flex-col items-center justify-center py-10 gap-3 text-center px-4">
      <Loader :size="26" class="animate-spin text-primary" />
      <p class="text-base-content/50 text-xs">در حال بارگذاری سانس‌ها...</p>
    </div>

    <div v-else-if="error"
      class="flex flex-col items-center justify-center py-10 gap-3 text-center px-4 bg-error/5 rounded-2xl border border-error/15">
      <span class="bg-error/10 rounded-full p-3 text-error">
        <WifiOff :size="22" />
      </span>
      <p class="text-base-content text-xs font-medium">{{ error }}</p>
      <p class="text-base-content/50 text-xs">دریافت سانس‌ها ناموفق بود</p>
      <button @click="fetchSlots" class="btn btn-sm btn-error btn-soft gap-1.5">
        <RefreshCw :size="13" />
        تلاش مجدد
      </button>
    </div>

    <div v-else-if="!loading && !days.length"
      class="flex flex-col items-center justify-center py-10 gap-3 text-center px-4">
      <span class="bg-base-200 rounded-full p-3 text-base-content/30">
        <SearchX :size="22" />
      </span>
      <p class="text-base-content/50 text-xs">سانسی برای این هفته یافت نشد</p>
    </div>

    <template v-else-if="days.length">
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        <button
          v-for="day in days"
          :key="day.isoDate"
          @click="selectedDay = day.isoDate"
          class="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border text-xs font-medium shrink-0 transition-all duration-150 cursor-pointer"
          :class="selectedDay === day.isoDate
            ? 'bg-primary text-primary-content border-primary shadow-sm'
            : 'bg-base-100 border-base-200 text-base-content/60 hover:border-primary/40 hover:text-base-content'">
          <span class="text-[11px] font-bold">{{ day.label }}</span>
          <span class="text-[10px] opacity-75">{{ day.dateLabel }}</span>
        </button>
      </div>

      <div v-if="selectedSlots.length" class="space-y-2">
        <div
          v-for="slot in selectedSlots"
          :key="slot.start"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-150"
          :class="{
            'bg-base-100 border-base-200 hover:border-primary/30': slotStatus(slot) === 'available',
            'bg-base-200/60 border-base-200 opacity-60':           slotStatus(slot) === 'processing',
            'bg-base-200/40 border-base-200 opacity-50':           slotStatus(slot) === 'full',
          }">

          <span class="flex items-center gap-1 text-xs text-base-content/60 shrink-0">
            <Clock :size="12" />
            {{ slot.time_display }}
          </span>

          <span class="flex items-center gap-1 text-xs shrink-0"
            :class="{
              'text-success': slotStatus(slot) === 'available',
              'text-warning': slotStatus(slot) === 'processing',
              'text-error':   slotStatus(slot) === 'full',
            }">
            <CheckCircle2 v-if="slotStatus(slot) === 'available'" :size="12" />
            <Loader v-else-if="slotStatus(slot) === 'processing'" :size="12" class="animate-spin" />
            <Ban v-else :size="12" />
            <span class="hidden sm:inline">
              {{ slotStatus(slot) === 'available' ? 'خالی' : slotStatus(slot) === 'processing' ? 'در پردازش' : 'پر' }}
            </span>
          </span>

          <div class="flex flex-col items-end me-auto" v-if="slotStatus(slot) === 'available'">
            <span v-if="hasOffer(slot)" class="text-[10px] text-base-content/40 line-through leading-none">
              {{ basePrice(slot) }} ت
            </span>
            <span class="text-xs font-bold text-primary leading-tight flex items-center gap-0.5">
              <Tag v-if="hasOffer(slot)" :size="10" class="text-error" />
              {{ displayPrice(slot) }} تومان
            </span>
          </div>
          <span v-else class="text-xs text-base-content/40 me-auto">—</span>

          <button v-if="slotStatus(slot) === 'available'" class="btn btn-sm btn-primary shrink-0 px-6 lg:px-10"
            @click="handleBuy(slot)">
            رزرو
          </button>
          <span v-else class="btn btn-xs btn-ghost btn-disabled shrink-0 opacity-40 cursor-not-allowed">
            {{ slotStatus(slot) === 'processing' ? 'در انتظار' : 'ناموجود' }}
          </span>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center py-6 gap-2 text-center">
        <span class="bg-base-200 rounded-full p-3 text-base-content/30">
          <SearchX :size="18" />
        </span>
        <p class="text-base-content/50 text-xs">سانسی برای این روز موجود نیست</p>
      </div>
    </template>

  </div>
</template>