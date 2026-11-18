# Design audit and implementation notes

The audit covers the Next.js source included with this package. The deployed, authenticated website was not altered by this local refactor.

## Findings and changes

| Priority | Finding in source | Implementation |
| --- | --- | --- |
| High | Home hero was generic and the above-the-fold supporting panel emphasized security checklist rather than the actual app | Rewrote concrete hero copy; added a faithful code recreation of the existing staff-directory view, with the real empty-state message and an explicit preview label; kept sign-in as the main CTA |
| High | CSS used disconnected hardcoded blues, borders, radii and shadows | Centralized semantic color, radius, spacing, elevation and motion tokens in `src/app/globals.css`; applied them to shared primitives |
| High | Buttons and mobile controls were sometimes below touch target guidance; sidebar breakpoint and overlay breakpoint differed | Standardized controls at least 44px, aligned sidebar and overlay at 900px, improved current-page states and Escape dismissal |
| High | Form field errors lacked `aria-describedby` references; login displayed password strength; server-side pending feedback was minimal | Linked validation to fields, focused invalid inputs, removed login strength indicator, added busy states and guarded network errors |
| Medium | Dashboards had empty data sections without guidance | Added truthful no-data messages and links to relevant tasks where authorized |
| Medium | Headings, statistics and tables were inconsistent | Balanced headings, prettified paragraphs, tabular numerals and clearer table empty states |
| Medium | Metadata included only title and description; favicon missing | Added named title template, canonical homepage, Open Graph/Twitter metadata, local SVG favicon, route-specific titles and noindex for account pages |
| Medium | Route transitions lacked a loading UI | Added accessible skeleton fallbacks with reduced-motion handling |

## Design decisions

- Identity: accessible blue action accent, calm neutral surfaces and restrained borders. No decorative gradients, badges, invented logos or fake endorsements.
- Imagery: the home preview is **rendered in code** from existing interface elements and uses **no invented staff information**. It is not a screenshot. There are no other graphics merely for decoration.
- Light theme only: the original app had no complete dark-theme system. Rather than shipping partially broken dark mode with hardcoded page colors, this change remains a coherent light theme.
- Security: server actions, authentication rules, database access and roles are unchanged by the UI refactor. `src/lib/security.ts` additionally carries forward the earlier Argon2id TypeScript fix to align the supplied archive with the live repository history.
- The metadata favicon is a **provisional DSMS monogram**, not an official university mark.
- Inputs and tables have focus states and horizontal scroll containment; semantic content and data remain intact.

## Missing inputs / optional enhancements

- Real, permission-safe screenshots of authenticated **Staff directory**, **Dashboard**, **Courses**, and **Leave** screens, for replacing the current faithful code preview if desired.
- An institution-approved name, logo and brand guide, if this is not meant to be a neutral university demonstration.
- Legal/privacy policy and official support contact, if the system will host real personal records.
- Real data for any future impact statistics, customer stories or testimonials (none were invented).

## QA status

- TypeScript/TSX files parsed successfully using the locally installed TypeScript parser.
- CSS parsed using locally installed PostCSS. Colors reviewed programmatically for contrast.
- Full Next.js build, Vitest, Playwright and Lighthouse runs require npm dependencies and a running app; they were not completed in the offline working copy.
- These changes are committed **locally** in logical groups. They are **not yet pushed to GitHub/Vercel** from this session. See the downloadable patch and source archives.
