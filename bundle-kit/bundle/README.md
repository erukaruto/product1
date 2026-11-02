# SaaSDrop + DashDrop

Two templates for the same fictional product, Beacon:

- `saasdrop/`: the marketing site. 36 pages, built with Vite, HTML, CSS and a little vanilla JavaScript.
- `dashdrop/`: the app behind it. 64 screens, built with React 19, TypeScript, React Router 7 and Vite.

Both use the same color tokens, the same three themes and the same font, so a visitor who clicks "Get started" on the landing page lands in an app that looks like it belongs to the same company.

Each folder has its own README with full details. This file covers using them together.

## Contents

```
saasdrop/      landing page template (README.md inside)
dashdrop/      admin dashboard template (README.md inside)
README.md      this file
LICENSE.md     license for both templates
```

`node_modules` is not included. Run `npm install` in each folder.

## Run both locally

You need Node.js 20.19+ or 22.12+. Open two terminals:

```bash
# terminal 1
cd saasdrop
npm install
npm run dev        # http://localhost:5173

# terminal 2
cd dashdrop
npm install
npm run dev        # http://localhost:5174
```

The default links already point at each other. On the landing page, "Sign in" opens `http://localhost:5174/login` and "Get started" opens `http://localhost:5174/signup`. In the app, the logo and "Back to site" on the sign-in screens open `http://localhost:5173`.

## 1. Shared theme tokens

`saasdrop/src/styles/tokens.css` and `dashdrop/src/styles/tokens.css` are the same file. It defines three themes (`light`, `dark`, `sand`) with the same tokens:

| Token | Used for |
| --- | --- |
| `--bg` | Page background |
| `--surface` | Cards, panels, inputs |
| `--ink` | Main text |
| `--muted` | Secondary text |
| `--line` | Borders and dividers |
| `--accent` | Buttons, links, chart lines |
| `--onaccent` | Text and icons on the accent color |
| `--gold` | Small highlights (decorative, not for body text) |
| `--good`, `--warn`, `--bad` | Status colors |

Both products also use DM Sans for all text, installed from npm, with the same button, input and theme-switch styles.

**To change your brand colors:** edit the file in one product, then copy it to the other.

```bash
# macOS / Linux, from the bundle folder
cp saasdrop/src/styles/tokens.css dashdrop/src/styles/tokens.css
```

```bat
:: Windows
copy saasdrop\src\styles\tokens.css dashdrop\src\styles\tokens.css
```

**How the theme is chosen** (same logic in both): `?theme=dark` in the URL, then the visitor's saved choice (`localStorage` key `beacon-theme`), then the system setting.

The saved choice carries from the site to the app only when both are served from the same origin (same scheme, domain and port), as in Option B below. With separate subdomains (Option A), each product remembers its own choice.

DashDrop adds three chart colors in `dashdrop/src/styles/app.css` (`--loss`, `--loss-strong`, `--accent-light`). They are mixed from the shared tokens, so they follow your brand colors without extra work.

## 2. Linking "Sign in" and "Get started" to the app

The landing page reads the app's address from `VITE_APP_URL`:

| Button | Opens |
| --- | --- |
| Sign in (header, mobile menu, footer) | `<VITE_APP_URL>/login` |
| Get started, Start free trial, Create an account | `<VITE_APP_URL>/signup` |

The app reads the landing page's address from `VITE_SITE_URL` (logo and "Back to site" on the sign-in screens).

Set them in a `.env` file in each folder (copy `.env.example`) or in your host's environment settings:

```bash
# saasdrop/.env
VITE_APP_URL=https://app.example.com

# dashdrop/.env
VITE_SITE_URL=https://example.com
```

No trailing slash. Both values are read at build time, so rebuild after changing them.

If you use your own app instead of DashDrop, point `VITE_APP_URL` at it and make sure it has `/login` and `/signup` routes. Or change the paths in `saasdrop/src/partials/header.html`, `footer.html` and the pages.

## 3. Deploying both

### Option A: two subdomains (simplest)

`example.com` serves the landing page and `app.example.com` serves the app. Create two projects on your host:

| | Landing page | App |
| --- | --- | --- |
| Folder | `saasdrop` | `dashdrop` |
| Build command | `npm run build` | `npm run build` |
| Output folder | `dist` | `dist` |
| Environment | `VITE_APP_URL=https://app.example.com` | `VITE_SITE_URL=https://example.com` |
| Extra | none | serve `index.html` for every path (see below) |

The app is a single-page app, so every path such as `/customers/cus_1003` must return `index.html`. `dashdrop/public/_redirects` (Netlify) and `dashdrop/vercel.json` (Vercel) are included. These follow each host's documented format but were not tested on those hosts. On other hosts, add a rewrite from all paths to `/index.html`.

### Option B: one domain, app under /app/

`example.com` serves the landing page and `example.com/app/` serves the app. In this setup the theme choice carries from the site into the app.

1. In `dashdrop/vite.config.ts`, set `base: '/app/'`.
2. Build both:
   ```bash
   cd saasdrop && VITE_APP_URL=https://example.com/app npm run build
   cd ../dashdrop && VITE_SITE_URL=https://example.com npm run build
   ```
3. Copy `dashdrop/dist` into `saasdrop/dist/app`, then deploy `saasdrop/dist`.
4. On your host, rewrite `/app/*` to `/app/index.html`.

This setup was tested with a local static server that applied the rewrite in step 4. The tested results: the landing page links open `/app/login`, deep links like `/app/customers/cus_1003` load, the theme carries over, and unknown paths outside `/app/` show `404.html`.

## Before you launch

- Replace Beacon (name, logo, favicon, copy, demo data) in both products. The README in each folder lists the files.
- Remove the demo notes from both products. The footer note is in `saasdrop/src/partials/footer.html`; the sign-in notes are in `dashdrop/src/pages/auth/Login.tsx` and `dashdrop/src/components/AuthLayout.tsx`.
- Replace the sample terms, privacy and security text in `saasdrop/terms.html`, `privacy.html` and `security.html`. It is placeholder text, not legal advice, and the security page must describe your real practices. Customer stories (`customers.html`, `customer-story.html`) and `status.html` are fictional samples too.
- Connect the forms (`saasdrop/src/scripts/main.js`) and authentication (`dashdrop/src/pages/auth/`).
- Set `VITE_APP_URL` and `VITE_SITE_URL` for production.

## What was tested

Before release, both templates were built with Node 22.23.4 and checked in Chromium:

- `npm install` and `npm run build` succeed in both folders. DashDrop's build includes a strict TypeScript check.
- Every page (36 + 64, plus a settings tab URL and the "All screens" index) loads in all three themes at 390, 768 and 1440 pixels wide with no console errors and no sideways page scrolling.
- The tokens read from the page are identical in both products for each theme. DM Sans is the only font in use.
- Landing page buttons open the app's `/login` and `/signup` routes; the app's "Back to site" link returns to the landing page.
- The main flows work end to end, including sign-up through onboarding, dialogs (focus stays inside, Escape closes, focus returns), menus inside tables, invoice totals, search and filters.

Not tested: Safari, Firefox, real phones, screen readers, and deploys to specific hosts.

## Support and license

Support: {{SUPPORT_EMAIL}}
Updates: {{UPDATE_POLICY}}
License: see `LICENSE.md`. One license covers both templates.
