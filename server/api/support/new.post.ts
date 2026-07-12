// server/api/support/new.post.ts
import type { SupportTicketDto, SupportTicketRaw } from '~/types/support.types'

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)

  if (!parts) {
    throw createError({ statusCode: 400, statusMessage: 'Form data is required' })
  }

  const subject = parts.find(p => p.name === 'subject')?.data.toString('utf-8').trim()
  const department = parts.find(p => p.name === 'department')?.data.toString('utf-8').trim()
  const priority = parts.find(p => p.name === 'priority')?.data.toString('utf-8').trim()
  const message = parts.find(p => p.name === 'message')?.data.toString('utf-8').trim()
  const filePart = parts.find(p => p.name === 'file' && p.filename)

  if (!subject || !department || !priority || !message) {
    throw createError({ statusCode: 400, statusMessage: 'Subject, department, priority and message are required' })
  }

  const body = new FormData()
  body.append('subject', subject)
  body.append('department', department)
  body.append('priority', priority)
  body.append('message', message)
  if (filePart) {
    body.append('file', new Blob([new Uint8Array(filePart.data)], { type: filePart.type }), filePart.filename)
  }

  const raw = await authApiFetch<SupportTicketRaw | { ticket?: SupportTicketRaw }>(
    event,
    '/support/new',
    { method: 'POST', body },
  )

  const ticket = (raw as { ticket?: SupportTicketRaw })?.ticket ?? (raw as SupportTicketRaw)

  if (!ticket?.id) {
    throw createError({ statusCode: 502, statusMessage: 'Failed to create ticket', data: raw })
  }

  const dto: SupportTicketDto = mapSupportTicketToDto(ticket)
  return dto
})
