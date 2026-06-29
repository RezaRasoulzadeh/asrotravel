<!-- app/layouts/dashboard.vue -->
<script setup lang="ts">
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  Wallet,
  Heart,
  HeadphonesIcon,
  LogOut,
  Sun,
  Moon,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import logoLight from '~/assets/images/logo-light.svg'
import logoDark from '~/assets/images/logo-dark.svg'

interface NavItem {
  to: string
  icon: Component
  label: string
  labelShort: string
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'داشبورد', labelShort: 'خانه' },
  { to: '/dashboard/profile', icon: User, label: 'پروفایل', labelShort: 'پروفایل' },
  { to: '/dashboard/bookings', icon: CalendarCheck, label: 'رزروهای من', labelShort: 'رزروها' },
  { to: '/dashboard/my-wallet', icon: Wallet, label: 'کیف پول', labelShort: 'کیف پول' },
  { to: '/dashboard/my-favorites', icon: Heart, label: 'علاقه‌مندی‌ها', labelShort: 'علاقه‌ها' },
  { to: '/dashboard/support', icon: HeadphonesIcon, label: 'پشتیبانی', labelShort: 'پشتیبانی' },
]

const route = useRoute()
const { user, fullName, logout } = useAuth()

const theme = useCookie<'light' | 'dark'>('asro_theme', {
  default: () => 'light',
  maxAge: 60 * 60 * 24 * 365,
})

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

const logoSrc = computed(() => theme.value === 'dark' ? logoDark : logoLight)

async function handleLogout() {
  logout()
  await navigateTo('/login')
}

function isActive(to: string) {
  return route.path === to || (to !== '/dashboard' && route.path.startsWith(to))
}
</script>

<template>
  <div class="dashboard-root min-h-screen lg:h-screen bg-base-100 lg:pe-6 flex" dir="rtl">

    <aside class="hidden lg:flex flex-col w-56 xl:w-60 bg-base-100 shrink-0 h-screen sticky top-0 z-20">

      <div class="px-5 pt-12 pb-4">
        <NuxtLink to="/" class="flex items-center gap-2">
          <img :src="logoSrc" class="w-full px-8" alt="آسروتراول" />
        </NuxtLink>
      </div>

      <nav class="flex flex-col gap-1 px-3 flex-1 mt-2">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :aria-current="isActive(item.to) ? 'page' : undefined"
          class="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all duration-150 font-medium"
          :class="isActive(item.to)
            ? 'bg-primary text-primary-content shadow-sm'
            : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'"
        >
          <component :is="item.icon" :size="18" class="shrink-0" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="mx-3 mb-4 rounded-2xl bg-primary/10 p-4 text-center">
        <p class="text-xs text-base-content/50 mb-1">تخفیف ویژه</p>
        <p class="text-2xl font-bold text-primary">۲۰٪</p>
        <p class="text-xs text-base-content/50 mt-1 leading-relaxed">در رزروهای این هفته از تخفیف بهره‌مند شوید</p>
        <NuxtLink to="/pool" class="btn btn-primary btn-sm w-full mt-3 rounded-xl">مشاهده</NuxtLink>
      </div>

      <div class="px-3 pb-5 border-t border-base-200 pt-3">
        <button
          class="flex items-center gap-3 w-full rounded-2xl px-4 py-3 text-sm font-medium text-base-content/50 hover:bg-error/10 hover:text-error transition-colors duration-150"
          @click="handleLogout"
        >
          <LogOut :size="18" />
          خروج از حساب
        </button>
      </div>
    </aside>

    <main
      class="flex-1 overflow-y-auto bg-base-200 rounded-[3rem] mx-4 my-8 pb-20 lg:pb-0 min-w-0" >
      <slot />
    </main>

    <aside class="hidden xl:flex flex-col w-64 2xl:w-72 bg-base-100 shrink-0 h-screen sticky top-0 px-4 py-12 gap-6 overflow-y-auto z-20">

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="avatar placeholder">
            <div class="flex justify-center items-center bg-primary text-primary-content text-center rounded-full w-10 font-bold">
              <img v-if="user?.ImageUrl" :src="user.ImageUrl" :alt="fullName" loading="lazy" class="rounded-full" />
              <span class="pt-0.5" v-else>{{ fullName.charAt(0) }}</span>
            </div>
          </div>
          <div class="leading-tight">
            <p class="text-sm font-semibold">{{ fullName }}</p>
            <p class="text-xs text-base-content/40">گردشگر</p>
          </div>
        </div>
        <button class="btn btn-ghost btn-square" aria-label="تغییر پوسته" @click="toggleTheme">
          <Sun v-if="theme === 'dark'" :size="22" />
          <Moon v-else :size="22" />
        </button>
      </div>

      <DashboardMiniCalendar />

      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between mb-1">
          <p class="text-sm font-semibold">رزروهای پیش رو</p>
        </div>

        <div class="flex flex-col items-center justify-center py-6 gap-2 text-center">
          <div class="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center">
            <CalendarCheck :size="18" class="text-base-content/30" />
          </div>
          <p class="text-xs text-base-content/40">رزروی برای نمایش وجود ندارد</p>
        </div>
      </div>

    </aside>

    <nav class="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-base-100 border-t border-base-300 flex items-stretch safe-area-pb">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :aria-current="isActive(item.to) ? 'page' : undefined"
        class="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] transition-colors duration-150"
        :class="isActive(item.to) ? 'text-primary' : 'text-base-content/50'"
      >
        <component :is="item.icon" :size="22" :stroke-width="isActive(item.to) ? 2.2 : 1.8" />
        <span>{{ item.labelShort }}</span>
      </NuxtLink>
    </nav>

  </div>
</template>

<style scoped>
.safe-area-pb {
  padding-bottom: env(safe-area-inset-bottom, 0);
  height: calc(4rem + env(safe-area-inset-bottom, 0));
}
</style>