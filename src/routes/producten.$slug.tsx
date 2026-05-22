import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Section, Eyebrow } from "@/components/site/Section";
import { useSiteData } from "@/hooks/use-site-data";
import { ProductRequestDialog } from "@/components/site/ProductRequestDialog";
import { formatPriceFrom, getProductId, imageSource } from "@/lib/api";

export const Route = createFileRoute("/producten/$slug")({
  head: () => ({
    meta: [
      { title: "Product — Van Appiah" },
      { name: "description", content: "Bekijk dit product van Van Appiah en vraag eenvoudig meer informatie aan." },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data, isLoading, isError } = useSiteData();
  const items = data?.producten ?? [];
  const product = items.find((p) => getProductId(p) === slug);
  const [requestOpen, setRequestOpen] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  if (isLoading) {
    return (
      <Section className="py-24 text-center">
        <p className="text-muted-foreground">Product wordt geladen…</p>
      </Section>
    );
  }
  if (isError) {
    return (
      <Section className="py-24 text-center">
        <p className="text-muted-foreground">De websitegegevens konden tijdelijk niet worden geladen.</p>
        <Link to="/producten" className="mt-4 inline-block underline">Terug naar producten</Link>
      </Section>
    );
  }
  if (!product) {
    return (
      <Section className="py-24 text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold">Product niet gevonden</h1>
        <Link to="/producten" className="mt-6 inline-block underline">Terug naar producten</Link>
      </Section>
    );
  }

  const related = items.filter((p) => getProductId(p) !== slug).slice(0, 3);
  const images = product.images || [];
  const cover = imageSource(images[activeImg]);
  const price = formatPriceFrom(product.prijs_vanaf);
  const monthly = formatPriceFrom(product.onderhoud_per_maand);

  return (
    <>
      <Section className="pt-10 sm:pt-16 md:pt-24 pb-8 md:pb-12">
        <Link to="/producten" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          ← Producten
        </Link>
        <div className="mt-6 flex items-center gap-2 text-xs font-mono text-muted-foreground flex-wrap">
          {product.categorie && (
            <span className="rounded-full border border-border bg-surface px-3 py-1">{product.categorie}</span>
          )}
        </div>
        <h1 className="mt-5 text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95]">
          {product.titel}
        </h1>
        {price && <p className="mt-4 text-xl sm:text-2xl font-semibold">{price}</p>}
      </Section>

      <Section className="pb-12">
        <div className="rounded-[1.75rem] sm:rounded-[2rem] border border-border bg-gradient-to-br from-white to-zinc-50 relative overflow-hidden aspect-[16/9] sm:aspect-[2/1]">
          {cover ? (
            <img src={cover} alt={product.titel || "Product"} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-6 sm:inset-10 rounded-2xl border border-border bg-background/70 backdrop-blur-sm p-4 sm:p-6 flex flex-col gap-3">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-foreground/30" />
                <span className="size-2 rounded-full bg-foreground/20" />
                <span className="size-2 rounded-full bg-foreground/10" />
              </div>
              <div className="flex-1 grid grid-cols-4 gap-2 sm:gap-3 mt-1">
                <div className="rounded-md bg-foreground/5" />
                <div className="rounded-md bg-foreground/10 col-span-3" />
                <div className="rounded-md bg-foreground/10 col-span-3" />
                <div className="rounded-md bg-foreground/5" />
                <div className="rounded-md bg-foreground/5 col-span-2" />
                <div className="rounded-md bg-foreground/10 col-span-2" />
              </div>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`shrink-0 size-20 sm:size-24 rounded-xl overflow-hidden border-2 transition-colors ${
                  i === activeImg ? "border-foreground" : "border-border hover:border-foreground/30"
                }`}
              >
                <img src={imageSource(img)} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </Section>

      <Section className="pb-16 md:pb-20">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          <div className="md:col-span-2">
            <Eyebrow>Over dit product</Eyebrow>
            <p className="mt-5 text-base sm:text-lg leading-relaxed whitespace-pre-line">
              {product.beschrijving || "Geen verdere beschrijving beschikbaar."}
            </p>

            {product.onderhoud_uitleg && (
              <>
                <h2 className="mt-12 text-xl sm:text-2xl font-semibold tracking-tight">Onderhoud & support</h2>
                <p className="mt-3 text-base text-muted-foreground leading-relaxed">{product.onderhoud_uitleg}</p>
              </>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border p-5 sm:p-6 bg-surface">
              <p className="text-sm font-semibold">Interesse?</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Vraag vrijblijvend meer informatie aan — we nemen binnen 24 uur contact met je op.
              </p>
              <button
                type="button"
                onClick={() => setRequestOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90"
              >
                Aanvraag indienen →
              </button>
            </div>

            {(price || monthly) && (
              <div className="rounded-2xl border border-border p-5 sm:p-6">
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Investering</p>
                {price && <p className="mt-3 text-xl font-semibold">{price}</p>}
                {monthly && (
                  <p className="mt-1 text-sm text-muted-foreground">Onderhoud {monthly} per maand</p>
                )}
              </div>
            )}
          </aside>
        </div>
      </Section>

      {related.length > 0 && (
        <Section className="py-16">
          <Eyebrow>Andere producten</Eyebrow>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((r) => {
              const rid = getProductId(r);
              return (
                <Link
                  key={rid}
                  to="/producten/$slug"
                  params={{ slug: rid }}
                  className="rounded-2xl border border-border p-5 sm:p-6 hover:bg-surface transition-colors"
                >
                  <p className="text-xs font-mono text-muted-foreground">{r.categorie || "Product"}</p>
                  <p className="mt-3 text-lg font-semibold">{r.titel}</p>
                  {r.beschrijving && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{r.beschrijving}</p>
                  )}
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      <ProductRequestDialog product={product} open={requestOpen} onOpenChange={setRequestOpen} />
    </>
  );
}
