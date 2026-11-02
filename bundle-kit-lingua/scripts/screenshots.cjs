/*
  Takes real screenshots of both products for the Gumroad images (bundle-kit-lingua/screenshots/).
  Needs the preview servers on :4173 (LinguaDrop) and :4174 (LinguaDash), e.g. via:
    bash bundle-kit-lingua/scripts/serve.sh
  Then: node bundle-kit-lingua/scripts/screenshots.cjs
*/
const { chromium } = require('playwright')
const fs = require('node:fs')
const path = require('node:path')

const OUT = path.resolve(__dirname, '..', 'screenshots')
const SITE = 'http://localhost:4173'
const APP = 'http://localhost:4174'

const SHOTS = [
  // name, base, route, theme, width, height, fullPage
  ['site-home-light', SITE, '/', 'light', 1440, 900],
  ['site-home-dark', SITE, '/', 'dark', 1440, 900],
  ['site-home-batik', SITE, '/', 'batik', 1440, 900],
  ['site-japanese-light', SITE, '/bahasa-jepang.html', 'light', 1440, 900],
  ['site-japanese-samples-batik', SITE, '/bahasa-jepang.html#materi-title', 'batik', 1440, 900],
  ['site-schedule-light', SITE, '/jadwal.html?bahasa=ko', 'light', 1440, 900],
  ['site-pricing-dark', SITE, '/harga.html', 'dark', 1440, 900],
  ['site-result-light', SITE, '/hasil-tes.html', 'light', 1440, 900],
  ['site-trial-batik', SITE, '/trial.html?bahasa=ja', 'batik', 1440, 900],
  ['site-register-light', SITE, '/pendaftaran.html', 'light', 1440, 900],
  ['site-arabic-dark', SITE, '/bahasa-arab.html#materi-title', 'dark', 1440, 900],
  ['site-home-mobile-light', SITE, '/', 'light', 390, 844],
  ['site-quiz-mobile-batik', SITE, '/tes-penempatan.html', 'batik', 390, 844],
  ['site-schedule-mobile-dark', SITE, '/jadwal.html', 'dark', 390, 844],
  ['app-overview-light', APP, '/', 'light', 1440, 900],
  ['app-overview-dark', APP, '/', 'dark', 1440, 900],
  ['app-overview-batik', APP, '/', 'batik', 1440, 900],
  ['app-students-light', APP, '/siswa', 'light', 1440, 900],
  ['app-student-dark', APP, '__student__', 'dark', 1440, 900],
  ['app-calendar-batik', APP, '/jadwal', 'batik', 1440, 900],
  ['app-attendance-light', APP, '/absensi', 'light', 1440, 900],
  ['app-mocktest-dark', APP, '/akademik/mock-test/MT-302', 'dark', 1440, 900],
  ['app-invoice-light', APP, '__invoice__', 'light', 1440, 900],
  ['app-revenue-batik', APP, '/keuangan/laporan', 'batik', 1440, 900],
  ['app-certificate-light', APP, '__certificate__', 'light', 1440, 900],
  ['app-overview-mobile-dark', APP, '/', 'dark', 390, 844],
  ['app-students-mobile-light', APP, '/siswa', 'light', 390, 844],
  ['app-attendance-mobile-batik', APP, '/absensi', 'batik', 390, 844],
]

;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  // Find the sample URLs for dynamic routes from the /screens page.
  const probe = await browser.newPage()
  await probe.goto(`${APP}/screens`, { waitUntil: 'networkidle' })
  await probe.waitForSelector('.screen-list a')
  const links = await probe.$$eval('.screen-list a', (as) => as.map((a) => a.getAttribute('href')))
  await probe.close()
  const sample = {
    __student__: links.find((l) => /^\/siswa\/S-\d+$/.test(l)),
    __invoice__: links.find((l) => /^\/keuangan\/invoice\/INV-/.test(l)),
    __certificate__: links.find((l) => l.endsWith('/sertifikat')),
  }
  for (const [name, base, route, theme, width, height] of SHOTS) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 })
    const page = await context.newPage()
    const [pathPart, hash] = (sample[route] || route).split('#')
    const url = new URL(pathPart, base)
    url.searchParams.set('theme', theme)
    await page.goto(url.toString(), { waitUntil: 'networkidle' })
    await page.waitForSelector('h1')
    await page.evaluate(() => document.fonts.ready)
    if (hash) await page.evaluate((id) => document.getElementById(id)?.scrollIntoView({ block: 'start' }), hash)
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(OUT, `${name}.png`) })
    await context.close()
    console.log('saved', name)
  }
  await browser.close()
})()
