import { defineConfig, loadEnv } from 'vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = import.meta.dirname
const pages = ['index', 'pricing', 'about', 'changelog', 'contact', 'blog', 'blog-post', 'help', 'help-article', 'terms', 'privacy', 'features', 'feature-metrics', 'feature-alerts', 'feature-customers', 'integrations', 'integration-detail', 'security', 'compare', 'home-2', 'solutions-founders', 'solutions-finance', 'solutions-success', 'customers', 'customer-story', 'docs', 'status', 'roadmap', 'careers', 'job', 'press', 'demo', 'waitlist', 'maintenance', '500', '404']

/*
  Small HTML include plugin:
    <!-- @include header.html -->   inserts src/partials/header.html
    __APP_URL__                     becomes VITE_APP_URL (see .env.example)
    data-nav="pricing"              on <body> marks the current nav link
*/
function htmlPartials(appUrl) {
  return {
    name: 'saasdrop-html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const include = /<!--\s*@include\s+([\w.-]+)\s*-->/g
        // Partials can include other partials (header includes logo.html), so repeat a few times.
        for (let depth = 0; depth < 5 && html.includes('@include'); depth++) {
          html = html.replace(include, (_, file) =>
            readFileSync(resolve(root, 'src/partials', file), 'utf8')
          )
        }
        return html.replaceAll('__APP_URL__', appUrl)
      },
    },
    handleHotUpdate({ file, server }) {
      if (file.includes('/src/partials/')) server.ws.send({ type: 'full-reload' })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, '')
  const appUrl = (env.VITE_APP_URL || 'http://localhost:5174').replace(/\/+$/, '')

  return {
    // Multi-page site: unknown paths get a 404 instead of falling back to index.html.
    appType: 'mpa',
    plugins: [htmlPartials(appUrl)],
    server: { port: 5173 },
    preview: { port: 4173 },
    build: {
      rollupOptions: {
        input: Object.fromEntries(pages.map((p) => [p, resolve(root, `${p}.html`)])),
      },
    },
  }
})
