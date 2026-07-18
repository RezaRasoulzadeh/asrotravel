// app/composables/useWebOtp.ts

export function useWebOtp(onCode: (code: string) => void) {
  let abortController: AbortController | null = null

  function isSupported() {
    return import.meta.client && 'OTPCredential' in window
  }

  async function start() {
    if (!isSupported()) return
    abortController = new AbortController()
    try {
      const otp = await (navigator.credentials as any).get({
        otp: { transport: ['sms'] },
        signal: abortController.signal,
      })
      if (otp?.code) onCode(otp.code as string)
    } catch {
      // user dismissed the prompt, no SMS arrived before abort, or unsupported
    }
  }

  function stop() {
    abortController?.abort()
    abortController = null
  }

  return { isSupported, start, stop }
}
