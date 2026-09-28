import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 140))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)) })
const out = {}
for (const [u, n] of [['/services/epc-construction', 'epc'], ['/services/tool-installation', 'hookup']]) {
  await p.goto('http://localhost:5177' + u, { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 2000))
  out[n] = { heads: await p.evaluate(() => [...document.querySelectorAll('main h2, #root h2')].map(h => h.textContent.replace(/\s+/g, ' ').trim()).slice(0, 10)) }
  const cy = await p.evaluate(() => document.querySelector('.un-cycle').getBoundingClientRect().top + scrollY - 60)
  await p.evaluate(y => window.scrollTo(0, y), cy); await new Promise(r => setTimeout(r, 1500)); await p.screenshot({ path: `${OUT}/cyc-${n}-0.png`, captureBeyondViewport: false })
  await p.evaluate(y => window.scrollTo(0, y), cy + 700); await new Promise(r => setTimeout(r, 1500)); await p.screenshot({ path: `${OUT}/cyc-${n}-1.png`, captureBeyondViewport: false })
  out[n].active = await p.evaluate(() => ({ on: document.querySelector('.un-step.on')?.dataset.i, art: document.querySelector('[data-active]')?.dataset.active }))
  const by = await p.evaluate(() => document.querySelector('.un-build, .un-bim')?.getBoundingClientRect().top + scrollY)
  for (const [f, k] of [[0.05, 'a'], [0.5, 'b'], [0.95, 'c']]) {
    const H = await p.evaluate(() => document.querySelector('.un-build')?.getBoundingClientRect().height || 0)
    await p.evaluate(y => window.scrollTo(0, y), by + (H - 900) * f); await new Promise(r => setTimeout(r, 2500))
    out[n]['frame' + k] = await p.evaluate(() => { const c = document.querySelector('.un-build canvas'); return c && [c.dataset.frame, c.dataset.p] })
    await p.screenshot({ path: `${OUT}/build-${n}-${k}.png`, captureBeyondViewport: false })
  }
}
await p.goto('http://localhost:5177/services/process-critical-utilities', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1800))
const cy = await p.evaluate(() => document.querySelector('.un-cycle').getBoundingClientRect().top + scrollY - 60)
await p.evaluate(y => window.scrollTo(0, y), cy + 300); await new Promise(r => setTimeout(r, 1500)); await p.screenshot({ path: `${OUT}/cyc-pcu.png`, captureBeyondViewport: false })
console.log(JSON.stringify({ out, errs }))
await b.close()
