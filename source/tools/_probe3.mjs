import puppeteer from 'puppeteer-core'
const SP = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
const shot = async (route, sel, name, pre) => {
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 950, deviceScaleFactor: 1.5 })
  await p.goto('http://localhost:5177' + route, { waitUntil: 'networkidle0', timeout: 90000 })
  await new Promise(r => setTimeout(r, 2400))
  if (pre) await pre(p)
  const el = await p.$(sel)
  if (!el) { console.log(name, 'MISSING', sel); await p.close(); return }
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 900))
  await el.screenshot({ path: `${SP}/${name}.png` })
  console.log(name, 'ok')
  await p.close()
}
await shot('/services?noanim', '.cring, [class*="cring"]', 'v-ring')
await shot('/about', 'main, body', 'v-about', async p => { await p.evaluate(() => { const h = [...document.querySelectorAll('h2,h3')].find(x => /vision|mission/i.test(x.textContent)); if (h) h.closest('section')?.scrollIntoView({ block: 'center' }) }) })
await shot('/', '.close3d, [class*="closing"]', 'v-band', async p => { await p.evaluate(() => scrollTo(0, document.body.scrollHeight)); await new Promise(r => setTimeout(r, 1800)) })
await shot('/contact', '.cx-form', 'v-form')
await b.close()
