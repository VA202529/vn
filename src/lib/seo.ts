import { SITE_URL } from "@/lib/config";
import { NEW_SITE_URL } from "@/lib/migration";

export const SOCIAL_LINKS = [
  "https://www.instagram.com/van_appiah/",
  "https://www.tiktok.com/@vanappiah",
  "https://www.facebook.com/share/1Bd1w6Crxu/?mibextid=wwXIfr",
];

export const SERVICE_TYPES = [
  "Website laten maken",
  "Webshop ontwikkeling",
  "Webdesign voor bedrijven",
  "Marketing voor bedrijven",
  "Social media marketing",
  "Branding",
  "Digitale systemen",
];

const AREA_SERVED = ["Amsterdam", "Noord-Holland", "Nederland"];

type SeoInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article";
  jsonLd?: unknown | unknown[];
};

export function seo({
  title,
  description,
  path = "/",
  keywords = [],
  image = `${SITE_URL}/og-van-appiah.svg`,
  type = "website",
  jsonLd,
}: SeoInput) {
  const url = canonical(path);
  const meta = [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords.join(", ") },
    { name: "author", content: "Geheel Digitaal" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:site_name", content: "Geheel Digitaal" },
    { property: "og:locale", content: "nl_NL" },
    { property: "og:image", content: image },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    ...(Array.isArray(jsonLd)
      ? jsonLd.map((item) => ({ "script:ld+json": item }))
      : jsonLd
        ? [{ "script:ld+json": jsonLd }]
        : []),
  ];

  return {
    meta,
    links: [{ rel: "canonical", href: url }],
  };
}

export function migrationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Geheel Digitaal",
    alternateName: "Van Appiah",
    url: NEW_SITE_URL,
    identifier: [
      {
        "@type": "PropertyValue",
        propertyID: "KVK",
        value: "42112775",
      },
      {
        "@type": "PropertyValue",
        propertyID: "Vestigingsnummer",
        value: "000066163560",
      },
    ],
    legalName: "Geheel Digitaal",
    description:
      "Van Appiah gaat verder onder de officiele handelsnaam Geheel Digitaal voor websites, software, automatisering, content en digitale dienstverlening.",
  };
}

export function canonical(path = "/") {
  const normalized = path === "/" ? "" : path.replace(/\/$/, "");
  return `${SITE_URL}${normalized}`;
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Van Appiah",
    alternateName: "VA",
    url: SITE_URL,
    sameAs: SOCIAL_LINKS,
    areaServed: AREA_SERVED,
    knowsAbout: SERVICE_TYPES,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Van Appiah",
    alternateName: "VA websites",
    url: SITE_URL,
    inLanguage: "nl-NL",
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    name: "Van Appiah",
    alternateName: "VA",
    url: SITE_URL,
    areaServed: AREA_SERVED,
    sameAs: SOCIAL_LINKS,
    priceRange: "€€",
    description:
      "Van Appiah is gevestigd in Amsterdam en helpt bedrijven in Amsterdam en heel Nederland met websites, webshops, branding, marketing en digitale systemen.",
    serviceType: SERVICE_TYPES,
  };
}

export function serviceSchema(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: "Van Appiah",
      url: SITE_URL,
    },
    areaServed: AREA_SERVED,
    serviceType: SERVICE_TYPES,
    url: canonical(path),
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonical(item.path),
    })),
  };
}

export function faqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
