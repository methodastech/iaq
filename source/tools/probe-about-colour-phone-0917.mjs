import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, h] of [[390, 844], [768, 1024]]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: w < 768, hasTouch: w < 768 })
  await p.goto('http://localhost:5177/about', { waitUntil: 'networkidle2', timeout: 60000 }); await new Promise(r => setTimeout(r, 1800))
  const y = await p.evaluate(() => document.querySelector('#story').getBoundingClientRect().top + scrollY - 40)
  await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 1400))
  const m = await p.evaluate(() => { const s = document.querySelector('#story').getBoundingClientRect(); const d = document.querySelector('#story .mdesc').getBoundingClientRect(); return { band: Math.round(s.height), textBottomPct: Math.round((d.bottom - s.top) / s.height * 100), overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth } })
  console.log(w, JSON.stringify(m))
  await p.screenshot({ path: `${OUT}/story-${w}.png`, captureBeyondViewport: false }); await p.close()
}
await b.close()
