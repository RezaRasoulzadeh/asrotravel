<!-- app/components/dashboard/MiniCalendar.vue -->
<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface CalendarCell {
  day: number | null
  isToday: boolean
}

const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
] as const

const persianDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] as const

const today = new Date()
const jalaliToday = toJalaliDash(today.getFullYear(), today.getMonth() + 1, today.getDate())

const monthOffset = ref(0)

const calendarData = computed(() => {
  let jy = jalaliToday.jy
  let jm = jalaliToday.jm + monthOffset.value
  while (jm > 12) { jm -= 12; jy++ }
  while (jm < 1) { jm += 12; jy-- }

  const daysInMonth = jm <= 6 ? 31 : jm <= 11 ? 30 : 29
  const firstDay = toGregorianDash(jy, jm, 1)
  const jsDay = firstDay.getDay()
  const startOffset = jsDay === 6 ? 0 : jsDay + 1

  const cells: CalendarCell[] = []
  for (let i = 0; i < startOffset; i++) cells.push({ day: null, isToday: false })
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = jy === jalaliToday.jy && jm === jalaliToday.jm && d === jalaliToday.jd
    cells.push({ day: d, isToday })
  }

  return { jy, jm, cells }
})
</script>

<template>
  <div class="bg-base-100 rounded-2xl">
    <div class="flex items-center justify-between mb-3">
      <button class="btn btn-ghost btn-xs btn-square rounded-lg" aria-label="ماه بعد" @click="monthOffset++">
        <ChevronRight :size="14" />
      </button>
      <div class="text-center flex flex-row items-center gap-2">
        <p class="text-sm font-bold">{{ persianMonths[calendarData.jm - 1] ?? '' }}</p>
        <p class="text-xs text-base-content/40">{{ calendarData.jy.toLocaleString('fa-IR', { useGrouping: false }) }}</p>
      </div>
      <button class="btn btn-ghost btn-xs btn-square rounded-lg" aria-label="ماه قبل" @click="monthOffset--">
        <ChevronLeft :size="14" />
      </button>
    </div>

    <div class="grid grid-cols-7 mb-1">
      <div v-for="d in persianDays" :key="d" class="text-center text-[10px] font-medium text-base-content/40 py-1">
        {{ d }}
      </div>
    </div>

    <div class="grid grid-cols-7 gap-y-0.5">
      <div
        v-for="(cell, i) in calendarData.cells"
        :key="i"
        class="flex items-center justify-center h-7 text-xs rounded-full transition-colors"
        :class="{
          'bg-primary text-primary-content font-bold': cell.isToday,
          'text-base-content/70 hover:bg-base-300 cursor-pointer': cell.day && !cell.isToday,
          'text-transparent': !cell.day,
        }"
      >
        {{ cell.day ? cell.day.toLocaleString('fa-IR') : '' }}
      </div>
    </div>
  </div>
</template>