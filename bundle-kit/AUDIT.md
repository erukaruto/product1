# Audit: SaaSDrop and DashDrop (v1.2)

All numbers come from the code and from test runs in this environment (Node 22.23.4, npm 10.9.9, Chromium 153 through Playwright 1.63.0). The raw output of the browser checks is in `verify-results.json`.

v1.1 (Tahap 1) converted DashDrop to TypeScript and took the kit from 16 to 47 pages. v1.2 (Tahap 2) added 20 DashDrop screens and 8 SaaSDrop pages: 75 now.

## 1. Stack, structure, scripts

| | SaaSDrop | DashDrop |
| --- | --- | --- |
| Type | Multi-page static site | Single-page React app |
| Build tool | Vite 8.3.5 | Vite 8.3.5 + @vitejs/plugin-react 6.1.2 |
| Language | HTML, CSS, JavaScript (no framework) | TypeScript 7.0.2 (strict), React 19.3.1, React Router 7.18.5 |
| Font | DM Sans variable, @fontsource-variable/dm-sans 5.3.0 | Same |
| Node required | ^20.19.0 or >=22.12.0 (Vite 8) | Same |
| Scripts | `dev` (5173), `build`, `preview` (4173) | `dev` (5174), `typecheck`, `build` (= `tsc -b && vite build`), `preview` (4174) |
| Files (without node_modules, dist) | 38 | 96 |
| Lines of HTML/CSS/JS/TS | 5,052 | 12,679 |

The TypeScript setup copies the official `create-vite` React + TypeScript template (`tsconfig.app.json`, `tsconfig.node.json`, `~7.0.2`), with `strict: true` added explicitly.

```
saasdrop/
  index, pricing, about, changelog, contact, blog, blog-post, help, help-article, terms, privacy, 404 (.html)
  src/partials/  head, header, footer, logo, theme-switch (.html)
  src/scripts/   main.js
  src/styles/    tokens.css  base.css  sections.css

dashdrop/
  src/main.tsx  App.tsx  nav.ts  types.ts  env.d.ts
  src/components/  AppLayout  AuthLayout  ui  DataTable  Charts  CohortTable  Icon  Logo  ThemeSwitch (.tsx)
  src/pages/       Overview  GettingStarted  Analytics  Customers  CustomerDetail  Settings  Screens  NotFound
  src/pages/auth/      Login  Signup  VerifyEmail  TwoFactor  ResetPassword  NewPassword  AcceptInvite  Onboarding (3 steps)
  src/pages/reports/   ReportMrr  ReportChurn  ReportCohorts
  src/pages/billing/   Subscriptions  SubscriptionDetail  Invoices  InvoiceNew  InvoiceDetail  Payments  Disputes  Plans  Coupons
  src/pages/ui/        UiButtons  UiForms  UiTables  UiCharts  UiOverlays  UiStates
  src/data/        metrics  customers  invoices  billing  activity (.ts)
  src/lib/         theme.tsx  format.ts  hooks.ts  config.ts
  src/styles/      tokens.css  base.css  app.css
```

## 2. Themes and page counts

- **Themes:** 3 in each product: `light`, `dark`, `sand`.
- **SaaSDrop pages:** 20. Home, features, 3 feature details, integrations, integration detail, security, compare, pricing, about, changelog, contact, blog, blog post, help center, help article, terms, privacy, 404.
- **DashDrop screens:** 55 (the in-app "All screens" page lists them):
  - Sign-in and onboarding: 10
  - Dashboard and reports: 8
  - Customers: 5
  - Alerts and messages: 4
  - Billing: 9
  - Team and settings: 10
  - Errors (404, 403, 500): 3
  - UI kit: 6
- **Demo data:** 48 customers, 48 subscriptions, 122 invoices, payments derived from them, 6 refund/dispute cases, 3 plans, 5 coupons and 12 months of metrics. All of it comes from fixed formulas or a fixed seed.

## 3. Visual consistency

Checked in the browser: for each theme, the script read the computed value of every token on `<html>` in both products and compared them.

| Check | Result |
| --- | --- |
| `tokens.css` byte-identical in both products | Yes (same SHA-256) |
| Computed tokens equal, light / dark / sand | Yes, all 11 in each theme |
| Fonts rendered on any element, all pages, both products | Only "DM Sans Variable" |
| Theme storage key and selection logic | Same in both (`beacon-theme`; URL, then saved choice, then system) |

DashDrop adds three chart colors in `app.css` (`--loss`, `--loss-strong`, `--accent-light`), mixed from the shared tokens.

Contrast (WCAG ratio, computed from the tokens): every text pair passes AA (4.5:1) in all themes. The exception is `--gold` in the light theme at 3.26, so gold is only used for dots, badge backgrounds and marks, never as a text color. A search of both codebases found no `color: var(--gold)`.

## 4. Install and build

| | `npm install` | `npm run build` | Output |
| --- | --- | --- | --- |
| SaaSDrop | OK, 0 vulnerabilities | OK, no warnings | 20 HTML pages, CSS 30.7 kB (6.7 kB gzip), JS 5.3 kB (1.9 kB gzip), 2 font files |
| DashDrop | OK, 0 vulnerabilities | OK: `tsc -b` with 0 errors, then Vite with no warnings | Main JS 293 kB (90.7 kB gzip), plus 64 chunks loaded on demand; CSS 43.1 kB (9.3 kB gzip) |

The ZIP was also unzipped into a fresh folder and built there with `npm ci` (see section 6).

Code splitting makes the main DashDrop bundle smaller than in v1.0 (97.3 kB gzip), even though there are three times as many screens.

## 5. Licenses

- **SaaSDrop and DashDrop:** one license text (`LICENSE.md`), byte-identical in both products and at the bundle root, so there's no conflict. It contains placeholders (`{{SELLER_NAME}}`, `{{SUPPORT_EMAIL}}`, `{{UPDATE_POLICY}}`, `{{REFUND_POLICY}}`). It's a draft, not legal advice.
- **Shipped in DashDrop builds:** DM Sans (OFL-1.1), react, react-dom, react-router, scheduler, cookie, set-cookie-parser (all MIT). SaaSDrop ships only the font.
- **Build tools only (not in the ZIP or the build):** 67 packages in DashDrop (TypeScript's native compiler packages are Apache-2.0), licensed MIT, Apache-2.0, MPL-2.0, ISC and BSD-3-Clause. Buyers install these with npm.
- **Sample legal text:** `saasdrop/terms.html` and `privacy.html` contain placeholder text for the fictional company, each with a visible "Sample text, not legal advice" notice.

## 6. Browser checks (Chromium)

| Check | Result |
| --- | --- |
| Page loads (20 + 57 URLs × 3 themes × 390/768/1440 px) | 693 |
| With console errors | 0 |
| With sideways page scroll | 0 |
| Pages showing "not found" unexpectedly, or no heading | 0 |
| Interaction checks passed | 73 of 73 |

The 57 DashDrop URLs are the 55 screens plus a settings tab URL and the "All screens" index.

The interaction checks include:
- Sign-up → verify email → 3-step onboarding → getting started
- Password reset with mismatch and strength checks
- 2FA code entry, empty-code error, auto-advance
- Modal: focus moves inside, Tab stays inside, Escape closes, focus returns to the button
- Row menu on the last table row opens fully on screen and works with arrow keys
- New invoice totals (3 × $49 + $250 + 10% tax = $436.70)
- Mark invoice as paid; cancel subscription; respond to dispute; edit plan; coupon validation
- MRR CSV export (12 months) and the October row adding up
- Cohort toggle; drawer; toasts
- All 55 links on the "All screens" page open a real page
- Tahap 2: segment preview updates, import mapping validation, typed delete confirmations, alert rule summary and validation, mark all as read, inbox reply, duplicate invite blocked, audit log search, API key shown once, webhook validation, integrations filter, feature page links
- SaaSDrop: blog topic filter, newsletter validation, help search with highlight and empty state, article feedback, footer legal links
- Landing page buttons opening `/login` and `/signup` in the app

The full list is in `verify-results.json`.

Separate runs:
- Same-domain setup (site at `/`, app at `/app/` with a fallback rule): 7 of 7 checks pass, including the theme carrying from site to app.
- Fresh unzip of `bundle.zip`, then `npm ci` and `npm run build` in both folders: both build; DashDrop's type check passes.

## 7. Not verified

- Firefox, Safari, Edge, real phones and tablets. Firefox could not be tested here because the network policy blocks every Firefox download source. `verify.cjs` accepts `BROWSER=firefox` or `BROWSER=webkit` for testing on your own machine.
- Minimum browser versions come from data, not from testing: Vite 8's build target (Chrome/Edge 111, Firefox 114, Safari 16.4) and MDN compatibility data for `color-mix()` (Firefox 113, Safari 16.2).
- Screen readers. There was no full accessibility audit, beyond labels, focus handling in dialogs and menus, and contrast.
- Deploys to Netlify, Vercel or any other host. The rewrite files follow their documented formats.
- Performance scores (no Lighthouse run), Node 20, and Windows.
- Anything on Gumroad (no access from here).

## 8. Bugs found during v1.1 and v1.2 (all fixed)

| Bug | Where | Fix |
| --- | --- | --- |
| Row menus would be clipped inside scrolling tables | `Dropdown` used an absolutely positioned menu inside `.table-scroll` | Menu renders in a portal with fixed positioning and opens upward near the bottom of the screen |
| Menu closed right after opening when the page had just scrolled | Close-on-scroll handler | The menu now follows the button on scroll instead of closing |
| Horizontal overflow on phones on `/reports/mrr` (46px) and `/ui/charts` (113px) | Card header could not wrap a four-item legend | `flex-wrap` on `.card-header` and `.legend` |
| Table header corners drew over rounded card corners | Flush cards without a toolbar | Radius on the first and last `.table-scroll` in a flush card |
| "Due 14 days…" note touched the Send button | `InvoiceNew` summary | Spacing class |
| Inline `onsubmit` on the help search form | `help.html` | Handler moved to `main.js` (works with strict CSP headers) |
| Sample privacy text said cookies store the theme | `privacy.html` | Says "browser storage", which is what the template uses |
| Help search placeholder was cut off on phones | `help.html` | Shorter placeholder ("Search help articles") |
| v1.2: `/team`, `/team/roles`, `/settings/api-keys` scrolled sideways on phones and tablets (up to 398px) | Screen-reader labels (`.sr-only`, absolutely positioned) in table cells escaped the scroll container | `.table-scroll { position: relative }` |
| v1.2: card headings on feature pages did not line up | `.value` grid stretched shorter cards | `align-content: start` |

The v1.0 fixes (contact success message, 404 handling, contrast and so on) are still in place, and their checks still pass.

## 9. Known limitations (by design, documented in the READMEs)

| Item | Where |
| --- | --- |
| Forms send nothing (contact, newsletter, article feedback) | `saasdrop/src/scripts/main.js`, comments mark where to add requests |
| Sign-in, sign-up, 2FA and invite accept any input | `dashdrop/src/pages/auth/` |
| Billing actions (retry, refund, cancel, edit plan, new coupon) only update the screen and show a toast | `dashdrop/src/pages/billing/` |
| Blog cards link to one sample post; help links to one sample article | `saasdrop/blog.html`, `saasdrop/help.html` |
| Legal and security pages are sample text | `saasdrop/terms.html`, `privacy.html`, `security.html` |
| Workspace screens (team, alerts, API keys, webhooks, deletes) only update the screen | `dashdrop/src/pages/` |
| Demo "today" is fixed to Oct 31, 2026 | `dashdrop/src/data/metrics.ts` (`TODAY`) |
| Demo notes to remove before launch | `saasdrop/src/partials/footer.html`, `dashdrop/src/pages/auth/Login.tsx`, `dashdrop/src/components/AuthLayout.tsx` |
