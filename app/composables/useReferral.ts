// app/composables/useReferral.ts

const REFERRAL_STORAGE_KEY = 'asro_referral_code'
const REFERRAL_QUERY_PARAM = 'referral'

export function useReferral() {
  function captureReferral() {
    if (!import.meta.client) return

    const route = useRoute()
    const code = route.query[REFERRAL_QUERY_PARAM]

    if (typeof code === 'string' && code.trim()) {
      localStorage.setItem(REFERRAL_STORAGE_KEY, code.trim())
    }
  }

  function getReferral(): string | null {
    if (!import.meta.client) return null
    return localStorage.getItem(REFERRAL_STORAGE_KEY)
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

  return { captureReferral, getReferral, clearReferral, buildReferralLink }
}