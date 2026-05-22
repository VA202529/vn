// Centrale koppeling met de externe backend.
// Geen technische details lekken naar de UI — alleen nette data en meldingen.

export const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbyvM06HKc1zS_mR_tYGkcDnrNo3Va3EFH0F1GWYVgGEhlwci9FcbKCItSxstYTKNh5f/exec";

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

// ---------- Data ophalen ----------

let jsonpCounter = 0;

function fetchJsonp(url: string, timeoutMs = 26000): Promise<SiteData> {
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
      resolve(normalizeSiteData(data));
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
  const url = `${WEB_APP_URL}?action=getSiteData&_=${Date.now()}`;
  const jsonpPromise =
    typeof window === "undefined"
      ? undefined
      : fetchJsonp(`${WEB_APP_URL}?action=getSiteData`);
  jsonpPromise?.catch(() => undefined);

  // 1) Probeer een directe fetch
  try {
    const controller = typeof AbortController === "undefined" ? undefined : new AbortController();
    const timer = controller ? setTimeout(() => controller.abort(), 6500) : undefined;
    const res = await withTimeout(
      fetch(url, {
        method: "GET",
        mode: "cors",
        cache: "no-store",
        credentials: "omit",
        signal: controller?.signal,
      }),
      6500,
    );
    if (timer) clearTimeout(timer);
    if (res.ok) {
      const data = parseJsonResponse(await res.text());
      if (data && data.ok) return data;
    }
    throw new Error("fetch faalde");
  } catch {
    // 2) Fallback: JSONP via <script> tag
    if (jsonpPromise) {
      try {
        const data = await jsonpPromise;
        if (data && data.ok) return data;
      } catch {
        // doorvallen
      }
    }
    throw new Error("De websitegegevens konden tijdelijk niet worden geladen.");
  }
}

// ---------- Formulieren posten ----------

type ActionPayload =
  | { action: "submitMessage"; data: Record<string, string> }
  | { action: "submitQuote"; data: Record<string, string> }
  | { action: "submitSubscriber"; data: Record<string, string> }
  | { action: "submitProductRequest"; data: Record<string, string> };

export async function postAction(payload: ActionPayload): Promise<void> {
  // Gebruik text/plain om CORS-preflight bij Apps Script te vermijden.
  // Als we de response niet kunnen lezen, beschouwen we een afgeronde
  // request als succesvol — Apps Script kan strikte CORS opleggen.
  try {
    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    // We hoeven de body niet te lezen — als de request voltooid is, is dat genoeg.
    if (res.type !== "opaque" && !res.ok) {
      // Sommige Apps Script-deployments geven 0/opaque terug; alleen echte HTTP-fouten zien we hier.
      throw new Error(`status_${res.status}`);
    }
  } catch (err) {
    // Bij netwerkfout met CORS kunnen we soms toch een succesvolle verwerking hebben,
    // maar we kunnen het niet bevestigen. We gooien door zodat de UI feedback kan geven.
    throw err instanceof Error ? err : new Error("network");
  }
}

export function imageSource(image?: SiteImage): string {
  return image?.thumbnail || image?.url || "";
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

function parseJsonResponse(text: string): SiteData {
  const trimmed = String(text || "").trim();
  if (!trimmed || (trimmed[0] !== "{" && trimmed[0] !== "[")) {
    throw new Error("De webapp gaf geen JSON terug.");
  }
  return normalizeSiteData(JSON.parse(trimmed));
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
    images: normalizeImages(row.images),
  };
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
