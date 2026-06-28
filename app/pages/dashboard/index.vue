<!-- pages/dashboard/index.vue -->
<script setup lang="ts">
import {
  CalendarCheck,
  Wallet,
  Heart,
  ChevronLeft,
  Ticket,
  Hotel,
  Waves,
  MapPin,
} from 'lucide-vue-next'
import type { Component } from 'vue'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'داشبورد | آسروتراول' })

const { user, fullName } = useAuth()

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'صبح بخیر'
  if (h < 17) return 'روز بخیر'
  if (h < 21) return 'عصر بخیر'
  return 'شب بخیر'
})

interface DashboardStat {
  label: string
  value: string
  icon: Component
  color: string
  bg: string
}

const stats = computed<DashboardStat[]>(() => [
  {
    label: 'رزروهای فعال',
    value: (0).toLocaleString('fa-IR'),
    icon: CalendarCheck,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    label: 'موجودی کیف پول',
    value: Number(user.value?.wallet?.balance ?? 0).toLocaleString('fa-IR'),
    icon: Wallet,
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    label: 'علاقه‌مندی‌ها',
    value: (0).toLocaleString('fa-IR'),
    icon: Heart,
    color: 'text-error',
    bg: 'bg-error/10',
  },
])

interface QuickAction {
  label: string
  icon: Component
  to: string
}

const quickActions: QuickAction[] = [
  { label: 'رزرو هتل', icon: Hotel, to: '/hotel' },
  { label: 'رزرو استخر', icon: Waves, to: '/pool' },
  { label: 'خرید بلیط', icon: Ticket, to: '/ticket' },
  { label: 'گردشگری', icon: MapPin, to: '/place/travel-guide' },
]

type BookingType = 'hotel' | 'pool' | 'ticket' | 'place'
type BookingStatus = 'active' | 'done' | 'cancelled'

interface Booking {
  id: number
  title: string
  type: BookingType
  date: string
  status: BookingStatus
}

const recentBookings: Booking[] = [
  { id: 1, title: 'هتل پارسیان اصفهان', type: 'hotel', date: '۱۴۰۳/۰۴/۱۵', status: 'active' },
  { id: 2, title: 'استخر ملت تهران', type: 'pool', date: '۱۴۰۳/۰۴/۱۰', status: 'done' },
  { id: 3, title: 'پرواز تهران - مشهد', type: 'ticket', date: '۱۴۰۳/۰۳/۲۸', status: 'cancelled' },
]

const bookingIconMap: Record<BookingType, Component> = {
  hotel: Hotel,
  pool: Waves,
  ticket: Ticket,
  place: MapPin,
}

const statusMap: Record<BookingStatus, { label: string; cls: string }> = {
  active: { label: 'فعال', cls: 'badge-success' },
  done: { label: 'انجام شده', cls: 'badge-neutral' },
  cancelled: { label: 'لغو شده', cls: 'badge-error' },
}

const bookingRows = computed(() => recentBookings.map(booking => ({
  ...booking,
  icon: bookingIconMap[booking.type] ?? Ticket,
  statusLabel: statusMap[booking.status]?.label ?? '',
  statusClass: statusMap[booking.status]?.cls ?? 'badge-neutral',
})))

const hasBookings = computed(() => bookingRows.value.length > 0)
</script>

<template>
  <div class="px-4 lg:px-10 py-6 mx-auto space-y-8">

    <div class="card bg-primary text-primary-content shadow-sm overflow-hidden">
      <div class="card-body py-6 px-6 relative">
        <div class="absolute -left-8 -top-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div class="absolute -left-2 bottom-0 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />
        <p class="text-primary-content/70 text-sm mb-1">{{ greeting }}،</p>
        <h1 class="text-xl font-bold">{{ fullName }}</h1>
        <p class="text-primary-content/70 text-sm mt-1">به پنل کاربری آسروتراول خوش آمدید.</p>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-3">
      <div v-for="stat in stats" :key="stat.label" class="card bg-base-100 shadow-sm">
        <div class="card-body p-4 gap-2">
          <div :class="[stat.bg, 'w-9 h-9 rounded-xl flex items-center justify-center']">
            <component :is="stat.icon" :size="18" :class="stat.color" />
          </div>
          <p class="text-lg font-bold leading-none">{{ stat.value }}</p>
          <p class="text-xs text-base-content/50">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <section class="space-y-3">
      <h2 class="text-sm font-semibold text-base-content/50 px-1">دسترسی سریع</h2>
      <div class="grid grid-cols-4 gap-3">
        <NuxtLink
          v-for="action in quickActions"
          :key="action.label"
          :to="action.to"
          class="card bg-base-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div class="card-body p-3 items-center text-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center">
              <component :is="action.icon" :size="20" class="text-primary" />
            </div>
            <span class="text-xs font-medium leading-tight">{{ action.label }}</span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between px-1">
        <h2 class="text-sm font-semibold text-base-content/50">آخرین رزروها</h2>
        <NuxtLink to="/dashboard/bookings" class="flex items-center gap-0.5 text-xs text-primary hover:underline">
          مشاهده همه
          <ChevronLeft :size="14" />
        </NuxtLink>
      </div>

      <div class="card bg-base-100 shadow-sm divide-y divide-base-200">
        <div v-for="booking in bookingRows" :key="booking.id" class="flex items-center gap-3 px-4 py-3">
          <div class="w-9 h-9 rounded-xl bg-base-200 flex items-center justify-center shrink-0">
            <component :is="booking.icon" :size="16" class="text-base-content/50" />
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ booking.title }}</p>
            <p class="text-xs text-base-content/40 mt-0.5">{{ booking.date }}</p>
          </div>

          <span class="badge badge-sm badge-soft" :class="booking.statusClass">
            {{ booking.statusLabel }}
          </span>
        </div>

        <div v-if="!hasBookings" class="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
          <div class="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center">
            <CalendarCheck :size="22" class="text-base-content/30" />
          </div>
          <p class="text-sm text-base-content/50">هنوز رزروی ثبت نشده</p>
        </div>
      </div>
    </section>

  </div>
</template>