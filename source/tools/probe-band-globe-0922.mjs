/* 22 Sep, late: the re-laid closing band (brand, ledger, links left; the ask right), its lighter navy, and the globe
   (moving, seven chips only). Usage: node tools/probe-band-globe-0922.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 200000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 150)))
const band = () => p.evaluate(() => { const q = s => document.querySelector(s), R = s => { const e = q(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top + scrollY)] }
  return { bg: getComputedStyle(q('.close3d')).backgroundColor, brand: R('.cb-left .cb-brand') || R('.close-in .f-brand'), ask: R('.cb-ask'), ledger: R('.cb-ledger'), cols: R('.cb .f-cols'), marks: document.querySelectorAll('.cb .f-mark').length, overflow: document.documentElement.scrollWidth - innerWidth } })
for (const [path, w] of [['/?footer=a', 1440], ['/about', 1440], ['/careers', 1440], ['/', 390]]) {
  await p.setViewport({ width: w, height: 900 }); await p.goto('http://localhost:5177' + path, { waitUntil: 'domcontentloaded' }); await wait(3000)
  console.log(path, w, JSON.stringify(await band()))
  if (path === '/?footer=a' || w === 390) { const y = await p.evaluate(() => document.querySelector('.close3d').getBoundingClientRect().top + scrollY - 40); await p.evaluate(y => window.scrollTo(0, y), y); await wait(1500); await p.screenshot({ path: `${OUT}/band-${w}.jpg`, type: 'jpeg', quality: 80 }); await p.evaluate(() => window.scrollBy(0, 700)); await wait(1200); await p.screenshot({ path: `${OUT}/band-${w}-2.jpg`, type: 'jpeg', quality: 80 }) }
}
/* the globe: seven chips, and moving */
await p.setViewport({ width: 1440, height: 900 }); await p.goto('http://localhost:5177/', { waitUntil: 'domcontentloaded' }); await wait(2500)
const gy = await p.evaluate(() => document.querySelector('#globeHost').getBoundingClientRect().top + scrollY - 120)
for (let i = 1; i <= 8; i++) { await p.mouse.wheel({ deltaY: gy / 8 }); await wait(110) }
await wait(2500)
const g1 = await p.evaluate(() => ({ tags: document.querySelectorAll('.globe-tag').length, ...window.__globeQA() })); await wait(2500)
const g2 = await p.evaluate(() => window.__globeQA())
console.log('globe', JSON.stringify({ tags: g1.tags, raf: g1.raf, ryFrom: g1.ry, ryTo: g2.ry, moved: g1.ry !== g2.ry }))
console.log('errs', JSON.stringify(errs))
await b.close()
