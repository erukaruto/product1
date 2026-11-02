# DashDrop

An admin dashboard template for SaaS products, built with React 19, TypeScript, React Router 7 and Vite. The demo is a revenue analytics app for Beacon, a fictional company. Charts are plain SVG components, with no chart library to install.

SaaSDrop, the matching landing page template, uses the same design tokens and the same demo company.

## Requirements

- Node.js 20.19 or newer, or 22.12 or newer (Vite 8 needs one of these)
- npm

Tested with Node 22.23.4 and npm 10.9.9.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5174
npm run typecheck  # TypeScript only
npm run build      # type-check, then production files in dist/
npm run preview    # serves dist/ on http://localhost:4174
```

## Screens (55)

Open `/screens` in the running app for a clickable list of every screen.

**Sign in and onboarding (10)**

| Route | Screen |
| --- | --- |
| `/login` | Sign in |
| `/signup` | Create account, with a password length check |
| `/verify-email` | "Check your inbox" after sign-up, with resend |
| `/two-factor` | 6-digit code (auto-advance, paste support) or a recovery code |
| `/reset-password` | Request a reset link |
| `/new-password` | New password with a strength meter and confirmation |
| `/invite` | Accept an invitation to a workspace |
| `/onboarding/workspace` | Step 1: workspace name, URL, currency, team size |
| `/onboarding/billing` | Step 2: connect a provider, upload a CSV, or copy an API key |
| `/onboarding/team` | Step 3: invite teammates with roles |

**Dashboard and reports (8)**

| Route | Screen |
| --- | --- |
| `/` | Overview: KPIs, MRR chart, MRR movement, recent invoices, plan mix, activity |
| `/getting-started` | First-run checklist and empty states |
| `/analytics` | Gained/lost MRR, signup funnel, MRR by country, recent cohorts |
| `/reports/mrr` | MRR movement by month (new, expansion, contraction, churn), monthly table, CSV export |
| `/reports/churn` | Churn rate, revenue churn, cancellation reasons, accounts to follow up |
| `/reports/cohorts` | 12-month retention table, revenue or customers |
| `/customers` | Search, status filter, sortable columns, row selection, pagination, CSV export |
| `/customers/:id` | KPIs, invoices, details, timeline |

**Billing (9)**

| Route | Screen |
| --- | --- |
| `/subscriptions` | Status tabs, renewals |
| `/subscriptions/:id` | Plan, invoices, "change plan" and "cancel" dialogs |
| `/invoices` | Totals by status, status tabs |
| `/invoices/new` | Line items with live subtotal, tax and total, validation |
| `/invoices/:id` | Printable invoice ("Print or save PDF"), mark as paid |
| `/payments` | Failed payments, row action menu (retry, refund) |
| `/disputes` | Refunds and disputes, respond with a note and evidence files |
| `/plans` | Monthly/yearly view, edit dialog |
| `/coupons` | Create a coupon with validation, copy code |

**Customers (5)**

| Route | Screen |
| --- | --- |
| `/segments` | Saved segments with live customer counts and MRR |
| `/segments/new`, `/segments/:id` | Rule builder (field, condition, value) with a live preview |
| `/customers/at-risk` | Health score with the signals behind it (`healthOf()` in `src/data/workspace.ts`) |
| `/customers/import` | CSV import in three steps, with column matching and validation |
| `/customers/:id/edit` | Edit form with validation, delete that needs the typed company name |

**Alerts and messages (4)**

| Route | Screen |
| --- | --- |
| `/alerts` | Alert rules with on/off switches |
| `/alerts/new`, `/alerts/:id` | Rule editor: trigger, threshold, plans, channels, recipients, live summary |
| `/notifications` | Filters, mark as read, mark all as read |
| `/inbox` | Conversations with customers, reply, snooze, close |

**Team (3):** `/team` (invite, change role, remove), `/team/roles` (permission matrix), `/audit-log` (search, filter, CSV export).

**Settings (7):** `/settings` (profile, workspace, appearance, notifications; `?tab=` opens a tab directly), `/settings/security`, `/settings/billing`, `/settings/integrations`, `/settings/api-keys`, `/settings/webhooks`, `/settings/data`.

**Errors (3):** the in-app 404, `/403` and `/500`.

**UI kit (6):** `/ui/buttons`, `/ui/forms`, `/ui/tables`, `/ui/charts`, `/ui/overlays`, `/ui/states`. These show every component with working examples.

The forms are UI only. Sign-in accepts any input, nothing is sent or saved, and buttons such as "Retry payment" show a confirmation toast. Connect them to your backend in the page files.

## Folder structure

```
dashdrop/
  index.html                 sets the theme before React loads
  src/
    main.tsx                 entry: font, styles, theme and toast providers, router
    App.tsx                  all routes; each page is loaded on demand (code splitting)
    nav.ts                   sidebar links
    types.ts                 types for customers, invoices, subscriptions, payments...
    components/
      AppLayout.tsx          sidebar with groups, top bar, notifications, mobile menu
      AuthLayout.tsx         sign-in layout and the onboarding layout with steps
      ui.tsx                 Card, StatCard, StatusBadge, Avatar, Tabs, Segmented, Switch,
                             Stepper, Progress, Skeleton, Pagination, Dropdown, Modal (and drawer),
                             toasts (useToast), KeyValue, Legend, EmptyState
      DataTable.tsx          sortable, paginated table with optional row selection
      Charts.tsx             LineChart, StackedBarChart, MovementChart, ShareBars, Sparkline
      CohortTable.tsx        retention heatmap
      Icon.tsx, Logo.tsx, ThemeSwitch.tsx
    pages/                   auth/, billing/, customers/, alerts/, team/, settings/, reports/, errors/, ui/
    data/                    demo data: metrics.ts, customers.ts, invoices.ts, billing.ts, workspace.ts, activity.ts
    lib/                     theme.tsx, format.ts, hooks.ts, config.ts
    styles/                  tokens.css (colors), base.css, app.css
  public/                    favicon.svg, _redirects (Netlify)
  vercel.json                SPA rewrite for Vercel
  tsconfig*.json             strict TypeScript, based on Vite's official React + TypeScript template
```

## Components you will reuse

- **Modal** traps focus, closes on Escape or a click outside, and returns focus to the button that opened it. Pass `drawer` for a side panel.
- **Dropdown** renders its menu in a portal, so it is never cut off by a scrolling table. Arrow keys move between items.
- **useToast()** shows a short message: `toast({ title: 'Saved' })`, with tones `good`, `bad` and `info`.
- **DataTable** takes `rows`, typed `columns` and a `rowKey`. Add `sortValue` to a column to make it sortable, and `selectable` for checkboxes. Filtering stays in the page.

## Replacing the demo data

Every screen reads from `src/data/`, typed by `src/types.ts`. The numbers agree with each other:
- Each month's MRR movement (new + expansion - contraction - churn) equals that month's change in MRR.
- Customers at month end = start + new - churned.
- Payments come from paid invoices, and disputes point at real payments.
- Plan and country splits add up to total MRR.

Replace these files with calls to your API and keep the same shapes.

The demo uses a fixed "today" (`TODAY` in `src/data/metrics.ts`, Oct 31, 2026), so screenshots stay the same.

## Colors and themes

All colors live in `src/styles/tokens.css`, which is identical to SaaSDrop's. Three themes, `light`, `dark` and `sand`, share the same tokens: `--bg`, `--surface`, `--ink`, `--muted`, `--line`, `--accent`, `--onaccent`, `--gold`, plus the status colors `--good`, `--warn` and `--bad`. `--gold` is decorative: in the light theme it does not have enough contrast for body text.

The theme is chosen in this order: `?theme=` in the URL, then the saved choice (`localStorage`, key `beacon-theme`), then the system setting.

## Font

DM Sans (variable) from `@fontsource-variable/dm-sans`, bundled into the build. No request to Google Fonts.

## Linking back to your site

The logo and "Back to site" link on the sign-in screens point to `VITE_SITE_URL`.

```bash
cp .env.example .env
VITE_SITE_URL=https://example.com
```

If it is not set, they point to `http://localhost:5173`, where SaaSDrop's dev server runs.

## Deploying

`npm run build` creates a single-page app in `dist/`.

- Build command: `npm run build`
- Output folder: `dist`
- Environment variable: `VITE_SITE_URL`

Because routing happens in the browser, the host must serve `index.html` for every path (for example `/customers/cus_1003`). This repository includes:

- `public/_redirects` for Netlify
- `vercel.json` for Vercel

These files follow each host's documented format, but deploys to those hosts were not tested. On other hosts, add a rewrite from all paths to `/index.html`.

### Serving from a sub-path

To serve the app at `example.com/app/`, set `base: '/app/'` in `vite.config.ts`. The router reads the same value through `import.meta.env.BASE_URL`, so links and routes follow. The fallback rule must then rewrite `/app/*` to `/app/index.html`.

## Before you launch

- Replace Beacon's name, logo (`src/components/Logo.tsx`, `public/favicon.svg`) and the demo data.
- Remove the demo notes: "Demo: any email and password will sign you in." in `src/pages/auth/Login.tsx`, and "Demo app. Beacon is a fictional company." in `src/components/AuthLayout.tsx`.
- Connect authentication. The app currently opens for anyone.
- Remove the UI kit pages and the "All screens" page if you don't want them in production (routes in `src/App.tsx`, links in `src/nav.ts`).
- Set `VITE_SITE_URL`.

## Browser support

The build targets the browsers in Vite 8's default list (Chrome and Edge 111+, Firefox 114+, Safari 16.4+), and the CSS uses `color-mix()`, which those versions support. Only Chromium was tested, at 390, 768 and 1440 pixels wide.

## License

See `LICENSE.md`.
