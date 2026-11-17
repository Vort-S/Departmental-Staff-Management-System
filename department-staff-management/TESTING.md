# Testing: plan, automation and verified evidence

## Actual result status (16 November 2026)

**NOT RUN:** npm registry DNS resolution failed in the authoring environment, and no application dependencies, independent Neon test connection strings, browser binaries or production host were available for execution. Six narrowly scoped Node offline smoke checks **were executed and passed** (U03–U08): AES-GCM tampering, authorization decisions, leave arithmetic, teaching load, CSV formula neutralization and session expiry. This is real smoke execution of production TypeScript helpers loaded through a local TypeScript transpiler, **not** Vitest, DB integration, browser, dependency audit, type checking or Lighthouse. No results from those unrun suites have been fabricated. The TypeScript/TSX files were parsed for **syntax** using locally installed TypeScript (69 source files checked, zero parse diagnostics); this is **not** a build or type-check pass. The public `/testing` page reads `test-results/latest.json`, containing these six real smoke executions while marking unexecuted suites as `NOT RUN`.

## Execute tests against dedicated Neon test branch

0. Run `npm run test:smoke` to reproduce the narrow no-database smoke evidence.
1. Set `DATABASE_URL` and `DATABASE_URL_UNPOOLED` for the `test` branch; set `TEST_DATABASE_URL` to the same test branch only in Playwright E2E (for integration Vitest, use a distinct dummy `DATABASE_URL` and the real test branch in `TEST_DATABASE_URL`). Use **separate** `SESSION_SECRET` and `FIELD_ENCRYPTION_KEY` from production; configure `APP_URL=http://localhost:3000`.
2. `npm install && npx playwright install chromium`; `npm run db:migrate`; set fake `SEED_*_PASSWORD`; `npm run db:seed`.
3. Set `E2E_MODE=true` and run `npx tsx scripts/prepare-e2e.ts` **only** on that isolated test branch. This avoids first-login credential changes interfering with E2E fixture passwords; forced-password-change needs independent manual verification. This test-only mail transport does **not** test Resend delivery or email link click-through.
4. `npm run test:unit`; then set `INTEGRATION_TESTS_ACK=YES`, a distinct `DATABASE_URL` placeholder and `TEST_DATABASE_URL` to the test branch; `npm run test:integration`. Database integration tests roll back changes within transactions.
5. Reset `DATABASE_URL` to test branch; run `npm run test:e2e` (Playwright starts Next dev). Run `npm run test:report` to parse Vitest/Playwright JSON into `test-results/latest.json`.
6. Check actual failing/skipped/unimplemented IDs on `/testing`; commit the machine-generated JSON evidence only after reviewing test artifacts. Run `npm audit --audit-level=high` and record advisory count (and remediation) below.

**Do not point tests at production.** The GitHub Actions job uses an isolated Neon test branch and requires explicit secrets. Tests share a single fake dataset and are sequential; parallel execution may trigger legitimate rate limiting or change state unexpectedly.

## Automated suite inventory

| ID(s) | Category | Test intent | Source / status |
|---|---|---|---|
| U01 | Unit | Zod unknown field, staff ID, weak password, invalid date and search sort | `tests/unit/validators.test.ts` / NOT RUN |
| U02–U03 | Unit | Argon2id, AES-GCM tamper, HMAC digest | Vitest **NOT RUN**; U03 offline-smoke **PASSED** |
| U04–U08 | Unit | RBAC, sensitive field access, HOD separation, leave, workload, CSV safety, expiry | Vitest **NOT RUN**; U04–U08 offline-smoke **PASSED** |
| I02–I05 | Integration | Neon-session/storage, staff/course assignment, leave history, uniqueness | `tests/integration/db.test.ts` / NOT RUN |
| E01–E07 | E2E | Browser login, onboarding with provider verification fixture, directory, leave, authorization, export and mobile | `tests/e2e/flows.spec.ts` / NOT RUN |
| S02–S05, S07 | Security | XSS, IDOR, CSRF, tampered cookies, security headers, SQL payload search | Unit/E2E / NOT RUN |
| X01 | Error | Unknown-route 404 | Playwright / NOT RUN |
| Additional IDs | Regression design | Rate-limit saturation, 500/DB loss, migration down/up, advanced attendance/usability | **Manual or not yet automated** |

IDs absent from an actual test report remain `NOT RUN`. Automated source coverage does not justify a `PASSED` label without a matching executed record. `scripts/collect-results.ts` reads test output and assigns PASS/FAIL/SKIP only from the runner, not from code inspection. Multiple cases may use the same ID; in review, inspect every assertion rather than treating a single passing assertion as complete coverage.

## Security and negative-testing checklist (manual and automated expansion)

- [ ] Attempt staff A → staff B private fields, leave history, appraisal, and cross-department IDs (403 or no data)
- [ ] Forge `role: ADMIN` in profile JSON / URL; server rejects unknown fields or ignores role attempts
- [ ] HOD approves own leave; server must reject, with unchanged leave history
- [ ] Inject `'; DROP TABLE staff_profiles; --` into directory query; no SQL execution
- [ ] Store `<img src=x onerror=alert(1)>` in qualifications and memo; render as escaped text
- [ ] Reuse reset token and submit expired token; second attempt rejected
- [ ] Tamper session cookie; reject without authorization
- [ ] POST logout with foreign Origin or missing/invalid `x-csrf-token`; return 403
- [ ] Trigger login rate limit with an isolated request fingerprint; check generic errors and recovery after lockout
- [ ] Export values starting `=`, `+`, `-`, `@`, tab; confirm Excel sees literal text
- [ ] Confirm CSP nonce, HSTS, `nosniff`, frame restrictions and referrer policy
- [ ] Force DB connection failure; `/api/health` returns 503 without credentials in body
- [ ] Submit overlapping leave; no double-booked or overdrawn annual balance
- [ ] Compare role visibility for documents, appraisals, reports and admin audit
- [ ] Test migration up/down only on a newly cloned disposable branch and verify foreign keys, uniqueness, check constraints, archived rows

## Usability checklist

- [ ] Tab through menus and every form without a mouse; visible focus ring
- [ ] Labels properly focus controls; errors appear near fields with live announcement
- [ ] Loading buttons are disabled while work is pending; submit feedback is clear
- [ ] Long names, ranks, URLs, mobile tables and pasted text wrap or scroll without clipping
- [ ] Screen reader announces navigation, headings, table headers, required inputs
- [ ] Error pages do not include raw DB/stack traces

## Responsive-testing matrix (initial result: NOT RUN)

| Device simulation | Viewport | Key checks | Actual |
|---|---|---|---|
| iPhone SE | 375 × 667 | Form stacking, nav overlay, keyboard focus | NOT RUN |
| iPhone 14 | 390 × 844 | Hamburger menu, data-table scroll | NOT RUN |
| Android Pixel 7 | 412 × 915 | Touch targets, filters, labels | NOT RUN |
| Tablet | 768 × 1024 | Content grid/sidebar breakpoint | NOT RUN |
| Desktop | 1440 × 900 | Sidebar, dashboard, CSV controls | NOT RUN |

Playwright mobile projects use **Chromium with mobile-sized viewports**. They are not tests on physical iPhones or Safari/WebKit; run real-device/manual Safari tests for full coverage.

## Performance and accessibility evidence

After production deployment, run Chrome Lighthouse on `/`, `/login`, `/dashboard` and `/staff` at mobile and desktop sizes. Record **measured** performance, accessibility, best practices and SEO scores and date/device in `REVIEW.md`; no assumed values are provided. Document database query p95 and list pagination under realistic department-sized data.

## Dependency audit record

| Date | Command | Result |
|---|---|---|
| 2026-11-16 | `npm audit --audit-level=high` | NOT RUN — package registry unreachable and lockfile unavailable; mandatory CI gate configured |
