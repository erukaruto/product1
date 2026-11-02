/*
  Tables that scroll sideways on small screens must be reachable by keyboard (WCAG 2.1.1).
  Any .table-wrap that overflows gets tabindex="0", role="region" and a label from its caption.
*/
function mark() {
  document.querySelectorAll('.table-wrap').forEach((node) => {
    const wrap = /** @type {HTMLElement} */ (node)
    const scrolls = wrap.scrollWidth > wrap.clientWidth + 1
    if (scrolls && !wrap.hasAttribute('tabindex')) {
      const caption = wrap.querySelector('caption')?.textContent?.trim()
      wrap.setAttribute('tabindex', '0')
      wrap.setAttribute('role', 'region')
      wrap.setAttribute('aria-label', caption ? `Tabel: ${caption} (geser ke samping)` : 'Tabel (geser ke samping)')
      wrap.dataset.scrollRegion = 'auto'
    } else if (!scrolls && wrap.dataset.scrollRegion === 'auto') {
      wrap.removeAttribute('tabindex')
      wrap.removeAttribute('role')
      wrap.removeAttribute('aria-label')
      delete wrap.dataset.scrollRegion
    }
  })
}

export function watchScrollRegions() {
  let queued = false
  const schedule = () => {
    if (queued) return
    queued = true
    requestAnimationFrame(() => { queued = false; mark() })
  }
  schedule()
  window.addEventListener('resize', schedule)
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] })
}
