// server/api/users/profile-avatar.post.ts
import type { UploadAvatarResponse } from '~/types/profile.types'

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  const filePart = parts?.find(part => part.name === 'file')

  if (!filePart) {
    throw createError({ statusCode: 400, statusMessage: 'File is required' })
  }

  const body = new FormData()
  body.append('file', new Blob([new Uint8Array(filePart.data)], { type: filePart.type }), filePart.filename)

  return await authApiFetch<UploadAvatarResponse>(
    event,
    '/users/profile-avatar',
    { method: 'POST', body },
  )
})