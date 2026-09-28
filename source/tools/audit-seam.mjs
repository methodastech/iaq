/* The fab-to-industries seam and the six values, looked at rather than computed.
   Usage: node tools/audit-seam.mjs <base> <outDir> */
import puppeteer from 'puppeteer-core'
const [BASE, OUT] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const wait = ms => new Promise(r => setTimeout(r, ms))

await p.goto(BASE + '/', { waitUntil: 'networkidle0', timeout: 90000 })
await p.evaluate(() => { const l = document.getElementById('loader'); if (l && window.__iaqLoaderDismiss) window.__iaqLoaderDismiss() })
await wait(1200)

const geo = await p.evaluate(() => {
  const fab = document.getElementById('fab') || document.querySelector('.fab')
  if (!fab) return null
  const r = fab.getBoundingClientRect()
  const next = fab.nextElementSibling
  return { top: r.top + scrollY, height: r.height, bottom: r.top + scrollY + r.height, next: next ? (next.id || next.className).toString().slice(0, 60) : null, docH: document.body.scrollHeight }
})
console.log('fab geometry', JSON.stringify(geo))

/* the seam is the last screen of the fab band: land there, let the scrub settle, then look */
const seamY = Math.round(geo.bottom - 900)
await p.evaluate(y => window.scrollTo(0, y), seamY); await wait(2500)
await p.evaluate(y => window.scrollTo(0, y), seamY); await wait(1500)
const seam = await p.evaluate(() => {
  const fab = document.getElementById('fab') || document.querySelector('.fab')
  const r = fab.getBoundingClientRect()
  const cs = getComputedStyle(fab)
  const probe = (x, y) => { const e = document.elementFromPoint(x, y); return e ? (e.id || e.className || e.tagName).toString().slice(0, 40) : null }
  return { scrollY: Math.round(scrollY), fabBottomOnScreen: Math.round(r.bottom), background: cs.backgroundImage.slice(0, 90), at200: probe(720, 200), at700: probe(720, 700), at880: probe(720, 880) }
})
console.log('seam state', JSON.stringify(seam))
await p.screenshot({ path: `${OUT}/40-fab-seam.png` })

/* one screen further on: the industries band that the fab fades into */
await p.evaluate(y => window.scrollTo(0, y), Math.round(geo.bottom - 200)); await wait(1800)
await p.screenshot({ path: `${OUT}/41-fab-into-industries.png` })

/* the six values, on About */
await p.goto(BASE + '/about', { waitUntil: 'networkidle0', timeout: 90000 }); await wait(1200)
const vals = await p.evaluate(() => {
  const sec = document.getElementById('values'); if (!sec) return null
  sec.scrollIntoView({ block: 'center' })
  const cards = [...sec.querySelectorAll('[class*=card], .vr-card, li, article')].filter(e => e.querySelector('img, svg'))
  const imgs = [...sec.querySelectorAll('img')].map(i => i.getAttribute('src'))
  const marks = [...sec.querySelectorAll('svg')].map(s => s.getAttribute('data-icon') || s.className.baseVal || s.querySelector('use')?.getAttribute('href') || 'svg')
  return { heading: sec.querySelector('h2')?.textContent, deadDia: sec.querySelectorAll('.vg-dia').length, cards: cards.length, images: imgs, uniqueImages: [...new Set(imgs)].length, marks, uniqueMarks: [...new Set(marks)].length }
})
console.log('values', JSON.stringify(vals, null, 1))
await wait(1500); await p.screenshot({ path: `${OUT}/42-values.png` })
await b.close()
