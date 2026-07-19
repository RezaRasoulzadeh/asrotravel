export default defineNuxtPlugin(() => {
  setTimeout(() => {
    const widgetId = '2z2aiU'

    if (document.querySelector(`[data-goftino="${widgetId}"]`)) return

    const script = document.createElement('script')
    const savedToken = localStorage.getItem(`goftino_${widgetId}`)

    script.async = true
    script.dataset.goftino = widgetId
    script.src = `https://www.goftino.com/widget/${widgetId}${
      savedToken ? `?o=${encodeURIComponent(savedToken)}` : ''
    }`

    document.head.appendChild(script)
  }, 3000)
})
