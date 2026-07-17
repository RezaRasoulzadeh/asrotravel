// app/composables/useQrCode.ts
import QRCode from 'qrcode'

export function useQrCode(value: MaybeRefOrGetter<string | number | null | undefined>, options: QRCode.QRCodeToDataURLOptions = {}) {
  const qrDataUrl = ref('')

  watch(() => toValue(value), async (val) => {
    if (!import.meta.client || !val) {
      qrDataUrl.value = ''
      return
    }
    qrDataUrl.value = await QRCode.toDataURL(String(val), { margin: 1, width: 160, ...options })
  }, { immediate: true })

  return { qrDataUrl }
}