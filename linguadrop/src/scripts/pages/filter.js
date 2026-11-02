// Filter buttons for the testimonial and blog grids: [data-filter-group] buttons, [data-filter-list] items with data-lang.
import { $ } from '../ui.js'

const group = $('[data-filter-group]')
const items = /** @type {HTMLElement[]} */ ([...$('[data-filter-list]').children])
const count = document.querySelector('[data-filter-count]')
const noun = count?.textContent?.includes('artikel') ? 'artikel' : 'testimoni'

group.addEventListener('click', (event) => {
  const button = /** @type {HTMLElement} */ (event.target).closest('button[data-filter]')
  if (!button) return
  const value = button.getAttribute('data-filter')
  group.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === button)))
  let shown = 0
  for (const item of items) {
    const match = value === 'all' || item.dataset.lang === value
    item.hidden = !match
    if (match) shown++
  }
  if (count) count.textContent = `Menampilkan ${shown} ${noun}`
})
