// app/composables/useUpdateProfile.ts
import type { UpdateProfilePayload, UpdateProfileResponse } from '~/types/profile.types'

export function useUpdateProfile() {
  const loading = ref(false)
  const { user } = useAuth()

  async function updateProfile(payload: UpdateProfilePayload): Promise<{ ok: boolean; error?: string }> {
    if (loading.value) return { ok: false }

    loading.value = true
    const result = await usePrivateApiFetch<UpdateProfileResponse>(
      '/api/users/update-profile',
      { method: 'PUT', body: payload },
      'خطا در بروزرسانی پروفایل',
    )
    loading.value = false

    if (result.error || !result.data) {
      return { ok: false, error: result.error ?? undefined }
    }

    const updated = result.data.userData

    if (user.value) {
      user.value = {
        ...user.value,
        first_name: updated.first_name,
        last_name: updated.last_name,
        national_id: updated.national_id,
        mobile: updated.mobile,
        email: updated.email,
        user_name: updated.user_name ?? user.value.user_name,
        balance: updated.balance,
        birthday: updated.birthday,
        gender: updated.gender,
        ImageUrl: updated.ImageUrl,
        is_organization: updated.is_organization,
        IsActive: updated.IsActive,
        address: payload.address,
      }
    }

    useToast().success(result.data.message || 'پروفایل با موفقیت بروزرسانی شد')
    return { ok: true }
  }

  return {
    loading: readonly(loading),
    updateProfile,
  }
}