# Deployment runbook — Neon + Vercel

**Current state (16 November 2026):** A Neon PostgreSQL 17 project `university-dsms-semi-project` was actually created in `aws-us-east-1`, with `production` (default), `development` and `test` branches. Database schemas have **not yet been migrated**, no sample data has been seeded and no Vercel deployment has been published. Do not imply the application is live. Connection credentials are intentionally not stored in the repository or this document.

## 1. Provision Neon databases (completed)

Open https://console.neon.tech and locate `university-dsms-semi-project`. Confirm production, development and test branches exist and are writable. A Neon branch is a copy-on-write isolated branch, not a separate account. Under each branch choose the `dsms` database and obtain:

- **Pooled URL** (hostname typically includes `-pooler`) → `DATABASE_URL` for Next.js runtime.
- **Direct URL** (non-pooler hostname) → `DATABASE_URL_UNPOOLED` for Drizzle Kit migrations and restore/admin work.

Never paste either URL into source or chat logs. Use a restricted application role if supported; keep migration credentials separate. Production and preview must have distinct secrets and database branches. For feature-preview branches use a temporary Neon branch and **never** clone real PII into public test environments.

## 2. Local development

1. Clone/download repository, install Node.js 22+, `npm install` (then commit the generated `package-lock.json` once reviewed).
2. Copy `.env.example` to `.env.local`; configure development URLs, `APP_URL=http://localhost:3000`, `SESSION_SECRET`, `FIELD_ENCRYPTION_KEY`, allowed external URL hosts, email provider, and seed-only secrets.
3. Create independent secret keys using `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"` twice; store safely. Use a third/different set for test and production.
4. Apply migration: `npm run db:migrate`. Check actual schema constraints and append-only audit trigger in Neon SQL editor.
5. Run `npm run db:seed` on **development only**. Log into sample accounts using env-provided passwords; first login forces password change. NEVER set real staff information in the sample dataset.
6. Run `npm run dev`, inspect `/api/health`, manually verify registration email, admin approval, profile, course allocation and leave decision.

The checked-in SQL migration is a manual Drizzle-compatible baseline and has a journal. It must be validated by the first actual `drizzle-kit migrate`. There is **no Drizzle snapshot** for this manually authored baseline; before evolving the schema, generate/normalize the baseline with a locally installed Drizzle Kit version, review the SQL diff, and test in a cloned disposable branch. Never run `drizzle-kit push` against production.

## 3. Environment variables

| Variable | Purpose | Required in prod |
|---|---|---|
| `DATABASE_URL` | Pooled Neon runtime database | Yes |
| `DATABASE_URL_UNPOOLED` | Direct Neon migration URL, CI only (not needed by running app) | Migration pipeline |
| `SESSION_SECRET` | 32+ cryptographically random bytes encoded base64 (HMAC signing) | Yes |
| `FIELD_ENCRYPTION_KEY` | Exactly 32 random bytes base64 (AES-GCM) | Yes |
| `APP_URL` | **Exact HTTPS origin** of deployed app; enforced for CSRF | Yes |
| `RESEND_API_KEY` / `MAIL_FROM` | Resend API token and verified sender domain | Yes |
| `ALLOWED_URL_HOSTS` | Comma-separated exact hostnames for reference URLs | Yes |
| `SEED_*_PASSWORD` | Seed-only passwords (never production app variables) | No |
| `TEST_DATABASE_URL` / `INTEGRATION_TESTS_ACK` | Dedicated integration testing | Test job only |
| `E2E_MODE` | Dev-only simulated email transport (never use on prod) | **Never** |

`src/instrumentation.ts` and `src/lib/env.ts` validate required runtime secrets before serving requests. No secret values may be surfaced in logs, client bundles or documentation. No `.env.local` or `.env` is included in the deliverable.

## 4. Vercel setup

1. Create a PRIVATE GitHub repository, commit the application and a reviewed lockfile. Import it as a new Next.js project in https://vercel.com/dashboard.
2. Build: Next.js auto-detected; Node.js version 22; install command `npm install` (prefer `npm ci` once lockfile committed); output default `.next`. Framework config and security headers are in `next.config.ts`, `src/proxy.ts` and `vercel.json`.
3. In Vercel Project → Settings → Environment Variables, add a **separate** collection for `Production`, `Preview`, `Development`. Production uses the `production` Neon branch; develop/preview uses `development` or temporary preview branch. Set `APP_URL` to each deployment origin. For wildcard preview URLs with rotating hostnames, configure stable preview aliases or unique APP_URL per preview; Origin checks intentionally fail closed on mismatch.
4. Verify Resend domain ownership (DNS SPF/DKIM) and set `MAIL_FROM` on that domain. Test actual email verification and password reset to inboxes you control.
5. Connect Git branch `main` to production; other branches produce Vercel previews. Disable public deployment source maps and set Vercel authentication for restricted previews if they hold confidential data.
6. Before promoting, run migrations **against that exact branch** using `DATABASE_URL_UNPOOLED` from a secure CI job. Do not run demo seeding on production.
7. Push to main only after all checks pass. `vercel.json` and the Proxy enforce response headers; Vercel terminates HTTPS automatically.
8. Review live `/api/health`, login/registration, CSP browser console, session cookies, permissions, report export and admin audit. Record the deployed URL and change-management ticket when available.

### Custom domain and HTTPS

Add the domain in Vercel Project → Domains, configure DNS as Vercel instructs, wait for SSL issuance, change `APP_URL` to `https://your-domain.example`, verify email links and Origin checks, then enforce HSTS and canonical redirects. Do not enable HSTS preload until all subdomains support HTTPS.

## 5. CI/CD

`.github/workflows/ci.yml` defines:

- `quality`: dependency installation, ESLint, TypeScript, Vitest unit tests, `npm audit --audit-level=high`, upload evidence.
- `integration-and-e2e`: migrate and seed **test** branch, prepare fake logins, Vitest integration and Playwright Chromium desktop/mobile viewports, upload evidence.
- `deploy`: only on passing `main` push; uses `vercel pull`, `vercel build --prod`, `vercel deploy --prebuilt --prod` with Vercel secrets.

Create GitHub Actions secrets `NEON_TEST_DATABASE_URL`, `NEON_TEST_DATABASE_URL_UNPOOLED`, `TEST_SESSION_SECRET`, `TEST_FIELD_ENCRYPTION_KEY`, `SEED_ADMIN_PASSWORD`, `SEED_HOD_PASSWORD`, `SEED_STAFF_PASSWORD`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`. Secrets for production are stored in Vercel settings; do not copy them into test jobs. Use GitHub branch protection to require both quality and integration/E2E jobs. Add a package lock and change install steps to `npm ci` for deterministic builds.

**Important:** The deployment job assumes the GitHub repository is linked to an existing Vercel project and Vercel secrets configured; these are **not set** by the generated repository. The CI setup must be dry-run on a disposable repository before use.

## 6. Backups, recovery and rollback

- Review Neon's actual branch point-in-time recovery window and plan limits in the Neon console. The project's reported initial history retention is six hours, **not a substitute for an independently verified long-term recovery strategy**.
- Take a protected snapshot/branch immediately before migrations. Check permission boundaries on backups and clones; snapshots contain the same PII as primary storage.
- Restore procedure: block writes/put app in maintenance → identify recovery timestamp → Neon create recovery branch or perform PITR in console → validate schema/account counts and encrypted-field decryption **in an isolated branch** → switch Vercel DATABASE_URL to recovered branch → validate `/api/health`, login, permission checks → resume writes → audit the incident.
- Code rollback: in Vercel Deployments, promote a previous known-good deployment. **Rolling back code does not reverse a database migration.** Prefer forward-fix (additive) migrations, or a recovery branch. Always verify schema compatibility before redeploy.
- Migration down: `drizzle/0000_initial.down.sql` removes all data and is permitted **only on a disposable branch with explicit authorization**; do not run it on production. Test up/down in a branch cloned specifically for this experiment.
- Key rotation: run `npx tsx scripts/rotate-key.ts` with `OLD_FIELD_ENCRYPTION_KEY`, `NEW_FIELD_ENCRYPTION_KEY`, and DB access in a tightly controlled maintenance window. Re-encryption is transactional; update active key in Vercel after success. Do not delete the old key before verifying recovery.

## 7. Monitoring and operations

Use `/api/health` for DB availability (200 healthy; 503 unavailable), Vercel Logs for operational exceptions, and Vercel Analytics / Speed Insights or Sentry for monitored latency, errors and availability. Do not send staff personal data, raw URL tokens, request bodies or passwords to third-party monitoring. Rotate credentials, clean up expired sessions/tokens/rate-limit records by a scheduled serverless job, review admin audit logs, and alert on repeated authentication failures, suspicious access attempts, export bursts, token/recovery errors and backup failures. Test restore periodically.

## 8. Production go/no-go checklist

- [ ] `npm install`, reproducible lockfile, lint/typecheck and production build pass
- [ ] Drizzle migration applied to test and production branches with integrity checks
- [ ] Unit, Neon integration and Playwright suites pass (no skipped security-critical cases)
- [ ] npm audit remediated; deliberate exceptions documented
- [ ] Tested verification emails, reset-token reuse/expiry, and account activation
- [ ] Tested least privilege / IDOR / CSRF / CSP / CSV export via an independent reviewer
- [ ] Verified correct origin, cookies, keys and HTTPS domain
- [ ] Measured Lighthouse scores and database p95 latency
- [ ] Performed point-in-time restore rehearsal in a throwaway branch
- [ ] Staff PII retention / access / incident response approved by the institution
