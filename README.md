# ResearchPortfolio-UI

Angular 17 frontend for my personal research portfolio.
Live at **[regmibishal1.github.io/ResearchPortfolio-UI](https://regmibishal1.github.io/ResearchPortfolio-UI/)**.

Displays past projects, research work, and (eventually) interactive model demos backed by the FastAPI service.

## Stack

- Angular 17 (standalone components) + Angular Material
- RxJS + HTTP interceptor for JWT auth
- GitHub Pages for hosting (auto-deploys on merge to `main`)

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
yarn test               # CI-mode unit tests
ng build                # production build -> dist/
```

Dev uses `http://localhost:8080/api/v1` for the auth API.
Production uses `https://auth.bishalregmi.com/api/v1` — configured in `src/environments/environment.prod.ts`.

## Deploy

Pushing to `main` triggers the GitHub Pages deploy via the workflow in `.github/workflows`.
Manual deploy fallback:

```bash
ng deploy --base-href="https://regmibishal1.github.io/ResearchPortfolio-UI/"
```
