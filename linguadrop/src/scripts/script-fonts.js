/*
  Noto Sans faces for Japanese, Korean, Chinese and Arabic are large, so their CSS is loaded
  only when an element with that lang attribute is on the page (also after JS renders content).
  Always mark foreign text with lang="ja" / "ko" / "zh-Hans" / "ar" (plus dir="rtl" for Arabic).
*/
/** @type {Record<string, () => Promise<unknown>>} */
const LOADERS = {
  ja: () => import('@fontsource-variable/noto-sans-jp'),
  ko: () => import('@fontsource-variable/noto-sans-kr'),
  zh: () => import('@fontsource-variable/noto-sans-sc'),
  ar: () => import('@fontsource-variable/noto-sans-arabic'),
}
const loaded = new Set()

function scan() {
  for (const lang of Object.keys(LOADERS)) {
    if (loaded.has(lang)) continue
    if (document.querySelector(`[lang|="${lang}"]`)) {
      loaded.add(lang)
      void LOADERS[lang]()
    }
  }
}

export function watchScriptFonts() {
  scan()
  let queued = false
  new MutationObserver(() => {
    if (queued || loaded.size === Object.keys(LOADERS).length) return
    queued = true
    requestAnimationFrame(() => { queued = false; scan() })
  }).observe(document.body, { childList: true, subtree: true })
}
