import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, Eyebrow } from "@/components/site/Section";

export const Route = createFileRoute("/over")({
  head: () => ({
    meta: [
      { title: "Over — Van Appiah" },
      { name: "description", content: "Wie wij zijn: innovatief, creatief, partnerschap. Meer dan een webbureau." },
    ],
  }),
  component: OverPage,
});

function OverPage() {
  return (
    <>
      <Section className="pt-16 md:pt-24 pb-12">
        <Eyebrow>Over Van Appiah</Eyebrow>
        <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95] max-w-4xl">
          Meer dan een<br />webbureau.
        </h1>
      </Section>

      <Section className="pb-20">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { t: "Innovatief", d: "Slimme, dynamische systemen die bedrijfsprocessen vereenvoudigen en automatiseren." },
            { t: "Creatief", d: "Design en strategie die uw merk niet alleen zichtbaar, maar onderscheidend maken." },
            { t: "Partnerschap", d: "Wij denken mee — van het eerste idee tot duurzame groei. Náást u, niet tegenover u." },
          ].map((v) => (
            <div key={v.t} className="rounded-3xl border border-border p-8 bg-surface">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Kernwaarde</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight">{v.t}</h3>
              <p className="mt-3 text-muted-foreground">{v.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
            Van statische websites naar complete digitale ecosystemen.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Wat begon met het bouwen van eenvoudige websites is uitgegroeid tot het ontwikkelen van volledig dynamische platformen en geautomatiseerde systemen. Tegenwoordig realiseren wij complete online oplossingen.
          </p>
        </div>
      </Section>

      <Section className="py-20">
        <div className="rounded-[2rem] border border-border overflow-hidden">
          <div className="grid md:grid-cols-2 gap-px bg-border">
            <div className="bg-background p-10 md:p-14">
              <Eyebrow>Onze aanpak</Eyebrow>
              <h3 className="mt-6 text-2xl md:text-3xl font-semibold tracking-tight">Van idee tot groei</h3>
              <ol className="mt-8 space-y-5">
                {[
                  ["01", "Luisteren", "Wij beginnen met begrijpen — uw klanten, processen en doelen."],
                  ["02", "Ontwerpen", "Een doordacht systeem dat past bij hoe u werkt."],
                  ["03", "Bouwen", "Snel, schoon en schaalbaar opgeleverd."],
                  ["04", "Groeien", "Wij blijven naast u staan — ondersteuning, optimalisatie en uitbreiding."],
                ].map(([n, t, d]) => (
                  <li key={n} className="flex gap-5">
                    <span className="font-mono text-xs text-muted-foreground pt-1">{n}</span>
                    <div>
                      <p className="font-semibold">{t}</p>
                      <p className="text-sm text-muted-foreground mt-1">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="bg-background p-10 md:p-14">
              <Eyebrow>Sectoren</Eyebrow>
              <h3 className="mt-6 text-2xl md:text-3xl font-semibold tracking-tight">Waar wij verschil maken</h3>
              <ul className="mt-8 grid grid-cols-2 gap-3">
                {["Automotive", "Autodealers", "Kerken", "Stichtingen", "Goede doelen", "Kapperszaken", "Voedselwinkels", "MKB"].map((s) => (
                  <li key={s} className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium">{s}</li>
                ))}
              </ul>
              <p className="mt-8 text-sm text-muted-foreground">
                Wij werken nauw samen met administratiekantoren en kunnen bedrijven ook ondersteunen bij administratieve en organisatorische processen.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section className="py-20">
        <div className="rounded-[2rem] bg-foreground text-background p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-3xl mx-auto">
            Wij bouwen niet alleen voor klanten. Wij bouwen <span className="italic">met</span> klanten.
          </h2>
          <div className="mt-10">
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-background text-foreground px-6 py-3 text-sm font-medium hover:opacity-90">
              Word onze volgende partner →
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
