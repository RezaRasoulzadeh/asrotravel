// server/api/users/add-send-notification.post.ts
import type { AddNotificationPayload } from '~/types/wishNotification.types'

export default defineEventHandler(async (event) => {
  const body = await readBody<AddNotificationPayload>(event)

  return await authApiFetch(
    event,
    '/users/add-send-notification',
    { method: 'POST', body },
  )
})