// composables/useBlogSide.ts

import type { BlogSideResponse } from '~/types/blog'

export function useBlogSide() {
  return useFetch<BlogSideResponse>('/api/blog/side', {
    default: () => ({}),
  })
}