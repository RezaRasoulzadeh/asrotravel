// server/utils/wallet.ts
import type { RawWalletUser, WalletUserDto } from '~/types/wallet.types'

export function mapWalletUserToDto(user: RawWalletUser): WalletUserDto {
  return {
    full_name: user.full_name,
    first_name: user.first_name,
    last_name: user.last_name,
    wallet: { balance: user.wallet?.balance ?? '0' },
    user_meta: user.user_meta
      ? { id: user.user_meta.id, val: user.user_meta.val }
      : null,
  }
}