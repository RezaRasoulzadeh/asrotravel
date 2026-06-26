// types/blogSingle.types.ts
export interface BlogSingle {
  id: number
  title: string
  content: string
  url: string
  slug: string
  created_at: string
  updated_at: string
  view_count: number
  comment_count: number
  like_count: number
  banner?: {
    image_url: string
  }
  seo?: {
    title?: string
    description?: string
    keywords?: string
    og_image?: {
      image_url: string
    }
  }
  author?: {
    full_name?: string
  }
}