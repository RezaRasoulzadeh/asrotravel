// server/utils/auth.ts
import type { H3Event } from 'h3'

type FetchOptions = Parameters<typeof $fetch>[1]

const TOKEN_COOKIE = 'asro_token'

export async function safeAuthApiFetch<T>(
  event: H3Event,
  path: string,
  options: FetchOptions = {},
  fallback: T,
): Promise<T> {
  const token = getCookie(event, TOKEN_COOKIE)

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const headers = new Headers(options.headers as HeadersInit | undefined)
  headers.set('Accept', 'application/json')
  headers.set('Authorization', `Bearer ${token}`)

  try {
    return await $fetch<T>(apiUrl(path), {
      ...options,
      headers,
    })
  } catch (error: any) {
    const status = error?.statusCode ?? error?.status ?? error?.response?.status

    if (status === 401) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    console.warn(`[api] ${path} failed`, error)
    return fallback
  }
}