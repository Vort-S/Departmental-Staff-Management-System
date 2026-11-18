# Vercel deployment status — 16 November 2026

## Existing Vercel project (verified)

- Dashboard: https://vercel.com/temitopenoch06-8665/department-staff-management
- Team ID: `team_3SRgmaDUcq7387cdECPLsUdK`
- Project ID: `prj_VLrGtfMLTgobueJPX0K9dKUR68md`
- Framework: Next.js; runtime: Node.js 22; preferred function region: `iad1`
- Protected source maps, Git fork protection and Vercel deployment protection enabled
- **Deployment: not live**. No Git repository connected; no successful deployment.

## Environment configuration

- Vercel confirms encrypted `SESSION_SECRET`, `FIELD_ENCRYPTION_KEY` and `ALLOWED_URL_HOSTS` entries for Preview.
- Vercel also reports existing encrypted `DATABASE_URL` for Preview/Development and Production. **Their database targets, privilege scope and validity were not independently verified; audit before use.**
- Existing encrypted secrets are also present for Production and Development. Review before a production release; do not copy development database credentials into Production.
- No `APP_URL`, `RESEND_API_KEY` or `MAIL_FROM` variable was confirmed. The app's startup validation intentionally fails in production without working email configuration, and mutations depend on `APP_URL` exactly matching the browser origin.
- Do not set a dummy `APP_URL` or a fake email provider secret to bypass these protections.
- Keep migration credentials (`DATABASE_URL_UNPOOLED`) out of Vercel's runtime environment.

## Neon database

- Neon project: `dark-bonus-11169159` (Postgres 17), branches Production, Development, Test.
- Checked Development database `dsms`: neither `users` nor Drizzle migration table exists yet. Migrations have **not** been applied there.
- Do not deploy with production data until migrations, constraints, seed safety and application tests have been reviewed.

## Local source and execution

- Source archive: `department-staff-management.zip`.
- Linked local project directory contains `.vercel/project.json` pointing to the correct project; `.vercel/` is git-ignored.
- The runtime cannot connect to `registry.npmjs.org` (`EAI_AGAIN`), so package install, typecheck, Next.js build, Playwright and Vitest cannot be completed here. No `node_modules` or package lockfile was available.
- Local folder is not a Git repository. The remote Vercel connector cannot read a container ZIP by path.

## Concrete next steps

1. Create a private GitHub repo for the extracted source and connect it in the **existing** Vercel project's Git settings (do not create a duplicate Vercel project).
2. On a machine with npm access run `npm install`, commit the lockfile, `npm run check`, `npm run test:e2e`, and `npm run audit`. Review and fix failures.
3. Run the reviewed migration against the Neon **development** branch first; seed fictional data only in development/test.
4. Audit Preview `DATABASE_URL` and database role permissions; configure `APP_URL` to an exact, stable HTTPS preview origin; set real, encrypted `RESEND_API_KEY` and `MAIL_FROM` for working email verification and password reset.
5. Trigger a preview deployment, inspect the build logs, verify `/api/health`, login, sessions, role access, CSRF, email links and E2E/security tests.
6. Once preview tests pass, review production database migration and configure production-scoped credentials and APP_URL, then deploy main to production. Perform post-deployment checks and document rollback.

Do not treat a Vercel project existing as a successful release.
