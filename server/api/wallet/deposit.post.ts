// server/api/wallet/deposit.post.ts
import type { WalletDepositPayload, WalletDepositResponse } from '~/types/wallet.types'

export default defineEventHandler(async (event) => {
  const body = await readBody<WalletDepositPayload>(event)

  return await authApiFetch<WalletDepositResponse>(
    event,
    '/wallet/wallet-deposit',
    { method: 'POST', body },
  )
})