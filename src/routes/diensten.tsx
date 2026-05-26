import { createFileRoute, Link } from "@tanstack/react-router";
import { Eyebrow, Section } from "@/components/site/Section";
import { breadcrumbSchema, seo, serviceSchema } from "@/lib/seo";

export const Route = createFileRoute("/diensten")({
  head: () =>
    seo({
      title: "Diensten voor websites, marketing en branding | Van Appiah",
      description:
        "Bekijk de diensten van Van Appiah: websites, webshops, branding, social media marketing en digitale systemen voor ondernemers in Amsterdam en heel Nederland.",
      path: "/diensten",
      keywords: [
        "website voor bedrijf laten maken",
        "website laten maken Nederland",
        "professionele website laten maken",
        "webshop laten maken Amsterdam",
        "webshop laten maken",
        "branding voor bedrijven Amsterdam",
        "marketing voor bedrijven",
        "website en marketing bureau",
      ],
      jsonLd: [
        serviceSchema(
          "Webdesign, marketing en digitale systemen",
          "Websites, webshops, branding, social media marketing en automatisering voor bedrijven in Amsterdam en heel Nederland.",
          "/diensten",
        ),
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Diensten", path: "/diensten" },
        ]),
      ],
    }),
  component: DienstenPage,
});

const services = [
  { n: "01", t: "Website laten maken", d: "Snelle, professionele websites voor ondernemers die vertrouwen willen uitstralen en meer aanvragen willen ontvangen." },
  { n: "02", t: "Webshop laten maken", d: "Overzichtelijke webshops voor merken, salons en bedrijven die online willen verkopen." },
  { n: "03", t: "Marketing", d: "Strategie, campagnes en content die uw bedrijf zichtbaar maken in Amsterdam en daarbuiten." },
  { n: "04", t: "Social media marketing", d: "Contentlijnen, visuals en planning voor Instagram, TikTok en andere kanalen." },
  { n: "05", t: "Branding", d: "Logo, huisstijl en merkgevoel voor bedrijven die professioneel en herkenbaar willen overkomen." },
  { n: "06", t: "Digitale systemen", d: "Formulieren, dashboards, automatisering en API-koppelingen die werk uit handen nemen." },
  { n: "07", t: "Maatwerk applicaties", d: "Kleine systemen en apps die specifieke bedrijfsprocessen oplossen." },
  { n: "08", t: "Online zichtbaarheid", d: "SEO-basis, lokale vindbaarheid en contentstructuur voor ondernemers in Amsterdam en heel Nederland." },
  { n: "09", t: "Doorontwikkeling", d: "Onderhoud, optimalisatie en uitbreiding nadat uw website of systeem live staat." },
];

function DienstenPage() {
  return (
    <>
      <Section className="pt-16 pb-16 md:pt-24">
        <Eyebrow>Diensten</Eyebrow>
        <h1 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
          Websites, marketing<br />en systemen voor groei.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Vanuit Amsterdam-Noord helpt Van Appiah bedrijven in Amsterdam en heel Nederland met webdesign, webshops, branding, marketing en automatisering. Alles blijft helder, snel en gericht op aanvragen.
        </p>
      </Section>

      <Section className="pb-20">
        <div className="overflow-hidden rounded-[2rem] border border-border">
          <div className="grid gap-px bg-border md:grid-cols-3">
            {services.map((s) => (
              <article key={s.n} className="bg-background p-8 transition-colors hover:bg-surface">
                <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
                <h2 className="mt-8 text-xl font-semibold tracking-tight">{s.t}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-20">
        <div className="flex flex-col items-start justify-between gap-8 rounded-[2rem] border border-border p-10 md:flex-row md:items-center md:p-16">
          <div>
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
              Niet zeker welke dienst past bij uw bedrijf?
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Vertel kort wat u wilt bereiken. Dan adviseren we eerlijk of u beter start met een website, marketing, branding of een systeem op maat.
            </p>
          </div>
          <Link
            to="/offerte"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90"
          >
            Vraag een offerte aan →
          </Link>
        </div>
      </Section>
    </>
  );
}
