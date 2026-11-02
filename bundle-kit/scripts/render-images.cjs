/*
  Renders the Gumroad images from bundle-kit/images/src/*.html to PNG at exact sizes.
  Run: node bundle-kit/scripts/render-images.cjs
*/
const { chromium } = require('playwright')
const path = require('node:path')

const SRC = path.join(__dirname, '..', 'images', 'src')
const OUT = path.join(__dirname, '..', 'images')
const IMAGES = [
  ['cover.html', 'cover-1280x720.png', 1280, 720],
  ['thumbnail.html', 'thumbnail-600x600.png', 600, 600],
  ['gallery-1-same-look.html', 'gallery-1-same-look-1280x720.png', 1280, 720],
  ['gallery-2-whats-inside.html', 'gallery-2-whats-inside-1280x720.png', 1280, 720],
  ['gallery-3-themes.html', 'gallery-3-themes-1280x720.png', 1280, 720],
  ['gallery-4-mobile.html', 'gallery-4-mobile-1280x720.png', 1280, 720],
  ['gallery-5-screens.html', 'gallery-5-screens-1280x720.png', 1280, 720],
]

;(async () => {
  const browser = await chromium.launch()
  for (const [file, out, width, height] of IMAGES) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
    await page.goto('file://' + path.join(SRC, file))
    await page.evaluate(() => document.fonts.ready)
    const fontOk = await page.evaluate(() => document.fonts.check('600 40px "DM Sans"'))
    const broken = await page.evaluate(() => [...document.images].filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src))
    await page.screenshot({ path: path.join(OUT, out) })
    console.log(`${out}: ${width}x${height}, DM Sans loaded: ${fontOk}, broken images: ${broken.length}`)
    await page.close()
  }
  await browser.close()
})()
