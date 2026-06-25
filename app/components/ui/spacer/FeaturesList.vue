// components/home/FeaturesList.vue
<script setup lang="ts">
import { CalendarDays, Headset, MapIcon, RefreshCcw, ShieldCheckIcon } from 'lucide-vue-next'
import type { Component } from 'vue'

interface Feature {
  icon: Component
  title: string
  desc: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'teal'
}

withDefaults(defineProps<{
  features?: Feature[]
}>(), {
  features: () => [
    {
      icon: CalendarDays,
      title: 'رزرو آنلاین',
      desc: 'هتل، استخر و تفریح — در چند ثانیه رزرو کنید',
      color: 'blue',
    },
    {
      icon: ShieldCheckIcon,
      title: 'پرداخت امن',
      desc: 'درگاه بانکی معتبر با رمزنگاری SSL',
      color: 'green',
    },
    {
      icon: Headset,
      title: 'پشتیبانی ۲۴ ساعته',
      desc: 'تیم پشتیبانی همیشه در دسترس شماست',
      color: 'purple',
    },
    {
      icon: RefreshCcw,
      title: 'بازگشت وجه',
      desc: 'لغو آسان و بازگشت وجه تضمینی',
      color: 'orange',
    },
    {
      icon: MapIcon,
      title: 'تجربه سفر کامل',
      desc: 'از اقامت تا تفریح، همه‌جا همراه شماییم',
      color: 'teal',
    },
  ],
})

const colorMap: Record<string, { bg: string, icon: string, ring: string }> = {
  blue:   { bg: 'bg-blue-500/10',   icon: 'text-blue-500',   ring: 'group-hover:ring-blue-500/30' },
  green:  { bg: 'bg-emerald-500/10', icon: 'text-emerald-500', ring: 'group-hover:ring-emerald-500/30' },
  purple: { bg: 'bg-violet-500/10', icon: 'text-violet-500', ring: 'group-hover:ring-violet-500/30' },
  orange: { bg: 'bg-orange-500/10', icon: 'text-orange-500', ring: 'group-hover:ring-orange-500/30' },
  teal:   { bg: 'bg-teal-500/10',   icon: 'text-teal-500',   ring: 'group-hover:ring-teal-500/30' },
}
</script>

<template>
  <section class="py-4 bg-base-200">
    <div class="max-w-5xl mx-auto px-4">
      <div class="text-center mb-12">
        <p class="text-xs font-bold tracking-widest text-primary uppercase mb-2">چرا آسرو؟</p>
        <h2 class="text-2xl md:text-3xl font-black text-base-content">
          تجربه یکپارچه و هوشمند خدمات سفر
        </h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div
          v-for="(feat, i) in features"
          :key="feat.title"
          class="group relative bg-base-100 rounded-3xl p-6 flex flex-col gap-4
                 ring-1 ring-base-300
                 hover:ring-2 hover:shadow-xl hover:-translate-y-1
                 transition-all duration-300"
          :class="colorMap[feat.color]?.ring ?? 'group-hover:ring-primary/30'"
        >
          <span class="absolute top-4 inset-e-5 text-5xl font-black text-base-content/5 select-none tabular-nums leading-none">
            {{ String(i + 1).padStart(2, '0') }}
          </span>

          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            :class="colorMap[feat.color]?.bg ?? 'bg-primary/10'"
          >
            <component
              :is="feat.icon"
              class="size-7"
              :class="colorMap[feat.color]?.icon ?? 'text-primary'"
              :stroke-width="1.5"
            />
          </div>

          <div>
            <p class="font-bold text-base-content text-sm">{{ feat.title }}</p>
            <p class="text-xs text-base-content/50 mt-1 leading-relaxed">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>