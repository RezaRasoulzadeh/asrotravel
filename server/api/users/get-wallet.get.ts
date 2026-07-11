// server/api/users/get-wallet.get.ts
import type { GetWalletResponse, GetWalletResponseDto } from '~/types/wallet.types'

export default defineEventHandler(async (event) => {
  const raw = await authApiFetch<GetWalletResponse>(
    event,
    '/users/get-wallet',
  )

  const dto: GetWalletResponseDto = {
    active_payout_method: raw.active_payout_method,
    user: mapWalletUserToDto(raw.user),
  }

  return dto
})