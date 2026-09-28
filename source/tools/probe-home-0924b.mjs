// 24 Sep evening: baseline measures and captures of the home sections Bazil flagged
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2500))
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)) } scrollTo(0, 0) })
await new Promise(r => setTimeout(r, 800))
const m = await p.evaluate(() => {
  const R = s => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return { top: Math.round(q.top + scrollY), bottom: Math.round(q.bottom + scrollY), h: Math.round(q.height), w: Math.round(q.width) } }
  const em = document.querySelector('.hero h1 em'); const emLines = em ? em.getClientRects().length : 0
  return { h1: document.querySelector('.hero h1')?.innerText.replace(/\n/g, ' / '), emLines, gr: R('.glance.gr'), grBody: R('.gr .glance-body'), grStats: R('.gr .gstats'), globe: R('.gr .globe-host'), grH2: document.querySelector('.gr h2')?.innerText, cbGo: R('.cb-go'), cbLine: R('.cb-line'), cbCta: R('.cb-cta'), fk: R('.cb-nav .f-cols'), ledger: R('.cb-right .cb-ledger'), soc: R('.f-social a') }
})
console.log(JSON.stringify(m, null, 1)); console.log('errors', errs.length, errs.slice(0, 2))
for (const [sel, name] of [['.hero', 'hero'], ['.glance.gr', 'record'], ['.cring-stage', 'ring'], ['.faq', 'faq'], ['.cb-in', 'closing']]) {
  const el = await p.$(sel); if (!el) { console.log('no', sel); continue }
  await el.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 900))
  await el.screenshot({ path: `${OUT}/b-${name}.png` })
}
await b.close()
