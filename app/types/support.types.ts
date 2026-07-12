// app/types/support.types.ts

export type SupportSort = 'all' | 'opening' | 'closed'

export type SupportStatus = 'user_res' | 'admin_res' | 'deactive'

export const SUPPORT_DEPARTMENTS = [
  { value: 'Management', title: 'مدیریت' },
  { value: 'Customer_support', title: 'پشتیبانی مشتری' },
  { value: 'Technical_Support', title: 'پشتیبانی فنی' },
  { value: 'Financial_Support', title: 'پشتیبانی مالی' },
] as const

export type SupportDepartment = typeof SUPPORT_DEPARTMENTS[number]['value']

// TODO: not present anywhere in the old (pre-rewrite) client code — discovered only
// because the backend rejects ticket creation with "priority should not be empty".
// Values/labels are a best guess (common low/medium/high convention); confirm against
// the backend's actual accepted enum and adjust if ticket creation still 422s.
export const SUPPORT_PRIORITIES = [
  { value: 'low', title: 'کم' },
  { value: 'medium', title: 'متوسط' },
  { value: 'high', title: 'زیاد' },
] as const

export type SupportPriority = typeof SUPPORT_PRIORITIES[number]['value']

export const SUPPORT_STATUS_LABELS: Record<SupportStatus, string> = {
  user_res: 'در انتظار پاسخ پشتیبانی',
  admin_res: 'پاسخ داده شد',
  deactive: 'بسته شده',
}

export const SUPPORT_STATUS_BADGE: Record<SupportStatus, string> = {
  user_res: 'badge-warning',
  admin_res: 'badge-info',
  deactive: 'badge-ghost',
}

export const SUPPORT_SORT_LABELS: Record<SupportSort, string> = {
  all: 'همه تیکت‌ها',
  opening: 'تیکت‌های باز',
  closed: 'بسته شده',
}

// TODO: raw external API shapes — server-only, unconfirmed against the live backend
// beyond what the old (pre-rewrite) client code implied. Normalized to DTOs below
// before anything reaches the client.

export interface SupportMessageRaw {
  id: number
  ticket_id?: number
  message: string
  is_support: boolean
  user_name?: string
  file?: string | null
  file_url?: string | null
  created_at?: string
  updated_at: string
}

export interface SupportTicketRaw {
  id: number
  subject: string
  department: string
  status: SupportStatus
  statusText?: string
  created_at?: string
  updated_at: string
  messages?: SupportMessageRaw[]
}

export interface SupportTicketListResponse {
  data: SupportTicketRaw[]
  total?: number
  totalPages?: number
  currentPage?: number
  perPage?: number
}

// TODO: unconfirmed whether /support/show/:id returns a flat message array (as the
// old client code implied by assigning the response directly into the message list)
// or an object with ticket metadata alongside the messages. Handled defensively.
export type SupportTicketShowRaw =
  | SupportMessageRaw[]
  | { ticket?: Partial<SupportTicketRaw>, messages?: SupportMessageRaw[], data?: SupportMessageRaw[] }

// TODO: client-facing DTOs — the only shapes sent over /api/support/*.

export interface SupportMessageDto {
  id: number
  message: string
  isSupport: boolean
  userName: string
  updatedAt: string
  file: string | null
  fileUrl: string | null
}

export interface SupportTicketDto {
  id: number
  subject: string
  department: string
  departmentTitle: string
  status: SupportStatus
  statusText: string
  updatedAt: string
  excerpt: string
}

export interface SupportTicketListDtoResponse {
  data: SupportTicketDto[]
  total: number
  totalPages: number
  currentPage: number
  perPage: number
}

export interface SupportTicketShowDto {
  ticket: Partial<SupportTicketDto> | null
  messages: SupportMessageDto[]
}

export interface NewSupportTicketPayload {
  subject: string
  department: string
  priority: string
  message: string
  file?: File | null
}
