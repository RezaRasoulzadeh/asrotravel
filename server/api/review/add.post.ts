// server/api/review/add.post.ts

export default defineEventHandler(async (event) => {
  const { apiBase } = useRuntimeConfig()
  const body = await readBody(event)
  const authorization = getRequestHeader(event, 'authorization')

  return await $fetch(`${apiBase}/review/add`, {
    method: 'POST',
    headers: authorization ? { authorization } : {},
    body,
  })
})