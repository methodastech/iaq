/* 15 Sep: are the Culture office cards level? Per visual row, the top of the photo, city heading, clock row,
   clock and caption must match within 1px. Usage: node tools/probe-culture-level-0915.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const res = {}
for (const w of [1440, 1100, 390]) {
  const p = await b.newPage(); const m = w < 768
  await p.setViewport({ width: w, height: 900, deviceScaleFactor: 1, isMobile: m, hasTouch: m })
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await p.goto('http://localhost:5177/careers/culture', { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(async () => {
    document.querySelectorAll('.cu-rv').forEach(e => { e.classList.add('cu-in'); e.style.opacity = '1'; e.style.transform = 'none' })
    const imgs = [...document.querySelectorAll('.cu-places img')]
    imgs.forEach(i => { i.loading = 'eager' })
    await Promise.all(imgs.map(i => (i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 8000) }))))
  })
  const el = await p.$('.cu-places')
  await el.evaluate(e => e.scrollIntoView({ block: 'start' }))
  await new Promise(r => setTimeout(r, 900))
  res[w] = await p.evaluate(() => {
    const rows = {}
    document.querySelectorAll('.cu-pc').forEach(c => {
      const t = s => { const n = c.querySelector(s); return n ? n.getBoundingClientRect().top : NaN }
      const key = Math.round(c.getBoundingClientRect().top)
      ;(rows[key] ||= []).push({ city: c.querySelector('h3').textContent, pic: t('.cu-pc-pic'), h3: t('h3'), foot: t('.cu-pc-foot'), clock: t('.cu-clock'), cap: t('.cu-pc-cap'), bottom: c.getBoundingClientRect().bottom })
    })
    const spread = (r, k) => Math.round((Math.max(...r.map(x => x[k])) - Math.min(...r.map(x => x[k]))) * 100) / 100
    return Object.values(rows).map(r => ({ cards: r.map(x => x.city).join(', '), ...Object.fromEntries(['pic', 'h3', 'foot', 'clock', 'cap', 'bottom'].map(k => [k, spread(r, k)])) }))
  })
  await el.screenshot({ path: `${OUT}/level-places-${w}.png` })
  await p.close()
}
let worst = 0
for (const [w, rows] of Object.entries(res)) for (const r of rows) {
  const max = Math.max(r.pic, r.h3, r.foot, r.clock, r.cap, r.bottom); worst = Math.max(worst, max)
  console.log(w, JSON.stringify(r))
}
console.log('worst spread px', worst, worst <= 1 ? 'LEVEL' : 'NOT LEVEL')
await b.close()
