# Audit: LinguaDrop + LinguaDash

Real numbers, taken from the code and from the automated test run in `verify-results.json`.
Anything that was **not** tested is listed at the end.

- **Test run**: 2 November 2026 (`generatedAt: 2026-11-02T23:32:11Z`)
- **Environment**: Node 22.23.4, Playwright 1.63.0, Chromium 153.0.8010.12, axe-core 4.14.0
- **How to reproduce**: `bash bundle-kit-lingua/scripts/run-verify.sh`. The script builds both apps, serves them on :4173 and :4174, runs every check and writes `verify-results.json`.

## 1. Code facts

| | LinguaDrop | LinguaDash |
| --- | --- | --- |
| Pages / screens | 47 HTML pages | 73 routes + 1 catch-all 404 = 74 screens |
| Source | 47 `.html` files (4,748 lines), 20 JS files (1,110 lines), 3 CSS files (930 lines) | 38 TS/TSX files (6,539 lines), 3 CSS files (884 lines) |
| Runtime dependencies | 5 font packages (Fontsource) | React, React DOM, React Router, 5 font packages |
| UI or chart libraries | none | none (charts are hand-made SVG) |
| Type checking | `tsc --checkJs`, strict, 0 errors | `tsc -b`, strict + `noUnusedLocals` / `noUnusedParameters`, 0 errors |
| `npm run build` | passes | passes (runs `tsc -b` first) |
| Main bundle (gzip) | CSS 10.5 KB, JS 2.3 KB, shared demo data 4.9 KB | JS 81.3 KB, CSS 11.9 KB, plus 22 smaller JS chunks (each area of the app loads on demand) |
| Fonts | Plus Jakarta Sans everywhere; Noto Sans JP, KR, SC and Arabic only on pages that show those scripts | same |

`dist/` is about 15–16 MB per product. Almost all of it is the Noto CJK font files, split into 354 small
unicode-range files. A browser downloads only the pieces whose characters actually appear on the page.

**Shared design.** `tokens.css` and `base.css` are byte-for-byte identical in both products: the SHA-256 hashes match
in `verify-results.json`. The computed CSS custom properties are also identical in all three themes.

**Demo data.** Generated from a fixed seed:

- 320 students, 24 teachers, 50 classes in 2 branches plus online
- 146 trial bookings, 88 placement-test results, 7 mock tests
- invoices and payments for the last 13 months

The dashboard's "today" is fixed at 18 November 2026, so the numbers never change. Everything is fictional.

## 2. Every page in 3 themes × 2 screen sizes

121 routes (47 + 74) × 3 themes (light, dark, batik) × 2 viewports (1440×900 desktop, 360×780 mobile) = **726 page loads**.

| Check, on every one of the 726 loads | Result |
| --- | --- |
| HTTP status < 400 | 726 / 726 |
| Requested theme applied (`data-theme`) | 726 / 726 |
| Console errors or uncaught exceptions | **0** |
| Horizontal page scroll (`scrollWidth > innerWidth`) | **0** |
| Exactly one `<h1>` | 726 / 726 |
| `<html lang="id">` | 726 / 726 |
| Body font is Plus Jakarta Sans and the font loaded | 726 / 726 |
| Japanese, Korean, Chinese or Arabic text without a matching `lang` ancestor | **0** text nodes |
| Arabic text without `dir="rtl"` | **0** text nodes |
| Shown foreign scripts whose Noto font did not load | **0** |
| `input`, `select` or `textarea` without a label | **0** |

26 of the 121 routes show Japanese, Korean, Chinese or Arabic text. On those, the matching Noto font was confirmed loaded.

## 3. Accessibility

### axe-core (WCAG 2.0, 2.1 and 2.2, levels A and AA)

Tags checked: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`.
Each route was checked 4 times: light, dark and batik on desktop, plus light on mobile.
That makes **484 axe runs with 0 violations**. This includes `color-contrast` in all three themes.

### Token contrast (computed values, WCAG 2.x formula)

The lowest pair in each theme, out of 13 pairs per theme (39 in total, all passing):

| Theme | Lowest text pair | Lowest UI pair (input borders, needs ≥ 3:1) |
| --- | --- | --- |
| light | `good` on `surface` 5.50:1 | `line-strong` on `surface` 3.53:1 |
| dark | `muted` on `surface-2` 6.61:1 | `line-strong` on `surface` 3.04:1 |
| batik | `muted` on `surface-2` 5.90:1 | `line-strong` on `surface` 3.42:1 |

**Chart palette.** Validated with a colour-vision-deficiency checker: the worst adjacent pair has ΔE 9.1 in light and
8.4 in dark, above the target of 8. Some light-mode series colours are below 3:1 against the surface (3 of 6 on
white, 4 of 6 on the batik cream). That is why charts never rely on colour alone:

- bar lists and funnels print their values as text;
- line and column charts have a legend, a hover tooltip and a "Lihat tabel data" table view.

### Keyboard (10 / 10 pass)

1. LinguaDrop: the first Tab reaches the skip link, and Enter moves focus to `<main>`.
2. LinguaDrop: a header dropdown opens with Enter; Escape closes it and returns focus.
3. LinguaDrop: the mobile menu opens with Enter and closes with Escape.
4. LinguaDrop: the price tabs switch with the arrow keys.
5. LinguaDrop: the placement test can be started and answered with the keyboard only.
6. LinguaDash: the first Tab reaches the skip link, and Enter moves focus to the content.
7. LinguaDash: a sidebar group expands with the keyboard.
8. LinguaDash: a modal keeps focus inside after 6 Tabs; Escape closes it and focus returns to the button that opened it.
9. LinguaDash: the rubric tabs switch with the arrow keys.
10. LinguaDash: the login form submits with Enter.

## 4. Form flows (24 / 24 pass, 89 / 89 assertions)

| Flow | Assertions |
| --- | --- |
| LinguaDrop: 15-question placement test → CEFR result (8 correct = B1, review list, link carries the level) | 6 |
| LinguaDrop: trial booking (validation, invalid phone rejected, date + free slot, booking code) | 5 |
| LinguaDrop: 4-step registration for a 14-year-old (guardian required, promo applied, total correct, QRIS confirmation) | 11 |
| LinguaDrop: schedule filters (language, level, branch, mode, empty state, reset, filters kept in URL) | 7 |
| LinguaDrop: teacher filter → profile (incl. `lang="de"` on a German quote) | 3 |
| LinguaDrop: private-lesson calculator and price tabs | 3 |
| LinguaDrop: contact form validation and success | 2 |
| LinguaDrop: "Masuk" and "Daftar" open LinguaDash with the same theme | 3 |
| LinguaDrop: unknown URL returns HTTP 404 with the 404 page | 3 |
| LinguaDrop: theme choice persists across pages | 2 |
| LinguaDash: sign-up → verify email → 3-step onboarding → overview | 4 |
| LinguaDash: add student (validation), find in list, edit status, survives reload | 5 |
| LinguaDash: create invoice with promo → detail total matches → record payment → paid | 6 |
| LinguaDash: attendance per meeting, restored after reload, shown in summary | 3 |
| LinguaDash: 4-skill grade input (0–100 range enforced) → scores on student profile | 2 |
| LinguaDash: assign a class from a placement result (creates the student) | 3 |
| LinguaDash: trial status change persists | 1 |
| LinguaDash: CSV import (4 valid rows, 1 rejected) | 2 |
| LinguaDash: student table sort (`aria-sort`), pagination, language filter in URL | 5 |
| LinguaDash: create mock test (validation) and promote a student | 3 |
| LinguaDash: theme persists after reload and carries over to LinguaDrop | 3 |
| LinguaDash: certificate renders; the sidebar is hidden when printing | 3 |
| LinguaDash: reset demo data removes imported students | 1 |
| LinguaDash: mobile sidebar opens and closes with Escape | 3 |

## 5. Issues the tests found, now fixed

These were real bugs or gaps, found while building the suite. They are listed so the numbers above can be trusted.

- **Mobile menu (bug).** A missing semicolon before a `/** @type */ (…)` line turned two statements into one function call. `tsc --checkJs` caught it.
- **Registration form (bug).** `display: grid` on `.stack` overrode the `hidden` attribute, so step 2 showed during step 1. Fixed with a global `[hidden] { display: none !important }` rule.
- **Mobile scrolling (bug).** Screen-reader-only labels inside wide tables made the page scroll sideways on mobile. Fixed: `.table-wrap` is now the containing block.
- **Student filter (bug).** Two `setSearchParams` calls in one event overwrote each other, so the language filter on the student list was silently dropped. Fixed with one combined update.
- **Missing `lang` attributes.** Japanese, Korean and Chinese snippets inside Indonesian sentences had no `lang` attribute. Fixed (for example "Koreksi <span lang=ko>쓰기</span>").
- **Keyboard access to tables.** Wide tables were not reachable by keyboard on mobile. They now become focusable labelled regions when they overflow.
- **Accessible names.** Some buttons, links and calendar events had accessible names that did not contain their visible text. Fixed.
- **404 in preview.** `vite preview` returned an empty 404 for unknown URLs. It now serves `404.html`, as production hosts do.

## 6. Not tested (be careful what you claim)

- **Screen readers**: no manual testing with NVDA, JAWS, VoiceOver or TalkBack. The automated checks catch only part of WCAG.
- **Other browsers**: only Chromium. Firefox and Safari/WebKit were not run.
- **Real devices**: mobile was emulated at 360 px; no real phones or tablets were used.
- **Performance**: no Lighthouse or Core Web Vitals measurements.
- **Backend behaviour**: there is none. Forms, payments, WhatsApp messages and emails are not sent anywhere.
- **Print output**: only checked for the certificate (the sidebar hides when printing). Real paper output was not checked.
