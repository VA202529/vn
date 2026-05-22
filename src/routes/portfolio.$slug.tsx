import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Section, Eyebrow } from "@/components/site/Section";
import { useSiteData } from "@/hooks/use-site-data";
import { getPortfolioId, imageSource, toneFor } from "@/lib/api";

export const Route = createFileRoute("/portfolio/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Project — Van Appiah` },
      { name: "description", content: `Bekijk dit project (${params.slug}) van Van Appiah.` },
    ],
  }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = Route.useParams();
  const { data, isLoading, isError } = useSiteData();
  const items = data?.portfolio ?? [];
  const project = items.find((p) => getPortfolioId(p) === slug);
  const [activeImg, setActiveImg] = useState(0);

  if (isLoading) {
    return (
      <Section className="py-24 text-center">
        <p className="text-muted-foreground">Project wordt geladen…</p>
      </Section>
    );
  }

  if (isError) {
    return (
      <Section className="py-24 text-center">
        <p className="text-muted-foreground">De websitegegevens konden tijdelijk niet worden geladen.</p>
        <Link to="/portfolio" className="mt-4 inline-block underline">Terug naar portfolio</Link>
      </Section>
    );
  }

  if (!project) {
    return (
      <Section className="py-24 text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold">Project niet gevonden</h1>
        <Link to="/portfolio" className="mt-6 inline-block underline">Terug naar portfolio</Link>
      </Section>
    );
  }

  const others = items.filter((p) => getPortfolioId(p) !== slug).slice(0, 2);
  const tone = toneFor(slug);
  const images = project.images || [];
  const cover = imageSource(images[activeImg]);

  return (
    <>
      <Section className="pt-10 sm:pt-16 md:pt-24 pb-8 md:pb-12">
        <Link to="/portfolio" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          ← Portfolio
        </Link>
        <div className="mt-6 flex items-center gap-3 text-xs font-mono text-muted-foreground flex-wrap">
          {project.categorie && (
            <span className="rounded-full border border-border bg-surface px-3 py-1">{project.categorie}</span>
          )}
          {project.klantnaam && (
            <span className="rounded-full border border-border bg-surface px-3 py-1">{project.klantnaam}</span>
          )}
        </div>
        <h1 className="mt-5 text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95] max-w-4xl">
          {project.titel}
        </h1>
        {project.beschrijving && (
          <p className="mt-5 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl">{project.beschrijving}</p>
        )}
      </Section>

      <Section className="pb-12">
        <div
          className={`rounded-[1.75rem] sm:rounded-[2rem] border border-border bg-gradient-to-br ${tone} relative overflow-hidden aspect-[16/9] sm:aspect-[2/1]`}
        >
          {cover ? (
            <img src={cover} alt={project.titel || "Project"} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <>
              <div className="grain absolute inset-0 opacity-40" />
              <div className="absolute inset-0 grid place-items-center">
                <p className="font-mono text-xs sm:text-sm uppercase tracking-widest text-muted-foreground">
                  {project.titel}
                </p>
              </div>
            </>
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
            <Eyebrow>Over dit project</Eyebrow>
            <p className="mt-5 text-base sm:text-lg leading-relaxed whitespace-pre-line">
              {project.beschrijving || "Geen verdere beschrijving beschikbaar."}
            </p>
          </div>
          <aside className="space-y-6">
            {project.klantnaam && (
              <div className="rounded-2xl border border-border p-5 sm:p-6">
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Opdrachtgever</p>
                <p className="mt-3 text-lg font-semibold">{project.klantnaam}</p>
              </div>
            )}
            {project.categorie && (
              <div className="rounded-2xl border border-border p-5 sm:p-6">
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Categorie</p>
                <p className="mt-3 text-lg font-semibold">{project.categorie}</p>
              </div>
            )}
          </aside>
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="rounded-[1.75rem] sm:rounded-[2rem] bg-foreground text-background p-8 sm:p-10 md:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight max-w-xl">
              Een soortgelijk project voor uw bedrijf?
            </h2>
            <p className="mt-3 opacity-80 max-w-lg">Plan een vrijblijvend gesprek. We denken graag mee.</p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-background text-foreground px-6 py-3 text-sm font-medium hover:opacity-90 whitespace-nowrap"
          >
            Start uw project →
          </Link>
        </div>
      </Section>

      {others.length > 0 && (
        <Section className="py-16">
          <Eyebrow>Meer werk</Eyebrow>
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {others.map((o) => {
              const oid = getPortfolioId(o);
              return (
                <Link
                  key={oid}
                  to="/portfolio/$slug"
                  params={{ slug: oid }}
                  className={`rounded-2xl border border-border p-6 bg-gradient-to-br ${toneFor(oid)} hover:shadow-md transition-shadow`}
                >
                  <p className="text-xs font-mono text-muted-foreground">{o.categorie || "Project"}</p>
                  <p className="mt-3 text-lg font-semibold">{o.titel}</p>
                  {o.beschrijving && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{o.beschrijving}</p>
                  )}
                </Link>
              );
            })}
          </div>
        </Section>
      )}
    </>
  );
}
