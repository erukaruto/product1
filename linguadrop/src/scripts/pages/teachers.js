import { LANGUAGES, TEACHERS, langByCode } from '../../data/school.js'
import { $, esc, initials } from '../ui.js'

const form = /** @type {HTMLFormElement} */ ($('[data-teacher-filters]'))
const lang = /** @type {HTMLSelectElement} */ ($('#t-lang'))
const type = /** @type {HTMLSelectElement} */ ($('#t-type'))
const query = /** @type {HTMLInputElement} */ ($('#t-q'))
const list = $('[data-teacher-list]')
const count = $('[data-teacher-count]')

/** @param {import('../../data/school.js').Teacher} t */
const card = (t) => `<a class="card card-link teacher-card lang-${t.lang}" href="/profil-pengajar.html?id=${t.id}">
  <span class="avatar avatar-lg">${initials(t.name)}</span>
  <h3>${esc(t.name)}</h3>
  <span class="meta">${t.type === 'native' ? '<span class="badge badge-accent">Native</span>' : '<span class="badge">Lokal</span>'}<span class="badge">${langByCode(t.lang).name}</span></span>
  <p>${esc(t.focus)}. ${t.years} tahun mengajar.</p>
</a>`

function render() {
  const q = query.value.trim().toLowerCase()
  const rows = TEACHERS.filter((t) => (!lang.value || t.lang === lang.value) && (!type.value || t.type === type.value) && (!q || t.name.toLowerCase().includes(q)))
  list.innerHTML = rows.length ? rows.map(card).join('') : '<div class="empty" style="grid-column:1/-1"><b>Tidak ada pengajar yang cocok.</b><p>Ubah filter atau kata kunci.</p></div>'
  count.textContent = `Menampilkan ${rows.length} pengajar`
}

const fromUrl = new URLSearchParams(location.search).get('bahasa')
if (LANGUAGES.some((l) => l.code === fromUrl)) lang.value = fromUrl || ''
form.addEventListener('input', render)
form.addEventListener('reset', () => setTimeout(render))
form.addEventListener('submit', (e) => e.preventDefault())
render()
