# Google Apps Script performance endpoints

De frontend ondersteunt nu lichte endpoints naast de oude `getSiteData` fallback. Voeg deze acties toe aan de Apps Script Web App om producten, portfolio en offerte direct sneller te laten laden.

## Acties

| Actie | Doel | Response |
| --- | --- | --- |
| `getInitialSiteData` | Eerste render van homepage/header/footer | `bedrijfsgegevens`, eerste producten, eerste portfolio-items |
| `getProductsPage` | Producten gefaseerd laden | `items`, `offset`, `limit`, `total`, `hasMore`, `nextOffset` |
| `getPortfolioPage` | Portfolio gefaseerd laden | `items`, `offset`, `limit`, `total`, `hasMore`, `nextOffset` |
| `getQuoteOptions` | Alleen productopties voor offerteformulier | `items: [{ id, titel }]` |
| `getProductDetail` | Licht productdetail zonder Drive-images | `item` |
| `getPortfolioDetail` | Licht portfoliodetail zonder Drive-images | `item` |

## Response voorbeelden

### getInitialSiteData

```json
{
  "ok": true,
  "bedrijfsgegevens": {},
  "producten": [],
  "portfolio": []
}
```

Gebruik hier maximaal 2 tot 4 producten en 2 tot 4 portfolio-items.

### getProductsPage

```json
{
  "ok": true,
  "items": [],
  "offset": 0,
  "limit": 6,
  "total": 24,
  "hasMore": true,
  "nextOffset": 6
}
```

### getPortfolioPage

```json
{
  "ok": true,
  "items": [],
  "offset": 0,
  "limit": 6,
  "total": 24,
  "hasMore": true,
  "nextOffset": 6
}
```

### getQuoteOptions

```json
{
  "ok": true,
  "items": [
    { "id": "webshop-rest-api", "titel": "Webshop REST API" }
  ]
}
```

### getProductDetail / getPortfolioDetail

```json
{
  "ok": true,
  "item": {
    "id": "PRD-...",
    "titel": "Productnaam",
    "slug": "productnaam",
    "driveFolderId": "...",
    "images": []
  }
}
```

Detail endpoints lezen alleen de relevante sheet en halen geen Drive-images op.

## Query parameters

`getProductsPage` en `getPortfolioPage` krijgen:

```txt
offset=0
limit=6
```

Gebruik in Apps Script veilige defaults:

```js
const offset = Math.max(0, Number(e.parameter.offset || 0));
const limit = Math.min(12, Math.max(1, Number(e.parameter.limit || 6)));
```

## Caching

Gebruik `CacheService.getScriptCache()` voor GET endpoints.

Aanbevolen keys:

```txt
initial:v1
products:0:6:v1
portfolio:0:6:v1
quote-options:v1
```

Aanbevolen TTL:

```txt
300 seconden
```

Leeg of versioneer caches wanneer sheetdata wordt aangepast. De simpelste aanpak is een `CACHE_VERSION` verhogen:

```js
const CACHE_VERSION = 'v1';
```

## Apps Script schets

```js
function doGet(e) {
  const action = e.parameter.action || 'getInitialSiteData';

  if (action === 'getInitialSiteData') return jsonCached('initial', 300, () => getInitialSiteData_());
  if (action === 'getProductsPage') return jsonCached(`products:${e.parameter.offset || 0}:${e.parameter.limit || 6}`, 300, () => getProductsPage_(e));
  if (action === 'getPortfolioPage') return jsonCached(`portfolio:${e.parameter.offset || 0}:${e.parameter.limit || 6}`, 300, () => getPortfolioPage_(e));
  if (action === 'getQuoteOptions') return jsonCached('quote-options', 300, () => getQuoteOptions_());
  if (action === 'getProductDetail') return jsonCached(`product-detail:${e.parameter.id || e.parameter.slug || ''}`, 300, () => getProductDetail_(e));
  if (action === 'getPortfolioDetail') return jsonCached(`portfolio-detail:${e.parameter.id || e.parameter.slug || ''}`, 300, () => getPortfolioDetail_(e));
  if (action === 'getSiteData') return jsonCached('site-data', 300, () => getSiteData_());

  return json({ ok: false, message: 'Onbekende actie' });
}

function jsonCached(key, seconds, producer) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `${key}:${CACHE_VERSION}`;
  const cached = cache.get(cacheKey);
  if (cached) return output_(cached);

  const data = producer();
  const body = JSON.stringify(data);
  cache.put(cacheKey, body, seconds);
  return output_(body);
}

function json(data) {
  return output_(JSON.stringify(data));
}

function output_(body) {
  return ContentService
    .createTextOutput(body)
    .setMimeType(ContentService.MimeType.JSON);
}
```

Als de bestaande webapp JSONP ondersteunt, laat `callback` intact:

```js
function outputWithJsonp_(body, e) {
  const callback = e && e.parameter && e.parameter.callback;
  const payload = callback ? `${callback}(${body});` : body;
  return ContentService
    .createTextOutput(payload)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}
```

## Belangrijk

- Lees voor `getQuoteOptions` alleen de product-sheet en alleen de kolommen `id`, `slug`, `titel`.
- Lees voor `getInitialSiteData` alleen bedrijfsgegevens plus de eerste actieve rijen uit producten en portfolio.
- Lees niet alle sheets bij elke request.
- Map alleen velden die de frontend echt gebruikt.
- Gebruik thumbnails voor Drive-afbeeldingen.
- Houd de oude `getSiteData` nog beschikbaar als fallback.
