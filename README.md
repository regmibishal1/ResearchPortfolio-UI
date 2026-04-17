# ResearchPortfolio-UI

Angular 17 frontend for my personal research portfolio — Angular Material, JWT auth, Cloudflare Pages hosting.

## Stack

- Angular 17 (standalone components) + Angular Material
- RxJS + HTTP interceptor for JWT auth
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

| Setting          | Value                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build command    | `sed -i "s\|%%API_URL%%\|$API_URL\|g" src/environments/environment.prod.ts && sed -i "s\|%%APP_URL%%\|$APP_URL\|g" src/environments/environment.prod.ts && npm run build` |
| Output directory | `dist/research-portfolio-ui/browser`                                                                                                                                      |

**Environment variables (set in CF Pages dashboard):**

| Variable       | Purpose                                               |
| -------------- | ----------------------------------------------------- |
| `API_URL`      | Auth API base URL (e.g. `https://<auth-host>/api/v1`) |
| `APP_URL`      | Public URL of this app                                |
| `NODE_VERSION` | `22`                                                  |
