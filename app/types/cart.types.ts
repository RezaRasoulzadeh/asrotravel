// app/types/cart.types.ts
import type { OpenHour } from '~/types/poolSingle.types'

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