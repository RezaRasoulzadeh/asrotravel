// server/utils/paymentErrors.ts

const SAMAN_STATE_MESSAGES: Record<string, string> = {
  CanceledByUser: 'پرداخت توسط شما لغو شد.',
}

const GATEWAY_STATE_MESSAGES: Record<string, Record<string, string>> = {
  saman: SAMAN_STATE_MESSAGES,
}

export function resolveGatewayErrorMessage(
  gateway: string,
  rawGatewayData: unknown,
  fallback: string,
): string {
  const state = (rawGatewayData as { State?: string } | undefined)?.State
  const mapped = state ? GATEWAY_STATE_MESSAGES[gateway]?.[state] : undefined

  return mapped ?? fallback.replace(/^Error:\s*/i, '')
}
