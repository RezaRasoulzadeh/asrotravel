// server/api/users/get-wallet-deposit.get.ts
import type { GetWalletDepositResponse } from '~/types/wallet.types'

export default defineEventHandler(async (event) => {
  return await authApiFetch<GetWalletDepositResponse>(
    event,
    '/users/get-wallet-deposit',
  )
})