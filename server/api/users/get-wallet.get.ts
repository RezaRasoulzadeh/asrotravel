// server/api/users/get-wallet.get.ts
import type { GetWalletResponse, GetWalletResponseDto } from '~/types/wallet.types'

const EMPTY_WALLET_USER: GetWalletResponseDto['user'] = {
  first_name: '',
  last_name: '',
  wallet: { balance: '0' },
  user_meta: null,
}

export default defineEventHandler(async (event) => {
  const raw = await authApiFetch<GetWalletResponse>(
    event,
    '/users/get-wallet',
  )

  const dto: GetWalletResponseDto = {
    active_payout_method: raw.active_payout_method,
    user: raw.user ? mapWalletUserToDto(raw.user) : EMPTY_WALLET_USER,
  }

  return dto
})