import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Eyebrow, Section } from "@/components/site/Section";
import { LazySheetImage } from "@/components/site/LazySheetImage";
import { useSiteData } from "@/hooks/use-site-data";
import {
  formatPriceFrom,
  getPortfolioDetail,
  getPortfolioId,
  getProductDetail,
  getProductId,
  imageSource,
} from "@/lib/api";
import { localBusinessSchema, seo, serviceSchema } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "Websites en marketing Amsterdam-Noord | Van Appiah",
      description:
        "Van Appiah helpt ondernemers in Amsterdam-Noord met professionele websites, webshops, branding, social media marketing en online groei.",
      keywords: [
        "website laten maken Amsterdam Noord",
        "webdesigner Amsterdam Noord",
        "marketing bureau Amsterdam Noord",
        "webshop laten maken Amsterdam",
        "VA websites",
      ],
      jsonLd: [
        localBusinessSchema(),
        serviceSchema(
          "Websites en marketing voor bedrijven",
          "Professionele websites, webshops, branding en marketing voor ondernemers in Amsterdam-Noord en omgeving.",
          "/",
        ),
      ],
    }),
  component: Index,
});

function Index() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useSiteData();
  const company = data?.bedrijfsgegevens;
  const products = (data?.producten || []).slice(0, 3);
  const portfolio = (data?.portfolio || []).slice(0, 3);
  const name = company?.bedrijfsnaam || "Van Appiah";
  const emails = [company?.email_1, company?.email_2, company?.email_3].filter(Boolean);
  const openingstijden = [
    company?.openingstijd_1,
    company?.openingstijd_2,
    company?.openingstijd_3,
  ].filter(Boolean);
  const heroImage = portfolio.map((item) => imageSource(item.images?.[0])).find(Boolean);

  return (
    <>
      <Section className="pt-10 sm:pt-16 md:pt-24 pb-16">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-foreground text-background">
          {heroImage && (
            <img
              src={heroImage}
              alt=""
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
          )}
          <div className="grain absolute inset-0 opacity-20" />
          <div className="relative max-w-4xl px-6 py-14 sm:px-10 sm:py-20 md:px-16 md:py-24">
            <Eyebrow className="text-background/65">VA</Eyebrow>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight leading-[0.95] sm:text-6xl md:text-8xl">
              Websites en marketing voor bedrijven in Amsterdam-Noord.
            </h1>
            <p className="mt-6 max-w-2xl text-xl font-medium text-background/95">
              {name} helpt ondernemers met professionele websites, webshops, branding en marketing die vertrouwen uitstralen en klanten opleveren.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-background/75 sm:text-lg">
              {company?.beschrijving ||
                "Van lokale bedrijven en salons tot kledingmerken en artiesten: wij bouwen digitale oplossingen die helder voelen, snel laden en klaar zijn om te groeien."}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/offerte"
                className="inline-flex min-h-11 items-center rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground hover:opacity-90"
              >
                Vraag een offerte aan
              </Link>
              <Link
                to="/portfolio"
                className="inline-flex min-h-11 items-center rounded-full border border-background/25 bg-background/10 px-6 py-3 text-sm font-medium text-background hover:bg-background/15"
              >
                Bekijk projecten
              </Link>
              <Link
                to="/websites-laten-maken-amsterdam-noord"
                className="inline-flex min-h-11 items-center rounded-full border border-background/25 bg-background/10 px-6 py-3 text-sm font-medium text-background hover:bg-background/15"
              >
                Website laten maken
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <Section className="py-10 md:py-16">
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Eyebrow>Bedrijfsinformatie</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
              Direct contact met {name}.
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Kies het kanaal dat bij uw vraag past en zet de eerste stap naar een helder digitaal traject.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {company?.adres && <Info label="Adres" value={company.adres} />}
            {company?.telefoonnummer && (
              <Info
                label="Telefoon"
                value={company.telefoonnummer}
                href={`tel:${company.telefoonnummer.replace(/\s/g, "")}`}
              />
            )}
            {emails.map((email) => (
              <Info key={email} label="E-mail" value={email as string} href={`mailto:${email}`} />
            ))}
            {openingstijden.length > 0 && (
              <Info label="Openingstijden" value={openingstijden.join(" / ")} />
            )}
          </div>
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-start">
          <div>
            <Eyebrow>Diensten</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
              Alles voor een sterke online uitstraling.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Van Appiah combineert webdesign, techniek, branding en marketing voor ondernemers in Amsterdam-Noord en omgeving.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/diensten" className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90">
                Bekijk diensten
              </Link>
              <Link to="/marketing-amsterdam-noord" className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-surface">
                Marketing Amsterdam-Noord
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Website laten maken", "Moderne websites voor bedrijven die vertrouwen willen opbouwen en aanvragen willen binnenhalen."],
              ["Webshop laten maken", "Overzichtelijke webshops voor merken, salons en lokale ondernemers met groeiambitie."],
              ["Marketing", "Campagnes, social media en content die uw bedrijf zichtbaar maken bij de juiste doelgroep."],
              ["Branding", "Een herkenbare stijl, tone of voice en visuele basis die professioneel aanvoelt."],
              ["Social media content", "Contentlijnen en visuals voor Instagram, TikTok en andere kanalen."],
              ["Digitale systemen", "Automatisering, formulieren en dashboards die dagelijkse processen versimpelen."],
            ].map(([title, text]) => (
              <article key={title} className="rounded-3xl border border-border bg-surface p-5">
                <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <CollectionHeader
          eyebrow="Producten"
          title="Zakelijke oplossingen"
          to="/producten"
          linkLabel="Alle producten"
        />
        {isLoading ? (
          <HomeSkeletonGrid />
        ) : products.length > 0 ? (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {products.map((product, index) => {
              const id = getProductId(product);
              const warmDetail = () => {
                queryClient.setQueryData(["product-detail", id], product);
                queryClient.prefetchQuery({
                  queryKey: ["product-detail", id],
                  queryFn: () => getProductDetail(id),
                  staleTime: 5 * 60 * 1000,
                });
              };
              return (
                <Link
                  key={id}
                  to="/producten/$slug"
                  params={{ slug: id }}
                  onMouseEnter={warmDetail}
                  onFocus={warmDetail}
                  onClick={warmDetail}
                  className="group overflow-hidden rounded-[1.5rem] border border-border bg-surface transition-colors hover:bg-surface-muted"
                >
                  <div className="relative aspect-[4/3] border-b border-border bg-gradient-to-br from-white to-zinc-100">
                    <LazySheetImage
                      kind="product"
                      item={product}
                      alt={product.titel || "Product"}
                      eager={index < 2}
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      {product.categorie || "Product"}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold tracking-tight">{product.titel}</h3>
                    {product.beschrijving && (
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        {product.beschrijving}
                      </p>
                    )}
                    {formatPriceFrom(product.prijs_vanaf) && (
                      <p className="mt-3 text-sm font-semibold">
                        {formatPriceFrom(product.prijs_vanaf)}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="mt-8 text-muted-foreground">Nog geen producten zichtbaar.</p>
        )}
      </Section>

      <Section className="py-12 md:py-20">
        <CollectionHeader
          eyebrow="Portfolio"
          title="Recent werk"
          to="/portfolio"
          linkLabel="Volledig portfolio"
        />
        {isLoading ? (
          <HomeSkeletonGrid />
        ) : portfolio.length > 0 ? (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {portfolio.map((item, index) => {
              const id = getPortfolioId(item);
              const warmDetail = () => {
                queryClient.setQueryData(["portfolio-detail", id], item);
                queryClient.prefetchQuery({
                  queryKey: ["portfolio-detail", id],
                  queryFn: () => getPortfolioDetail(id),
                  staleTime: 5 * 60 * 1000,
                });
              };
              return (
                <Link
                  key={id}
                  to="/portfolio/$slug"
                  params={{ slug: id }}
                  onMouseEnter={warmDetail}
                  onFocus={warmDetail}
                  onClick={warmDetail}
                  className="overflow-hidden rounded-[1.5rem] border border-border transition-colors hover:bg-surface"
                >
                  <div className="relative aspect-[4/3] border-b border-border bg-gradient-to-br from-white to-zinc-100">
                    <LazySheetImage
                      kind="portfolio"
                      item={item}
                      alt={item.titel || "Portfolio"}
                      eager={index < 2}
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      {item.categorie || "Project"}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold tracking-tight">{item.titel}</h3>
                    {item.klantnaam && <p className="mt-1 text-sm">{item.klantnaam}</p>}
                    {item.beschrijving && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {item.beschrijving}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="mt-8 text-muted-foreground">Nog geen portfolio-items zichtbaar.</p>
        )}
      </Section>

      <Section className="py-12 md:py-20">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Modern en rustig", "Een luxe, minimalistische uitstraling die past bij bedrijven die serieus genomen willen worden."],
            ["Gebouwd voor resultaat", "Heldere pagina's, snelle laadtijden en duidelijke call-to-actions richting contact of offerte."],
            ["Lokaal betrokken", "Focus op ondernemers in Amsterdam-Noord, Amsterdam en Noord-Holland met korte lijnen en persoonlijk advies."],
          ].map(([title, text]) => (
            <article key={title} className="rounded-3xl border border-border p-7">
              <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section className="py-12 md:py-20">
        <div className="rounded-[2rem] bg-foreground p-8 text-background sm:p-10 md:p-14">
          <Eyebrow className="text-background/65">Amsterdam-Noord</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
            Website laten maken in Amsterdam-Noord door Van Appiah.
          </h2>
          <p className="mt-5 max-w-3xl text-background/75">
            Voor lokale ondernemers is een goede website vaak het eerste vertrouwensmoment. Van Appiah helpt bedrijven in Amsterdam-Noord met webdesign, webshops, branding en marketing die professioneel voelt en makkelijk contact oplevert.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/websites-laten-maken-amsterdam-noord" className="rounded-full bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:opacity-90">
              Website laten maken in Amsterdam-Noord
            </Link>
            <Link to="/contact" className="rounded-full border border-background/25 px-5 py-2.5 text-sm font-medium hover:bg-background/10">
              Plan een kennismaking
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}

function CollectionHeader({
  eyebrow,
  title,
  to,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  to: "/producten" | "/portfolio";
  linkLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">{title}</h2>
      </div>
      <Link to={to} className="text-sm font-medium hover:underline">
        {linkLabel}
      </Link>
    </div>
  );
}

function HomeSkeletonGrid() {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[1.5rem] border border-border bg-surface animate-pulse"
        >
          <div className="aspect-[4/3] bg-surface-muted" />
          <div className="p-5">
            <div className="h-3 w-20 rounded-full bg-surface-muted" />
            <div className="mt-4 h-5 w-3/4 rounded bg-surface-muted" />
            <div className="mt-3 h-4 w-full rounded bg-surface-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Info({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-sm font-medium">{value}</p>
    </>
  );

  return href ? (
    <a href={href} className="rounded-2xl border border-border p-4 hover:bg-surface">
      {content}
    </a>
  ) : (
    <div className="rounded-2xl border border-border p-4">{content}</div>
  );
}
