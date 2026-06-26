// server/api/blog/side.get.ts

export default defineEventHandler(async () => {
  const { apiBase } = useRuntimeConfig()

  return await $fetch(`${apiBase}/blog/get-side`)
})