// Centrale koppeling met de externe backend.
// Geen technische details lekken naar de UI — alleen nette data en meldingen.

export const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbzU-x-sQs9H7UE-VXB48qyJeHWPGWbKcpeLZdPdTcljYbUtC4rOvrR_MQe1nXvUdCvH/exec";

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
  images?: string[];
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
  images?: string[];
};

export type SiteData = {
  ok: boolean;
  bedrijfsgegevens?: Bedrijfsgegevens;
  portfolio?: PortfolioItem[];
  producten?: ProductItem[];
};

// ---------- Data ophalen ----------

let jsonpCounter = 0;

function fetchJsonp(url: string, timeoutMs = 10000): Promise<SiteData> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("JSONP alleen beschikbaar in de browser"));
      return;
    }
    const cbName = `__siteCb_${Date.now()}_${jsonpCounter++}`;
    const script = document.createElement("script");
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Time-out bij het laden van gegevens"));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timer);
      delete (window as unknown as Record<string, unknown>)[cbName];
      script.remove();
    }

    (window as unknown as Record<string, unknown>)[cbName] = (data: SiteData) => {
      cleanup();
      resolve(data);
    };

    const sep = url.includes("?") ? "&" : "?";
    script.src = `${url}${sep}callback=${cbName}`;
    script.onerror = () => {
      cleanup();
      reject(new Error("Kon gegevens niet laden"));
    };
    document.head.appendChild(script);
  });
}

export async function loadSiteData(): Promise<SiteData> {
  const url = `${WEB_APP_URL}?action=getSiteData`;
  // 1) Probeer een directe fetch
  try {
    const res = await fetch(url, { method: "GET" });
    if (res.ok) {
      const data = (await res.json()) as SiteData;
      if (data && data.ok) return data;
    }
    throw new Error("fetch faalde");
  } catch {
    // 2) Fallback: JSONP via <script> tag
    if (typeof window !== "undefined") {
      try {
        const data = await fetchJsonp(url);
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
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    // We hoeven de body niet te lezen — als de request voltooid is, is dat genoeg.
    if (!res.ok) {
      // Sommige Apps Script-deployments geven 0/opaque terug; alleen echte HTTP-fouten zien we hier.
      throw new Error(`status_${res.status}`);
    }
  } catch (err) {
    // Bij netwerkfout met CORS kunnen we soms toch een succesvolle verwerking hebben,
    // maar we kunnen het niet bevestigen. We gooien door zodat de UI feedback kan geven.
    throw err instanceof Error ? err : new Error("network");
  }
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
