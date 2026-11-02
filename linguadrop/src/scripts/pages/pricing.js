import { initTabs } from '../tabs.js'
import { $, formatRupiah } from '../ui.js'
import { PRIVATE_RATES } from '../../data/school.js'

initTabs()

const teacher = /** @type {HTMLSelectElement} */ ($('#calc-teacher'))
const mode = /** @type {HTMLSelectElement} */ ($('#calc-mode'))
const hours = /** @type {HTMLSelectElement} */ ($('#calc-hours'))
const people = /** @type {HTMLSelectElement} */ ($('#calc-people'))
const total = $('[data-calc-total]')

function update() {
  const rate = PRIVATE_RATES.find((r) => r.teacher.toLowerCase().includes(teacher.value) && (mode.value === 'online' ? r.mode === 'Online' : r.mode !== 'Online'))
  const h = Number(hours.value)
  let sum = (rate?.price ?? 0) * h
  if (h >= 20) sum = Math.round((sum * 0.85) / 1000) * 1000
  if (people.value === '2') sum = Math.round((sum * 1.3) / 1000) * 1000
  total.textContent = `${formatRupiah(sum)} untuk ${h} jam`
}
;[teacher, mode, hours, people].forEach((el) => el.addEventListener('change', update))
update()
