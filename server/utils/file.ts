// server/utils/file.ts

export function normalizeFileName(originalName: string): string {
  const trimmed = (originalName || '').trim()
  const lastDot = trimmed.lastIndexOf('.')
  const hasExt = lastDot > 0 && lastDot < trimmed.length - 1

  const rawBase = hasExt ? trimmed.slice(0, lastDot) : trimmed
  const rawExt = hasExt ? trimmed.slice(lastDot + 1) : ''

  const safeBase = rawBase
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'file'

  const safeExt = rawExt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 10)

  const uniqueSuffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

  return safeExt ? `${safeBase}-${uniqueSuffix}.${safeExt}` : `${safeBase}-${uniqueSuffix}`
}