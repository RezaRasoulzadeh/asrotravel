// components/hotel/HotelRoomsSection.vue
<script setup lang="ts">
import {
  BedDouble, Users, Baby, Plus,
  ChevronDown, AlertCircle, RefreshCw,
  ShieldCheck, BadgeInfoIcon, Calendar,
} from 'lucide-vue-next'
import type { HotelRoom, HotelRoomSearchParams } from '~/types/hotelSingle.types'
import PersianDateRangePicker from '../ui/PersianDateRangePicker.vue'
import GuestCountPicker from '../ui/GuestCountPicker.vue'

const props = defineProps<{
  loading?: boolean
  rooms: HotelRoom[]
  error?: boolean
  params: HotelRoomSearchParams
}>()

const emit = defineEmits<{
  (e: 'search', val?: Partial<HotelRoomSearchParams>): void
  (e: 'update:params', val: HotelRoomSearchParams): void
}>()

const PLACEHOLDER = '/placeholder.png'

const localStartDate = ref(props.params.start_date)
const localEndDate = ref(props.params.end_date)
const localAdults = ref(props.params.adults)
const localChildren = ref(props.params.children)

const { jalaliStart, jalaliEnd, parseJalaliPair } = useJalaliDates(localStartDate, localEndDate)

const guestValue = computed(() => ({
  adults: localAdults.value,
  kids: localChildren.value,
}))

function onGuestsChange(val: { adults: number; kids: number }) {
  localAdults.value = val.adults
  localChildren.value = val.kids
}

function handleDateRangeChange(payload: { start: string; end: string }) {
  const { gregorianStart, gregorianEnd } = parseJalaliPair(payload.start, payload.end)
  localStartDate.value = gregorianStart
  localEndDate.value = gregorianEnd
}

function handleSearchClick() {
  const nextParams = {
    ...props.params,
    start_date: localStartDate.value,
    end_date: localEndDate.value,
    adults: localAdults.value,
    children: localChildren.value,
  }

  emit('update:params', nextParams)
  emit('search', nextParams)
}

watch(() => props.params, (newParams) => {
  localStartDate.value = newParams.start_date
  localEndDate.value = newParams.end_date
  localAdults.value = newParams.adults
  localChildren.value = newParams.children
}, { deep: true })

const expandedFeatures = ref<Set<number>>(new Set())
function toggleFeatures(id: number) {
  expandedFeatures.value.has(id) ? expandedFeatures.value.delete(id) : expandedFeatures.value.add(id)
}

function offerPercent(room: HotelRoom): number {
  if (!room.price || !room.price_with_offer || room.price <= room.price_with_offer) return 0
  return Math.ceil(((room.price - room.price_with_offer) / room.price) * 100)
}

function parsePersianPrice(htmlString: string): string {
  if (!htmlString) return ''
  
  const match = htmlString.match(/\/(\d+)\s*nights/i)
  let nightsText = ''
  if (match && match[1]) {
    const nightsNum = parseInt(match[1], 10)
    nightsText = ` / ${nightsNum.toLocaleString('fa-IR')} شب`
  }
  
  const cleanedPrice = htmlString
    .replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '')
    .replace(/<[^>]*>/g, '') 
    .replace(/toman/gi, '') 
    .replace(/تومان/g, '')
    .trim()

  return `${cleanedPrice} تومان${nightsText}`
}

function handleImageError(e: Event) {
  (e.target as HTMLImageElement).src = PLACEHOLDER
}

const hasSearched = computed(() => !!props.params.start_date && !!props.params.end_date)
const showLoading = computed(() =>
  !!props.loading &&
  hasSearched.value &&
  !props.error
)
</script>

<template>
  <section id="rooms-section" class="py-8">
    <div class="max-w-960 mx-auto space-y-6">

      <div class="flex items-start gap-2">
        <span class="bg-primary/10 text-primary rounded-full p-2">
          <BedDouble :size="20" />
        </span>
        <h2 class="text-lg font-bold text-base-content">انتخاب اتاق</h2>
      </div>

      <div class="bg-base-200/60 rounded-3xl border border-base-200 p-4 lg:p-6">
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-4 items-end">
          
          <PersianDateRangePicker
            :start-value="jalaliStart"
            :end-value="jalaliEnd"
            @update:start-value="(val: string) => handleDateRangeChange({ start: val, end: '' })"
            @change="handleDateRangeChange"
          />

          <fieldset class="fieldset min-w-48 w-full lg:w-auto">
            <legend class="fieldset-legend">مهمانان</legend>
            <GuestCountPicker
              :model-value="guestValue"
              adult-label="بزرگسال"
              kid-label="کودک"
              adult-explanation="۱۲ سال به بالا"
              kid-explanation="زیر ۱۲ سال"
              @update:model-value="onGuestsChange"
            />
          </fieldset>

          <button
            class="btn btn-primary rounded-xl h-12 font-bold w-full lg:w-auto min-w-36 cursor-pointer gap-2"
            :disabled="!localStartDate || !localEndDate || showLoading"
            @click="handleSearchClick">
            <RefreshCw v-if="showLoading" class="size-4 animate-spin" />
            <Calendar v-else class="size-4" />
            {{ showLoading ? 'در حال جستجو...' : 'جستجوی اتاق' }}
          </button>

        </div>
      </div>

      <div v-if="showLoading" class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
        <RefreshCw :size="28" class="animate-spin text-primary" />
        <p class="text-base-content/60 text-sm">در حال بارگذاری اتاق‌ها...</p>
      </div>

      <div v-else-if="error"
        class="flex flex-col items-center justify-center py-12 gap-4 text-center px-4 border border-error/20 bg-error/5 rounded-2xl">
        <span class="bg-error/10 rounded-full p-4 text-error">
          <AlertCircle :size="28" />
        </span>
        <div class="space-y-1">
          <p class="text-base-content font-medium text-sm">خطا در دریافت اتاق‌ها</p>
          <p class="text-base-content/60 text-xs">لطفاً دوباره جستجو کنید</p>
        </div>
        <button @click="handleSearchClick" class="btn btn-sm btn-error btn-outline gap-1.5 rounded-xl">
          <RefreshCw :size="14" />
          تلاش مجدد
        </button>
      </div>

      <div v-else-if="!hasSearched"
        class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4 border border-dashed border-base-300 rounded-2xl">
        <span class="bg-base-200 rounded-full p-4 text-base-content/30">
          <Calendar :size="28" />
        </span>
        <p class="text-base-content/50 text-sm">تاریخ ورود و خروج را انتخاب کنید تا اتاق‌های موجود نمایش داده شوند</p>
      </div>

      <div v-else-if="!rooms.length"
        class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4 border border-dashed border-base-300 rounded-2xl">
        <span class="bg-base-200 rounded-full p-4 text-base-content/30">
          <BedDouble :size="28" />
        </span>
        <p class="text-base-content/50 text-sm">اتاق موجودی برای تاریخ انتخابی وجود ندارد</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div v-for="(room, index) in rooms" :key="room.id"
          class="card bg-base-100 border border-base-200 shadow-sm overflow-hidden field-animate card-lift flex flex-col"
          :style="{ '--fi': index }">

          <div class="grid grid-cols-1 sm:grid-cols-[13rem_1fr]">
            <div class="bg-base-200 overflow-hidden w-full h-48 sm:h-full relative group min-h-48">
              <img 
                :src="room.image?.image_url || PLACEHOLDER" 
                :alt="room.title"
                @error="handleImageError"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
              />
              <div v-if="offerPercent(room) > 0"
                class="absolute top-3 right-3 w-12 h-12 rounded-xl bg-error text-primary-content flex flex-col items-center justify-center font-black shadow-md rotate-3">
                <span class="text-sm leading-none">{{ offerPercent(room).toLocaleString('fa-IR') }}٪</span>
                <span class="text-[8px] font-bold opacity-80 mt-0.5">تخفیف</span>
              </div>
            </div>

            <div class="flex flex-col gap-3 p-4">
              <h3 class="font-bold text-base text-start text-base-content leading-relaxed">{{ room.title }}</h3>

              <div class="flex flex-wrap items-center gap-2 text-[11px] text-base-content/60">
                <span class="flex items-center gap-1 bg-base-200 px-2.5 py-1 rounded-full">
                  <Users class="size-3" />
                  {{ room.adults.toLocaleString('fa-IR') }} بزرگسال
                </span>
                <span class="flex items-center gap-1 bg-base-200 px-2.5 py-1 rounded-full">
                  <Baby class="size-3" />
                  {{ room.children.toLocaleString('fa-IR') }} کودک
                </span>
                <span v-if="room.extra_person" class="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                  <Plus class="size-3" />
                  {{ room.extra_person_price_text }} / نفر اضافه
                </span>
              </div>

              <div class="flex flex-col gap-0.5 mt-auto text-start">
                <span v-if="offerPercent(room) > 0" class="text-base-content/40 line-through text-xs">
                  {{ parsePersianPrice(room.price_html) }}
                </span>
                <span class="text-primary font-bold text-lg">
                  {{ parsePersianPrice(room.price_with_offer_html) }}
                </span>
              </div>

              <button
                class="btn btn-sm w-full gap-1.5 mt-1"
                :class="room.is_online ? 'btn-primary' : 'btn-primary btn-outline'"
                :disabled="room.number < 1">
                <BedDouble :size="14" />
                {{ room.number < 1 ? 'ظرفیت تکمیل' : (room.is_online ? 'رزرو آنلاین' : 'رزرو تلفنی') }}
              </button>
            </div>
          </div>

          <div class="border-t border-base-200 mt-auto" v-if="room.term_features.length">
            <button
              class="w-full flex items-center justify-between px-4 py-2.5 text-xs text-base-content/70 hover:bg-base-200/40 transition-colors cursor-pointer"
              @click="toggleFeatures(room.id)">
              <span class="flex items-center gap-1.5">
                <BadgeInfoIcon :size="13" class="text-primary" />
                امکانات اتاق ({{ room.term_features.length.toLocaleString('fa-IR') }} مورد)
              </span>
              <ChevronDown :size="14"
                class="transition-transform duration-200"
                :class="{ 'rotate-180': expandedFeatures.has(room.id) }" />
            </button>
            <div class="grid transition-all duration-200 ease-in-out"
              :class="expandedFeatures.has(room.id) ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
              <div class="overflow-hidden">
                <div class="px-4 pb-3 flex flex-wrap gap-2">
                  <span v-for="feat in room.term_features" :key="feat.name"
                    class="inline-flex items-center gap-1 text-[11px] bg-base-200 text-base-content/70 px-2.5 py-1 rounded-full">
                    <ShieldCheck :size="10" class="text-primary" />
                    {{ feat.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </section>
</template>
