
// utils/date.ts
export function toGregorian(jy: number, jm: number, jd: number): string {
    let jy2 = jy - 979; let jm2 = jm - 1; let jd2 = jd - 1
    let j_day_no = 365 * jy2 + Math.floor(jy2 / 33) * 8 + Math.floor(((jy2 % 33) + 3) / 4)
    for (let i = 0; i < jm2; ++i) j_day_no += i < 6 ? 31 : 30
    j_day_no += jd2
    let g_day_no = j_day_no + 79; let gy = 1600 + 400 * Math.floor(g_day_no / 146097); g_day_no %= 146097
    let leap = true
    if (g_day_no >= 36525) { g_day_no--; gy += 100 * Math.floor(g_day_no / 36524); g_day_no %= 36524; if (g_day_no >= 365) g_day_no++; else leap = false }
    gy += 4 * Math.floor(g_day_no / 1461); g_day_no %= 1461
    if (g_day_no >= 366) { leap = false; g_day_no--; gy += Math.floor(g_day_no / 365); g_day_no %= 365 }
    const g_days_in_month = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    let gm = 0
    while (gm < 12) {
        const daysInMonth = g_days_in_month[gm] ?? 0
        if (g_day_no < daysInMonth) break
        g_day_no -= daysInMonth
        gm++
    }

    return `${gy}-${String(gm + 1).padStart(2, '0')}-${String(g_day_no + 1).padStart(2, '0')}`
}

export function toJalali(gy: number, gm: number, gd: number) {
  const g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let gy2 = gy - 1600; let gm2 = gm - 1; let gd2 = gd - 1
  let g_day_no = 365 * gy2 + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400)
  for (let i = 0; i < gm2; ++i) g_day_no += g_days_in_month[i] ?? 0
  if (gm2 > 1 && ((gy2 % 4 === 0 && gy2 % 100 !== 0) || gy2 % 400 === 0)) g_day_no++
  g_day_no += gd2
  let j_day_no = g_day_no - 79; let j_np = Math.floor(j_day_no / 12053); j_day_no = j_day_no % 12053
  let jy = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461); j_day_no %= 1461
  if (j_day_no >= 366) { jy += Math.floor((j_day_no - 1) / 365); j_day_no = (j_day_no - 1) % 365 }
  let jm = 0
  for (let i = 0; i < 11 && j_day_no >= (i < 6 ? 31 : 30); ++i) { j_day_no -= i < 6 ? 31 : 30; jm = i + 1 }
  return { jy, jm: jm + 1, jd: j_day_no + 1 }
}