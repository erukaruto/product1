// Small helpers shared by the interactive pages.

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
/** Rp 1.250.000 (non-breaking space after Rp) @param {number} value */
export const formatRupiah = (value) => rupiah.format(value).replace(/\s/, ' ')

const longDate = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const shortDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
/** Senin, 2 November 2026 @param {Date} date */
export const formatDateLong = (date) => longDate.format(date)
/** 2 Nov 2026 @param {Date} date */
export const formatDate = (date) => shortDate.format(date)

/**
 * @template {Element} T
 * @param {string} selector
 * @param {ParentNode} [root]
 * @returns {T}
 */
export function $(selector, root = document) {
  const el = root.querySelector(selector)
  if (!el) throw new Error(`Missing element: ${selector}`)
  return /** @type {T} */ (el)
}

/** Escape text before putting it in innerHTML. @param {unknown} value */
export function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] || c)
}

/** Initials for avatars. @param {string} name */
export const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()

/** Indonesian validation messages (the browser's own text follows the visitor's OS language).
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} control */
export function messageFor(control) {
  const v = control.validity
  if (control.dataset.msg && !v.valueMissing) return control.dataset.msg
  if (v.valueMissing) return control.type === 'radio' || control instanceof HTMLSelectElement ? 'Silakan pilih salah satu.' : control.type === 'checkbox' ? 'Centang untuk melanjutkan.' : 'Wajib diisi.'
  if (v.typeMismatch && control.type === 'email') return 'Format email belum benar, contoh: nama@email.com.'
  if (v.tooShort) return `Minimal ${'minLength' in control ? control.minLength : ''} karakter.`
  if (v.patternMismatch) return 'Format belum sesuai.'
  if (v.rangeUnderflow || v.rangeOverflow) return `Isi angka antara ${control.getAttribute('min')} dan ${control.getAttribute('max')}.`
  return 'Periksa kembali isian ini.'
}

/**
 * Marks invalid fields with aria-invalid and a message under the field.
 * Returns the first invalid control, or null when the form is valid.
 * @param {HTMLFormElement | HTMLElement} scope
 * @returns {HTMLElement | null}
 */
export function validate(scope) {
  /** @type {HTMLElement | null} */
  let first = null
  const controls = /** @type {NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} */ (scope.querySelectorAll('input, select, textarea'))
  const radioGroups = new Set()
  for (const control of controls) {
    if (control.disabled || control.type === 'hidden') continue
    if (control.type === 'radio') {
      if (radioGroups.has(control.name)) continue
      radioGroups.add(control.name)
    }
    const field = control.closest('.field, fieldset')
    const valid = control.checkValidity()
    if (control.type !== 'radio') control.setAttribute('aria-invalid', String(!valid))
    let message = field?.querySelector(':scope > .error')
    if (!valid) {
      if (field && !message) {
        message = document.createElement('p')
        message.className = 'error'
        message.id = `${control.name || control.id}-error`
        field.append(message)
      }
      if (message) {
        message.textContent = messageFor(control)
        if (control.type !== 'radio') control.setAttribute('aria-describedby', message.id)
      }
      first ??= control
    } else {
      message?.remove()
    }
  }
  if (first) first.focus()
  return first
}
