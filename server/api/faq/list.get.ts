// server/api/faq/list.get.ts

// TODO: mirrors the old (pre-rewrite) client's `$api.faq.getFaqList({ category })` call
// to `/faq/list`. The category → topic mapping isn't documented anywhere in this repo;
// the support page used `category: 1` for its "سوالات متداول" sidebar and that's the
// only confirmed value, so it's kept as the default here.

export interface FaqItemRaw {
  id?: number
  title: string
  description: string
  category?: number | string
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const category = query.category ?? 1

  return await safeApiFetch<FaqItemRaw[]>(
    '/faq/list',
    { query: { category } },
    [],
  )
})
