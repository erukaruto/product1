import { TEACHERS, branchName, langByCode, openClasses } from '../../data/school.js'
import { classRow } from '../classes.js'
import { $, esc, initials } from '../ui.js'

const HTML_LANG = /** @type {Record<string, string>} */ ({ en: 'en', ja: 'ja', ko: 'ko', zh: 'zh-Hans', ar: 'ar', de: 'de' })
const id = new URLSearchParams(location.search).get('id')
const t = TEACHERS.find((x) => x.id === id) || TEACHERS.find((x) => x.id === 'haruka-tanaka') || TEACHERS[0]
const lang = langByCode(t.lang)
const native = t.type === 'native'
const first = t.name.split(' ')[0]

/** @param {string} sel @param {string} text */
const set = (sel, text) => { $(sel).textContent = text }
document.title = `${t.name}, Pengajar Bahasa ${lang.name} · Polyglot Nusantara`
set('[data-p-crumb]', t.name)
set('[data-p-name]', t.name)
set('[data-p-avatar]', initials(t.name))
set('[data-p-eyebrow]', `Pengajar Bahasa ${lang.name} · ${native ? 'Native' : 'Lokal'}`)
set('[data-p-focus]', t.focus)
set('[data-p-cert]', t.cert)
set('[data-p-origin]', t.origin)
set('[data-p-branch]', branchName(t.branch))
set('[data-p-first]', first)
set('[data-p-medium]', native ? `Bahasa ${lang.name} dan Inggris, sedikit bahasa Indonesia` : `Bahasa Indonesia dan Bahasa ${lang.name}`)
$('[data-p-head]').className = `profile-head lang-${t.lang}`
$('[data-p-badges]').innerHTML = [`${t.years} tahun mengajar`, `★ ${t.rating.toFixed(1).replace('.', ',')}`, `${t.students.toLocaleString('id-ID')} siswa diajar`].map((b) => `<span class="badge badge-outline">${b}</span>`).join('')
set('[data-p-bio]', `${t.name} berasal dari ${t.origin} dan sudah ${t.years} tahun mengajar. Fokus mengajar: ${t.focus.toLowerCase()}. ${native ? `Sebagai penutur asli, ${first} melatih pelafalan, intonasi, dan ungkapan yang dipakai sehari-hari.` : `Sebagai pengajar lokal, ${first} menjelaskan tata bahasa dengan perbandingan ke bahasa Indonesia sehingga lebih cepat dipahami.`}`)
$('[data-p-quote]').innerHTML = t.quoteNative
  ? `<span lang="${HTML_LANG[t.lang]}"${t.lang === 'ar' ? ' dir="rtl"' : ''}>${esc(t.quoteNative)}</span> ${esc(t.quote)}`
  : esc(t.quote)
;/** @type {HTMLAnchorElement} */ ($('[data-p-trial]')).href = `/trial.html?bahasa=${t.lang}`

const classes = openClasses().filter((c) => c.teacher.id === t.id).sort((a, b) => a.start.getTime() - b.start.getTime())
$('[data-p-classes]').innerHTML = classes.length
  ? classes.map(classRow).join('')
  : `<p class="muted">Belum ada kelas grup baru untuk ${esc(t.name)}. Tersedia untuk privat 1-on-1.</p>`

if (id && id !== t.id) {
  const note = document.createElement('p')
  note.className = 'notice notice-warn'
  note.textContent = 'Pengajar yang Anda cari tidak ditemukan. Menampilkan salah satu pengajar kami.'
  $('[data-p-head]').before(note)
}
