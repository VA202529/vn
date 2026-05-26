// Centrale koppeling met de externe backend.
// Geen technische details lekken naar de UI — alleen nette data en meldingen.

export const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbxjN8mHsT_OJnGHuxzErclU25OGyfxG7DnbSxUYbfGphSrHUY2zKIh7gfBRnmiis8Xl/exec";

export type Bedrijfsgegevens = {
  id?: string;
  bedrijfsnaam?: string;
  slogan?: string;
  beschrijving?: string;
  adres?: string;
  telefoonnummer?: string;
  email_1?: string;
  email_2?: string;
  email_3?: string;
  openingstijd_1?: string;
  openingstijd_2?: string;
  openingstijd_3?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  website?: string;
  actief?: boolean;
};

export type PortfolioItem = {
  id?: number | string;
  titel?: string;
  slug?: string;
  beschrijving?: string;
  klantnaam?: string;
  categorie?: string;
  driveFolderId?: string;
  imageCountReady?: boolean;
  images?: SiteImage[];
};

export type ProductItem = {
  id?: number | string;
  titel?: string;
  slug?: string;
  beschrijving?: string;
  categorie?: string;
  prijs_vanaf?: number;
  onderhoud_eenmalig?: number;
  onderhoud_per_maand?: number;
  onderhoud_uitleg?: string;
  driveFolderId?: string;
  imageCountReady?: boolean;
  images?: SiteImage[];
};

export type SiteImage = {
  url: string;
  thumbnail?: string;
  name?: string;
};

export type SiteData = {
  ok: boolean;
  bedrijfsgegevens?: Bedrijfsgegevens;
  portfolio?: PortfolioItem[];
  producten?: ProductItem[];
};

export type PageResult<T> = {
  ok: boolean;
  items: T[];
  total?: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  nextOffset?: number;
};

export type QuoteOption = {
  id?: string;
  titel: string;
};

// ---------- Data ophalen ----------

let jsonpCounter = 0;

function fetchJsonpRaw(url: string, timeoutMs = 12000): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("JSONP alleen beschikbaar in de browser"));
      return;
    }
    const cbName = `__siteCb_${Date.now()}_${jsonpCounter++}`;
    const script = document.createElement("script");
    const timer = setTimeout(() => {
      (window as unknown as Record<string, unknown>)[cbName] = () => cleanup();
      script.remove();
      reject(new Error("Time-out bij het laden van gegevens"));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timer);
      delete (window as unknown as Record<string, unknown>)[cbName];
      script.remove();
    }

    (window as unknown as Record<string, unknown>)[cbName] = (data: unknown) => {
      cleanup();
      resolve(data);
    };

    const sep = url.includes("?") ? "&" : "?";
    script.src = `${url}${sep}callback=${cbName}&_=${Date.now()}`;
    script.onerror = () => {
      cleanup();
      reject(new Error("Kon gegevens niet laden"));
    };
    document.head.appendChild(script);
  });
}

export async function loadSiteData(): Promise<SiteData> {
  return normalizeSiteData(await requestWebApp("getSiteData", {}, { jsonpTimeoutMs: 26000 }));
}

export async function getInitialSiteData(): Promise<SiteData> {
  const attempts = [
    requestWebApp("getFastSiteData", {}, { fetchTimeoutMs: 1800, jsonpTimeoutMs: 4500 }),
    requestWebApp(
      "getInitialSiteData",
      { productsLimit: 4, portfolioLimit: 4 },
      { fetchTimeoutMs: 1800, jsonpTimeoutMs: 4500 },
    ),
    requestWebApp("getSiteData", {}, { fetchTimeoutMs: 2600, jsonpTimeoutMs: 9000 }),
  ].map((promise) => promise.then((value) => requireVisibleSiteData(normalizeSiteData(value))));

  return limitInitialData(await firstSuccessful(attempts));
}

export async function getProductsPage(offset = 0, limit = 6): Promise<PageResult<ProductItem>> {
  try {
    const page = normalizeProductPage(
      await requestWebApp("getProductsPage", { offset, limit }, { fetchTimeoutMs: 1800, jsonpTimeoutMs: 5200 }),
      offset,
      limit,
    );
    if (offset === 0 && page.items.length === 0) {
      const cached = getCachedProducts();
      if (cached.length) return slicePage(cached, offset, limit);
      const data = await getInitialSiteData();
      if (data.producten?.length) return slicePage(data.producten, offset, limit);
    }
    return page;
  } catch {
    if (offset > 0) return emptyPage(offset, limit);
    const cached = getCachedProducts();
    if (cached.length) return slicePage(cached, offset, limit);
    const data = await getInitialSiteData();
    return slicePage(data.producten || [], offset, limit);
  }
}

export async function getPortfolioPage(offset = 0, limit = 6): Promise<PageResult<PortfolioItem>> {
  try {
    const page = normalizePortfolioPage(
      await requestWebApp("getPortfolioPage", { offset, limit }, { fetchTimeoutMs: 1800, jsonpTimeoutMs: 5200 }),
      offset,
      limit,
    );
    if (offset === 0 && page.items.length === 0) {
      const cached = getCachedPortfolio();
      if (cached.length) return slicePage(cached, offset, limit);
      const data = await getInitialSiteData();
      if (data.portfolio?.length) return slicePage(data.portfolio, offset, limit);
    }
    return page;
  } catch {
    if (offset > 0) return emptyPage(offset, limit);
    const cached = getCachedPortfolio();
    if (cached.length) return slicePage(cached, offset, limit);
    const data = await getInitialSiteData();
    return slicePage(data.portfolio || [], offset, limit);
  }
}

export async function getQuoteOptions(): Promise<QuoteOption[]> {
  try {
    return normalizeQuoteOptions(
      await requestWebApp("getQuoteOptions", {}, { fetchTimeoutMs: 1800, jsonpTimeoutMs: 4500 }),
    );
  } catch {
    const data = await getInitialSiteData();
    return normalizeQuoteOptions(data.producten || []);
  }
}

export async function getPortfolioImagesForItem(id?: string, folderId?: string): Promise<SiteImage[]> {
  return normalizeImageResponse(await requestWebApp("getPortfolioImages", { id, folderId }));
}

export async function getProductImagesForItem(id?: string, folderId?: string): Promise<SiteImage[]> {
  return normalizeImageResponse(await requestWebApp("getProductImages", { id, folderId }));
}

export async function getProductDetail(slug: string): Promise<ProductItem | undefined> {
  try {
    return normalizeProductDetail(
      await requestWebApp("getProductDetail", { id: slug, slug }, { fetchTimeoutMs: 1600, jsonpTimeoutMs: 4200 }),
    );
  } catch {
    const page = await getProductsPage(0, 120);
    return page.items.find((item) => matchesPublicId(item, slug, getProductId));
  }
}

export async function getPortfolioDetail(slug: string): Promise<PortfolioItem | undefined> {
  try {
    return normalizePortfolioDetail(
      await requestWebApp("getPortfolioDetail", { id: slug, slug }, { fetchTimeoutMs: 1600, jsonpTimeoutMs: 4200 }),
    );
  } catch {
    const page = await getPortfolioPage(0, 120);
    return page.items.find((item) => matchesPublicId(item, slug, getPortfolioId));
  }
}

// ---------- Formulieren posten ----------

type ActionPayload =
  | { action: "submitMessage"; data: Record<string, string> }
  | { action: "submitQuote"; data: Record<string, string> }
  | { action: "submitSubscriber"; data: Record<string, string> }
  | { action: "submitProductRequest"; data: Record<string, string> };

export async function postAction(payload: ActionPayload): Promise<void> {
  await postFormAction(payload.action, payload.data);
}

async function postFormAction(action: ActionPayload["action"], data: Record<string, string>): Promise<unknown> {
  const body = JSON.stringify({ action, data });
  if (typeof window !== "undefined") return postOpaqueFormAction(body);
  return postReadableFormAction(body);
}

async function postOpaqueFormAction(body: string): Promise<{ ok: true }> {
  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const queued = navigator.sendBeacon(
      WEB_APP_URL,
      new Blob([body], { type: "text/plain;charset=utf-8" }),
    );
    if (queued) return { ok: true };
  }

  void fetch(WEB_APP_URL, {
    method: "POST",
    mode: "no-cors",
    keepalive: true,
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body,
  }).catch(() => undefined);

  await delay(650);
  return { ok: true };
}

async function postReadableFormAction(body: string): Promise<unknown> {
  const controller = typeof AbortController === "undefined" ? undefined : new AbortController();
  const timeout = controller ? setTimeout(() => controller.abort(), 12000) : undefined;

  try {
    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body,
      signal: controller?.signal,
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.message || "Verzenden mislukt");
    return json;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Verzenden duurde te lang. Probeer het opnieuw.");
    }
    throw err instanceof Error ? err : new Error("Verzenden mislukt");
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export function imageSource(image?: SiteImage): string {
  return image?.thumbnail || image?.url || "";
}

async function requestWebApp(
  action: string,
  params: Record<string, string | number | boolean | undefined> = {},
  options: { fetchTimeoutMs?: number; jsonpTimeoutMs?: number } = {},
): Promise<unknown> {
  const fetchTimeoutMs = options.fetchTimeoutMs ?? 2200;
  const jsonpTimeoutMs = options.jsonpTimeoutMs ?? 12000;
  const query = new URLSearchParams({ action, _: String(Date.now()) });
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });
  const url = `${WEB_APP_URL}?${query.toString()}`;
  const jsonpUrl = `${WEB_APP_URL}?${new URLSearchParams({ ...Object.fromEntries(query), _: String(Date.now()) }).toString()}`;
  const jsonpPromise =
    typeof window === "undefined" ? undefined : fetchJsonpRaw(jsonpUrl, jsonpTimeoutMs);
  jsonpPromise?.catch(() => undefined);

  const controller = typeof AbortController === "undefined" ? undefined : new AbortController();
  const timer = controller ? setTimeout(() => controller.abort(), fetchTimeoutMs) : undefined;
  const fetchPromise = withTimeout(
    fetch(url, {
      method: "GET",
      mode: "cors",
      cache: "no-store",
      credentials: "omit",
      signal: controller?.signal,
    }).then(async (res) => {
      if (!res.ok) throw new Error(`status_${res.status}`);
      return parseJsonResponse(await res.text());
    }),
    fetchTimeoutMs,
  ).finally(() => {
    if (timer) clearTimeout(timer);
  });

  if (jsonpPromise) {
    try {
      return await firstSuccessful([jsonpPromise, fetchPromise]);
    } catch {
      throw new Error("De websitegegevens konden tijdelijk niet worden geladen.");
    }
  }

  return await fetchPromise;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Time-out bij directe webapp-fetch")), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function firstSuccessful<T>(promises: Promise<T>[]): Promise<T> {
  if (typeof Promise.any === "function") return Promise.any(promises);
  return new Promise((resolve, reject) => {
    let rejected = 0;
    promises.forEach((promise) => {
      promise.then(resolve).catch((error) => {
        rejected += 1;
        if (rejected === promises.length) reject(error);
      });
    });
  });
}

function parseJsonResponse(text: string): unknown {
  const trimmed = String(text || "").trim();
  if (!trimmed || (trimmed[0] !== "{" && trimmed[0] !== "[")) {
    throw new Error("De webapp gaf geen JSON terug.");
  }
  return JSON.parse(trimmed);
}

function normalizeSiteData(value: unknown): SiteData {
  const input = asRecord(value);
  if (!input || input.ok === false) return { ok: false };

  const bedrijfsgegevens = normalizeCompany(input.bedrijfsgegevens || input.company);
  return {
    ok: input.ok === undefined ? Boolean(bedrijfsgegevens) : Boolean(input.ok),
    bedrijfsgegevens,
    producten: normalizeRows(input.producten, normalizeProduct),
    portfolio: normalizeRows(input.portfolio, normalizePortfolio),
  };
}

function limitInitialData(data: SiteData): SiteData {
  return {
    ...data,
    producten: (data.producten || []).slice(0, 4),
    portfolio: (data.portfolio || []).slice(0, 4),
  };
}

function requireVisibleSiteData(data: SiteData): SiteData {
  if (!data.ok) throw new Error("Website data niet beschikbaar");
  if (!data.bedrijfsgegevens && !data.producten?.length && !data.portfolio?.length) {
    throw new Error("Website data is leeg");
  }
  return data;
}

function normalizeProductPage(value: unknown, offset: number, limit: number): PageResult<ProductItem> {
  const input = asRecord(value);
  if (!input || input.ok === false) throw new Error("Geen producten ontvangen");
  const rows = input.items || input.producten || input.products || [];
  const items = normalizeRows(rows, normalizeProduct);
  if (!input.items && (input.producten || input.products)) return slicePage(items, offset, limit);
  return pageResult(items, input, offset, limit);
}

function normalizePortfolioPage(value: unknown, offset: number, limit: number): PageResult<PortfolioItem> {
  const input = asRecord(value);
  if (!input || input.ok === false) throw new Error("Geen portfolio ontvangen");
  const rows = input.items || input.portfolio || input.projects || [];
  const items = normalizeRows(rows, normalizePortfolio);
  if (!input.items && (input.portfolio || input.projects)) return slicePage(items, offset, limit);
  return pageResult(items, input, offset, limit);
}

function normalizeQuoteOptions(value: unknown): QuoteOption[] {
  const input = asRecord(value);
  const rows = Array.isArray(value)
    ? value
    : Array.isArray(input?.items)
      ? input.items
      : Array.isArray(input?.options)
        ? input.options
        : Array.isArray(input?.producten)
          ? input.producten
          : [];

  return rows.flatMap((row) => {
    const item = asRecord(row);
    if (!item && typeof row === "string" && row.trim()) return [{ titel: row.trim() }];
    const titel = item && toText(item.titel || item.name || item.label);
    if (!item || !titel) return [];
    return [{ id: toText(item.id || item.slug), titel }];
  });
}

function pageResult<T>(
  items: T[],
  input: Record<string, unknown>,
  offset: number,
  limit: number,
): PageResult<T> {
  const total = toNumber(input.total);
  const nextOffset = toNumber(input.nextOffset);
  const hasMore =
    typeof input.hasMore === "boolean"
      ? input.hasMore
      : nextOffset !== undefined
        ? nextOffset > offset
        : total !== undefined
          ? offset + items.length < total
          : items.length >= limit;

  return {
    ok: true,
    items,
    total,
    offset,
    limit,
    hasMore,
    nextOffset: hasMore ? nextOffset ?? offset + items.length : undefined,
  };
}

function slicePage<T>(items: T[], offset: number, limit: number): PageResult<T> {
  const pageItems = items.slice(offset, offset + limit);
  return {
    ok: true,
    items: pageItems,
    total: items.length,
    offset,
    limit,
    hasMore: offset + pageItems.length < items.length,
    nextOffset: offset + pageItems.length < items.length ? offset + pageItems.length : undefined,
  };
}

function emptyPage<T>(offset: number, limit: number): PageResult<T> {
  return {
    ok: true,
    items: [],
    total: offset,
    offset,
    limit,
    hasMore: false,
  };
}

function normalizeCompany(value: unknown): Bedrijfsgegevens | undefined {
  const row = asRecord(value);
  if (!row || !toBoolean(row.actief, true)) return undefined;

  return {
    id: toText(row.id),
    bedrijfsnaam: toText(row.bedrijfsnaam),
    slogan: toText(row.slogan),
    beschrijving: toText(row.beschrijving),
    adres: toText(row.adres),
    telefoonnummer: toText(row.telefoonnummer),
    email_1: toText(row.email_1),
    email_2: toText(row.email_2),
    email_3: toText(row.email_3),
    openingstijd_1: toText(row.openingstijd_1),
    openingstijd_2: toText(row.openingstijd_2),
    openingstijd_3: toText(row.openingstijd_3),
    instagram: toText(row.instagram),
    tiktok: toText(row.tiktok),
    linkedin: toText(row.linkedin),
    website: toText(row.website),
    actief: true,
  };
}

function normalizePortfolio(value: unknown): PortfolioItem | null {
  const row = asRecord(value);
  const titel = row && toText(row.titel);
  if (!row || !titel) return null;

  return {
    id: normalizeId(row.id),
    titel,
    slug: toText(row.slug),
    beschrijving: toText(row.beschrijving),
    klantnaam: toText(row.klantnaam),
    categorie: toText(row.categorie),
    driveFolderId: toText(row.driveFolderId),
    imageCountReady: typeof row.imageCountReady === "boolean" ? row.imageCountReady : undefined,
    images: normalizeImages(row.images),
  };
}

function normalizeProduct(value: unknown): ProductItem | null {
  const row = asRecord(value);
  const titel = row && toText(row.titel);
  if (!row || !titel) return null;

  return {
    id: normalizeId(row.id),
    titel,
    slug: toText(row.slug),
    beschrijving: toText(row.beschrijving),
    categorie: toText(row.categorie),
    prijs_vanaf: toNumber(row.prijs_vanaf),
    onderhoud_eenmalig: toNumber(row.onderhoud_eenmalig),
    onderhoud_per_maand: toNumber(row.onderhoud_per_maand),
    onderhoud_uitleg: toText(row.onderhoud_uitleg),
    driveFolderId: toText(row.driveFolderId),
    imageCountReady: typeof row.imageCountReady === "boolean" ? row.imageCountReady : undefined,
    images: normalizeImages(row.images),
  };
}

function normalizeImageResponse(value: unknown): SiteImage[] {
  const input = asRecord(value);
  if (input && input.ok === false) throw new Error("Afbeeldingen konden niet worden geladen");
  return normalizeImages(input?.images || input?.items || value);
}

function normalizeProductDetail(value: unknown): ProductItem | undefined {
  const input = asRecord(value);
  if (!input || input.ok === false) throw new Error("Product kon niet worden geladen");
  return normalizeProduct(input.item || input.product || input);
}

function normalizePortfolioDetail(value: unknown): PortfolioItem | undefined {
  const input = asRecord(value);
  if (!input || input.ok === false) throw new Error("Project kon niet worden geladen");
  return normalizePortfolio(input.item || input.project || input);
}

function normalizeImages(value: unknown): SiteImage[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((image) => {
    if (typeof image === "string" && image.trim()) return [{ url: image.trim() }];
    const row = asRecord(image);
    const url = row && toText(row.url);
    if (!row || !url) return [];
    return [{ url, thumbnail: toText(row.thumbnail), name: toText(row.name) }];
  });
}

function normalizeRows<T>(value: unknown, normalize: (row: unknown) => T | null): T[] {
  return Array.isArray(value)
    ? value.map(normalize).filter((row): row is T => row !== null)
    : [];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeId(value: unknown): number | string | undefined {
  return typeof value === "number" ? value : toText(value);
}

function toText(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text || undefined;
}

function toNumber(value: unknown): number | undefined {
  const number =
    typeof value === "number" ? value : Number(String(value || "").replace(",", "."));
  return Number.isFinite(number) ? number : undefined;
}

function toBoolean(value: unknown, fallback = false): boolean {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return !["false", "nee", "no", "0", "uit", "inactive"].includes(
    String(value).trim().toLowerCase(),
  );
}

function getCachedProducts(): ProductItem[] {
  const initial = normalizeSiteData(readStorageJson("vanappiah_site_initial")).producten || [];
  const infinite = readStorageJson("vanappiah_products_infinite");
  const pages = asRecord(infinite)?.pages;
  const pageItems = Array.isArray(pages)
    ? pages.flatMap((page) => normalizeRows(asRecord(page)?.items, normalizeProduct))
    : [];
  return uniqueByPublicId([...initial, ...pageItems], getProductId);
}

function getCachedPortfolio(): PortfolioItem[] {
  const initial = normalizeSiteData(readStorageJson("vanappiah_site_initial")).portfolio || [];
  const infinite = readStorageJson("vanappiah_portfolio_infinite");
  const pages = asRecord(infinite)?.pages;
  const pageItems = Array.isArray(pages)
    ? pages.flatMap((page) => normalizeRows(asRecord(page)?.items, normalizePortfolio))
    : [];
  return uniqueByPublicId([...initial, ...pageItems], getPortfolioId);
}

function readStorageJson(key: string): unknown {
  if (typeof window === "undefined") return undefined;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : undefined;
  } catch {
    return undefined;
  }
}

function uniqueByPublicId<T>(items: T[], getId: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const id = getId(item);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

// ---------- Helpers ----------

export function isNonEmpty<T>(value: T | null | undefined | "" | 0): value is T {
  return value !== null && value !== undefined && value !== "" && value !== 0;
}

export function getProductId(p: ProductItem): string {
  return String(p.id || p.slug || p.titel || "");
}

export function getPortfolioId(p: PortfolioItem): string {
  return String(p.slug || p.id || p.titel || "");
}

export function slugifyPublic(value?: string | number): string {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function matchesPublicId<T extends { id?: string | number; slug?: string; titel?: string }>(
  item: T,
  slug: string,
  getId: (item: T) => string,
): boolean {
  const target = slugifyPublic(slug);
  return [item.slug, item.id, item.titel, getId(item)].some((value) => slugifyPublic(value) === target);
}

const TONES = [
  "from-zinc-100 to-white",
  "from-stone-100 to-white",
  "from-neutral-100 to-white",
  "from-slate-100 to-white",
  "from-gray-100 to-white",
];

export function toneFor(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return TONES[Math.abs(h) % TONES.length];
}

export function formatPriceFrom(value?: number): string | null {
  if (!value || value <= 0) return null;
  return `vanaf €${value.toLocaleString("nl-NL")}`;
}
