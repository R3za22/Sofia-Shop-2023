# Sofia Shop

Sofia Shop is a bilingual (English and Persian/FA, right-to-left) furniture and home-decor shop based in Ahvaz. Visitors can browse and filter products, manage a cart, go through checkout and review their orders. Payment is SIMULATED: no real payments are taken or processed.

## Origin

This project began in 2023 as John Smilga's Comfy Store course project, written in vanilla JavaScript. It was rebuilt in 2026 with Vite, React and TypeScript, a typed API client and a new design.

## Run modes

```bash
npm install
npm run dev
```

**Mock mode (default).** Seeded products, cart and orders are kept in localStorage. No server is needed.

- Add `?fail=products,checkout` to the URL to make those operations error. Supported operations: `products`, `product`, `cart`, `checkout`, `orders`.
- Test cards: `4242 4242 4242 4242` succeeds; `4000 0000 0000 0002` is declined.
- Discount codes: `SOFIA10` (10% off) and `NOWRUZ` (fixed discount above a minimum subtotal).

**Live mode.** Copy `.env.example` to `.env.local`, then set `VITE_API_MODE=live` and `VITE_API_BASE_URL` to your API origin. The live adapter calls these REST endpoints:

| Method | Path |
| --- | --- |
| GET | `/products?room&types&colors&minPrice&maxPrice&inStock&q&sort&page&pageSize` |
| GET | `/products/:id` |
| GET | `/cart` |
| POST | `/cart/lines` |
| PATCH | `/cart/lines` |
| DELETE | `/cart/lines` |
| PUT | `/cart/delivery` |
| PUT | `/cart/code` |
| POST | `/checkout` |
| GET | `/orders` |
| GET | `/orders/:id` |
| GET | `/account` |

Errors are returned as JSON in the form `{code, message, fields}`.

## Scripts

| Script | Purpose |
| --- | --- |
| `dev` | Start the Vite development server |
| `build` | Type-check, then build the production app into `dist/` |
| `build:demo` | Type-check, then build the demo into `dist-demo/` |
| `test` | Run unit tests with Vitest |
| `e2e` | Run Playwright end-to-end tests (desktop and mobile) |
| `lint` | Run ESLint on `src` and `e2e` |
| `typecheck` | Run the TypeScript compiler without emitting files |

## Structure

- `src/api`: types, the mock adapter, the live REST adapter and localStorage storage.
- `src/lib`: pure logic (cart, pricing, validation, catalogue), with unit tests.
- `src/mock`: seeded fixtures for the mock adapter.
- `src/i18n`: English and Persian copy and the direction switch.
- `src/pages`: route pages.

## Demo build

`npm run build:demo` writes `dist-demo/`. The demo is served from the base path `/demos/sofia-shop/`, uses hash routing, shows a demo banner and makes no external requests.

## Assets and licences

- Every product picture is an original SVG drawn in `src/components/Illustration.tsx`. No stock photos are used.
- Fonts are Bricolage Grotesque, Figtree and Vazirmatn, all licensed under the SIL Open Font License 1.1 (OFL 1.1), and bundled via `@fontsource`.
- The Persian copy was machine-drafted and needs review by a native speaker.
