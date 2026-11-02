# LinguaDash: admin dashboard template for language schools

An admin dashboard for a language school, built with **React 19 + TypeScript (strict) + React Router 7 + Vite**.
The charts are hand-made SVG, with no chart library. The demo school is the fictional *Polyglot Nusantara
Language Center*. All students, teachers, invoices and scores come from a fixed seed, so they are fictional
but look the same every time the dashboard loads.

The UI is in **Indonesian**. Amounts are shown in Rupiah (`Rp 1.250.000`) and dates in Indonesian format (`18 Nov 2026`).

## What is inside

- **73 routes plus a 404 page.** Open `/screens` to see every screen.

| Area | Screens |
| --- | --- |
| Auth | login, sign-up, forgot and reset password, email verification, 3-step onboarding (school profile, languages, prices) |
| Overview | active students per language, revenue this month, arrears, attendance, level-ups, trial conversion |
| Students | table with sort, filter and pagination; detail with level history and 4-skill scores; add and edit; CSV import; printable level certificate |
| Placement tests | results, answer detail, assign a class from the result |
| Trial classes | bookings with editable status, booking detail |
| Teachers | list (native or local, language taught), detail, weekly teaching schedule, hourly pay and teacher attendance |
| Classes | weekly calendar, class list, class detail, rooms and branches, online class links |
| Attendance | input per meeting, summary per student and per class |
| Academic | curriculum, question bank, mock tests (create, list, results with section scores and predicted score), grade input, speaking/writing rubrics, level promotion |
| Finance | bills, invoices (list, create, detail, record payment), payments, arrears, promos, revenue by language and branch |
| Communication | announcements, WhatsApp message templates, inbox |
| Reports | revenue, retention, level-ups, exam scores, teacher performance, trial conversion |
| Settings | school profile, languages and levels, branches, team and roles, price packages, notifications, subscription billing |
| Errors | 403, 404, 500 |
| UI kit | buttons, forms, tables, charts, overlays, states |

- **3 themes** (light, dark, batik), using the same `tokens.css` and `base.css` as LinguaDrop.
- **Charts**: line, grouped and stacked column, horizontal bars, funnel, sparkline and segmented bar. Each chart has:
  - a legend whenever it shows two or more series
  - a hover tooltip
  - a "Lihat tabel data" table view for screen-reader and keyboard users

## Quick start

Requires Node.js 20.19+ (or 22.12+).

```bash
npm install
cp .env.example .env     # VITE_SITE_URL = your LinguaDrop address
npm run dev              # http://localhost:5174
npm run typecheck        # tsc -b, strict mode
npm run build            # type-check + production build in dist/
npm run preview          # http://localhost:4174
```

This is a single-page app, so the host must send every path to `index.html`.
`public/_redirects` (Netlify, Cloudflare Pages) and `vercel.json` (Vercel) are included.
To serve the app from a sub-folder, set `base` in `vite.config.ts`.

## Project structure

```
src/
  main.tsx, App.tsx, routes.tsx   router; every screen is registered once in routes.tsx
  components/                     Layout (sidebar, topbar, auth), ui.tsx, DataTable, charts, WeekGrid, Icon
  pages/                          one file per area (students.tsx, finance.tsx, ...)
  data/school.ts                  languages, levels, branches, teachers (same as LinguaDrop)
  data/demo.ts                    generated demo data from a fixed seed (DEMO_TODAY = 18 Nov 2026)
  lib/store.ts                    demo store: your changes saved in localStorage on top of the seed data
  lib/format.ts                   Rupiah and Indonesian date helpers
  styles/                         tokens.css + base.css (shared with LinguaDrop), app.css
```

## Connecting real data

There is **no backend, no payment gateway and no real authentication**:

- the login form opens the dashboard without checking anything;
- anything you create (students, invoices, payments, attendance, grades, trial status) is saved only in your browser's `localStorage`;
- **Pengaturan → Profil lembaga → Reset data demo** clears it.

To connect an API:

1. Replace the hooks in `src/lib/store.ts` (`useStudents`, `useInvoices`, `saveSession`, ...) with fetch calls that return the same types (see `src/data/demo.ts`).
2. Add real auth in front of the routes in `App.tsx`.
3. Send WhatsApp messages and emails from your server. Today the template only opens prefilled `wa.me` links.

## Accessibility

- labelled form controls and skip link
- native `<dialog>` modals, which trap focus and close on Escape
- tabs operable with the arrow keys
- `aria-sort` on sortable columns
- `lang` and `dir` on Japanese, Korean, Chinese and Arabic text
- automated axe-core checks in all 3 themes (see `bundle-kit-lingua/AUDIT.md` in the bundle)

## License

See `LICENSE.md`.
