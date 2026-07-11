// server/api/users/get-wallet.get.ts
import type { GetWalletResponse } from '~/types/wallet.types'

export default defineEventHandler(async (event) => {
  return await authApiFetch<GetWalletResponse>(
    event,
    '/users/get-wallet',
  )
})