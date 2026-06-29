// app/composables/usePrivateApiFetch.ts

import type { SafeApiResult } from '~/utils/api'

export async function usePrivateApiFetch<T>(
  request: string,
  options?: Parameters<typeof $fetch>[1],
  fallbackMessage = 'خطا در انجام عملیات',
): Promise<SafeApiResult<T>> {
  const result = await safeApiFetch<T>(request, options, fallbackMessage)

  if (result.error) {
    if (result.status === 401) {
      await useAuth().handleSessionExpiry()
      return result
    }
    useToast().error(result.error)
  }

  return result
}