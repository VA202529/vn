import { createFileRoute, Link } from "@tanstack/react-router";
import { Eyebrow, Section } from "@/components/site/Section";
import { breadcrumbSchema, faqSchema, seo, serviceSchema } from "@/lib/seo";

const faqs = [
  {
    question: "Wat kost een website laten maken in Amsterdam-Noord?",
    answer:
      "De prijs hangt af van het aantal pagina's, het ontwerp, de gewenste functies en of er ook branding, teksten of onderhoud nodig is. Van Appiah maakt altijd een gerichte offerte op basis van uw doel en situatie.",
  },
  {
    question: "Voor welke bedrijven bouwt Van Appiah websites?",
    answer:
      "Wij werken voor lokale ondernemers in Amsterdam-Noord en Amsterdam, maar ook voor salons, kledingmerken, artiesten, servicebedrijven en kleine tot middelgrote ondernemingen door heel Nederland.",
  },
  {
    question: "Kan Van Appiah ook helpen met marketing na de website?",
    answer:
      "Ja. Naast websites helpt Van Appiah met branding, social media marketing, online zichtbaarheid en digitale systemen zodat de website ook onderdeel wordt van groei.",
  },
  {
    question: "Hoe snel kan een website live staan?",
    answer:
      "Een compacte zakelijke website kan vaak relatief snel worden opgeleverd. De exacte planning hangt af van content, feedbackrondes, techniek en eventuele extra functies.",
  },
];

export const Route = createFileRoute("/websites-laten-maken-amsterdam-noord")({
  head: () =>
    seo({
      title: "Website laten maken Amsterdam-Noord | Van Appiah",
      description:
        "Laat een professionele website maken voor je bedrijf in Amsterdam-Noord, Amsterdam of heel Nederland. Van Appiah helpt ondernemers met websites, webshops, branding en marketing.",
      path: "/websites-laten-maken-amsterdam-noord",
      keywords: [
        "website laten maken Amsterdam Noord",
        "webdesigner Amsterdam Noord",
        "website laten maken Amsterdam",
        "website laten maken Nederland",
        "website laten maken voor bedrijf",
        "professionele website laten maken",
        "webdesign voor ondernemers",
      ],
      jsonLd: [
        serviceSchema(
          "Website laten maken Amsterdam-Noord",
          "Professionele websites, webshops en online zichtbaarheid voor ondernemers in Amsterdam-Noord, Amsterdam en heel Nederland.",
          "/websites-laten-maken-amsterdam-noord",
        ),
        faqSchema(faqs),
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Website laten maken Amsterdam-Noord", path: "/websites-laten-maken-amsterdam-noord" },
        ]),
      ],
    }),
  component: WebsitesAmsterdamNoordPage,
});

function WebsitesAmsterdamNoordPage() {
  return (
    <>
      <Section className="pt-16 pb-12 md:pt-24">
        <Eyebrow>Amsterdam-Noord</Eyebrow>
        <h1 className="mt-6 max-w-5xl text-4xl font-semibold leading-[0.95] tracking-tight sm:text-5xl md:text-7xl">
          Website laten maken in Amsterdam-Noord.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          Van Appiah bouwt professionele websites voor ondernemers in Amsterdam-Noord, Amsterdam en heel Nederland. Denk aan bedrijven, salons, kledingmerken, artiesten en dienstverleners die online betrouwbaar, modern en makkelijk bereikbaar willen zijn.
          Hoewel Van Appiah gevestigd is in Amsterdam-Noord, werken we voor ondernemers in Amsterdam en door heel Nederland.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/offerte" className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90">
            Vraag een offerte aan
          </Link>
          <Link to="/portfolio" className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-surface">
            Bekijk projecten
          </Link>
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Een website moet vertrouwen opbouwen voordat iemand contact opneemt.
            </h2>
            <p className="mt-5 text-muted-foreground">
              Klanten zoeken eerst online. Een trage, onduidelijke of verouderde website kan aanvragen kosten. Daarom bouwen wij websites die snel laden, duidelijk vertellen wat u doet en bezoekers soepel naar contact of offerte leiden.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Zakelijke websites", "Heldere sites voor bedrijven die professioneel willen overkomen."],
              ["Webshops", "Online verkoop voor merken, retail en lokale producten."],
              ["Branding", "Logo, stijl en merkgevoel dat past bij uw doelgroep."],
              ["SEO-basis", "Structuur, metadata en teksten gericht op lokale vindbaarheid en bredere landelijke zoekwoorden."],
            ].map(([title, text]) => (
              <article key={title} className="rounded-3xl border border-border bg-surface p-6">
                <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="rounded-[2rem] border border-border p-8 sm:p-10 md:p-14">
          <Eyebrow>Waarom Van Appiah</Eyebrow>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[
              ["Lokale basis", "Wij begrijpen de snelheid en directheid van ondernemers in Amsterdam-Noord en bouwen tegelijk voor bedrijven door heel Nederland."],
              ["Luxe uitstraling", "Minimalistisch design dat serieus, modern en betrouwbaar voelt."],
              ["Groei na livegang", "Naast webdesign helpen we met marketing, content en optimalisatie."],
            ].map(([title, text]) => (
              <article key={title}>
                <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
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
            Klaar voor een professionele website?
          </h2>
          <p className="mt-5 max-w-2xl text-background/75">
            Start met een korte aanvraag. Dan kijken we welke website, webshop of online strategie het beste past bij uw bedrijf.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/offerte" className="rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground hover:opacity-90">
              Laat je website maken
            </Link>
            <Link to="/contact" className="rounded-full border border-background/25 px-6 py-3 text-sm font-medium hover:bg-background/10">
              Plan een kennismaking
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
