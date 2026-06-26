// composables/useBlogSingle.ts

import type { BlogSingle } from '~/types/blog.types'

const PANEL_URL = 'https://panel.asrotravel.com'

function normalizeContent(html: string): string {
  if (!html) return ''

  return html
    .replaceAll('src="/uploads/', `src="${PANEL_URL}/uploads/`)
    .replaceAll("src='/uploads/", `src='${PANEL_URL}/uploads/`)
    .replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
    .replace(/<h[1-6][^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/h[1-6]>/gi, '')
}

export function useBlogSingle(slug: Ref<string>) {
  return useFetch<BlogSingle>(
    () => `/api/blog/${encodeURIComponent(slug.value)}`,
    {
      key: () => `blog-single-${slug.value}`,
      watch: [slug],
      transform: (data) => ({ ...data, content: normalizeContent(data.content) }),
    }
  )
}