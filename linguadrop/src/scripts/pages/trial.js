import { LANGUAGES, branchName, langByCode, seeded } from '../../data/school.js'
import { $, esc, formatDateLong, validate } from '../ui.js'

const form = /** @type {HTMLFormElement} */ ($('[data-trial-form]'))
const langSel = /** @type {HTMLSelectElement} */ ($('#tr-lang'))
const modeSel = /** @type {HTMLSelectElement} */ ($('#tr-mode'))
const daysBox = $('[data-days]')
const slotsBox = $('[data-slots]')
const success = /** @type {HTMLElement} */ ($('[data-trial-success]'))
const SLOTS = ['09.00', '10.30', '13.00', '15.30', '18.30', '19.30']

// Next 8 days except Sunday (branches are closed).
const days = []
for (let i = 1; days.length < 8 && i < 14; i++) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + i)
  if (d.getDay() !== 0) days.push(d)
}
const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'short' })
const dayNum = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' })
daysBox.innerHTML = days.map((d, i) => `<label class="choice"><input type="radio" name="date" value="${d.toISOString()}" ${i === 0 ? 'checked' : ''} required /><span>${dayName.format(d)}<small>${dayNum.format(d)}</small></span></label>`).join('')

/** Same date + place + language always gives the same full slots (demo availability). */
function renderSlots() {
  const date = /** @type {HTMLInputElement | null} */ (form.querySelector('input[name="date"]:checked'))?.value || ''
  const keep = /** @type {HTMLInputElement | null} */ (form.querySelector('input[name="slot"]:checked'))?.value
  const seed = [...`${date}${modeSel.value}${langSel.value}`].reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7)
  const rand = seeded(seed)
  const saturday = new Date(date).getDay() === 6
  slotsBox.innerHTML = SLOTS.map((slot) => {
    const closed = (saturday && slot >= '15.30') || rand() < 0.28
    return `<label class="choice"><input type="radio" name="slot" value="${slot}" required ${closed ? 'disabled' : ''} ${keep === slot && !closed ? 'checked' : ''} /><span>${slot}<small>${closed ? 'Penuh' : '60 menit'}</small></span></label>`
  }).join('')
}

const fromUrl = new URLSearchParams(location.search).get('bahasa')
if (LANGUAGES.some((l) => l.code === fromUrl)) langSel.value = fromUrl || ''
renderSlots()
form.addEventListener('change', (e) => {
  const target = /** @type {HTMLElement} */ (e.target)
  if (target.getAttribute('name') === 'date' || target === langSel || target === modeSel) renderSlots()
})

form.addEventListener('submit', (e) => {
  e.preventDefault()
  if (validate(form)) return
  const data = new FormData(form)
  const lang = langByCode(String(data.get('lang')))
  const date = new Date(String(data.get('date')))
  const code = `TR-${String(Date.now()).slice(-5)}`
  const wa = encodeURIComponent(`Halo, saya ${data.get('name')} sudah booking trial ${code}: Bahasa ${lang.name}, ${formatDateLong(date)} pukul ${data.get('slot')} WIB, ${branchName(String(data.get('mode')))}.`)
  form.hidden = true
  success.hidden = false
  success.innerHTML = `
    <span class="badge badge-good">Booking diterima</span>
    <h2 style="font-size:var(--text-xl)">Sampai jumpa di kelas trial, ${esc(data.get('name'))}!</h2>
    <dl class="summary-list">
      <div><dt>Kode booking</dt><dd class="mono">${code}</dd></div>
      <div><dt>Bahasa</dt><dd>Bahasa ${lang.name}</dd></div>
      <div><dt>Tanggal</dt><dd>${formatDateLong(date)}</dd></div>
      <div><dt>Jam</dt><dd>${esc(data.get('slot'))} WIB (60 menit)</dd></div>
      <div><dt>Tempat</dt><dd>${branchName(String(data.get('mode')))}</dd></div>
    </dl>
    <p class="muted">Kami kirim konfirmasi ke WhatsApp ${esc(data.get('wa'))} dalam 1 jam kerja. (Demo: tidak ada pesan yang dikirim.)</p>
    <div class="row"><a class="btn btn-wa" href="https://wa.me/${String(import.meta.env.VITE_WHATSAPP || '6280000000000').replace(/\D/g, '')}?text=${wa}" rel="noopener" target="_blank">Kirim ke WhatsApp admin</a><a class="btn" href="/tes-penempatan.html">Sambil menunggu, tes level</a></div>`
  success.focus()
})
