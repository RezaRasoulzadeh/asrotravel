<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({ adults: 1, kids: 0 }) },
  minAdults: { type: Number, default: 1 },
  minKids: { type: Number, default: 0 },
  maxAdults: { type: Number, default: 100 },
  maxKids: { type: Number, default: 100 },
  adultLabel: { type: String, default: 'بزرگسال' },
  kidLabel: { type: String, default: 'خردسال' },
  kidExplanation: { type: String, default: 'تا ۱۲ سال' },
  adultExplanation: { type: String, default: '۱۲ سال به بالا' },
  placeholder: { type: String, default: 'انتخاب مهمان' },
  confirmLabel: { type: String, default: 'تایید' },
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const trigger = ref(null)
const popover = ref(null)
const popStyle = ref({})

const adults = ref(props.modelValue.adults)
const kids = ref(props.modelValue.kids)

const summary = computed(() => {
  const parts = []
  if (adults.value) parts.push(`${adults.value} ${props.adultLabel}`)
  if (kids.value) parts.push(`${kids.value} ${props.kidLabel}`)
  return parts.join(' · ') || props.placeholder
})

function computePos() {
  if (!trigger.value) return
  const r = trigger.value.getBoundingClientRect()
  const popH = 240
  const spaceBelow = window.innerHeight - r.bottom
  const top = spaceBelow >= popH || spaceBelow >= r.top ? r.bottom + window.scrollY + 6 : r.top + window.scrollY - popH - 6
  
  popStyle.value = { 
    position: 'absolute', 
    top: top + 'px', 
    left: (r.left + window.scrollX) + 'px', 
    width: r.width + 'px',
    zIndex: 99999 
  }
}

async function openPicker() {
  adults.value = props.modelValue.adults
  kids.value = props.modelValue.kids
  open.value = true
  
  await nextTick()
  computePos()
  
  window.addEventListener('scroll', computePos, true)
  window.addEventListener('resize', computePos)
}

function closePicker() {
  open.value = false
  window.removeEventListener('scroll', computePos, true)
  window.removeEventListener('resize', computePos)
}

function change(type, delta) {
  if (type === 'adults')
    adults.value = Math.min(props.maxAdults, Math.max(props.minAdults, adults.value + delta))
  else
    kids.value = Math.min(props.maxKids, Math.max(props.minKids, kids.value + delta))
}

function confirm() {
  emit('update:modelValue', { adults: adults.value, kids: kids.value })
  closePicker()
}

function onOutsideClick(e) {
  if (
    open.value &&
    !trigger.value?.contains(e.target) &&
    !popover.value?.contains(e.target)
  ) {
    adults.value = props.modelValue.adults
    kids.value = props.modelValue.kids
    closePicker()
  }
}

onMounted(() => document.addEventListener('mousedown', onOutsideClick))

onUnmounted(() => {
  document.removeEventListener('mousedown', onOutsideClick)
  window.removeEventListener('scroll', computePos, true)
  window.removeEventListener('resize', computePos)
})
</script>

<template>
  <div>
    <button ref="trigger" type="button" class="input w-full text-right flex items-center" @click="open ? closePicker() : openPicker()">
      {{ summary }}
    </button>

    <ClientOnly>
      <Teleport to="body">
        <Transition name="picker">
          <div v-if="open" ref="popover" :style="popStyle" class="bg-base-100 border border-base-300 rounded-2xl shadow-lg p-3 min-w-48" dir="rtl">
            <div class="flex items-center justify-between py-1.5">
              <span class="text-sm">{{ adultLabel }}</span>
              <div class="flex items-center gap-2">
                <button type="button" class="btn btn-sm btn-square" :disabled="adults >= maxAdults" @click="change('adults', 1)">+</button>
                <span class="text-sm font-medium w-5 text-center tabular-nums">{{ adults }}</span>
                <button type="button" class="btn btn-sm btn-square" :disabled="adults <= minAdults" @click="change('adults', -1)">−</button>
              </div>
            </div>
            <p class="text-xs text-base-content/60">{{ adultExplanation }}</p>
            <div class="divider my-1" />

            <div class="flex items-center justify-between py-1.5">
              <span class="text-sm">{{ kidLabel }}</span>
              <div class="flex items-center gap-2">
                <button type="button" class="btn btn-sm btn-square" :disabled="kids >= maxKids" @click="change('kids', 1)">+</button>
                <span class="text-sm font-medium w-5 text-center tabular-nums">{{ kids }}</span>
                <button type="button" class="btn btn-sm btn-square" :disabled="kids <= minKids" @click="change('kids', -1)">−</button>
              </div>
            </div>
            <p class="text-xs text-base-content/60">{{ kidExplanation }}</p>

            <button type="button" class="btn btn-primary w-full mt-2" @click="confirm">{{ confirmLabel }}</button>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<style scoped>
.picker-enter-active,
.picker-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.picker-enter-from,
.picker-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>