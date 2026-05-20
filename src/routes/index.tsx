import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, Eyebrow } from "@/components/site/Section";

export const Route = createFileRoute("/")({ component: Index });

const services = [
  { n: "01", t: "Dynamische websites", d: "Maatwerk platformen met admin-dashboard, volledige controle over data." },
  { n: "02", t: "Geautomatiseerde systemen", d: "E-mailflows, herinneringen en workflows die uw team uren besparen." },
  { n: "03", t: "Verkoopplatformen", d: "Van automotive voorraad tot retail — systemen die verkopen." },
  { n: "04", t: "Branding & design", d: "Grafisch ontwerp en positionering die uw merk onderscheidend maken." },
];

const branches = [
  "Automotive", "Autodealers", "Kerken", "Stichtingen",
  "Goede doelen", "Kapperszaken", "Voedselwinkels", "MKB",
];

function Index() {
  return (
    <>
      {/* HERO */}
      <Section className="pt-16 md:pt-24 pb-20">
        <div className="max-w-4xl">
          <Eyebrow>Digital infrastructure & automation</Eyebrow>
          <h1 className="mt-6 text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
            Wij bouwen <span className="italic font-normal">systemen</span> die werken,
            <br />verkopen en groeien.
          </h1>
          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl">
            Van Appiah ontwikkelt dynamische websites, maatwerk applicaties en geautomatiseerde processen voor groeiende bedrijven. Niet voor klanten — mét klanten.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90">
              Start een project <span>→</span>
            </Link>
            <Link to="/portfolio" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium hover:bg-surface-muted">
              Bekijk portfolio
            </Link>
          </div>
        </div>

        {/* big visual block */}
        <div className="mt-20 relative rounded-[2rem] border border-border overflow-hidden">
          <div className="grain absolute inset-0 opacity-60" />
          <div className="relative grid md:grid-cols-3 gap-px bg-border">
            {[
              { k: "5+ jr", l: "Ervaring met digitale systemen" },
              { k: "150+", l: "Projecten opgeleverd" },
              { k: "24/7", l: "Geautomatiseerde flows" },
            ].map((s) => (
              <div key={s.l} className="bg-background p-8 md:p-10">
                <p className="text-5xl md:text-6xl font-bold tracking-tight">{s.k}</p>
                <p className="mt-3 text-sm text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* SERVICES */}
      <Section className="py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <Eyebrow>Diensten</Eyebrow>
            <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">Wat wij doen</h2>
          </div>
          <Link to="/diensten" className="hidden sm:inline text-sm hover:underline">Alle diensten →</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {services.map((s) => (
            <div key={s.n} className="group rounded-3xl border border-border p-8 hover:bg-surface transition-colors">
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
                <span className="size-8 rounded-full border border-border grid place-items-center text-sm group-hover:bg-foreground group-hover:text-background transition-colors">→</span>
              </div>
              <h3 className="mt-10 text-2xl font-semibold tracking-tight">{s.t}</h3>
              <p className="mt-3 text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* PHILOSOPHY */}
      <Section className="py-20">
        <div className="rounded-[2.5rem] bg-foreground text-background p-10 md:p-20 relative overflow-hidden">
          <div className="grain absolute inset-0 opacity-20" />
          <div className="relative max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-widest opacity-60">Onze filosofie</p>
            <h2 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
              Wij bouwen <span className="italic">met</span> klanten, niet voor hen.
            </h2>
            <p className="mt-8 text-lg opacity-80 max-w-xl">
              Een website moet meer zijn dan een online visitekaartje. Het moet een systeem zijn dat werkt, verkoopt en groeit. Van het eerste idee tot duurzame groei — wij staan náást u.
            </p>
          </div>
        </div>
      </Section>

      {/* BRANCHES */}
      <Section className="py-20">
        <Eyebrow>Branches</Eyebrow>
        <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight max-w-2xl">Ervaring in diverse sectoren</h2>
        <div className="mt-12 flex flex-wrap gap-3">
          {branches.map((b) => (
            <span key={b} className="rounded-full border border-border bg-surface px-5 py-3 text-sm font-medium">{b}</span>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section className="py-20">
        <div className="rounded-[2rem] border border-border p-10 md:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-xl">Klaar voor de volgende stap?</h2>
            <p className="mt-3 text-muted-foreground">Plan een vrijblijvend adviesgesprek.</p>
          </div>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 whitespace-nowrap">
            Neem contact op <span>→</span>
          </Link>
        </div>
      </Section>
    </>
  );
}
