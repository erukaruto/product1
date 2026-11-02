/*
  Checks both products in a real browser (Playwright + Chromium).
  Needs both preview servers running:
    saasdrop:  VITE_APP_URL=http://localhost:4174 npm run build && npx vite preview --port 4173
    dashdrop:  VITE_SITE_URL=http://localhost:4173 npm run build && npx vite preview --port 4174
  Run: node bundle-kit/scripts/verify.cjs
  Other browsers: BROWSER=firefox node bundle-kit/scripts/verify.cjs   (or BROWSER=webkit)
  They must be installed first on your machine: npx playwright install firefox webkit
*/
const playwright = require('playwright')
const BROWSER = process.env.BROWSER || 'chromium'
if (!['chromium', 'firefox', 'webkit'].includes(BROWSER)) throw new Error(`Unknown BROWSER "${BROWSER}"`)
const fs = require('node:fs')
const path = require('node:path')

const SITE = 'http://localhost:4173'
const APP = 'http://localhost:4174'
const THEMES = ['light', 'dark', 'sand']
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, tablet: { width: 768, height: 1024 }, mobile: { width: 390, height: 844 } }
const TOKENS = ['bg', 'surface', 'ink', 'muted', 'line', 'accent', 'onaccent', 'gold', 'good', 'warn', 'bad']

// Same id formula as dashdrop/src/data/billing.ts, so the subscription detail page can be loaded directly.
const hash = (text) => [...text].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7)
const SUBSCRIPTION_ID = `sub_${(hash('cus_1002') % 900000) + 100000}`

const SITE_PAGES = [
  '/', '/pricing.html', '/about.html', '/changelog.html', '/contact.html',
  '/blog.html', '/blog-post.html', '/help.html', '/help-article.html', '/terms.html', '/privacy.html',
  '/features.html', '/feature-metrics.html', '/feature-alerts.html', '/feature-customers.html',
  '/integrations.html', '/integration-detail.html', '/security.html', '/compare.html', '/404.html',
]
const APP_PAGES = [
  // auth and onboarding (10)
  '/login', '/signup', '/verify-email', '/two-factor', '/reset-password', '/new-password', '/invite',
  '/onboarding/workspace', '/onboarding/billing', '/onboarding/team',
  // app (18 + settings tab + 404)
  '/', '/getting-started', '/analytics', '/reports/mrr', '/reports/churn', '/reports/cohorts',
  '/customers', '/customers/cus_1002', '/subscriptions', `/subscriptions/${SUBSCRIPTION_ID}`,
  '/invoices', '/invoices/new', '/invoices/INV-2262', '/payments', '/disputes', '/plans', '/coupons',
  '/settings', '/settings?tab=appearance', '/screens', '/does-not-exist',
  // Tahap 2 (20)
  '/segments', '/segments/new', '/customers/at-risk', '/customers/import', '/customers/cus_1002/edit',
  '/alerts', '/alerts/new', '/notifications', '/inbox',
  '/team', '/team/roles', '/audit-log',
  '/settings/security', '/settings/billing', '/settings/integrations', '/settings/api-keys', '/settings/webhooks', '/settings/data',
  '/403', '/500',
  // UI kit (6)
  '/ui/buttons', '/ui/forms', '/ui/tables', '/ui/charts', '/ui/overlays', '/ui/states',
]

const results = { pages: [], tokens: {}, flows: [], problems: [] }
const problem = (msg) => { results.problems.push(msg); console.log('  PROBLEM:', msg) }
const ok = (name, pass, detail = '') => { results.flows.push({ name, pass, detail }); console.log(`  ${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ' (' + detail + ')' : ''}`); if (!pass) problem(name + ' ' + detail) }

// Client-side navigation updates the URL before React renders, so wait for the expected content.
async function seen(page, selector, text) {
  try {
    await page.locator(selector, { hasText: text }).first().waitFor({ timeout: 5000 })
    return true
  } catch {
    return false
  }
}

function withTheme(base, route, theme) {
  const url = new URL(route, base)
  url.searchParams.set('theme', theme)
  return url.toString()
}

async function inspect(page) {
  return page.evaluate(async () => {
    await document.fonts.ready
    const h1 = document.querySelector('h1')
    const families = new Set()
    document.querySelectorAll('body, body *').forEach((el) => {
      if (el.closest('svg')) return
      families.add(getComputedStyle(el).fontFamily.split(',')[0].trim().replace(/"/g, ''))
    })
    const loaded = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, ''))
    return {
      theme: document.documentElement.getAttribute('data-theme'),
      title: document.title,
      h1: h1 ? h1.textContent.trim() : null,
      overflowX: document.documentElement.scrollWidth - window.innerWidth,
      families: [...families],
      loadedFonts: [...new Set(loaded)],
      dmSansRenders: document.fonts.check('16px "DM Sans Variable"'),
    }
  })
}

async function checkPages(browser, product, base, routes) {
  for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
    const context = await browser.newContext({ viewport })
    const page = await context.newPage()
    const errors = []
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    page.on('pageerror', (e) => errors.push(String(e)))
    for (const theme of THEMES) {
      for (const route of routes) {
        errors.length = 0
        const response = await page.goto(withTheme(base, route, theme), { waitUntil: 'networkidle' })
        await page.waitForSelector('h1', { timeout: 5000 }).catch(() => {}) // lazy-loaded pages render after their chunk arrives
        const info = await inspect(page)
        const row = { product, route, theme, viewport: vpName, status: response.status(), ...info, errors: [...errors] }
        results.pages.push(row)
        if (info.theme !== theme) problem(`${product} ${route} ${theme} ${vpName}: theme is ${info.theme}`)
        if (info.overflowX > 0) problem(`${product} ${route} ${theme} ${vpName}: horizontal overflow ${info.overflowX}px`)
        if (errors.length) problem(`${product} ${route} ${theme} ${vpName}: console errors: ${errors.join(' | ')}`)
        if (!info.h1) problem(`${product} ${route} ${theme} ${vpName}: no h1 rendered`)
        if (/not found/i.test(info.h1 ?? '') && !/404|does-not-exist/.test(route)) problem(`${product} ${route}: shows "${info.h1}"`)
        if (info.families.some((f) => f !== 'DM Sans Variable')) problem(`${product} ${route}: other font families in use: ${info.families.join(', ')}`)
        if (!info.loadedFonts.includes('DM Sans Variable')) problem(`${product} ${route}: DM Sans not loaded`)
      }
    }
    await context.close()
  }
}

async function readTokens(browser, base) {
  const context = await browser.newContext()
  const page = await context.newPage()
  const out = {}
  for (const theme of THEMES) {
    await page.goto(withTheme(base, base.includes('4174') ? '/login' : '/', theme))
    out[theme] = await page.evaluate((names) => {
      const style = getComputedStyle(document.documentElement)
      return Object.fromEntries(names.map((n) => [n, style.getPropertyValue('--' + n).trim()]))
    }, TOKENS)
  }
  await context.close()
  return out
}

async function flows(browser) {
  // 1. Landing page buttons open the app's auth routes (desktop)
  let context = await browser.newContext({ viewport: VIEWPORTS.desktop })
  let page = await context.newPage()
  await page.goto(SITE + '/?theme=light')
  await page.locator('.header-actions a', { hasText: 'Sign in' }).click()
  await page.waitForURL(APP + '/login')
  ok('Desktop header "Sign in" opens app /login', (await page.locator('h1').textContent()) === 'Sign in to Beacon', page.url())
  await page.goto(SITE + '/')
  await page.locator('.header-actions a', { hasText: 'Get started' }).click()
  await page.waitForURL(APP + '/signup')
  ok('Desktop header "Get started" opens app /signup', (await page.locator('h1').textContent()) === 'Create your account', page.url())
  await page.goto(SITE + '/')
  await page.locator('.hero-actions a', { hasText: 'Get started' }).click()
  await page.waitForURL(APP + '/signup')
  ok('Hero "Get started" opens app /signup', true, page.url())

  // 2. Sign in submits to the overview, sign out returns to login, "Back to site" returns to the landing page
  await page.goto(APP + '/login')
  await page.locator('button[type=submit]').click()
  await page.waitForURL(APP + '/')
  ok('Login form submit opens overview', await seen(page, 'h1', 'Overview'))
  await page.locator('.sidebar a', { hasText: 'Sign out' }).click()
  await page.waitForURL(APP + '/login')
  ok('Sidebar "Sign out" opens /login', true)
  await page.locator('a', { hasText: 'Back to site' }).click()
  await page.waitForURL(SITE + '/')
  ok('Auth "Back to site" opens landing page', true, page.url())

  // 3. Theme choice persists after reload within a product
  await page.goto(SITE + '/?theme=light')
  await page.locator('.header-actions [data-theme-set="sand"]').click()
  await page.goto(SITE + '/pricing.html')
  ok('SaaSDrop theme choice persists across pages', (await page.getAttribute('html', 'data-theme')) === 'sand')
  await page.goto(APP + '/?theme=light')
  await page.locator('.topbar [title="Dark theme"]').click()
  await page.goto(APP + '/analytics') // no ?theme= here: the URL parameter would win over the saved choice
  await page.reload()
  ok('DashDrop theme choice persists after reload', (await page.getAttribute('html', 'data-theme')) === 'dark')
  // Different ports are different origins, so localStorage is not shared. Record what actually happens.
  await page.goto(SITE + '/?theme=light')
  await page.goto(APP + '/analytics')
  const crossTheme = await page.getAttribute('html', 'data-theme')
  results.flows.push({ name: 'Theme carries from SaaSDrop to DashDrop on different origins', pass: crossTheme === 'light', detail: `app theme after site set light: ${crossTheme} (expected: not shared across origins)`, informational: true })
  console.log(`  INFO theme across origins: app shows ${crossTheme} (localStorage is per origin)`)

  // 4. Pricing toggle
  await page.goto(SITE + '/pricing.html?theme=light')
  await page.locator('[data-billing="yearly"]').click()
  const growth = await page.locator('.plan.featured .price strong').textContent()
  const note = await page.locator('.plan.featured .price-note').textContent()
  ok('Pricing yearly toggle updates prices', growth === '$41' && note === 'Billed $490 yearly', `${growth}, ${note}`)

  // 5. Contact form validation and success
  await page.goto(SITE + '/contact.html')
  ok('Contact success message is hidden before submit', !(await page.locator('[data-form-success]').isVisible()))
  await page.locator('[data-contact-form] button[type=submit]').click()
  const errorsShown = await page.locator('.field-error:not([hidden])').count()
  await page.fill('#name', 'Test Buyer')
  await page.fill('#email', 'not-an-email')
  await page.fill('#message', 'Hello')
  await page.locator('[data-contact-form] button[type=submit]').click()
  const emailError = await page.locator('[data-error-for="email"]').textContent()
  await page.fill('#email', 'buyer@example.com')
  await page.locator('[data-contact-form] button[type=submit]').click()
  const successVisible = await page.locator('[data-form-success]').isVisible()
  ok('Contact form validates and shows success', errorsShown === 3 && emailError === 'Enter a valid email address.' && successVisible, `${errorsShown} required errors, email: "${emailError}", success: ${successVisible}`)

  // 6. FAQ opens
  await page.goto(SITE + '/')
  await page.locator('.faq summary').first().click()
  ok('FAQ item opens', await page.locator('.faq details').first().evaluate((d) => d.open))

  // 7. Customers: search, filter, sort, pagination, CSV export
  await page.goto(APP + '/customers')
  await page.locator('tbody tr').first().waitFor()
  const initialRows = await page.locator('tbody tr').count()
  const range = await page.locator('.pagination > span').textContent()
  await page.fill('#customer-search', 'fieldnote')
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 1, null, { timeout: 3000 }).catch(() => {})
  const searchRows = await page.locator('tbody tr').count()
  const searchFirst = await page.locator('tbody tr strong').first().textContent()
  ok('Customers search filters rows', initialRows === 10 && searchRows === 1 && searchFirst === 'Fieldnote', `${initialRows} rows (${range}); search "fieldnote" -> ${searchRows} row: ${searchFirst}`)
  await page.fill('#customer-search', '')
  await page.locator('.segmented button', { hasText: 'Past due' }).click()
  // The filter lives in the URL; React Router applies URL changes as a transition, so wait for the result.
  await page.waitForFunction(() => [...document.querySelectorAll('tbody .status')].every((el) => el.textContent === 'Past due'), null, { timeout: 3000 }).catch(() => {})
  const pastDue = await page.locator('tbody .status').allTextContents()
  ok('Customers status filter', pastDue.length > 0 && pastDue.every((s) => s === 'Past due'), `${pastDue.length} rows, all "Past due"`)
  await page.locator('.segmented button', { hasText: 'All' }).click()
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 10, null, { timeout: 3000 }).catch(() => {})
  await page.locator('th button', { hasText: 'Customer' }).click()
  const names = await page.locator('tbody tr strong').allTextContents()
  const sorted = [...names].sort((a, b) => a.localeCompare(b))
  ok('Customers sort by name', JSON.stringify(names) === JSON.stringify(sorted), names.slice(0, 3).join(', '))
  await page.locator('.pagination-buttons button').last().click()
  const pageLabel = await page.locator('.pagination-buttons > span.muted').textContent()
  ok('Customers pagination', pageLabel === 'Page 2 of 5', pageLabel)
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('button', { hasText: 'Export CSV' }).click()])
  const csvPath = path.join(__dirname, '..', '.verify-export.csv')
  await download.saveAs(csvPath)
  const csvLines = fs.readFileSync(csvPath, 'utf8').trim().split('\n')
  fs.unlinkSync(csvPath)
  ok('Customers CSV export downloads', download.suggestedFilename() === 'beacon-customers.csv' && csvLines.length === 49, `${download.suggestedFilename()}, ${csvLines.length} lines incl. header`)

  // 8. Topbar search routes to customers
  await page.goto(APP + '/')
  await page.fill('#global-search', 'copper')
  await page.press('#global-search', 'Enter')
  await page.waitForURL(/\/customers\?q=copper/)
  const foundCopper = await seen(page, 'tbody tr strong', 'Copperline')
  ok('Topbar search opens filtered customers', foundCopper && (await page.locator('tbody tr').count()) === 1, `${await page.locator('tbody tr').count()} row`)

  // 9. Customer detail
  await page.locator('tbody tr a').first().click()
  await page.waitForURL(/\/customers\/cus_/)
  ok('Customer row opens detail page', await seen(page, 'h1', 'Copperline'), page.url())

  // 10. Invoices tabs
  await page.goto(APP + '/invoices')
  await page.locator('.tabs button', { hasText: 'Overdue' }).click()
  const overdue = await page.locator('tbody .status').allTextContents()
  ok('Invoices tab filter', overdue.length > 0 && overdue.every((s) => s === 'Overdue'), `${overdue.length} overdue`)

  // 11. Settings theme cards and notifications popover
  await page.goto(APP + '/settings?tab=appearance')
  await page.locator('.theme-card', { hasText: 'Sand' }).click()
  ok('Settings theme card switches theme', (await page.getAttribute('html', 'data-theme')) === 'sand')
  await page.locator('.topbar .has-dot').click()
  ok('Notifications popover opens', await page.locator('.popover').isVisible())
  await page.goto(APP + '/settings?tab=notifications')
  const sw = page.locator('.switch').nth(3)
  const before = await sw.getAttribute('aria-checked')
  await sw.click()
  ok('Notification switch toggles', before === 'false' && (await sw.getAttribute('aria-checked')) === 'true')

  // 12. Chart tooltip on hover
  await page.goto(APP + '/')
  const chart = page.locator('.chart svg').first()
  const box = await chart.boundingBox()
  await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2)
  const tip = await page.locator('.chart-tooltip').textContent().catch(() => '')
  ok('MRR chart tooltip on hover', tip.includes('Oct 2026') && tip.includes('$48,320'), tip)
  await context.close()

  // 13. Mobile: landing menu and app sidebar
  context = await browser.newContext({ viewport: VIEWPORTS.mobile })
  page = await context.newPage()
  await page.goto(SITE + '/?theme=light')
  await page.locator('.menu-button').click()
  const menuOpen = await page.locator('#mobile-menu').isVisible()
  await page.locator('#mobile-menu a', { hasText: 'Get started' }).click()
  await page.waitForURL(APP + '/signup')
  ok('Mobile menu opens and "Get started" opens app /signup', menuOpen)
  await page.goto(APP + '/')
  const sidebarHidden = !(await page.locator('.sidebar').evaluate((el) => el.getBoundingClientRect().right > 0))
  await page.locator('.menu-toggle').click()
  await page.waitForTimeout(300)
  const sidebarShown = await page.locator('.sidebar').evaluate((el) => el.getBoundingClientRect().left >= 0)
  await page.locator('.sidebar a', { hasText: 'Invoices' }).click()
  await page.waitForURL(APP + '/invoices')
  await page.waitForTimeout(300)
  const closedAfterNav = await page.locator('.sidebar').evaluate((el) => el.getBoundingClientRect().right <= 0)
  ok('Mobile sidebar opens, navigates and closes', sidebarHidden && sidebarShown && closedAfterNav)
  await context.close()

  // 14. Deep link straight into an app route (SPA fallback of vite preview)
  context = await browser.newContext()
  page = await context.newPage()
  await page.goto(APP + '/customers/cus_1003')
  ok('Deep link /customers/cus_1003 loads in vite preview', await seen(page, 'h1', 'Lumen Works'))
  await page.goto(APP + '/customers/cus_9999')
  ok('Unknown customer ID shows not-found state', await seen(page, 'h1', 'Customer not found'))
  await context.close()
}


async function flowsV11(browser) {
  const context = await browser.newContext({ viewport: VIEWPORTS.desktop })
  await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {})
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  const toastSeen = (text) => seen(page, '.toast', text)

  // Sign-up flow through onboarding
  await page.goto(APP + '/signup?theme=light')
  await page.fill('#name', 'Sam Lee')
  await page.fill('#work-email', 'sam@example.com')
  await page.fill('#new-password', 'short')
  const shortHint = await page.locator('#password-hint.field-error').count()
  await page.fill('#new-password', 'long-enough-1')
  await page.check('input[name="terms"]')
  await page.click('button[type=submit]')
  const verifyOk = await seen(page, 'h1', 'Verify your email')
  const emailShown = await seen(page, '.auth-head strong', 'sam@example.com')
  ok('Sign up opens email verification with the address', shortHint === 1 && verifyOk && emailShown)
  await page.click('button.link-button')
  ok('Verify email: resend shows a toast', await toastSeen('Email sent again'))
  await page.click('a:has-text("Open the link")')
  const step1 = await seen(page, 'h1', 'Set up your workspace')
  await page.fill('#ws-name', 'Acme & Co')
  const slug = await page.inputValue('#ws-url')
  await page.click('button[type=submit]')
  const step2 = await seen(page, 'h1', 'Add your billing data')
  await page.click('.option-card:has-text("Upload a CSV")')
  const dropzone = await page.locator('.dropzone').isVisible()
  await page.click('.option-card:has-text("Send data through the API")')
  const apiKey = await page.locator('#api-key').isVisible()
  await page.click('button:has-text("Continue")')
  const step3 = await seen(page, 'h1', 'Invite your team')
  await page.fill('#invite-1', 'ana@example.com')
  await page.click('button:has-text("Add another")')
  const inviteRows = await page.locator('.invite-row').count()
  await page.click('button[type=submit]')
  const done = await seen(page, 'h1', 'Welcome to Beacon')
  ok('Onboarding: 3 steps to Getting started', step1 && slug === 'acme-and-co' && step2 && dropzone && apiKey && step3 && inviteRows === 3 && done, `slug "${slug}", ${inviteRows} invite rows`)
  ok('Onboarding: invites toast', await toastSeen('1 invite sent'))
  const before = await page.locator('.check-toggle[aria-pressed="true"]').count()
  await page.locator('.check-toggle').nth(1).click()
  const after = await page.locator('.check-toggle[aria-pressed="true"]').count()
  ok('Getting started checklist toggles', before === 1 && after === 2)

  // Password reset
  await page.goto(APP + '/reset-password')
  await page.fill('#reset-email', 'lena@beacon.example')
  await page.click('button[type=submit]')
  await page.click('a:has-text("Open the reset link")')
  await seen(page, 'h1', 'Choose a new password')
  await page.fill('#password-new', 'Better-Pass-2026')
  await page.fill('#password-confirm', 'Better-Pass-2025')
  const mismatch = await seen(page, '#confirm-error', "don't match")
  const strength = await page.locator('#strength-label').textContent()
  await page.fill('#password-confirm', 'Better-Pass-2026')
  await page.click('button[type=submit]')
  ok('New password: mismatch error, strength, then back to sign in', mismatch && strength.includes('Strong') && (await seen(page, 'h1', 'Sign in to Beacon')) && (await toastSeen('Password updated')), strength)

  // Two-factor
  await page.goto(APP + '/two-factor')
  await page.click('button[type=submit]')
  const otpError = await seen(page, '#code-error', 'Enter all 6 digits')
  await page.locator('.otp-input').first().focus()
  await page.keyboard.type('123456')
  const digits = await page.locator('.otp-input').evaluateAll((els) => els.map((e) => e.value).join(''))
  await page.click('button[type=submit]')
  ok('Two-factor: error when empty, digits auto-advance, then overview', otpError && digits === '123456' && (await seen(page, 'h1', 'Overview')), digits)

  // Sidebar: UI kit group is collapsed until opened
  await page.goto(APP + '/')
  const uiHidden = (await page.locator('.sidebar a:has-text("Buttons & badges")').count()) === 0
  await page.click('.nav-toggle:has-text("UI kit")')
  const uiShown = await page.locator('.sidebar a:has-text("Buttons & badges")').isVisible()
  ok('Sidebar UI kit group expands', uiHidden && uiShown)

  // Customers: selection changes the export
  await page.goto(APP + '/customers')
  await page.locator('tbody input[type=checkbox]').nth(0).check()
  await page.locator('tbody input[type=checkbox]').nth(1).check()
  const exportLabel = (await page.locator('button:has-text("Export")').textContent()).trim()
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('button:has-text("Export 2 selected")')])
  const csv = fs.readFileSync(await download.path(), 'utf8').trim().split('\n')
  ok('Customers: selected rows export', exportLabel === 'Export 2 selected' && csv.length === 3, `${exportLabel}, ${csv.length} lines`)

  // Subscription detail: change plan modal (focus trap, Escape, focus return) and cancel confirm
  await page.goto(APP + '/subscriptions')
  await page.locator('tbody a').first().click()
  await seen(page, 'h1', '')
  const changeButton = page.locator('button:has-text("Change plan")')
  await changeButton.click()
  const dialog = page.locator('[role="dialog"]')
  const dialogOpen = await dialog.isVisible()
  const focusInside = await page.evaluate(() => document.querySelector('[role="dialog"]')?.contains(document.activeElement))
  for (let i = 0; i < 8; i++) await page.keyboard.press('Tab')
  const stillInside = await page.evaluate(() => document.querySelector('[role="dialog"]')?.contains(document.activeElement))
  await page.keyboard.press('Escape')
  const closed = (await dialog.count()) === 0
  const focusBack = await page.evaluate(() => document.activeElement?.textContent?.includes('Change plan'))
  ok('Modal: opens, traps Tab, closes on Escape, returns focus', dialogOpen && focusInside && stillInside && closed && focusBack)
  await page.click('button:has-text("Cancel")')
  await page.click('[role="dialog"] button:has-text("Cancel subscription")')
  ok('Subscription: cancel confirm updates status', await seen(page, '.page-header .status', 'Canceled'))

  // New invoice: live totals and validation
  await page.goto(APP + '/invoices/new')
  await page.click('button:has-text("Send invoice")')
  const customerError = await seen(page, '#inv-customer-error', 'Choose who')
  await page.selectOption('#inv-customer', 'cus_1002')
  await page.fill('[aria-label="Quantity, line 1"]', '3')
  await page.click('button:has-text("Add line")')
  await page.fill('[aria-label="Description, line 2"]', 'Onboarding session')
  await page.fill('[aria-label="Unit price, line 2"]', '250')
  await page.fill('#inv-tax', '10')
  const total = await page.locator('[data-testid="total"]').textContent()
  await page.click('button:has-text("Send invoice")')
  const sent = (await seen(page, 'h1', 'Invoices')) && (await toastSeen('Invoice sent'))
  ok('New invoice: totals update and send', customerError && total === '$436.70' && sent, `total ${total} (3 x 49 + 250 = 397, +10% tax)`)

  // Invoice detail: mark as paid
  await page.goto(APP + '/invoices')
  await page.click('.tabs button:has-text("Open")')
  await page.locator('tbody a.mono').first().click()
  await seen(page, 'h1', 'Invoice INV-')
  await page.click('button:has-text("Mark as paid")')
  const paid = (await seen(page, '.invoice-meta .status', 'Paid')) && (await page.locator('.invoice-totals .total dd').textContent()) === '$0.00'
  ok('Invoice detail: mark as paid', paid)

  // Payments: row menu on the last row is not clipped and works with the keyboard
  await page.goto(APP + '/payments')
  await page.click('.tabs button:has-text("Failed")')
  const menuButtons = page.locator('tbody button[aria-haspopup="menu"]')
  await menuButtons.last().click()
  const menu = page.locator('[role="menu"]')
  const box = await menu.boundingBox()
  const viewport = page.viewportSize()
  const inView = box && box.y >= 0 && box.y + box.height <= viewport.height
  await page.keyboard.press('ArrowDown')
  const focused = await page.evaluate(() => document.activeElement?.textContent)
  await page.keyboard.press('Enter')
  ok('Payments: row menu visible, arrow keys, action runs', Boolean(inView) && focused?.includes('Retry payment') && (await toastSeen('Retry scheduled')), `focused "${focused}"`)

  // Disputes: respond
  await page.goto(APP + '/disputes')
  await page.click('button:has-text("Respond")')
  await page.click('[role="dialog"] button:has-text("Submit response")')
  ok('Disputes: respond moves case to review', (await seen(page, 'tbody .status', 'Under review')) && (await toastSeen('Response submitted')))

  // Plans: yearly toggle and edit
  await page.goto(APP + '/plans')
  await page.click('.segmented button:has-text("Yearly")')
  const yearly = await page.locator('.card:has(h2:text-is("Growth")) .plan-price strong').textContent()
  await page.click('button[aria-label="Actions for Growth"], button:has(.sr-only:text-is("Actions for Growth"))')
  await page.click('[role="menuitem"]:has-text("Edit plan")')
  await page.fill('#plan-monthly', '59')
  await page.click('[role="dialog"] button:has-text("Save plan")')
  const updated = await page.locator('.card:has(h2:text-is("Growth")) .plan-price strong').textContent()
  ok('Plans: yearly prices and edit', yearly === '$490' && updated === '$590', `${yearly} -> ${updated}`)

  // Coupons: validation and create
  await page.goto(APP + '/coupons')
  await page.click('button:has-text("New coupon")')
  await page.fill('#coupon-code', 'x')
  await page.click('[role="dialog"] button:has-text("Create coupon")')
  const codeError = await seen(page, '#coupon-code-error', '3 to 20')
  await page.fill('#coupon-code', 'spring30')
  await page.fill('#coupon-value', '30')
  await page.click('[role="dialog"] button:has-text("Create coupon")')
  ok('Coupons: validation, then new code in the table', codeError && (await seen(page, 'tbody .code-chip', 'SPRING30')))

  // Reports
  await page.goto(APP + '/reports/mrr')
  const [mrrCsv] = await Promise.all([page.waitForEvent('download'), page.click('button:has-text("Export CSV")')])
  const mrrLines = fs.readFileSync(await mrrCsv.path(), 'utf8').trim().split('\n')
  const octRow = await page.locator('tbody tr').first().textContent()
  ok('MRR report: 12 months exported, October row adds up', mrrLines.length === 13 && octRow.includes('$46,440') && octRow.includes('+$1,880') && octRow.includes('$48,320'), `${mrrLines.length} lines`)
  await page.hover('.chart svg >> nth=0', { position: { x: 700, y: 200 } })
  ok('MRR report: stacked chart tooltip', await seen(page, '.chart-tooltip', 'net'))
  await page.goto(APP + '/reports/cohorts')
  await page.click('.segmented button:has-text("Customers")')
  ok('Cohorts: switch to customer retention', await seen(page, '.card-header h2', 'Customer retention'))

  // UI kit overlays: drawer and toast
  await page.goto(APP + '/ui/overlays')
  await page.click('button:has-text("Open drawer")')
  const drawer = await page.locator('.is-drawer [role="dialog"]').isVisible()
  await page.keyboard.press('Escape')
  await page.click('button:has-text("Error")')
  ok('UI kit: drawer and error toast', drawer && (await seen(page, '.toast-bad', 'Payment failed')))

  // All screens: every listed link resolves to a page
  await page.goto(APP + '/screens')
  await page.locator('.screen-list a').first().waitFor()
  const links = await page.locator('.screen-list a').evaluateAll((els) => els.map((a) => a.getAttribute('href')))
  let broken = []
  for (const href of links) {
    await page.goto(APP + href)
    await page.waitForSelector('h1', { timeout: 5000 }).catch(() => {})
    const h1 = (await page.locator('h1').first().textContent().catch(() => '')) ?? ''
    if (!h1 || (/not found/i.test(h1) && href !== '/does-not-exist')) broken.push(`${href}: ${h1}`)
  }
  ok('All screens: every link opens a real page', links.length === 55 && broken.length === 0, `${links.length} links${broken.length ? ', broken: ' + broken.join(', ') : ''}`)

  // SaaSDrop: blog filter and newsletter
  await page.goto(SITE + '/blog.html')
  await page.click('[data-filter="pricing"]')
  const visiblePosts = await page.locator('[data-post-grid] .post-card:visible').count()
  await page.fill('#newsletter-email', 'nope')
  await page.click('[data-newsletter] button[type=submit]')
  const newsletterError = await page.locator('[data-newsletter-error]').isVisible()
  await page.fill('#newsletter-email', 'reader@example.com')
  await page.click('[data-newsletter] button[type=submit]')
  const subscribed = await page.locator('[data-newsletter-success]').isVisible()
  ok('Blog: topic filter and newsletter validation', visiblePosts === 2 && newsletterError && subscribed, `${visiblePosts} pricing posts`)

  // SaaSDrop: help search
  await page.goto(SITE + '/help.html')
  await page.fill('#help-search', 'churn')
  const churnCount = await page.locator('[data-help-count]').textContent()
  const marks = await page.locator('.help-category mark').count()
  await page.fill('#help-search', 'zzzz')
  const emptyShown = await page.locator('[data-help-empty]').isVisible()
  await page.fill('#help-search', '')
  const allBack = await page.locator('.help-category li:visible').count()
  ok('Help center: search filters, highlights, empty state', churnCount === '1 article found' && marks === 1 && emptyShown && allBack === 22, `${churnCount}; ${allBack} articles when cleared`)

  // SaaSDrop: article feedback, legal pages from the footer
  await page.goto(SITE + '/help-article.html')
  await page.click('[data-feedback-answer="yes"]')
  const thanks = await page.locator('[data-feedback-thanks]').isVisible()
  await page.click('.site-footer a:has-text("Privacy")')
  const privacy = await seen(page, 'h1', 'Privacy policy')
  ok('Help article feedback and footer legal link', thanks && privacy)

  ok('No page errors during the new flows', errors.length === 0, errors.join(' | '))
  await context.close()
}


async function flowsV2(browser) {
  const context = await browser.newContext({ viewport: VIEWPORTS.desktop })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  const toastSeen = (text) => seen(page, '.toast', text)

  // Segment builder: live preview follows the rules
  await page.goto(APP + '/segments/new?theme=light')
  await page.locator('.preview-list li').first().waitFor()
  const growth = await page.locator('.card-header p').last().textContent()
  await page.selectOption('[aria-label="Value, rule 1"]', 'Scale')
  await page.waitForFunction((prev) => { const ps = document.querySelectorAll('.card-header p'); return ps[ps.length - 1]?.textContent !== prev }, growth, { timeout: 3000 }).catch(() => {})
  const scale = await page.locator('.card-header p').last().textContent()
  await page.click('button:has-text("Save segment")')
  const nameError = await seen(page, '#seg-name-error', 'Give the segment')
  await page.fill('#seg-name', 'Big accounts')
  await page.click('button:has-text("Save segment")')
  ok('Segment builder: preview updates, name required, saves', growth !== scale && nameError && (await toastSeen('Big accounts')), `${growth} -> ${scale}`)

  // Segments list counts come from the data
  await page.goto(APP + '/segments')
  await page.locator('.segment-grid .card').first().waitFor()
  ok('Segments: 5 saved segments', (await page.locator('.segment-grid .card').count()) === 5)

  // At risk list is sorted by score
  await page.goto(APP + '/customers/at-risk')
  await page.locator('.risk-list > li').first().waitFor()
  const scores = (await page.locator('.risk-list .score strong').allTextContents()).map(Number)
  ok('At risk: sorted lowest score first, all under 70', scores.length > 0 && scores.every((v, i) => v < 70 && (i === 0 || v >= scores[i - 1])), scores.join(','))

  // Import: mapping validation
  await page.goto(APP + '/customers/import')
  await page.click('button:has-text("Use the sample file")')
  await page.click('button:has-text("Continue")')
  await page.selectOption('[aria-label="Beacon field for Contact email"]', 'Skip this column')
  const mapError = await seen(page, '[role="alert"]', 'Email')
  await page.selectOption('[aria-label="Beacon field for Contact email"]', 'Email')
  await page.click('button:has-text("Continue")')
  await page.click('button:has-text("Import 3 customers")')
  ok('Import: missing required column blocks, then imports', mapError && (await toastSeen('3 customers imported')))

  // Edit customer: validation and typed delete confirmation
  await page.goto(APP + '/customers/cus_1002/edit')
  await page.fill('#ce-email', 'nope')
  await page.click('button:has-text("Save changes")')
  const emailError = await seen(page, '#ce-email-error', 'valid email')
  await page.click('button:has-text("Delete Fieldnote")')
  const disabledBefore = await page.locator('[role="dialog"] button:has-text("Delete customer")').isDisabled()
  await page.fill('#confirm-delete', 'Fieldnote')
  const enabledAfter = await page.locator('[role="dialog"] button:has-text("Delete customer")').isEnabled()
  ok('Edit customer: validation, delete needs the typed name', emailError && disabledBefore && enabledAfter)

  // Alerts: toggle and editor summary
  await page.goto(APP + '/alerts')
  await page.locator('.rule-list .switch').first().waitFor()
  await page.locator('.rule-list .switch').first().click()
  ok('Alert rules: switch pauses a rule', await toastSeen('paused'))
  await page.goto(APP + '/alerts/new')
  await page.click('button:has-text("Create rule")')
  const alertErrors = await page.locator('.field-error').count()
  await page.fill('#al-name', 'Quiet accounts')
  await page.selectOption('#al-event', 'inactive')
  await page.fill('#al-threshold', '21')
  await page.fill('#al-recipients', 'success@example.com')
  const summary = await page.locator('[data-testid="rule-summary"]').textContent()
  await page.click('button:has-text("Create rule")')
  ok('Alert editor: validation and live summary', alertErrors === 2 && summary.includes('no logins for 21 days') && (await toastSeen('Rule created')), summary)

  // Notifications and inbox
  await page.goto(APP + '/notifications')
  await page.locator('.notification-list li').first().waitFor()
  const unreadBefore = await page.locator('.notification-list li.is-unread').count()
  await page.click('button:has-text("Mark all as read")')
  const unreadAfter = await page.locator('.notification-list li.is-unread').count()
  ok('Notifications: mark all as read', unreadBefore === 3 && unreadAfter === 0, `${unreadBefore} -> ${unreadAfter}`)
  await page.goto(APP + '/inbox')
  await page.locator('#reply').waitFor()
  await page.fill('#reply', 'You can update the card in Settings.')
  await page.click('.reply button[type=submit]')
  ok('Inbox: reply appears in the thread', (await seen(page, '.messages .from-team', 'update the card')) && (await toastSeen('Reply sent')))

  // Team: invite validation
  await page.goto(APP + '/team')
  await page.click('button:has-text("Invite")')
  await page.fill('#inv-email', 'lena@beacon.example')
  await page.click('[role="dialog"] button:has-text("Send invite")')
  const dup = await seen(page, '#inv-error', 'already')
  await page.fill('#inv-email', 'new@example.com')
  await page.click('[role="dialog"] button:has-text("Send invite")')
  ok('Team: duplicate invite blocked, new invite added', dup && (await seen(page, 'tbody', 'new@example.com')))

  // Audit log search
  await page.goto(APP + '/audit-log')
  await page.fill('#audit-search', 'refund')
  await page.waitForFunction(() => [...document.querySelectorAll('tbody tr')].every((r) => r.textContent.includes('refund')), null, { timeout: 3000 }).catch(() => {})
  const rows = await page.locator('tbody tr').allTextContents()
  ok('Audit log: search filters rows', rows.length > 0 && rows.every((r) => r.toLowerCase().includes('refund')), `${rows.length} rows`)

  // Settings: API key shown once, webhook validation, workspace delete confirm
  await page.goto(APP + '/settings/api-keys')
  await page.click('button:has-text("Create key")')
  await page.fill('#key-name', 'Test key')
  await page.click('[role="dialog"] button[type=submit]')
  const key = await page.inputValue('#new-key')
  ok('API keys: new key shown once', /^bk_live_\w{24}$/.test(key))
  await page.click('button:has-text("I\'ve saved it")')
  await page.goto(APP + '/settings/webhooks')
  await page.click('button:has-text("Add endpoint")')
  await page.fill('#wh-url', 'http://insecure')
  await page.click('[role="dialog"] button[type=submit]')
  ok('Webhooks: https and events required', (await seen(page, '#wh-url-error', 'https')) && (await page.locator('[role="dialog"] .field-error').count()) === 2)
  await page.goto(APP + '/settings/data')
  await page.click('button:has-text("Delete workspace")')
  const blocked = await page.locator('[role="dialog"] button:has-text("Delete workspace")').isDisabled()
  await page.fill('#confirm-ws', 'Beacon HQ')
  ok('Data: delete needs the workspace name', blocked && (await page.locator('[role="dialog"] button:has-text("Delete workspace")').isEnabled()))
  await page.goto(APP + '/settings/security')
  await page.click('button:has-text("View recovery codes")')
  ok('Security: recovery codes dialog', (await page.locator('.code-grid li').count()) === 6)

  // SaaSDrop: integrations filter, features links
  await page.goto(SITE + '/integrations.html')
  await page.click('[data-filter="data"]')
  ok('Integrations: filter by group', (await page.locator('.int-card:visible').count()) === 2)
  await page.goto(SITE + '/features.html')
  await page.click('.feature-link:has-text("Churn alerts")')
  ok('Features: card opens the detail page', await seen(page, 'h1', 'Hear about churn'))
  await page.click('.related-link:has-text("Customer profiles")')
  ok('Feature detail: related link works', await seen(page, 'h1', 'Everything about an account'))

  ok('No page errors during the Tahap 2 flows', errors.length === 0, errors.join(' | '))
  await context.close()
}

;(async () => {
  const browser = await playwright[BROWSER].launch()
  console.log(`Browser: ${BROWSER} ${browser.version()}`)
  // ONLY_FLOWS=1 skips the page sweep (useful while fixing a flow).
  if (!process.env.ONLY_FLOWS) {
    console.log('Pages: SaaSDrop')
    await checkPages(browser, 'saasdrop', SITE, SITE_PAGES)
    console.log('Pages: DashDrop')
    await checkPages(browser, 'dashdrop', APP, APP_PAGES)
  }

  console.log('Tokens')
  const siteTokens = await readTokens(browser, SITE)
  const appTokens = await readTokens(browser, APP)
  for (const theme of THEMES) {
    const diff = TOKENS.filter((t) => siteTokens[theme][t] !== appTokens[theme][t])
    results.tokens[theme] = { saasdrop: siteTokens[theme], dashdrop: appTokens[theme], differences: diff }
    console.log(`  ${theme}: ${diff.length === 0 ? 'identical' : 'DIFFERENT: ' + diff.join(', ')}`)
    if (diff.length) problem(`tokens differ in ${theme}: ${diff.join(', ')}`)
  }

  console.log('Flows')
  await flows(browser)
  await flowsV11(browser)
  await flowsV2(browser)
  await browser.close()

  const summary = {
    pageLoads: results.pages.length,
    pageLoadsWithConsoleErrors: results.pages.filter((p) => p.errors.length).length,
    pageLoadsWithOverflow: results.pages.filter((p) => p.overflowX > 0).length,
    fontFamiliesSeen: [...new Set(results.pages.flatMap((p) => p.families))],
    httpStatuses: [...new Set(results.pages.map((p) => `${p.product} ${p.route}: ${p.status}`))].filter((s) => !s.endsWith(': 200')),
    flowsPassed: results.flows.filter((f) => f.pass && !f.informational).length,
    flowsFailed: results.flows.filter((f) => !f.pass && !f.informational).length,
    problems: results.problems,
  }
  results.summary = { browser: BROWSER, ...summary }
  const suffix = (BROWSER === 'chromium' ? '' : `-${BROWSER}`) + (process.env.ONLY_FLOWS ? '-flows-only' : '')
  const file = `verify-results${suffix}.json`
  fs.writeFileSync(path.join(__dirname, '..', file), JSON.stringify(results, null, 2))
  console.log('\nSUMMARY', JSON.stringify(summary, null, 2))
})()
