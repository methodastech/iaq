import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/careers', { waitUntil: 'networkidle2' })
for (const t of [1000, 4000]) {
  await new Promise(r => setTimeout(r, t))
  console.log(t, JSON.stringify(await p.evaluate(() => ['.head .eyebrow', '.head h1', '.head .lede', '.cr-culture', '.head-stats'].map(sel => { const e = document.querySelector(sel); if (!e) return [sel, 'missing']; const c = getComputedStyle(e); const r = e.getBoundingClientRect(); return [sel, c.opacity, c.visibility, c.color, Math.round(r.top), Math.round(r.height), e.className] }))))
}
await b.close()
