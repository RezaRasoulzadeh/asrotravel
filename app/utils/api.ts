// app/utils/api.ts
export interface SafeApiResult<T> {
  data: T | null
  error: string | null
  status: number | null
}

export function apiErrorMessage(error: unknown, fallback = 'خطا در دریافت اطلاعات'): string {
  if (typeof error === 'object' && error !== null) {
    const maybeError = error as {
      data?: { message?: string }
      message?: string
      status?: number
      statusCode?: number
    }

    return maybeError.data?.message
      || maybeError.message
      || (maybeError.status || maybeError.statusCode ? `خطای سرور: ${maybeError.status || maybeError.statusCode}` : fallback)
  }

  return fallback
}

export async function safeApiFetch<T>(
  request: string,
  options?: Parameters<typeof $fetch>[1],
  fallbackMessage = 'خطا در دریافت اطلاعات',
): Promise<SafeApiResult<T>> {
  try {
    return {
      data: await $fetch<T>(request, options),
      error: null,
      status: null,
    }
  } catch (error) {
    const maybeError = error as { status?: number; statusCode?: number }
    return {
      data: null,
      error: apiErrorMessage(error, fallbackMessage),
      status: maybeError.status ?? maybeError.statusCode ?? null,
    }
  }
}