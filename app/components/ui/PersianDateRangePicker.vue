<script setup>
import { ArrowLeft, ArrowRight, CalendarDays, Trash2 } from 'lucide-vue-next'
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

function toJalali(gy, gm, gd) {
    const g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    let gy2 = gy - 1600; let gm2 = gm - 1; let gd2 = gd - 1
    let g_day_no = 365 * gy2 + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400)
    for (let i = 0; i < gm2; ++i) g_day_no += g_days_in_month[i]
    if (gm2 > 1 && ((gy2 % 4 === 0 && gy2 % 100 !== 0) || gy2 % 400 === 0)) g_day_no++
    g_day_no += gd2
    let j_day_no = g_day_no - 79; let j_np = Math.floor(j_day_no / 12053); j_day_no = j_day_no % 12053
    let jy = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461); j_day_no %= 1461
    if (j_day_no >= 366) { jy += Math.floor((j_day_no - 1) / 365); j_day_no = (j_day_no - 1) % 365 }
    let jm = 0
    for (let i = 0; i < 11 && j_day_no >= (i < 6 ? 31 : 30); ++i) { j_day_no -= i < 6 ? 31 : 30; jm = i + 1 }
    return { jy, jm: jm + 1, jd: j_day_no + 1 }
}

function toGregorian(jy, jm, jd) {
    let jy2 = jy - 979; let jm2 = jm - 1; let jd2 = jd - 1
    let j_day_no = 365 * jy2 + Math.floor(jy2 / 33) * 8 + Math.floor(((jy2 % 33) + 3) / 4)
    for (let i = 0; i < jm2; ++i) j_day_no += i < 6 ? 31 : 30
    j_day_no += jd2
    let g_day_no = j_day_no + 79; let gy = 1600 + 400 * Math.floor(g_day_no / 146097); g_day_no %= 146097
    let leap = true
    if (g_day_no >= 36525) { g_day_no--; gy += 100 * Math.floor(g_day_no / 36524); g_day_no %= 36524; if (g_day_no >= 365) g_day_no++; else leap = false }
    gy += 4 * Math.floor(g_day_no / 1461); g_day_no %= 1461
    if (g_day_no >= 366) { leap = false; g_day_no--; gy += Math.floor(g_day_no / 365); g_day_no %= 365 }
    const g_days_in_month = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    let gm = 0
    while (gm < 12 && g_day_no >= g_days_in_month[gm]) { g_day_no -= g_days_in_month[gm]; gm++ }
    return { gy, gm: gm + 1, gd: g_day_no + 1 }
}

function daysInMonth(jy, jm) {
    if (jm <= 6) return 31
    if (jm <= 11) return 30
    return (((jy - (jy > 474 ? 473 : 474)) % 2820 + 474 + 38) * 682) % 2816 < 682 ? 30 : 29
}

function weekDay(jy, jm, jd) {
    const { gy, gm, gd } = toGregorian(jy, jm, jd)
    return (new Date(gy, gm - 1, gd).getDay() + 1) % 7
}

const F = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])
const L = s => String(s).replace(/[۰-۹]/g, d => d.charCodeAt(0) - 1776)
const pad = (n, l = 2) => String(n).padStart(l, '0')
const jalaliToNum = (jy, jm, jd) => jy * 10000 + jm * 100 + jd

const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
const WDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

const props = defineProps({
    startValue: { type: String, default: '' },
    endValue: { type: String, default: '' },
    disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update:startValue', 'update:endValue', 'change'])

const today = (() => { const n = new Date(); return toJalali(n.getFullYear(), n.getMonth() + 1, n.getDate()) })()
const todayNum = jalaliToNum(today.jy, today.jm, today.jd)

const startRange = ref(null)
const endRange = ref(null)
const hoveredDayNum = ref(null)

const open = ref(false)
const rootEl = ref(null)
const popStyle = ref({})

const startInputText = ref('')
const endInputText = ref('')

const viewYear = ref(today.jy)
const viewMonth = ref(today.jm)

const startNum = computed(() => startRange.value ? jalaliToNum(startRange.value.jy, startRange.value.jm, startRange.value.jd) : null)
const endNum = computed(() => endRange.value ? jalaliToNum(endRange.value.jy, endRange.value.jm, endRange.value.jd) : null)

watch([() => props.startValue, () => props.endValue], ([s, e]) => {
    if (s) {
        const [jy, jm, jd] = L(s).split('/').map(Number)
        startRange.value = { jy, jm, jd }
        viewYear.value = jy
        viewMonth.value = jm
        startInputText.value = F(`${jy}/${pad(jm)}/${pad(jd)}`)
    } else {
        startRange.value = null
        startInputText.value = ''
    }

    if (e) {
        const [jy, jm, jd] = L(e).split('/').map(Number)
        endRange.value = { jy, jm, jd }
        endInputText.value = F(`${jy}/${pad(jm)}/${pad(jd)}`)
    } else {
        endRange.value = null
        endInputText.value = ''
    }
}, { immediate: true })

function computePos() {
    if (!rootEl.value) return
    const r = rootEl.value.getBoundingClientRect()
    const popH = 345
    const spaceBelow = window.innerHeight - r.bottom
    const top = spaceBelow >= popH || spaceBelow >= r.top ? r.bottom + window.scrollY + 6 : r.top + window.scrollY - popH - 6
    popStyle.value = { position: 'absolute', top: top + 'px', right: (window.innerWidth - r.right) + 'px', zIndex: 99999, width: '280px' }
}

async function openPop() {
    if (props.disabled) return
    open.value = true
    await nextTick()
    computePos()
    window.addEventListener('scroll', computePos, true)
    window.addEventListener('resize', computePos)
}

function closePop() {
    open.value = false
    window.removeEventListener('scroll', computePos, true)
    window.removeEventListener('resize', computePos)
}

function onGlobalClick(e) {
    if (!rootEl.value?.contains(e.target) && !document.getElementById('pdp-range-pop')?.contains(e.target)) {
        closePop()
        if (!endRange.value) clearRange()
    }
}

onMounted(() => {
    window.addEventListener('mousedown', onGlobalClick)
})

onUnmounted(() => {
    window.removeEventListener('mousedown', onGlobalClick)
})

function onInputClick() {
    if (!open.value && !props.disabled) openPop()
}

function selectDay(d) {
    if (!d || isDayDisabled(d)) return
    const currentNum = jalaliToNum(viewYear.value, viewMonth.value, d)

    if (!startRange.value || (startRange.value && endRange.value)) {
        startRange.value = { jy: viewYear.value, jm: viewMonth.value, jd: d }
        endRange.value = null
        emit('update:startValue', `${viewYear.value}/${pad(viewMonth.value)}/${pad(d)}`)
        emit('update:endValue', '')
    } else {
        if (currentNum < startNum.value) {
            startRange.value = { jy: viewYear.value, jm: viewMonth.value, jd: d }
            emit('update:startValue', `${viewYear.value}/${pad(viewMonth.value)}/${pad(d)}`)
        } else {
            endRange.value = { jy: viewYear.value, jm: viewMonth.value, jd: d }
            emit('update:endValue', `${viewYear.value}/${pad(viewMonth.value)}/${pad(d)}`)
            emit('change', { start: props.startValue, end: `${viewYear.value}/${pad(viewMonth.value)}/${pad(d)}` })
        }
    }
}

function onDayHover(d) {
    if (!d || !startRange.value || endRange.value) { hoveredDayNum.value = null; return }
    hoveredDayNum.value = jalaliToNum(viewYear.value, viewMonth.value, d)
}

function isDayDisabled(d) {
    if (!d) return true
    return jalaliToNum(viewYear.value, viewMonth.value, d) < todayNum
}

function getDayClasses(d) {
    if (!d) return 'pdp-day--empty'
    const n = jalaliToNum(viewYear.value, viewMonth.value, d)

    const classes = {
        'pdp-day--dis': n < todayNum,
        'pdp-day--today': n === todayNum,
        'pdp-day--start': n === startNum.value,
        'pdp-day--end': n === endNum.value
    }

    if (startNum.value && !endNum.value && hoveredDayNum.value && n > startNum.value && n <= hoveredDayNum.value) {
        classes['pdp-day--in-range'] = true
    }
    if (startNum.value && endNum.value && n > startNum.value && n < endNum.value) {
        classes['pdp-day--in-range'] = true
    }

    return classes
}

function clearRange() {
    startRange.value = null
    endRange.value = null
    hoveredDayNum.value = null
    startInputText.value = ''
    endInputText.value = ''
    emit('update:startValue', '')
    emit('update:endValue', '')
    closePop()
}

const days = computed(() => {
    const total = daysInMonth(viewYear.value, viewMonth.value)
    const start = weekDay(viewYear.value, viewMonth.value, 1)
    const cells = []
    for (let i = 0; i < start; i++) cells.push(null)
    for (let d = 1; d <= total; d++) cells.push(d)
    return cells
})

const yearRange = computed(() => {
    const arr = []
    for (let y = today.jy; y <= today.jy + 5; y++) arr.push(y)
    return arr
})

function prevMonth() { if (viewMonth.value === 1) { viewMonth.value = 12; viewYear.value-- } else viewMonth.value-- }
function nextMonth() { if (viewMonth.value === 12) { viewMonth.value = 1; viewYear.value++ } else viewMonth.value++ }
</script>

<template>
    <div ref="rootEl" class="pdp-root w-full grid grid-cols-2 gap-4" dir="rtl">
        <fieldset class="fieldset w-full">
            <legend class="fieldset-legend">ورود</legend>
            <label class="input input-bordered flex items-center gap-2 w-full"
                :class="{ 'bg-base-200 pointer-events-none opacity-50': disabled }">
                <CalendarDays class="text-base-content/60 cursor-pointer" @click="onInputClick" />
                <input type="text" readonly :value="startInputText" :disabled="disabled"
                    class="grow text-sm tracking-wide cursor-pointer select-none" dir="ltr" @click="onInputClick"
                    placeholder="انتخاب تاریخ" />
                <button v-if="startInputText" class="opacity-40 hover:opacity-85 text-sm"
                    @mousedown.prevent="clearRange">
                    <Trash2 class="h-4 w-4 cursor-pointer hover:text-error" />
                </button>
            </label>
        </fieldset>

        <fieldset class="fieldset w-full">
            <legend class="fieldset-legend">خروج</legend>
            <label class="input input-bordered flex items-center gap-2 w-full"
                :class="{ 'bg-base-200 pointer-events-none opacity-50': disabled }">
                <CalendarDays class="text-base-content/60 cursor-pointer" @click="onInputClick" />
                <input type="text" readonly :value="endInputText" :disabled="disabled"
                    class="grow text-sm tracking-wide cursor-pointer select-none" dir="ltr" @click="onInputClick"
                    placeholder="انتخاب تاریخ" />
            </label>
        </fieldset>

        <ClientOnly>
            <Teleport to="body">
                <Transition name="pdp-fade">
                    <div v-if="open" id="pdp-range-pop" class="pdp-popover" :style="popStyle" role="dialog" dir="rtl">
                        <div class="pdp-header">
                            <button class="pdp-nav" @click="prevMonth">
                                <ArrowRight class="h-4 w-4" />
                            </button>
                            <div class="pdp-header-selects">
                                <select class="pdp-sel" v-model="viewMonth">
                                    <option v-for="(m, i) in MONTHS" :key="i" :value="i + 1">{{ m }}</option>
                                </select>
                                <select class="pdp-sel" v-model.number="viewYear">
                                    <option v-for="y in yearRange" :key="y" :value="y">{{ F(y) }}</option>
                                </select>
                            </div>
                            <button class="pdp-nav" @click="nextMonth">
                                <ArrowLeft class="h-4 w-4" />
                            </button>
                        </div>

                        <div class="pdp-wdays">
                            <span v-for="w in WDAYS" :key="w">{{ w }}</span>
                        </div>

                        <div class="pdp-grid">
                            <button v-for="(d, i) in days" :key="i" class="pdp-day" :class="getDayClasses(d)"
                                :disabled="isDayDisabled(d)" @mousedown.prevent="selectDay(d)"
                                @mouseenter="onDayHover(d)">{{ d ? F(d) : '' }}</button>
                        </div>

                        <div class="pdp-footer flex justify-between items-center">
                            <button class="pdp-btn-clear" @mousedown.prevent="clearRange">پاک کردن</button>
                            <button class="pdp-btn-submit" :disabled="!endRange"
                                @mousedown.prevent="closePop">تایید</button>
                        </div>
                    </div>
                </Transition>
            </Teleport>
        </ClientOnly>
    </div>
</template>

<style scoped>
.pdp-root {
    position: relative;
    font-family: 'Vazirmatn', 'Tahoma', sans-serif;
    direction: rtl;
}
</style>

<style>
.pdp-popover {
    font-family: 'Vazirmatn', 'Tahoma', sans-serif;
    direction: rtl;
    background: var(--color-base-100, #fff);
    border: 1px solid var(--color-base-300, #e5e7eb);
    border-radius: 1rem;
    padding: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, .13);
    box-sizing: border-box;
}

.pdp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}

.pdp-nav {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: 1px solid var(--color-base-300, #e5e7eb);
    border-radius: .5rem;
    cursor: pointer;
    color: var(--color-base-content, #374151);
    transition: background .15s;
}

.pdp-nav:hover {
    background: var(--color-base-200, #f3f4f6);
}

.pdp-header-selects {
    display: flex;
    gap: 4px;
}

.pdp-sel {
    background: none;
    border: none;
    outline: none;
    font-family: inherit;
    font-size: .88rem;
    color: var(--color-base-content, #374151);
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 4px;
}

.pdp-sel:hover {
    background: var(--color-base-200, #f3f4f6);
}

.pdp-wdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-size: .74rem;
    color: var(--color-base-content, #9ca3af);
    opacity: .5;
    margin-bottom: 4px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--color-base-200, #f3f4f6);
}

.pdp-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
}

.pdp-day {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: .82rem;
    font-family: inherit;
    border: none;
    border-radius: .5rem;
    background: none;
    cursor: pointer;
    color: var(--color-base-content, #374151);
    transition: all 0.1s ease;
    outline: none;
}

.pdp-day:not(.pdp-day--empty):not(.pdp-day--dis):hover {
    background: var(--color-base-200, #f3f4f6);
}

.pdp-day--empty {
    pointer-events: none;
}

.pdp-day--dis {
    opacity: .25;
    cursor: not-allowed;
}

.pdp-day--today {
    font-weight: 600;
    color: var(--color-primary, --color-primary-opacity);
    border: 1.5px solid var(--color-primary, --color-primary-opacity);
}

.pdp-day--start {
    background: var(--color-primary, --color-primary-opacity) !important;
    color: #fff !important;
    font-weight: 600;
    border-radius: 0 0.5rem 0.5rem 0 !important;
}

.pdp-day--end {
    background: var(--color-primary, --color-primary-opacity) !important;
    color: #fff !important;
    font-weight: 600;
    border-radius: 0.5rem 0 0 0.5rem !important;
}

.pdp-day--in-range {
    background: var(--color-primary-opacity) !important;
    border-radius: 0 !important;
}

.pdp-footer {
    display: flex;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid var(--color-base-200, #f3f4f6);
}

.pdp-btn-clear {
    font-family: inherit;
    font-size: .8rem;
    border: none;
    background: none;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    color: var(--color-error, #ef4444);
}

.pdp-btn-clear:hover {
    background: var(--color-base-200, #f3f4f6);
}

.pdp-btn-submit {
    font-family: inherit;
    font-size: .8rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    padding: 5px 14px;
    border-radius: 6px;
    background: var(--color-primary, #6366f1);
    color: #fff;
    transition: opacity .15s;
}

.pdp-btn-submit:hover:not(:disabled) {
    opacity: .9;
}

.pdp-btn-submit:disabled {
    opacity: .4;
    cursor: not-allowed;
}

.pdp-fade-enter-active,
.pdp-fade-leave-active {
    transition: opacity .15s, transform .15s;
}

.pdp-fade-enter-from,
.pdp-fade-leave-to {
    opacity: 0;
    transform: translateY(-5px);
}
</style>