/*
  LinguaDrop + LinguaDash verification (Playwright + Chromium + axe-core).
  Run through scripts/run-verify.sh, which builds both products and starts the preview servers:
    LinguaDrop  http://localhost:4173  (built with VITE_APP_URL=http://localhost:4174)
    LinguaDash  http://localhost:4174  (built with VITE_SITE_URL=http://localhost:4173)
  Output: bundle-kit-lingua/verify-results.json
  Options: --skip-pages  --skip-axe  --skip-flows  --workers=4
*/
let playwright
try {
  playwright = require('playwright')
} catch {
  console.error('Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium')
  process.exit(1)
}
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

const KIT = path.resolve(__dirname, '..')
const ROOT = path.resolve(KIT, '..')
const SITE = 'http://localhost:4173'
const APP = 'http://localhost:4174'
const THEMES = ['light', 'dark', 'batik']
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 360, height: 780 } }
const args = process.argv.slice(2)
const WORKERS = Number((args.find((a) => a.startsWith('--workers=')) || '--workers=4').split('=')[1])
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js', { paths: [KIT] }), 'utf8')
const TOKEN_NAMES = ['bg', 'surface', 'surface-2', 'ink', 'muted', 'line', 'line-strong', 'accent', 'accent-ink', 'accent-soft', 'on-accent', 'pop', 'good', 'warn', 'bad', 'c-en', 'c-ja', 'c-ko', 'c-zh', 'c-ar', 'c-de', 'font-sans', 'radius']

const results = {
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, playwright: require('playwright/package.json').version, browser: 'chromium', site: SITE, app: APP, themes: THEMES, viewports: VIEWPORTS },
  summary: {},
  routes: { linguadrop: [], linguadash: [] },
  tokens: {},
  contrast: [],
  pages: [],
  axe: { runs: 0, byRule: {}, pages: [] },
  keyboard: [],
  flows: [],
  problems: [],
}
const problem = (msg) => { results.problems.push(msg); console.log('  PROBLEM:', msg) }

// ---------- Routes ----------
function siteRoutes() {
  return fs.readdirSync(path.join(ROOT, 'linguadrop')).filter((f) => f.endsWith('.html')).sort().map((f) => (f === 'index.html' ? '/' : `/${f}`))
}
async function appRoutes(browser) {
  const page = await browser.newPage()
  await page.goto(`${APP}/screens`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.screen-list a')
  const links = await page.$$eval('.screen-list a', (as) => as.map((a) => a.getAttribute('href')))
  await page.close()
  return [...new Set(links)]
}

// ---------- Per-page inspection (runs in the browser) ----------
async function inspect(page) {
  return page.evaluate(async () => {
    await document.fonts.ready
    const SCRIPTS = { kana: /[぀-ヿ]/, hangul: /[가-힯ᄀ-ᇿ㄰-㆏]/, han: /[一-鿿]/, arabic: /[؀-ۿ]/ }
    const used = new Set()
    const missingLang = []
    const missingRtl = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node
    while ((node = walker.nextNode())) {
      const text = node.textContent || ''
      if (!text.trim()) continue
      const el = node.parentElement
      if (!el || el.closest('script, style, noscript')) continue
      const lang = (el.closest('[lang]')?.getAttribute('lang') || '').toLowerCase()
      const sample = text.trim().slice(0, 30)
      // Fonts only download for glyphs that are actually rendered (unicode-range), so hidden text
      // (display: none) counts for the lang/dir checks but not for the font check.
      const shown = el.getClientRects().length > 0
      const use = (l) => { if (shown) used.add(l) }
      if (SCRIPTS.kana.test(text)) { use('ja'); if (!lang.startsWith('ja')) missingLang.push(sample) }
      else if (SCRIPTS.hangul.test(text)) { use('ko'); if (!lang.startsWith('ko')) missingLang.push(sample) }
      else if (SCRIPTS.han.test(text)) {
        if (lang.startsWith('ja')) use('ja')
        else if (lang.startsWith('zh')) use('zh')
        else missingLang.push(sample)
      }
      if (SCRIPTS.arabic.test(text)) {
        use('ar')
        if (!lang.startsWith('ar')) missingLang.push(sample)
        if (el.closest('[dir]')?.getAttribute('dir') !== 'rtl') missingRtl.push(sample)
      }
    }
    const FONT = { ja: 'Noto Sans JP Variable', ko: 'Noto Sans KR Variable', zh: 'Noto Sans SC Variable', ar: 'Noto Sans Arabic Variable' }
    const loadedFamilies = () => new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')))
    // Script fonts load on demand (dynamic CSS + unicode-range); give them a moment.
    for (let i = 0; i < 40; i++) {
      const fams = loadedFamilies()
      if ([...used].every((l) => fams.has(FONT[l])) && fams.has('Plus Jakarta Sans Variable')) break
      await new Promise((r) => setTimeout(r, 100))
      await document.fonts.ready
    }
    const fams = loadedFamilies()
    const fontProblems = []
    if (!fams.has('Plus Jakarta Sans Variable')) fontProblems.push('Plus Jakarta Sans Variable not loaded')
    for (const l of used) if (!fams.has(FONT[l])) fontProblems.push(`${FONT[l]} not loaded`)
    const unlabeled = []
    document.querySelectorAll('input, select, textarea').forEach((c) => {
      if (c.type === 'hidden' || c.closest('[hidden]')) return
      const ok = (c.labels && c.labels.length) || c.getAttribute('aria-label') || c.getAttribute('aria-labelledby') || c.closest('label') || c.getAttribute('title')
      if (!ok) unlabeled.push(c.id || c.name || c.type)
    })
    const h1s = [...document.querySelectorAll('h1')]
    return {
      theme: document.documentElement.getAttribute('data-theme'),
      htmlLang: document.documentElement.getAttribute('lang'),
      title: document.title,
      h1: h1s[0] ? h1s[0].textContent.trim().slice(0, 80) : null,
      h1Count: h1s.length,
      overflowX: document.documentElement.scrollWidth - window.innerWidth,
      bodyFont: getComputedStyle(document.body).fontFamily.split(',')[0].replace(/"/g, '').trim(),
      scripts: [...used],
      missingLang: missingLang.slice(0, 5),
      missingLangCount: missingLang.length,
      missingRtl: missingRtl.slice(0, 5),
      missingRtlCount: missingRtl.length,
      fontProblems,
      unlabeled,
    }
  })
}

function withTheme(base, route, theme) {
  const url = new URL(route, base)
  if (theme) url.searchParams.set('theme', theme)
  return url.toString()
}

async function pool(items, workers, fn) {
  let i = 0
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    while (i < items.length) {
      const item = items[i++]
      await fn(item, w)
    }
  }))
}

// ---------- Page checks ----------
async function checkPages(browser, product, base, routes) {
  for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
    const contexts = await Promise.all(Array.from({ length: WORKERS }, () => browser.newContext({ viewport })))
    const pages = await Promise.all(contexts.map((c) => c.newPage()))
    const errors = pages.map(() => [])
    pages.forEach((p, w) => {
      p.on('console', (m) => { if (m.type() === 'error') errors[w].push(m.text()) })
      p.on('pageerror', (e) => errors[w].push(String(e)))
    })
    const tasks = THEMES.flatMap((theme) => routes.map((route) => ({ theme, route })))
    await pool(tasks, WORKERS, async ({ theme, route }, w) => {
      const page = pages[w]
      errors[w].length = 0
      const started = Date.now()
      const response = await page.goto(withTheme(base, route, theme), { waitUntil: 'networkidle' })
      await page.waitForSelector('h1', { timeout: 8000 }).catch(() => {})
      const info = await inspect(page)
      const row = { product, route, theme, viewport: vpName, status: response ? response.status() : 0, ms: Date.now() - started, ...info, consoleErrors: [...errors[w]] }
      results.pages.push(row)
      const id = `${product} ${route} [${theme}, ${vpName}]`
      if (row.status >= 400) problem(`${id}: HTTP ${row.status}`)
      if (info.theme !== theme) problem(`${id}: theme is ${info.theme}`)
      if (info.overflowX > 0) problem(`${id}: horizontal scroll ${info.overflowX}px`)
      if (row.consoleErrors.length) problem(`${id}: console errors: ${row.consoleErrors.join(' | ')}`)
      if (!info.h1) problem(`${id}: no h1`)
      if (info.h1Count > 1) problem(`${id}: ${info.h1Count} h1 elements`)
      if (info.htmlLang !== 'id') problem(`${id}: html lang is ${info.htmlLang}`)
      if (info.bodyFont !== 'Plus Jakarta Sans Variable') problem(`${id}: body font ${info.bodyFont}`)
      if (info.fontProblems.length) problem(`${id}: ${info.fontProblems.join(', ')}`)
      if (info.missingLangCount) problem(`${id}: ${info.missingLangCount} foreign text nodes without lang: ${info.missingLang.join(' / ')}`)
      if (info.missingRtlCount) problem(`${id}: ${info.missingRtlCount} Arabic text nodes without dir=rtl`)
      if (info.unlabeled.length) problem(`${id}: form controls without label: ${info.unlabeled.join(', ')}`)
    })
    await Promise.all(contexts.map((c) => c.close()))
    console.log(`  ${product} ${vpName}: ${tasks.length} page loads done`)
  }
}

// ---------- axe-core ----------
async function checkAxe(browser, product, base, routes) {
  const runs = [...THEMES.map((theme) => ({ theme, viewport: 'desktop' })), { theme: 'light', viewport: 'mobile' }]
  for (const run of runs) {
    const contexts = await Promise.all(Array.from({ length: WORKERS }, () => browser.newContext({ viewport: VIEWPORTS[run.viewport], reducedMotion: 'reduce' })))
    const pages = await Promise.all(contexts.map((c) => c.newPage()))
    await pool(routes, WORKERS, async (route, w) => {
      const page = pages[w]
      await page.goto(withTheme(base, route, run.theme), { waitUntil: 'networkidle' })
      await page.waitForSelector('h1', { timeout: 8000 }).catch(() => {})
      await page.waitForTimeout(150)
      await page.addScriptTag({ content: AXE })
      const res = await page.evaluate(async () => {
        const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] })
        return r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes.slice(0, 3).map((n) => n.target.join(' ')), summary: (v.nodes[0] && v.nodes[0].failureSummary || '').slice(0, 200) }))
      })
      results.axe.runs++
      if (res.length) {
        results.axe.pages.push({ product, route, theme: run.theme, viewport: run.viewport, violations: res })
        for (const v of res) {
          results.axe.byRule[v.id] = (results.axe.byRule[v.id] || 0) + v.nodes
          problem(`axe ${product} ${route} [${run.theme}, ${run.viewport}]: ${v.id} (${v.impact}) ×${v.nodes} e.g. ${v.sample[0]}`)
        }
      }
    })
    await Promise.all(contexts.map((c) => c.close()))
    console.log(`  axe ${product} ${run.theme}/${run.viewport}: ${routes.length} pages`)
  }
}

// ---------- Tokens & static contrast ----------
function sha(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }
function contrast(a, b) {
  const hex = (h) => { const v = h.replace('#', '').trim(); return v.length === 3 ? [...v].map((x) => x + x).join('') : v }
  const lum = (h) => { const c = hex(h).match(/../g).map((x) => parseInt(x, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] }
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100
}
async function checkTokens(browser) {
  const files = ['tokens.css', 'base.css']
  for (const f of files) {
    const a = sha(path.join(ROOT, 'linguadrop/src/styles', f))
    const b = sha(path.join(ROOT, 'linguadash/src/styles', f))
    results.tokens[f] = { linguadrop: a, linguadash: b, identical: a === b }
    if (a !== b) problem(`${f} differs between LinguaDrop and LinguaDash`)
  }
  const page = await browser.newPage()
  const read = async (url) => { await page.goto(url, { waitUntil: 'networkidle' }); return page.evaluate((names) => Object.fromEntries(names.map((n) => [n, getComputedStyle(document.documentElement).getPropertyValue(`--${n}`).trim()])), TOKEN_NAMES) }
  results.tokens.computed = {}
  for (const theme of THEMES) {
    const site = await read(withTheme(SITE, '/', theme))
    const app = await read(withTheme(APP, '/login', theme))
    const diff = TOKEN_NAMES.filter((n) => site[n] !== app[n])
    results.tokens.computed[theme] = { values: site, sameInBothProducts: diff.length === 0, differences: diff }
    if (diff.length) problem(`computed tokens differ in ${theme}: ${diff.join(', ')}`)
    const pairs = [['ink', 'bg'], ['ink', 'surface'], ['muted', 'bg'], ['muted', 'surface'], ['muted', 'surface-2'], ['accent-ink', 'bg'], ['accent-ink', 'surface'], ['accent-ink', 'accent-soft'], ['on-accent', 'accent'], ['good', 'surface'], ['warn', 'surface'], ['bad', 'surface'], ['line-strong', 'surface']]
    for (const [fg, bg] of pairs) {
      const ratio = contrast(site[fg], site[bg])
      const min = fg === 'line-strong' ? 3 : 4.5
      results.contrast.push({ theme, fg, bg, ratio, min, pass: ratio >= min })
      if (ratio < min) problem(`contrast ${theme} ${fg} on ${bg}: ${ratio}:1 (needs ${min})`)
    }
  }
  await page.close()
}

// ---------- Keyboard ----------
async function kb(browser, name, fn, viewport = VIEWPORTS.desktop) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  let pass = false
  let detail = ''
  try { [pass, detail] = await fn(page) } catch (e) { detail = String(e).split('\n')[0] }
  results.keyboard.push({ name, pass, detail })
  console.log(`  ${pass ? 'PASS' : 'FAIL'} keyboard: ${name}${detail ? ` (${detail})` : ''}`)
  if (!pass) problem(`keyboard: ${name} ${detail}`)
  await context.close()
}
const active = (page) => page.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName.toLowerCase()}${a.id ? '#' + a.id : ''}${a.className && typeof a.className === 'string' ? '.' + a.className.split(' ')[0] : ''}|${(a.textContent || '').trim().slice(0, 30)}` : '' })

async function keyboardTests(browser) {
  await kb(browser, 'LinguaDrop: first Tab reaches skip link, Enter moves focus to main', async (page) => {
    await page.goto(`${SITE}/?theme=light`)
    await page.keyboard.press('Tab')
    const first = await active(page)
    await page.keyboard.press('Enter')
    const after = await active(page)
    return [first.includes('skip-link') && after.startsWith('main#main'), `${first} -> ${after}`]
  })
  await kb(browser, 'LinguaDrop: dropdown opens with Enter, Escape closes and returns focus', async (page) => {
    await page.goto(`${SITE}/harga.html?theme=light`)
    const summary = page.locator('.nav-menu summary').first()
    await summary.focus()
    await page.keyboard.press('Enter')
    const open = await page.locator('.nav-menu').first().evaluate((d) => d.open)
    await page.keyboard.press('Tab')
    const inside = await active(page)
    await page.keyboard.press('Escape')
    const closed = await page.locator('.nav-menu').first().evaluate((d) => !d.open)
    const back = await active(page)
    return [open && inside.startsWith('a') && closed && back.startsWith('summary'), `open=${open} inside=${inside} closed=${closed} focus=${back}`]
  })
  await kb(browser, 'LinguaDrop: mobile menu toggles with Enter and Escape', async (page) => {
    await page.goto(`${SITE}/?theme=dark`)
    await page.locator('.nav-toggle').focus()
    await page.keyboard.press('Enter')
    const expanded = await page.getAttribute('.nav-toggle', 'aria-expanded')
    const visible = await page.locator('#site-nav').isVisible()
    await page.keyboard.press('Escape')
    const collapsed = await page.getAttribute('.nav-toggle', 'aria-expanded')
    const back = await active(page)
    return [expanded === 'true' && visible && collapsed === 'false' && back.includes('nav-toggle'), `expanded=${expanded} visible=${visible} after=${collapsed} focus=${back}`]
  }, VIEWPORTS.mobile)
  await kb(browser, 'LinguaDrop: price tabs switch with arrow keys', async (page) => {
    await page.goto(`${SITE}/harga.html?theme=batik`)
    await page.locator('#tab-en').focus()
    await page.keyboard.press('ArrowRight')
    const selected = await page.getAttribute('#tab-ja', 'aria-selected')
    const panel = await page.locator('#panel-ja').isVisible()
    const focus = await active(page)
    return [selected === 'true' && panel && focus.includes('#tab-ja'), `selected=${selected} panel=${panel} focus=${focus}`]
  })
  await kb(browser, 'LinguaDrop: placement quiz answerable with keyboard only', async (page) => {
    await page.goto(`${SITE}/tes-penempatan.html?theme=light`)
    await page.locator('[data-quiz-start]').focus()
    await page.keyboard.press('Enter')
    const legend = await active(page)
    await page.keyboard.press('Tab') // first radio
    await page.keyboard.press('Space')
    const checked = await page.locator('input[name="answer"]:checked').count()
    return [legend.startsWith('legend') && checked === 1, `focus after start=${legend}, checked=${checked}`]
  })
  await kb(browser, 'LinguaDash: first Tab reaches skip link, Enter moves focus to content', async (page) => {
    await page.goto(`${APP}/?theme=light`)
    await page.waitForSelector('h1')
    await page.keyboard.press('Tab')
    const first = await active(page)
    await page.keyboard.press('Enter')
    const after = await active(page)
    return [first.includes('skip-link') && after.startsWith('main#content'), `${first} -> ${after}`]
  })
  await kb(browser, 'LinguaDash: sidebar group expands with keyboard', async (page) => {
    await page.goto(`${APP}/?theme=dark`)
    await page.waitForSelector('h1')
    const btn = page.locator('.nav-group-btn', { hasText: 'Keuangan' })
    await btn.focus()
    const before = await btn.getAttribute('aria-expanded')
    await page.keyboard.press('Enter')
    const after = await btn.getAttribute('aria-expanded')
    return [before === 'false' && after === 'true', `${before} -> ${after}`]
  })
  await kb(browser, 'LinguaDash: modal traps focus, Escape closes and restores focus', async (page) => {
    await page.goto(`${APP}/ui/overlay?theme=batik`)
    await page.waitForSelector('h1')
    const opener = page.locator('button', { hasText: 'Buka modal' })
    await opener.focus()
    await page.keyboard.press('Enter')
    await page.waitForSelector('dialog[open]')
    const inside = await page.evaluate(() => !!document.activeElement && !!document.activeElement.closest('dialog[open]'))
    for (let i = 0; i < 6; i++) await page.keyboard.press('Tab')
    const stillInside = await page.evaluate(() => !!document.activeElement && !!document.activeElement.closest('dialog[open]'))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(100)
    const closed = (await page.locator('dialog[open]').count()) === 0
    const back = await active(page)
    return [inside && stillInside && closed && back.includes('Buka modal'), `inside=${inside} afterTabs=${stillInside} closed=${closed} focus=${back}`]
  })
  await kb(browser, 'LinguaDash: rubric tabs switch with arrow keys', async (page) => {
    await page.goto(`${APP}/akademik/rubrik?theme=light`)
    await page.waitForSelector('h1')
    await page.locator('#tab-speaking').focus()
    await page.keyboard.press('ArrowRight')
    const selected = await page.getAttribute('#tab-writing', 'aria-selected')
    const focus = await active(page)
    return [selected === 'true' && focus.includes('#tab-writing'), `selected=${selected} focus=${focus}`]
  })
  await kb(browser, 'LinguaDash: login form submits with Enter', async (page) => {
    await page.goto(`${APP}/login?theme=light`)
    await page.locator('#password').focus()
    await page.keyboard.press('Enter')
    await page.waitForURL(`${APP}/`)
    await page.waitForSelector('h1:has-text("Overview")')
    return [true, page.url()]
  })
}

// ---------- Flows ----------
async function flow(browser, name, fn, viewport = VIEWPORTS.desktop) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  const checks = []
  const expect = (label, ok, detail = '') => checks.push({ label, ok: !!ok, detail: String(detail) })
  try { await fn(page, expect, context) } catch (e) { checks.push({ label: 'no exception', ok: false, detail: String(e).split('\n')[0] }) }
  if (errors.length) checks.push({ label: 'no console errors', ok: false, detail: errors.join(' | ').slice(0, 300) })
  const pass = checks.length > 0 && checks.every((c) => c.ok)
  results.flows.push({ name, pass, checks })
  console.log(`  ${pass ? 'PASS' : 'FAIL'} ${name} (${checks.filter((c) => c.ok).length}/${checks.length})`)
  for (const c of checks) if (!c.ok) problem(`flow "${name}": ${c.label} ${c.detail}`)
  await context.close()
}

/** Waits (up to 6 s) until the locator has the text; client-side routes render after their chunk loads. */
async function shows(page, selector, text, timeout = 6000) {
  try {
    await page.locator(selector, text ? { hasText: text } : {}).first().waitFor({ state: 'visible', timeout })
    return true
  } catch {
    return false
  }
}

const ANSWERS = [...fs.readFileSync(path.join(ROOT, 'linguadash/src/data/placement.ts'), 'utf8').matchAll(/answer: (\d)/g)].map((m) => Number(m[1]))
const PRICE_N5 = 2250000

async function siteFlows(browser) {
  await flow(browser, 'LinguaDrop: tes penempatan 15 soal sampai hasil CEFR', async (page, expect) => {
    await page.goto(`${SITE}/tes-penempatan.html?theme=light`)
    await page.click('[data-quiz-start]')
    await page.click('[data-quiz-next]')
    expect('error shown when no answer is picked', await page.locator('[data-quiz-error]').isVisible())
    for (let i = 0; i < 15; i++) {
      const pick = i < 8 ? ANSWERS[i] : (ANSWERS[i] + 1) % 4 // 8 correct answers -> B1
      await page.locator('input[name="answer"]').nth(pick).check()
      await page.click('[data-quiz-next]')
    }
    await page.waitForURL(/hasil-tes\.html/)
    await page.waitForFunction(() => document.querySelector('[data-result-score]')?.textContent === '8')
    expect('result level is B1 for 8/15', (await page.textContent('[data-result-level]')) === 'B1', await page.textContent('[data-result-level]'))
    expect('score shows 8', (await page.textContent('[data-result-score]')) === '8')
    expect('sample notice hidden', !(await page.locator('[data-result-sample]').isVisible()))
    expect('register link carries level', (await page.getAttribute('[data-result-register]', 'href')).includes('level=B1'))
    expect('answer review lists 15 items', (await page.locator('[data-result-answers] li').count()) === 15)
  })
  await flow(browser, 'LinguaDrop: booking kelas trial dengan slot waktu', async (page, expect) => {
    await page.goto(`${SITE}/trial.html?bahasa=ja&theme=dark`)
    expect('language preselected from URL', (await page.inputValue('#tr-lang')) === 'ja')
    await page.click('[data-trial-form] button[type=submit]')
    expect('name marked invalid', (await page.getAttribute('#tr-name', 'aria-invalid')) === 'true')
    await page.fill('#tr-name', 'Dimas Pratama')
    await page.fill('#tr-wa', '123')
    await page.click('[data-trial-form] button[type=submit]')
    expect('invalid WhatsApp number rejected', (await page.locator('#wa-error, .field:has(#tr-wa) .error').first().textContent()).includes('nomor Indonesia'))
    await page.fill('#tr-wa', '0812 3456 7890')
    await page.selectOption('#tr-mode', 'online')
    await page.locator('[data-days] input').nth(1).check()
    const slot = page.locator('input[name="slot"]:not([disabled])').first()
    const slotValue = await slot.getAttribute('value')
    await slot.check()
    await page.click('[data-trial-form] button[type=submit]')
    await page.waitForSelector('[data-trial-success]:not([hidden])')
    const text = await page.textContent('[data-trial-success]')
    expect('success shows booking code', /TR-\d{5}/.test(text), text.slice(0, 80))
    expect('success shows language, place and slot', text.includes('Bahasa Jepang') && text.includes('Online') && text.includes(slotValue))
  })
  await flow(browser, 'LinguaDrop: pendaftaran 4 langkah sampai konfirmasi', async (page, expect) => {
    await page.goto(`${SITE}/pendaftaran.html?theme=batik`)
    await page.click('[data-next]')
    expect('step 1 blocks empty form', (await page.locator('[data-step="1"]').isVisible()) && (await page.locator('[data-register-error]').isVisible()))
    await page.fill('#rg-name', 'Keisha Anggraeni')
    await page.fill('#rg-birth', '2012-05-10')
    await page.fill('#rg-wa', '0812 3456 7890')
    await page.fill('#rg-email', 'keisha@mail.example')
    await page.click('[data-next]')
    expect('step 2 visible', await page.locator('[data-step="2"]').isVisible())
    await page.selectOption('#rg-lang', 'ja')
    await page.selectOption('#rg-level', 'N5')
    await page.selectOption('#rg-mode', 'online')
    const classRadio = page.locator('input[name="classId"]').first()
    await classRadio.check()
    await page.fill('#rg-promo', 'earlybird')
    await page.click('[data-next]')
    expect('step 3 visible', await page.locator('[data-step="3"]').isVisible())
    expect('guardian required for a 14-year-old', (await page.textContent('[data-guardian-note]')).includes('wajib'))
    await page.locator('input[name="terms"]').check()
    await page.click('[data-next]')
    expect('step 3 blocks missing guardian', await page.locator('[data-step="3"]').isVisible())
    await page.fill('#rg-parent', 'Ibu Ratna Anggraeni')
    await page.fill('#rg-parent-wa', '0813 0000 1111')
    await page.click('[data-next]')
    expect('step 4 visible', await page.locator('[data-step="4"]').isVisible())
    const summary = await page.textContent('[data-register-summary]')
    const expected = PRICE_N5 + 125000 + 150000 - Math.round((PRICE_N5 * 10) / 100 / 1000) * 1000
    const fmt = (n) => 'Rp ' + n.toLocaleString('id-ID')
    expect('summary applies EARLYBIRD and totals correctly', summary.includes('EARLYBIRD') && summary.replace(/\s/g, ' ').includes(fmt(expected).replace(/\s/g, ' ')), `${fmt(expected)} in "${summary.slice(-60)}"`)
    await page.locator('input[name="pay"][value="qris"]').check()
    await page.click('[data-next]')
    await page.waitForURL(/konfirmasi\.html\?ref=PN-/)
    await page.waitForSelector('[data-confirm-summary] div')
    expect('confirmation shows reference', /^PN-\d{4}-\d{4}$/.test((await page.textContent('[data-confirm-ref]')).trim()))
    expect('confirmation greets by name', (await page.textContent('[data-confirm-title]')).includes('Keisha'))
    expect('QRIS instructions shown', (await page.textContent('[data-confirm-pay]')).includes('QRIS'))
    expect('theme kept after submit', (await page.getAttribute('html', 'data-theme')) === 'batik')
  })
  await flow(browser, 'LinguaDrop: jadwal kelas dengan filter bahasa, level, cabang, mode', async (page, expect) => {
    await page.goto(`${SITE}/jadwal.html?theme=light`)
    const all = await page.locator('.class-row').count()
    expect('schedule lists classes', all > 20, all)
    expect('level filter disabled without language', await page.locator('#f-level').isDisabled())
    await page.selectOption('#f-lang', 'ko')
    const titles = await page.locator('.class-row h3').allTextContents()
    expect('language filter keeps only Korean', titles.length > 0 && titles.every((t) => t.includes('Korea')), titles.length)
    await page.selectOption('#f-level', { index: 1 })
    const level = await page.inputValue('#f-level')
    const lv = await page.locator('.class-row h3').allTextContents()
    expect('level filter applied', lv.every((t) => t.endsWith(level)), `${level}: ${lv.length}`)
    expect('URL keeps filters', page.url().includes('bahasa=ko'))
    await page.selectOption('#f-level', '')
    await page.selectOption('#f-mode', 'online')
    await page.selectOption('#f-branch', 'bdg')
    expect('impossible combination shows empty state', await page.locator('.empty').isVisible())
    await page.click('.empty [data-reset]')
    await page.waitForFunction((n) => document.querySelectorAll('.class-row').length === n, all)
    expect('reset restores all classes', (await page.locator('.class-row').count()) === all)
  })
  await flow(browser, 'LinguaDrop: filter pengajar dan profil', async (page, expect) => {
    await page.goto(`${SITE}/pengajar.html?theme=dark`)
    await page.selectOption('#t-lang', 'de')
    await page.selectOption('#t-type', 'native')
    const names = await page.locator('[data-teacher-list] h3').allTextContents()
    expect('two native German teachers', names.length === 2, names.join(', '))
    await page.locator('[data-teacher-list] a').first().click()
    await page.waitForURL(/profil-pengajar\.html\?id=/)
    expect('profile shows the chosen teacher', (await page.textContent('h1')) === names[0])
    if (names[0] === 'Lukas Becker') expect('German quote carries lang="de"', (await page.locator('[data-p-quote] [lang="de"]').count()) === 1)
  })
  await flow(browser, 'LinguaDrop: kalkulator privat dan tab harga', async (page, expect) => {
    await page.goto(`${SITE}/harga.html?theme=light`)
    expect('default 10 jam lokal online', (await page.textContent('[data-calc-total]')).includes('1.650.000'))
    await page.selectOption('#calc-teacher', 'native')
    await page.selectOption('#calc-mode', 'offline')
    await page.selectOption('#calc-hours', '20')
    expect('20 jam native offline with 15% off', (await page.textContent('[data-calc-total]')).includes('4.675.000'), await page.textContent('[data-calc-total]'))
    await page.click('#tab-de')
    expect('German price panel visible', await page.locator('#panel-de').isVisible())
  })
  await flow(browser, 'LinguaDrop: formulir kontak validasi dan sukses', async (page, expect) => {
    await page.goto(`${SITE}/kontak.html?theme=batik`)
    await page.click('form[data-demo-form] button[type=submit]')
    expect('required fields flagged', (await page.locator('form[data-demo-form] [aria-invalid="true"]').count()) >= 3)
    await page.fill('#ct-name', 'Nadia Hutapea')
    await page.fill('#ct-email', 'nadia@mail.example')
    await page.fill('#ct-msg', 'Halo, saya ingin info kelas Business English untuk 8 karyawan.')
    await page.click('form[data-demo-form] button[type=submit]')
    expect('success message shown', await page.locator('form[data-demo-form] [data-success]').isVisible())
  })
  await flow(browser, 'LinguaDrop: tombol Masuk dan Daftar membuka LinguaDash dengan tema yang sama', async (page, expect) => {
    await page.goto(`${SITE}/?theme=batik`)
    await page.locator('.header-actions a', { hasText: 'Daftar' }).click()
    await page.waitForURL(`${APP}/daftar?theme=batik`)
    await page.waitForSelector('h1')
    expect('Daftar opens /daftar', (await page.textContent('h1')) === 'Buat akun lembaga')
    expect('theme carried to LinguaDash', (await page.getAttribute('html', 'data-theme')) === 'batik')
    await page.goto(`${SITE}/?theme=dark`)
    await page.locator('.header-actions a', { hasText: 'Masuk' }).click()
    await page.waitForURL(`${APP}/login?theme=dark`)
    await page.waitForSelector('h1')
    expect('Masuk opens /login in dark', (await page.textContent('h1')) === 'Masuk ke LinguaDash' && (await page.getAttribute('html', 'data-theme')) === 'dark')
  })
  await flow(browser, 'LinguaDrop: halaman tidak dikenal memberi 404', async (page, expect) => {
    // Checked with a plain HTTP request: a browser always logs a console error for a 404 document.
    const res = await page.request.get(`${SITE}/halaman-yang-tidak-ada`)
    const body = await res.text()
    expect('HTTP 404', res.status() === 404, res.status())
    expect('body is the 404 page', body.includes('Halaman tidak ditemukan'))
    await page.goto(`${SITE}/404.html?theme=dark`)
    expect('404.html renders with links home', (await page.textContent('h1')).includes('tidak ditemukan') && (await page.locator('main a[href="/"]').count()) === 1)
  })
  await flow(browser, 'LinguaDrop: pilihan tema tersimpan antarhalaman', async (page, expect) => {
    await page.goto(`${SITE}/?theme=light`)
    await page.locator('.header-actions [data-theme-set="batik"]').click()
    await page.goto(`${SITE}/faq.html`)
    expect('batik kept on next page', (await page.getAttribute('html', 'data-theme')) === 'batik')
    expect('switch shows pressed state', (await page.getAttribute('.header-actions [data-theme-set="batik"]', 'aria-pressed')) === 'true')
  })
}

async function appFlows(browser) {
  const go = async (page, route) => { await page.goto(`${APP}${route}`); await page.waitForSelector('h1') }
  await flow(browser, 'LinguaDash: daftar, verifikasi, onboarding 3 langkah sampai overview', async (page, expect) => {
    await go(page, '/daftar?theme=light')
    await page.click('button[type=submit]')
    expect('register validates', (await page.locator('[aria-invalid="true"]').count()) >= 3)
    await page.fill('#name', 'Rina Kartika')
    await page.fill('#institution', 'Polyglot Nusantara')
    await page.fill('#reg-email', 'rina@polyglotnusantara.example')
    await page.fill('#reg-password', 'rahasia123')
    await page.check('input[name=agree]')
    await page.click('button[type=submit]')
    await page.waitForURL(`${APP}/verifikasi-email`)
    await page.click('text=Saya sudah verifikasi, lanjutkan')
    await page.waitForURL(`${APP}/onboarding/profil`)
    await page.click('button[type=submit]')
    await page.waitForURL(`${APP}/onboarding/bahasa`)
    await page.locator('label.choice', { hasText: 'Jerman' }).click()
    await page.click('button[type=submit]')
    await page.waitForURL(`${APP}/onboarding/paket`)
    expect('German price field added', await shows(page, '#price-de'))
    await page.click('button[type=submit]')
    await page.waitForURL(`${APP}/`)
    expect('overview after onboarding', await shows(page, 'h1', 'Overview'))
    expect('welcome toast', await shows(page, '.toast', 'siap'))
  })
  await flow(browser, 'LinguaDash: tambah siswa, cari di daftar, edit status', async (page, expect) => {
    await go(page, '/siswa/baru?theme=dark')
    await page.click('button[type=submit]')
    expect('validation lists errors', (await page.locator('[aria-invalid="true"]').count()) >= 4)
    await page.fill('#st-name', 'Uji Coba Playwright')
    await page.fill('#st-birth', '2001-04-12')
    await page.fill('#st-phone', '0812 0000 9999')
    await page.fill('#st-email', 'uji.coba@mail.example')
    await page.selectOption('#st-lang', 'ja')
    await page.selectOption('#st-level', 'N5')
    await page.selectOption('#st-branch', 'online')
    const options = await page.locator('#st-class option').count()
    if (options > 1) await page.selectOption('#st-class', { index: 1 })
    await page.click('button[type=submit]')
    await page.waitForURL(/\/siswa\/S-\d{4}$/)
    await page.waitForSelector('h1:has-text("Uji Coba Playwright")')
    const id = page.url().split('/').pop()
    expect('detail page for new student', true, id)
    await go(page, '/siswa?q=Uji%20Coba')
    expect('new student found in list', (await page.locator('tbody tr', { hasText: 'Uji Coba Playwright' }).count()) === 1)
    await go(page, `/siswa/${id}/edit`)
    await page.selectOption('#st-status', 'cuti')
    await page.click('button[type=submit]')
    await page.waitForURL(`${APP}/siswa/${id}`)
    expect('status changed to Cuti', await shows(page, '.badge', 'Cuti'))
    await page.reload()
    expect('change survives reload', await shows(page, '.badge', 'Cuti'))
  })
  await flow(browser, 'LinguaDash: buat invoice dengan promo lalu catat pembayaran', async (page, expect) => {
    await go(page, '/keuangan/invoice/baru?theme=batik')
    await page.click('button[type=submit]')
    expect('student required', (await page.getAttribute('#inv-student', 'aria-invalid')) === 'true')
    const value = await page.locator('#inv-student option').nth(1).getAttribute('value')
    await page.selectOption('#inv-student', value)
    await page.click('button:has-text("+ Kursus level")')
    await page.click('button:has-text("+ Buku")')
    await page.selectOption('#inv-promo', 'EARLYBIRD')
    const total = await page.locator('.totals .grand span').last().textContent()
    await page.click('button[type=submit]')
    await page.waitForURL(/\/keuangan\/invoice\/INV-\d{4}-\d{4}$/)
    const id = page.url().split('/').pop()
    expect('detail shows invoice number', await shows(page, 'h1', id))
    expect('detail total matches form', (await page.locator('.invoice-doc .totals .grand span').last().textContent()) === total, total)
    expect('status Belum bayar', await page.locator('.page-header .badge', { hasText: 'Belum bayar' }).isVisible())
    await page.click('button:has-text("Catat pembayaran")')
    await page.waitForSelector('dialog[open]')
    await page.click('dialog[open] button[type=submit]')
    await page.waitForSelector('.page-header .badge:has-text("Lunas")')
    expect('paid in full', true)
    await go(page, `/keuangan/invoice?q=${id}`)
    expect('invoice in list as Lunas', (await page.locator('tbody tr', { hasText: id }).locator('.badge', { hasText: 'Lunas' }).count()) === 1)
  })
  await flow(browser, 'LinguaDash: input absensi per pertemuan dan rekap', async (page, expect) => {
    await go(page, '/absensi?kelas=K-101&theme=light')
    const meeting = await page.inputValue('#att-meeting')
    const firstRow = page.locator('.att-row').first()
    const studentId = (await firstRow.locator('small').first().textContent()).trim()
    await firstRow.locator('.att-izin').click()
    await page.locator('.att-row').nth(1).locator('.att-alpa').click()
    await page.click('button:has-text("Simpan absensi")')
    await page.waitForSelector('.notice-good[role=status]')
    expect('save confirmation shown', true)
    await go(page, '/absensi?kelas=K-101')
    await page.selectOption('#att-meeting', meeting)
    expect('saved status restored after reload', await page.locator('.att-row').first().locator('.att-izin input').isChecked())
    await go(page, `/absensi/rekap-siswa?q=${studentId}`)
    const row = page.locator('tbody tr').first()
    expect('recap row for student', (await row.textContent()).includes(studentId))
  })
  await flow(browser, 'LinguaDash: input nilai 4 skill dengan validasi rentang', async (page, expect) => {
    await go(page, '/akademik/nilai?kelas=K-101&theme=dark')
    const first = page.locator('tbody tr').first()
    const listening = first.locator('input').nth(0)
    const id = (await listening.getAttribute('id')).split('-').slice(1, 3).join('-')
    await listening.fill('150')
    await page.click('button:has-text("Simpan nilai")')
    expect('out of range value rejected', (await listening.getAttribute('aria-invalid')) === 'true')
    await listening.fill('95')
    await first.locator('input').nth(1).fill('88')
    await first.locator('input').nth(2).fill('90')
    await first.locator('input').nth(3).fill('84')
    await page.click('button:has-text("Simpan nilai")')
    await page.waitForSelector('.notice-good[role=status]')
    await go(page, `/siswa/${id}`)
    const bars = await page.locator('.hbar-value').allTextContents()
    expect('student detail shows new scores', bars.slice(0, 4).join(',') === '95,88,90,84', bars.slice(0, 4).join(','))
  })
  await flow(browser, 'LinguaDash: tetapkan kelas dari hasil tes penempatan', async (page, expect) => {
    await go(page, '/tes-penempatan?status=menunggu&theme=light')
    const name = (await page.locator('tbody tr').first().locator('.strong-link').textContent()).trim()
    await page.locator('tbody tr').first().locator('a', { hasText: 'Tetapkan kelas' }).click()
    await page.waitForURL(/tetapkan$/)
    await page.waitForSelector('h1')
    await page.click('button[type=submit]')
    expect('class choice required', await page.locator('#assign-error').isVisible())
    await page.locator('input[name="class"]:not([disabled])').first().check()
    await page.click('button[type=submit]')
    await page.waitForURL(/\/siswa\/S-\d{4}$/)
    expect('student created from test result', await shows(page, 'h1', name), name)
    await go(page, '/tes-penempatan?status=menunggu')
    expect('test no longer waiting', (await page.locator('tbody tr', { hasText: name }).count()) === 0)
  })
  await flow(browser, 'LinguaDash: ubah status trial dan tersimpan', async (page, expect) => {
    await go(page, '/trial?status=terjadwal&theme=batik')
    const select = page.locator('tbody tr').first().locator('select')
    const id = await select.getAttribute('id')
    await select.selectOption('mendaftar')
    await go(page, '/trial')
    expect('status persisted', (await page.locator(`#${id}`).inputValue()) === 'mendaftar')
  })
  await flow(browser, 'LinguaDash: impor CSV siswa', async (page, expect) => {
    await go(page, '/siswa/impor?theme=light')
    await page.click('button:has-text("Isi dengan contoh data")')
    expect('4 valid rows and 1 rejected', (await page.locator('tbody .badge-good').count()) === 4 && (await page.locator('tbody .badge-bad').count()) === 1)
    await page.click('button:has-text("Impor 4 siswa")')
    await page.waitForURL(/\/siswa\?/)
    await go(page, '/siswa?q=Melati%20Kusuma')
    expect('imported student visible', (await page.locator('tbody tr', { hasText: 'Melati Kusuma' }).count()) === 1)
  })
  await flow(browser, 'LinguaDash: tabel siswa sort, filter, pagination', async (page, expect) => {
    await go(page, '/siswa?theme=light')
    const firstAsc = await page.locator('tbody tr').first().locator('.strong-link').textContent()
    await page.click('th button:has-text("Siswa")')
    expect('aria-sort descending', await shows(page, 'th[aria-sort="descending"]'))
    const firstDesc = await page.locator('tbody tr').first().locator('.strong-link').textContent()
    expect('order reversed', firstAsc !== firstDesc, `${firstAsc} / ${firstDesc}`)
    await page.click('.pagination button[aria-label="Halaman 2"]')
    expect('page 2 selected', (await page.getAttribute('.pagination button[aria-label="Halaman 2"]', 'aria-current')) === 'page')
    await page.selectOption('#f-lang', 'zh')
    await page.waitForFunction(() => location.search.includes('bahasa=zh'))
    await page.waitForFunction(() => [...document.querySelectorAll('tbody .lang-tag')].every((t) => t.textContent.startsWith('Mandarin')))
    const langs = await page.locator('tbody .lang-tag').allTextContents()
    expect('language filter', langs.length > 0 && langs.every((t) => t.startsWith('Mandarin')), langs.length)
    expect('filter in URL', page.url().includes('bahasa=zh'))
  })
  await flow(browser, 'LinguaDash: buat mock test dan kenaikan level', async (page, expect) => {
    await go(page, '/akademik/mock-test/baru?theme=dark')
    await page.locator('label.choice', { hasText: 'IELTS' }).click()
    await page.fill('#mt-title', 'Simulasi IELTS Desember')
    await page.fill('#mt-date', '2026-12-12')
    await page.click('button[type=submit]')
    expect('class required', await page.locator('#mt-classes-error').isVisible())
    await page.locator('#mt-classes input[type=checkbox]').first().check()
    await page.click('button[type=submit]')
    await page.waitForURL(`${APP}/akademik/mock-test`)
    expect('new mock test listed', await shows(page, 'h2', 'Simulasi IELTS Desember'))
    await go(page, '/akademik/kenaikan-level')
    const btn = page.locator('tbody button:has-text("Naikkan")').first()
    const row = btn.locator('xpath=ancestor::tr')
    const name = await row.locator('.strong-link').textContent()
    await btn.click()
    await page.waitForSelector('.toast')
    expect('promoted student marked', await shows(page, `tbody tr:has-text("${name}") .badge`, 'Sudah naik'), name)
  })
  await flow(browser, 'LinguaDash: tema tersimpan dan ikut ke LinguaDrop', async (page, expect) => {
    await go(page, '/?theme=light')
    await page.locator('.topbar [aria-label="Tema batik"]').click()
    await page.goto(`${APP}/laporan/retensi`)
    await page.waitForSelector('h1')
    expect('batik after navigation', (await page.getAttribute('html', 'data-theme')) === 'batik')
    await page.reload()
    expect('batik after reload', (await page.getAttribute('html', 'data-theme')) === 'batik')
    await page.click('.sidebar a:has-text("Lihat situs LinguaDrop")')
    await page.waitForURL(`${SITE}/?theme=batik`)
    expect('LinguaDrop opens in batik', (await page.getAttribute('html', 'data-theme')) === 'batik')
  })
  await flow(browser, 'LinguaDash: sertifikat siap cetak', async (page, expect) => {
    const routes = results.routes.linguadash.filter((r) => r.endsWith('/sertifikat'))
    await go(page, `${routes[0]}?theme=light`)
    expect('certificate rendered', await page.locator('.certificate .cert-name').isVisible())
    expect('print button', await page.locator('button:has-text("Cetak")').isVisible())
    await page.emulateMedia({ media: 'print' })
    expect('sidebar hidden in print', !(await page.locator('.sidebar').isVisible()))
  })
  await flow(browser, 'LinguaDash: reset data demo', async (page, expect) => {
    await go(page, '/siswa/impor')
    await page.click('button:has-text("Isi dengan contoh data")')
    await page.click('button:has-text("Impor 4 siswa")')
    await page.waitForURL(/\/siswa\?/)
    await go(page, '/pengaturan')
    await page.click('button:has-text("Reset data demo")')
    await page.click('dialog[open] button:has-text("Ya, reset")')
    await go(page, '/siswa?q=Melati%20Kusuma')
    expect('imported student removed', (await page.locator('tbody tr', { hasText: 'Melati Kusuma' }).count()) === 0)
  })
  await flow(browser, 'LinguaDash: menu samping di ponsel', async (page, expect) => {
    await go(page, '/?theme=light')
    expect('sidebar hidden', !(await page.locator('.sidebar').isVisible()))
    await page.click('.menu-btn')
    expect('sidebar opens', await page.locator('.sidebar').isVisible())
    await page.keyboard.press('Escape')
    await page.waitForTimeout(250)
    expect('Escape closes sidebar', !(await page.locator('.sidebar').isVisible()))
  }, VIEWPORTS.mobile)
}

// ---------- Main ----------
;(async () => {
  const browser = await playwright.chromium.launch()
  results.environment.chromium = browser.version()
  results.routes.linguadrop = siteRoutes()
  results.routes.linguadash = await appRoutes(browser)
  console.log(`Routes: LinguaDrop ${results.routes.linguadrop.length}, LinguaDash ${results.routes.linguadash.length}`)

  console.log('Tokens and contrast')
  await checkTokens(browser)
  if (!args.includes('--skip-pages')) {
    console.log('Pages (3 themes × 2 viewports)')
    await checkPages(browser, 'linguadrop', SITE, results.routes.linguadrop)
    await checkPages(browser, 'linguadash', APP, results.routes.linguadash)
  }
  if (!args.includes('--skip-axe')) {
    console.log('axe-core (WCAG 2.x A/AA)')
    await checkAxe(browser, 'linguadrop', SITE, results.routes.linguadrop)
    await checkAxe(browser, 'linguadash', APP, results.routes.linguadash)
  }
  if (!args.includes('--skip-flows')) {
    console.log('Keyboard')
    await keyboardTests(browser)
    console.log('Flows')
    await siteFlows(browser)
    await appFlows(browser)
  }
  await browser.close()

  const byProduct = (p) => results.pages.filter((r) => r.product === p)
  const clean = (rows) => rows.filter((r) => r.status < 400 && !r.consoleErrors.length && r.overflowX <= 0 && r.h1 && r.theme && !r.fontProblems.length && !r.missingLangCount && !r.missingRtlCount && !r.unlabeled.length).length
  results.summary = {
    linguadropPages: results.routes.linguadrop.length,
    linguadashScreens: results.routes.linguadash.length,
    pageLoads: results.pages.length,
    pageLoadsClean: clean(results.pages),
    linguadropLoads: `${clean(byProduct('linguadrop'))}/${byProduct('linguadrop').length}`,
    linguadashLoads: `${clean(byProduct('linguadash'))}/${byProduct('linguadash').length}`,
    consoleErrors: results.pages.reduce((s, r) => s + r.consoleErrors.length, 0),
    horizontalScroll: results.pages.filter((r) => r.overflowX > 0).length,
    axeRuns: results.axe.runs,
    axeViolationNodes: Object.values(results.axe.byRule).reduce((a, b) => a + b, 0),
    axeRulesFailed: Object.keys(results.axe.byRule),
    contrastPairs: `${results.contrast.filter((c) => c.pass).length}/${results.contrast.length}`,
    keyboard: `${results.keyboard.filter((k) => k.pass).length}/${results.keyboard.length}`,
    flows: `${results.flows.filter((f) => f.pass).length}/${results.flows.length}`,
    flowChecks: `${results.flows.reduce((s, f) => s + f.checks.filter((c) => c.ok).length, 0)}/${results.flows.reduce((s, f) => s + f.checks.length, 0)}`,
    tokensIdentical: results.tokens['tokens.css']?.identical && results.tokens['base.css']?.identical,
    problems: results.problems.length,
  }
  const out = path.join(KIT, 'verify-results.json')
  fs.writeFileSync(out, JSON.stringify(results, null, 1))
  console.log('\nSummary', results.summary)
  console.log(`Saved ${out}`)
  process.exit(results.problems.length ? 1 : 0)
})()
