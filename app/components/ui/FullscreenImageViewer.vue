// components/hotel/FullscreenImageViewer.vue
<script setup lang="ts">
import { X, ChevronRight, ChevronLeft, ZoomIn, ZoomOut, RotateCcw } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  images: string[]
  initialIndex: number
}>()

const emit = defineEmits(['close'])

const currentIndex = ref(props.initialIndex)
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)

const startX = ref(0)
const startY = ref(0)

watch(() => props.initialIndex, (newIdx) => {
  currentIndex.value = newIdx
  resetTransform()
})

const resetTransform = () => {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

const nextImage = () => {
  if (props.images.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % props.images.length
  resetTransform()
}

const prevImage = () => {
  if (props.images.length === 0) return
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
  resetTransform()
}

const zoomIn = () => { scale.value = Math.min(scale.value + 0.25, 4) }
const zoomOut = () => { scale.value = Math.max(scale.value - 0.25, 0.5) }

const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  if (e.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut() 
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.isOpen) return
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowLeft') nextImage()
  if (e.key === 'ArrowRight') prevImage()
}

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))

const startPan = (e: MouseEvent) => {
  if (scale.value <= 1) return
  isDragging.value = true
  startX.value = e.clientX - translateX.value
  startY.value = e.clientY - translateY.value
}

const pan = (e: MouseEvent) => {
  if (!isDragging.value) return
  translateX.value = e.clientX - startX.value
  translateY.value = e.clientY - startY.value
}

const stopPan = () => { isDragging.value = false }
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="isOpen" 
          class="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 select-none touch-none cursor-pointer"
          @click="emit('close')"
          @mousemove="pan"
          @mouseup="stopPan"
          @mouseleave="stopPan"
        >
          <div class="w-full flex items-center justify-between text-white max-w-7xl mx-auto z-10 cursor-default" @click.stop>
            <button @click="emit('close')" class="p-2 bg-white/10 hover:bg-error/30 hover:text-error rounded-xl transition-all border border-white/10 cursor-pointer">
              <X class="size-5" />
            </button>
            
            <div class="flex items-center gap-4 bg-white/10 p-1.5 rounded-2xl border border-white/10">
              <button @click="zoomIn" class="p-2 hover:bg-white/10 rounded-xl transition cursor-pointer" title="بزرگنمایی"><ZoomIn class="size-5" /></button>
              <button @click="zoomOut" class="p-2 hover:bg-white/10 rounded-xl transition cursor-pointer" title="کوچکنمایی"><ZoomOut class="size-5" /></button>
              <button @click="resetTransform" class="p-2 hover:bg-white/10 rounded-xl transition cursor-pointer" title="بازنشانی اندازه"><RotateCcw class="size-4" /></button>
            </div>

            <span class="text-sm font-medium tracking-wider bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">{{ currentIndex + 1 }} / {{ images.length }}</span>
          </div>

          <div class="relative w-full flex-1 flex items-center justify-center overflow-hidden my-4 cursor-pointer">
            <button @click.stop="prevImage" class="absolute right-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 shadow-lg transition-all z-20 cursor-pointer"><ChevronRight class="size-6" /></button>
            <button @click.stop="nextImage" class="absolute left-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 shadow-lg transition-all z-20 cursor-pointer"><ChevronLeft class="size-6" /></button>

            <div 
              class="max-w-5xl max-h-[75vh] transition-transform duration-150 ease-out flex items-center justify-center"
              :style="{ transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`, cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }"
              @mousedown.stop="startPan"
              @wheel="handleWheel"
              @click.stop
            >
              <img 
                :src="images[currentIndex]" 
                class="max-w-full max-h-[75vh] object-contain rounded-xl pointer-events-none shadow-2xl"
                alt="Fullscreen view" 
              />
            </div>
          </div>

          <div class="w-full overflow-x-auto py-4 max-w-4xl mx-auto scrollbar-none shrink-0 z-10 cursor-default" @click.stop>
            <div class="flex items-center justify-center gap-3 px-4">
              <button 
                v-for="(imgUrl, idx) in images" 
                :key="idx"
                @click="currentIndex = idx; resetTransform()"
                class="w-20 aspect-video rounded-xl overflow-hidden shrink-0 border transition-all duration-300 cursor-pointer"
                :class="currentIndex === idx ? 'border-primary ring-4 ring-primary/40 scale-95 opacity-100' : 'border-white/10 opacity-40 hover:opacity-100'"
              >
                <img :src="imgUrl" class="w-full h-full object-cover pointer-events-none" />
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
</style>