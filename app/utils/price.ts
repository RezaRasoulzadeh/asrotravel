// utils/price.ts
export function formatPrice(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '---'
  
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num) || num <= 0) return '---'

  const toman = Math.round(num / 10)

  const formatted = toman
    .toLocaleString('fa-IR')
    .replace(/,/g, '٫')

  return `${formatted} تومان`
}