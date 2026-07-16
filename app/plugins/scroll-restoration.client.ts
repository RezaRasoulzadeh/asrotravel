// app/plugins/scroll-restoration.client.ts
export default defineNuxtPlugin(() => {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'
  }
})
