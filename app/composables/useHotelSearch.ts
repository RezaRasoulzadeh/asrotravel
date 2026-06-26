import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import type {
  HotelCardItem,
  HotelSearchFilters,
  HotelSearchResponse,
} from "~/types/hotel.types";
import { toGregorian } from "~/utils/date";

const BASE = "/api";

// ─── pars and covert dates ──────────────────────────────────────────────────
const parseDigits = (s: string) =>
  String(s).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776));

function jalaliToGregorian(jDate: string): string {
  const normalized = parseDigits(jDate);
  const parts = normalized.split("/");

  if (parts.length !== 3) return "";

  const [jyStr, jmStr, jdStr] = parts;
  if (!jyStr || !jmStr || !jdStr) return "";

  const jy = parseInt(jyStr, 10);
  const jm = parseInt(jmStr, 10);
  const jd = parseInt(jdStr, 10);

  if (isNaN(jy) || isNaN(jm) || isNaN(jd)) return "";

  return toGregorian(jy, jm, jd);
}

// ─── URL ↔ filter helpers ──────────────────────────────────────────────────

export function buildHotelSearchQuery(
  f: HotelSearchFilters,
): Record<string, string> {
  const query: Record<string, string> = {};
  const terms = cleanTerms(f.terms);

  if (f.location) query.location = f.location;
  if (f.name) query.q = f.name;
  if (terms.length) query.terms = terms.join(",");
  if ((f.page ?? 1) > 1) query.page = String(f.page);
  if (f.sort && f.sort !== "default") query.sort = f.sort;
  if (f.star_rate != null) query.star_rate = String(f.star_rate);
  if (f.date_from) {
    const gDate = jalaliToGregorian(f.date_from);
    if (gDate) query.date_from = gDate;
  }

  if (f.date_to) {
    const gDate = jalaliToGregorian(f.date_to);
    if (gDate) query.date_to = gDate;
  }
  if (f.number != null) query.number = String(f.number);

  if (f.min_price != null || f.max_price != null) {
    query.amount = `${f.min_price ?? ""},${f.max_price ?? ""}`;
  }

  return query;
}

// ─── Composable ────────────────────────────────────────────────────────────

export function useHotelSearch() {
  const router = useRouter();
  const route = useRoute();

  const amountParam = route.query.amount as string;
  const [urlMin, urlMax] = amountParam
    ? (amountParam.split(",").map(Number) as [number, number])
    : [NaN, NaN];
  const urlTerms = parseNumberList(route.query.terms);
  const urlStarRate = route.query.star_rate
    ? Number(route.query.star_rate)
    : null;
  const urlNumber = route.query.number ? Number(route.query.number) : undefined;

  // ── State ──────────────────────────────────────────────────────────────
  const hotels = ref<HotelCardItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const total = ref(0);
  const totalPages = ref(0);
  const currentPage = ref(1);
  const perPage = ref(10);

  // ── Filters ────────────────────────────────────────────────────────────
  const filters = ref<HotelSearchFilters>({
    location: (route.query.location as string) || "",
    name: (route.query.q as string) || "",
    min_price: !isNaN(urlMin) ? urlMin : null,
    max_price: !isNaN(urlMax) ? urlMax : null,
    star_rate: urlStarRate,
    date_from: (route.query.date_from as string) || undefined,
    date_to: (route.query.date_to as string) || undefined,
    number: urlNumber,
    ...(urlTerms.length ? { terms: urlTerms } : {}),
    page: route.query.page ? Number(route.query.page) : 1,
    sort: (route.query.sort as any) || "default",
  });

  // ── Build API params ───────────────────────────────────────────────────
  function buildParams(f: HotelSearchFilters): URLSearchParams {
    const p = new URLSearchParams();
    const terms = cleanTerms(f.terms);

    if (f.location) p.set("location", f.location);
    if (f.name) p.set("q", f.name);
    if (terms.length) p.set("terms", terms.join(","));
    if (f.star_rate != null) p.set("star_rate", String(f.star_rate));

    // Fix: Use append instead of set to generate duplicate keys (&date=...&date=...)
    if (f.date_from) p.append("date", f.date_from);
    if (f.date_to) p.append("date", f.date_to);

    if (f.number != null) p.set("number", String(f.number));

    p.set("page", String(f.page ?? 1));

    if (f.sort && f.sort !== "default") p.set("sort", f.sort);

    if (f.min_price != null || f.max_price != null) {
      const apiMin = (f.min_price ?? 0) * 10;
      const apiMax = (f.max_price ?? 0) * 10;
      if (apiMin > 0 || apiMax > 0) {
        p.set("amount", `${apiMin},${apiMax}`);
      }
    }
    return p;
  }

  // ── URL sync ───────────────────────────────────────────────────────────
  function syncToUrl(f: HotelSearchFilters, replace = false) {
    const query = buildHotelSearchQuery(f);
    if (replace) router.replace({ query });
    else router.push({ query });
  }

  // ── API call ───────────────────────────────────────────────────────────
async function fetchSearchPage(f: HotelSearchFilters): Promise<HotelSearchResponse> {
  const params = buildParams(f);
  const res = await fetch(`${BASE}/hotel/search-page?${params}`);
  if (!res.ok) throw new Error(`خطای سرور: ${res.status}`);
  return res.json();
}

  // ── Main fetch ─────────────────────────────────────────────────────────
  async function fetchHotels(f: HotelSearchFilters = filters.value) {
    loading.value = true;
    error.value = null;
    try {
      const json = await fetchSearchPage(f);
      hotels.value = json.data ?? [];
      total.value = json.total ?? 0;
      totalPages.value = json.totalPages ?? 0;
      currentPage.value = json.currentPage ?? 1;
      perPage.value = json.perPage ?? 10;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "خطا در دریافت اطلاعات";
      hotels.value = [];
    } finally {
      loading.value = false;
    }
  }

  // ── Filter actions ─────────────────────────────────────────────────────
  function applyFilters(newFilters: Partial<HotelSearchFilters>) {
    filters.value = { ...filters.value, ...newFilters, page: 1 };

    const terms = cleanTerms(filters.value.terms);
    if (terms.length) filters.value.terms = terms;
    else delete filters.value.terms;

    syncToUrl(filters.value);
    fetchHotels(filters.value);
  }

  function goToPage(page: number) {
    filters.value = { ...filters.value, page };
    syncToUrl(filters.value);
    fetchHotels(filters.value);
  }

  function resetFilters() {
    filters.value = { page: 1 };
    syncToUrl(filters.value);
    fetchHotels(filters.value);
  }

  fetchHotels(filters.value);

  return {
    hotels,
    loading,
    error,
    total,
    totalPages,
    currentPage,
    perPage,
    filters,
    fetchHotels,
    applyFilters,
    goToPage,
    resetFilters,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function parseNumberList(value: unknown): number[] {
  const raw = Array.isArray(value) ? value.join(",") : String(value ?? "");
  return cleanTerms(raw.split(",").map(Number).filter(Number.isFinite));
}

function cleanTerms(terms: number[] | undefined): number[] {
  return [...new Set(terms ?? [])].filter((t) => Number.isFinite(t) && t > 0);
}
