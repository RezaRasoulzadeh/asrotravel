// app/composables/useWallet.ts
import type {
  ActivateWalletResponse,
  GetWalletDepositResponse,
  GetWalletResponse,
  GetWalletUser,
  WalletDepositPayload,
  WalletDepositResponse,
  WalletPayoutInfo,
  WalletWithdrawPayload,
} from '~/types/wallet.types'

export interface ActivateWalletFormPayload {
  account_name: string
  bank_name: string
  bank_cart: string
  sheba_number: string
}

export function useWallet() {
  const { user: authUser, handleSessionExpiry } = useAuth()

  const walletUser = ref<GetWalletUser | null>(null)
  const depositData = ref<GetWalletDepositResponse | null>(null)
  const activePayoutMethod = ref<GetWalletResponse['active_payout_method']>(null)

  const loading = ref(true)
  const error = ref<string | null>(null)
  const actionLoading = ref(false)

  const payoutMethodId = computed(() => activePayoutMethod.value?.id ?? 'user_wallet')
  const payoutInfo = computed<WalletPayoutInfo | null>(() =>
    walletUser.value?.user_meta?.val?.[payoutMethodId.value]
    ?? activePayoutMethod.value?.user
    ?? null)
  const hasPayoutInfo = computed(() => !!payoutInfo.value?.bank_cart && !!payoutInfo.value?.sheba_number)
  const balance = computed(() => Number(walletUser.value?.wallet?.balance ?? authUser.value?.wallet?.balance ?? 0))
  const minDepositRial = computed(() => Number(activePayoutMethod.value?.min ?? 100000))
  const fullName = computed(() => walletUser.value?.full_name
    ?? [walletUser.value?.first_name, walletUser.value?.last_name].filter(Boolean).join(' '))

  async function fetchWallet() {
    loading.value = true
    error.value = null

    const [walletResult, depositResult] = await Promise.all([
      safeApiFetch<GetWalletResponse>('/api/users/get-wallet'),
      safeApiFetch<GetWalletDepositResponse>('/api/users/get-wallet-deposit'),
    ])

    if (walletResult.status === 401) {
      await handleSessionExpiry()
      return
    }

    if (walletResult.error || !walletResult.data) {
      error.value = walletResult.error ?? 'خطا در دریافت اطلاعات کیف پول'
      loading.value = false
      return
    }

    walletUser.value = walletResult.data.user
    activePayoutMethod.value = walletResult.data.active_payout_method
    if (depositResult.data) depositData.value = depositResult.data

    loading.value = false
  }

  async function activateWallet(payload: ActivateWalletFormPayload): Promise<{ ok: boolean; error?: string }> {
    if (actionLoading.value) return { ok: false }
    actionLoading.value = true

    const methodId = activePayoutMethod.value?.id ?? 'user_wallet'
    const metaId = walletUser.value?.user_meta?.id
    const result = await usePrivateApiFetch<ActivateWalletResponse>(
      '/api/users/add-wallet',
      {
        method: 'POST',
        body: {
          ...payload,
          name: methodId,
          method_payout: methodId,
          ...(metaId ? { id: metaId } : {}),
        },
      },
      'خطا در ثبت اطلاعات حساب. لطفا داده‌های ورودی را کنترل کنید',
    )
    actionLoading.value = false

    if (result.error || !result.data) return { ok: false, error: result.error ?? undefined }

    if (result.data.user) {
      walletUser.value = result.data.user
    } else if (walletUser.value) {
      walletUser.value = {
        ...walletUser.value,
        user_meta: {
          ...walletUser.value.user_meta,
          val: { ...walletUser.value.user_meta?.val, [methodId]: { ...payload } },
        },
      }
    }

    return { ok: true }
  }

  async function deposit(payload: WalletDepositPayload): Promise<{ ok: boolean; error?: string }> {
    if (actionLoading.value) return { ok: false }
    actionLoading.value = true

    const result = await usePrivateApiFetch<WalletDepositResponse>(
      '/api/wallet/deposit',
      { method: 'POST', body: payload },
      'خطا در اتصال به درگاه پرداخت. لطفا دوباره تلاش کنید',
    )
    actionLoading.value = false

    if (result.error || !result.data) return { ok: false, error: result.error ?? undefined }

    const redirectUrl = result.data.redirect_url ?? result.data.url ?? null
    if (!redirectUrl) return { ok: false, error: 'آدرس درگاه پرداخت در پاسخ سرور یافت نشد' }

    if (import.meta.client) window.location.href = redirectUrl
    return { ok: true }
  }

  async function withdraw(payload: WalletWithdrawPayload): Promise<{ ok: boolean; error?: string; message?: string }> {
    if (actionLoading.value) return { ok: false }
    actionLoading.value = true

    const result = await usePrivateApiFetch<{ message?: string }>(
      '/api/users/wallet-withdraw',
      { method: 'POST', body: payload },
      'خطایی در برداشت از کیف پول رخ داد',
    )
    actionLoading.value = false

    if (result.error) return { ok: false, error: result.error }

    if (walletUser.value) {
      walletUser.value = {
        ...walletUser.value,
        wallet: { ...walletUser.value.wallet, balance: String(Math.max(balance.value - payload.amount, 0)) },
      }
    }

    return { ok: true, message: result.data?.message }
  }

  return {
    walletUser,
    depositData,
    activePayoutMethod,
    loading,
    error,
    actionLoading: readonly(actionLoading),
    payoutInfo,
    hasPayoutInfo,
    balance,
    minDepositRial,
    fullName,
    fetchWallet,
    activateWallet,
    deposit,
    withdraw,
  }
}