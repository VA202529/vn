import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Section, Eyebrow } from "@/components/site/Section";
import { useSiteData } from "@/hooks/use-site-data";
import { getPortfolioId, imageSource, toneFor, type PortfolioItem } from "@/lib/api";

export const Route = createFileRoute("/portfolio/")({
  head: () => ({
    meta: [
      { title: "Portfolio — Van Appiah" },
      { name: "description", content: "Een selectie van projecten die wij hebben opgeleverd voor uiteenlopende sectoren." },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { data, isLoading, isError } = useSiteData();
  const items: PortfolioItem[] = data?.portfolio ?? [];
  const [filter, setFilter] = useState<string>("Alle");

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((p) => p.categorie && set.add(p.categorie));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(
    () => (filter === "Alle" ? items : items.filter((p) => p.categorie === filter)),
    [filter, items],
  );

  return (
    <>
      <Section className="pt-12 sm:pt-16 md:pt-24 pb-8 md:pb-12">
        <Eyebrow>Portfolio</Eyebrow>
        <h1 className="mt-5 sm:mt-6 text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95] max-w-4xl">
          Een selectie van<br />wat wij hebben gebouwd.
        </h1>
        <p className="mt-5 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl">
          Elk project is anders. De rode draad: oplossingen die werken — voor de mensen die ermee werken.
        </p>
      </Section>

      {categories.length > 0 && (
        <Section className="pb-6">
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-2 md:flex-wrap md:overflow-visible md:mx-0 md:px-0">
            {["Alle", ...categories].map((b) => {
              const active = b === filter;
              return (
                <button
                  key={b}
                  onClick={() => setFilter(b)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-foreground text-background border-foreground"
                      : "border-border bg-surface hover:bg-surface-muted"
                  }`}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      <Section className="pb-16 md:pb-20">
        {isLoading && <LoadingGrid />}
        {isError && (
          <p className="text-center text-muted-foreground py-16">
            De projectenoverzicht kan tijdelijk niet worden geladen.
          </p>
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-16">
            Nog geen projecten om te tonen in deze categorie.
          </p>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {filtered.map((c, i) => {
              const id = getPortfolioId(c);
              const tone = toneFor(id);
              const cover = imageSource(c.images?.[0]);
              return (
                <Link
                  key={id}
                  to="/portfolio/$slug"
                  params={{ slug: id }}
                  className={`group rounded-[1.75rem] sm:rounded-[2rem] border border-border p-6 sm:p-8 md:p-10 relative overflow-hidden bg-gradient-to-br ${tone} hover:shadow-lg transition-shadow`}
                >
                  <div className="grain absolute inset-0 opacity-30 pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                      <span className="rounded-full bg-background/70 backdrop-blur px-3 py-1 border border-border">
                        {c.categorie || "Project"}
                      </span>
                      <span>#{String(i + 1).padStart(2, "0")}</span>
                    </div>

                    <div className="mt-8 sm:mt-10 aspect-[5/3] rounded-2xl border border-border bg-background/60 backdrop-blur-sm relative overflow-hidden">
                      {cover ? (
                        <img
                          src={cover}
                          alt={c.titel || "Project"}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center">
                          <div className="text-center px-6">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Geen afbeelding</p>
                            <p className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight">{c.titel}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <h3 className="mt-6 sm:mt-8 text-xl sm:text-2xl font-semibold tracking-tight">{c.titel}</h3>
                    {c.klantnaam && (
                      <p className="mt-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        {c.klantnaam}
                      </p>
                    )}
                    {c.beschrijving && (
                      <p className="mt-3 text-sm sm:text-base text-muted-foreground line-clamp-2">
                        {c.beschrijving}
                      </p>
                    )}

                    <div className="mt-6 inline-flex items-center gap-1 text-sm font-medium opacity-70 group-hover:opacity-100">
                      Bekijk project →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Section>

      <Section className="py-16 md:py-20">
        <div className="rounded-[1.75rem] sm:rounded-[2rem] bg-foreground text-background p-8 sm:p-10 md:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight max-w-xl">
            Uw project op deze pagina?
          </h2>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-background text-foreground px-6 py-3 text-sm font-medium hover:opacity-90 whitespace-nowrap"
          >
            Laten we praten →
          </Link>
        </div>
      </Section>
    </>
  );
}

function LoadingGrid() {
  return (
    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[1.75rem] sm:rounded-[2rem] border border-border p-6 sm:p-8 md:p-10 animate-pulse"
        >
          <div className="h-4 w-24 bg-surface-muted rounded-full" />
          <div className="mt-8 aspect-[5/3] rounded-2xl bg-surface" />
          <div className="mt-6 h-6 w-3/4 bg-surface-muted rounded" />
          <div className="mt-3 h-4 w-full bg-surface rounded" />
        </div>
      ))}
    </div>
  );
}
