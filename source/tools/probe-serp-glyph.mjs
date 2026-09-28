import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 390, height: 900, isMobile: true, hasTouch: true, deviceScaleFactor: 3 })
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
await p.evaluate(() => document.querySelector('.cyc-band').scrollIntoView()); await new Promise(r => setTimeout(r, 4000))
const cases = [['a', {}], ['b', { fontSize: '19px' }], ['c', { letterSpacing: '0' }], ['d', { fontWeight: '500' }], ['e', { transform: 'none', willChange: 'auto' }], ['f', { display: 'inline-block' }]]
for (const [k, st] of cases) {
  await p.evaluate(st => { const n = document.querySelectorAll('.cyc-node')[3]; const bEl = n.querySelector('.cyc-txt b'); bEl.removeAttribute('style'); Object.assign(bEl.style, st); n.style.transform = st.transform || ''; n.style.willChange = st.willChange || '' }, st)
  await new Promise(r => setTimeout(r, 200))
  const el = await p.$('.cyc-node:nth-of-type(4) .cyc-txt, .cyc-canvas .cyc-node:nth-child(7) .cyc-txt') 
  const txt = (await p.$$('.cyc-node .cyc-txt'))[3]; await txt.screenshot({ path: `${OUT}/glyph-${k}.png` })
}
console.log(JSON.stringify(await p.evaluate(() => { const n = document.querySelectorAll('.cyc-node')[3]; const cs = getComputedStyle(n); return { transform: cs.transform, willChange: cs.willChange, opacity: cs.opacity, txtTransform: getComputedStyle(n.querySelector('.cyc-txt')).transform, play: document.querySelector('.cyc-canvas').className } })))
await b.close()
