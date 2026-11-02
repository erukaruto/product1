import { PLACEMENT_QUESTIONS as QUESTIONS } from '../../data/placement.js'
import { $, esc } from '../ui.js'

const KEY = 'lingua-placement'
const intro = /** @type {HTMLElement} */ ($('[data-quiz-intro]'))
const form = /** @type {HTMLFormElement} */ ($('[data-quiz-form]'))
const box = $('[data-quiz-question]')
const countEl = $('[data-quiz-count]')
const sectionEl = $('[data-quiz-section]')
const bar = /** @type {HTMLElement} */ ($('[data-quiz-bar]'))
const progress = $('.quiz-progress')
const error = /** @type {HTMLElement} */ ($('[data-quiz-error]'))
const prev = /** @type {HTMLButtonElement} */ ($('[data-quiz-prev]'))
const next = /** @type {HTMLButtonElement} */ ($('[data-quiz-next]'))
const nameInput = /** @type {HTMLInputElement} */ ($('#quiz-name'))

/** @type {(number | null)[]} */
const answers = QUESTIONS.map(() => null)
let index = 0

const focusQuestion = () => /** @type {HTMLElement | null} */ (box.querySelector('legend'))?.focus()

function show() {
  const q = QUESTIONS[index]
  countEl.textContent = `Soal ${index + 1} dari ${QUESTIONS.length}`
  sectionEl.textContent = q.section
  bar.style.width = `${(index / QUESTIONS.length) * 100}%`
  progress.setAttribute('aria-valuenow', String(index + 1))
  const passage = q.text ? `<blockquote class="card card-flat" lang="en">${esc(q.text)}</blockquote>` : ''
  box.innerHTML = `<legend class="quiz-q" tabindex="-1"><span class="sr-only">Soal ${index + 1}. </span><span lang="en">${esc(q.prompt)}</span></legend>
    ${passage}
    <div class="quiz-options">${q.options.map((o, i) => `<label class="choice"><input type="radio" name="answer" value="${i}" ${answers[index] === i ? 'checked' : ''} /><span lang="en">${String.fromCharCode(65 + i)}. ${esc(o)}</span></label>`).join('')}</div>`
  prev.disabled = index === 0
  next.textContent = index === QUESTIONS.length - 1 ? 'Lihat hasil' : 'Berikutnya'
  error.hidden = true
}

$('[data-quiz-start]').addEventListener('click', () => {
  intro.hidden = true
  form.hidden = false
  show()
  focusQuestion()
})

prev.addEventListener('click', () => {
  if (index === 0) return
  const picked = /** @type {HTMLInputElement | null} */ (form.querySelector('input[name="answer"]:checked'))
  if (picked) answers[index] = Number(picked.value)
  index--
  show()
  focusQuestion()
})

form.addEventListener('submit', (e) => {
  e.preventDefault()
  const picked = /** @type {HTMLInputElement | null} */ (form.querySelector('input[name="answer"]:checked'))
  if (!picked) {
    error.hidden = false
    ;/** @type {HTMLElement | null} */ (form.querySelector('input[name="answer"]'))?.focus()
    return
  }
  answers[index] = Number(picked.value)
  if (index < QUESTIONS.length - 1) {
    index++
    show()
    focusQuestion()
    return
  }
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ name: nameInput.value.trim(), answers, date: new Date().toISOString() }))
  } catch { /* storage blocked: the result page falls back to a sample */ }
  const theme = new URLSearchParams(location.search).get('theme')
  location.href = `/hasil-tes.html${theme ? `?theme=${theme}` : ''}`
})
