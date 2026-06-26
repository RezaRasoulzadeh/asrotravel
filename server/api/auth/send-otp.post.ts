// server/api/auth/send-otp.post.ts

export default defineEventHandler(async (event) => {
  const body = await safeReadBody(event)

  return await safeApiFetch('/auth/register', {
    method: 'POST',
    body
  }, { status: 500, message: 'خطا در اتصال به سرور' })
})
