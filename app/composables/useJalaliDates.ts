// composables/useJalaliDates.ts
import type { Ref } from 'vue'

export function useJalaliDates(
  startDateRef: Ref<string | undefined | null>, 
  endDateRef: Ref<string | undefined | null>
) {
  function jalaliToGregorian(jalali?: string | null): string {
    if (!jalali) return ''
    const normalized = jalali.replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776))
    const [jy = 0, jm = 0, jd = 0] = normalized.split('/').map(Number)
    if (!jy || !jm || !jd) return ''

    let jy2 = jy - 979, jm2 = jm - 1, jd2 = jd - 1
    let j_day_no = 365 * jy2 + Math.floor(jy2 / 33) * 8 + Math.floor(((jy2 % 33) + 3) / 4)
    for (let i = 0; i < jm2; i++) j_day_no += i < 6 ? 31 : 30
    j_day_no += jd2
    let g_day_no = j_day_no + 79
    let gy = 1600 + 400 * Math.floor(g_day_no / 146097)
    g_day_no %= 146097
    let leap = true
    if (g_day_no >= 36525) {
      g_day_no--; gy += 100 * Math.floor(g_day_no / 36524); g_day_no %= 36524
      if (g_day_no >= 365) g_day_no++; else leap = false
    }
    gy += 4 * Math.floor(g_day_no / 1461); g_day_no %= 1461
    if (g_day_no >= 366) { leap = false; g_day_no--; gy += Math.floor(g_day_no / 365); g_day_no %= 365 }
    const gDays = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    let gm = 0
    while (gm < 12 && g_day_no >= gDays[gm]!) { 
      g_day_no -= gDays[gm]!
      gm++ 
    }
    const pad = (n: number) => String(n).padStart(2, '0')
    
    return `${gy}-${pad(gm + 1)}-${pad(g_day_no + 1)}`
  }

  function gregorianToJalali(g?: string | null): string {
    if (!g) return ''
    const [gy = 0, gm = 0, gd = 0] = g.split('-').map(Number)
    if (!gy || !gm || !gd) return ''

    const g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    let gy2 = gy - 1600, gm2 = gm - 1, gd2 = gd - 1
    let g_day_no = 365 * gy2 + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400)
    for (let i = 0; i < gm2; i++) g_day_no += g_days_in_month[i]!
    if (gm2 > 1 && ((gy2 % 4 === 0 && gy2 % 100 !== 0) || gy2 % 400 === 0)) g_day_no++
    g_day_no += gd2
    let j_day_no = g_day_no - 79
    let j_np = Math.floor(j_day_no / 12053); j_day_no %= 12053
    let jy = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461); j_day_no %= 1461
    if (j_day_no >= 366) { jy += Math.floor((j_day_no - 1) / 365); j_day_no = (j_day_no - 1) % 365 }
    let jm = 0
    for (let i = 0; i < 11 && j_day_no >= (i < 6 ? 31 : 30); i++) { j_day_no -= i < 6 ? 31 : 30; jm = i + 1 }
    const pad = (n: number) => String(n).padStart(2, '0')
    
    return `${jy}/${pad(jm + 1)}/${pad(j_day_no + 1)}`
  }

  const jalaliStart = computed(() => gregorianToJalali(startDateRef.value))
  const jalaliEnd = computed(() => gregorianToJalali(endDateRef.value))

  function parseJalaliPair(start?: string | null, end?: string | null) {
    return {
      gregorianStart: jalaliToGregorian(start),
      gregorianEnd: jalaliToGregorian(end)
    }
  }

  return { jalaliStart, jalaliEnd, parseJalaliPair }
}