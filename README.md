# ResearchPortfolio-UI

Angular 17 frontend for my personal research portfolio.
Live at **[bishalregmi.com](https://bishalregmi.com)**.

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

## Development

```bash
yarn install
yarn start              # http://localhost:4200
yarn test               # unit tests (headless)
ng build                # production build -> dist/research-portfolio-ui/browser/
```

Dev uses `http://localhost:8080/api/v1` for the auth API.
Production API URL is injected at build time by Cloudflare Pages via the `API_URL` environment variable (substituted into `src/environments/environment.prod.ts`).

## Cloudflare Pages build settings

| Setting          | Value                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Build command    | `sed -i "s\|%%REPLACE_ME%%\|$API_URL\|g" src/environments/environment.prod.ts && npm run build` |
| Output directory | `dist/research-portfolio-ui/browser`                                                            |
| Node version     | `20`                                                                                            |

**Environment variables to set in CF Pages dashboard:**

| Variable       | Value                                 |
| -------------- | ------------------------------------- |
| `API_URL`      | `https://auth.bishalregmi.com/api/v1` |
| `NODE_VERSION` | `20`                                  |
