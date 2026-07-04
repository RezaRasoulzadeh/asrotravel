// components/pool/VipSanseSecion.vue
<script setup lang="ts">
import { Crown, Clock, Users, ChevronDown, ShieldCheck, Image, CalendarDays, BadgeInfoIcon, AlertCircle, RefreshCw, ChevronUp } from 'lucide-vue-next'
import type { VipCategoryMap, VipSanseService } from '~/types/poolSingle.types'
import VipSanseCalendar from '~/components/pool/VipSanseCalendar.vue'

interface ParsedService {
  categoryName: string
  genderName: string
  entry: VipSanseService
}

const props = defineProps<{
  vipServices?: VipCategoryMap | null
  loading?: boolean
  error?: string | null
  poolId: number
  poolTitle: string
  poolSlug: string
}>()

defineEmits<{
  (e: 'retry'): void
}>()

const parsedServices = computed<ParsedService[]>(() => {
  if (props.vipServices == null) return []
  const result: ParsedService[] = []
  
  for (const [categoryName, genderArray] of Object.entries(props.vipServices)) {
    if (!Array.isArray(genderArray)) continue
    
    for (const genderObj of genderArray) {
      if (genderObj == null || typeof genderObj !== 'object') continue
      
      for (const [genderName, entries] of Object.entries(genderObj)) {
        if (!Array.isArray(entries)) continue
        
        for (const entry of entries) {
          if (entry == null) continue
          result.push({ categoryName, genderName, entry })
        }
      }
    }
  }
  return result
})

const expandedDesc = ref<Set<number>>(new Set())
const expandedRules = ref<Set<number>>(new Set())
const openCalendars = ref<Set<number>>(new Set())

function toggleDesc(id: number) {
  expandedDesc.value.has(id) ? expandedDesc.value.delete(id) : expandedDesc.value.add(id)
}

function toggleRules(id: number) {
  expandedRules.value.has(id) ? expandedRules.value.delete(id) : expandedRules.value.add(id)
}

function toggleCalendar(id: number) {
  openCalendars.value.has(id) ? openCalendars.value.delete(id) : openCalendars.value.add(id)
}

function formatPrice(value: number | string | null | undefined) {
  if (value == null) return '0'
  return Number(value).toLocaleString('fa-IR')
}

function firstImage(entry: VipSanseService | null | undefined) {
  return entry?.gallery?.[0] ?? null
}

function offerPercent(entry: VipSanseService | null | undefined): number {
  if (entry == null) return 0
  const original = entry.price
  const sale = entry.sale_price
  if (original == null || sale == null || original <= sale) return 0
  return Math.ceil(((original - sale) / original) * 100)
}
</script>

<template>
  <section class="py-8">
    <div class="max-w-480 mx-auto space-y-6">

      <div class="flex items-start gap-2 mb-2">
        <span class="bg-primary/10 text-primary rounded-full p-2 animate-bounce [animation-iteration-count:2]">
          <Crown :size="20" />
        </span>
        <h2 class="text-lg font-bold text-base-content">سرویس‌های VIP</h2>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
        <RefreshCw :size="28" class="animate-spin text-primary" />
        <p class="text-base-content/60 text-sm">در حال بارگذاری سرویس‌ها...</p>
      </div>

      <div v-else-if="error" class="flex flex-col items-center justify-center py-12 gap-4 text-center px-4 border border-error/20 bg-error/5 rounded-2xl">
        <span class="bg-error/10 rounded-full p-4 text-error">
          <AlertCircle :size="28" />
        </span>
        <div class="space-y-1">
          <p class="text-base-content font-medium text-sm">خطا در دریافت اطلاعات</p>
          <p class="text-base-content/60 text-xs">{{ error }}</p>
        </div>
        <button @click="$emit('retry')" class="btn btn-sm btn-error btn-outline gap-1.5 rounded-xl">
          <RefreshCw :size="14" />
          تلاش مجدد
        </button>
      </div>

      <div v-else-if="!parsedServices.length" class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4 border border-dashed border-base-300 rounded-2xl">
        <span class="bg-base-200 rounded-full p-4 text-base-content/30">
          <Crown :size="28" />
        </span>
        <p class="text-base-content/50 text-sm">سرویس VIP موجود نیست</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div v-for="({ categoryName, entry }, index) in parsedServices" :key="entry.id"
          class="card bg-base-100 border border-base-200 shadow-sm overflow-hidden field-animate card-lift flex flex-col justify-between"
          :style="{ '--fi': index }">
          
          <div class="grid grid-cols-1 sm:grid-cols-[13rem_1fr]">
            <div class="bg-base-200 overflow-hidden w-full h-48 sm:h-full relative group min-h-48">
              <img v-if="firstImage(entry)" :src="firstImage(entry)!.image_url" :alt="entry.service_features.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
              <div v-else class="w-full h-full min-h-40 flex items-center justify-center text-base-content/30">
                <Image :size="32" />
              </div>
            </div>

            <div class="flex flex-col gap-3 p-4">
              <div class="flex items-end gap-3">
                <h3 class="font-bold text-base text-start text-base-content leading-relaxed flex-1">
                  {{ entry.service_features.name }}
                </h3>

                <div v-if="offerPercent(entry) > 0" class="relative w-14 h-14 shrink-0">
                  <div class="w-14 h-14 rounded-2xl bg-error text-primary-content flex flex-col items-center justify-center font-black shadow-md rotate-3 hover:rotate-0 transition-transform duration-300">
                    <span class="text-lg leading-none">{{ offerPercent(entry).toLocaleString('fa-IR') }}٪</span>
                    <span class="text-[9px] font-bold opacity-80 mt-0.5">تخفیف</span>
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <span class="badge badge-primary badge-soft text-xs">{{ categoryName }}</span>
              </div>

              <div class="flex flex-wrap items-center gap-4 text-sm text-base-content/60">
                <span class="flex items-center gap-1">
                  <Clock :size="14" />
                  {{ Number(entry.service_features.sans_period).toLocaleString('fa-IR') }} دقیقه
                </span>
                <span class="flex items-center gap-1">
                  <Users :size="14" />
                  {{ Number(entry.service_features.guest_capacity).toLocaleString('fa-IR') }} نفر
                  <template v-if="entry.service_features.addational_person_available === 'on'">
                    (تا {{ Number(entry.service_features.max_guest_capacity).toLocaleString('fa-IR') }} نفر)
                  </template>
                </span>
              </div>

              <div class="flex flex-wrap items-center justify-between gap-3 mt-auto w-full pt-2">
                <div class="flex flex-col gap-1">
                  <span class="text-base-content/40 line-through text-xs">
                    {{ formatPrice(Number(entry.price)/10) }} تومان
                  </span>
                  <span class="text-primary font-bold text-lg">
                    {{ formatPrice(Number(entry.sale_price)/10) }} تومان
                  </span>
                  <span v-if="entry.service_features.price_per_person && entry.service_features.addational_person_available === 'on'" class="text-[11px] text-base-content/50">
                    + {{ formatPrice(Number(entry.service_features.price_per_person)/10) }} تومان / نفر اضافه
                  </span>
                </div>

                <button
                  class="btn btn-sm w-full sm:w-auto mt-2 sm:mt-0 gap-1.5"
                  :class="openCalendars.has(entry.id) ? 'btn-primary' : 'btn-primary btn-outline'"
                  @click="toggleCalendar(entry.id)">
                  <component :is="openCalendars.has(entry.id) ? ChevronUp : CalendarDays" :size="15" />
                  {{ openCalendars.has(entry.id) ? 'بستن سانس‌ها' : 'مشاهده سانس‌ها' }}
                </button>
              </div>
            </div>
          </div>

          <div
            class="grid transition-all duration-300 ease-in-out px-4 pb-4"
            :class="openCalendars.has(entry.id) ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'">
            <div class="overflow-hidden">
              <VipSanseCalendar
                v-if="openCalendars.has(entry.id)"
                :service="entry"
                :pool-id="props.poolId"
                :pool-title="props.poolTitle"
                :pool-slug="props.poolSlug" />
            </div>
          </div>

          <div class="mt-auto">
            <div v-if="entry.service_features.desc" class="border-t border-base-200">
              <button class="w-full flex items-center justify-between px-4 py-2.5 text-xs text-base-content/70 hover:bg-base-200/40 transition-colors cursor-pointer" @click="toggleDesc(entry.id)">
                <span class="flex items-center gap-1.5">
                  <BadgeInfoIcon :size="13" class="text-primary" />
                  توضیحات سرویس
                </span>
                <ChevronDown :size="14" class="transition-transform duration-200" :class="{ 'rotate-180': expandedDesc.has(entry.id) }" />
              </button>
              <div class="grid transition-all duration-200 ease-in-out" :class="[expandedDesc.has(entry.id) ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0']">
                <div class="overflow-hidden">
                  <div class="px-4 pb-3 text-xs text-base-content/70 leading-6 whitespace-pre-line text-start">
                    {{ entry.service_features.desc }}
                  </div>
                </div>
              </div>
            </div>

            <div v-if="entry.service_features.rules" class="border-t border-base-200">
              <button class="w-full flex items-center justify-between px-4 py-2.5 text-xs text-base-content/70 hover:bg-base-200/40 transition-colors cursor-pointer" @click="toggleRules(entry.id)">
                <span class="flex items-center gap-1.5">
                  <ShieldCheck :size="13" class="text-warning" />
                  قوانین و مقررات
                </span>
                <ChevronDown :size="14" class="transition-transform duration-200" :class="{ 'rotate-180': expandedRules.has(entry.id) }" />
              </button>
              <div class="grid transition-all duration-200 ease-in-out" :class="[expandedRules.has(entry.id) ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0']">
                <div class="overflow-hidden">
                  <div class="px-4 pb-3 text-xs leading-6 whitespace-pre-line text-justify">
                    {{ entry.service_features.rules }}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </section>
</template>