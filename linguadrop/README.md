# LinguaDrop: landing site template for language schools

A multi-page marketing site for a language school, built with **Vite + plain HTML + CSS + a little vanilla JS**.
The demo school is the fictional *Polyglot Nusantara Language Center* (English, Japanese, Korean, Mandarin,
Arabic and German, 2 branches, online and private classes). Every name, number and testimonial is made up.

The interface copy is in **Indonesian (Bahasa Indonesia)**. Foreign-language samples are marked with the
correct `lang` attribute (and `dir="rtl"` for Arabic), so screen readers and fonts handle them properly.

## What is inside

- **47 pages**, listed below. Each page is a plain `.html` file in the project root, so you can edit it without knowing a framework.
- **3 themes**: light, dark and *batik* (cream, sogan brown and indigo). Visitors switch themes in the header, and the choice is saved.
- **Fonts**: Plus Jakarta Sans for the interface. Noto Sans JP, KR, SC and Arabic load automatically, only on pages that show those scripts.
- **Interactive parts** in vanilla JS, type-checked with `tsc --checkJs`:
  - 15-question placement test with a CEFR result page
  - class schedule with filters for language, level, branch and online/offline
  - trial-class booking with a date and time-slot picker
  - 4-step registration form, confirmation page and payment instructions
  - teacher filter and teacher profiles
  - private-lesson price calculator
  - tabs, FAQ and testimonial filters
- **Responsive** down to 360 px wide.
- **"Masuk" and "Daftar" buttons** open LinguaDash (the admin dashboard sold separately or in the bundle). The current theme is passed along in the link.

### Pages

| Group | Files |
| --- | --- |
| Home | `index.html`, `beranda-2.html` |
| Languages | `bahasa-inggris`, `bahasa-jepang`, `bahasa-korea`, `bahasa-mandarin`, `bahasa-arab`, `bahasa-jerman` |
| Programs | `program-general`, `program-conversation`, `program-business-english`, `program-kids-teens`, `program-privat`, `program-online`, `studi-kerja-luar-negeri` |
| Exam prep | `ujian` (overview), `ujian-toefl`, `ujian-ielts`, `ujian-jlpt`, `ujian-topik`, `ujian-hsk`, `ujian-detail` |
| Placement test | `tes-penempatan`, `hasil-tes` |
| Pricing & schedule | `harga`, `jadwal` |
| Teachers & results | `pengajar`, `profil-pengajar`, `alumni`, `testimoni`, `cerita-sukses` |
| Sign-up | `trial`, `pendaftaran`, `konfirmasi`, `cara-pembayaran` |
| School | `tentang`, `lokasi`, `karier`, `lowongan`, `kontak` |
| Content | `blog`, `artikel`, `faq` |
| Legal & status | `syarat`, `privasi`, `404`, `maintenance` |

## Quick start

Requires Node.js 20.19+ (or 22.12+).

```bash
npm install
cp .env.example .env      # set VITE_APP_URL and VITE_WHATSAPP
npm run dev               # http://localhost:5173
npm run typecheck         # type-checks the JS with TypeScript (no build output)
npm run build             # static site in dist/
npm run preview           # serve dist/ on http://localhost:4173
```

`dist/` is a static site. Upload it to Netlify, Vercel, Cloudflare Pages, GitHub Pages or any web host.
Unknown URLs show `404.html` on most static hosts.

## Customising

| What | Where |
| --- | --- |
| Colours, radius, spacing, the 3 themes | `src/styles/tokens.css` (keep it identical to LinguaDash if you use both) |
| Buttons, forms, cards, tables | `src/styles/base.css` (shared with LinguaDash) |
| Header, footer, logo | `src/partials/*.html` |
| Languages, levels, prices, teachers, branches | `src/data/school.js` |
| Placement-test questions | `src/data/placement.js` |
| LinguaDash address and WhatsApp number | `.env` (`VITE_APP_URL`, `VITE_WHATSAPP`) |
| Page text | the page's `.html` file |

How the build works:

- **Includes.** Write `<!-- @include header.html -->` to insert a partial; `vite.config.js` does this at build time.
- **New pages.** Any `.html` file you add to the project root is built automatically.
- **Navigation highlight.** `<body data-nav="harga">` highlights every link marked `data-nav-link="harga"`.
- **Foreign text.** Always wrap it like `<span lang="ja">こんにちは</span>`, or `<span lang="ar" dir="rtl">مرحبا</span>` for Arabic. The matching Noto Sans font then loads for that page only.

## What this template does not do

This is a front-end template. It has **no backend**, **no payment gateway** and **no real login**.

- **Forms** (trial booking, registration, contact, job application) validate input and show a confirmation, but they send nothing anywhere. Connect them to your own service, for example a form endpoint, Google Apps Script or your API. See the `submit` handlers in `src/scripts/pages/`.
- **Payment pages** show example instructions with fake account numbers.
- **Placement-test answers and registrations** are kept only in the visitor's browser (`sessionStorage`).

## Accessibility

What the template already does:

- skip link
- visible focus states
- keyboard-operable menus and tabs
- labelled form controls with Indonesian error messages
- `lang` and `dir` on foreign text
- token colour pairs that meet WCAG AA contrast

The bundle's test report (`bundle-kit-lingua/AUDIT.md`) lists the automated results.

## License

See `LICENSE.md`. Fonts are under the SIL Open Font License, via Fontsource.
