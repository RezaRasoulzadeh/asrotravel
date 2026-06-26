// server/api/home.get.ts

export default defineEventHandler(async (event) => {
  return await safeApiFetch('/utilities/getMainPage', {}, null)
})
