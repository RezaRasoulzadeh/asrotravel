// server/api/blog/side.get.ts

export default defineEventHandler(async () => {
  return await safeApiFetch('/blog/get-side', {}, {})
})
