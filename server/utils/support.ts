// server/utils/support.ts
import { SUPPORT_DEPARTMENTS, SUPPORT_STATUS_LABELS } from '~/types/support.types'
import type {
  SupportMessageDto,
  SupportMessageRaw,
  SupportTicketDto,
  SupportTicketRaw,
  SupportTicketShowDto,
  SupportTicketShowRaw,
} from '~/types/support.types'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function departmentTitle(value: string): string {
  return SUPPORT_DEPARTMENTS.find(d => d.value === value)?.title ?? value
}

export function mapSupportMessageToDto(msg: SupportMessageRaw): SupportMessageDto {
  return {
    id: msg.id,
    message: msg.message,
    isSupport: !!msg.is_support,
    userName: msg.user_name ?? (msg.is_support ? 'پشتیبانی' : ''),
    updatedAt: msg.updated_at ?? msg.created_at ?? '',
    file: msg.file ?? null,
    fileUrl: msg.file_url ?? null,
  }
}

export function mapSupportTicketToDto(ticket: SupportTicketRaw): SupportTicketDto {
  const firstMessage = ticket.messages?.[0]?.message ?? ''

  return {
    id: ticket.id,
    subject: ticket.subject,
    department: ticket.department,
    departmentTitle: departmentTitle(ticket.department),
    status: ticket.status,
    statusText: ticket.statusText ?? SUPPORT_STATUS_LABELS[ticket.status] ?? ticket.status,
    updatedAt: ticket.updated_at,
    excerpt: firstMessage ? stripHtml(firstMessage).slice(0, 120) : '',
  }
}

export function mapSupportTicketShowToDto(raw: SupportTicketShowRaw): SupportTicketShowDto {
  const messagesRaw = Array.isArray(raw) ? raw : (raw?.messages ?? raw?.data ?? [])
  const ticketMeta = Array.isArray(raw) ? null : (raw?.ticket ?? null)

  const messages = [...messagesRaw]
    .map(mapSupportMessageToDto)
    .sort((a, b) => a.id - b.id)

  return {
    ticket: ticketMeta
      ? {
          id: ticketMeta.id,
          subject: ticketMeta.subject,
          department: ticketMeta.department,
          departmentTitle: ticketMeta.department ? departmentTitle(ticketMeta.department) : undefined,
          status: ticketMeta.status,
          statusText: ticketMeta.statusText,
          updatedAt: ticketMeta.updated_at,
        }
      : null,
    messages,
  }
}
