<!-- components/ui/review/ReviewSecion.vue -->
<script setup lang="ts">
import { Star, LogIn, MessageSquarePlus, WifiOff, MessageSquareOff, Send, Loader2 } from 'lucide-vue-next'
import { useReviews } from '~/composables/useReviews';
import type { ReviewListParams } from '~/types/review.types'

const route = useRoute()

const props = defineProps<{
  params: ReviewListParams
}>()

const { data, loading, error, currentPage, goToPage } = useReviews(props.params)
const { isAuthenticated, user, authHeaders } = useAuth()

function toPersian(val: number | string | undefined | null): string {
  if (val === undefined || val === null) return ''
  return String(val).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'.charAt(+d))
}

function formatDate(iso: string | undefined | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fa-IR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function authorInitials(first: string | undefined | null): string {
  return first?.trim() ? first.trim().charAt(0) : '؟'
}

const rateLabels: Record<number, string> = {
  1: 'خیلی بد', 2: 'بد', 3: 'متوسط', 4: 'خوب', 5: 'عالی',
}

const rateEntries = computed(() => {
  const listScore = data.value?.list_score
  if (!listScore?.rate_score) return []
  return ([5, 4, 3, 2, 1] as const).map(k => ({
    key: k,
    label: rateLabels[k] ?? 'نامشخص',
    percent: listScore.rate_score?.[k]?.percent ?? 0,
    count:   listScore.rate_score?.[k]?.total   ?? 0,
  }))
})

const serviceType = computed(() => props.params.object_model)

const criteriaLabelsByType: Record<string, Record<string, string>> = {
  Pool:   { Service: 'کیفیت خدمات', Organization: 'نظافت مجموعه',  Friendliness: 'برخورد کارکنان', AreaExpert: 'موقعیت مکانی',    Safety: 'ایمنی'         },
  Hotel:  { Service: 'کیفیت خدمات', Organization: 'نظافت اتاق',    Friendliness: 'برخورد کارکنان', AreaExpert: 'موقعیت مکانی',    Safety: 'ایمنی'         },
  Ticket: { Service: 'کیفیت خدمات', Organization: 'نظافت مجموعه',  Friendliness: 'برخورد کارکنان', AreaExpert: 'موقعیت مکانی',    Safety: 'ایمنی'         },
  place:  { Service: 'کیفیت خدمات', Organization: 'نظافت مجموعه',  Friendliness: 'برخورد کارکنان', AreaExpert: 'موقعیت مکانی',    Safety: 'ایمنی'         },
  blog:   { Service: 'کیفیت محتوا', Organization: 'دقت اطلاعات',   Friendliness: 'قابلیت خواندن',  AreaExpert: 'تخصص نویسنده',  Safety: 'مفید بودن'     },
}

const criteriaLabels = computed(() =>
  criteriaLabelsByType[serviceType.value] ?? criteriaLabelsByType.Ticket!
)

const criteriaKeys = ['Service', 'Organization', 'Friendliness', 'AreaExpert', 'Safety'] as const
type CriteriaKey = typeof criteriaKeys[number]

const reviewTitle   = ref('')
const reviewContent = ref('')
const submitLoading = ref(false)
const submitError   = ref('')
const submitSuccess = ref(false)

const starRatings  = ref<Record<CriteriaKey, number>>({
  Service: 0, Organization: 0, Friendliness: 0, AreaExpert: 0, Safety: 0,
})
const hoverRatings = ref<Record<CriteriaKey, number>>({
  Service: 0, Organization: 0, Friendliness: 0, AreaExpert: 0, Safety: 0,
})

function setStarRating(key: CriteriaKey, val: number) {
  starRatings.value[key] = val
}

function isFormValid() {
  return reviewContent.value.trim().length >= 5 &&
    criteriaKeys.every(k => starRatings.value[k] > 0)
}

function resetForm() {
  reviewTitle.value   = ''
  reviewContent.value = ''
  submitError.value   = ''
  criteriaKeys.forEach(k => {
    starRatings.value[k]  = 0
    hoverRatings.value[k] = 0
  })
}

async function submitReview() {
  if (!isFormValid() || submitLoading.value) return
  submitError.value   = ''
  submitLoading.value = true

  const reviewStats: Record<string, number> = {}
  criteriaKeys.forEach(k => { reviewStats[k] = starRatings.value[k] })

  if (serviceType.value === 'Pool') {
    reviewStats['کیفیت خدمات']    = starRatings.value.Service
    reviewStats['نظافت مجموعه']   = starRatings.value.Organization
    reviewStats['برخورد کارکنان'] = starRatings.value.Friendliness
  }

  try {
    await $fetch('/api/review/add', {
      method: 'POST',
      headers: authHeaders(),
      body: {
        review_service_type: props.params.object_model,
        review_service_id:   props.params.object_id,
        review_stats:        reviewStats,
        review_title:        reviewTitle.value.trim(),
        review_content:      reviewContent.value.trim(),
        photo: [''],
      },
    })
    submitSuccess.value = true
    resetForm()
  } catch (e: any) {
    submitError.value = e?.data?.message ?? 'خطا در ارسال نظر'
  } finally {
    submitLoading.value = false
  }
}
</script>

<template>
  <section class="px-4 lg:px-0 pt-4 max-w-960 mx-auto">
    <div class="flex flex-row gap-3 mb-5">
      <div class="p-2 rounded-xl bg-primary/10 text-primary w-fit aspect-square">
        <MessageSquarePlus :size="22" class="text-primary" />
      </div>
      <h1 class="text-3xl font-bold text-base-content">نظرات کاربران</h1>
    </div>

    <div class="flex flex-col lg:flex-row gap-6 items-start">

      <aside class="w-full lg:w-72 shrink-0 flex flex-col gap-4">

        <div class="card bg-base-200 border border-base-300 p-5 flex flex-col items-center gap-3 text-center">
          <p class="text-sm font-semibold text-base-content/70">امتیاز کلی</p>
          <template v-if="loading">
            <div class="skeleton h-12 w-24 rounded-lg" />
            <div class="skeleton h-5 w-24 rounded-full mx-auto" />
            <div class="skeleton h-4 w-28 rounded-md" />
          </template>
          <template v-else-if="data?.list_score">
            <div class="flex items-end gap-1 justify-center">
              <span class="text-5xl font-black text-base-content leading-none">
                {{ toPersian(data.list_score.score_total ?? 0) }}
              </span>
              <span class="text-base-content/40 text-lg mb-1">از ۵</span>
            </div>
            <div class="flex items-center justify-center gap-0.5">
              <Star v-for="n in 5" :key="n" :size="20"
                :class="n <= Math.round(data.list_score.score_total ?? 0) ? 'text-warning fill-warning' : 'text-base-content/40'" />
            </div>
            <span class="text-xs text-base-content/50">
              بر اساس {{ toPersian(data.list_score.total_review ?? 0) }} نظر
            </span>
          </template>
          <template v-else>
            <span class="text-base-content/40 text-sm">—</span>
          </template>
        </div>

        <div class="card bg-base-200 border border-base-300 p-5 flex flex-col gap-3">
          <p class="text-sm font-semibold text-base-content/70">توزیع امتیازات</p>
          <template v-if="loading">
            <div v-for="i in 5" :key="i" class="flex items-center gap-2">
              <div class="skeleton h-4 w-12 rounded shrink-0" />
              <div class="skeleton h-2 flex-1 rounded-full" />
              <div class="skeleton h-4 w-8 rounded shrink-0" />
            </div>
          </template>
          <template v-else-if="data?.list_score && rateEntries.length">
            <div v-for="entry in rateEntries" :key="entry.key" class="flex items-center gap-2">
              <span class="text-xs text-base-content/60 w-14 shrink-0 text-left">{{ entry.label }}</span>
              <div class="flex-1 bg-base-300 rounded-full h-2 overflow-hidden">
                <div class="h-full bg-primary rounded-full transition-all duration-700"
                  :style="{ width: `${entry.percent}%` }" />
              </div>
              <span class="text-xs text-base-content/40 w-8 text-left shrink-0">
                {{ toPersian(entry.percent) }}٪
              </span>
            </div>
          </template>
          <template v-else>
            <span class="text-base-content/40 text-xs">اطلاعات در دسترس نیست</span>
          </template>
        </div>

        <div v-if="!isAuthenticated"
          class="card bg-base-200 border border-base-300 p-5 flex flex-col gap-3">
          <p class="font-semibold text-base-content text-sm">نظر شما برای ما مهم است</p>
          <p class="text-xs text-base-content/60 leading-relaxed">
            برای ثبت نظر ابتدا وارد حساب کاربری خود شوید
          </p>
          <NuxtLink
            :to="{ path: '/login', query: { redirect: route.fullPath } }"
            class="btn btn-sm btn-primary rounded-xl gap-2">
            <LogIn class="size-4" />
            ورود به حساب
          </NuxtLink>
        </div>

      </aside>

      <div class="flex-1 min-w-0 flex flex-col gap-4 w-full">

        <div v-if="isAuthenticated"
          class="card bg-base-100 border border-base-300 p-5 flex flex-col gap-4">

          <template v-if="submitSuccess">
            <div class="flex flex-col items-center justify-center py-6 gap-3 text-center">
              <div class="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <MessageSquarePlus :size="22" class="text-success" />
              </div>
              <p class="font-semibold text-base-content">نظر شما با موفقیت ثبت شد</p>
              <p class="text-xs text-base-content/50">پس از تأیید نمایش داده خواهد شد</p>
              <button class="btn btn-sm btn-ghost mt-1" @click="submitSuccess = false">
                ثبت نظر جدید
              </button>
            </div>
          </template>

          <template v-else>
            <div class="flex items-center gap-3">
              <div class="avatar avatar-placeholder">
                <div class="w-9 h-9 rounded-full bg-primary/15 text-primary font-bold text-sm flex items-center justify-center">
                  {{ authorInitials(user?.first_name) }}
                </div>
              </div>
              <div>
                <p class="font-semibold text-sm text-base-content leading-none">
                  {{ user?.first_name?.trim() || user?.last_name?.trim()
                    ? `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim()
                    : 'کاربر جدید' }}
                </p>
                <p class="text-xs text-base-content/40 mt-0.5">ثبت نظر جدید</p>
              </div>
            </div>

            <div class="divider my-0" />

            <div class="flex flex-col gap-3">
              <p class="text-xs font-semibold text-base-content/60">امتیازدهی</p>
              <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div v-for="key in criteriaKeys" :key="key"
                  class="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-base-200">
                  <span class="text-xs text-base-content/60 text-center leading-tight">
                    {{ criteriaLabels[key] }}
                  </span>
                  <div class="flex gap-0.5" dir="ltr">
                    <button
                      v-for="n in 5" :key="n"
                      type="button"
                      @mouseenter="hoverRatings[key] = n"
                      @mouseleave="hoverRatings[key] = 0"
                      @click="setStarRating(key, n)"
                    >
                      <Star :size="22"
                        :class="n <= (hoverRatings[key] || starRatings[key])
                          ? 'text-warning fill-warning'
                          : 'text-base-content/40'"
                        class="transition-colors" />
                    </button>
                  </div>
                  <span class="text-[10px] text-base-content/40 h-3">
                    {{ starRatings[key] ? rateLabels[starRatings[key]] : '' }}
                  </span>
                </div>
              </div>
            </div>

            <fieldset class="fieldset gap-1">
              <legend class="fieldset-legend">
                عنوان نظر <span class="text-base-content/30">(اختیاری)</span>
              </legend>
              <input
                v-model="reviewTitle"
                type="text"
                class="input input-bordered w-full text-sm"
                placeholder="خلاصه‌ای از تجربه شما..."
                maxlength="100"
              />
            </fieldset>

            <fieldset class="fieldset gap-1">
              <legend class="fieldset-legend">متن نظر</legend>
              <textarea
                v-model="reviewContent"
                class="textarea textarea-bordered w-full text-sm resize-none leading-relaxed rounded-lg"
                placeholder="تجربه خود را با دیگران به اشتراک بگذارید..."
                rows="4"
                maxlength="1000"
              />
              <div class="flex justify-between items-center mt-1">
                <p v-if="submitError" class="text-xs text-error">{{ submitError }}</p>
                <span v-else />
                <span class="text-[10px] text-base-content/30">
                  {{ toPersian(reviewContent.length) }} / ۱۰۰۰
                </span>
              </div>
            </fieldset>

            <button
              class="btn btn-primary rounded-xl gap-2 self-end"
              :disabled="!isFormValid() || submitLoading"
              @click="submitReview"
            >
              <Loader2 v-if="submitLoading" class="size-4 animate-spin" />
              <Send v-else class="size-4" />
              ارسال نظر
            </button>
          </template>
        </div>

        <template v-if="loading">
          <div v-for="i in 3" :key="i"
            class="card bg-base-100 border border-base-200 p-5 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="skeleton w-10 h-10 rounded-full shrink-0" />
                <div class="flex flex-col gap-2">
                  <div class="skeleton h-3 w-28 rounded" />
                  <div class="skeleton h-2.5 w-16 rounded" />
                </div>
              </div>
              <div class="flex flex-col items-end gap-1">
                <div class="skeleton h-3 w-16 rounded" />
                <div class="skeleton h-2.5 w-10 rounded" />
              </div>
            </div>
            <div class="skeleton h-3 w-full rounded mt-2" />
            <div class="skeleton h-3 w-3/4 rounded" />
          </div>
        </template>

        <div v-else-if="error"
          class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
          <div class="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center">
            <WifiOff :size="26" class="text-error" />
          </div>
          <p class="font-semibold text-base-content/80">خطا در دریافت نظرات</p>
          <p class="text-sm text-base-content/50">لطفاً اتصال خود را بررسی کنید</p>
          <button class="btn btn-sm btn-error btn-soft mt-1" @click="goToPage(currentPage)">
            تلاش مجدد
          </button>
        </div>

        <div v-else-if="data && (!data.reviews?.data || data.reviews.data.length === 0)"
          class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
          <div class="w-14 h-14 rounded-full bg-base-200 flex items-center justify-center">
            <MessageSquareOff :size="26" class="text-base-content/40" />
          </div>
          <p class="font-semibold text-base-content/80">هنوز نظری ثبت نشده</p>
          <p class="text-sm text-base-content/50">اولین نفری باشید که نظر می‌دهید</p>
        </div>

        <template v-else-if="data?.reviews?.data">
          <div
            v-for="(review, i) in data.reviews.data"
            :key="review?.id ?? i"
            class="card bg-base-100 border border-base-200 field-animate"
            :style="{ '--fi': i }"
          >
            <div class="card-body gap-3 p-5">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="avatar avatar-placeholder">
                    <div class="w-10 h-10 rounded-full bg-primary/15 text-primary font-bold text-sm flex items-center justify-center">
                      {{ authorInitials(review?.author?.first_name) }}
                    </div>
                  </div>
                  <div>
                    <p class="font-semibold text-sm text-base-content leading-none">
                      {{ review?.author?.first_name?.trim() || review?.author?.last_name?.trim()
                        ? `${review?.author?.first_name ?? ''} ${review?.author?.last_name ?? ''}`.trim()
                        : 'کاربر' }}
                    </p>
                    <p class="text-xs text-base-content/50 mt-1.5">
                      {{ formatDate(review?.created_at) }}
                    </p>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <div class="flex items-center gap-0.5">
                    <Star v-for="n in 5" :key="n" :size="15"
                      :class="n <= (review?.rate_number ?? 0) ? 'text-warning fill-warning' : 'text-base-300'" />
                  </div>
                  <span class="text-xs text-base-content/40">
                    {{ rateLabels[review?.rate_number ?? 0] ?? '' }}
                  </span>
                </div>
              </div>

              <p v-if="review?.title"
                class="text-sm font-semibold text-base-content mt-1">
                {{ review.title }}
              </p>
              <p v-if="review?.content"
                class="text-sm text-base-content/80 leading-relaxed whitespace-pre-line"
                :class="review?.title ? '' : 'mt-1'">
                {{ review.content }}
              </p>
            </div>
          </div>

          <div v-if="(data.reviews.totalPages ?? 1) > 1"
            class="flex justify-center items-center gap-2 pt-2">
            <button
              v-for="page in data.reviews.totalPages"
              :key="page"
              :class="['btn btn-sm', page === currentPage ? 'btn-primary' : 'btn-ghost']"
              @click="goToPage(page)"
            >
              {{ toPersian(page) }}
            </button>
          </div>
        </template>

      </div>
    </div>
  </section>
</template>