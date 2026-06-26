// pages/about
<template>
  <main class="bg-base-100 text-base-content antialiased">

    <section class="relative flex items-center justify-center overflow-hidden py-32 text-center">
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="blob blob-1" />
        <div class="blob blob-2" />
      </div>
      <div class="pointer-events-none absolute inset-0 opacity-[0.03]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0L0 0 0 48" fill="none" stroke="currentColor" stroke-width="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)" class="text-base-content" />
        </svg>
      </div>

      <div class="relative z-10 max-w-2xl px-6">
        <div
          class="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
          <Compass :size="14" class="text-primary" />
          <span class="text-sm font-semibold text-primary">درباره ما</span>
        </div>
        <h1 class="mb-4 text-3xl font-bold md:text-4xl 2xl:text-5xl">
          داستان <span class="text-primary">آسرو</span>
        </h1>
        <p class="text-base text-base-content/60">
          روایتی از اصالت دامنه‌های سبلان تا کرانه‌های بی‌کران ایران
        </p>
      </div>

      <div class="absolute bottom-0 left-0 right-0 w-full overflow-hidden line-height-0">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" class="h-12 w-full">
          <path d="M0,48 C480,0 960,0 1440,48 L1440,48 L0,48 Z" class="fill-base-200" />
        </svg>
      </div>
    </section>

    <section class="bg-base-200 py-20 relative overflow-hidden">
      <div class="pointer-events-none absolute inset-0 opacity-[0.02]">
        <div class="w-full h-full bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[16px_16px]"></div>
      </div>
      <div class="max-w-360 2xl:max-w-400 mx-auto px-6 md:px-12 text-center relative z-10">
        <span class="text-xs font-bold uppercase tracking-widest text-primary/80 mb-5 block">چشم‌انداز و ماموریت
          ما</span>
        <blockquote
          class="text-xl md:text-2xl font-semibold text-base-content leading-relaxed max-w-4xl mx-auto italic">
          «مأموریت ما ایجاد ارتباطی عمیق میان مسافران و طبیعت بکر ایران است؛ جایی که دامنه‌های سبلان و چشمه‌های سرعین به
          عنوان نماد تندرستی و اکوتوریسم، ویترین خدمات اصیل ما قرار می‌گیرند.»
        </blockquote>
      </div>
    </section>

    <section class="bg-base-100 py-16 border-y border-base-content/5">
      <div class="max-w-360 2xl:max-w-400 mx-auto px-6 md:px-12">
        <div class="flex flex-wrap justify-center gap-12 max-w-5xl mx-auto">
          <div v-for="s in stats" :key="s.label" class="stat-card flex flex-col items-center text-center">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
              <component :is="s.icon" :size="22" />
            </div>
            <span class="text-2xl md:text-3xl font-extrabold text-base-content" dir="ltr">
              {{ s.prefix }}{{ s.format(s.target) }}{{ s.suffix }}
            </span>
            <span class="text-xs font-medium text-base-content/60 mt-1">{{ s.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-base-200 py-20">
      <div class="max-w-360 2xl:max-w-400 mx-auto px-6 md:px-12 text-center">
        <h2 class="text-2xl md:text-3xl 2xl:text-4xl font-bold text-base-content leading-tight mb-8">
          کشف کرانه‌های ایران
        </h2>
        <div
          class="space-y-5 text-base-content/70 text-sm md:text-base leading-relaxed max-w-3xl mx-auto text-justify md:text-center">
          <p>
            آسروتراول با هدفی بزرگ آغاز به کار کرد: اتصال مسافران به بکرترین نقاط ایران، از کویرهای لوت تا سواحل خلیج
            فارس. اما قلب تپنده و خاستگاه اصلی ما، خاک زرخیز استان اردبیل و دامنه‌های سبلان است.
          </p>
          <p>
            ما در سراسر کشور مسیرهای منحصربه‌فردی خلق کرده‌ایم، اما تمرکز ویژه‌ای بر جادوی شمال‌غرب داریم. از پیاده‌روی
            در اسالم به خلخال تا تجربه آرامش بی‌نظیر چشمه‌های آبگرم سرعین و صعود به قله‌های مه‌آلود ساوالان، اردبیل
            ویترین تخصص اکوتوریسم ماست.
          </p>
        </div>
      </div>
    </section>

    <section class="bg-base-100 py-20">
      <div class="max-w-360 2xl:max-w-400 mx-auto px-6 md:px-12">
        <div class="text-center mb-16">
          <h2 class="text-2xl md:text-3xl font-bold mb-3">ارزش‌های بنیادین ما</h2>
          <p class="text-base-content/60 max-w-md mx-auto text-xs md:text-sm">اصولی که در تمام لایه‌های اجرایی و طراحی
            تورهای خود به آن‌ها وفاداریم.</p>
        </div>

        <div class="flex flex-wrap justify-center gap-x-12 gap-y-12 max-w-5xl mx-auto">
          <div v-for="v in values" :key="v.title"
            class="value-card group flex flex-col items-center text-center transition-all duration-200">
            <div
              :class="['w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md', v.bgClass]">
              <component :is="v.icon" :size="22" :class="v.iconClass" />
            </div>
            <h3 class="text-lg font-bold mb-2 group-hover:text-primary transition-colors duration-200">{{ v.title }}
            </h3>
            <p class="text-xs md:text-sm text-base-content/60 leading-relaxed max-w-xs">{{ v.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-base-200 py-20">
      <div class="max-w-360 2xl:max-w-400 mx-auto px-6 md:px-12">
        <div class="text-center mb-16">
          <h2 class="text-2xl md:text-3xl font-bold mb-3">مسیر رشد ما</h2>
          <p class="text-base-content/60 text-xs md:text-sm">چگونه گام‌به‌گام در پهنه گردشگری کشور ریشه دواندیم.</p>
        </div>

        <div class="max-w-2xl mx-auto flex flex-col items-center">

          <template v-for="(t, index) in timeline" :key="t.year">

            <div class="flex flex-col items-center text-center max-w-xl">
              <div
                class="bg-base-200 text-primary w-8 h-8 rounded-full flex items-center justify-center border border-primary ring-4 ring-base-200 mb-4 shadow-sm">
                <component :is="t.icon" :size="14" />
              </div>

              <span
                class="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded">
                {{ t.year }}
              </span>

              <h3 class="text-lg font-bold mt-3 mb-2">{{ t.title }}</h3>
              <p class="text-xs md:text-sm text-base-content/60 leading-relaxed text-center max-w-md">
                {{ t.desc }}
              </p>
            </div>

            <div v-if="index !== timeline.length - 1" class="w-px h-12 bg-base-content/15 my-5" />

          </template>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import {
  Compass, Users, Map, Award, Globe,
  Leaf, Shield, Star
} from 'lucide-vue-next'

useSeoMeta({
  title: 'درباره آسرو | داستان ما',
  description: 'آشنایی با آسروتراول؛ از آغاز در دامنه‌های سبلان تا پوشش ۲۵۰ مسیر گردشگری در سراسر ایران.'
})

const stats = ref([
  { icon: Users, prefix: '+', suffix: '', label: 'مسافر راضی', target: 120000, format: (n: number) => n >= 1000 ? (n / 1000).toFixed(0) + 'K' : n },
  { icon: Map, prefix: '', suffix: '+', label: 'مسیر و تور', target: 250, format: (n: number) => n },
  { icon: Compass, prefix: '', suffix: '', label: 'استان پوشش‌داده‌شده', target: 31, format: (n: number) => n },
  { icon: Award, prefix: '', suffix: '+', label: 'راهنمای حرفه‌ای', target: 400, format: (n: number) => n },
])

const values = [
  {
    icon: Leaf,
    title: 'طبیعت‌دوستی پایدار',
    desc: 'تمام تورهای ما با رعایت اصول زیست‌محیطی طراحی شده‌اند؛ از صعودهای مسئولانه به سبلان تا پاسداشت بوم‌سازگان‌های سراسر کشور.',
    bgClass: 'bg-success/10 group-hover:bg-success/20',
    iconClass: 'text-success',
  },
  {
    icon: Shield,
    title: 'ایمنی بی‌قید و شرط',
    desc: 'آسایش خاطر شما اولویت اصلی ماست. تمام لیدرهای ما دارای گواهی‌نامه امداد کوهستان و بقا بوده و مجهز به کیت‌های استاندارد هستند.',
    bgClass: 'bg-info/10 group-hover:bg-info/20',
    iconClass: 'text-info',
  },
  {
    icon: Star,
    title: 'کیفیت و گردشگری تندرستی',
    desc: 'ما بهترین هتل‌ها و مجتمع‌های مدرن آبدرمانی سرعین و اقامتگاه‌های کیفی ایران را برمی‌گزینیم تا آرامش و تندرستی را همزمان تجربه کنید.',
    bgClass: 'bg-warning/10 group-hover:bg-warning/20',
    iconClass: 'text-warning',
  },
  {
    icon: Users,
    title: 'حمایت از جامعه محلی',
    desc: 'همکاری گسترده با عشایر شاهسون، بلدهای بومی و تامین‌کنندگان محلی در سراسر کشور جهت ایجاد درآمد پایدار و توزیع عادلانه ثروت.',
    bgClass: 'bg-secondary/10 group-hover:bg-secondary/20',
    iconClass: 'text-secondary',
  },
  {
    icon: Map,
    title: 'کشف مسیرهای بکر ایران',
    desc: 'از کویرهای مرکزی تا روستاهای هدف گردشگری اردبیل؛ ما به دنبال طراحی مسیرهای اختصاصی هستیم که کمتر کسی آن‌ها را تجربه کرده است.',
    bgClass: 'bg-accent/10 group-hover:bg-accent/20',
    iconClass: 'text-accent',
  }
]

const timeline = [
  {
    year: '۱۳۹۵',
    icon: Compass,
    title: 'آغاز از دامنه‌های سبلان',
    desc: 'راه‌اندازی اولین تورهای تخصصی کوهستان در اردبیل و کشف مسیرهای بکر شمال‌غرب.',
  },
  {
    year: '۱۳۹۷',
    icon: Users,
    title: 'توسعه به سراسر ایران',
    desc: 'جذب راهنمایان محلی و گسترش مسیرهای گردشگری به کویرها، جنگل‌ها و سواحل کشور.',
  },
  {
    year: '۱۴۰۰',
    icon: Award,
    title: 'قطب گردشگری سلامت سرعین',
    desc: 'انتخاب به عنوان کارگزار برتر تورهای آبدرمانی ترکیبی ایران با محوریت پایتخت چشمه‌های معدنی.',
  },
  {
    year: '۱۴۰۳',
    icon: Globe,
    title: 'امروز: ۲۵۰ مسیر ملی',
    desc: 'پوشش کامل جاذبه‌های ایران با تمرکز ویژه و خدمات وی آی پی در استان اردبیل و سرعین.',
  },
]
</script>

<style scoped>
/* Precision Layout via Calc Widths */
.stat-card {
  width: 100%;
}

.value-card {
  width: 100%;
}

@media (min-width: 640px) {
  .stat-card {
    width: calc(50% - 24px);
  }
}

@media (min-width: 768px) {
  .value-card {
    width: calc(50% - 24px);
  }
}

@media (min-width: 1024px) {
  .stat-card {
    width: calc(25% - 36px);
  }

  .value-card {
    width: calc(33.333% - 32px);
  }
}

/* Background Animations */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.25;
}

.blob-1 {
  width: 500px;
  height: 500px;
  top: -150px;
  right: -80px;
  background: oklch(from var(--color-primary) l c h / 0.15);
  animation: drift1 14s ease-in-out infinite;
}

.blob-2 {
  width: 380px;
  height: 380px;
  bottom: -60px;
  left: -60px;
  background: oklch(from var(--color-secondary) l c h / 0.12);
  animation: drift2 18s ease-in-out infinite;
}

@keyframes drift1 {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  50% {
    transform: translate(-20px, 20px) scale(1.04);
  }
}

@keyframes drift2 {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  50% {
    transform: translate(30px, -20px) scale(1.05);
  }
}
</style>