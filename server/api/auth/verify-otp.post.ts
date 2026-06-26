// server/api/auth/verify-otp.post.ts

export default defineEventHandler(async (event) => {
  const body = await safeReadBody(event)

  return await safeApiFetch('/auth/confirm-code', {
    method: 'POST',
    body
  }, { message: 'خطا در اتصال به سرور' })
})
