// app/composables/useAuth.ts

export interface AsroUser {
  id: number
  first_name: string
  last_name: string
  mobile: string
  email: string
  user_name: string
  balance: number
  birthday: string
  gender: number | null
  national_id: string
  ImageUrl: string | null
  address?: string | null
  is_organization: boolean
  IsActive: boolean
  Token?: string | null
  wallet: {
    id: number
    balance: string
    uuid: string
  }
}

const TOKEN_COOKIE = 'asro_token'
const USER_COOKIE = 'asro_user'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 

export function useAuth() {
  const token = useCookie<string | null>(TOKEN_COOKIE, {
    default: () => null,
    maxAge: COOKIE_MAX_AGE,
    sameSite: 'lax',
  })

  const user = useCookie<AsroUser | null>(USER_COOKIE, {
    default: () => null,
    maxAge: COOKIE_MAX_AGE,
    sameSite: 'lax',
  })

  const isAuthenticated = computed(() => !!token.value)
  const fullName = computed(() => {
    if (!user.value) return ''
    const first = user.value.first_name?.trim()
    const last = user.value.last_name?.trim()
    if (!first && !last) return 'کاربر جدید'
    return [first, last].filter(Boolean).join(' ')
  })

  async function sendOtp(mobile: string): Promise<{ ok: boolean; error?: string }> {
    const { data, error } = await safeApiFetch<{ status?: number; message?: string }>('/api/auth/send-otp', {
      method: 'POST',
      body: { isoCode: 'IR', mobile },
    }, 'خطا در اتصال به سرور')

    if (error || !data) {
      return { ok: false, error: error ?? 'خطا در اتصال به سرور' }
    }

    if (data.status === 200) return { ok: true }
    return { ok: false, error: data.message ?? 'خطای ناشناخته' }
  }

  async function verifyOtp(mobile: string, verificationCode: string): Promise<{ ok: boolean; error?: string }> {
    const { data, error } = await safeApiFetch<{ token?: string; user?: AsroUser; message?: string }>('/api/auth/verify-otp', {
      method: 'POST',
      body: { mobile, verificationCode },
    }, 'خطا در اتصال به سرور')

    if (error || !data) {
      return { ok: false, error: error ?? 'خطا در اتصال به سرور' }
    }

    if (data.token && data.user) {
      token.value = data.token
      user.value = data.user
      return { ok: true }
    }

    return { ok: false, error: data.message ?? 'کد تأیید نادرست است' }
  }

  function logout() {
    token.value = null
    user.value = null
  }

async function handleSessionExpiry() {
    logout()
    useToast().error('نشست شما منقضی شده، لطفا دوباره وارد شوید')
    const route = useRoute()
    await navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
}

  return { token, user, isAuthenticated, fullName, sendOtp, verifyOtp, logout, handleSessionExpiry }
}