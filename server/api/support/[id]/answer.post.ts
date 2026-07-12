// server/api/support/[id]/answer.post.ts
import type { SupportMessageDto, SupportMessageRaw } from '~/types/support.types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Ticket id is required' })
  }

  const parts = await readMultipartFormData(event)
  const message = parts?.find(p => p.name === 'message')?.data.toString('utf-8').trim()
  const filePart = parts?.find(p => p.name === 'file' && p.filename)

  if (!message) {
    throw createError({ statusCode: 400, statusMessage: 'Message is required' })
  }

  const body = new FormData()
  body.append('message', message)
  if (filePart) {
    const safeName = normalizeFileName(filePart.filename ?? 'file')
    body.append('file', new Blob([new Uint8Array(filePart.data)], { type: filePart.type }), safeName)
  }

  const raw = await authApiFetch<SupportMessageRaw | { message?: SupportMessageRaw }>(
    event,
    `/support/answer/${encodeURIComponent(id)}`,
    { method: 'POST', body },
  )

  const messageRaw = (raw as { message?: SupportMessageRaw })?.message
    ?? (typeof (raw as SupportMessageRaw)?.id === 'number' ? (raw as SupportMessageRaw) : null)

  if (!messageRaw) {
    throw createError({ statusCode: 502, statusMessage: 'Failed to send reply', data: raw })
  }

  const dto: SupportMessageDto = mapSupportMessageToDto(messageRaw)
  return dto
})