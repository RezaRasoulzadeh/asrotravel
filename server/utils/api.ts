type FetchOptions = Parameters<typeof $fetch>[1]

export function apiBaseUrl(): string {
  return useRuntimeConfig().apiBase || 'https://api.asrotravel.com/api'
}

export function apiUrl(path: string): string {
  const base = apiBaseUrl().replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${base}${normalizedPath}`
}

export async function safeReadBody(event: Parameters<typeof readBody>[0]): Promise<Record<string, unknown>> {
  const body = await readBody(event).catch(() => ({}))

  return body && typeof body === 'object' && !Array.isArray(body)
    ? body as Record<string, unknown>
    : {}
}

export async function safeApiFetch<T>(
  path: string,
  options: FetchOptions = {},
  fallback: T,
): Promise<T> {
  const headers = new Headers(options.headers as HeadersInit | undefined)
  headers.set('Accept', 'application/json')

  try {
    return await $fetch<T>(apiUrl(path), {
      ...options,
      headers,
    })
  } catch (error) {
    console.warn(`[api] ${path} failed`, error)
    return fallback
  }
}
