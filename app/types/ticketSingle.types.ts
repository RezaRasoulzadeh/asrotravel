// src/types/ticketSingle.types.ts

import type { Faq } from "./poolSingle.types"
import type { TicketItem } from "./ticket.types"

export interface TicketLocation {
  id: number
  name: string
  title: string
  slug: string
}

export interface TicketTerm {
  id: number
  name: string
}

export interface GalleryImage {
  id: number
  image_url: string
  file_name: string
  file_path: string
  file_width: number
  file_height: number
  file_size: number
  file_type: string
  file_extension: string
  create_user: number
}

export interface SeoOgImage {
  id: number
  image_url: string
  file_name: string
  file_path: string
  file_width: number
  file_height: number
  file_size: number
  file_type: string
  file_extension: string
  create_user: number
}

export interface TicketSeo {
  id: number
  title: string
  description: string
  keywords: string
  share: string
  seo_image: number
  og_image: SeoOgImage | null
  canonical?: string
}

export interface BreadcrumbItem {
  title: string
  link: string
}

export interface Ticket {
  id: number
  title: string
  slug: string
  content: string | null
  image_id: number | null
  banner_image_id: number | null
  location_id: number | null
  address: string | null
  map_lat: string | null
  map_lng: string | null
  map_zoom: number | null
  is_featured: number
  gallery: string | null
  video: string | null
  enable_extra_price: unknown | null
  extra_price: unknown | null
  faqs: Faq[] | null
  min_price: string | null
  max_offer_percent: number | null
  max_guest: number | null
  cancel_policy: string | null
  terms_information: string | null
  review_score: string | null
  status: string
  enable_service_fee: unknown | null
  service_fee: unknown | null
  for_season: string[] | null
  min_day_before_booking: number | null
  service_active: number
  create_user: number
  update_user: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  have_code_list: boolean
  reviewsLength: number
  location: TicketLocation | null
  terms: TicketTerm[]
}

export interface FaqItem {
  id: number
  question: string
  answer: string
}

export interface ServiceFeatures {
  name: string
  desc: string
  code: string | null
  gender: string
  number: number
  price: string
  marketer_price: string | null
  marketer_sale_price: string | null
  offer: string
  unit: string
  type: string
  gallery: string | null
  is_deposit_payment: string
  child_price_display: string
  adult_price_with_offer: number
  min: number
  uuid: string | null
  service_id: number
  service_type: string
  max: string
  id: number
  origin_price_display: string
  price_with_offer_display: string
  display_price_object: {
    price_with_offer_display: string
    origin_price_display: string
  }
  adult_price_html: string
}

export interface TicketServiceItem {
  id: number
  ticket_id: number
  service_type: string
  sale_price: number
  price: number
  offer_percent: number
  status: number
  enable_service_types: boolean
  service_features: ServiceFeatures
  enable_extra_price: unknown | null
  extra_price: unknown | null
  discount_by_people: unknown | null
  enable_open_hours: unknown | null
  create_user: number
  cat_id: number
  update_user: number | null
  created_at: string
  updated_at: string
}

export type TicketServicesByGender = Readonly<Record<string, readonly TicketServiceItem[]>>
export type TicketServiceCategory = readonly TicketServicesByGender[]
export type TicketServices = Readonly<Record<string, TicketServiceCategory>>

export interface TicketSanse {
  id: number
  extra_price: unknown[]
  minDate: string
  min_price_display: string
  price_with_offer_display: string
  min_price: string
  price_with_offer: number
  max_number: number
  buyer_fees: unknown[]
  start_date: string
  start_date_html: string
  deposit_fomular: string
  is_form_enquiry_and_book: boolean
  enquiry_type: string
  services: {
    ticket: TicketServices
    vip: Record<string, unknown>
  }
}

export interface TicketSingleApiResponse {
  ticket: Ticket
  gallery: GalleryImage[]
  related: TicketItem[]
  seo: TicketSeo
  link: string
  breadcrumb_data: BreadcrumbItem[]
}

export interface TicketCartItem {
  serviceId: number
  serviceFeatureId: number
  ticketId: number
  categoryName: string
  genderGroup: string
  serviceName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  priceDisplay: string
  totalPriceDisplay: string
}