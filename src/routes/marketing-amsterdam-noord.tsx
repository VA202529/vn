import { createFileRoute, Link } from "@tanstack/react-router";
import { Eyebrow, Section } from "@/components/site/Section";
import { breadcrumbSchema, faqSchema, seo, serviceSchema } from "@/lib/seo";

const faqs = [
  {
    question: "Wat doet een marketing bureau in Amsterdam-Noord?",
    answer:
      "Een marketing bureau helpt met strategie, content, social media, branding en online zichtbaarheid. Van Appiah combineert marketing met webdesign, zodat campagnes en website elkaar versterken.",
  },
  {
    question: "Helpt Van Appiah ook met social media marketing?",
    answer:
      "Ja. Van Appiah helpt met social media content, positionering, planning en campagnes voor ondernemers, artiesten, salons, merken en bedrijven in Amsterdam en heel Nederland.",
  },
  {
    question: "Kan ik marketing combineren met een nieuwe website?",
    answer:
      "Ja. Dat is vaak de sterkste aanpak: eerst een duidelijke website en merkbasis, daarna campagnes en content die bezoekers naar de juiste pagina's sturen.",
  },
  {
    question: "Is Van Appiah geschikt voor kleine bedrijven?",
    answer:
      "Ja. De aanpak is juist geschikt voor kleine tot middelgrote ondernemingen die professioneel willen groeien zonder onnodig complexe trajecten.",
  },
];

export const Route = createFileRoute("/marketing-amsterdam-noord")({
  head: () =>
    seo({
      title: "Marketing bureau Amsterdam-Noord | Van Appiah",
      description:
        "Van Appiah helpt bedrijven in Amsterdam-Noord, Amsterdam en heel Nederland met marketing, social media, branding, websites en online zichtbaarheid.",
      path: "/marketing-amsterdam-noord",
      keywords: [
        "marketing bureau Amsterdam Noord",
        "marketing bureau Amsterdam",
        "social media marketing Amsterdam",
        "social media marketing voor bedrijven",
        "branding voor bedrijven Amsterdam",
        "branding voor bedrijven",
        "marketing voor bedrijven",
        "Van Appiah marketing",
      ],
      jsonLd: [
        serviceSchema(
          "Marketing bureau Amsterdam-Noord",
          "Marketing, social media, branding en online zichtbaarheid voor ondernemers in Amsterdam-Noord, Amsterdam en heel Nederland.",
          "/marketing-amsterdam-noord",
        ),
        faqSchema(faqs),
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Marketing Amsterdam-Noord", path: "/marketing-amsterdam-noord" },
        ]),
      ],
    }),
  component: MarketingAmsterdamNoordPage,
});

function MarketingAmsterdamNoordPage() {
  return (
    <>
      <Section className="pt-16 pb-12 md:pt-24">
        <Eyebrow>Marketing Amsterdam-Noord</Eyebrow>
        <h1 className="mt-6 max-w-5xl text-4xl font-semibold leading-[0.95] tracking-tight sm:text-5xl md:text-7xl">
          Marketing bureau voor ondernemers in Amsterdam-Noord.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          Van Appiah helpt bedrijven met marketing, social media, branding en online zichtbaarheid. Gevestigd in Amsterdam-Noord, actief voor bedrijven in heel Nederland. We zorgen dat uw merk professioneel voelt, herkenbaar wordt en klanten makkelijker de stap naar contact zetten.
          Hoewel Van Appiah gevestigd is in Amsterdam-Noord, werken we voor ondernemers in Amsterdam en door heel Nederland.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/offerte" className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90">
            Start je marketing
          </Link>
          <Link to="/websites-laten-maken-amsterdam-noord" className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-surface">
            Website laten maken
          </Link>
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Social media marketing", "Content en campagnes voor Instagram, TikTok en andere kanalen die passen bij uw doelgroep."],
            ["Branding", "Een herkenbare uitstraling met duidelijke visuals, tone of voice en merkgevoel."],
            ["Online zichtbaarheid", "SEO-basis, lokale landingspagina's en bredere content die klanten helpt u te vinden."],
            ["Website en funnel", "Pagina's die bezoekers niet alleen informeren, maar richting offerte of contact sturen."],
            ["Contentstrategie", "Een duidelijke lijn voor posts, teksten, acties en promoties."],
            ["Groei en optimalisatie", "Meten, bijsturen en verbeteren zodra uw basis staat."],
          ].map(([title, text]) => (
            <article key={title} className="rounded-3xl border border-border bg-surface p-6">
              <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="rounded-[2rem] border border-border p-8 sm:p-10 md:p-14">
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Eyebrow>Aanpak</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
                Marketing begint met een duidelijke basis.
              </h2>
            </div>
            <div className="space-y-5">
              {[
                ["01", "Positionering", "We maken helder wat uw bedrijf aanbiedt en waarom klanten voor u kiezen."],
                ["02", "Content", "We vertalen uw merk naar teksten, visuals en social media posts."],
                ["03", "Conversie", "We koppelen marketing aan een website, offertepagina of contactflow."],
                ["04", "Optimalisatie", "We kijken wat werkt en verbeteren op basis van gedrag en doelen."],
              ].map(([number, title, text]) => (
                <article key={number} className="flex gap-4">
                  <span className="font-mono text-xs text-muted-foreground">{number}</span>
                  <div>
                    <h2 className="font-semibold">{title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-3xl border border-border p-6">
              <h2 className="text-lg font-semibold tracking-tight">{faq.question}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section className="py-12 md:py-20">
        <div className="rounded-[2rem] bg-foreground p-8 text-background sm:p-10 md:p-14">
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
            Wilt u zichtbaarder worden in Amsterdam en daarbuiten?
          </h2>
          <p className="mt-5 max-w-2xl text-background/75">
            Vraag een offerte aan voor marketing, social media, branding of een website die uw marketing sterker maakt in Amsterdam en heel Nederland.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/offerte" className="rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground hover:opacity-90">
              Vraag een offerte aan
            </Link>
            <Link to="/contact" className="rounded-full border border-background/25 px-6 py-3 text-sm font-medium hover:bg-background/10">
              Neem contact op
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
