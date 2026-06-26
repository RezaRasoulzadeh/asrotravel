// pages/contact
<template>
  <main class="bg-base-100 text-base-content antialiased">

    <!-- ── Hero ───────────────────────────────────────────────────── -->
    <section class="relative flex items-center justify-center overflow-hidden py-32 text-center">
      <!-- Blobs -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="blob blob-1" />
        <div class="blob blob-2" />
      </div>
      <!-- Grid -->
      <div class="pointer-events-none absolute inset-0 opacity-[0.03]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0L0 0 0 48" fill="none" stroke="currentColor" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)" class="text-base-content"/>
        </svg>
      </div>

      <div class="relative z-10 max-w-2xl px-6">
        <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
          <MessageCircle :size="14" class="text-primary" />
          <span class="text-sm font-semibold text-primary">در تماس باشید</span>
        </div>
        <h1 class="mb-4 text-3xl font-bold md:text-4xl 2xl:text-5xl">
          تماس با <span class="text-primary">آسرو</span>
        </h1>
        <p class="text-base text-base-content/60">
          هر سوالی دارید، آماده پاسخگویی هستیم
        </p>
      </div>

      <!-- Wave -->
      <div class="absolute bottom-0 left-0 right-0 w-full overflow-hidden line-height-0">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" class="h-12 w-full">
          <path d="M0,48 C480,0 960,0 1440,48 L1440,48 L0,48 Z" class="fill-base-200"/>
        </svg>
      </div>
    </section>

    <!-- ── Contact Section ────────────────────────────────────────── -->
    <section class="bg-base-200 py-24">
      <div class="max-w-4xl mx-auto px-4 flex flex-col items-center">
        
        <!-- Cards Grid (No background, hover effects on icons only) -->
        <div class="grid grid-cols-1 gap-12 sm:grid-cols-3 w-full mb-16 text-center">
          <a
            v-for="c in cards"
            :key="c.label"
            :href="c.href"
            target="_blank"
            class="group flex flex-col items-center gap-4 focus:outline-none"
          >
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-base-100 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md group-hover:text-primary">
              <component :is="c.icon" :size="24" class="transition-colors duration-200" />
            </div>
            <div>
              <p class="text-xs font-medium uppercase tracking-widest text-base-content/40">{{ c.label }}</p>
              <p class="mt-1.5 font-bold text-base-content text-lg transition-colors duration-200 group-hover:text-primary" dir="ltr">
                {{ c.value }}
              </p>
              <p class="mt-0.5 text-sm text-base-content/50">{{ c.sub }}</p>
            </div>
          </a>
        </div>

        <!-- Social Icons or Trust Badges Holder -->
        <div class="flex gap-2 mt-2">
          <a href="https://instagram.com/asroofficial" target="_blank"
            class="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-primary transition-colors"
            aria-label="اینستاگرام">
            <Instagram class="size-5" />
          </a>
          <a href="https://t.me/asroofficial" target="_blank"
            class="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-primary transition-colors"
            aria-label="تلگرام">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </a>
        </div>

      </div>
    </section>

  </main>
  <HowItWorks />
  <TestimonialQuote/>
</template>

<script setup lang="ts">
import { MessageCircle, Phone, Mail, MapPin, Instagram } from 'lucide-vue-next'

const cards = [
  { 
    icon: Phone,  
    label: 'تلفن تماس', 
    value: '۰۹۳۰-۷۸۵۸۷۲۴', 
    sub: 'پشتیبانی تلفنی از ۹ صبح تا ۹ شب', 
    href: 'tel:+989307858724'
  },
  { 
    icon: Mail,   
    label: 'پست الکترونیک', 
    value: 'info@asrotravel.com', 
    sub: 'پاسخگویی سریع مکاتبات', 
    href: 'mailto:info@asrotravel.com'
  },
  { 
    icon: MapPin, 
    label: 'دفتر مرکزی', 
    value:  'پارک علم و فناوری استان اردبیل', 
    sub: 'اردبیل، میدان شهید باکری', 
    href: 'https://maps.app.goo.gl/sUHo4gDS1kScAU6f9'
  }
]
</script>

<style scoped>
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.25;
}
.blob-1 {
  width: 500px; height: 500px;
  top: -150px; right: -80px;
  background: oklch(from var(--color-primary) l c h / 0.15);
  animation: drift1 14s ease-in-out infinite;
}
.blob-2 {
  width: 380px; height: 380px;
  bottom: -60px; left: -60px;
  background: oklch(from var(--color-secondary) l c h / 0.12);
  animation: drift2 18s ease-in-out infinite;
}
@keyframes drift1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(-20px, 20px) scale(1.04); }
}
@keyframes drift2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(30px, -20px) scale(1.05); }
}
</style>