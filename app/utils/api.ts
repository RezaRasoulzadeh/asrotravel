export interface SafeApiResult<T> {
  data: T | null
  error: string | null
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
    }
  } catch (error) {
    return {
      data: null,
      error: apiErrorMessage(error, fallbackMessage),
    }
  }
}
