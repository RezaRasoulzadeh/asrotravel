import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import type {
  Ticket,
  TicketSearchFilters,
  TicketSearchResponse,
} from "~/types/ticket.types";

const BASE = "/api";

export function buildTicketSearchQuery(
  f: TicketSearchFilters,
): Record<string, string> {
  const query: Record<string, string> = {};
  const terms = cleanTerms(f.terms);

  if (f.location) query.location = f.location;
  if (f.name) query.q = f.name;
  if (terms.length) query.terms = terms.join(",");
  if ((f.page ?? 1) > 1) query.page = String(f.page);
  if (f.sort && f.sort !== "default") query.sort = f.sort;
  if (f.is_featured != null) query.is_featured = String(f.is_featured);

  if (f.min_price != null || f.max_price != null) {
    query.amount = `${f.min_price ?? ""},${f.max_price ?? ""}`;
  }

  return query;
}

export function useTicketSearch() {
  const router = useRouter();
  const route = useRoute();

  const amountParam = route.query.amount as string;
  const [urlMin, urlMax] = amountParam
    ? amountParam.split(",").map(Number)
    : [NaN, NaN];
  const minPrice = typeof urlMin === 'number' && !Number.isNaN(urlMin) ? urlMin : null
  const maxPrice = typeof urlMax === 'number' && !Number.isNaN(urlMax) ? urlMax : null
  const urlTerms = parseNumberList(route.query.terms)
  const urlFeatured = route.query.is_featured
    ? route.query.is_featured === "true"
    : undefined;

  const tickets = ref<Ticket[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const total = ref(0);
  const totalPages = ref(0);
  const currentPage = ref(1);
  const perPage = ref(10);

  const filters = ref<TicketSearchFilters>({
    location: (route.query.location as string) || "",
    name: (route.query.q as string) || "",
    min_price:   minPrice,
    max_price:   maxPrice,
    is_featured: urlFeatured,
    ...(urlTerms.length ? { terms: urlTerms } : {}),
    page: route.query.page ? Number(route.query.page) : 1,
    sort: (route.query.sort as any) || "default",
  });

  function buildParams(f: TicketSearchFilters): URLSearchParams {
    const p = new URLSearchParams();
    const terms = cleanTerms(f.terms);

    if (f.location) p.set("location", f.location);
    if (f.name) p.set("q", f.name);
    if (terms.length) p.set("terms", terms.join(","));
    if (f.is_featured != null) p.set("is_featured", String(f.is_featured));

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

  function syncToUrl(f: TicketSearchFilters, replace = false) {
    const query = buildTicketSearchQuery(f);
    if (replace) router.replace({ query });
    else router.push({ query });
  }

async function fetchSearchPage(f: TicketSearchFilters): Promise<TicketSearchResponse> {
  const params = buildParams(f);
  const res = await fetch(`${BASE}/ticket/search?${params}`);
  if (!res.ok) throw new Error(`خطای سرور: ${res.status}`);
  return res.json();
}

  async function fetchTickets(f: TicketSearchFilters = filters.value) {
    loading.value = true;
    error.value = null;
    try {
      const json = await fetchSearchPage(f);
      tickets.value = json.data ?? [];
      total.value = json.total ?? 0;
      totalPages.value = json.totalPages ?? 0;
      currentPage.value = json.currentPage ?? 1;
      perPage.value = json.perPage ?? 10;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "خطا در دریافت اطلاعات";
      tickets.value = [];
    } finally {
      loading.value = false;
    }
  }

  function applyFilters(newFilters: Partial<TicketSearchFilters>) {
    filters.value = { ...filters.value, ...newFilters, page: 1 };

    const terms = cleanTerms(filters.value.terms);
    if (terms.length) filters.value.terms = terms;
    else delete filters.value.terms;

    syncToUrl(filters.value);
    fetchTickets(filters.value);
  }

  function goToPage(page: number) {
    filters.value = { ...filters.value, page };
    syncToUrl(filters.value);
    fetchTickets(filters.value);
  }

  function resetFilters() {
    filters.value = { page: 1 };
    syncToUrl(filters.value);
    fetchTickets(filters.value);
  }

  fetchTickets(filters.value);

  return {
    tickets,
    loading,
    error,
    total,
    totalPages,
    currentPage,
    perPage,
    filters,
    fetchTickets,
    applyFilters,
    goToPage,
    resetFilters,
  };
}

function parseNumberList(value: unknown): number[] {
  const raw = Array.isArray(value) ? value.join(",") : String(value ?? "");
  return cleanTerms(raw.split(",").map(Number).filter(Number.isFinite));
}

function cleanTerms(terms: number[] | undefined): number[] {
  return [...new Set(terms ?? [])].filter((t) => Number.isFinite(t) && t > 0);
}