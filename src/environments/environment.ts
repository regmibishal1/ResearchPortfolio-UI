export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api/v1',
  modelApiUrl: 'http://localhost:8000',
  appUrl: 'http://localhost:4200',
  // Sent as X-API-Key to both the AuthAPI and the FastAPI model server.
  // Must match RP_FASTAPI_API_KEY in your local .env (both services share the same key).
  apiKey: 'dev-api-key',
  features: {
    // Accounts are by invitation; the sign-up form stays hidden while false.
    registration: false,
    // "Forgot your password?" on the sign-in page. Turn on once the AuthAPI
    // can send mail (RESEND_API_KEY set and the sending domain verified).
    passwordResetEmail: false,
  },
}
