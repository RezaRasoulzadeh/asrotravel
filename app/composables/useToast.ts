// app/composables/useToast.ts

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  type: ToastType
  message: string
}

export function useToast() {
  const toasts = useState<ToastItem[]>('toasts', () => [])

  function push(type: ToastType, message: string, duration = 4000) {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, type, message })

    if (import.meta.client) {
      setTimeout(() => dismiss(id), duration)
    }
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function clear() {
    toasts.value = []
  }

  return {
    toasts,
    success: (msg: string) => push('success', msg),
    error: (msg: string) => push('error', msg),
    info: (msg: string) => push('info', msg),
    dismiss,
    clear,
  }
}