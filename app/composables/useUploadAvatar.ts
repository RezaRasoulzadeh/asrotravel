// app/composables/useUploadAvatar.ts
import type { UploadAvatarResponse } from '~/types/profile.types'

export function useUploadAvatar() {
  const loading = ref(false)
  const { user, handleSessionExpiry } = useAuth()

  async function uploadAvatar(file: File): Promise<{ ok: boolean; url?: string; error?: string }> {
    if (loading.value) return { ok: false }

    loading.value = true
    const body = new FormData()
    body.append('file', file)

    const result = await safeApiFetch<UploadAvatarResponse>(
      '/api/users/profile-avatar',
      { method: 'POST', body },
    )
    loading.value = false

    if (result.error || !result.data) {
      if (result.status === 401) {
        await handleSessionExpiry()
        return { ok: false }
      }
      return { ok: false, error: 'خطا در آپلود تصویر. لطفا دوباره تلاش کنید' }
    }

    const url = result.data.ImageUrl ?? result.data.image_url ?? result.data.avatar?.image_url ?? null

    if (!url) {
      return { ok: false, error: 'آدرس تصویر در پاسخ سرور یافت نشد' }
    }

    if (user.value) user.value = { ...user.value, ImageUrl: url }

    return { ok: true, url }
  }

  return {
    loading: readonly(loading),
    uploadAvatar,
  }
}