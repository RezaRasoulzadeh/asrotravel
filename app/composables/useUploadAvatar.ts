// app/composables/useUploadAvatar.ts
import type { UploadAvatarResponse } from '~/types/profile.types'

export function useUploadAvatar() {
  const loading = ref(false)
  const { user } = useAuth()

  async function uploadAvatar(file: File): Promise<{ ok: boolean; url?: string; error?: string }> {
    if (loading.value) return { ok: false }

    loading.value = true
    const body = new FormData()
    body.append('file', file)

    const result = await usePrivateApiFetch<UploadAvatarResponse>(
      '/api/users/profile-avatar',
      { method: 'POST', body },
      'خطا در آپلود تصویر پروفایل',
    )
    loading.value = false

    if (result.error || !result.data) {
      return { ok: false, error: result.error ?? undefined }
    }

    const url = result.data.ImageUrl ?? result.data.image_url ?? result.data.avatar?.image_url ?? null

    if (!url) {
      return { ok: false, error: 'آدرس تصویر در پاسخ سرور یافت نشد' }
    }

    if (user.value) user.value = { ...user.value, ImageUrl: url }
    useToast().success('تصویر پروفایل بروزرسانی شد')

    return { ok: true, url }
  }

  return {
    loading: readonly(loading),
    uploadAvatar,
  }
}