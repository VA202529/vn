import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, Eyebrow } from "@/components/site/Section";

export const Route = createFileRoute("/diensten")({
  head: () => ({
    meta: [
      { title: "Diensten — Van Appiah" },
      { name: "description", content: "Onze diensten: dynamische websites, admin dashboards, automatisering, branding en meer." },
    ],
  }),
  component: DienstenPage,
});

const services = [
  { n: "01", t: "Statische websites", d: "Snelle, scherp ontworpen marketing-sites die direct vertrouwen wekken." },
  { n: "02", t: "Dynamische websites", d: "Volledig beheerbare platformen met content management en data flows." },
  { n: "03", t: "Admin dashboards", d: "Op maat ontworpen beheersystemen voor uw producten, klanten en orders." },
  { n: "04", t: "Geautomatiseerde processen", d: "E-mailflows, herinneringen en API-koppelingen die werk uit handen nemen." },
  { n: "05", t: "Maatwerk applicaties", d: "Kleine systemen en apps die specifieke bedrijfsprocessen oplossen." },
  { n: "06", t: "Verkoopplatformen", d: "Van automotive voorraadbeheer tot retail e-commerce oplossingen." },
  { n: "07", t: "Grafisch ontwerp & branding", d: "Logo's, huisstijl en visuele identiteit die u herkenbaar maken." },
  { n: "08", t: "Private label support", d: "Productontwikkeling onder uw eigen merknaam." },
  { n: "09", t: "Social media beheer", d: "Strategie, content en groeistrategie voor uw online aanwezigheid." },
];

function DienstenPage() {
  return (
    <>
      <Section className="pt-16 md:pt-24 pb-16">
        <Eyebrow>Diensten</Eyebrow>
        <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95]">
          Een complete digitale<br />infrastructuur.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
          Van een eerste landing page tot complexe geautomatiseerde systemen. Wij combineren ontwikkeling, ontwerp en strategie.
        </p>
      </Section>

      <Section className="pb-20">
        <div className="rounded-[2rem] border border-border overflow-hidden">
          <div className="grid md:grid-cols-3 gap-px bg-border">
            {services.map((s) => (
              <div key={s.n} className="bg-background p-8 hover:bg-surface transition-colors">
                <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
                <h3 className="mt-8 text-xl font-semibold tracking-tight">{s.t}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-20">
        <div className="rounded-[2rem] border border-border p-10 md:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-xl">Niet zeker welke dienst u nodig heeft?</h2>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 whitespace-nowrap">
            Vraag advies →
          </Link>
        </div>
      </Section>
    </>
  );
}
