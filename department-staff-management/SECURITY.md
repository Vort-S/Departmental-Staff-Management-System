# Security implementation and threat model

**Sensitive information:** personnel identifiers, contact details, leave reasons, appraisal notes, credential URLs and session credentials. **Attackers considered:** anonymous brute-force client; authenticated staff member probing another employee's records; malicious HTML/SQL supplied through forms; compromised session cookie; untrusted link host; compromised deployment environment; over-privileged administrator.

## Trust boundaries

Browser → Next.js Proxy → Server Action/Route Handler → authorize actor, department, object and individual fields → parameterized Drizzle ORM → Neon PostgreSQL. The Proxy is NOT the source of authorization; session-cookie/role-hint checks there are optimistic only. Server code re-reads the active account from the database for **every** protected request; the query and action explicitly scope by department and/or owner.

## Controls and mappings (OWASP Top 10 2021)

| Control implemented | Attack mitigated | Mapping |
|---|---|---|
| STAFF/HOD/ADMIN policies, object filters, server action checks, self-approval ban | IDOR, forced browsing, privilege escalation, cross-department reads | A01 Broken Access Control |
| Phone/DOB conditional projection; AES-GCM for home address, national ID, emergency contact; click-to-reveal audited | Excessive data exposure, theft from DB-only backup | A02 Cryptographic Failures |
| Argon2id (19MiB, 3 iterations, 1 lane); 12+ mixed password policy | Credential compromise | A07 Identification & Authentication Failures |
| Random 32-byte session IDs; keyed hashes in DB; HttpOnly/Secure/Lax cookies; idle 30m / absolute 12h; revoke on sign-out/password change/role change | Session fixation, theft, replay | A07 Identification & Authentication Failures |
| Single-use expiring email/reset/invitation tokens; only keyed token hashes stored; Resend delivery | Reset replay, impersonation | A07 Identification & Authentication Failures |
| Atomic DB-backed rate limits by hashed IP and normalized account, 30m lockout | Brute force and user enumeration | A07 Identification & Authentication Failures |
| Zod strict schemas on mutation inputs, date/order/length checks, code/sort filters; Drizzle parameter binding | SQL injection, mass assignment, malformed dates | A03 Injection |
| React text rendering, no raw HTML, host allowlist, nonce CSP and `frame-ancestors 'none'` | XSS, stored HTML, clickjacking | A03 Injection / A05 Security Misconfiguration |
| Explicit Origin comparison in server actions; SameSite cookies; signed per-session CSRF header required for custom logout POST | CSRF | A01 Broken Access Control |
| CSV cells quoted, escaped and prefixed with `'` for formula-like values | Spreadsheet CSV formula injection | A03 Injection |
| DB-imposed append-only audit trigger; event/actor/time/hashed IP, department-scoped admin view | Tampering / undetected abuse | A09 Security Logging & Monitoring Failures |
| Strict headers, `no-store`, production fail-fast secret config, CI dependency audit | Unsafe defaults, vulnerabilities | A05 / A06 |

## Sensitive field policy

- Public directory: staff ID, name, rank, type, employment status, office, unit, appointment date, qualification, research interests, public email, photo link (if supplied).
- Owner and ADMIN: phone, date of birth; highly sensitive encrypted address, national ID, emergency contact via explicit audited reveal. HOD: same-department phone and date of birth, **not** national ID/home address/emergency contact. All other staff: no private values of colleagues.
- Appraisals: HOD reads department and creates for *other* employees; ADMIN reads department; STAFF reads only their own. There is no edit action for the evaluated staff member.
- Leave: HOD may decide only a different employee's request within their department. ADMIN records decisions separately. Status/history preserved.
- URLs: `http`/`https` syntax validated, allowlisted hostname exact match, no credentials or unusual ports, HTTPS required in production. Application does not server-fetch referenced documents.

## Authentication and account lifecycle

Registration creates PENDING user; email verification sends 24-hour single-use link through Resend; ADMIN must approve against existing, unassigned staff record matching staff ID. Invite tokens expire in 48 hours and are only issued by ADMIN. Reset links expire in 30 minutes and are single-use. Generic failures obscure whether an email is registered. Admin-created seed accounts require password change before app access. Password changes reset all sessions. No passwords, tokens, encryption keys or actual staff identifiers appear in event logs.

## Session security details

`__Host-dsms` and `__Host-dsms-hint` cookies in production (development uses non-`__Host` cookies because localhost may use HTTP). The first stores a 256-bit random opaque bearer; DB stores only keyed HMAC-SHA256 digest. The second is a 5-minute HMAC-signed role hint for optimistic proxy navigation, **never authoritative**. A revoked, expired, unknown or suspended-user session is rejected by the database-backed guard. Session validation updates activity at most every five minutes. Session cookie is not exposed to JavaScript.

## CSP and response headers

Proxy creates a unique unpredictable nonce on each request, forwards `x-nonce` and sets `Content-Security-Policy` on the response. Production denies objects, framing, other forms and third-party scripts; only approved style/script nonces, same-origin connections and HTTPS images are allowed. Development adds `'unsafe-eval'`/inline style compatibility and **must not** be deployed as the production app. Next.js nonce-based rendering requires dynamic pages; expect performance tradeoffs. `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options: DENY` and `Cache-Control: no-store` are set. Vercel also adds defensive headers.

## Handling secrets and PII

Use distinct secrets per development/test/production; generate separately with `crypto.randomBytes(32).toString('base64')`. Put them only in `.env.local`, GitHub Actions secrets or Vercel encrypted environment settings. Rotate `SESSION_SECRET` to revoke all session/verification digests (requires re-issuing verification/reset tokens). Rotate `FIELD_ENCRYPTION_KEY` transactionally using `OLD_FIELD_ENCRYPTION_KEY`, `NEW_FIELD_ENCRYPTION_KEY` and `npx tsx scripts/rotate-key.ts` before changing the active key. Back up and test restore **before** rotation; do not output plaintext. If the key is lost, encrypted fields cannot be recovered from DB alone. Avoid storing PII in Vercel logs, audit metadata, screenshots, CI artifacts and public test fixtures. Protect Neon branches/backups as production-sensitive data, even when cloned.

## Residual risks / required production assurance

- Full npm install/build/tests, OWASP dynamic scan, manual penetration assessment, accessibility audit, secure provider email delivery and Lighthouse have **not** been verified in this environment.
- Rate limiting is app-side, so volumetric denial-of-service needs Vercel WAF/bot management and monitoring. Proxy-based IP headers are only trustworthy behind correctly configured reverse proxies; verify the forwarded-IP trust boundary in production.
- The append-only trigger protects mutation through ordinary DB privileges; the Neon project owner / superuser could still alter schema. Grant the app role only required read/write privileges, and protect migration credentials separately.
- For a compliance deployment, consider PostgreSQL RLS as a further defense, key-management service, SCIM/SAML, security event retention policy and automated incident alerts.
- There is no regulated document binary storage / AV scan, exhaustive leave policy engine, MFA, automatic leak prevention or third-party penetration certification. Do not represent them as present.
- Audit entries for failed logins to an **unknown** account have no department; they remain in the database, not in department-scoped admin UI, and should be reviewed by a central security operator.
