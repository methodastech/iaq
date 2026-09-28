import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const p = await b.newPage(); const wait = ms => new Promise(r => setTimeout(r, ms))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
const res = []
for (const r of ['/services/epc-construction', '/services/energy-management']) {
  await p.goto('http://localhost:52158' + r, { waitUntil: 'networkidle0', timeout: 90000 }); await wait(2000)
  const t = await p.evaluate(() => document.querySelector('.un-cycle').getBoundingClientRect().top + scrollY)
  await p.evaluate(y => scrollTo(0, y - 30), t); await wait(1600)
  const steps = await p.$$('.un-step-h'); if (steps[2]) { await steps[2].click(); await wait(700) }
  const m = await p.evaluate(() => { const g = (s, k) => { const e = document.querySelector(s); return e ? getComputedStyle(e)[k] : null }; return { chip: g('.un-art .un-st.is-on .un-chip', 'fill'), wire: g('.un-art .un-tostage.is-on', 'stroke'), stepN: g('.un-step.on .un-step-n', 'color'), h2em: g('.un-cycle .un-h2 em', 'color'), whatEm: g('.un-what .un-h2 em', 'color'), modelN: g('.un-model-n', 'color') } })
  res.push([r, m])
  if (r === '/services/epc-construction') await p.screenshot({ path: `${process.argv[2]}/unit-epc-cycle.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } })
}
console.log(JSON.stringify(res))
await b.close()
