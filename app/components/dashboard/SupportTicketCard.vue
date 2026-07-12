<!-- app/components/dashboard/SupportTicketCard.vue -->
<script setup lang="ts">
import { Building2, Calendar, Droplet, MessageSquare } from 'lucide-vue-next'
import type { SupportTicketDto } from '~/types/support.types'
import { SUPPORT_STATUS_BADGE, SUPPORT_STATUS_LABELS } from '~/types/support.types'

const props = defineProps<{ ticket: SupportTicketDto }>()

const statusIcon = computed(() => {
  switch (props.ticket.status) {
    case 'user_res': return Building2
    case 'deactive': return Droplet
    default: return MessageSquare
  }
})

const statusLabel = computed(() => SUPPORT_STATUS_LABELS[props.ticket.status] ?? props.ticket.statusText)
const statusBadgeClass = computed(() => SUPPORT_STATUS_BADGE[props.ticket.status] ?? 'badge-ghost')

function formatDate(iso: string) {
  try {
    const date = new Date(iso)
    const { jy, jm, jd } = toJalali(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
    return `${jy.toLocaleString('fa-IR', { useGrouping: false })}/${jm.toLocaleString('fa-IR', { minimumIntegerDigits: 2 })}/${jd.toLocaleString('fa-IR', { minimumIntegerDigits: 2 })}`
  }
  catch {
    return '—'
  }
}
</script>

<template>
  <NuxtLink
    :to="`/dashboard/support/${ticket.id}`"
    class="block border border-base-300 rounded-2xl p-4 hover:shadow-md hover:border-primary/30 transition-all duration-150"
  >
    <div class="flex items-center justify-between gap-2 mb-2">
      <span class="flex items-center gap-2 font-medium truncate">
        <component :is="statusIcon" :size="18" class="text-primary shrink-0" />
        {{ ticket.subject }}
      </span>
      <span class="badge badge-sm" :class="statusBadgeClass">{{ statusLabel }}</span>
    </div>

    <p v-if="ticket.excerpt" class="text-sm text-base-content/60 mb-3 line-clamp-1">{{ ticket.excerpt }}</p>

    <div class="flex items-center justify-between text-xs text-base-content/50">
      <span class="flex items-center gap-1">
        <Calendar :size="14" />{{ formatDate(ticket.updatedAt) }}
      </span>
      <span class="badge badge-sm badge-outline">{{ ticket.departmentTitle }}</span>
    </div>
  </NuxtLink>
</template>
