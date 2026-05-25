export const SITE_URL = "https://vanappiah.com";

export const SOCIAL_LINKS = [
  "https://www.instagram.com/van_appiah/",
  "https://www.tiktok.com/@vanappiah",
  "https://www.facebook.com/share/1Bd1w6Crxu/?mibextid=wwXIfr",
];

export const SERVICE_TYPES = [
  "Website laten maken",
  "Webdesign",
  "Webshop ontwikkeling",
  "Marketing",
  "Social media marketing",
  "Branding",
  "Digitale automatisering",
];

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
    { name: "author", content: "Van Appiah" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:site_name", content: "Van Appiah" },
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
    areaServed: ["Amsterdam-Noord", "Amsterdam", "Noord-Holland"],
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
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/producten?zoek={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    name: "Van Appiah",
    alternateName: "VA",
    url: SITE_URL,
    areaServed: ["Amsterdam-Noord", "Amsterdam", "Noord-Holland"],
    sameAs: SOCIAL_LINKS,
    priceRange: "€€",
    description:
      "Van Appiah helpt ondernemers in Amsterdam-Noord en omgeving met websites, webshops, branding, marketing en digitale systemen.",
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
    areaServed: ["Amsterdam-Noord", "Amsterdam", "Noord-Holland"],
    serviceType: name,
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
