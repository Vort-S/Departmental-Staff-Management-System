# DSMS: sign-in feedback and visual refresh

## Issues addressed

1. **Silent/generic sign-in failures:** The server previously returned the same generic message for invalid password, unverified or unapproved accounts, throttling, origin rejection and unexpected errors. The client also refreshed the router *before* navigation after successful login. This prevented effective diagnosis and could show a stale login view.
2. **Lifeless public pages:** The landing page showed only a simulated empty table and text, with little editorial hierarchy or photography. Login/register forms had an all-card layout with no contextual imagery.
3. **Internal explanatory labels:** Removed “Faithful interface recreation · no sample staff data” and “Accounts are verified and approved before access is granted.” Also shortened account-page copy and generic table empty-state text.

## Changes

- Login errors: distinct, useful messages for malformed input, wrong credentials, account awaiting approval, email not verified, temporary account lock, sign-in rate limit, origin mismatch and unexpected service error. Account-state messages are only exposed **after successful password verification**; wrong-password and unknown-account responses remain indistinguishable.
- Login UI: inline alert with accessible live region, field-specific validation, submit pending indicator, password visibility toggle. On successful login, the client confirms the secure session cookie by calling the existing `/api/session/csrf` endpoint, then performs a full navigation to `/dashboard`. Already-authenticated visits to `/login` redirect to the dashboard.
- Unexpected sign-in errors are logged on the server with a stable diagnostic label and error type only; no passwords, email addresses or session tokens are logged.
- Landing page: stronger headline, one clear primary CTA, campus photograph behind an accurate representation of the actual staff directory's empty state, and improved feature hierarchy. Account pages use a real university collaboration photo as a secondary visual on desktop and remain single-column on mobile.
- UI system: hero, feature, and dashboard surfaces, active navigation, refreshed empty state, clean mobile layouts and familiar blue/neutral palette. Sensitive staff details are **never represented by stock images**.
- Next/Image: responsive sizes, priority for above-fold images, WebP/AVIF optimization via Next.js and fallback on failure. No new NPM dependencies.
- Updated E2E selectors and added a public validation/visibility test. 

## Validation

- Syntax-only: 66 source/test TypeScript and TSX files parsed with TypeScript successfully.
- CSS: parsed with PostCSS successfully.
- Offline Node smoke suite: 6/6 checks passed (security/permissions/date/csv/session arithmetic).
- Color contrast sampled: canvas body 14.36:1, muted-on-white 6.06:1, white-on-primary 7.36:1.

**Not verified:** npm dependency installation, full `next build`, real browser or Lighthouse testing, Resend/Neon end-to-end flows, CDN image loading or a new Vercel deployment. Nothing in this package has been pushed to the remote GitHub repository or redeployed. The live application is unchanged until the source changes are merged and Vercel builds them.

## Assets and input

Photos sourced from Unsplash; see `PHOTO-SOURCES.md` for URLs/licensing. These are editorial imagery, not specific university personnel. For institutional branding, supply an official logo, department-approved campus photos and (if desired) permission-cleared product screenshots.

## Safe deployment

1. Merge the changes on a branch in the actual GitHub repository, keeping its current `.env` settings and production fixes.
2. Run `npm install`, `npm run typecheck`, `npm run test` and `npm run build` in an environment with npm access; run E2E tests against an isolated **test** database.
3. Deploy a Vercel preview. Verify invalid credentials produce a visible message, a correct administrator login persists its session, `/dashboard` loads, and the photographic hero renders with no layout shift.
4. Merge to `main` and let production deploy. No database migration is required for this visual/sign-in change.
