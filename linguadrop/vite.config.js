import { defineConfig, loadEnv } from 'vite'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

const root = /** @type {string} */ (import.meta.dirname)

// Every .html file in the project root is a page. Add a file and it is built automatically.
const pages = readdirSync(root).filter((file) => file.endsWith('.html'))

/*
  Small HTML include plugin (no dependencies):
    <!-- @include header.html -->   inserts src/partials/header.html (partials may include partials)
    __APP_URL__                     becomes VITE_APP_URL (your LinguaDash address, see .env.example)
    __WA__                          becomes VITE_WHATSAPP (WhatsApp number for wa.me links)
    <body data-nav="harga">         adds aria-current="page" to links marked data-nav-link="harga"
*/
/**
 * @param {{ appUrl: string, wa: string }} env
 * @returns {import('vite').Plugin}
 */
function htmlPartials(env) {
  return {
    name: 'lingua-html-partials',
    transformIndexHtml: {
      order: 'pre',
      /** @param {string} html */
      handler(html) {
        const include = /<!--\s*@include\s+([\w.-]+)\s*-->/g
        for (let depth = 0; depth < 5 && html.includes('@include'); depth++) {
          html = html.replace(include, (/** @type {string} */ _, /** @type {string} */ file) => readFileSync(resolve(root, 'src/partials', file), 'utf8'))
        }
        const nav = html.match(/<body[^>]*data-nav="([\w-]+)"/)?.[1]
        if (nav) html = html.replaceAll(`data-nav-link="${nav}"`, `data-nav-link="${nav}" aria-current="page"`)
        return html.replaceAll('__APP_URL__', env.appUrl).replaceAll('__WA__', env.wa)
      },
    },
    handleHotUpdate({ file, server }) {
      if (file.includes('/src/partials/')) server.ws.send({ type: 'full-reload' })
    },
  }
}

/**
 * `vite preview` answers unknown URLs with an empty 404. Serve dist/404.html instead, like Netlify,
 * Vercel and Cloudflare Pages do, so the preview behaves the same as production.
 * @returns {import('vite').Plugin}
 */
function notFoundPage() {
  return {
    name: 'lingua-404-page',
    configurePreviewServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          const file = resolve(root, 'dist/404.html')
          if (req.method !== 'GET' || !existsSync(file)) return next()
          // Let Vite serve real pages ("/" -> index.html, "/harga" -> harga.html); only unknown paths get the 404 page.
          const path = decodeURIComponent((req.url || '/').split('?')[0])
          const page = path.endsWith('/') ? `${path}index.html` : path
          if (existsSync(resolve(root, `dist${page}`)) || existsSync(resolve(root, `dist${page}.html`))) return next()
          res.statusCode = 404
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(readFileSync(file))
        })
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, '')
  const appUrl = (env.VITE_APP_URL || 'http://localhost:5174').replace(/\/+$/, '')
  const wa = (env.VITE_WHATSAPP || '6280000000000').replace(/\D/g, '')

  return {
    // Multi-page site: unknown paths get the 404 page instead of falling back to index.html.
    appType: 'mpa',
    plugins: [htmlPartials({ appUrl, wa }), notFoundPage()],
    server: { port: 5173 },
    preview: { port: 4173 },
    build: {
      rollupOptions: {
        input: Object.fromEntries(pages.map((file) => [file.replace(/\.html$/, ''), resolve(root, file)])),
      },
    },
  }
})
