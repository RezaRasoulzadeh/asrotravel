// app/types/cart.types.ts
import type { OpenHour, VipChangeDateSlot } from '~/types/poolSingle.types'
import type { HotelRoom } from '~/types/hotelSingle.types'

export interface CartAddQuantityItem {
  quantity: number
}

export interface CartAddQuantity {
  adult: CartAddQuantityItem
  child?: CartAddQuantityItem
}

export interface CartAddUserInfo {
  first_name: string
  last_name: string
  mobile: string
  gender: string
  national_code: string
  email: string
}

export interface CartAddServicePayload extends OpenHour {
  total_price: number
  total_price_with_offer: number
  quantity: CartAddQuantity
}

export interface CartAddPayload {
  service_type: string
  service_id: number
  service: CartAddServicePayload
  userInfo: CartAddUserInfo
  term_accepted: boolean
  night_count: number
  max_offer_percent: number
  start_date: string
  end_date: string
  date: string
  display_date: string
  adults: number
  children: number
  is_changed: boolean
  total_price_display: string
  total_price: number
  total_price_with_offer_display: string
  total_price_with_offer: number
}

export interface CartAddResponse {
  url: string
  booking_code: string
  need_offline_accept: boolean
  return: CartAddPayload
}


export interface VipCartAddServicePayload extends VipChangeDateSlot {
  service_type: string
  total_price: number | string
  total_price_with_offer: number | string
  quantity: CartAddQuantity
  start_date: string
  end_date: string
}

export interface VipParentInfo {
  title: string
  slug: string
}

export interface VipCartAddPayload {
  service_type: string
  service_id: number
  service: VipCartAddServicePayload
  userInfo: CartAddUserInfo
  term_accepted: boolean
  is_customer: "100" | "0"
  customer_notes: string
  night_count: number
  max_offer_percent: number
  start_date: string
  end_date: string
  adults: number
  children: number
  date: string
  display_date: string
  total_price_display: string
  total_price: number | string
  total_price_with_offer_display: string
  total_price_with_offer: number | string
  rooms: any[]
  parent: VipParentInfo
}

// ─── Hotel booking ───────────────────────────────────────────────────────────

export interface HotelCartAddRoomUserInfo {
  name: string
  national_code: string
}

export interface HotelCartAddRoomDates {
  [date: string]: {
    number: number
    price: string
    display_price: string
    display_price_with_offer: string
    have_offer: boolean
    max_offer_percent: number
  }
}

export interface HotelCartAddRoom {
  adults: number
  children: number
  price: number
  price_with_offer: number
  number: number
  id: number
  number_selected: number
  extra_person_count: number
  extra_person_price: number
  title: string
  userInfo: HotelCartAddRoomUserInfo
  tmp_dates: HotelCartAddRoomDates
  is_customer: boolean
}

export interface HotelCartAddPayload {
  service_type: 'hotel'
  service_id: number
  service: Record<string, never>
  userInfo: CartAddUserInfo
  term_accepted: boolean
  night_count: number
  max_offer_percent: number
  start_date: string
  end_date: string
  date: [string, string]
  display_date: string
  rooms: HotelCartAddRoom[]
  adults: number
  children: number
  is_changed: boolean
  total_price_display: string
  total_price: number
  total_price_with_offer_display: string
  total_price_with_offer: number
}

/** Hand-off state from HotelRoomsSection's room cart to /cart/hotel-detail, mirrors the vip-checkout-slot pattern */
export interface HotelCheckoutSlotState {
  hotelId: number
  hotelTitle: string
  hotelSlug: string
  startDate: string
  endDate: string
  nightCount: number
  selectedRooms: HotelRoom[]
}

/** Persisted alongside HotelCheckoutSlotState so the checkout summary can render room details the checkout GET endpoint doesn't return */
export interface HotelCheckoutSummaryState {
  hotelTitle: string
  startDate: string
  endDate: string
  nightCount: number
  rooms: Array<{
    title: string
    numberSelected: number
    priceWithOffer: number
    price: number
  }>
}