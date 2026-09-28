// one capture per plan step: the Services page head and section order, at 1440 and 390
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2], TAG = process.argv[3] || 'step'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)) })
  await p.setViewport({ width: w, height: h, deviceScaleFactor: w < 500 ? 2 : 1 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2000))
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 90)) } scrollTo(0, 0) }); await new Promise(r => setTimeout(r, 900))
  const m = await p.evaluate(() => {
    const secs = [...document.querySelectorAll('section, header.pg-head')].filter((e, i, a) => !a.some(o => o !== e && o.contains(e))).map(e => (e.id || e.className.split(' ').slice(0, 2).join('.')) + ':' + Math.round(e.getBoundingClientRect().height))
    return { h1s: document.querySelectorAll('h1').length, h1: document.querySelector('h1')?.innerText.replace(/\n/g, ' / '), emLines: document.querySelector('h1 em')?.getClientRects().length, secs, total: document.body.scrollHeight, overflow: document.documentElement.scrollWidth - innerWidth }
  })
  console.log(w, JSON.stringify(m), 'errors', errs.length, errs.slice(0, 2))
  const el = await p.$(process.argv[4] || '.cyb'); if (el) { await el.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 1400)); await el.screenshot({ path: `${OUT}/${TAG}-${w}.png` }) }
  await p.close()
}
await b.close()
