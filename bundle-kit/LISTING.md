# Gumroad listing: SaaSDrop + DashDrop

Copy for each Gumroad field, in the order Gumroad asks for it. Every claim below was checked against the code and the test runs in `AUDIT.md`. Placeholders in `{{...}}` are listed at the end.

---

## Name

**SaaSDrop + DashDrop: SaaS Landing Page and Admin Dashboard Kit**

Why not "The Complete SaaS Front-End Kit": "complete" promises more than the ZIP contains. There is no backend, authentication, billing or email, and a buyer who expects those may ask for a refund. The suggested name says what is inside and uses the words people search for ("landing page", "admin dashboard").

## Summary (one line, shown next to the buy button)

A 36-page landing page and a 64-screen React + TypeScript dashboard that share one token file, three themes and one font.

## Call to action (button text)

**Buy this** (or Gumroad's default **I want this!**)

## Custom URL

`saas-landing-dashboard-kit`
Full link: `https://{{GUMROAD_USERNAME}}.gumroad.com/l/saas-landing-dashboard-kit`

## Tags

1. landing page
2. react dashboard
3. admin template
4. saas template
5. typescript

Spares if Gumroad allows more: `vite`, `html template`, `dark mode`.
Don't add `tailwind`, `nextjs` or `figma`. The kit uses none of them.

## Price

| | Price |
| --- | --- |
| SaaSDrop alone | $29 |
| DashDrop alone | $49 |
| Both bought separately | $78 |
| **Bundle, regular price** | **$59** (save $19, 24%) |
| **Bundle, launch price** | **$45** until {{LAUNCH_END_DATE}} (save $33, 42%) |

Reasoning:
1. The prices sit in the middle of what comparable templates charge. Similar HTML landing pages on Gumroad sell for about $7 to $10 for a single page; React dashboards for about $14 to $29; TypeScript and shadcn kits for $49 and up.
2. At $59 the bundle costs $10 more than DashDrop alone, so anyone who wants the dashboard has a clear reason to take both.
3. The $45 launch price rewards early buyers. Give it a real end date and raise the price when it ends; otherwise "launch price" isn't true.

(These are suggestions. The market figures come from search-result snippets in November 2026, not from checking each listing. If you change the prices, update this table, the upsell amounts in `UPSELL-EMAIL.md`, and the posts below.)

## Additional details (Gumroad key/value fields)

| Key | Value |
| --- | --- |
| Format | ZIP with source code |
| Includes | SaaSDrop (36 pages) and DashDrop (64 screens): 100 in total |
| Built with | Vite 8, React 19, TypeScript, React Router 7, plain CSS |
| Themes | Light, dark, sand |
| Requires | Node.js 20.19+ or 22.12+ |
| License | Unlimited projects for you and your clients |

---

## Description

A landing page and an admin dashboard for the same SaaS product, built to look like one company from the first visit to the logged-in app.

**SaaSDrop** is the marketing site. **DashDrop** is the app behind it. Both read the same `tokens.css` file and use the same font (DM Sans), the same buttons and inputs, and the same three themes. The "Sign in" and "Get started" buttons on the landing page open the dashboard's login and signup screens. Point them at your app with one setting.

The demo content is for Beacon, a fictional revenue analytics company, so you can see how a real product would fill the pages.

**Live demos**
- Landing page: {{DEMO_URL_SAASDROP}}
- Dashboard: {{DEMO_URL_DASHDROP}}

### What's inside

**SaaSDrop: landing page (36 pages)**
- Home: hero with an app preview, features, feature rows, steps, pricing teaser, quote, FAQ, call to action
- Pricing: monthly/yearly toggle, three plans, comparison table, billing FAQ
- Features overview plus three feature detail pages
- Integrations directory with a filter, plus an integration detail page
- A second home page layout, three solution pages (founders, finance, customer success), customer stories (sample, clearly marked)
- API docs with copyable code, status page with 90-day uptime bars, roadmap with voting
- Careers and a job page with an application form, press kit, book-a-demo with time slots, waitlist, maintenance and 500 pages
- Security page and a "vs. spreadsheets" comparison page (sample text marked where claims need to be yours)
- About, Changelog, Contact (form with in-browser validation)
- Blog index with topic filter and newsletter form, plus a blog post layout with a table of contents
- Help center with live search, plus a help article layout with "Was this helpful?"
- Terms of service and privacy policy layouts (sample text, clearly marked; replace with your own)
- 404 page
- Shared header and footer, written once and included on every page at build time
- Built with Vite, HTML, CSS and one small JavaScript file. No framework.

**DashDrop: admin dashboard (64 screens), React + TypeScript**
- Sign in and onboarding (10): sign in, sign up, verify email, two-factor code, reset password, new password, accept invite, and a 3-step onboarding
- Dashboard and reports (13): overview, getting started, analytics, MRR, churn, cohorts, revenue by plan, revenue by country, forecast, saved reports, report builder, customers, customer detail
- Billing (9): subscriptions, subscription detail, invoices, new invoice with live totals, printable invoice, payments, refunds and disputes, plans and prices, coupons
- Customers (7): pipeline board, renewals calendar, segments, segment builder with live preview, at-risk accounts with a health score, CSV import with column matching, edit customer
- Alerts, messages and tools (6): alert rules, rule editor with a live summary, notifications, inbox with replies, global search, what's new
- Team (3): members, roles and permissions, audit log
- Settings (7): general, security, plan and billing, integrations, API keys, webhooks, data and privacy
- Error pages: 404, 403, 500
- UI kit (6): buttons and badges, forms, tables, charts, overlays, states
- Reusable components: modal and drawer (focus stays inside, Escape closes), toasts, dropdown menus, tabs, stepper, data table with sorting, pagination and row selection
- Charts are small SVG components. No chart library to install or keep updated.
- Strict TypeScript, with typed demo data whose numbers add up across screens
- Each screen loads on demand, so the first visit downloads only the code it needs

**Also in the ZIP**
- A README for using both together: shared tokens, linking the buttons to your app, and two ways to deploy (separate subdomains, or the app under `/app/` on the same domain)
- A README in each product folder
- Rewrite files for Netlify and Vercel (single-page app routing)
- License covering both templates

### How they fit together

- **One token file.** Change `--accent` in `tokens.css`, copy the file to the other product, and both change color.
- **Three themes.** Light, dark and sand. Visitors can switch, and their choice is saved in the browser. When the site and app share a domain (app under `/app/`), the choice carries from the site into the app.
- **Linked buttons.** Set `VITE_APP_URL` and the landing page buttons open `/login` and `/signup` in your app. Set `VITE_SITE_URL` and the app's "Back to site" link returns to your landing page.

### What was tested

- `npm install` and `npm run build` succeed for both templates, including from a fresh unzip of the ZIP. DashDrop passes a strict TypeScript check.
- Every page of both templates loads in all three themes at phone (390px), tablet (768px) and desktop (1440px) widths in Chromium, with no console errors and no sideways page scrolling.
- The main flows work end to end in the browser: sign-up through onboarding, dialogs and menus, invoice totals, search, filters and exports.
- Main text colors meet the WCAG AA contrast ratio (4.5:1) in all three themes.

Not tested: Safari, Firefox, real phones, screen readers, and deploys to specific hosting providers.

### What you need

- Node.js 20.19 or newer (or 22.12+) and npm
- Basic HTML and CSS for SaaSDrop. React and some TypeScript for DashDrop.

### Not included

- Backend, database, authentication, payments or email sending
- Figma or other design files
- Tailwind (styles are plain CSS with custom properties)
- Next.js (both templates use Vite)

### License

Use both templates in unlimited personal and commercial projects, including client work. You may not resell or share the templates themselves. Full text in `LICENSE.md`.

### Updates and refunds

Updates: Free updates for the life of the product. New versions are added to your Gumroad library at no extra cost.
Refunds: Full refund within 7 days of purchase if the templates do not work as described. Email the support address with your order details.
Questions: alihasanash@gmail.com

---

## FAQ

**Can I use the templates for client projects?**
Yes. Build as many sites and apps as you like, for yourself or for clients. You can hand the finished project to your client. You can't resell the templates themselves.

**Can I use only one of the two?**
Yes. Each works on its own and has its own README.

**Does it include a backend or login system?**
No. The sign-in, sign-up and billing screens are UI only, and the forms send nothing. The READMEs show where to connect your own.

**Is DashDrop TypeScript?**
Yes, with strict mode on. SaaSDrop is plain HTML, CSS and JavaScript.

**Does it use Tailwind or Next.js?**
No. Styles are plain CSS with custom properties, and both templates use Vite. SaaSDrop builds to static HTML files. DashDrop builds to a single-page React app.

**How do I change the colors?**
Edit `tokens.css` in one product and copy it to the other. Each theme has the same token names.

**Which browsers does it support?**
The build targets Chrome and Edge 111+, Firefox 114+ and Safari 16.4+. Testing was done in Chromium. Safari and Firefox were not tested.

**Where can I host it?**
On any static host. SaaSDrop is plain HTML files. DashDrop needs a rule that serves `index.html` for every path; files for Netlify and Vercel are included, but deploys there were not tested.

**I already bought SaaSDrop or DashDrop. Can I upgrade?**
Yes. Email alihasanash@gmail.com and you'll get a code to buy the other product for the difference.

**Do I get updates?**
Free updates for the life of the product. New versions are added to your Gumroad library at no extra cost.

**What is the refund policy?**
Full refund within 7 days of purchase if the templates do not work as described. Email the support address with your order details.

---

## Launch post: X

Main post (about 260 characters with a short date such as "Nov 15"; X counts any link as 23):

> SaaSDrop + DashDrop is out: a 36-page landing page and a 64-screen React + TypeScript dashboard that share one token file, three themes and one font.
>
> "Get started" on the site opens the app's signup screen.
>
> $45 until {{LAUNCH_END_DATE}}, then $59.
> {{GUMROAD_URL_BUNDLE}}

Optional follow-up replies:

> 1/ The landing page is Vite + plain HTML and CSS: home, pricing, blog, help center and more. The dashboard covers sign-in, onboarding, reports, customers and billing. Charts are small SVG components, no chart library.

> 2/ Change --accent in tokens.css, copy the file to the other project, and both match again. Light, dark and sand themes included.

> 3/ Demos: {{DEMO_URL_SAASDROP}} and {{DEMO_URL_DASHDROP}}

## Launch post: LinkedIn

> I've released SaaSDrop + DashDrop, a pair of front-end templates for SaaS products.
>
> SaaSDrop is the marketing site: 36 pages built with Vite and plain HTML and CSS, including features, solutions, a blog, a help center, API docs and a status page. DashDrop is the app: 64 screens built with React 19 and TypeScript, from sign-up and onboarding to MRR reports, customers, invoices and subscriptions.
>
> I built them to share one design system. Both read the same token file and use the same font and the same three themes (light, dark, sand). The "Sign in" and "Get started" buttons on the landing page open the dashboard's login and signup screens, so the whole path from first visit to the app looks like one product.
>
> Before release I checked every page in all three themes at phone, tablet and desktop widths, ran the main flows end to end in a browser, and confirmed both projects install and build from the downloaded ZIP.
>
> There's no backend in the kit. It's the front end, ready to connect to yours.
>
> Launch price is $45 until {{LAUNCH_END_DATE}}, then $59.
>
> Demos: {{DEMO_URL_SAASDROP}} and {{DEMO_URL_DASHDROP}}
> Get it: {{GUMROAD_URL_BUNDLE}}

---

## Placeholders in this file

| Placeholder | What to put there |
| --- | --- |
| `{{DEMO_URL_SAASDROP}}` | Live demo of the landing page |
| `{{DEMO_URL_DASHDROP}}` | Live demo of the dashboard |
| `{{SUPPORT_EMAIL}}` | Address buyers can write to |
| `{{UPDATE_POLICY}}` | For example "Free updates for 12 months" or "Free updates for the life of the product" |
| `{{REFUND_POLICY}}` | Your refund terms. Gumroad also has a refund policy setting; keep them the same |
| `{{GUMROAD_USERNAME}}` | Your Gumroad username |
| `{{GUMROAD_URL_BUNDLE}}` | Link to the published bundle |
| `{{LAUNCH_END_DATE}}` | Last day of the launch price |
