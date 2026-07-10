// app/composables/useUpdateProfile.ts
import type { UpdateProfilePayload, UpdateProfileResponse } from '~/types/profile.types'

export function useUpdateProfile() {
  const loading = ref(false)
  const { user, handleSessionExpiry } = useAuth()

  async function updateProfile(payload: UpdateProfilePayload): Promise<{ ok: boolean; error?: string }> {
    if (loading.value) return { ok: false }

    loading.value = true
    const result = await safeApiFetch<UpdateProfileResponse>(
      '/api/users/update-profile',
      { method: 'PUT', body: payload },
    )
    loading.value = false

    if (result.error || !result.data) {
      if (result.status === 401) {
        await handleSessionExpiry()
        return { ok: false }
      }
      return { ok: false, error: 'خطا در بروزرسانی پروفایل. لطفا دوباره تلاش کنید' }
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
        Token: updated.Token ?? user.value.Token,
      }
    }

    return { ok: true }
  }

  return {
    loading: readonly(loading),
    updateProfile,
  }
}