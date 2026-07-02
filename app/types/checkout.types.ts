// app/types/checkout.types.ts
export interface CheckoutQuantityItem {
  quantity: number
}

export interface CheckoutQuantity {
  adult?: CheckoutQuantityItem
  child?: CheckoutQuantityItem
}

export interface CheckoutBooking {
  total: string
  total_guests: number
  booking_code: string
  start_date: string
  end_date: string
  deposit: string | null
  total_before_discount: string
  total_display: string
  offer_display: string
  quantity: CheckoutQuantity
}

export interface CheckoutDisplayPriceObject {
  price_with_offer_display: string
  origin_price_display: string
}

export interface CheckoutService {
  uuid: string
  day_number: string
  enable: string
  from: string
  to: string
  sanse_time: string | null
  adult_price: string
  child_price: string | null
  marketer_price: string
  marketer_sale_price: string
  offer: number
  unit: string
  type: string
  time_display: string
  date: string
  en_date: string
  end_date: string
  start_date: string
  day: string
  date_display: string
  child_price_display: string
  adult_price_with_offer: number
  min: number
  status: boolean
  status_text: string
  service_id: number
  service_type: string
  service_module: string
  number: number
  id: number
  origin_price_display: string
  price_with_offer_display: string
  child_price_with_offer: number | null
  display_price_object: CheckoutDisplayPriceObject
  adult_price_html: string
  slug: string
  quantity: CheckoutQuantity
  total_price: number
  total_price_with_offer: number
  reservation_code: string
  total_offer: number
  created_ticket: string
  total_price_display: string
  title: string
}

export interface CheckoutParent {
  title: string
  slug: string
  id: number
  url: string
}

export interface CheckoutGateway {
  name: string
  logo: string
}

export type CheckoutGateways = Record<string, CheckoutGateway>

export interface CheckoutResponse {
  page_title: string
  booking: CheckoutBooking
  service_id: number
  service_type: string
  service: CheckoutService
  parent: CheckoutParent
  gateways: CheckoutGateways
}