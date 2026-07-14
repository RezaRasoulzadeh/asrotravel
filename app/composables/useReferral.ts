// app/composables/useReferral.ts

const REFERRAL_STORAGE_KEY = 'asro_referral_code'
const REFERRAL_QUERY_PARAM = 'referral'

export function useReferral() {
  const selfToastShown = useState('referral-self-toast-shown', () => false)

  function ownToken(): string | null {
    return useAuth().user.value?.Token ?? null
  }

  function warnSelfReferral() {
    if (selfToastShown.value) return
    selfToastShown.value = true
    useToast().error('امکان استفاده از کد معرف خودتان وجود ندارد')
  }

  function captureReferral() {
    if (!import.meta.client) return

    const route = useRoute()
    const raw = route.query[REFERRAL_QUERY_PARAM]
    const code = typeof raw === 'string' ? raw.trim() : ''

    if (!code) return

    const self = ownToken()
    if (self && code === self) {
      warnSelfReferral()
      return
    }

    const alreadyStored = localStorage.getItem(REFERRAL_STORAGE_KEY)
    localStorage.setItem(REFERRAL_STORAGE_KEY, code)

    if (alreadyStored !== code) {
      useToast().success('شما با کد معرف وارد شدید و شامل تخفیف ویژه خواهید شد')
    }
  }

  function getReferral(): string | null {
    if (!import.meta.client) return null

    const stored = localStorage.getItem(REFERRAL_STORAGE_KEY)
    if (!stored) return null

    const self = ownToken()
    if (self && stored === self) {
      warnSelfReferral()
      return null
    }

    return stored
  }

  function clearReferral() {
    if (!import.meta.client) return
    localStorage.removeItem(REFERRAL_STORAGE_KEY)
  }

  function buildReferralLink(token: string | null | undefined): string {
    if (!token) return ''
    const siteUrl = useRuntimeConfig().public.siteUrl as string
    return `${siteUrl.replace(/\/$/, '')}/?${REFERRAL_QUERY_PARAM}=${encodeURIComponent(token)}`
  }

  function referralHeaders(): Record<string, string> {
    const code = getReferral()
    return code ? { referral: code } : {}
  }

  return {
    captureReferral,
    getReferral,
    clearReferral,
    buildReferralLink,
    referralHeaders,
  }
}