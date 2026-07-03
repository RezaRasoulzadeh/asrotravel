// server/utils/dashboardBookings.ts
import { toJalali } from '~/utils/date'
import type { DashboardBooking, DashboardBookingDto } from '~/types/dashboardBookings.types'

// TODO: duplicates the jalali-digit formatting also present in BookingCard.vue for
// createdAt — consolidate into one shared formatter once toJalali usage settles.
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