# LinguaDrop + LinguaDash bundle

A website and an admin dashboard for language schools that share the same design: the same tokens, fonts and three themes.

| Folder | What it is | Stack |
| --- | --- | --- |
| `linguadrop/` | Landing site, 47 pages | Vite, HTML, CSS, a little vanilla JS (type-checked) |
| `linguadash/` | Admin dashboard, 74 screens (73 routes + 404) | React 19, TypeScript strict, React Router 7, Vite, hand-made SVG charts |

The demo school is the fictional **Polyglot Nusantara Language Center**. It teaches English, Japanese, Korean,
Mandarin, Arabic and German, with levels in CEFR A1–C2 plus JLPT N5–N1, TOPIK 1–6 and HSK 1–6, 2 branches,
online and private classes. All people, numbers and testimonials are made up. The UI text is in Indonesian.

## Start in 2 minutes

You need Node.js 20.19+ (or 22.12+).

```bash
# Terminal 1: website on http://localhost:5173
cd linguadrop
npm install
cp .env.example .env
npm run dev

# Terminal 2: dashboard on http://localhost:5174
cd linguadash
npm install
cp .env.example .env
npm run dev
```

The "Masuk" (sign in) and "Daftar" (sign up) buttons on the website open the dashboard, and the dashboard's
"Kembali ke situs" (back to site) links return to the website. The chosen theme travels with the link,
even though the two apps run on different ports or domains.

Each product has its own `README.md` covering pages, structure, customising and deployment.
`AUDIT.md` lists what was tested and the results.

## Shared design

- `src/styles/tokens.css` and `src/styles/base.css` are byte-for-byte identical in both projects. If you change one, copy it to the other. The test suite checks that they still match.
- **Themes**: `light`, `dark`, `batik`, chosen with `data-theme` on `<html>`. A `?theme=` URL parameter overrides the visitor's saved choice.
- **Fonts**: Plus Jakarta Sans for the interface, plus Noto Sans JP, KR, SC and Arabic. The Noto fonts load only when a page shows those scripts.

## Honest limits

- **No backend, database or real login.** Data you create in LinguaDash is kept in the browser's `localStorage`.
- **No payment gateway.** Payment pages show example instructions.
- **No WhatsApp API or email sending.** Buttons open prefilled `wa.me` links.
- **Forms validate and confirm, but send nothing.** Connect them to your own services. Each README shows where.

## License and support

See `LICENSE.md`: Hanshi Studio, free updates forever, 7-day refund. Questions: alihasanash@gmail.com.

<!-- kit-only:start -->
---

## For the seller: the Gumroad kit (this part is not in the ZIP)

This folder (`bundle-kit-lingua/`) also contains:

| File / folder | What it is |
| --- | --- |
| `PANDUAN-GUMROAD.md` | Step-by-step selling guide (Indonesian) |
| `LISTING.md` | Product names, descriptions, tags, prices, FAQ and launch posts (English) |
| `AUDIT.md`, `verify-results.json` | Test numbers and the raw Playwright report |
| `images/` | Cover 1280×720, thumbnail 600×600, 5 gallery images made from real screenshots |
| `scripts/run-verify.sh` | Builds both apps, serves them and runs `verify.cjs` (Playwright + axe-core) |
| `scripts/serve.sh`, `screenshots.cjs`, `render-images.cjs` | Rebuild the screenshots and the Gumroad images |
| `scripts/make-zip.sh` | Builds `bundle.zip` without `node_modules` or `dist`, and checks for leftover placeholders |
<!-- kit-only:end -->
