// src/types/province.types.ts

import type { HotelCardItem } from '@/types/hotel.types'
import type { PoolItem } from '@/types/pool.types'
import type { TicketItem } from '@/types/ticket.types'

export interface ProvinceBanner {
  image_url: string
  file_path: string
  file_width: number
  file_height: number
}

export interface ProvinceCity {
  id: number
  name: string
  slug: string
  title: string
  content: string | null
  map_lat: string | null
  map_lng: string | null
  image_id: number
  banner_image_id: number | null
  parent_id: number
  status: string
}

export interface ProvinceSeo {
  id: number
  title: string | null
  description: string | null
  keywords: string | null
  seo_image: string | null
  og_image: string | null
}

export interface Province {
  id: number
  name: string
  title: string
  slug: string
  content: string | null
  image_id: number
  banner_image_id: number | null
  banner: ProvinceBanner | null
  map_lat: string | null
  map_lng: string | null
  status: string
  city: ProvinceCity[]
  seo: ProvinceSeo
}

export interface ProvinceLocation {
  id: number
  name: string
  title: string
  slug: string
  type: 'location'
  url: string
  image_id: number
  parent_id: number
}

export interface ProvinceCategory {
  id: number
  parent_id: number
  slug: string
  type: 'category'
  url: string
  translate: {
    id: number
    tourism_category_id: number
    title: string
    description: string | null
    keywords: string | null
    lang_id: number
  }
}

export interface ProvincePlace {
  id: number
  url: string
  title: string
  imageUrl: string
  image_url: string
  category_id: number
  city_id: number
  view_count: number
  like_count: number
  review_score: number
  is_active: boolean
  is_special: boolean
  updated_at: string
  translate: {
    title: string
    id: number
    address: string
    place_id: number
    lang_id: number
  }
  author: null
  location: {
    title: string
    name: string
    slug: string
  }
}

export interface ProvinceBlogPost {
  id: number
  url: string
  slug: string
  title: string
  status: string
  view_count: number
  like_count: number
  share_count: number
  comment_count: number
  location_id: number
  image_id: number
  updated_at: string
  banner: {
    image_url: string
    file_path: string
    file_width: number
    file_height: number
  }
  author: {
    full_name: string
    first_name: string
    last_name: string
  } | null
}

export interface ProvinceReservationSection<T> {
  data: T[]
  title: string
  meta: string
}

export interface ProvinceTopPosts {
  data: ProvincePlace[]
  title: string
  meta: string
  more_link: { link: string }
}

export interface ProvinceBlogSection {
  data: ProvinceBlogPost[]
  title: string
  meta: string
  more_link: { link: string }
}

export interface ProvincePageData {
  province: Province
  locations: ProvinceLocation[]
  categories: ProvinceCategory[]
  reservation_data: {
    hotel: ProvinceReservationSection<HotelCardItem>
    Pool: ProvinceReservationSection<PoolItem>
    Ticket: ProvinceReservationSection<TicketItem>
  }
  top_posts: ProvinceTopPosts
  random_new_blog: ProvinceBlogSection
  new_news: { data: never[]; title: string; meta: string; more_link: { link: string } }
  seo: ProvinceSeo
}