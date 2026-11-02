// Demo forms (contact, job application): validate, then show the success message. Nothing is sent.
import { validate } from '../ui.js'

document.querySelectorAll('form[data-demo-form]').forEach((node) => {
  const form = /** @type {HTMLFormElement} */ (node)
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    if (validate(form)) return
    const success = /** @type {HTMLElement | null} */ (form.querySelector('[data-success]'))
    form.querySelectorAll('input, select, textarea, button').forEach((el) => el.setAttribute('disabled', ''))
    if (success) {
      success.hidden = false
      success.setAttribute('tabindex', '-1')
      success.focus()
    }
  })
})
