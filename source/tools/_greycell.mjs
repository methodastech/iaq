/* is there an empty grid cell showing the rule colour? sample the grid area not covered by a card */
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
for (const w of [390, 1440]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 950 })
  await p.goto('http://localhost:5177/policies?noanim', { waitUntil: 'networkidle2', timeout: 60000 })
  await p.evaluate(() => new Promise(res => { let y = 0; const t = setInterval(() => { scrollTo(0, y += 1400); if (y > document.body.scrollHeight) { clearInterval(t); scrollTo(0, 0); res() } }, 50) }))
  await new Promise(r => setTimeout(r, 900))
  console.log(w, JSON.stringify(await p.evaluate(() => {
    const g = document.querySelector('.gcerts'); const gr = g.getBoundingClientRect()
    const cards = [...g.querySelectorAll('.gcert')].map(c => c.getBoundingClientRect())
    const area = cards.reduce((a, r) => a + r.width * r.height, 0)
    const cover = area / (gr.width * gr.height)
    return { cards: cards.length, coverage: +(cover * 100).toFixed(1), gridH: Math.round(gr.height) }
  })))
  await p.close()
}
await b.close()
