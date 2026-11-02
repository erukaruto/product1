// Shared behaviour for every LinguaDrop page: fonts, styles, theme, navigation.
import '@fontsource-variable/plus-jakarta-sans'
import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/site.css'

import { watchScriptFonts } from './script-fonts.js'

watchScriptFonts()

const THEMES = ['light', 'dark', 'batik']
const THEME_COLORS = { light: '#3b3fc4', dark: '#0f1117', batik: '#8e3210' }

/** @returns {string} */
export function currentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light'
}

/** @param {string} theme */
function applyTheme(theme) {
  if (!THEMES.includes(theme)) return
  document.documentElement.setAttribute('data-theme', theme)
  try { localStorage.setItem('lingua-theme', theme) } catch { /* private mode */ }
  document.querySelectorAll('[data-theme-set]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.getAttribute('data-theme-set') === theme))
  })
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[/** @type {'light'} */ (theme)])
}

applyTheme(currentTheme())
document.addEventListener('click', (event) => {
  const target = /** @type {HTMLElement} */ (event.target)
  const button = target.closest('[data-theme-set]')
  if (button) applyTheme(button.getAttribute('data-theme-set') || 'light')

  // LinguaDash lives on another origin, so pass the theme along in the URL.
  const appLink = /** @type {HTMLAnchorElement | null} */ (target.closest('a[data-app-link]'))
  if (appLink) {
    const url = new URL(appLink.href)
    url.searchParams.set('theme', currentTheme())
    appLink.href = url.toString()
  }
})

// Mobile navigation
const header = document.querySelector('.site-header')
const toggle = /** @type {HTMLButtonElement | null} */ (document.querySelector('.nav-toggle'))
/** @param {boolean} open */
function setMenu(open) {
  header?.classList.toggle('is-open', open)
  toggle?.setAttribute('aria-expanded', String(open))
  const label = toggle?.querySelector('.sr-only')
  if (label) label.textContent = open ? 'Tutup menu' : 'Buka menu'
}
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'))

// Dropdowns: one open at a time, close on outside click and on Escape.
const menus = /** @type {HTMLDetailsElement[]} */ ([...document.querySelectorAll('.nav-menu')])
menus.forEach((menu) => {
  menu.addEventListener('toggle', () => {
    if (menu.open) menus.forEach((other) => other !== menu && (other.open = false))
  })
  if (menu.querySelector('[aria-current="page"]')) menu.querySelector('summary')?.classList.add('is-current')
})
document.addEventListener('click', (event) => {
  const target = /** @type {HTMLElement} */ (event.target)
  if (!target.closest('.nav-menu')) menus.forEach((menu) => (menu.open = false))
})
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return
  const open = menus.find((menu) => menu.open)
  if (open) {
    open.open = false
    open.querySelector('summary')?.focus()
  } else if (header?.classList.contains('is-open')) {
    setMenu(false)
    toggle?.focus()
  }
})
window.matchMedia('(min-width: 1101px)').addEventListener('change', (e) => e.matches && setMenu(false))

document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = String(new Date().getFullYear())))
