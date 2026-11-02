import { PLACEMENT_QUESTIONS as QUESTIONS, levelFromScore } from '../../data/placement.js'
import { langByCode } from '../../data/school.js'
import { $, esc, formatRupiah } from '../ui.js'

const DESCRIPTIONS = /** @type {Record<string, string>} */ ({
  A1: 'Beginner: memperkenalkan diri dan memahami kalimat sehari-hari yang sederhana.',
  A2: 'Elementary: bercerita tentang rutinitas, belanja, dan arah jalan.',
  B1: 'Intermediate: menangani situasi saat bepergian dan menulis teks pendek yang runtut.',
  B2: 'Upper Intermediate: berdiskusi dengan lancar dan memahami ide utama teks kompleks.',
  C1: 'Advanced: presentasi, negosiasi, dan esai akademik terstruktur.',
  C2: 'Proficiency: memahami hampir semua yang didengar dan dibaca, termasuk nuansanya.',
})

/** @type {{ name?: string, answers?: (number | null)[] } | null} */
let saved = null
try { saved = JSON.parse(sessionStorage.getItem('lingua-placement') || 'null') } catch { saved = null }
const valid = Array.isArray(saved?.answers) && saved?.answers?.length === QUESTIONS.length
const answers = valid && saved?.answers ? saved.answers : [0, 0, 1, 2, 0, 1, 1, 0, 0, 1, 1, 2, 0, 1, 2]
const name = valid ? saved?.name || '' : ''

const correct = answers.filter((a, i) => a === QUESTIONS[i].answer).length
const level = levelFromScore(correct)
const levelData = langByCode('en').levels.find((l) => l.code === level)

if (!valid) /** @type {HTMLElement} */ ($('[data-result-sample]')).hidden = false
$('[data-result-title]').textContent = name ? `Hasil tes ${name}: level ${level}` : `Hasil tes: level ${level}`
$('[data-result-level]').textContent = level
$('[data-result-desc]').textContent = DESCRIPTIONS[level]
$('[data-result-score]').textContent = String(correct)
$('[data-result-scale]').innerHTML = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => `<span${l === level ? ' aria-current="true"' : ''}>${l}</span>`).join('')

$('[data-result-sections]').innerHTML = ['Grammar', 'Vocabulary', 'Reading'].map((s) => {
  const items = QUESTIONS.map((q, i) => ({ q, i })).filter((x) => x.q.section === s)
  const ok = items.filter((x) => answers[x.i] === x.q.answer).length
  return `<div class="hbar"><span>${s}</span><span class="hbar-track"><span style="width:${(ok / items.length) * 100}%"></span></span><b>${ok}/${items.length}</b></div>`
}).join('')

if (levelData) {
  $('[data-result-reco]').textContent = `Kelas General English ${level} (${levelData.name}), ${levelData.weeks} minggu, ${levelData.meetings} pertemuan, ${formatRupiah(levelData.price)}.${level === 'B2' || level === 'C1' ? ' Level Anda juga siap untuk kelas persiapan IELTS atau TOEFL.' : ''}`
}
;/** @type {HTMLAnchorElement} */ ($('[data-result-register]')).href = `/pendaftaran.html?bahasa=en&level=${level}`
;/** @type {HTMLAnchorElement} */ ($('[data-result-schedule]')).href = `/jadwal.html?bahasa=en&level=${level}`

$('[data-result-answers]').innerHTML = QUESTIONS.map((q, i) => {
  const a = answers[i]
  const right = a === q.answer
  return `<li><span lang="en">${esc(q.prompt)}</span><br /><span class="badge ${right ? 'badge-good' : 'badge-bad'}">${right ? 'Benar' : 'Salah'}</span> <span class="muted small">Jawaban Anda: <span lang="en">${a === null || a === undefined ? '–' : esc(q.options[a])}</span>${right ? '' : ` · Kunci: <span lang="en">${esc(q.options[q.answer])}</span>`}</span></li>`
}).join('')
