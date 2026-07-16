// app/layouts/default.vue
<script setup lang="ts">
import {
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  MoonIcon,
  Sun,
  User2,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  User,
  CalendarCheck,
  Wallet,
  HeadphonesIcon,
} from 'lucide-vue-next'
import logoLight from '~/assets/images/logo-light.svg'
import logoDark from '~/assets/images/logo-dark.svg'
import enamadImg from '~/assets/images/enamad.webp'
import culturalHeritageImg from '~/assets/images/culturalHeritageImg.png'
import ecunionImg from '~/assets/images/ecunionImg.png'
import samandehiImg from '~/assets/images/samandehi.png'
import airaImg from '~/assets/images/aira.png'
import daneshBonyanImg from '~/assets/images/daneshBonyanImg.png'

const route = useRoute()
const router = useRouter()

const theme = useCookie<'light' | 'dark'>('asro_theme')

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

const { y } = useWindowScroll()
const scrolled = computed(() => y.value > 40)
const logoSrc = computed(() => theme.value === 'dark' ? logoDark : logoLight)

const { isAuthenticated, user, fullName, logout } = useAuth()

const isMobileMenuOpen = ref(false)
const isDashboardMenuOpen = ref(false)

const isDesktopUserOpen = ref(false)
const desktopUserRef = ref<HTMLElement | null>(null)
onClickOutside(desktopUserRef, () => { isDesktopUserOpen.value = false })

const licences = [
  { title: 'نماد اعتماد', link: 'https://trustseal.enamad.ir/?id=329138&Code=NjghlHMaoxQ5jbCZvDGg', image: enamadImg },
  { title: 'میراث فرهنگی', link: 'http://ardabilchto.ir/0/FA', image: culturalHeritageImg },
  { title: 'اتحادیه کسب و کارهای مجازی', link: '', image: ecunionImg },
  { title: 'ساماندهی', link: '', image: samandehiImg },
  { title: 'نرخ بلیط', link: '', image: airaImg },
  { title: 'دانش‌بنیان', link: 'https://daneshbonyan.isti.ir', image: daneshBonyanImg },
]

const dashboardMenuItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'داشبورد' },
  { to: '/dashboard/profile', icon: User, label: 'پروفایل' },
  { to: '/dashboard/bookings', icon: CalendarCheck, label: 'رزروهای من' },
  { to: '/dashboard/my-wallet', icon: Wallet, label: 'کیف پول' },
  { to: '/dashboard/support', icon: HeadphonesIcon, label: 'پشتیبانی' },
]

watch([isMobileMenuOpen, isDashboardMenuOpen], ([menuOpen, dashboardOpen]) => {
  document.body.style.overflow = (menuOpen || dashboardOpen) ? 'hidden' : ''
})
watch(() => route.path, () => {
  isMobileMenuOpen.value = false
  isDashboardMenuOpen.value = false
})

function handleLogout() {
  logout()
  isMobileMenuOpen.value = false
  isDashboardMenuOpen.value = false
  isDesktopUserOpen.value = false
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-linear-to-b from-base-100 to-base-200 flex flex-col">

    <header class="navbar fixed top-0 z-50 px-6 lg:px-16 transition-all duration-300"
      :class="scrolled ? 'bg-base-100/80 backdrop-blur-md shadow-xs' : 'bg-transparent'">
      <div class="navbar-start hidden lg:flex">
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

      <div class="navbar-end gap-1 hidden lg:flex">

        <button class="btn btn-ghost btn-sm btn-circle transition-colors"
          :aria-label="theme === 'light' ? 'تغییر به حالت تاریک' : 'تغییر به حالت روشن'" @click="toggleTheme">
          <MoonIcon v-if="theme === 'light'" class="size-5" />
          <Sun v-else class="size-5" />
        </button>

        <template v-if="isAuthenticated">
          <div ref="desktopUserRef" class="relative">
            <button
              type="button"
              class="btn btn-ghost btn-sm gap-2 transition-colors text-base-content"
              @click="isDesktopUserOpen = !isDesktopUserOpen"
            >
              <UiAvatar :src="user?.ImageUrl" :name="fullName" size="sm" />
              <span class="max-w-24 truncate text-sm">{{ fullName }}</span>
            </button>
            <Transition name="menu-fade">
              <ul
                v-if="isDesktopUserOpen"
                class="absolute left-0 menu bg-base-100 rounded-2xl shadow-lg border border-base-300 w-52 mt-2 z-50 p-2 origin-top-left"
                @click="isDesktopUserOpen = false"
              >
                <li v-for="item in dashboardMenuItems" :key="item.to">
                  <NuxtLink :to="item.to" class="flex items-center gap-2">
                    <component :is="item.icon" class="size-4" />
                    {{ item.label }}
                  </NuxtLink>
                </li>
                <li>
                  <button class="text-error flex gap-2 items-center" @click="handleLogout">
                    <LogOut class="size-4" /> خروج
                  </button>
                </li>
              </ul>
            </Transition>
          </div>
        </template>
        <template v-else>
          <NuxtLink :to="{ path: '/login', query: { redirect: route.path } }"
            class="btn btn-sm btn-primary text-primary-content rounded-xl gap-2 mr-1">
            <User2 class="size-4" />
            ورود / ثبت‌نام
          </NuxtLink>
        </template>

      </div>

      <div class="relative flex lg:hidden items-center justify-between w-full flex-1">

        <button
          class="btn btn-ghost btn-sm btn-circle transition-colors text-base-content"
          aria-label="باز کردن منو"
          @click="isMobileMenuOpen = true"
        >
          <Menu class="size-5" />
        </button>

        <NuxtLink to="/" class="absolute left-1/2 -translate-x-1/2">
          <img :src="logoSrc" alt="آسروتراول" class="h-9 transition-opacity duration-300" />
        </NuxtLink>

        <div class="flex items-center gap-1">
          <button class="btn btn-ghost btn-sm btn-circle transition-colors"
            :aria-label="theme === 'light' ? 'تغییر به حالت تاریک' : 'تغییر به حالت روشن'" @click="toggleTheme">
            <MoonIcon v-if="theme === 'light'" class="size-5" />
            <Sun v-else class="size-5" />
          </button>

          <button
            v-if="isAuthenticated"
            class="btn btn-ghost btn-sm btn-circle transition-colors"
            aria-label="باز کردن منوی حساب کاربری"
            @click="isDashboardMenuOpen = true"
          >
            <UiAvatar :src="user?.ImageUrl" :name="fullName" size="sm" />
          </button>
          <NuxtLink
            v-else
            :to="{ path: '/login', query: { redirect: route.path } }"
            class="btn btn-ghost btn-sm btn-circle transition-colors text-base-content"
            aria-label="ورود / ثبت‌نام"
          >
            <User2 class="size-5" />
          </NuxtLink>
        </div>

      </div>
    </header>

    <Teleport to="body">
      <Transition name="overlay-fade">
        <div
          v-if="isMobileMenuOpen || isDashboardMenuOpen"
          class="fixed inset-0 z-60 bg-black/50 lg:hidden"
          @click="isMobileMenuOpen = false; isDashboardMenuOpen = false"
        />
      </Transition>

      <Transition name="drawer-slide-right">
        <aside
          v-if="isMobileMenuOpen"
          dir="rtl"
          class="fixed inset-y-0 right-0 z-60 flex w-72 max-w-[85vw] flex-col bg-base-100 shadow-2xl lg:hidden"
        >
          <div class="flex items-center justify-between px-5 pt-6 pb-4 border-b border-base-200 shrink-0">
            <NuxtLink to="/" class="flex items-center gap-2" @click="isMobileMenuOpen = false">
              <img :src="logoSrc" alt="آسروتراول" class="h-8" />
            </NuxtLink>
            <button
              class="btn btn-ghost btn-sm btn-circle"
              aria-label="بستن منو"
              @click="isMobileMenuOpen = false"
            >
              <X class="size-5" />
            </button>
          </div>

          <div v-if="!isAuthenticated" class="px-5 py-4 border-b border-base-200 shrink-0">
            <NuxtLink
              :to="{ path: '/login', query: { redirect: route.path } }"
              class="btn btn-primary btn-sm w-full rounded-xl gap-2"
              @click="isMobileMenuOpen = false"
            >
              <User2 class="size-4" />
              ورود / ثبت‌نام
            </NuxtLink>
          </div>

          <nav class="flex-1 overflow-y-auto px-3 py-4">
            <ul class="menu gap-1 text-sm font-medium w-full">
              <li>
                <NuxtLink to="/" class="py-3" active-class="text-primary font-semibold">صفحه اصلی</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/hotel" class="py-3" active-class="text-primary font-semibold">هتل و مراکز اقامتی</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/pool" class="py-3" active-class="text-primary font-semibold">استخر و آبدرمانی</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/ticket" class="py-3" active-class="text-primary font-semibold">مجموعه‌های تفریحی</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/place/travel-guide/ardebil"
                class="py-3"
                  :class="{ 'text-primary font-semibold': route.path.startsWith('/place/travel-guide/') }">
                  سفرنامه
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/blog" class="py-3" active-class="text-primary font-semibold">بلاگ</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/about" class="py-3" active-class="text-primary font-semibold">درباره ما</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/contact" class="py-3" active-class="text-primary font-semibold">تماس با ما</NuxtLink>
              </li>
            </ul>
          </nav>
        </aside>
      </Transition>

      <Transition name="drawer-slide-left">
        <aside
          v-if="isDashboardMenuOpen && isAuthenticated"
          dir="rtl"
          class="fixed inset-y-0 left-0 z-60 flex w-72 max-w-[85vw] flex-col bg-base-100 shadow-2xl lg:hidden"
        >
          <div class="flex items-center justify-between px-5 pt-6 pb-4 border-b border-base-200 shrink-0">
            <div class="flex items-center gap-3">
              <UiAvatar :src="user?.ImageUrl" :name="fullName" size="md" />
              <div class="leading-tight">
                <p class="text-sm font-semibold">{{ fullName }}</p>
                <p class="text-xs text-base-content/40">گردشگر</p>
              </div>
            </div>
            <button
              class="btn btn-ghost btn-sm btn-circle"
              aria-label="بستن منو"
              @click="isDashboardMenuOpen = false"
            >
              <X class="size-5" />
            </button>
          </div>

          <nav class="flex-1 overflow-y-auto px-3 py-4">
            <ul class="menu gap-1 text-sm font-medium w-full">
              <li v-for="item in dashboardMenuItems" :key="item.to">
                <NuxtLink
                  :to="item.to"
                  class="flex items-center gap-3 rounded-xl px-3 py-2.5"
                  active-class="text-primary font-semibold"
                >
                  <component :is="item.icon" class="size-4" />
                  {{ item.label }}
                </NuxtLink>
              </li>
            </ul>
          </nav>

          <div class="px-3 pb-6 pt-3 border-t border-base-200 shrink-0">
            <button
              class="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-error hover:bg-error/10 transition-colors"
              @click="handleLogout"
            >
              <LogOut class="size-4" />
              خروج از حساب
            </button>
          </div>
        </aside>
      </Transition>
    </Teleport>

    <main class="flex-1">
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
              <NuxtLink to="/login" class="hover:text-primary transition-colors">ورود / ثبت‌نام</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dashboard" class="hover:text-primary transition-colors">داشبورد</NuxtLink>
            </li>
          </ul>
        </div>

        <div class="flex flex-col gap-3">
          <h4 class="font-bold text-sm text-base-content/90 border-r-2 border-primary pr-2 leading-none">مجوزهای قانونی</h4>
          <div class="flex gap-2 flex-wrap">
            <a
              v-for="(item, key) in licences"
              :key="key"
              :href="item.link"
              target="_blank"
              rel="nofollow"
              class="size-20 rounded-xl bg-white border border-base-300/60 flex items-center justify-center p-1.5 shadow-xs overflow-hidden"
            >
              <img :src="item.image" :alt="item.title" class="max-h-full max-w-full object-cover" loading="lazy" />
            </a>
          </div>
        </div>

      </div>

      <div class="border-t border-base-300/60 bg-base-300/30">
        <div class="max-w-480 mx-auto px-6 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p class="text-xs text-base-content/50 font-medium">© ۱۴۰۵ آسرو — تمامی حقوق مادی و معنوی محفوظ است.</p>
          <div class="flex gap-2">
            <a href="#" target="_blank" rel="nofollow"
              class="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-primary transition-colors"
              aria-label="تویتر">
              <Twitter class="size-5" />
            </a>
            <a href="https://t.me/asroofficial" target="_blank" rel="nofollow"
              class="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-primary transition-colors"
              aria-label="تلگرام">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </a>
            <a href="#" target="_blank" rel="nofollow"
              class="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-primary transition-colors"
              aria-label="لینکدین">
              <Linkedin class="size-5" />
            </a>
            <a href="https://facebook.com/asroofficial" target="_blank" rel="nofollow"
              class="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-primary transition-colors"
              aria-label="فیسبوک">
              <Facebook class="size-5" />
            </a>
            <a href="https://instagram.com/asroofficial" target="_blank" rel="nofollow"
              class="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-primary transition-colors"
              aria-label="اینستاگرام">
              <Instagram class="size-5" />
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

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.drawer-slide-right-enter-active,
.drawer-slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.drawer-slide-right-enter-from,
.drawer-slide-right-leave-to {
  transform: translateX(100%);
}

.drawer-slide-left-enter-active,
.drawer-slide-left-leave-active {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.drawer-slide-left-enter-from,
.drawer-slide-left-leave-to {
  transform: translateX(-100%);
}
</style>