// server/api/auth/send-otp.post.ts

export default defineEventHandler(async (event) => {
  const { apiBase } = useRuntimeConfig()
  const body = await readBody(event)

  return await $fetch(`${apiBase}/auth/register`, {
    method: 'POST',
    body
  })
})