/* 15 Sep: capture every top-level section of a page separately, reveals forced, for a design review.
   Usage: node tools/probe-sections.mjs <route> <outDir> [width] */
import puppeteer from 'puppeteer-core'
const [route, OUT, W = '1440'] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 150)))
await p.setViewport({ width: +W, height: 900, deviceScaleFactor: 1 })
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
await p.goto('http://localhost:5177' + route, { waitUntil: 'networkidle0', timeout: 40000 })
/* scroll through so lazy images load, then force reveals */
const H = await p.evaluate(() => document.documentElement.scrollHeight)
for (let y = 0; y < H; y += 700) { await p.evaluate(yy => window.scrollTo(0, yy), y); await new Promise(r => setTimeout(r, 120)) }
await p.evaluate(() => { window.scrollTo(0, 0); document.querySelectorAll('.cu-rv,[data-reveal]').forEach(e => { e.classList.add('cu-in', 'in', 'is-in'); e.style.opacity = '1'; e.style.transform = 'none' }) })
await new Promise(r => setTimeout(r, 800))
const secs = await p.$$('main > header, main > section, main > div > header, main > div > section, body #root > div > header, body #root > div > section, section.cpr, section.close3d')
let n = 0; const seen = new Set()
for (const s of secs) {
  const key = await s.evaluate(e => e.className + '|' + (e.id || '') + '|' + Math.round(e.getBoundingClientRect().top + scrollY))
  if (seen.has(key)) continue; seen.add(key)
  const box = await s.boundingBox(); if (!box || box.height < 60) continue
  const name = String(++n).padStart(2, '0') + '-' + (await s.evaluate(e => (e.className || e.tagName).toString().split(' ')[0] + (e.id ? '-' + e.id : ''))).replace(/[^a-z0-9-]/gi, '')
  await s.screenshot({ path: `${OUT}/${name}.png` }); console.log(name, Math.round(box.height) + 'px')
}
console.log('sections', n, 'errors', errs.length); await b.close()
