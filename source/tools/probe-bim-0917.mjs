import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const out = {}
for (const [u, n] of [['/services/tool-installation', 'hookup'], ['/services/epc-construction', 'epc'], ['/services/energy-management', 'energy'], ['/services/process-critical-utilities', 'pcu']]) {
  await p.goto('http://localhost:5177' + u, { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1500))
  const y = await p.evaluate(() => document.querySelector('.un-bim').getBoundingClientRect().top + scrollY - 40)
  await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 1600))
  out[n] = await p.evaluate(() => { const i = document.querySelector('.un-bim-fig img'); const r = i.getBoundingClientRect(); return [i.getAttribute('src'), i.naturalWidth + 'x' + i.naturalHeight, Math.round(r.width) + 'x' + Math.round(r.height)] })
  await p.screenshot({ path: `${OUT}/bim-${n}.png`, captureBeyondViewport: false })
}
await p.setViewport({ width: 390, height: 844 }); await p.goto('http://localhost:5177/services/tool-installation', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1500))
const y = await p.evaluate(() => document.querySelector('.un-bim').getBoundingClientRect().top + scrollY - 20); await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 1500))
out.hookup390 = await p.evaluate(() => { const r = document.querySelector('.un-bim-fig img').getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height) + ' overflow:' + (document.documentElement.scrollWidth > innerWidth) })
await p.screenshot({ path: `${OUT}/bim-hookup-390.png`, captureBeyondViewport: false })
console.log(JSON.stringify(out))
await b.close()
