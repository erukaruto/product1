import { $, esc, formatDateLong, formatRupiah } from '../ui.js'

/** @typedef {{ ref: string, name: string, wa: string, lang: string, level: string, program: string, place: string, schedule: string, course: number, book: number, fee: number, discount: number, promo: string, total: number, pay: string, created: string }} Registration */

/** @type {Registration | null} */
let reg = null
try { reg = JSON.parse(sessionStorage.getItem('lingua-registration') || 'null') } catch { reg = null }
const sample = !reg
/** @type {Registration} */
const r = reg || { ref: 'PN-2611-0428', name: 'Aulia Pratama', wa: '0812 0000 0000', lang: 'Jepang', level: 'N5', program: 'General', place: 'Online (Zoom)', schedule: 'Selasa & Kamis, 19.30–21.00 WIB', course: 2250000, book: 125000, fee: 150000, discount: 225000, promo: 'EARLYBIRD', total: 2300000, pay: 'va', created: new Date().toISOString() }

if (sample) /** @type {HTMLElement} */ ($('[data-confirm-sample]')).hidden = false
$('[data-confirm-title]').textContent = `Terima kasih, ${r.name.split(' ')[0]}! Pendaftaran Anda tercatat`
$('[data-confirm-ref]').textContent = r.ref
const deadline = new Date(new Date(r.created).getTime() + 2 * 864e5)
$('[data-confirm-summary]').innerHTML = [
  ['Nama', esc(r.name)],
  ['Program', `Bahasa ${esc(r.lang)} ${esc(r.level)} · ${esc(r.program)}`],
  ['Tempat', esc(r.place)],
  ['Jadwal', esc(r.schedule)],
  ['Kursus', formatRupiah(r.course)],
  ['Buku &amp; modul', formatRupiah(r.book)],
  ['Biaya pendaftaran', r.fee ? formatRupiah(r.fee) : 'Gratis'],
  ...(r.discount ? [[`Promo ${esc(r.promo)}`, `− ${formatRupiah(r.discount)}`]] : []),
].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('') + `<div class="total"><dt>Total dibayar</dt><dd>${formatRupiah(r.total)}</dd></div><div><dt>Batas pembayaran</dt><dd>${formatDateLong(deadline)}</dd></div>`

const va = `8808 0000 ${r.ref.replace(/\D/g, '').slice(0, 4)} ${r.ref.replace(/\D/g, '').slice(-4)}`
const PAY = /** @type {Record<string, string>} */ ({
  va: `<p>Bayar ke <b>virtual account</b> berikut (contoh, tidak aktif):</p><p class="price mono">${va}</p><ol class="stack-sm" style="padding-left:1.2em"><li>Buka m-banking atau ATM, pilih Transfer, Virtual Account.</li><li>Masukkan nomor di atas. Nama penerima: Polyglot Nusantara.</li><li>Pastikan nominal <b>${formatRupiah(r.total)}</b>, lalu bayar.</li></ol>`,
  qris: `<p>Pindai kode QRIS di bawah dengan e-wallet atau m-banking. <b>Contoh gambar, bukan QR sungguhan.</b></p><svg viewBox="0 0 21 21" width="168" height="168" role="img" aria-label="Contoh gambar kode QR (tidak aktif)" style="background:#fff;padding:8px;border-radius:8px">${qrPattern(r.ref)}</svg><p>Nominal: <b>${formatRupiah(r.total)}</b></p>`,
  transfer: `<p>Transfer ke rekening contoh <b>Bank XYZ 000-000-0000</b> a.n. Polyglot Nusantara, nominal <b>${formatRupiah(r.total)}</b>. Tulis <b>${esc(r.ref)}</b> di berita transfer, lalu kirim bukti ke WhatsApp admin.</p>`,
  tunai: `<p>Bayar tunai <b>${formatRupiah(r.total)}</b> di cabang sebelum ${formatDateLong(deadline)}. Sebutkan nomor pendaftaran <b>${esc(r.ref)}</b> dan simpan kuitansinya.</p>`,
})
$('[data-confirm-pay]').innerHTML = PAY[r.pay] || PAY.va
const wa = /** @type {HTMLAnchorElement} */ ($('[data-confirm-wa]'))
wa.href = wa.href.replace(/text=[^&]*/, `text=${encodeURIComponent(`Halo, saya ${r.name} sudah mendaftar dengan nomor ${r.ref}.`)}`)

/** Decorative QR-like pattern from the reference number (not a real QR code). @param {string} seed */
function qrPattern(seed) {
  let h = [...seed].reduce((s, c) => (s * 33 + c.charCodeAt(0)) >>> 0, 5381)
  let out = ''
  const finder = /** @param {number} x @param {number} y */ (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#000"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#000"/>`
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      const inFinder = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)
      h = (h * 1103515245 + 12345) >>> 0
      if (!inFinder && (h >>> 16) % 2) out += `<rect x="${x}" y="${y}" width="1" height="1" fill="#000"/>`
    }
  }
  return out + finder(0, 0) + finder(14, 0) + finder(0, 14)
}
