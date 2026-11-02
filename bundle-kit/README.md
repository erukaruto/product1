# bundle-kit

Everything needed to sell SaaSDrop + DashDrop as a bundle on Gumroad. Nothing in this folder ships to buyers except `bundle.zip`.

| Path | What it is |
| --- | --- |
| `LISTING.md` | Gumroad listing in English: name, summary, URL, tags, prices, description, FAQ, launch posts |
| `UPSELL-EMAIL.md` | Emails to existing buyers of one product, plus discount code steps |
| `PANDUAN-GUMROAD.md` | Upload guide and pre-publish checklist, in Indonesian |
| `AUDIT.md` | Stack, structure, counts, token and font comparison, build results, licenses, test results |
| `bundle.zip` | The file buyers download: `saasdrop/`, `dashdrop/`, `README.md`, `LICENSE.md` |
| `bundle/` | Source of the bundle's root `README.md` and `LICENSE.md` |
| `images/` | Gumroad cover (1280x720), thumbnail (600x600) and 5 gallery images (1280x720) |
| `images/src/` | HTML sources of the images, the 2x screenshots they use, and the DM Sans font file |
| `screenshots/` | Screenshots of every page: `<product>/<theme>/<page>-<desktop or mobile>.png`. Desktop is 1440x900; four long SaaSDrop pages also have `-desktop-full` shots. Mobile is 390x844 at 2x |
| `verify-results.json` | Raw output of the last browser check |
| `scripts/` | The scripts that produced all of the above |

## Regenerating

Run from the repository root. The browser scripts need both preview servers running:

```bash
# terminal 1
cd saasdrop && VITE_APP_URL=http://localhost:4174 npm run build && npx vite preview --port 4173
# terminal 2
cd dashdrop && VITE_SITE_URL=http://localhost:4173 npm run build && npx vite preview --port 4174
```

Then:

```bash
node bundle-kit/scripts/verify.cjs            # browser checks -> verify-results.json (ONLY_FLOWS=1 skips the page sweep)
node bundle-kit/scripts/screenshots.cjs       # -> screenshots/
node bundle-kit/scripts/marketing-shots.cjs   # -> images/src/shots/
node bundle-kit/scripts/render-images.cjs     # -> images/*.png
node bundle-kit/scripts/test-same-domain.cjs  # site at /, app at /app/ (needs no servers)
bash bundle-kit/scripts/make-zip.sh           # -> bundle.zip, warns about leftover placeholders
```

The scripts use Playwright with Chromium (`require('playwright')`).
