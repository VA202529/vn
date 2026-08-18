import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { NEW_SITE_URL } from "@/lib/migration";
import { migrationSchema, seo } from "@/lib/seo";

const title = "Van Appiah is nu Geheel Digitaal";
const description =
  "Van Appiah gaat verder onder de naam Geheel Digitaal. Bezoek de nieuwe website van Geheel Digitaal voor websites, software, automatisering, content en digitale dienstverlening.";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title,
      description,
      keywords: ["Van Appiah", "Geheel Digitaal", "websites", "software", "automatisering"],
      jsonLd: migrationSchema(),
    }),
  component: MigrationPage,
});

export function MigrationPage() {
  return (
    <section className="flex min-h-screen items-center bg-background px-5 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-foreground text-xs font-semibold text-background">
            VA
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight">Van Appiah</p>
            <p className="text-xs text-muted-foreground">Voorheen Van Appiah</p>
          </div>
        </div>

        <div className="mt-16">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Voorheen Van Appiah
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl">
            Van Appiah is nu Geheel Digitaal
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Van Appiah gaat verder onder de officiele handelsnaam Geheel Digitaal. Onze digitale
            diensten, projecten en werkzaamheden worden voortgezet vanuit Geheel Digitaal.
          </p>

          <a
            href={NEW_SITE_URL}
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Ga naar Geheel Digitaal
            <ArrowRight className="size-4" aria-hidden />
          </a>
        </div>

        <div className="mt-16 border-t border-border pt-8">
          <h2 className="text-xl font-semibold tracking-tight">Geheel Digitaal</h2>
          <dl className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div>
              <dt className="font-medium text-foreground">KVK-nummer</dt>
              <dd className="mt-1">42112775</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Vestigingsnummer</dt>
              <dd className="mt-1">000066163560</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Rechtsvorm</dt>
              <dd className="mt-1">Eenmanszaak</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
