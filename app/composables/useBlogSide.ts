// composables/useBlogSide.ts

import type { BlogSideResponse } from '~/types/blog.types'

export function useBlogSide() {
  return useFetch<BlogSideResponse>('/api/blog/side', {
    default: () => ({}),
  })
}