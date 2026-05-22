import { createFileRoute, Link } from "@tanstack/react-router";
import { Eyebrow, Section } from "@/components/site/Section";
import { useSiteData } from "@/hooks/use-site-data";
import {
  formatPriceFrom,
  getPortfolioId,
  getProductId,
  imageSource,
} from "@/lib/api";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
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
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
          )}
          <div className="grain absolute inset-0 opacity-20" />
          <div className="relative max-w-4xl px-6 py-14 sm:px-10 sm:py-20 md:px-16 md:py-24">
            <Eyebrow className="text-background/65">VA</Eyebrow>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight leading-[0.95] sm:text-6xl md:text-8xl">
              {name}
            </h1>
            <p className="mt-6 max-w-2xl text-xl font-medium text-background/95">
              {company?.slogan || "Digitale oplossingen met een luxe zakelijke afwerking."}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-background/75 sm:text-lg">
              {company?.beschrijving ||
                "Vertel waar u naartoe wilt, dan bekijken we welke digitale oplossing daarbij past."}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex min-h-11 items-center rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground hover:opacity-90"
              >
                Neem contact op
              </Link>
              <Link
                to="/producten"
                className="inline-flex min-h-11 items-center rounded-full border border-background/25 bg-background/10 px-6 py-3 text-sm font-medium text-background hover:bg-background/15"
              >
                Bekijk producten
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
        <CollectionHeader
          eyebrow="Producten"
          title="Zakelijke oplossingen"
          to="/producten"
          linkLabel="Alle producten"
        />
        {isLoading ? (
          <p className="mt-8 text-muted-foreground">Producten laden...</p>
        ) : products.length > 0 ? (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {products.map((product) => {
              const id = getProductId(product);
              const image = imageSource(product.images?.[0]);
              return (
                <Link
                  key={id}
                  to="/producten/$slug"
                  params={{ slug: id }}
                  className="group overflow-hidden rounded-[1.5rem] border border-border bg-surface transition-colors hover:bg-surface-muted"
                >
                  <Media src={image} alt={product.titel || "Product"} />
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
          <p className="mt-8 text-muted-foreground">Portfolio laden...</p>
        ) : portfolio.length > 0 ? (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {portfolio.map((item) => {
              const id = getPortfolioId(item);
              return (
                <Link
                  key={id}
                  to="/portfolio/$slug"
                  params={{ slug: id }}
                  className="overflow-hidden rounded-[1.5rem] border border-border transition-colors hover:bg-surface"
                >
                  <Media src={imageSource(item.images?.[0])} alt={item.titel || "Portfolio"} />
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

function Media({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[4/3] border-b border-border bg-gradient-to-br from-white to-zinc-100">
      {src ? (
        <img src={src} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
          Geen afbeelding
        </div>
      )}
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
