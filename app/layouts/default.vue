// app/layouts/default.vue
<script setup lang="ts">
import { Instagram, MoonIcon, Sun, User2, LogOut, Menu } from 'lucide-vue-next'
import logoLight from '~/assets/images/logo-light.svg'
import logoDark from '~/assets/images/logo-dark.svg'

const route = useRoute()
const router = useRouter()

const theme = useCookie<'light' | 'dark'>('asro_theme', {
  default: () => 'light',
  maxAge: 60 * 60 * 24 * 365
})

useHead(() => ({
  htmlAttrs: { 'data-theme': theme.value }
}))

const { y } = useWindowScroll()
const scrolled = computed(() => y.value > 40)
const logoSrc = computed(() => theme.value === 'dark' ? logoDark : logoLight)

const { isAuthenticated, fullName, logout } = useAuth()

const isMobileMenuOpen = ref(false)
const mobileMenuRef = ref<HTMLElement | null>(null)
onClickOutside(mobileMenuRef, () => { isMobileMenuOpen.value = false })

const isMobileUserOpen = ref(false)
const mobileUserRef = ref<HTMLElement | null>(null)
onClickOutside(mobileUserRef, () => { isMobileUserOpen.value = false })

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

function handleLogout() {
  logout()
  isMobileUserOpen.value = false
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-linear-to-b from-base-100 to-base-200 flex flex-col">

    <header class="navbar fixed top-0 z-50 px-6 lg:px-16 transition-all duration-300"
      :class="scrolled ? 'bg-base-100/80 backdrop-blur-md shadow-xs' : 'bg-transparent'">
      <div class="navbar-start">
        <NuxtLink to="/">
          <img :src="logoSrc" alt="آسروتراول" class="h-9 transition-opacity duration-300" />
        </NuxtLink>
      </div>

      <nav class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal gap-1 text-base font-medium">
          <li>
            <NuxtLink to="/" class="rounded-lg transition-colors text-sm text-base-content/90 hover:text-base-content"
              active-class="text-primary font-semibold">صفحه اصلی</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/hotel"
              class="rounded-lg transition-colors text-sm text-base-content/90 hover:text-base-content"
              active-class="text-primary font-semibold">هتل و مراکز اقامتی</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/pool"
              class="rounded-lg transition-colors text-sm text-base-content/90 hover:text-base-content"
              active-class="text-primary font-semibold">استخر و آبدرمانی</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/ticket"
              class="rounded-lg transition-colors text-sm text-base-content/90 hover:text-base-content"
              active-class="text-primary font-semibold">مجموعه‌های تفریحی</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/place/travel-guide/ardebil"
              class="rounded-lg transition-colors text-sm text-base-content/90 hover:text-base-content"
              :class="{ 'text-primary font-semibold': route.path.startsWith('/place/travel-guide/') }">
              سفرنامه
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/blog"
              class="rounded-lg transition-colors text-sm text-base-content/90 hover:text-base-content"
              active-class="text-primary font-semibold">بلاگ</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/about"
              class="rounded-lg transition-colors text-sm text-base-content/90 hover:text-base-content"
              active-class="text-primary font-semibold">درباره ما</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/contact"
              class="rounded-lg transition-colors text-sm text-base-content/90 hover:text-base-content"
              active-class="text-primary font-semibold">تماس با ما</NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="navbar-end gap-1">

        <button class="btn btn-ghost btn-sm btn-circle transition-colors"
          :aria-label="theme === 'light' ? 'تغییر به حالت تاریک' : 'تغییر به حالت روشن'" @click="toggleTheme">
          <MoonIcon v-if="theme === 'light'" class="size-5" />
          <Sun v-else class="size-5" />
        </button>

        <div ref="mobileUserRef" class="relative lg:hidden">
          <template v-if="isAuthenticated">
            <button 
              class="btn btn-ghost btn-sm btn-circle transition-colors text-base-content"
              @click="isMobileUserOpen = !isMobileUserOpen"
            >
              <User2 class="size-5" />
            </button>
            <Transition name="menu-fade">
              <ul 
                v-if="isMobileUserOpen"
                class="absolute left-0 menu bg-base-100 rounded-2xl shadow-lg border border-base-300 w-48 mt-2 z-50 p-2 origin-top-left"
                @click="isMobileUserOpen = false"
              >
                <li class="menu-title px-4 py-2 border-b border-base-200 text-xs truncate max-w-full">
                  {{ fullName }}
                </li>
                <li>
                  <NuxtLink to="/dashboard">داشبورد</NuxtLink>
                </li>
                <li>
                  <button class="text-error flex gap-2 items-center" @click="handleLogout">
                    <LogOut class="size-4" /> خروج
                  </button>
                </li>
              </ul>
            </Transition>
          </template>
          <template v-else>
            <NuxtLink 
              :to="{ path: '/auth/login', query: { redirect: route.path } }" 
              class="btn btn-ghost btn-sm btn-circle transition-colors text-base-content"
            >
              <User2 class="size-5" />
            </NuxtLink>
          </template>
        </div>

        <template v-if="isAuthenticated">
          <div class="dropdown dropdown-end hidden lg:block">
            <button tabindex="0" class="btn btn-ghost btn-sm gap-2 transition-colors text-base-content">
              <User2 class="size-4" />
              <span class="max-w-24 truncate text-sm">{{ fullName }}</span>
            </button>
            <ul tabindex="0"
              class="dropdown-content menu bg-base-100 rounded-2xl shadow-lg border border-base-300 w-48 mt-2 z-50 p-2">
              <li>
                <NuxtLink to="/dashboard">داشبورد</NuxtLink>
              </li>
              <li>
                <button class="text-error flex gap-2 items-center" @click="handleLogout">
                  <LogOut class="size-4" /> خروج
                </button>
              </li>
            </ul>
          </div>
        </template>
        <template v-else>
          <NuxtLink :to="{ path: '/auth/login', query: { redirect: route.path } }"
            class="btn btn-sm btn-primary text-primary-content rounded-xl gap-2 mr-1 hidden lg:flex">
            <User2 class="size-4" />
            ورود / ثبت‌نام
          </NuxtLink>
        </template>

        <div ref="mobileMenuRef" class="relative lg:hidden">
          <button 
            class="btn btn-ghost btn-sm btn-circle transition-colors text-base-content"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          >
            <Menu class="size-5" />
          </button>
          
          <Transition name="menu-fade">
            <ul 
              v-if="isMobileMenuOpen"
              class="absolute left-0 menu bg-base-100 rounded-2xl shadow-lg border border-base-300 w-52 mt-2 z-50 p-2 origin-top-left"
              @click="isMobileMenuOpen = false"
            >
              <li>
                <NuxtLink to="/">صفحه اصلی</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/hotel">هتل و مراکز اقامتی</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/pool">استخر و آبدرمانی</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/ticket">مجموعه‌های تفریحی</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/place/travel-guide/ardebil">سفرنامه</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/blog">بلاگ</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/about">درباره ما</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/contact">تماس با ما</NuxtLink>
              </li>
            </ul>
          </Transition>
        </div>

      </div>
    </header>

    <main class="flex-1 mt-10">
      <slot />
    </main>

    <footer class="bg-base-200 border-t border-base-300 text-base-content mt-12 shrink-0">
      <div class="px-6 lg:px-16 py-12 max-w-480 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

        <div class="lg:col-span-2 flex flex-col gap-4">
          <img :src="logoSrc" alt="آسروتراول" class="h-14 self-start transition-opacity duration-300" />
          <p class="text-xs text-base-content/70 leading-relaxed max-w-sm text-justify">
            آسرو سامانه رزرواسیون آنلاین هتل، مراکز اقامتی، مجموعه‌های آبدرمانی و تفریحی است. ما تجربه سفری هوشمند،
            سریع و با بهترین قیمت را برای شما فراهم می‌کنیم.
          </p>
        </div>

        <div class="flex flex-col gap-3">
          <h4 class="font-bold text-sm text-base-content/90 border-r-2 border-primary pr-2 leading-none">دسترسی سریع</h4>
          <ul class="flex flex-col gap-2 text-xs text-base-content/60">
            <li>
              <NuxtLink to="/hotel" class="hover:text-primary transition-colors">هتل و مراکز اقامتی</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/pool" class="hover:text-primary transition-colors">استخر و آبدرمانی</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/ticket" class="hover:text-primary transition-colors">مجموعه‌های تفریحی</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/place/travel-guide/ardebil" class="hover:text-primary transition-colors">سفرنامه</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/blog" class="hover:text-primary transition-colors">بلاگ</NuxtLink>
            </li>
          </ul>
        </div>

        <div class="flex flex-col gap-3">
          <h4 class="font-bold text-sm text-base-content/90 border-r-2 border-primary pr-2 leading-none">آسروتراول</h4>
          <ul class="flex flex-col gap-2 text-xs text-base-content/60">
            <li>
              <NuxtLink to="/about" class="hover:text-primary transition-colors">درباره ما</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contact" class="hover:text-primary transition-colors">تماس با ما</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/auth/login" class="hover:text-primary transition-colors">ورود / ثبت‌نام</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dashboard" class="hover:text-primary transition-colors">داشبورد</NuxtLink>
            </li>
          </ul>
        </div>

        <div class="flex flex-col gap-3">
          <h4 class="font-bold text-sm text-base-content/90 border-r-2 border-primary pr-2 leading-none">مجوزهای قانونی</h4>
          <div class="flex gap-2 flex-wrap">
            <div class="size-16 rounded-xl bg-base-100 border border-base-300/60 flex items-center justify-center p-2 text-[10px] text-base-content/40 text-center font-medium shadow-xs">
              نماد الکترونیک
            </div>
            <div class="size-16 rounded-xl bg-base-100 border border-base-300/60 flex items-center justify-center p-2 text-[10px] text-base-content/40 text-center font-medium shadow-xs">
              نشان ملی ثبت
            </div>
          </div>
        </div>

      </div>

      <div class="border-t border-base-300/60 bg-base-300/30">
        <div class="max-w-480 mx-auto px-6 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p class="text-xs text-base-content/50 font-medium">© ۱۴۰۵ آسرو — تمامی حقوق مادی و معنوی محفوظ است.</p>
          <div class="flex gap-2">
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
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </a>
          </div>
          <div class="flex items-center gap-1" dir="ltr">
            <p class="text-[11px] text-base-content/40">Designed with</p>
            <p class="text-rose-700">♥</p>
            <p class="text-[11px] text-base-content/40">by AsroTravel Team</p>
          </div>
        </div>
      </div>
    </footer>

  </div>
</template>

<style scoped>
.menu-fade-enter-active {
  animation: menu-reveal 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.menu-fade-leave-active {
  animation: menu-reveal 0.2s cubic-bezier(0.22, 1, 0.36, 1) reverse both;
}
@keyframes menu-reveal {
  from { opacity: 0; transform: scale(0.92) translateY(-6px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>