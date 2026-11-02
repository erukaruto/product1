# Gumroad listing: LinguaDrop, LinguaDash and the bundle

Copy for the three Gumroad product pages. Every number here comes from the code or from `verify-results.json`
(see `AUDIT.md`). Keep the "What it is not" sections: they prevent refunds and bad reviews.

---

## Product names

| Product | Name on Gumroad |
| --- | --- |
| Site only | **LinguaDrop: Language School Website Template (47 pages, Vite + HTML)** |
| Dashboard only | **LinguaDash: Language School Admin Dashboard (React 19 + TypeScript, 74 screens)** |
| Bundle | **LinguaDrop + LinguaDash: Language School Website + Admin Dashboard Kit** |

## Short summaries (one sentence each)

- **LinguaDrop**: A 47-page, 3-theme marketing site for language schools, with a working placement test, class schedule filters, trial booking and a 4-step registration form.
- **LinguaDash**: A 74-screen React + TypeScript admin dashboard for language schools covering students, placement tests, classes, attendance, grades, mock tests, invoices and reports, with hand-made SVG charts.
- **Bundle**: The website and the dashboard with one shared design system: same tokens, same fonts, same 3 themes, linked sign-in buttons.

---

## Description: LinguaDrop

> A complete website template for a language school, ready to rebrand.

LinguaDrop is a multi-page site built with **Vite, plain HTML, CSS and a little vanilla JavaScript**. Every page is
a normal `.html` file, so you can edit it without learning a framework.

**What you get**

- **47 pages**:
  - two homepages
  - 6 language pages with level ladders and lesson samples (English, Japanese, Korean, Mandarin, Arabic, German)
  - 6 program pages
  - 5 exam-prep pages (TOEFL ITP/iBT, IELTS, JLPT, TOPIK, HSK) plus an overview and a program detail page
  - pricing, schedule, teachers and teacher profile, alumni results, testimonials, a success story
  - study and work abroad, trial booking, registration, confirmation, payment guide
  - locations, careers and a job post, blog and an article, FAQ, about, contact, terms, privacy, 404 and maintenance
- **Working interactions**:
  - a 15-question placement test with a CEFR result (A1–C2)
  - schedule filters for language, level, branch and online/offline
  - trial booking with a date and time-slot picker
  - a 4-step registration form with validation
  - a private-lesson price calculator
  - teacher and testimonial filters
- **3 themes**: light, dark and "batik" (cream and sogan brown). The visitor's choice is saved.
- **Proper multilingual typography.** Japanese, Korean, Chinese and Arabic samples carry the right `lang` attribute (Arabic also `dir="rtl"`) and load matching Noto Sans fonts only on the pages that use them. The interface font is Plus Jakarta Sans.
- **Responsive** down to 360 px.
- **Type-checked JavaScript** (`tsc --checkJs`, strict).
- **Ready to deploy**: `npm run build` gives a static site for Netlify, Vercel, Cloudflare Pages or any host.

**Tested.** We ran automated Playwright checks on all 47 pages in 3 themes at 2 screen sizes:

- no console errors and no sideways scrolling;
- axe-core WCAG 2.x A/AA checks;
- keyboard navigation;
- every form flow.

The full report is included.

**What it is not**

- The interface text is in **Indonesian**. Translate the strings in the HTML files if you need another language.
- There is **no backend**. Forms validate and show a confirmation, but they do not send data until you connect your own service.
- There is **no payment gateway**. The payment page shows example instructions.
- The demo school, people and numbers are **fictional**.

---

## Description: LinguaDash

> The admin side of a language school: students, classes, scores and money, in one dashboard.

LinguaDash is built with **React 19, TypeScript in strict mode, React Router 7 and Vite**. It uses no UI library and
no chart library: every chart is a small, readable SVG component.

**What you get (74 screens)**

| Area | Screens |
| --- | --- |
| Auth | login, sign-up, password reset, email verification, 3-step onboarding |
| Overview | active students per language, revenue this month, arrears, attendance, level-ups, trial-to-enrolment conversion |
| Students | sortable and filterable table with pagination; profile with level history and 4-skill scores (listening, speaking, reading, writing); add and edit; CSV import; printable level certificate |
| Placement tests | results, per-question answers, assign a class (creates the student) |
| Teachers | native or local, languages taught, weekly schedule, hourly pay and attendance |
| Classes | weekly calendar, class list, class detail, rooms per branch, online class links |
| Attendance | input per meeting (present, excused, sick, absent); summaries per student and per class |
| Academic | curriculum per level, question bank, mock tests (TOEFL ITP, IELTS, JLPT, TOPIK II, HSK 4) with section scores and a predicted score range, grade input, speaking/writing rubrics, level promotion |
| Trial classes | bookings with an editable status (attended, enrolled, not continuing) |
| Finance | bills, invoices (create, print, record payment), payments, arrears with WhatsApp reminders, promo codes, revenue by language and by branch |
| Communication | announcements, WhatsApp templates with variables, inbox |
| Reports | revenue, retention, level-ups, exam scores, teacher performance, trial conversion |
| Settings | school profile, languages and levels, branches, team and roles (admin, staff, teacher), price packages, notifications, subscription billing |
| Errors | 403, 404, 500 |
| Extras | UI kit (buttons, forms, tables, charts, overlays, states) and a `/screens` index |

**Details that matter**

- Rupiah formatting (`Rp 1.250.000`) and Indonesian dates.
- Demo data comes from a fixed seed: 320 students, 24 teachers, 50 classes, invoices, payments, trials and mock tests. Every screenshot looks the same every time.
- Your changes (new students, invoices, attendance, grades) are saved in `localStorage`, so the demo feels real. A reset button restores the original data.
- Accessibility:
  - native `<dialog>` modals with focus trapping
  - tabs operable with the arrow keys
  - `aria-sort` on sortable tables
  - labelled form fields
  - a data-table view for every chart
- 3 themes (light, dark, batik), the same tokens as LinguaDrop.

**What it is not**

- There is **no backend, no database and no real authentication**. The login form opens the dashboard. Replace the store hooks with your own API (the README shows where).
- There is **no payment processing, no WhatsApp API and no email sending**. Buttons open prefilled `wa.me` links.
- The interface text is in **Indonesian**.

---

## Description: Bundle

> One design system, two products: the public website and the admin dashboard.

You get everything in LinguaDrop and LinguaDash, plus:

- **One shared design**: `tokens.css` and `base.css` are byte-for-byte identical in both projects (the test suite checks this), so buttons, forms, colours and the 3 themes match exactly.
- **Linked**: the website's "Masuk" (sign in) and "Daftar" (sign up) buttons open the dashboard, the dashboard's "back to site" link returns to the website, and the visitor's theme travels with the link.
- **Shared data**: the same 24 teachers, 6 languages, levels and branches appear on the site and in the dashboard. The placement-test questions are identical on both sides.
- **A test report** covering both products: 121 pages and screens, 726 page loads, 484 axe-core runs, 10 keyboard tests and 24 end-to-end form flows.

---

## Tags

Gumroad shows a few tags; use the first five for each product.

- **LinguaDrop**: `language school`, `website template`, `html template`, `education`, `vite`, `landing page`, `course website`, `multilingual`
- **LinguaDash**: `admin dashboard`, `react dashboard`, `typescript`, `education`, `school management`, `react router`, `vite`, `svg charts`
- **Bundle**: `language school`, `admin dashboard`, `website template`, `react`, `education`, `ui kit`, `typescript`

## Suggested prices

| Product | USD | IDR (local audience) | Why |
| --- | --- | --- | --- |
| LinguaDrop | **$24** | Rp 249.000 | Comparable multi-page HTML templates sell for $19–39. The niche and the Indonesian UI put it in the middle. |
| LinguaDash | **$39** | Rp 449.000 | React + TypeScript dashboards with 50+ screens sell for $29–79. No backend, so stay below the premium tier. |
| Bundle | **$49** | Rp 549.000 | About 22% cheaper than buying both ($63). Make this the default choice. |

Launch offer: 30% off for the first 7 days with the code `LAUNCH30`. Create the offer code in Gumroad before posting.
Upsell for single-product buyers: `BUNDLE15` gives $15 off the bundle.

---

## FAQ (for the product pages)

**Is there a backend or database?**
No. Both products are front-end only. LinguaDash keeps the demo data in your browser. To go live, connect your own API, auth and database.

**Can students actually pay?**
No. There is no payment gateway. The payment pages show example instructions. Connect Midtrans, Xendit, Stripe or similar yourself.

**What language is the interface in?**
Indonesian. The foreign-language samples (Japanese, Korean, Chinese, Arabic, German) are real text with correct `lang` and `dir` attributes. To use another interface language, translate the strings in the `.html` files (LinguaDrop) and `src/pages/*.tsx` (LinguaDash).

**Do I need React for LinguaDrop?**
No. LinguaDrop is plain HTML, CSS and JS, with Vite for builds and includes.

**Which Node version?**
Node 20.19+ or 22.12+.

**Is it accessible?**
Every page and screen passed automated axe-core WCAG 2.x A/AA checks in all 3 themes, plus keyboard tests. Testing with real screen readers has not been done yet, so treat it as a strong starting point, not a certificate.

**Can I use it for client projects?**
Yes, for unlimited end products. You may not resell or share the template itself. See `LICENSE.md`.

**Updates and refunds?**
Updates are free forever. You can get a full refund within 7 days by emailing alihasanash@gmail.com.

---

## Launch posts

### X / Threads (thread)

1. I built a website + admin dashboard kit for language schools.
   LinguaDrop: a 47-page site (Vite + HTML).
   LinguaDash: a 74-screen React 19 + TypeScript dashboard.
   One design system, 3 themes. 🧵
2. The site has a working 15-question placement test (CEFR result), schedule filters, trial booking with time slots and a 4-step registration form.
   Japanese, Korean, Chinese and Arabic samples use the right lang/dir attributes and Noto fonts.
3. The dashboard covers students (4-skill scores, level history, certificates), attendance, mock tests with predicted scores, invoices in Rupiah, arrears with WhatsApp reminders, and 6 reports.
   The charts are hand-made SVG, with no chart library.
4. Honest bit: there is no backend, no payment gateway and no real login. It is a front-end kit you connect to your own API.
   It was tested with Playwright: 726 page loads in 3 themes and 2 sizes, axe-core checks and 24 form flows.
5. Bundle: $49 (or $24 for the site, $39 for the dashboard). LAUNCH30 gives 30% off this week. [link]

### LinkedIn

Many language schools run on WhatsApp groups and spreadsheets. I made a starting point for something better:
**LinguaDrop + LinguaDash**, a public website and an admin dashboard that share one design system.

- **Website**: 47 pages, placement test, schedule, trial booking, registration
- **Dashboard**: 74 screens, covering students, classes, attendance, grades, mock tests, invoices and reports
- **Stack**: Vite, React 19, TypeScript strict, React Router 7, with no UI or chart libraries
- **Tested**: Playwright on every page in 3 themes and 2 screen sizes, axe-core accessibility checks, 24 end-to-end flows

It is front-end only (no backend, payments or real login), so a developer can connect it to any stack.
Launch week: 30% off with LAUNCH30. [link]

### Upsell email (for LinguaDrop or LinguaDash buyers)

Subject: The other half of your language-school kit, $15 off

Thanks for buying [LinguaDrop/LinguaDash]! The [dashboard/website] uses the same tokens, fonts and 3 themes, and
the sign-in buttons already link the two. Code **BUNDLE15** takes $15 off the bundle. Your updates stay free forever.
