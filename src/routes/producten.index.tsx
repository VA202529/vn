import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Section, Eyebrow } from "@/components/site/Section";
import { LazySheetImage } from "@/components/site/LazySheetImage";
import { useProductsInfinite } from "@/hooks/use-site-data";
import { ProductRequestDialog } from "@/components/site/ProductRequestDialog";
import { formatPriceFrom, getProductDetail, getProductId, type ProductItem } from "@/lib/api";
import { breadcrumbSchema, seo, serviceSchema } from "@/lib/seo";

export const Route = createFileRoute("/producten/")({
  head: () => ({
    meta: [
      ...seo({
        title: "Producten en digitale oplossingen | Van Appiah",
        description:
          "Bekijk websites, webshops, automatisering en digitale systemen van Van Appiah voor ondernemers in Amsterdam en Amsterdam-Noord.",
        path: "/producten",
        keywords: ["professionele website laten maken", "webshop laten maken Amsterdam", "digitale systemen ondernemers"],
        jsonLd: [
          serviceSchema(
            "Digitale producten en oplossingen",
            "Websites, webshops en automatisering voor bedrijven die online professioneel willen groeien.",
            "/producten",
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Producten", path: "/producten" },
          ]),
        ],
      }).meta,
    ],
  }),
  component: ProductenPage,
});

const PAGE_SIZE = 6;

function ProductenPage() {
  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProductsInfinite(PAGE_SIZE);
  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const [cat, setCat] = useState<string>("Alle");
  const [selected, setSelected] = useState<ProductItem | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((p) => p.categorie && set.add(p.categorie));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(
    () => (cat === "Alle" ? items : items.filter((p) => p.categorie === cat)),
    [cat, items],
  );

  return (
    <>
      <Section className="pt-12 sm:pt-16 md:pt-24 pb-8 md:pb-12">
        <Eyebrow>Producten</Eyebrow>
        <h1 className="mt-5 sm:mt-6 text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95] max-w-4xl">
          Onze digitale<br />producten & oplossingen.
        </h1>
        <p className="mt-5 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl">
          Een overzicht van websites, webshops en digitale systemen die Van Appiah kan inrichten voor ondernemers in Amsterdam-Noord en omgeving.
        </p>
      </Section>

      {categories.length > 0 && (
        <Section className="pb-6">
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-2 md:flex-wrap md:overflow-visible md:mx-0 md:px-0">
            {["Alle", ...categories].map((c) => {
              const active = c === cat;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-foreground text-background border-foreground"
                      : "border-border bg-surface hover:bg-surface-muted"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      <Section className="pb-16 md:pb-20">
        {isLoading && items.length === 0 && <LoadingGrid />}
        {isError && (
          <p className="text-center text-muted-foreground py-16">
            De producten kunnen tijdelijk niet worden geladen.
          </p>
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-16">
            Op dit moment zijn er geen producten in deze categorie.
          </p>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((p, index) => {
              const id = getProductId(p);
              const price = formatPriceFrom(p.prijs_vanaf);
              const warmDetail = () => {
                queryClient.setQueryData(["product-detail", id], p);
                queryClient.prefetchQuery({
                  queryKey: ["product-detail", id],
                  queryFn: () => getProductDetail(id),
                  staleTime: 5 * 60 * 1000,
                });
              };
              return (
                <article
                  key={id}
                  className="group relative rounded-3xl border border-border p-6 sm:p-7 hover:bg-surface transition-colors flex flex-col"
                >
                  <Link
                    to="/producten/$slug"
                    params={{ slug: id }}
                    onMouseEnter={warmDetail}
                    onFocus={warmDetail}
                    onClick={warmDetail}
                    className="block flex-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                        {p.categorie || "Product"}
                      </span>
                      <span className="size-2 rounded-full bg-foreground/60 group-hover:bg-foreground transition" />
                    </div>

                    <div className="mt-5 sm:mt-6 aspect-[4/3] rounded-2xl border border-border bg-gradient-to-br from-white to-zinc-50 relative overflow-hidden">
                      <LazySheetImage kind="product" item={p} alt={p.titel || "Product"} eager={index < 2} />
                    </div>

                    <h3 className="mt-5 sm:mt-6 text-lg sm:text-xl font-semibold tracking-tight">{p.titel}</h3>
                    {p.beschrijving && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.beschrijving}</p>
                    )}
                    {price && <p className="mt-3 text-sm font-semibold">{price}</p>}
                    {p.onderhoud_uitleg && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {p.onderhoud_uitleg}
                      </p>
                    )}
                  </Link>

                  <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-3">
                    <Link
                      to="/producten/$slug"
                      params={{ slug: id }}
                      onMouseEnter={warmDetail}
                      onFocus={warmDetail}
                      onClick={warmDetail}
                      className="text-xs font-medium hover:underline"
                    >
                      Meer info →
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelected(p)}
                      className="rounded-full bg-foreground text-background px-3.5 py-1.5 text-xs font-medium hover:opacity-90"
                    >
                      Interesse tonen
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!isLoading && !isError && hasNextPage && cat === "Alle" && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
              className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium hover:bg-surface-muted disabled:opacity-60"
            >
              {isFetchingNextPage ? "Laden..." : "Meer laden"}
            </button>
          </div>
        )}

        {isFetchingNextPage && (
          <div className="mt-5">
            <LoadingGrid count={3} />
          </div>
        )}
      </Section>

      <Section className="py-16 md:py-20">
        <div className="rounded-[1.75rem] sm:rounded-[2rem] border border-border p-8 sm:p-10 md:p-16 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div>
            <Eyebrow>Maatwerk</Eyebrow>
            <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
              Niets gevonden dat past?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Wij bouwen ook volledig op maat. Vertel ons uw situatie, dan denken wij met u mee.
            </p>
          </div>
          <div className="flex md:justify-end">
            <Link
              to="/offerte"
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90"
            >
              Vraag een offerte aan →
            </Link>
          </div>
        </div>
      </Section>

      {selected && (
        <ProductRequestDialog
          product={selected}
          open={!!selected}
          onOpenChange={(o) => !o && setSelected(null)}
        />
      )}
    </>
  );
}

function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-3xl border border-border p-6 sm:p-7 animate-pulse">
          <div className="h-3 w-20 bg-surface-muted rounded-full" />
          <div className="mt-5 aspect-[4/3] rounded-2xl bg-surface" />
          <div className="mt-5 h-5 w-3/4 bg-surface-muted rounded" />
          <div className="mt-2 h-4 w-full bg-surface rounded" />
        </div>
      ))}
    </div>
  );
}
