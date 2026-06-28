// types/placeSingle.types.ts

// ─── Shared Detail Components ────────────────────────────────────────────────

export interface PlaceGalleryItem {
  id:        number
  place_id:  number
  image_url: string
}

export interface PlaceDetail {
  id:                 number
  translate_place_id: number
  title:              string
  description:        string
  keywords:           string | null
  video:              string | null
  image_url:          string | null
}

export interface PlaceTranslate {
  id:          number
  title:       string
  description: string
  address:     string
  place_id:    number
  lang_id:     number
  tozihat:     string
  keywords:    string
  video:       string | null
  rule:        string | null
  biography:   string | null
  details:     PlaceDetail[]
}

export interface PlaceLocation {
  title: string
  name:  string
  slug:  string
}

// ─── Single Profile Response Envelopes ───────────────────────────────────────

export interface PlaceSingleProfile {
  id:                   number
  url:                  string
  title:                string
  imageUrl:             string
  image_url:            string
  ename:                string
  category_id:          number
  city_id:              string
  latitude:             string
  longitude:            string
  time:                 number
  access_time:          number | null
  gravity_id:           number
  track:                string | null
  view_count:           number
  like_count:           number
  memorise_count:       number
  comment_count:        number
  rate:                 number
  review_score:         number
  is_verified:          boolean
  inserter_id:          number
  is_active:            boolean
  is_special:           boolean
  star:                 number | null
  is_verified_marketer: boolean
  is_marketerInserted:  boolean
  created_at:           string
  updated_at:           string
  view_price:           number
  translate:            PlaceTranslate
  author:               null
  location:             PlaceLocation
  gallery:              PlaceGalleryItem[]
}