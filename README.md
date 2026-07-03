# ResearchPortfolio-UI

Angular 17 frontend for my personal research portfolio. Angular Material, dark theme, Cloudflare Pages hosting.

## Stack

- Angular 17 (standalone components) + Angular Material
- RxJS + HTTP interceptor for JWT auth and API key headers
- Cloudflare Pages (auto-deploys on merge to `main`)

## Companion services

Two self-hosted backend services (auth API and resource/ML API) run on a NAS behind a Cloudflare Tunnel. Their URLs are injected at build time via environment variables and never stored in this repo.

## Development

```bash
yarn install
yarn start    # http://localhost:4200
yarn test     # headless unit tests
ng build      # production build -> dist/research-portfolio-ui/browser/
```

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
