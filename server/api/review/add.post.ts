// server/api/review/add.post.ts

export default defineEventHandler(async (event) => {
  const body = await safeReadBody(event)
  const authorization = getRequestHeader(event, 'authorization')

  return await safeApiFetch('/review/add', {
    method: 'POST',
    headers: authorization ? { authorization } : {},
    body,
  }, { status: 500, message: 'خطا در ثبت نظر' })
})
