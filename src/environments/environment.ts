export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api/v1',
  modelApiUrl: 'http://localhost:8000',
  appUrl: 'http://localhost:4200',
  // Sent as X-API-Key to both the AuthAPI and the FastAPI model server.
  // Must match RP_FASTAPI_API_KEY in your local .env (both services share the same key).
  apiKey: 'dev-api-key',
}
