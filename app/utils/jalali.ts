// app/utils/jalali.ts
export interface JalaliDate {
  jy: number
  jm: number
  jd: number
}

export function toJalaliDash(gy: number, gm: number, gd: number): JalaliDate {
  const gDaysInMonth = [
    31,
    28 + (gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0) ? 1 : 0),
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
  ]

  let jy = gy <= 1600 ? 0 : 979
  const gyShifted = gy - (gy <= 1600 ? 621 : 1600)
  const gy2 = gm > 2 ? gyShifted + 1 : gyShifted

  let gDayNo = 365 * gyShifted
    + Math.floor((gy2 + 3) / 4)
    - Math.floor((gy2 + 99) / 100)
    + Math.floor((gy2 + 399) / 400)

  for (let i = 0; i < gm - 1; i++) gDayNo += gDaysInMonth[i] ?? 0
  gDayNo += gd - 1

  let jDayNo = gDayNo - 79
  const jNp = Math.floor(jDayNo / 12053)
  jDayNo %= 12053

  jy += 33 * jNp + 4 * Math.floor(jDayNo / 1461)
  jDayNo %= 1461

  if (jDayNo >= 366) {
    jy += Math.floor((jDayNo - 1) / 365)
    jDayNo = (jDayNo - 1) % 365
  }

  const jalaliMonthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
  let jm = 0
  let jd = 0
  for (let i = 0; i < 12; i++) {
    const len = jalaliMonthDays[i] ?? 0
    if (jDayNo >= len) {
      jDayNo -= len
      jm++
    } else {
      jd = jDayNo + 1
      break
    }
  }

  return { jy, jm, jd }
}

export function toGregorianDash(jy: number, jm: number, jd: number): Date {
  const jy2 = jy - 979
  const jm2 = jm - 1
  const jd2 = jd - 1

  const jalaliMonthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
  let jDayNo = 365 * jy2 + Math.floor(jy2 / 4) - Math.floor(jy2 / 100) + Math.floor(jy2 / 400)
  for (let i = 0; i < jm2; i++) jDayNo += jalaliMonthDays[i] ?? 0
  jDayNo += jd2

  const gDayNo = jDayNo + 79
  let gy = 1600 + 400 * Math.floor(gDayNo / 146097)
  let gDayNo2 = gDayNo % 146097
  let leap = true

  if (gDayNo2 >= 36525) {
    gDayNo2--
    gy += 100 * Math.floor(gDayNo2 / 36524)
    gDayNo2 %= 36524
    if (gDayNo2 >= 365) gDayNo2++
    else leap = false
  }

  gy += 4 * Math.floor(gDayNo2 / 1461)
  gDayNo2 %= 1461

  if (gDayNo2 >= 366) {
    leap = false
    gDayNo2--
    gy += Math.floor(gDayNo2 / 365)
    gDayNo2 %= 365
  }

  const gDaysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let gm = 0
  let gd = 0
  for (let i = 0; i < 12; i++) {
    const len = gDaysInMonth[i] ?? 0
    if (gDayNo2 >= len) {
      gDayNo2 -= len
      gm++
    } else {
      gd = gDayNo2 + 1
      break
    }
  }

  return new Date(gy, gm, gd)
}