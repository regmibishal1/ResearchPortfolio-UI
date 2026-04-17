# ResearchPortfolio-UI

Angular 17 frontend for my personal research portfolio.
Live at **[bishalregmi.com](https://www.bishalregmi.com)**.

Displays past projects, research work, and (eventually) interactive model demos backed by the FastAPI service.

## Stack

- Angular 17 (standalone components) + Angular Material
- RxJS + HTTP interceptor for JWT auth
- Cloudflare Pages for hosting (auto-deploys on merge to `main`)

## Companion services

| Service                   | Repo                        | Hostname               |
| ------------------------- | --------------------------- | ---------------------- |
| Auth API (Spring Boot)    | `ResearchPortfolio-AuthAPI` | `auth.bishalregmi.com` |
| Resource/ML API (FastAPI) | `ResearchPortfolio-FastAPI` | `api.bishalregmi.com`  |

Both self-hosted on a NAS via Cloudflare Tunnel.

## Environment variables

The production build substitutes two placeholders in `src/environments/environment.prod.ts` at build time:

| Placeholder   | Env var   | Example value                         |
| ------------- | --------- | ------------------------------------- |
| `%%API_URL%%` | `API_URL` | `https://auth.bishalregmi.com/api/v1` |
| `%%APP_URL%%` | `APP_URL` | `https://www.bishalregmi.com`         |

Dev values are hardcoded in `src/environments/environment.ts` and never substituted.

## Development

```bash
yarn install
yarn start    # http://localhost:4200 — uses environment.ts (no substitution needed)
yarn test     # headless unit tests
ng build      # production build -> dist/research-portfolio-ui/browser/
```

## Cloudflare Pages build settings

| Setting          | Value                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build command    | `sed -i "s\|%%API_URL%%\|$API_URL\|g" src/environments/environment.prod.ts && sed -i "s\|%%APP_URL%%\|$APP_URL\|g" src/environments/environment.prod.ts && npm run build` |
| Output directory | `dist/research-portfolio-ui/browser`                                                                                                                                      |

**Environment variables to set in CF Pages dashboard (Production):**

| Variable       | Value                                 |
| -------------- | ------------------------------------- |
| `API_URL`      | `https://auth.bishalregmi.com/api/v1` |
| `APP_URL`      | `https://www.bishalregmi.com`         |
| `NODE_VERSION` | `20`                                  |

For a staging environment, override `APP_URL` and `API_URL` with staging values in the CF Pages Preview environment settings.
