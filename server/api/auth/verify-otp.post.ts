// server/api/auth/verify-otp.post.ts

export default defineEventHandler(async (event) => {
  const { apiBase } = useRuntimeConfig()
  const body = await readBody(event)

  return await $fetch(`${apiBase}/auth/confirm-code`, {
    method: 'POST',
    body
  })
})