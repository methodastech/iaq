import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--disable-gpu'] })
const p = await b.newPage()
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 })
const out = process.argv[2]; const res = []
for (const slug of ['ev-battery', 'semiconductor', 'district-cooling']) {
  await p.goto(`http://localhost:52158/markets/${slug}`, { waitUntil: 'networkidle0', timeout: 60000 })
  await new Promise(r => setTimeout(r, 2400))
  const m = await p.evaluate(() => ({ clipped: [...document.querySelectorAll('.mk-fact .v small')].filter(e => e.scrollHeight > e.clientHeight + 1).length, docW: document.documentElement.scrollWidth, facts: [...document.querySelectorAll('.mk-fact')].map(e => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right)] }) }))
  res.push([slug, m])
  if (slug === 'ev-battery') { const t = await p.evaluate(() => document.querySelector('.mk-facts-w').getBoundingClientRect().top + scrollY); await p.evaluate(t => scrollTo(0, t - 200), t); await new Promise(r => setTimeout(r, 700)); await p.screenshot({ path: `${out}/hero-ev-battery-390-facts.png` }) }
}
console.log(JSON.stringify(res))
await b.close()
