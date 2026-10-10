export const environment = {
  production: true,
  apiBaseUrl: '%%API_URL%%',
  modelApiUrl: '%%MODEL_API_URL%%',
  appUrl: '%%APP_URL%%',
  // Replaced at Cloudflare Pages build time via the FASTAPI_API_KEY env var.
  // Sent as X-API-Key to both the AuthAPI and the FastAPI model server.
  // Set under: Pages > researchportfolio-ui > Settings > Environment Variables
  //   FASTAPI_API_KEY = <value of RP_FASTAPI_API_KEY from .env>
  apiKey: '%%FASTAPI_API_KEY%%',
  features: {
    // Accounts are by invitation; the sign-up form stays hidden while false.
    registration: false,
    // "Forgot your password?" on the sign-in page. Turn on once the AuthAPI
    // can send mail (RESEND_API_KEY set and the sending domain verified).
    passwordResetEmail: false,
  },
}
