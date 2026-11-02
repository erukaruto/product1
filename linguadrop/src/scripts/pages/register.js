import { LANGUAGES, REGISTRATION_FEE, branchName, langByCode, openClasses } from '../../data/school.js'
import { $, esc, formatDate, formatRupiah, validate } from '../ui.js'

const KEY = 'lingua-registration'
const PROMOS = /** @type {Record<string, { label: string, percent?: number, freeFee?: boolean }>} */ ({
  EARLYBIRD: { label: 'Early bird 10%', percent: 10 },
  ALUMNI10: { label: 'Alumni 10%', percent: 10 },
  SIBLING15: { label: 'Kakak-adik 15%', percent: 15 },
  KAMPUS5: { label: 'Mahasiswa 5%', percent: 5 },
  TRIALJADI: { label: 'Gratis biaya pendaftaran', freeFee: true },
})
const BOOK = 125000

const form = /** @type {HTMLFormElement} */ ($('[data-register-form]'))
const steps = /** @type {HTMLElement[]} */ ([...form.querySelectorAll('[data-step]')])
const stepper = /** @type {HTMLElement[]} */ ([...$('[data-stepper]').children])
const prevBtn = /** @type {HTMLButtonElement} */ ($('[data-prev]'))
const nextBtn = /** @type {HTMLButtonElement} */ ($('[data-next]'))
const errorBox = /** @type {HTMLElement} */ ($('[data-register-error]'))
const langSel = /** @type {HTMLSelectElement} */ ($('#rg-lang'))
const levelSel = /** @type {HTMLSelectElement} */ ($('#rg-level'))
const modeSel = /** @type {HTMLSelectElement} */ ($('#rg-mode'))
const classesBox = $('[data-register-classes]')
const classesNote = $('[data-register-classes-note]')
const all = openClasses()
let current = 0

/** @param {string} name */
const field = (name) => /** @type {HTMLInputElement} */ (form.elements.namedItem(name))

function age() {
  const birth = field('birth').value
  if (!birth) return 99
  const b = new Date(birth)
  const now = new Date()
  return now.getFullYear() - b.getFullYear() - (now < new Date(now.getFullYear(), b.getMonth(), b.getDate()) ? 1 : 0)
}

function fillLevels() {
  const keep = levelSel.value
  const levels = langSel.value ? langByCode(langSel.value).levels : []
  levelSel.innerHTML = `<option value="">${langSel.value ? 'Pilih level' : 'Pilih bahasa dulu'}</option>` + levels.map((l) => `<option value="${l.code}">${l.code} · ${l.name} (${formatRupiah(l.price)})</option>`).join('')
  if (levels.some((l) => l.code === keep)) levelSel.value = keep
}

function fillClasses() {
  const keep = /** @type {HTMLInputElement | null} */ (form.querySelector('input[name="classId"]:checked'))?.value
  const list = all.filter((c) => c.lang === langSel.value && c.level === levelSel.value && c.branch === modeSel.value && c.seats > 0).sort((a, b) => a.start.getTime() - b.start.getTime())
  const options = list.map((c) => `<label class="choice"><input type="radio" name="classId" value="${c.id}" required ${keep === c.id ? 'checked' : ''} /><span>${c.days}<small>${c.time} WIB · mulai ${formatDate(c.start)} · sisa ${c.seats} kursi</small></span></label>`)
  if (langSel.value && levelSel.value) options.push(`<label class="choice"><input type="radio" name="classId" value="request" required ${keep === 'request' ? 'checked' : ''} /><span>Jadwal lain<small>Kami hubungi untuk membuka kelas baru</small></span></label>`)
  classesBox.innerHTML = options.join('')
  classesNote.textContent = !langSel.value || !levelSel.value ? 'Pilih bahasa dan level untuk melihat jadwal.' : list.length ? `${list.length} jadwal tersedia di ${branchName(modeSel.value)}.` : `Belum ada jadwal ${langByCode(langSel.value).name} ${levelSel.value} di ${branchName(modeSel.value)}. Pilih "Jadwal lain" atau ganti tempat.`
}

function totals() {
  const level = langByCode(langSel.value).levels.find((l) => l.code === levelSel.value)
  const course = level?.price ?? 0
  const code = field('promo').value.trim().toUpperCase()
  const promo = PROMOS[code]
  const discount = promo?.percent ? Math.round((course * promo.percent) / 100 / 1000) * 1000 : 0
  const fee = promo?.freeFee ? 0 : REGISTRATION_FEE
  return { level, course, fee, discount, promo, code, total: course + BOOK + fee - discount }
}

function summary() {
  const t = totals()
  const cls = all.find((c) => c.id === /** @type {HTMLInputElement | null} */ (form.querySelector('input[name="classId"]:checked'))?.value)
  const rows = [
    ['Nama', esc(field('name').value)],
    ['Program', `Bahasa ${langByCode(langSel.value).name} ${esc(levelSel.value)} · ${esc(field('program').value)}`],
    ['Tempat', branchName(modeSel.value)],
    ['Jadwal', cls ? `${cls.days}, ${cls.time} WIB (mulai ${formatDate(cls.start)})` : 'Menunggu jadwal baru'],
    [`Kursus (${t.level?.meetings ?? 0} pertemuan)`, formatRupiah(t.course)],
    ['Buku &amp; modul', formatRupiah(BOOK)],
    ['Biaya pendaftaran', t.fee ? formatRupiah(t.fee) : 'Gratis'],
  ]
  if (t.discount) rows.push([`Promo ${esc(t.code)}`, `− ${formatRupiah(t.discount)}`])
  let html = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')
  html += `<div class="total"><dt>Total</dt><dd>${formatRupiah(t.total)}</dd></div>`
  if (t.code && !t.promo) html += '<p class="error">Kode promo tidak dikenal, jadi tidak dipakai.</p>'
  $('[data-register-summary]').innerHTML = html
}

/** @param {number} n */
function go(n) {
  current = n
  steps.forEach((s, i) => (s.hidden = i !== n))
  stepper.forEach((li, i) => {
    if (i === n) li.setAttribute('aria-current', 'step')
    else li.removeAttribute('aria-current')
    li.dataset.state = i < n ? 'done' : ''
  })
  prevBtn.hidden = n === 0
  nextBtn.textContent = n === steps.length - 1 ? 'Kirim pendaftaran' : 'Lanjut'
  errorBox.hidden = true
  if (n === 2) {
    const minor = age() < 17
    $('[data-guardian-note]').textContent = minor ? `Peserta berusia ${age()} tahun, jadi data orang tua/wali wajib diisi.` : 'Opsional untuk peserta berusia 17 tahun ke atas.'
    field('parent').required = minor
    field('parentWa').required = minor
  }
  if (n === 3) summary()
  const heading = /** @type {HTMLElement | null} */ (steps[n].querySelector('h2'))
  if (heading) { heading.tabIndex = -1; heading.focus() }
}

// Prefill from links such as /pendaftaran.html?bahasa=ja&level=N4&kelas=K-120&tempat=online
const q = new URLSearchParams(location.search)
if (LANGUAGES.some((l) => l.code === q.get('bahasa'))) langSel.value = q.get('bahasa') || ''
fillLevels()
if (q.get('level')) levelSel.value = q.get('level') || ''
if (q.get('tempat')) modeSel.value = q.get('tempat') || 'bdg'
fillClasses()
const preset = q.get('kelas')
if (preset) {
  const radio = /** @type {HTMLInputElement | null} */ (form.querySelector(`input[name="classId"][value="${preset}"]`))
  if (radio) radio.checked = true
}

form.addEventListener('change', (e) => {
  const target = e.target
  if (target === langSel) { fillLevels(); fillClasses() }
  if (target === levelSel || target === modeSel) fillClasses()
})
prevBtn.addEventListener('click', () => go(Math.max(0, current - 1)))

form.addEventListener('submit', (e) => {
  e.preventDefault()
  const invalid = validate(steps[current])
  if (invalid) {
    errorBox.textContent = 'Ada isian yang belum lengkap atau belum benar. Periksa kolom yang ditandai.'
    errorBox.hidden = false
    return
  }
  if (current < steps.length - 1) { go(current + 1); return }
  const t = totals()
  const data = Object.fromEntries(new FormData(form))
  const ref = `PN-${new Date().toISOString().slice(2, 4)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Date.now()).slice(-4)}`
  const cls = all.find((c) => c.id === data.classId)
  const record = {
    ref,
    name: data.name, wa: data.wa, email: data.email,
    lang: langByCode(langSel.value).name, level: levelSel.value, program: data.program,
    place: branchName(modeSel.value),
    schedule: cls ? `${cls.days}, ${cls.time} WIB (mulai ${formatDate(cls.start)})` : 'Menunggu jadwal baru',
    course: t.course, book: BOOK, fee: t.fee, discount: t.discount, promo: t.promo ? t.code : '', total: t.total,
    pay: data.pay, created: new Date().toISOString(),
  }
  try { sessionStorage.setItem(KEY, JSON.stringify(record)) } catch { /* ignore */ }
  const theme = new URLSearchParams(location.search).get('theme')
  location.href = `/konfirmasi.html?ref=${ref}${theme ? `&theme=${theme}` : ''}`
})
