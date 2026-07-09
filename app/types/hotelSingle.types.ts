// types/hotelSingle.types.ts

// ─── Shared Detail Components ────────────────────────────────────────────────

export interface HotelSingleImage {
  id:             number
  image_url:      string
  file_name:      string
  file_path:      string
  file_width:     number
  file_height:    number
  file_size:      number
  file_type:      string
  file_extension: string
  create_user:    number
}

export interface HotelSingleLocation {
  id:       number
  title:    string
  name:     string
  slug:     string
  map_lat?: string
  map_lng?: string
}

export interface HotelSingleFaq {
  id?:       number | string
  title:     string
  content:   string
  status?:   string
}

// ─── Single Hotel Profile ────────────────────────────────────────────────────

export interface HotelPolicy {
  title:   string
  content: string
}

export interface HotelSurroundingItem {
  name:    string
  content: string | null
  value:   string
  type:    'km' | 'm' | string
}

export type HotelSurrounding = Record<string, HotelSurroundingItem[]>

export interface HotelSingleTermRef {
  id:        number
  term_id:   number
  target_id: number
  term: {
    id:   number
    name: string
  }
}

export interface HotelSeoSharePlatform {
  title: string | null
  desc:  string | null
  image: string | null
}

export interface HotelSeoShare {
  facebook: HotelSeoSharePlatform
  twitter:  HotelSeoSharePlatform
}

export interface HotelSingleSeo {
  id:          number
  title:       string
  description: string
  share:       string 
  keywords:    string
  seo_image:   number
  og_image:    HotelSingleImage | null
}

export interface HotelDetail {
  id:                     number
  title:                  string
  slug:                   string
  url:                    string
  content:                string 
  address:                string
  map_lat:                string
  map_lng:                string
  map_zoom:               number
  star_rate:              number | null
  image_id:               number
  banner_image_id:        number
  location_id:            number
  is_featured:            boolean
  gallery:                string 
  gallery_array:          string[]
  video:                  string | null
  wish_list?:             boolean | null
  check_in_time:          string
  check_out_time:         string
  allow_full_day:         boolean | null
  price:                  string 
  sale_price:             string | null 
  min_price_display:      string 
  price_display:          string 
  max_offer_percent:      number
  review_score:           string | null
  reviewsLength:          number
  min_day_before_booking: number
  min_day_stays:          number
  enable_extra_price:     boolean | null
  extra_price:            number | null
  enable_service_fee:     boolean | null
  service_fee:            number | null
  service_active:         number
  default_state:          number
  ical_import_url:        string | null
  status:                 'publish' | 'draft' | string
  create_user:            number
  update_user:            number
  deleted_at:             string | null
  created_at:             string
  updated_at:             string
  policy:                 HotelPolicy[]
  surrounding:            HotelSurrounding
  terms:                  HotelSingleTermRef[]
  location:               HotelSingleLocation
  seo:                    HotelSingleSeo
  faqs:                   HotelSingleFaq[]
}

// ─── Similarity Components ───────────────────────────────────────────────────

export interface HotelSimilarItem {
  id:                number
  title:             string
  slug:              string
  url:               string
  star_rate:         number | null
  image_id:          number
  banner_image_id:   number
  location_id:       number
  address:           string
  price:             string
  sale_price:        string | null
  min_price_display: string
  price_display:     string
  max_offer_percent: number
  review_score:      string | null
  reviewsLength:     number
  status:            string
  is_featured:       boolean | null
  banner:            HotelSingleImage | null
  location:          HotelSingleLocation
}

// ─── Rooms Schema ────────────────────────────────────────────────────────────

export interface HotelRoomFeature {
  icon: string
  name: string
}

export interface HotelRoomDateInfo {
  number:                    number
  price:                     string
  display_price:             string
  display_price_with_offer:  string
  have_offer:                boolean
  max_offer_percent:         number
}

export type HotelRoomDates = Record<string, HotelRoomDateInfo>

export interface HotelRoom {
  id:                      number
  title:                   string
  price:                   number
  price_with_offer:        number
  price_html:              string
  price_text:              string
  price_with_offer_html:   string
  price_with_offer_text:   string
  extra_person:            boolean
  extra_person_count:      number
  extra_person_price:      number
  extra_person_price_text: string
  adults:                  number
  children:                number
  adults_html:             string
  children_html:           string
  beds_html:               string
  size_html:               Record<string, unknown>
  number:                  number
  number_selected:         number
  tmp_number:              number
  is_online:               boolean
  min_day_stays:           number
  night_count:             number
  image:                   HotelSingleImage | null
  gallery:                 (HotelSingleImage | null)[]
  term_features:           HotelRoomFeature[]
  tmp_dates:               HotelRoomDates
  userInfo: {
    name:          string
    national_code: string
  }
}

// ─── Network Request & Parameter Envelopes ──────────────────────────────────

export interface HotelRoomSearchParams {
  adults:     number
  children:   number
  start_date: string // YYYY-MM-DD
  end_date:   string // YYYY-MM-DD
}

export interface HotelSingleResponse {
  hotel:   HotelDetail
  gallery: HotelSingleImage[]
  related: HotelSimilarItem[]
}