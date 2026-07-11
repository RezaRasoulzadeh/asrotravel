// server/api/users/add-wallet.post.ts
import type { ActivateWalletResponse } from '~/types/wallet.types'

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)

  return await authApiFetch<ActivateWalletResponse>(
    event,
    '/users/create-wallet',
    { method: 'POST', body },
  )
})