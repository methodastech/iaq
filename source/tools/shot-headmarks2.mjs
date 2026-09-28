import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 })
for (const [path, sel, name, reveal] of [['/services', '.sm-faq .pg-in', 'faqhead-now', '[data-reveal]'], ['/careers', '.cu-grow .cu-w', 'growhead-now', '.cu-rv']]) {
  await p.goto('http://localhost:5177' + path, { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate((sel, reveal) => { document.querySelectorAll(reveal).forEach(e => { e.classList.add('in'); e.classList.add('cu-in') }); document.querySelector(sel).scrollIntoView({ block: 'start' }) }, sel, reveal); await new Promise(r => setTimeout(r, 1000))
  const r = await p.evaluate(sel => { const e = document.querySelector(sel).getBoundingClientRect(); return { x: e.left, y: e.top + window.scrollY, w: e.width } }, sel)
  await p.screenshot({ path: `${OUT}/${name}.png`, clip: { x: Math.max(0, r.x - 30), y: r.y - 20, width: Math.min(1440, r.w + 60), height: 330 } })
}
await b.close()
