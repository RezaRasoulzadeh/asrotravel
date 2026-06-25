// server/api/home.get.ts

export default defineEventHandler(async (event) => {
  const { apiBase } = useRuntimeConfig()
  return await $fetch(`${apiBase}/utilities/getMainPage`)
})