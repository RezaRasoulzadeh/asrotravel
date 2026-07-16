// app/composables/useResultHeaderScroll.ts
export function useResultHeaderScroll(threshold = 80) {
  const resultHeaderVisible = ref(true)

  function handleWindowScroll() {
    resultHeaderVisible.value = window.scrollY < threshold
  }

  onMounted(() => {
    handleWindowScroll()
    window.addEventListener('scroll', handleWindowScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleWindowScroll)
  })

  return { resultHeaderVisible }
}
