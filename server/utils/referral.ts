// server/utils/referral.ts
import type { H3Event } from 'h3'

const USER_COOKIE = 'asro_user'

export function resolveReferralHeader(event: H3Event): Record<string, string> {
  const incoming = getRequestHeader(event, 'referral')
  const code = typeof incoming === 'string' ? incoming.trim() : ''

  if (!code) return {}

  const rawUser = getCookie(event, USER_COOKIE)

  if (rawUser) {
    try {
      const user = JSON.parse(rawUser) as { Token?: string | null }
      if (user?.Token && user.Token === code) return {}
    } catch {
      return { referral: code }
    }
  }

  return { referral: code }
}