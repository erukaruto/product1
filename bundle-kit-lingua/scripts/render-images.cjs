/*
  Renders the Gumroad cover, thumbnail and gallery images from the real screenshots in ../screenshots.
  Run screenshots.cjs first. Output: bundle-kit-lingua/images/
    cover-1280x720.png, thumbnail-600x600.png, gallery-1..5-1280x720.png
*/
const { chromium } = require('playwright')
const fs = require('node:fs')
const path = require('node:path')

const KIT = path.resolve(__dirname, '..')
const SHOTS = path.join(KIT, 'screenshots')
const OUT = path.join(KIT, 'images')
const FONT = path.join(KIT, '..', 'linguadrop', 'node_modules', '@fontsource-variable', 'plus-jakarta-sans', 'files', 'plus-jakarta-sans-latin-wght-normal.woff2')

const img = (name) => `data:image/png;base64,${fs.readFileSync(path.join(SHOTS, `${name}.png`)).toString('base64')}`
const font = fs.existsSync(FONT) ? `@font-face{font-family:'PJS';src:url(data:font/woff2;base64,${fs.readFileSync(FONT).toString('base64')}) format('woff2');font-weight:200 800;}` : ''

/** @font-face rules (data URIs) for the Fontsource chunks that contain the glyphs of `text`. */
function scriptFont(pkg, family, text) {
  const dir = path.join(KIT, '..', 'linguadrop', 'node_modules', '@fontsource-variable', pkg)
  if (!fs.existsSync(dir)) return ''
  const css = fs.readFileSync(path.join(dir, 'index.css'), 'utf8')
  const codes = [...text].map((c) => c.codePointAt(0))
  let out = ''
  for (const block of css.split('@font-face').slice(1)) {
    const file = block.match(/url\(\.\/files\/([^)]+\.woff2)\)/)?.[1]
    const range = block.match(/unicode-range:\s*([^;]+);/)?.[1]
    if (!file || !range) continue
    const ranges = range.split(',').map((r) => r.trim().replace('U+', '').split('-').map((h) => parseInt(h.replace(/\?/g, '0'), 16)))
    if (!codes.some((c) => ranges.some(([a, b = a]) => c >= a && c <= b))) continue
    const data = fs.readFileSync(path.join(dir, 'files', file)).toString('base64')
    out += `@font-face{font-family:'${family}';src:url(data:font/woff2;base64,${data}) format('woff2');unicode-range:${range};font-weight:100 900;}`
  }
  return out
}
const scriptFonts = scriptFont('noto-sans-jp', 'NotoJP', 'こんにちは') + scriptFont('noto-sans-kr', 'NotoKR', '안녕하세요') + scriptFont('noto-sans-sc', 'NotoSC', '你好') + scriptFont('noto-sans-arabic', 'NotoAR', 'مرحبا')

const BASE_CSS = `${font}${scriptFonts}
[lang=ja]{font-family:'NotoJP',sans-serif}[lang=ko]{font-family:'NotoKR',sans-serif}[lang=zh-Hans]{font-family:'NotoSC',sans-serif}[lang=ar]{font-family:'NotoAR',sans-serif}
*{box-sizing:border-box;margin:0}
body{font-family:'PJS',system-ui,sans-serif;color:#15161c;-webkit-font-smoothing:antialiased}
.frame{position:relative;width:WIDTHpx;height:HEIGHTpx;overflow:hidden;background:#f7f6f2}
.shot{display:block;border-radius:14px;box-shadow:0 2px 6px rgb(21 22 28/10%),0 30px 60px rgb(21 22 28/18%);border:1px solid rgb(21 22 28/10%);object-fit:cover;object-position:top left}
.browser{border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 2px 6px rgb(21 22 28/10%),0 30px 60px rgb(21 22 28/20%);border:1px solid rgb(21 22 28/10%)}
.browser .bar{height:26px;background:#eceae4;display:flex;align-items:center;gap:6px;padding:0 10px}
.browser .bar i{width:9px;height:9px;border-radius:50%;background:#c9c5ba;display:block}
.browser .bar span{margin-left:10px;font-size:11px;color:#555764;background:#fff;border-radius:6px;padding:2px 10px}
.browser img{display:block;width:100%}
.phone{border-radius:28px;padding:8px;background:#15161c;box-shadow:0 30px 60px rgb(21 22 28/25%)}
.phone img{display:block;width:100%;border-radius:21px}
.eyebrow{font-size:14px;font-weight:750;letter-spacing:.1em;text-transform:uppercase;color:#3337b5}
h1{font-size:54px;line-height:1.05;letter-spacing:-.035em;font-weight:800}
h2{font-size:36px;line-height:1.1;letter-spacing:-.03em;font-weight:800}
p.lead{font-size:19px;line-height:1.5;color:#555764}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{padding:7px 14px;border-radius:999px;background:#fff;border:1px solid #e2dfd7;font-weight:700;font-size:15px}
.chip b{color:#3337b5}
.label{position:absolute;padding:6px 12px;border-radius:999px;background:#15161c;color:#fff;font-size:13px;font-weight:700}
.note{position:absolute;right:28px;bottom:18px;font-size:12px;color:#555764}
`

/** Browser-style frame around a screenshot. `height` crops the frame (top of the page stays visible). */
function browserFrame(name, url, width, height) {
  const crop = height ? `;height:${height}px` : ''
  return `<div class="browser" style="width:${width}px${crop}"><div class="bar"><i></i><i></i><i></i><span>${url}</span></div><img src="${img(name)}"></div>`
}

const PAGES = {
  'cover-1280x720': [1280, 720, `
    <div class="frame" style="background:radial-gradient(circle at 85% 10%,#e9e9fb,transparent 55%),#f7f6f2">
      <div style="position:absolute;left:64px;top:84px;width:470px;display:grid;gap:22px">
        <div class="eyebrow">Template kit for language schools</div>
        <h1>LinguaDrop<br><span style="color:#3b3fc4">+ LinguaDash</span></h1>
        <p class="lead">A multi-page landing site (Vite, HTML, CSS) and an admin dashboard (React 19, TypeScript, React Router 7) with one shared design.</p>
        <div class="chips"><span class="chip"><b>47</b> pages</span><span class="chip"><b>74</b> screens</span><span class="chip"><b>3</b> themes</span><span class="chip"><b>6</b> languages</span></div>
        <div class="chips" style="gap:6px;opacity:.9"><span class="chip" style="font-weight:600" lang="en">Hello</span><span class="chip" style="font-weight:600" lang="ja">こんにちは</span><span class="chip" style="font-weight:600" lang="ko">안녕하세요</span><span class="chip" style="font-weight:600" lang="zh-Hans">你好</span><span class="chip" style="font-weight:600" lang="ar" dir="rtl">مرحبا</span><span class="chip" style="font-weight:600" lang="de">Hallo</span></div>
      </div>
      <div style="position:absolute;left:600px;top:70px">${browserFrame('app-overview-light', 'linguadash · overview', 640)}</div>
      <div style="position:absolute;left:560px;top:360px">${browserFrame('site-home-dark', 'linguadrop · beranda', 420)}</div>
      <div style="position:absolute;left:1030px;top:330px;width:180px" class="phone"><img src="${img('site-quiz-mobile-batik')}"></div>
      <p class="note" style="left:64px;right:auto">Fictional demo data · UI text in Indonesian · no backend, payment gateway or real login</p>
    </div>`],
  'thumbnail-600x600': [600, 600, `
    <div class="frame" style="background:#3b3fc4">
      <div style="position:absolute;left:44px;top:46px;right:44px;display:grid;gap:14px;color:#fff">
        <div class="eyebrow" style="color:#e9e9fb">Language school kit</div>
        <h1 style="font-size:50px">LinguaDrop<br>+ LinguaDash</h1>
        <p style="font-size:18px;color:#e9e9fb;font-weight:600">47-page website + 74-screen dashboard · 3 themes</p>
      </div>
      <div style="position:absolute;left:44px;top:300px">${browserFrame('app-overview-batik', 'linguadash', 560)}</div>
    </div>`],
  'gallery-1-site-1280x720': [1280, 720, `
    <div class="frame">
      <div style="position:absolute;left:56px;top:48px;width:1170px;display:flex;justify-content:space-between;align-items:end">
        <div style="display:grid;gap:8px"><div class="eyebrow">LinguaDrop</div><h2>A 47-page site for 6 languages</h2></div>
        <div class="chips"><span class="chip">Vite + HTML + CSS + JS</span><span class="chip">Responsive to 360 px</span></div>
      </div>
      <div style="position:absolute;left:56px;top:170px">${browserFrame('site-home-light', 'beranda', 560)}</div>
      <div style="position:absolute;left:660px;top:170px">${browserFrame('site-japanese-samples-batik', 'bahasa-jepang.html', 560)}</div>
      <span class="label" style="left:76px;top:520px">Home · light theme</span>
      <span class="label" style="left:680px;top:520px">Lesson samples with lang attributes · batik theme</span>
      <p class="note">Plus 45 more pages: programs, exam prep, schedule, pricing, teachers, sign-up, blog, FAQ.</p>
    </div>`],
  'gallery-2-dashboard-1280x720': [1280, 720, `
    <div class="frame" style="background:#0f1117">
      <div style="position:absolute;left:56px;top:48px;display:grid;gap:8px;color:#ecedf3"><div class="eyebrow" style="color:#a3a8ff">LinguaDash</div><h2>74 screens: students, classes, grades, finance</h2></div>
      <div style="position:absolute;left:56px;top:160px">${browserFrame('app-overview-dark', 'overview', 700)}</div>
      <div style="position:absolute;left:790px;top:160px">${browserFrame('app-student-dark', 'siswa/detail', 436, 236)}</div>
      <div style="position:absolute;left:790px;top:412px">${browserFrame('app-mocktest-dark', 'akademik/mock-test', 436, 236)}</div>
      <p class="note" style="color:#a4a8b7">React 19 · strict TypeScript · React Router 7 · hand-made SVG charts</p>
    </div>`],
  'gallery-3-themes-1280x720': [1280, 720, `
    <div class="frame">
      <div style="position:absolute;left:56px;top:44px;display:grid;gap:8px"><div class="eyebrow">3 themes, identical tokens in both products</div><h2>Light, dark and batik</h2></div>
      ${['light', 'dark', 'batik'].map((t, i) => `
        <div style="position:absolute;left:${56 + i * 395}px;top:150px">${browserFrame(`app-overview-${t}`, `linguadash · ${t}`, 375)}</div>
        <div style="position:absolute;left:${56 + i * 395}px;top:420px">${browserFrame(`site-home-${t}`, `linguadrop · ${t}`, 375)}</div>`).join('')}
    </div>`],
  'gallery-4-mobile-1280x720': [1280, 720, `
    <div class="frame" style="background:#f3ebdc">
      <div style="position:absolute;left:56px;top:44px;display:grid;gap:8px"><div class="eyebrow" style="color:#86300f">Responsive down to 360 px</div><h2 style="color:#2a1a10">The site and the dashboard on a phone</h2></div>
      ${['site-home-mobile-light', 'site-quiz-mobile-batik', 'site-schedule-mobile-dark', 'app-overview-mobile-dark', 'app-students-mobile-light', 'app-attendance-mobile-batik'].map((n, i) => `
        <div class="phone" style="position:absolute;left:${56 + i * 196}px;top:${150 + (i % 2) * 24}px;width:180px"><img src="${img(n)}"></div>`).join('')}
    </div>`],
  'gallery-5-flows-1280x720': [1280, 720, `
    <div class="frame">
      <div style="position:absolute;left:56px;top:44px;display:grid;gap:8px"><div class="eyebrow">Flows that really work (demo, no backend)</div><h2>Placement test, trial booking, sign-up, attendance, invoices</h2></div>
      <div style="position:absolute;left:56px;top:160px">${browserFrame('site-result-light', 'hasil-tes.html', 380)}</div>
      <div style="position:absolute;left:450px;top:160px">${browserFrame('site-trial-batik', 'trial.html', 380)}</div>
      <div style="position:absolute;left:844px;top:160px">${browserFrame('site-register-light', 'pendaftaran.html', 380)}</div>
      <div style="position:absolute;left:56px;top:440px">${browserFrame('app-attendance-light', 'absensi', 576, 236)}</div>
      <div style="position:absolute;left:648px;top:440px">${browserFrame('app-invoice-light', 'keuangan/invoice', 576, 236)}</div>
      <p class="note">Data is kept in the browser (localStorage / sessionStorage). Connect your own API.</p>
    </div>`],
}

;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  for (const [name, [w, h, body]] of Object.entries(PAGES)) {
    const page = await browser.newPage({ viewport: { width: w, height: h } })
    await page.setContent(`<!doctype html><html lang="id"><head><meta charset="utf-8"><style>${BASE_CSS.replace('WIDTH', w).replace('HEIGHT', h)}</style></head><body>${body}</body></html>`, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: path.join(OUT, `${name}.png`), clip: { x: 0, y: 0, width: w, height: h } })
    await page.close()
    console.log('rendered', name)
  }
  await browser.close()
})()
