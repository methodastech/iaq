/* 15 Sep: the six value scenes, captured as a filmstrip (live animation sampled at set times) plus the still. */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const errs = []
const p = await b.newPage(); p.on('pageerror', e => errs.push(String(e).slice(0, 200))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/careers/culture', { waitUntil: 'networkidle0', timeout: 40000 })
await p.evaluate(() => { document.querySelectorAll('.cu-rv').forEach(e => { e.classList.add('cu-in', 'in', 'is-in'); e.style.opacity = '1'; e.style.transform = 'none' }) })
const grid = await p.$('.cu-vgrid'); await grid.evaluate(e => e.scrollIntoView({ block: 'center' }))
await new Promise(r => setTimeout(r, 600))
const live = await p.$$eval('.vm', els => els.map(e => e.className))
console.log('classes', live)
/* pause every animation, then seek all of them to the same fraction of their own cycle */
async function seek(frac) {
  await p.evaluate(fr => {
    for (const a of document.getAnimations()) {
      const el = a.effect && a.effect.target; if (!el || !el.closest || !el.closest('.vm')) continue
      const dur = a.effect.getTiming().duration; a.pause(); a.currentTime = dur * fr
    }
  }, frac)
  await new Promise(r => setTimeout(r, 120))
}
for (const fr of [0.06, 0.2, 0.4, 0.6, 0.8]) {
  await seek(fr)
  await grid.screenshot({ path: `${OUT}/grid-${String(Math.round(fr * 100)).padStart(2, '0')}.png` })
}
const n = await p.evaluate(() => document.getAnimations().filter(a => a.effect?.target?.closest?.('.vm')).length)
console.log('vm animations', n)
/* the still: reduced motion */
const q = await b.newPage(); await q.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 }); await q.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
await q.goto('http://localhost:5177/careers/culture', { waitUntil: 'networkidle0' })
await q.evaluate(() => { document.querySelectorAll('.cu-rv').forEach(e => { e.classList.add('cu-in', 'in', 'is-in'); e.style.opacity = '1'; e.style.transform = 'none' }) })
const g2 = await q.$('.cu-vgrid'); await g2.evaluate(e => e.scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 500))
await g2.screenshot({ path: `${OUT}/still.png` })
console.log('still live classes', await q.$$eval('.vm.is-live', e => e.length))
/* phone */
const m = await b.newPage(); await m.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await m.goto('http://localhost:5177/careers/culture', { waitUntil: 'networkidle0' })
await m.evaluate(() => { document.querySelectorAll('.cu-rv').forEach(e => { e.classList.add('cu-in', 'in', 'is-in'); e.style.opacity = '1'; e.style.transform = 'none' }) })
const card = await m.$('.cu-vc'); await card.evaluate(e => e.scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 700))
await card.screenshot({ path: `${OUT}/phone-card.png` })
console.log('phone overflow', await m.evaluate(() => document.documentElement.scrollWidth > innerWidth))
console.log('errors', errs.length ? errs : 'none')
await b.close()
