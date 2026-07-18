// app/composables/useAppInstall.ts

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_COOKIE = 'asro_install_dismissed'
const DISMISS_DAYS = 14

export function useAppInstall() {
  const deferredPrompt = useState<BeforeInstallPromptEvent | null>('installPrompt', () => null)
  const isIos = useState<boolean>('installIsIos', () => false)
  const isStandalone = useState<boolean>('installIsStandalone', () => false)
  const dismissedCookie = useCookie<string | null>(DISMISS_COOKIE, {
    maxAge: 60 * 60 * 24 * DISMISS_DAYS,
  })

  const canInstall = computed(() =>
    !isStandalone.value && !dismissedCookie.value && (!!deferredPrompt.value || isIos.value)
  )
  const deferredPromptReady = computed(() => !!deferredPrompt.value)

  function detectEnvironment() {
    if (!import.meta.client) return

    const nav = navigator as Navigator & { standalone?: boolean }
    isStandalone.value = window.matchMedia('(display-mode: standalone)').matches || !!nav.standalone

    const ua = navigator.userAgent
    isIos.value = /iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua)
  }

  function registerListener() {
    if (!import.meta.client) return

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt.value = e as BeforeInstallPromptEvent
    })

    window.addEventListener('appinstalled', () => {
      isStandalone.value = true
      deferredPrompt.value = null
    })
  }

  async function promptInstall() {
    if (!deferredPrompt.value) return
    await deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    deferredPrompt.value = null
    if (outcome === 'accepted') isStandalone.value = true
  }

  function dismiss() {
    dismissedCookie.value = String(Date.now())
  }

  return {
    canInstall,
    isIos,
    isStandalone,
    deferredPromptReady,
    detectEnvironment,
    registerListener,
    promptInstall,
    dismiss,
  }
}
