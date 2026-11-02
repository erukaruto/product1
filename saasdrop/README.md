# SaaSDrop

A multi-page landing page template for a SaaS product. Plain HTML, CSS and one small JavaScript file, built with Vite. No framework.

The demo content is for Beacon, a fictional revenue analytics company. DashDrop, the matching admin dashboard, uses the same design tokens and the same demo company.

## Requirements

- Node.js 20.19 or newer, or 22.12 or newer (Vite 8 needs one of these)
- npm

Tested with Node 22.23.4 and npm 10.9.9.

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production files in dist/
npm run preview   # serves dist/ on http://localhost:4173
```

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home: hero with an app preview, features, two feature rows, steps, pricing teaser, quote, FAQ, call to action |
| `home-2.html` | Second home layout: split hero with the app preview, audience cards, metrics strip. Rename it to `index.html` if you prefer it |
| `solutions-founders.html`, `solutions-finance.html`, `solutions-success.html` | Solution pages for three audiences: problems, how Beacon helps, related features |
| `customers.html` | Customer stories grid (fictional samples, marked as such) |
| `customer-story.html` | One customer story: summary facts, challenge, approach, results (fictional sample) |
| `pricing.html` | Pricing: monthly/yearly toggle, three plans, comparison table, billing FAQ |
| `about.html` | About: story, values, team |
| `changelog.html` | Changelog: dated entries with New / Improved / Fixed tags |
| `contact.html` | Contact: form with client-side validation, contact cards |
| `features.html` | Features overview with links to the detail pages |
| `feature-metrics.html`, `feature-alerts.html`, `feature-customers.html` | Feature detail: hero with a visual, three points, FAQ, related features |
| `integrations.html` | Integrations directory with a group filter |
| `integration-detail.html` | Integration detail: setup steps, table of synced data, facts sidebar |
| `security.html` | Security practices (sample text, see below) |
| `compare.html` | Comparison with a spreadsheet: table, when to keep the sheet, migration steps |
| `docs.html` | API reference: sidebar, endpoints, code samples with Copy buttons, error and rate-limit tables (sample API) |
| `status.html` | System status: components, 90-day uptime bars, past incidents (made-up data, marked as such) |
| `roadmap.html` | Roadmap: Now / Next / Later columns with vote buttons (votes saved in the browser only) |
| `careers.html` | Careers: values, benefits, open roles |
| `job.html` | Job post with an application form (same validation as the contact form) |
| `press.html` | Press kit: facts, boilerplate with a Copy button, logo downloads, press contact |
| `demo.html` | Book a demo: form with validation, what to expect |
| `waitlist.html` | Waitlist for an upcoming product, with an email form |
| `blog.html` | Blog: featured post, topic filter, post grid, newsletter form |
| `blog-post.html` | Blog post: table of contents, callout, table, quote, copy-link button, related posts |
| `help.html` | Help center: live search with highlighted matches, 6 categories, 22 article links |
| `help-article.html` | Help article: breadcrumb, numbered steps, callout, "Was this helpful?" |
| `terms.html` | Terms of service (sample text, see below) |
| `privacy.html` | Privacy policy (sample text, see below) |
| `404.html` | Not found page |
| `500.html` | Server error page |
| `maintenance.html` | Maintenance page without header or footer (`noindex`) |

The blog cards all link to the one sample post, and the help center links all go to the one sample article. Copy those two files to add real posts and articles.

The customer stories, the status page and the API reference describe the fictional Beacon. Replace them with your own, or delete the pages and their links in `src/partials/footer.html`.

**The terms, privacy and security pages contain sample text for a fictional company, not legal advice.** On the security page, only describe practices you follow and certifications you hold. Each starts with a visible notice saying so. Replace the text with documents written for your business and reviewed by a lawyer, and remove the notice.

## Folder structure

```
saasdrop/
  index.html, pricing.html, about.html, changelog.html, contact.html,
  features.html, feature-metrics.html, feature-alerts.html, feature-customers.html,
  integrations.html, integration-detail.html, security.html, compare.html,
  blog.html, blog-post.html, help.html, help-article.html, terms.html, privacy.html, 404.html,
  home-2.html, solutions-founders.html, solutions-finance.html, solutions-success.html,
  customers.html, customer-story.html, docs.html, status.html, roadmap.html, careers.html,
  job.html, press.html, demo.html, waitlist.html, maintenance.html, 500.html
  src/
    partials/      header.html, footer.html, head.html, logo.html, theme-switch.html
    scripts/       main.js (theme switch, mobile menu, pricing toggle, contact form,
                   blog filter, newsletter form, help search, copy link, article feedback,
                   roadmap votes, copy buttons)
    styles/        tokens.css (colors), base.css (layout, buttons, header, footer), sections.css (page sections)
  public/          favicon.svg, robots.txt (copied to dist as-is)
  vite.config.js   page list, HTML includes, app URL
  .env.example
```

### Shared header and footer

Each page pulls in the shared parts with a comment:

```html
<!-- @include header.html -->
```

A small plugin in `vite.config.js` replaces these comments with the files in `src/partials/` during `dev` and `build`. Edit the header once and every page updates.

To add a page: create `newpage.html` (copy `about.html`), add `'newpage'` to the `pages` list in `vite.config.js`, and link to it from `src/partials/header.html`.

## Colors and themes

All colors live in `src/styles/tokens.css`. There are three themes: `light`, `dark` and `sand`. Each defines the same tokens:

| Token | Used for |
| --- | --- |
| `--bg` | Page background |
| `--surface` | Cards, panels, inputs |
| `--ink` | Main text |
| `--muted` | Secondary text |
| `--line` | Borders and dividers |
| `--accent` | Buttons, links, chart lines |
| `--onaccent` | Text and icons on the accent color |
| `--gold` | Small highlights such as badges. Decorative only: in the light theme it does not have enough contrast for body text |
| `--good`, `--warn`, `--bad` | Status colors |

The theme is set on `<html data-theme="...">` before the page renders, in this order:

1. `?theme=dark` (or `light`, `sand`) in the URL
2. The visitor's last choice, saved in `localStorage` under `beacon-theme`
3. The system setting (dark if the visitor's device prefers dark, otherwise light)

To make a single-theme site, delete the theme switch from `src/partials/header.html` and `footer.html` and set `data-theme` on the `<html>` tag of each page.

## Font

DM Sans (variable), installed from npm through `@fontsource-variable/dm-sans` and bundled into `dist/`. No request to Google Fonts. To change the font, replace the import at the top of `src/scripts/main.js` and the `--font` value in `tokens.css`.

## Linking to your app

The "Sign in" button links to `<VITE_APP_URL>/login`. The "Get started" and "Start free trial" buttons link to `<VITE_APP_URL>/signup`.

```bash
cp .env.example .env
# then edit .env
VITE_APP_URL=https://app.example.com
```

If `VITE_APP_URL` is not set, the links point to `http://localhost:5174`, where DashDrop's dev server runs. You can also set it on the build command or in your host's environment settings:

```bash
VITE_APP_URL=https://app.example.com npm run build
```

In the HTML the links are written as `__APP_URL__/login`. Use the same placeholder for any new link to your app.

## Forms

The contact form (also used on `demo.html` and `job.html`), the newsletter form (also on `waitlist.html`), the roadmap votes and the "Was this helpful?" buttons work in the browser but send nothing: there is no backend. Each has a comment in `src/scripts/main.js` (search for "Contact form", "Newsletter form" and "Was this helpful") showing where to add the request to your service.

## Deploying

`npm run build` creates a static site in `dist/`. Upload it to any static host.

- Build command: `npm run build`
- Output folder: `dist`
- Environment variable: `VITE_APP_URL`

Links between pages use `.html` file names (`/pricing.html`), so they work on hosts without "clean URL" settings. Paths start at the domain root. To serve the site from a sub-folder, set `base` in `vite.config.js` and update the links in the partials.

Whether a host shows `404.html` for unknown paths depends on the host. Check your host's documentation. (`npm run preview` returns a plain 404 without the page.)

## Before you launch

- Replace the Beacon name, logo (`src/partials/logo.html`, `public/favicon.svg`), copy, quote, team and prices.
- Remove "Demo content: Beacon is a fictional company." from `src/partials/footer.html`.
- Update `<title>` and `<meta name="description">` on each page.
- Set `VITE_APP_URL`.
- Connect the contact and newsletter forms.
- Replace the sample terms, privacy and security text, and remove the "Sample text" notice.
- Replace or delete the sample customer stories, status page and API reference.

## Browser support

The build targets the browsers in Vite 8's default list (Chrome and Edge 111+, Firefox 114+, Safari 16.4+), and the CSS uses `color-mix()`, which those versions support. `text-wrap: balance` needs newer versions; older browsers ignore it and headings wrap normally. Only Chromium was tested, at 390, 768 and 1440 pixels wide.

## License

See `LICENSE.md`.
