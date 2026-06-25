// components/home/HowItWorks.vue
<script setup lang="ts">
import { Search, LayoutList, CreditCard } from 'lucide-vue-next'
import type { Component } from 'vue'

interface Step {
  number: string
  title: string
  desc: string
  icon: Component
}

withDefaults(defineProps<{
  steps?: Step[]
}>(), {
  steps: () => [
    {
      number: '۱',
      title: 'جستجو',
      desc: 'مقصد، اقامتگاه، استخر، آبدرمانی یا تفریح دلخواهتان را پیدا کنید.',
      icon: Search,
    },
    {
      number: '۲',
      title: 'انتخاب هوشمندانه',
      desc: 'قیمت‌ها، خدمات و تجربه‌های مسافران قبلی را مقایسه کنید.',
      icon: LayoutList,
    },
    {
      number: '۳',
      title: 'همسفری با آسرو',
      desc: 'با پرداخت امن، بلیت یا تأییدیه قطعی‌تان را فوری تحویل بگیرید.',
      icon: CreditCard,
    },
  ],
})
</script>

<template>
  <section class="py-4 relative overflow-hidden">
    <div class="absolute inset-0 bg-base-100" />
    <div class="absolute inset-0 opacity-[0.03]"
         style="background-image: repeating-linear-gradient(
           0deg, currentColor, currentColor 1px, transparent 1px, transparent 40px
         ), repeating-linear-gradient(
           90deg, currentColor, currentColor 1px, transparent 1px, transparent 40px
         );" />

    <div class="relative max-w-4xl mx-auto px-4">
      <div class="text-center mb-16">
        <p class="text-xs font-bold tracking-widest text-primary uppercase mb-2">همراه شما در تمام مسیر</p>
        <h2 class="text-2xl md:text-3xl font-black text-base-content">برنامه‌ریزی یک سفر دوست‌داشتنی</h2>
      </div>

      <div class="flex flex-col md:flex-row gap-0">
        <div
          v-for="(step, i) in steps"
          :key="step.number"
          class="flex-1 flex flex-col md:items-center relative"
        >
          <div v-if="i < steps.length - 1"
               class="hidden md:block absolute top-10 inset-s-1/2 w-full h-px z-0">
            <div class="h-px w-full border-t-2 border-dashed border-primary/20" />
          </div>
          <div v-if="i < steps.length - 1"
               class="md:hidden absolute top-20 inset-s-10 bottom-0 w-px z-0">
            <div class="w-px h-full border-s-2 border-dashed border-primary/20" />
          </div>

          <div class="relative z-10 flex md:flex-col items-start md:items-center gap-5 md:gap-4
                      text-start md:text-center pb-12 md:pb-0 md:px-6 group">
            <div class="relative shrink-0">
              <div class="w-20 h-20 rounded-full bg-base-200 ring-4 ring-base-100
                          flex items-center justify-center
                          group-hover:bg-primary group-hover:ring-primary/20
                          transition-all duration-300 shadow-md">
                <component
                  :is="step.icon"
                  class="w-7 h-7 text-primary group-hover:text-white transition-colors duration-300"
                  :stroke-width="1.8"
                />
              </div>
              <div class="absolute -top-1 -inset-e-1 w-6 h-6 rounded-full bg-primary
                          flex items-center justify-center text-white text-xs font-black shadow">
                {{ step.number }}
              </div>
            </div>

            <div class="pt-1 md:pt-0">
              <p class="font-black text-base-content text-base md:text-sm">{{ step.title }}</p>
              <p class="text-sm md:text-xs text-base-content/50 mt-1 leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>