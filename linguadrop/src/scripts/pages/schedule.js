import { LANGUAGES, langByCode, openClasses } from '../../data/school.js'
import { classRow } from '../classes.js'
import { $ } from '../ui.js'

const form = /** @type {HTMLFormElement} */ ($('[data-schedule-filters]'))
const langSel = /** @type {HTMLSelectElement} */ ($('#f-lang'))
const levelSel = /** @type {HTMLSelectElement} */ ($('#f-level'))
const branchSel = /** @type {HTMLSelectElement} */ ($('#f-branch'))
const modeSel = /** @type {HTMLSelectElement} */ ($('#f-mode'))
const list = $('[data-schedule-list]')
const count = $('[data-schedule-count]')
const all = openClasses().sort((a, b) => a.start.getTime() - b.start.getTime())

function fillLevels() {
  const keep = levelSel.value
  const levels = langSel.value ? langByCode(langSel.value).levels : []
  levelSel.innerHTML = '<option value="">Semua level</option>' + levels.map((l) => `<option value="${l.code}">${l.code} · ${l.name}</option>`).join('')
  levelSel.disabled = !langSel.value
  if (levels.some((l) => l.code === keep)) levelSel.value = keep
}

function render() {
  const f = { lang: langSel.value, level: levelSel.value, branch: branchSel.value, mode: modeSel.value }
  const rows = all.filter((c) =>
    (!f.lang || c.lang === f.lang) &&
    (!f.level || c.level === f.level) &&
    (!f.branch || c.branch === f.branch) &&
    (!f.mode || (f.mode === 'online' ? c.branch === 'online' : c.branch !== 'online')))
  const open = rows.filter((c) => c.seats > 0).length
  count.textContent = rows.length ? `${rows.length} kelas ditemukan, ${open} masih ada kursi` : 'Tidak ada kelas yang cocok'
  list.innerHTML = rows.length
    ? rows.map(classRow).join('')
    : `<div class="empty"><b>Belum ada kelas untuk filter ini.</b><p>Coba ubah filter, atau minta kami membuka kelas baru lewat WhatsApp. Kelas dibuka jika ada minimal 4 peminat.</p><button class="btn" type="button" data-reset>Reset filter</button></div>`
  const params = new URLSearchParams()
  if (f.lang) params.set('bahasa', f.lang)
  if (f.level) params.set('level', f.level)
  if (f.branch) params.set('cabang', f.branch)
  if (f.mode) params.set('mode', f.mode)
  const theme = new URLSearchParams(location.search).get('theme')
  if (theme) params.set('theme', theme)
  history.replaceState(null, '', `${location.pathname}${params.size ? '?' + params : ''}`)
}

// Start from the URL so links like /jadwal.html?bahasa=ja work.
const q = new URLSearchParams(location.search)
if (LANGUAGES.some((l) => l.code === q.get('bahasa'))) langSel.value = q.get('bahasa') || ''
fillLevels()
if (q.get('level')) levelSel.value = q.get('level') || ''
if (q.get('cabang')) branchSel.value = q.get('cabang') || ''
if (q.get('mode')) modeSel.value = q.get('mode') || ''

form.addEventListener('change', (e) => {
  if (e.target === langSel) fillLevels()
  render()
})
form.addEventListener('reset', () => setTimeout(() => { fillLevels(); render() }))
list.addEventListener('click', (e) => {
  if (/** @type {HTMLElement} */ (e.target).closest('[data-reset]')) { form.reset() }
})
render()
