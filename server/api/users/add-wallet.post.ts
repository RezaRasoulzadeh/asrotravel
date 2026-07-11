// server/api/users/add-wallet.post.ts
import type { ActivateWalletResponse, ActivateWalletResponseDto } from '~/types/wallet.types'

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)

  const raw = await authApiFetch<ActivateWalletResponse>(
    event,
    '/users/create-wallet',
    { method: 'POST', body },
  )

  const dto: ActivateWalletResponseDto = {
    success: raw.success,
    user: raw.user ? mapWalletUserToDto(raw.user) : undefined,
  }

  return dto
})