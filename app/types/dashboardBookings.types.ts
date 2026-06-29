// app/types/dashboardBookings.types.ts

export type BookingTab = 'pool' | 'hotel' | 'ticket'
export type BookingObjectModel = 'Pool' | 'Hotel' | 'Ticket'

export interface BookingLocation {
  name: string
  id: number
  slug: string
}

export interface BookingService {
  title: string
  id: number
  slug: string
  location_id: number
  object_id: number
  location: BookingLocation
}

export interface BookingMeta {
  val: string
  id: number
  booking_id: number
  name: string
  create_user: number | null
  update_user: number | null
}

export interface DashboardBooking {
  total_display: string
  offer_display: string
  coupon_amount_display: string
  status_text: string
  id: number
  code: string
  vendor_id: number
  customer_id: number
  payment_id: number
  gateway: string
  object_id: number
  object_model: BookingObjectModel
  start_date: string
  end_date: string
  total: string
  total_guests: number
  currency: string | null
  status: string
  deposit: string
  deposit_type: string | null
  commission: string
  commission_type: string | null
  mobile: string | null
  country: string | null
  customer_notes: string | null
  total_before_fees: string
  paid: string | null
  pay_now: string
  wallet_credit_used: number
  wallet_total_used: number
  total_before_discount: string
  coupon_amount: string
  created_at: string
  updated_at: string
  service: BookingService
  booking_meta: BookingMeta
}

export interface DashboardBookingsResponse {
  total: number
  data: DashboardBooking[]
  totalPages: number
  currentPage: number
  perPage: number
}