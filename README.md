# ResearchPortfolio-UI

Angular frontend for my personal research portfolio: prerendered static pages with hydration, a dark theme built on design tokens, Cloudflare Pages hosting.

## Stack

- Angular 22 (standalone components), prerendered at build time and hydrated in the browser
- Design tokens in `src/styles.scss`; Angular Material only for a few widgets on lazy pages
- Self-hosted fonts (Inter and Outfit, via fontsource) with metric-matched fallbacks
- Pagefind site search, built from the prerendered pages
- Cloudflare Pages (auto-deploys on merge to `main`)

## Companion services

Two self-hosted backend services (auth API and resource/ML API) run on a NAS behind a Cloudflare Tunnel. Their URLs are injected at build time via environment variables and never stored in this repo.

## Development

```bash
yarn install
yarn start      # http://localhost:4200
yarn test       # unit tests
yarn build      # production build -> dist/research-portfolio-ui/browser/
```

The build also regenerates `src/sitemap.xml`, `src/feed.xml` and `src/app/data/image-sizes.ts` from the data files; commit them when they change.

## Checks

CI runs these on every pull request; all of them work locally too.

```bash
yarn ng lint               # TypeScript and template lint
yarn lint:styles           # colors, font sizes and radii must be design tokens; every var(--x) must exist
yarn build                 # fails over the bundle budgets (600 kB initial, 12 kB per component style)
yarn check:pages           # every page under 150 KB raw / 25 KB gzipped, meta descriptions within 160 characters
yarn check:a11y            # axe on every page at 1280 and 320 px (needs: npx playwright install chromium)
npx lhci autorun           # Lighthouse on Home, a case study and a post
```

`node scripts/serve-static.mjs` serves the build the way Cloudflare Pages does (extensionless pages, the `_redirects` rewrites, gzip) for running these by hand.

Dev values are hardcoded in `src/environments/environment.ts`. Production values are injected at CF Pages build time via the env vars below.

## Cloudflare Pages build settings

| Setting          | Value                                |
| ---------------- | ------------------------------------ |
| Build command    | see below                            |
| Output directory | `dist/research-portfolio-ui/browser` |

**Build command** (substitutes `%%PLACEHOLDER%%` tokens in `environment.prod.ts`):

```bash
sed -i "s|%%API_URL%%|$API_URL|g" src/environments/environment.prod.ts \
  && sed -i "s|%%MODEL_API_URL%%|$MODEL_API_URL|g" src/environments/environment.prod.ts \
  && sed -i "s|%%APP_URL%%|$APP_URL|g" src/environments/environment.prod.ts \
  && sed -i "s|%%FASTAPI_API_KEY%%|$FASTAPI_API_KEY|g" src/environments/environment.prod.ts \
  && npm run build
```

**Environment variables (set in Cloudflare Pages dashboard):**

| Variable          | Purpose                                                                   |
| ----------------- | ------------------------------------------------------------------------- |
| `API_URL`         | Auth API base URL                                                         |
| `MODEL_API_URL`   | FastAPI model server base URL                                             |
| `APP_URL`         | Public URL of this app                                                    |
| `FASTAPI_API_KEY` | Backend API key; copy from server `.env` after running `bootstrap_env.sh` |
| `NODE_VERSION`    | `22`                                                                      |
