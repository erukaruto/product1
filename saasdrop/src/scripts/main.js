import '@fontsource-variable/dm-sans'
import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/sections.css'

const THEME_KEY = 'beacon-theme'
const THEMES = ['light', 'dark', 'sand']

/* Theme switch. The initial theme is set by the inline script in src/partials/head.html. */
function setTheme(theme) {
  if (!THEMES.includes(theme)) return
  document.documentElement.setAttribute('data-theme', theme)
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* storage can be blocked; the theme still applies for this page */
  }
  syncThemeButtons()
}

function syncThemeButtons() {
  const current = document.documentElement.getAttribute('data-theme')
  document.querySelectorAll('[data-theme-set]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.themeSet === current))
  })
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-theme-set]')
  if (button) setTheme(button.dataset.themeSet)
})

syncThemeButtons()

/* Mark the current page in the navigation. <body data-nav="pricing"> */
const currentNav = document.body.dataset.nav
if (currentNav) {
  document.querySelectorAll(`[data-nav="${currentNav}"]`).forEach((link) => {
    link.setAttribute('aria-current', 'page')
  })
}

/* Mobile menu */
const menuButton = document.querySelector('.menu-button')
const mobileMenu = document.getElementById('mobile-menu')

function closeMenu() {
  if (!menuButton || !mobileMenu) return
  menuButton.setAttribute('aria-expanded', 'false')
  mobileMenu.hidden = true
}

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true'
    menuButton.setAttribute('aria-expanded', String(!open))
    mobileMenu.hidden = open
  })
  mobileMenu.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu()
  })
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu()
  })
  window.matchMedia('(min-width: 960px)').addEventListener('change', (event) => {
    if (event.matches) closeMenu()
  })
}

/* Pricing: monthly / yearly toggle.
   Each price element carries both values: <strong data-monthly="19" data-yearly="16"> */
const billingButtons = document.querySelectorAll('[data-billing]')

function setBilling(period) {
  billingButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.billing === period))
  })
  document.querySelectorAll('[data-monthly]').forEach((el) => {
    el.textContent = `$${el.dataset[period]}`
  })
  document.querySelectorAll('[data-price-note]').forEach((el) => {
    el.textContent = period === 'yearly' ? `Billed $${el.dataset.priceNote} yearly` : 'Billed monthly'
  })
}

billingButtons.forEach((button) => {
  button.addEventListener('click', () => setBilling(button.dataset.billing))
})

/* Contact form. There is no backend: to send messages, add a fetch() to your form service where contactForm.reset() is called below. */
const contactForm = document.querySelector('[data-contact-form]')

if (contactForm) {
  const success = document.querySelector('[data-form-success]')

  const showError = (input, message) => {
    const error = contactForm.querySelector(`[data-error-for="${input.name}"]`)
    input.setAttribute('aria-invalid', message ? 'true' : 'false')
    if (error) {
      error.textContent = message
      error.hidden = !message
    }
  }

  const validate = (input) => {
    if (input.validity.valueMissing) return 'This field is required.'
    if (input.validity.typeMismatch) return 'Enter a valid email address.'
    return ''
  }

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault()
    let firstInvalid = null
    contactForm.querySelectorAll('input, textarea, select').forEach((input) => {
      const message = validate(input)
      showError(input, message)
      if (message && !firstInvalid) firstInvalid = input
    })
    if (firstInvalid) {
      firstInvalid.focus()
      return
    }
    contactForm.reset()
    if (success) {
      success.hidden = false
      success.focus()
    }
  })

  contactForm.addEventListener('input', (event) => {
    if (event.target.getAttribute('aria-invalid') === 'true') {
      showError(event.target, validate(event.target))
    }
  })
}

/* Footer year */
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = String(new Date().getFullYear())
})

/* Blog: filter posts by topic. <button data-filter="metrics"> filters cards with data-topic="metrics". */
const postGrid = document.querySelector('[data-post-grid]')
if (postGrid) {
  const empty = document.querySelector('[data-post-empty]')
  const buttons = document.querySelectorAll('[data-filter]')
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const topic = button.dataset.filter
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)))
      let shown = 0
      postGrid.querySelectorAll('[data-topic]').forEach((card) => {
        const match = topic === 'all' || card.dataset.topic === topic
        card.hidden = !match
        if (match) shown++
      })
      if (empty) empty.hidden = shown > 0
    })
  })
}

/* Newsletter form. There is no backend: add a fetch() to your email service where the success message is shown. */
const newsletter = document.querySelector('[data-newsletter]')
if (newsletter) {
  const input = newsletter.querySelector('input[type="email"]')
  const error = newsletter.querySelector('[data-newsletter-error]')
  const success = newsletter.querySelector('[data-newsletter-success]')
  newsletter.addEventListener('submit', (event) => {
    event.preventDefault()
    const valid = input.value.trim() !== '' && input.validity.valid
    input.setAttribute('aria-invalid', String(!valid))
    error.hidden = valid
    if (!valid) {
      input.focus()
      return
    }
    newsletter.reset()
    success.hidden = false
  })
}

/* Help center search: filters article links as you type and highlights the match. */
const helpSearch = document.querySelector('[data-help-search]')
if (helpSearch) {
  const grid = document.querySelector('[data-help-grid]')
  const empty = document.querySelector('[data-help-empty]')
  const count = document.querySelector('[data-help-count]')
  const links = [...grid.querySelectorAll('a')]
  links.forEach((link) => {
    link.dataset.text = link.textContent
  })

  const highlight = (link, query) => {
    const text = link.dataset.text
    const index = query ? text.toLowerCase().indexOf(query) : -1
    link.textContent = ''
    if (index < 0) {
      link.textContent = text
      return
    }
    const mark = document.createElement('mark')
    mark.textContent = text.slice(index, index + query.length)
    link.append(text.slice(0, index), mark, text.slice(index + query.length))
  }

  const run = () => {
    const query = helpSearch.value.trim().toLowerCase()
    let shown = 0
    links.forEach((link) => {
      const match = !query || link.dataset.text.toLowerCase().includes(query)
      link.closest('li').hidden = !match
      highlight(link, match ? query : '')
      if (match) shown++
    })
    grid.querySelectorAll('.help-category').forEach((section) => {
      section.hidden = !section.querySelector('li:not([hidden])')
    })
    empty.hidden = shown > 0
    count.textContent = query ? `${shown} ${shown === 1 ? 'article' : 'articles'} found` : ''
  }

  helpSearch.addEventListener('input', run)
  document.querySelector('[data-help-form]')?.addEventListener('submit', (event) => event.preventDefault())
}

/* Blog post: copy the page link. */
document.querySelectorAll('[data-copy-link]').forEach((button) => {
  button.addEventListener('click', async () => {
    const label = button.querySelector('[data-copy-label]')
    try {
      await navigator.clipboard.writeText(location.href)
      label.textContent = 'Link copied'
    } catch {
      label.textContent = 'Copy failed'
    }
    setTimeout(() => {
      label.textContent = 'Copy link'
    }, 2000)
  })
})

/* Help article: "Was this helpful?" There is no backend: send the answer to your analytics here. */
document.querySelectorAll('[data-feedback]').forEach((box) => {
  box.querySelectorAll('[data-feedback-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      box.querySelector('.feedback-buttons').hidden = true
      box.querySelector('[data-feedback-thanks]').hidden = false
    })
  })
})
