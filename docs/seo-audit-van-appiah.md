# SEO-audit Van Appiah

## Samenvatting

Van Appiah is geoptimaliseerd voor lokale vindbaarheid rond Amsterdam-Noord, webdesign, websites, webshops, marketing, branding en social media marketing. De belangrijkste verbetering is dat de website nu aparte lokale SEO-landingspagina's heeft voor `website laten maken Amsterdam Noord` en `marketing bureau Amsterdam Noord`.

## Problemen Die Zijn Aangepakt

- De homepage had een te algemene H1 en communiceerde niet direct de lokale propositie.
- Er waren geen aparte lokale SEO-pagina's voor Amsterdam-Noord.
- Metadata was per pagina beperkt en miste canonical, Open Graph, Twitter Cards en JSON-LD.
- `robots.txt` en `sitemap.xml` ontbraken.
- Footer en navigatie hadden te weinig interne links naar lokale SEO-pagina's.
- Copy was meer algemeen digitaal dan gericht op klanten die zoeken naar websites, marketing en online groei.

## Nieuwe SEO-structuur

| Pagina | Focus keyword | SEO title |
| --- | --- | --- |
| `/` | websites en marketing Amsterdam-Noord | Websites en marketing Amsterdam-Noord \| Van Appiah |
| `/diensten` | website voor bedrijf laten maken | Diensten voor websites, marketing en branding \| Van Appiah |
| `/websites-laten-maken-amsterdam-noord` | website laten maken Amsterdam Noord | Website laten maken Amsterdam-Noord \| Van Appiah |
| `/marketing-amsterdam-noord` | marketing bureau Amsterdam Noord | Marketing bureau Amsterdam-Noord \| Van Appiah |
| `/portfolio` | portfolio webdesign Amsterdam | Portfolio webdesign en digitale projecten \| Van Appiah |
| `/producten` | digitale oplossingen ondernemers | Producten en digitale oplossingen \| Van Appiah |
| `/over` | Van Appiah / VA websites | Over Van Appiah \| Webdesign en marketing Amsterdam-Noord |
| `/contact` | contact Van Appiah | Contact Van Appiah \| Website en marketing Amsterdam-Noord |
| `/offerte` | offerte website laten maken | Offerte aanvragen voor website of marketing \| Van Appiah |

## Structured Data

Toegevoegd via `src/lib/seo.ts`:

- `Organization`
- `WebSite`
- `LocalBusiness`
- `ProfessionalService`
- `Service`
- `BreadcrumbList`
- `FAQPage` op lokale SEO-pagina's

## Sitemap

De sitemap staat in `public/sitemap.xml` en bevat:

- Home
- Diensten
- Websites laten maken Amsterdam-Noord
- Marketing Amsterdam-Noord
- Portfolio
- Producten
- Over
- Contact
- Offerte

Product- en portfolio-detailpagina's zijn dynamisch vanuit Google Sheets. Voor maximale SEO kunnen die later in een server-generated sitemap worden opgenomen zodra de live host build-time of runtime sitemapgeneratie ondersteunt.

## Robots

`public/robots.txt` laat indexatie toe en verwijst naar de sitemap:

```txt
User-agent: *
Allow: /

Sitemap: https://vanappiah.com/sitemap.xml
```

## Interne Linkstructuur

- Homepage linkt naar `/websites-laten-maken-amsterdam-noord`, `/marketing-amsterdam-noord`, `/portfolio`, `/offerte` en `/contact`.
- Header bevat directe links naar websites en marketing.
- Footer bevat lokale SEO-links met natuurlijke anchor teksten.
- Productdetailpagina's linken naar offerte/contact via CTA.
- Portfolio en producten blijven onderling via cached detailroutes verbonden.

## Copy-Richting

De copy is aangescherpt naar:

- professioneel en lokaal
- helder over websites, webshops, branding en marketing
- gericht op ondernemers in Amsterdam-Noord
- conversiegericht met CTA's zoals `Vraag een offerte aan`, `Bekijk projecten`, `Plan een kennismaking`

## Testchecklist Voor Google

- Controleer `https://vanappiah.com/robots.txt`.
- Controleer `https://vanappiah.com/sitemap.xml`.
- Test pagina's met Google Rich Results Test.
- Controleer canonical tags in de HTML-bron.
- Controleer of elke pagina exact een duidelijke H1 heeft.
- Controleer in Google Search Console of sitemap succesvol wordt gelezen.
- Inspecteer `/websites-laten-maken-amsterdam-noord` en `/marketing-amsterdam-noord` met URL-inspectie.
- Test mobile usability en Core Web Vitals.
- Controleer Open Graph preview met een social sharing debugger.
- Controleer dat afbeeldingen lazy laden en een beschrijvende alt tekst hebben.
