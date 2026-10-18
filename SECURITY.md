# Security

## Reporting a problem

Please report security problems privately, not in a public issue: open the repository's
**Security** tab on GitHub and choose **Report a vulnerability**. If you cannot use GitHub,
email contact@bishalregmi.com.

Useful to include: the page or URL, what you did, what happened, and your browser.

## Scope

- The site at bishalregmi.com, built from this repository and served by Cloudflare Pages.
- Sign-in at auth.bishalregmi.com. Its code is in a private repository, so report problems
  with accounts or sign-in here.
- The API at api.bishalregmi.com has its own policy in
  [ResearchPortfolio-FastAPI](https://github.com/regmibishal1/ResearchPortfolio-FastAPI/security/policy).

## What the site does with your data

- The pages are static files, prerendered at build time. Reading the site sends nothing to
  any API: project, blog and World Cup data are files on the same site, and site search runs
  in your browser.
- Cloudflare Web Analytics counts visits without cookies.
- Accounts are by invitation. When you sign in, the short-lived access token is kept in
  memory only, and the refresh token is an HttpOnly cookie set by auth.bishalregmi.com that
  page scripts cannot read. The only thing stored in your browser is a `signed_in` flag.
- Once password reset by email is turned on, the reset link is sent through Resend, and the
  token travels in the link's fragment, so it never reaches a server log.
- The hidden `/stocks` page is the only page that calls api.bishalregmi.com. The API key in
  the site's code is not a secret; it only keeps casual bots out.
