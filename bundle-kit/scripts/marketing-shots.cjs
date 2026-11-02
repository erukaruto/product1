/*
  Captures 2x screenshots used as source material for the Gumroad images.
  Needs both preview servers running (see verify.cjs).
  Output: bundle-kit/images/src/shots/
*/
const { chromium } = require('playwright')
const path = require('node:path')

const OUT = path.join(__dirname, '..', 'images', 'src', 'shots')
const SITE = 'http://localhost:4173'
const APP = 'http://localhost:4174'
const NO_MOTION = '*, *::before, *::after { transition: none !important; animation: none !important; caret-color: transparent !important; }'

const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }
const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }

const SHOTS = []
for (const theme of ['light', 'dark', 'sand']) {
  SHOTS.push(['desktop', `sd-home-${theme}`, `${SITE}/?theme=${theme}`])
  SHOTS.push(['desktop', `dd-overview-${theme}`, `${APP}/?theme=${theme}`])
  SHOTS.push(['mobile', `sd-home-mobile-${theme}`, `${SITE}/?theme=${theme}`])
  SHOTS.push(['mobile', `dd-overview-mobile-${theme}`, `${APP}/?theme=${theme}`])
}
SHOTS.push(['desktop', 'sd-pricing-light', `${SITE}/pricing.html?theme=light`])
SHOTS.push(['desktop', 'dd-signup-light', `${APP}/signup?theme=light`])
SHOTS.push(['desktop', 'dd-login-light', `${APP}/login?theme=light`])
SHOTS.push(['desktop', 'dd-customers-light', `${APP}/customers?theme=light`])
SHOTS.push(['desktop', 'dd-analytics-light', `${APP}/analytics?theme=light`])
SHOTS.push(['mobile', 'dd-customers-mobile-light', `${APP}/customers?theme=light`])
SHOTS.push(['mobile', 'sd-pricing-mobile-light', `${SITE}/pricing.html?theme=light`])
for (const [name, route] of [
  ['dd-report-mrr-light', '/reports/mrr?theme=light'],
  ['dd-subscriptions-light', '/subscriptions?theme=light'],
  ['dd-invoice-new-light', '/invoices/new?theme=light'],
  ['dd-onboarding-billing-light', '/onboarding/billing?theme=light'],
  ['dd-report-cohorts-dark', '/reports/cohorts?theme=dark'],
  ['dd-getting-started-light', '/getting-started?theme=light'],
  ['dd-plans-sand', '/plans?theme=sand'],
  ['dd-ui-overlays-light', '/ui/overlays?theme=light'],
  ['dd-inbox-light', '/inbox?theme=light'],
  ['dd-at-risk-dark', '/customers/at-risk?theme=dark'],
  ['dd-report-forecast-light', '/reports/forecast?theme=light'],
  ['dd-pipeline-dark', '/pipeline?theme=dark'],
]) SHOTS.push(['desktop', name, `${APP}${route}`])
SHOTS.push(['mobile', 'sd-help-mobile-light', `${SITE}/help.html?theme=light`])

;(async () => {
  const browser = await chromium.launch()
  const contexts = {
    desktop: await browser.newContext({ ...DESKTOP, reducedMotion: 'reduce' }),
    mobile: await browser.newContext({ ...MOBILE, reducedMotion: 'reduce' }),
  }
  for (const [kind, name, url] of SHOTS) {
    const page = await contexts[kind].newPage()
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.waitForSelector('h1', { timeout: 5000 }).catch(() => {}) // lazy-loaded pages
    await page.addStyleTag({ content: NO_MOTION })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(150)
    await page.screenshot({ path: path.join(OUT, `${name}.png`) })
    await page.close()
  }
  await browser.close()
  console.log(`Saved ${SHOTS.length} source shots to ${OUT}`)
})()
