// server/api/users/update-profile.put.ts
import type { UpdateProfilePayload, UpdateProfileResponse } from '~/types/profile.types'

export default defineEventHandler(async (event) => {
  const body = await readBody<UpdateProfilePayload>(event)

  return await authApiFetch<UpdateProfileResponse>(
    event,
    '/users/UpdateProfile',
    { method: 'PUT', body },
  )
})