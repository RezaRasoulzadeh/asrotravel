// utils/price.ts
export function rialToToman(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return 0
  return Math.round(num / 10)
}

export function tomanToRial(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return 0
  return Math.round(num * 10)
}

export function formatPrice(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '---'
  
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num) || num <= 0) return '---'

  const toman = rialToToman(num)

  const formatted = toman
    .toLocaleString('fa-IR')
    .replace(/,/g, '٫')

  return `${formatted} تومان`
}