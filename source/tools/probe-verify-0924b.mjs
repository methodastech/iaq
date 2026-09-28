// verification captures for this pass: hero, record, closing band, FAQ head; measures at 1280
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)))
await p.setViewport({ width: 1280, height: 860, deviceScaleFactor: 1 })
await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2500))
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 800) { scrollTo(0, y); await new Promise(r => setTimeout(r, 90)) } scrollTo(0, 0) }); await new Promise(r => setTimeout(r, 600))
const m = await p.evaluate(() => {
  const T = e => e ? Math.round(e.getBoundingClientRect().top + scrollY) : null
  const cta = document.querySelector('.cb-cta'), line = document.querySelector('.cb-line'), gr = document.querySelector('.glance.gr')
  return { h1: document.querySelector('.hero h1')?.innerText.replace(/\n/g, ' / '), emLines: document.querySelector('.hero h1 em')?.getClientRects().length,
    grH2: document.querySelector('.gr h2')?.innerText, grBg: getComputedStyle(gr).backgroundImage.slice(0, 60), grH: Math.round(gr.getBoundingClientRect().height),
    lineBeside: Math.abs(T(cta) - T(line)) < 30, companyLabel: T(document.querySelector('.cb-nav .f-h4')), emailLabel: T(document.querySelector('.cb-right .cb-ledger .crow .ref')),
    linkedinBorder: getComputedStyle(document.querySelector('.f-nav .f-social a')).borderTopWidth, linkedinPad: getComputedStyle(document.querySelector('.f-nav .f-social a')).paddingLeft }
})
console.log(JSON.stringify(m)); console.log('errors', errs.length, errs.slice(0, 2))
for (const [sel, name] of [['.hero', 'hero'], ['.glance.gr', 'record'], ['.cb-in', 'closing']]) {
  const el = await p.$(sel); await el.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 900)); await el.screenshot({ path: `${OUT}/v-${name}.png` })
}
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1500))
const f = await p.$('.sm-faq-head'); if (f) { await f.evaluate(e => e.scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 900)); await f.screenshot({ path: `${OUT}/v-faq.png` }) } else console.log('no faq head')
await b.close()
