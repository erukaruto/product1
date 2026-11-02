/** Accessible tabs: [data-tabs] wrapper with role="tablist", role="tab" (aria-controls) and role="tabpanel". */
export function initTabs(root = document) {
  root.querySelectorAll('[data-tabs]').forEach((wrap) => {
    const tabs = /** @type {HTMLButtonElement[]} */ ([...wrap.querySelectorAll('[role="tab"]')])
    /** @param {HTMLButtonElement} tab @param {boolean} [focus] */
    const select = (tab, focus = false) => {
      for (const t of tabs) {
        const on = t === tab
        t.setAttribute('aria-selected', String(on))
        t.tabIndex = on ? 0 : -1
        const panel = document.getElementById(t.getAttribute('aria-controls') || '')
        if (panel) panel.hidden = !on
      }
      if (focus) tab.focus()
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab))
      tab.addEventListener('keydown', (e) => {
        const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key]
        if (next === undefined) return
        e.preventDefault()
        select(tabs[(next + tabs.length) % tabs.length], true)
      })
    })
  })
}
