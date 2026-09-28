/* 15 Sep: section captures for the Careers wing, the promo bands, the value marks and the office cards. */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]; const BASE = 'http://localhost:5177'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const errs = []
async function shot(url, sel, name, w = 1440, h = 900, mobile = false) {
  const p = await b.newPage(); p.on('pageerror', e => errs.push(name + ': ' + String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(name + ': ' + m.text().slice(0, 160)) })
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile })
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await p.goto(BASE + url, { waitUntil: 'networkidle0', timeout: 40000 })
  await p.evaluate(() => { document.querySelectorAll('[data-reveal],.cu-rv').forEach(e => { e.classList.add('in', 'cu-in', 'is-in'); e.style.opacity = '1'; e.style.transform = 'none' }) })
  const el = await p.$(sel); if (!el) { errs.push(name + ': selector missing ' + sel); await p.close(); return }
  await el.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 900))
  await el.screenshot({ path: `${OUT}/${name}.png` }); console.log('saved', name); await p.close()
}
await shot('/careers/culture', '.cu-values', 'values')
await shot('/careers/culture', '.cu-places', 'places')
await shot('/careers/culture', '.cpr-roles', 'culture-band')
await shot('/careers', '.cpr-life', 'careers-band')
await shot('/careers/culture', '.cpr-roles', 'culture-band-m', 390, 844, true)
await shot('/careers', '.cpr-life', 'careers-band-m', 390, 844, true)
await shot('/careers/culture', '.cu-places', 'places-m', 390, 844, true)
/* the wing: hover Careers, capture the top of the page */
{ const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]); await p.goto(BASE + '/careers/culture', { waitUntil: 'networkidle0' })
  const a = await p.$('.nav-links .nav-has:last-of-type > a'); await a.hover(); await new Promise(r => setTimeout(r, 2200))
  await p.screenshot({ path: `${OUT}/wing.png`, clip: { x: 0, y: 0, width: 1440, height: 560 } }); console.log('saved wing'); await p.close() }
console.log('errors', errs.length ? errs : 'none'); await b.close()
