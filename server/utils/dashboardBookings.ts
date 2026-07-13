// server/utils/dashboardBookings.ts
import { toJalali } from '~/utils/date'
import type { BookingObjectModel, BookingTab, DashboardBooking, DashboardBookingDto } from '~/types/dashboardBookings.types'

// object_model as returned in booking responses — always capitalized.
export const TAB_TO_MODEL: Record<BookingTab, BookingObjectModel> = {
  pool: 'Pool',
  hotel: 'Hotel',
  ticket: 'Ticket',
}

export const TAB_TO_SERVICE_PARAM: Record<BookingTab, string> = {
  pool: 'Pool',
  hotel: 'hotel',
  ticket: 'Ticket',
}

export const SERVICE_PARAM_BY_MODEL: Record<BookingObjectModel, string> = {
  Pool: 'Pool',
  Hotel: 'hotel',
  Ticket: 'Ticket',
}

function toFaNumber(value: number): string {
  return value.toLocaleString('fa-IR', { useGrouping: false })
}

function formatFallbackDate(iso: string): string {
  const date = new Date(iso)
  const { jy, jm, jd } = toJalali(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
  return `${toFaNumber(jy)}/${jm.toLocaleString('fa-IR', { minimumIntegerDigits: 2 })}/${jd.toLocaleString('fa-IR', { minimumIntegerDigits: 2 })}`
}

export function mapBookingToDto(booking: DashboardBooking): DashboardBookingDto {
  const meta = booking.booking_meta?.val

  return {
    id: booking.id,
    code: booking.code,
    reservationCode: meta?.reservation_code ?? null,
    status: booking.status,
    statusText: booking.status_text,
    objectModel: booking.object_model,
    title: booking.service?.title ?? '',
    slug: booking.service?.slug ?? null,
    locationName: booking.service?.location?.name ?? null,
    dateDisplay: meta?.date_display ?? formatFallbackDate(booking.start_date),
    timeDisplay: meta?.time_display ?? null,
    totalDisplay: booking.total_display,
    offerDisplay: booking.offer_display,
    couponAmountDisplay: booking.coupon_amount_display,
    paid: booking.paid,
    payNow: booking.pay_now,
    walletTotalUsed: booking.wallet_total_used ?? 0,
    customerNotes: booking.customer_notes,
    createdAt: booking.created_at,
    adultCount: meta?.quantity?.adult?.quantity ?? booking.total_guests,
    childCount: meta?.quantity?.child?.quantity ?? 0,
  }
}

export function extractWishCount(raw: unknown): number {
  if (Array.isArray(raw)) return raw.length
  if (!raw || typeof raw !== 'object') return 0

  const obj = raw as Record<string, unknown>
  const candidates = [
    obj.total,
    obj.count,
    (obj.meta as Record<string, unknown> | undefined)?.total,
    (obj.pagination as Record<string, unknown> | undefined)?.total,
  ]
  const found = candidates.find(v => typeof v === 'number')
  if (typeof found === 'number') return found

  if (Array.isArray(obj.data)) return obj.data.length
  return 0
}