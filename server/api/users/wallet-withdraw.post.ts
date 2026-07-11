// server/api/users/wallet-withdraw.post.ts
import type { WalletWithdrawPayload } from '~/types/wallet.types'

export default defineEventHandler(async (event) => {
  const body = await readBody<WalletWithdrawPayload>(event)

  return await authApiFetch<{ message?: string }>(
    event,
    '/users/wallet-withdraw',
    { method: 'POST', body },
  )
})