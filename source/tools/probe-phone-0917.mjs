import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
const out = []
for (const [u, sel, n] of [['/policies', '.gcerts', 'policies'], ['/about/commitment', '.awardrow', 'commitment'], ['/careers/culture', 'img[src*="mciea-2024-stage"]', 'culture'], ['/contact', 'img[src*="hq-front"]', 'contact'], ['/services', '.un-card img, .un-cards img', 'hub'], ['/markets/semiconductor', 'img[src*="mkt-semiconductor"]', 'semi'], ['/services/epc-construction', '.un-hero-fig', 'epc']]) {
  const errs = []; const h = e => errs.push(String(e).slice(0, 80)); p.on('pageerror', h)
  await p.goto('http://localhost:5177' + u, { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1800))
  const y = await p.evaluate(sel => { const e = document.querySelector(sel); return e ? e.getBoundingClientRect().top + scrollY - 90 : 0 }, sel)
  await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 1500))
  const info = await p.evaluate(() => ({ ovf: document.documentElement.scrollWidth > innerWidth, sw: document.documentElement.scrollWidth }))
  await p.screenshot({ path: `${OUT}/ph390-${n}.png`, captureBeyondViewport: false })
  out.push([n, info.ovf ? 'OVERFLOW ' + info.sw : 'ok', errs.join('|')]); p.off('pageerror', h)
}
console.log(JSON.stringify(out))
await b.close()
