// types/review.types.ts

export interface ReviewListParams {
  object_id: number
  object_model: string
  object_name: string
  object_image?: string
  page?: number
}

export interface ReviewAuthor {
  first_name?: string
  last_name?: string
}

export interface ReviewItem {
  id: number
  author?: ReviewAuthor
  created_at?: string
  rate_number?: number
  title?: string
  content?: string
}

export interface ReviewRateScore {
  percent: number
  total: number
}

export interface ReviewListScore {
  score_total?: number
  total_review?: number
  rate_score?: Record<number, ReviewRateScore>
}

export interface ReviewListResponse {
  list_score?: ReviewListScore
  reviews?: {
    data: ReviewItem[]
    totalPages?: number
  }
}