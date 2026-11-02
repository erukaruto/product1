/*
  Tests "Option B" from the bundle README: landing page at /, app at /app/, on one origin.
  1. Builds SaaSDrop with VITE_APP_URL=<origin>/app and DashDrop with base /app/ into one folder.
  2. Serves it with a tiny static server that has the two rules a real host needs:
     /app/* falls back to /app/index.html, unknown paths get 404.html with status 404.
  3. Checks links, deep links, the 404 page and that the theme carries from site to app.
  Run from the repo root: node bundle-kit/scripts/test-same-domain.cjs
*/
const { execSync } = require('node:child_process')
const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const { chromium } = require('playwright')

const ROOT = path.join(__dirname, '..', '..')
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'beacon-same-domain-'))
const PORT = 4176
const ORIGIN = `http://localhost:${PORT}`

execSync(`npx vite build --outDir ${OUT} --emptyOutDir`, { cwd: path.join(ROOT, 'saasdrop'), env: { ...process.env, VITE_APP_URL: `${ORIGIN}/app` }, stdio: 'ignore' })
execSync(`npx vite build --base /app/ --outDir ${path.join(OUT, 'app')} --emptyOutDir`, { cwd: path.join(ROOT, 'dashdrop'), env: { ...process.env, VITE_SITE_URL: ORIGIN }, stdio: 'ignore' })

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain' }
const send = (res, file, status = 200) => {
  res.writeHead(status, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
}
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, ORIGIN).pathname)
  const file = path.join(OUT, url)
  if (fs.existsSync(file) && fs.statSync(file).isFile()) return send(res, file)
  if (fs.existsSync(path.join(file, 'index.html'))) return send(res, path.join(file, 'index.html'))
  if (fs.existsSync(file + '.html')) return send(res, file + '.html')
  if (url.startsWith('/app/') || url === '/app') return send(res, path.join(OUT, 'app', 'index.html')) // SPA fallback
  return send(res, path.join(OUT, '404.html'), 404)
})

server.listen(PORT, async () => {
  const results = []
  const check = (name, pass, detail = '') => { results.push({ name, pass }); console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ' (' + detail + ')' : ''}`) }
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && !m.text().includes('404') && errors.push(m.text()))

  await page.goto(`${ORIGIN}/?theme=sand`)
  await page.locator('.header-actions a', { hasText: 'Sign in' }).click()
  await page.waitForURL(`${ORIGIN}/app/login`)
  await page.locator('h1', { hasText: 'Sign in to Beacon' }).waitFor()
  check('Sign in opens /app/login on the same origin', true, page.url())
  check('Theme chosen on the landing page carries into the app', (await page.getAttribute('html', 'data-theme')) === 'sand')
  await page.locator('button[type=submit]').click()
  await page.waitForURL(`${ORIGIN}/app/`)
  await page.locator('h1', { hasText: 'Overview' }).waitFor()
  check('Login submit opens /app/', true)
  const deep = await page.goto(`${ORIGIN}/app/customers/cus_1003`)
  await page.locator('h1', { hasText: 'Lumen Works' }).waitFor()
  check('Deep link /app/customers/cus_1003 loads with the fallback rule', deep.status() === 200)
  const missing = await page.goto(`${ORIGIN}/no-such-page`)
  check('Unknown path shows SaaSDrop 404.html with status 404', missing.status() === 404 && (await page.locator('h1').textContent()) === 'Page not found')
  await page.goto(`${ORIGIN}/app/`)
  await page.locator('a', { hasText: 'Sign out' }).click()
  await page.locator('a', { hasText: 'Back to site' }).click()
  await page.waitForURL(`${ORIGIN}/`)
  check('Back to site returns to the landing page', true)
  check('No console errors', errors.length === 0, errors.join(' | '))

  await browser.close()
  server.close()
  fs.rmSync(OUT, { recursive: true, force: true })
  console.log(`${results.filter((r) => r.pass).length}/${results.length} passed`)
})
