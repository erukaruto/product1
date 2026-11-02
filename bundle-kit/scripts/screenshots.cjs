/*
  Takes screenshots of every page of both products, in every theme, on desktop and mobile.
  Needs both preview servers running (see verify.cjs). Run: node bundle-kit/scripts/screenshots.cjs
  Output: bundle-kit/screenshots/<product>/<theme>/<page>-<viewport>.png
*/
const { chromium } = require('playwright')
const fs = require('node:fs')
const path = require('node:path')

const OUT = path.join(__dirname, '..', 'screenshots')
const THEMES = ['light', 'dark', 'sand']
const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
}

// Same id formula as dashdrop/src/data/billing.ts
const hash = (text) => [...text].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7)
const SUBSCRIPTION_ID = `sub_${(hash('cus_1002') % 900000) + 100000}`

const PRODUCTS = {
  saasdrop: {
    base: 'http://localhost:4173',
    // Full-page desktop shots for the long pages only, to keep the folder small.
    fullPageDesktop: ['home', 'pricing', 'blog', 'help'],
    pages: {
      home: '/',
      pricing: '/pricing.html',
      about: '/about.html',
      changelog: '/changelog.html',
      contact: '/contact.html',
      blog: '/blog.html',
      'blog-post': '/blog-post.html',
      help: '/help.html',
      'help-article': '/help-article.html',
      terms: '/terms.html',
      privacy: '/privacy.html',
      features: '/features.html',
      'feature-metrics': '/feature-metrics.html',
      'feature-alerts': '/feature-alerts.html',
      'feature-customers': '/feature-customers.html',
      integrations: '/integrations.html',
      'integration-detail': '/integration-detail.html',
      security: '/security.html',
      compare: '/compare.html',
      'home-2': '/home-2.html',
      'solutions-founders': '/solutions-founders.html',
      'solutions-finance': '/solutions-finance.html',
      'solutions-success': '/solutions-success.html',
      'customers': '/customers.html',
      'customer-story': '/customer-story.html',
      'docs': '/docs.html',
      'status': '/status.html',
      'roadmap': '/roadmap.html',
      'careers': '/careers.html',
      'job': '/job.html',
      'press': '/press.html',
      'demo': '/demo.html',
      'waitlist': '/waitlist.html',
      'maintenance': '/maintenance.html',
      '500': '/500.html',
      '404': '/404.html',
    },
  },
  dashdrop: {
    base: 'http://localhost:4174',
    fullPageDesktop: [],
    pages: {
      login: '/login',
      signup: '/signup',
      'verify-email': '/verify-email',
      'two-factor': '/two-factor',
      'reset-password': '/reset-password',
      'new-password': '/new-password',
      invite: '/invite',
      'onboarding-workspace': '/onboarding/workspace',
      'onboarding-billing': '/onboarding/billing',
      'onboarding-team': '/onboarding/team',
      overview: '/',
      'getting-started': '/getting-started',
      analytics: '/analytics',
      'report-mrr': '/reports/mrr',
      'report-churn': '/reports/churn',
      'report-cohorts': '/reports/cohorts',
      customers: '/customers',
      'customer-detail': '/customers/cus_1002',
      subscriptions: '/subscriptions',
      'subscription-detail': `/subscriptions/${SUBSCRIPTION_ID}`,
      invoices: '/invoices',
      'invoice-new': '/invoices/new',
      'invoice-detail': '/invoices/INV-2262',
      payments: '/payments',
      disputes: '/disputes',
      plans: '/plans',
      coupons: '/coupons',
      settings: '/settings',
      'settings-appearance': '/settings?tab=appearance',
      screens: '/screens',
      'ui-buttons': '/ui/buttons',
      'ui-forms': '/ui/forms',
      'ui-tables': '/ui/tables',
      'ui-charts': '/ui/charts',
      'ui-overlays': '/ui/overlays',
      'ui-states': '/ui/states',
      segments: '/segments',
      'segment-builder': '/segments/new',
      'at-risk': '/customers/at-risk',
      'customer-import': '/customers/import',
      'customer-edit': '/customers/cus_1002/edit',
      alerts: '/alerts',
      'alert-editor': '/alerts/new',
      notifications: '/notifications',
      inbox: '/inbox',
      team: '/team',
      roles: '/team/roles',
      'audit-log': '/audit-log',
      'settings-security': '/settings/security',
      'settings-billing': '/settings/billing',
      'settings-integrations': '/settings/integrations',
      'settings-api-keys': '/settings/api-keys',
      'settings-webhooks': '/settings/webhooks',
      'settings-data': '/settings/data',
      'report-plans': '/reports/plans',
      'report-countries': '/reports/countries',
      'report-forecast': '/reports/forecast',
      'saved-reports': '/reports/saved',
      'report-builder': '/reports/builder',
      search: '/search?q=north',
      renewals: '/renewals',
      pipeline: '/pipeline',
      'whats-new': '/whats-new',
      '403': '/403',
      '500': '/500',
      '404': '/does-not-exist',
    },
  },
}

const NO_MOTION = '*, *::before, *::after { transition: none !important; animation: none !important; caret-color: transparent !important; }'

;(async () => {
  const browser = await chromium.launch()
  let count = 0
  for (const [product, config] of Object.entries(PRODUCTS)) {
    for (const [vpName, options] of Object.entries(VIEWPORTS)) {
      const context = await browser.newContext({ ...options, reducedMotion: 'reduce' })
      const page = await context.newPage()
      for (const theme of THEMES) {
        const dir = path.join(OUT, product, theme)
        fs.mkdirSync(dir, { recursive: true })
        for (const [name, route] of Object.entries(config.pages)) {
          if (process.env.ONLY && !name.includes(process.env.ONLY)) continue // ONLY=help re-shoots matching pages
          const url = new URL(route, config.base)
          url.searchParams.set('theme', theme)
          await page.goto(url.toString(), { waitUntil: 'networkidle' })
          await page.waitForSelector('h1', { timeout: 5000 }).catch(() => {}) // lazy-loaded pages
          await page.addStyleTag({ content: NO_MOTION })
          await page.evaluate(() => document.fonts.ready)
          await page.waitForTimeout(150)
          await page.screenshot({ path: path.join(dir, `${name}-${vpName}.png`) })
          count++
          if (vpName === 'desktop' && config.fullPageDesktop.includes(name)) {
            await page.screenshot({ path: path.join(dir, `${name}-desktop-full.png`), fullPage: true })
            count++
          }
        }
        if (process.env.ONLY) continue
        if (product === 'dashdrop' && vpName === 'mobile') {
          await page.goto(`${config.base}/?theme=${theme}`, { waitUntil: 'networkidle' })
          await page.waitForSelector('h1', { timeout: 5000 }).catch(() => {})
          await page.addStyleTag({ content: NO_MOTION })
          await page.locator('.menu-toggle').click()
          await page.waitForTimeout(150)
          await page.screenshot({ path: path.join(dir, 'overview-menu-open-mobile.png') })
          count++
        }
        if (product === 'saasdrop' && vpName === 'mobile') {
          await page.goto(`${config.base}/?theme=${theme}`, { waitUntil: 'networkidle' })
          await page.addStyleTag({ content: NO_MOTION })
          await page.locator('.menu-button').click()
          await page.waitForTimeout(150)
          await page.screenshot({ path: path.join(dir, 'home-menu-open-mobile.png') })
          count++
        }
      }
      await context.close()
    }
  }
  await browser.close()
  console.log(`Saved ${count} screenshots to ${OUT}`)
})()
