# Project review — build → secure → test → deploy → review

**Project:** Building Web Applications: Web Application Security, Testing, Deployment and Review.  
**Review date:** 16 November 2026.  
**Application:** Departmental Staff Management System, university semester project.

## 1. Goal and implemented code

DSMS brings staff directory management, role-aware dashboards, courses, teaching assignments and workload warnings, leave applications and HOD decisions, attendance, credential URL references, research achievements, appraisals, announcements and authorized CSV exports into a single Next.js site.

Source includes 3 roles (ADMIN, HOD, STAFF), self-service registration pending email and administrative approval, invite tokens, single-use password reset, hashed server-side sessions, append-only audit logging, AES-256-GCM sensitive-field storage, schema validation, restrictive CSP, status history, soft archive and protected reports.

## 2. Architecture decisions

A Node.js Next.js deployment is chosen over Edge runtime for Argon2id and WebSocket-backed Neon transactions. Transactional leave submission locks the staff row and checks overlap/balance before insertion; HOD approval locks a request and writes state/history in one transaction. Profile field filtering and department ownership are enforced in code and scoped database queries. For a complete diagram and entity model see `README.md`.

## 3. Security summary

- HMAC-hashed opaque tokens, Argon2id password hashing, idle/absolute session expiry and session revocation.
- Strict Zod validation and Drizzle-bound SQL values, including allowlisted search/sort options.
- ADMIN-only account management and audit access; HOD-only decision authority with explicit self-approval rejection; ordinary staff cannot access other employees' appraisals.
- AES-GCM encrypts national IDs, home addresses and emergency contacts using external environment secrets. Public staff profile excludes private fields.
- Nonce-based CSP, security headers, Origin/CSRF checks, output encoding, URL-host allowlisting, CSV formula injection mitigation, DB atomic rate limiting and masked audit-sensitive access.

See `SECURITY.md` for exact control boundaries and residual risks. Measures are implemented as source code but not yet independently penetration-tested.

## 4. Actual verification (no fabricated scores)

| Activity | Result | Evidence |
|---|---|---|
| TypeScript/TSX **syntax parse** | 71 files, 0 parse diagnostics | Local TypeScript parser command executed 16 Nov 2026 |
| Node.js offline security/business-rule smoke | **6 PASSED / 0 FAILED** | Executed production helper source via TypeScript transpiler (`scripts/offline-smoke.cjs`); does not prove app build |
| npm dependency installation | **BLOCKED** | Registry DNS failure in authoring environment |
| Production Next.js build / typecheck / lint | **NOT RUN** | Dependencies unavailable |
| Vitest unit and Neon integration | **NOT RUN** | Source test cases supplied; no dependency execution |
| Playwright browser tests | **NOT RUN** | Source tests supplied; no installed browsers or running app |
| npm audit | **NOT RUN** | Missing install/lockfile/network; CI gate supplied |
| Lighthouse Performance | **NOT MEASURED** | No production deployment |
| Lighthouse Accessibility | **NOT MEASURED** | No production deployment |
| Lighthouse Best Practices | **NOT MEASURED** | No production deployment |
| Lighthouse SEO | **NOT MEASURED** | No production deployment |
| Neon resource creation | **COMPLETED** | `university-dsms-semi-project` with production/development/test branches |
| Neon migrations/seed | **NOT APPLIED** | SQL and script provided |
| Vercel live deployment | **NOT DEPLOYED** | Source repository and environment setup required |

The in-app `/testing` page reads `test-results/latest.json` and cannot treat a written test as a passing one. Execution artifacts are collected by `scripts/collect-results.ts` only after a real test runner creates its JSON output.

## 5. Problems encountered and solutions

| Problem | Approach / current constraint |
|---|---|
| Non-networked authoring environment blocked npm and web app execution | Generated self-contained source, exact scripts and CI; ran TypeScript syntax-only validation, did not invent build/test output |
| Access-control leakage risk between departments and roles | Owner/department policies in server actions, restricted DB projections, and server guards independent of navigation |
| Approval races / overdrawn leave | Interactive Neon transaction and staff-row locking; same-row decision lock; calendar-day policy |
| App Router script injection vs CSP | Per-request nonce delivered by Proxy; dynamic pages used intentionally |
| End-user email delivery requires external trust | Resend provider and verified domain; no raw tokens logged or stored; dev E2E-only mail suppression cannot count as live delivery test |
| Need to retain records when staff leave | `archived_at` timestamp and session revocation, without destructive profile deletion |

## 6. Limitations and future improvements

1. The system requires real `npm install`, typecheck, build, full automated tests and independent security review before production use. Tests currently include intentionally unexecuted coverage and several manual-only checks.
2. Registration uses the initially configured department; production multi-department tenant onboarding needs explicit school/department selection, invitation rules and DB-level tenant isolation.
3. Documents are URL/metadata only; future feature should use authenticated private storage, malware scanning, time-limited signed downloads, structured verification history and fine-grained retention.
4. Annual leave is modeled with an inclusive calendar-day entitlement and a basic seven-day backdating policy, not comprehensive public-sector/union leave law, business days or carryover.
5. If only one HOD exists, HOD leave decisions need a second independent authorized approver or formal delegated escalation. No unsafe ADMIN bypass was introduced.
6. Course overload uses a fixed 12-unit threshold and warnings rather than credit-weighted faculty policies or timetable clash detection.
7. Add MFA/passkeys, database row-level security, automated DAST, background cleanup jobs, optimistic concurrency for non-critical edits and more extensive metrics.
8. Improve performance evidence through actual Lighthouse runs, p95 database benchmarks, query indexes, deferred charts and caching for non-sensitive aggregated metrics.

## 7. Review conclusion

The repository provides the architecture, user interfaces, security controls, database design and test/deployment framework expected of a security-focused semester project. The infrastructure has been provisioned on Neon, but the work is **not a verified production deployment**. The remaining lifecycle gates are installation, migration, seed, real test execution, issue remediation, Vercel publication, manual security/usability review and performance measurement. These are deployment prerequisites, not completed milestones.
